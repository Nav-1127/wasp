// app/api/interactions/edit/route.ts
// Edit the drafted response text.
//
// Two behaviours depending on current status:
//   'scheduled' — the reply was approved and is waiting in the delay queue.
//                 Editing cancels the scheduled send, resets to 'pending', and
//                 requires the user to re-approve. Does NOT send anything.
//                 Returns { ok: true, unscheduled: true }.
//
//   'pending' / 'failed' — normal edit: send the updated version immediately
//                 via Instagram API and mark as 'edited'.

import { NextRequest } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import { replyToComment, sendDirectMessage, decryptToken } from "@/lib/instagram";

const isMockMode =
  !process.env.META_APP_ID || process.env.USE_MOCK_AUTH === "true";

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  let body: { interaction_id?: string; edited_text?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { interaction_id, edited_text } = body;

  if (!interaction_id) {
    return Response.json({ error: "interaction_id is required" }, { status: 400 });
  }
  if (!edited_text || typeof edited_text !== "string" || !edited_text.trim()) {
    return Response.json({ error: "edited_text is required" }, { status: 400 });
  }

  const { data: interaction } = await admin
    .from("interactions")
    .select("*")
    .eq("id", interaction_id)
    .eq("user_id", user.id)
    .single();

  if (!interaction) {
    return Response.json({ error: "Interaction not found" }, { status: 404 });
  }

  const allowedStatuses = ["pending", "failed", "scheduled"];
  if (!allowedStatuses.includes(interaction.status)) {
    return Response.json(
      { error: `Cannot edit an interaction with status '${interaction.status}'` },
      { status: 409 }
    );
  }

  const finalText = edited_text.trim();

  // ── Scheduled: cancel the queued send, reset to pending for re-approval ──────
  if (interaction.status === "scheduled") {
    await admin
      .from("interactions")
      .update({
        status: "pending",
        drafted_response: finalText,
        scheduled_send_at: null,
      })
      .eq("id", interaction_id);

    return Response.json({ ok: true, unscheduled: true });
  }

  // ── Pending / failed: edit and send immediately ───────────────────────────────
  const routing: string = interaction.routing_decision ?? "public";

  if (isMockMode) {
    await admin
      .from("interactions")
      .update({
        status: "edited",
        final_response: finalText,
        responded_at: new Date().toISOString(),
      })
      .eq("id", interaction_id);

    return Response.json({ ok: true, mock: true });
  }

  const { data: account } = await admin
    .from("brand_accounts")
    .select("*")
    .eq("id", interaction.brand_account_id)
    .single();

  if (!account?.instagram_access_token_encrypted) {
    return Response.json({ error: "No access token found" }, { status: 500 });
  }

  const token = decryptToken(account.instagram_access_token_encrypted);

  try {
    if (
      routing === "both" &&
      interaction.interaction_type === "comment" &&
      interaction.source_comment_id
    ) {
      const ack = interaction.public_acknowledgement ?? "I've sent you a DM with the details!";
      await replyToComment(interaction.source_comment_id, ack, token);
      await sendDirectMessage(interaction.instagram_user_id, finalText, token);
    } else if (
      interaction.interaction_type === "comment" &&
      interaction.source_comment_id
    ) {
      await replyToComment(interaction.source_comment_id, finalText, token);
    } else {
      await sendDirectMessage(interaction.instagram_user_id, finalText, token);
    }

    await admin
      .from("interactions")
      .update({
        status: "edited",
        final_response: finalText,
        responded_at: new Date().toISOString(),
      })
      .eq("id", interaction_id);

    return Response.json({ ok: true });
  } catch (err) {
    await admin
      .from("interactions")
      .update({ status: "failed", error_message: String(err) })
      .eq("id", interaction_id);

    return Response.json(
      { error: "Failed to send via Instagram API", detail: String(err) },
      { status: 502 }
    );
  }
}
