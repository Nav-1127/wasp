// Polling fallback for Instagram comments and DMs.
// Fetches recent activity directly from the Graph API and runs new items
// through the same agent pipeline as the webhook handler.
// Works alongside webhooks — deduplication prevents double-processing.

import { NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import { processComment, processDM } from "@/lib/agent";
import type { WebhookComment, WebhookDM } from "@/lib/agent";
import {
  getRecentMediaIds,
  getPostCommentsRaw,
  getConversations,
  decryptToken,
} from "@/lib/instagram";

// Process up to this many comments/DMs simultaneously.
// Keeps Anthropic API calls at a safe rate while being 5× faster than serial.
const CONCURRENT_LIMIT = 5;

/**
 * Process items in parallel with a concurrency cap.
 * Runs `limit` items at a time, waits for each batch before starting the next.
 * Uses allSettled so one failure doesn't cancel the rest of the batch.
 */
async function runConcurrent<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  for (let i = 0; i < items.length; i += limit) {
    await Promise.allSettled(items.slice(i, i + limit).map(fn));
  }
}

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("brand_accounts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!account?.instagram_user_id || !account?.instagram_access_token_encrypted) {
    return NextResponse.json(
      { error: "no_instagram_connection", newComments: 0, newDMs: 0, total: 0 },
      { status: 400 }
    );
  }

  const token = decryptToken(account.instagram_access_token_encrypted);
  let newComments = 0;
  let newDMs = 0;
  let postsChecked = 0;
  let commentsFound = 0;
  let commentsFetchError: string | null = null;

  // ── Poll comments ──────────────────────────────────────────────────────────────
  try {
    const mediaIds = await getRecentMediaIds(account.instagram_user_id, token, 10);
    console.log(`[poll-comments] Fetched ${mediaIds.length} media IDs`);

    for (const postId of mediaIds) {
      let comments;
      try {
        comments = await getPostCommentsRaw(postId, token, 50);
        postsChecked++;
        commentsFound += comments.length;
        console.log(`[poll-comments] Post ${postId}: ${comments.length} comments`);
      } catch (err) {
        commentsFetchError = (err as Error).message;
        console.error(`[poll-comments] Failed to fetch comments for post ${postId}:`, commentsFetchError);
        continue;
      }

      // Batch dedup: one query for the whole post instead of one query per comment
      const commentIds = comments.map((c) => c.id);
      const { data: seenRows } = await admin
        .from("interactions")
        .select("source_comment_id")
        .eq("brand_account_id", account.id)
        .in("source_comment_id", commentIds);

      const seenIds = new Set((seenRows ?? []).map((r) => r.source_comment_id));

      const unseen = comments.filter(
        (c) => c.username !== account.instagram_handle && !seenIds.has(c.id)
      );

      console.log(`[poll-comments] Post ${postId}: ${unseen.length} new comments to process`);

      await runConcurrent(unseen, CONCURRENT_LIMIT, async (comment) => {
        const webhookComment: WebhookComment = {
          instagram_user_id: account.instagram_user_id,
          comment_id: comment.id,
          commenter_id: "",
          commenter_username: comment.username ?? "",
          comment_text: comment.text,
          post_id: postId,
          timestamp: comment.timestamp,
        };

        console.log(`[poll-comments] Processing new comment: "${comment.text.slice(0, 50)}"`);
        const interactionId = await processComment(webhookComment);
        if (interactionId) newComments++;
      });
    }
  } catch (err) {
    console.error("[poll-comments] Comment polling failed:", err);
    commentsFetchError = (err as Error).message;
  }

  // ── Poll DMs ───────────────────────────────────────────────────────────────────
  // The conversations endpoint requires the app to be in Live mode for full access.
  // In development/testing mode this may return empty or throw — handled gracefully.
  try {
    const conversations = await getConversations(account.instagram_user_id, token, 10);

    // Collect all inbound messages across conversations, skipping outbound
    const inboundMessages: Array<{
      id: string;
      from: { id: string; username?: string; name?: string } | undefined;
      message: string;
      created_time: string;
    }> = [];

    for (const conv of conversations) {
      for (const msg of conv.messages?.data ?? []) {
        if (msg.from?.id === account.instagram_user_id) continue;
        if (!msg.message?.trim()) continue;
        inboundMessages.push(msg);
      }
    }

    // Batch dedup: one query for all DMs instead of one query per message
    const messageIds = inboundMessages.map((m) => m.id);
    const { data: seenDmRows } = messageIds.length
      ? await admin
          .from("interactions")
          .select("instagram_message_id")
          .eq("brand_account_id", account.id)
          .in("instagram_message_id", messageIds)
      : { data: [] };

    const seenDmIds = new Set((seenDmRows ?? []).map((r) => r.instagram_message_id));
    const unseenDMs = inboundMessages.filter((m) => !seenDmIds.has(m.id));

    await runConcurrent(unseenDMs, CONCURRENT_LIMIT, async (msg) => {
      const webhookDM: WebhookDM = {
        instagram_user_id: account.instagram_user_id,
        sender_id: msg.from?.id ?? "",
        sender_username: msg.from?.username ?? msg.from?.name ?? "",
        message_text: msg.message,
        timestamp: msg.created_time,
        message_id: msg.id,
      };

      const interactionId = await processDM(webhookDM);
      if (interactionId) newDMs++;
    });
  } catch (err) {
    // DM polling is expected to fail in development mode — not an error worth surfacing
    console.log("[poll-comments] DM polling skipped:", (err as Error).message);
  }

  const total = newComments + newDMs;
  console.log(`[poll-comments] Done — ${newComments} new comments, ${newDMs} new DMs (checked ${postsChecked} posts, found ${commentsFound} comments total)`);

  return NextResponse.json({
    newComments,
    newDMs,
    total,
    debug: { postsChecked, commentsFound, commentsFetchError },
  });
}
