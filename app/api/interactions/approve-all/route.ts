// app/api/interactions/approve-all/route.ts
// Approves all pending interactions for the authenticated user.
// Applies the same delay logic as single approve — schedules each interaction
// if delay > 0, sends immediately if delay is off.

import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import { replyToComment, sendDirectMessage, decryptToken } from "@/lib/instagram";
import { calcDelaySecs } from "@/lib/agent";

const isMockMode =
  !process.env.META_APP_ID || process.env.USE_MOCK_AUTH === "true";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const { data: pending } = await admin
    .from("interactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (!pending || pending.length === 0) {
    return Response.json({ ok: true, approved: 0 });
  }

  const now = new Date().toISOString();

  if (isMockMode) {
    let approved = 0;
    for (const interaction of pending) {
      if (!interaction.drafted_response) continue;
      await admin
        .from("interactions")
        .update({ status: "approved", final_response: interaction.drafted_response, responded_at: now })
        .eq("id", interaction.id);
      approved++;
    }
    return Response.json({ ok: true, approved });
  }

  const { data: account } = await admin
    .from("brand_accounts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!account?.instagram_access_token_encrypted) {
    return Response.json({ error: "No access token found" }, { status: 500 });
  }

  const delaySecs = calcDelaySecs(account);

  // If delay is on, schedule all pending interactions instead of sending them
  if (delaySecs > 0) {
    let scheduled = 0;
    for (const interaction of pending) {
      if (!interaction.drafted_response) continue;
      // Stagger the scheduled times slightly so they don't all fire at once
      const staggerMs = scheduled * 5000; // 5-second stagger between each
      const scheduledAt = new Date(Date.now() + delaySecs * 1000 + staggerMs).toISOString();
      await admin
        .from("interactions")
        .update({ status: "scheduled", scheduled_send_at: scheduledAt })
        .eq("id", interaction.id);
      scheduled++;
    }
    return Response.json({ ok: true, approved: scheduled, scheduled: true });
  }

  // Delay off — send immediately
  const token = decryptToken(account.instagram_access_token_encrypted);
  let approved = 0;

  for (const interaction of pending) {
    if (!interaction.drafted_response) continue;
    try {
      const isDemo = interaction.instagram_user_id?.startsWith("demo_");
      if (!isDemo) {
        const routing: string = interaction.routing_decision ?? "public";
        if (routing === "both" && interaction.interaction_type === "comment" && interaction.source_comment_id) {
          const ack = interaction.public_acknowledgement ?? "I've sent you a DM with the details!";
          await replyToComment(interaction.source_comment_id, ack, token);
          await sendDirectMessage(interaction.instagram_user_id, interaction.drafted_response, token);
        } else if (interaction.interaction_type === "comment" && interaction.source_comment_id) {
          await replyToComment(interaction.source_comment_id, interaction.drafted_response, token);
        } else if (interaction.instagram_user_id) {
          await sendDirectMessage(interaction.instagram_user_id, interaction.drafted_response, token);
        }
      }
      await admin
        .from("interactions")
        .update({ status: "approved", final_response: interaction.drafted_response, responded_at: new Date().toISOString() })
        .eq("id", interaction.id);
      approved++;
    } catch (err) {
      await admin
        .from("interactions")
        .update({ status: "failed", error_message: String(err) })
        .eq("id", interaction.id);
    }
  }

  return Response.json({ ok: true, approved });
}
