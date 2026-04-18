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

      for (const comment of comments) {
        // Skip own replies (brand account commenting on its own post)
        if (comment.from?.id === account.instagram_user_id) continue;

        // Dedup: source_comment_id stores the Instagram comment ID for all comment rows
        const { data: existing } = await admin
          .from("interactions")
          .select("id")
          .eq("brand_account_id", account.id)
          .eq("source_comment_id", comment.id)
          .maybeSingle();

        if (existing) {
          console.log(`[poll-comments] Comment ${comment.id} already in DB, skipping`);
          continue;
        }

        const webhookComment: WebhookComment = {
          instagram_user_id: account.instagram_user_id,
          comment_id: comment.id,
          commenter_id: comment.from?.id ?? "",
          commenter_username: comment.from?.username ?? "",
          comment_text: comment.text,
          post_id: postId,
          timestamp: comment.timestamp,
        };

        console.log(`[poll-comments] Processing new comment: "${comment.text.slice(0, 50)}"`);
        const interactionId = await processComment(webhookComment);
        if (interactionId) newComments++;
      }
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

    for (const conv of conversations) {
      for (const msg of conv.messages?.data ?? []) {
        // Skip messages sent by the brand account (outbound)
        if (msg.from?.id === account.instagram_user_id) continue;
        if (!msg.message?.trim()) continue;

        // Dedup: instagram_message_id stores the unique message ID for DM rows
        const { data: existing } = await admin
          .from("interactions")
          .select("id")
          .eq("brand_account_id", account.id)
          .eq("instagram_message_id", msg.id)
          .maybeSingle();

        if (existing) continue;

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
      }
    }
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
