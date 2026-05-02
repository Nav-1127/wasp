// app/api/interactions/approve/route.ts
// Approve a pending interaction. In real mode with delay > 0, schedules the
// reply for dispatch after the account's configured delay window. In mock/demo
// mode or when delay is off, sends immediately.

import { NextRequest } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import { replyToComment, sendDirectMessage, decryptToken } from "@/lib/instagram";
import { calcDelaySecs } from "@/lib/agent";

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
  let body: { interaction_id?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { interaction_id } = body;
  if (!interaction_id) {
    return Response.json({ error: "interaction_id is required" }, { status: 400 });
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

  if (interaction.status !== "pending" && interaction.status !== "failed") {
    return Response.json(
      { error: `Cannot approve an interaction with status '${interaction.status}'` },
      { status: 409 }
    );
  }

  const response = interaction.drafted_response;
  if (!response) {
    return Response.json({ error: "No drafted response to send" }, { status: 422 });
  }

  const isDemo = interaction.instagram_user_id?.startsWith("demo_");
  const routing: string = interaction.routing_decision ?? "public";

  if (isMockMode || isDemo) {
    await admin
      .from("interactions")
      .update({
        status: "approved",
        final_response: response,
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

  // In manual mode, delay starts from the moment the user approves — not from
  // when the pipeline ran. This simulates "I just noticed this and am replying."
  const delaySecs = calcDelaySecs(account);
  if (delaySecs > 0) {
    const scheduledAt = new Date(Date.now() + delaySecs * 1000).toISOString();
    await admin
      .from("interactions")
      .update({ status: "scheduled", scheduled_send_at: scheduledAt })
      .eq("id", interaction_id);

    return Response.json({ ok: true, scheduled: true, sendingAt: scheduledAt });
  }

  // Delay is off — send immediately
  const token = decryptToken(account.instagram_access_token_encrypted);

  try {
    if (
      routing === "both" &&
      interaction.interaction_type === "comment" &&
      interaction.source_comment_id
    ) {
      const ack = interaction.public_acknowledgement ?? "I've sent you a DM with the details!";
      await replyToComment(interaction.source_comment_id, ack, token);
      await sendDirectMessage(interaction.instagram_user_id, response, token);
    } else if (
      interaction.interaction_type === "comment" &&
      interaction.source_comment_id
    ) {
      await replyToComment(interaction.source_comment_id, response, token);
    } else {
      await sendDirectMessage(interaction.instagram_user_id, response, token);
    }

    await admin
      .from("interactions")
      .update({
        status: "approved",
        final_response: response,
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
