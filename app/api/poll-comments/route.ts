// Polling fallback for Instagram comments and DMs.
// Fetches recent activity directly from the Graph API and routes new items
// through QStash for async processing. Falls back to direct inline processing
// when QStash is not configured (local dev).
//
// The batch deduplication queries are kept here — one DB query per post covers
// all comments in that post, ~50× fewer queries than checking one at a time.

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
import { publishJob, isQStashEnabled } from "@/lib/job-queue";

// Used only in the inline fallback path (when QStash is not configured).
const CONCURRENT_LIMIT = 5;

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
  const useQueue = isQStashEnabled();

  let newComments = 0;
  let newDMs = 0;
  let postsChecked = 0;
  let commentsFound = 0;
  let commentsFetchError: string | null = null;

  // ── Poll comments ──────────────────────────────────────────────────────────

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

      // Batch dedup: one query per post instead of one query per comment
      const commentIds = comments.map((c) => c.id);
      const { data: seenRows } = await admin
        .from("interactions")
        .select("*")
        .eq("brand_account_id", account.id)
        .in("source_comment_id", commentIds);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const seenIds = new Set((seenRows ?? []).map((r: any) => r.source_comment_id as string));

      const unseen = comments.filter(
        (c) => c.username !== account.instagram_handle && !seenIds.has(c.id)
      );

      console.log(`[poll-comments] Post ${postId}: ${unseen.length} new comments to process`);

      if (useQueue) {
        // QStash path: publish each unseen comment as a job (priority-routed)
        await Promise.allSettled(
          unseen.map(async (comment) => {
            const queued = await publishJob(account.id, {
              jobType: "comment",
              data: {
                instagram_user_id:   account.instagram_user_id,
                comment_id:         comment.id,
                commenter_id:       "",
                commenter_username: comment.username ?? "",
                comment_text:       comment.text,
                post_id:            postId,
                timestamp:          comment.timestamp,
              } satisfies WebhookComment,
            });
            if (queued) newComments++;
          })
        );
      } else {
        // Inline fallback: process directly with concurrency cap
        await runConcurrent(unseen, CONCURRENT_LIMIT, async (comment) => {
          const webhookComment: WebhookComment = {
            instagram_user_id:   account.instagram_user_id,
            comment_id:         comment.id,
            commenter_id:       "",
            commenter_username: comment.username ?? "",
            comment_text:       comment.text,
            post_id:            postId,
            timestamp:          comment.timestamp,
          };
          console.log(`[poll-comments] Processing new comment: "${comment.text.slice(0, 50)}"`);
          const interactionId = await processComment(webhookComment);
          if (interactionId) newComments++;
        });
      }
    }
  } catch (err) {
    console.error("[poll-comments] Comment polling failed:", err);
    commentsFetchError = (err as Error).message;
  }

  // ── Poll DMs ───────────────────────────────────────────────────────────────

  try {
    const conversations = await getConversations(account.instagram_user_id, token, 10);

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

    // Batch dedup: one query for all DMs
    const messageIds = inboundMessages.map((m) => m.id);
    const { data: seenDmRows } = messageIds.length
      ? await admin
          .from("interactions")
          .select("*")
          .eq("brand_account_id", account.id)
          .in("instagram_message_id", messageIds)
      : { data: [] };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const seenDmIds = new Set((seenDmRows ?? []).map((r: any) => r.instagram_message_id as string));
    const unseenDMs = inboundMessages.filter((m) => !seenDmIds.has(m.id));

    if (useQueue) {
      await Promise.allSettled(
        unseenDMs.map(async (msg) => {
          const queued = await publishJob(account.id, {
            jobType: "dm",
            data: {
              instagram_user_id: account.instagram_user_id,
              sender_id:        msg.from?.id ?? "",
              sender_username:  msg.from?.username ?? msg.from?.name ?? "",
              message_text:     msg.message,
              timestamp:        msg.created_time,
              message_id:       msg.id,
            } satisfies WebhookDM,
          });
          if (queued) newDMs++;
        })
      );
    } else {
      await runConcurrent(unseenDMs, CONCURRENT_LIMIT, async (msg) => {
        const webhookDM: WebhookDM = {
          instagram_user_id: account.instagram_user_id,
          sender_id:        msg.from?.id ?? "",
          sender_username:  msg.from?.username ?? msg.from?.name ?? "",
          message_text:     msg.message,
          timestamp:        msg.created_time,
          message_id:       msg.id,
        };
        const interactionId = await processDM(webhookDM);
        if (interactionId) newDMs++;
      });
    }
  } catch (err) {
    console.log("[poll-comments] DM polling skipped:", (err as Error).message);
  }

  const total = newComments + newDMs;
  const mode = useQueue ? "queued" : "processed";
  console.log(`[poll-comments] Done — ${newComments} comments ${mode}, ${newDMs} DMs ${mode} (checked ${postsChecked} posts, found ${commentsFound} comments total)`);

  return NextResponse.json({
    newComments,
    newDMs,
    total,
    mode,
    debug: { postsChecked, commentsFound, commentsFetchError },
  });
}
