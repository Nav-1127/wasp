// lib/queue.ts
// Rate-limiting system for outbound Instagram messages.
//
// Meta's limit: ~200 messages/hour per account.
// We cap at 180 (leaving a safety buffer of 20).
//
// Storage: counted from the interactions table — no separate queue table needed.
// Messages that exceed the limit are saved with status 'queued' and sent when
// the next webhook fires and the rate window has space.
//
// Priority when draining the queue:
//   1. dm / story_reply (highest intent)
//   2. comment
// Within each type: oldest first (FIFO).
//
// Note: processScheduled() was removed in Phase 3f. Scheduled (delayed) sends
// are now handled by QStash delayed jobs published from agent.ts. The
// scheduled_send_at column is kept for dashboard visibility only.

import { createAdminClient } from "@/lib/supabase";
import { replyToComment, sendDirectMessage } from "@/lib/instagram";

const RATE_LIMIT_PER_HOUR = 180;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/** Returns true if the brand account has capacity to send another message right now. */
export async function checkRateLimit(brandAccountId: string): Promise<boolean> {
  const admin = createAdminClient();
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

  const { count } = await admin
    .from("interactions")
    .select("id", { count: "exact", head: true })
    .eq("brand_account_id", brandAccountId)
    .in("status", ["auto_sent", "approved", "edited"])
    .gte("responded_at", windowStart);

  return (count ?? 0) < RATE_LIMIT_PER_HOUR;
}

/**
 * Drain queued messages for a brand account, up to the remaining hourly capacity.
 * Called at the start of each webhook processing run so old queued messages
 * get sent as soon as capacity opens up.
 */
export async function drainQueue(
  brandAccountId: string,
  accessToken: string
): Promise<void> {
  const admin = createAdminClient();
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

  const { count: sentCount } = await admin
    .from("interactions")
    .select("id", { count: "exact", head: true })
    .eq("brand_account_id", brandAccountId)
    .in("status", ["auto_sent", "approved", "edited"])
    .gte("responded_at", windowStart);

  const remaining = RATE_LIMIT_PER_HOUR - (sentCount ?? 0);
  if (remaining <= 0) return;

  const { data: queued } = await admin
    .from("interactions")
    .select("id, interaction_type, instagram_user_id, source_comment_id, drafted_response, routing_decision, public_acknowledgement")
    .eq("brand_account_id", brandAccountId)
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(remaining);

  if (!queued || queued.length === 0) return;

  // Sort by priority: dm/story_reply before comment
  const prioritized = [...queued].sort((a, b) => {
    const priority = (type: string) =>
      type === "dm" || type === "story_reply" ? 0 : 1;
    return priority(a.interaction_type) - priority(b.interaction_type);
  });

  for (const interaction of prioritized) {
    const response = interaction.drafted_response;
    if (!response) continue;

    try {
      const routing: string = interaction.routing_decision ?? "public";

      if (
        routing === "both" &&
        interaction.interaction_type === "comment" &&
        interaction.source_comment_id
      ) {
        const ack = interaction.public_acknowledgement ?? "I've sent you a DM with the details!";
        await replyToComment(interaction.source_comment_id, ack, accessToken);
        await sendDirectMessage(interaction.instagram_user_id, response, accessToken);
      } else if (
        interaction.interaction_type === "comment" &&
        interaction.source_comment_id
      ) {
        await replyToComment(interaction.source_comment_id, response, accessToken);
      } else if (
        interaction.interaction_type === "dm" ||
        interaction.interaction_type === "story_reply"
      ) {
        await sendDirectMessage(interaction.instagram_user_id, response, accessToken);
      } else {
        continue;
      }

      await admin
        .from("interactions")
        .update({
          status: "auto_sent",
          final_response: response,
          responded_at: new Date().toISOString(),
        })
        .eq("id", interaction.id);
    } catch (err) {
      console.error(`Failed to send queued interaction ${interaction.id}:`, err);
      await admin
        .from("interactions")
        .update({ status: "failed", error_message: String(err) })
        .eq("id", interaction.id);
    }
  }
}
