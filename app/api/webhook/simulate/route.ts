// app/api/webhook/simulate/route.ts
// Simulates incoming Instagram events for local development and testing.
//
// Because Meta app review isn't complete yet, this endpoint lets you run
// fake comments and DMs through the full agent pipeline and see the response.
//
// Used by the /dashboard/test-agent UI page.
// Requires an authenticated session (protected).

import { NextRequest } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import { processComment, processDM } from "@/lib/agent";

export async function POST(request: NextRequest) {
  // Auth check — must be a logged-in user
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Get the user's brand account
  const { data: account } = await admin
    .from("brand_accounts")
    .select("id, instagram_user_id, instagram_handle")
    .eq("user_id", user.id)
    .single();

  if (!account) {
    return Response.json(
      { error: "No Instagram account connected. Complete onboarding first." },
      { status: 404 }
    );
  }

  let body: { type?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, text } = body;

  if (!type || !text || typeof text !== "string" || text.trim() === "") {
    return Response.json(
      { error: "type and text are required" },
      { status: 400 }
    );
  }

  if (!["comment", "dm"].includes(type)) {
    return Response.json(
      { error: "type must be 'comment' or 'dm'" },
      { status: 400 }
    );
  }

  let interactionId: string | null = null;

  try {
    if (type === "comment") {
      interactionId = await processComment({
        instagram_user_id:   account.instagram_user_id,
        comment_id:          `sim_comment_${Date.now()}`,
        commenter_id:        "sim_user_001",
        commenter_username:  "test_user",
        comment_text:        text.trim(),
        post_id:             "sim_post_001",
        timestamp:           new Date().toISOString(),
      });
    } else {
      interactionId = await processDM({
        instagram_user_id: account.instagram_user_id,
        sender_id:         "sim_user_001",
        sender_username:   "test_user",
        message_text:      text.trim(),
        timestamp:         new Date().toISOString(),
        is_story_reply:    false,
      });
    }
  } catch (err) {
    console.error("[simulate] pipeline error:", err);
    return Response.json(
      { error: "Pipeline error — check server logs" },
      { status: 500 }
    );
  }

  if (!interactionId) {
    // This happens when engagement level filter skipped the message
    return Response.json({
      skipped: true,
      message:
        type === "comment"
          ? "Comment was filtered out by engagement level settings. Try a question or mention of buying."
          : "DM was not processed — check that your account is set up correctly.",
    });
  }

  // Fetch the saved interaction to return to the UI
  const { data: interaction } = await admin
    .from("interactions")
    .select(
      "id, interaction_type, message_text, drafted_response, status, comment_category, error_message"
    )
    .eq("id", interactionId)
    .single();

  return Response.json({ interaction });
}
