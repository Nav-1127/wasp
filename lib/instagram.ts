// Instagram / Facebook Graph API utilities
// Server-side only.

const GRAPH_VERSION = "v18.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

// ── Token exchange ─────────────────────────────────────────────────────────────

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params}`);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to exchange code for token");
  }

  return data.access_token as string;
}

export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    fb_exchange_token: shortLivedToken,
  });

  const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params}`);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to get long-lived token");
  }

  return {
    access_token: data.access_token as string,
    expires_in: (data.expires_in as number) ?? 5183944, // ~60 days default
  };
}

// ── Account discovery ──────────────────────────────────────────────────────────

export async function getUserPages(
  accessToken: string
): Promise<Array<{ id: string; name: string; access_token: string }>> {
  const res = await fetch(
    `${GRAPH_BASE}/me/accounts?fields=id,name,access_token&access_token=${accessToken}`
  );
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to fetch Facebook pages");
  }

  return (data.data as Array<{ id: string; name: string; access_token: string }>) ?? [];
}

export async function getInstagramAccountForPage(
  pageId: string,
  pageToken: string
): Promise<string | null> {
  const res = await fetch(
    `${GRAPH_BASE}/${pageId}?fields=instagram_business_account&access_token=${pageToken}`
  );
  const data = await res.json();

  if (!res.ok || data.error) return null;
  return (data.instagram_business_account?.id as string) ?? null;
}

// ── Profile info ───────────────────────────────────────────────────────────────

export interface InstagramProfile {
  id: string;
  username: string;
  profile_picture_url: string | null;
  followers_count: number;
}

export async function getInstagramProfile(
  igUserId: string,
  accessToken: string
): Promise<InstagramProfile> {
  const res = await fetch(
    `${GRAPH_BASE}/${igUserId}?fields=id,username,profile_picture_url,followers_count&access_token=${accessToken}`
  );
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to fetch Instagram profile");
  }

  return {
    id: data.id as string,
    username: data.username as string,
    profile_picture_url: (data.profile_picture_url as string) ?? null,
    followers_count: (data.followers_count as number) ?? 0,
  };
}

// ── Content fetching for personality analysis ──────────────────────────────────

export interface InstagramPost {
  id: string;
  caption: string | null;
  timestamp: string;
  hashtags: string[];
  comments?: InstagramComment[];
}

export interface InstagramComment {
  id: string;
  text: string;
  from_account_owner: boolean;
}

/** Fetch last N posts with captions and timestamps */
export async function getRecentPosts(
  igUserId: string,
  accessToken: string,
  limit = 50
): Promise<InstagramPost[]> {
  const res = await fetch(
    `${GRAPH_BASE}/${igUserId}/media?fields=id,caption,timestamp&limit=${limit}&access_token=${accessToken}`
  );
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to fetch posts");
  }

  const posts: InstagramPost[] = (data.data ?? []).map(
    (p: { id: string; caption?: string; timestamp: string }) => {
      const caption = p.caption ?? "";
      // Extract hashtags from caption
      const hashtags = (caption.match(/#\w+/g) ?? []).map((h: string) =>
        h.toLowerCase()
      );
      return {
        id: p.id,
        caption,
        timestamp: p.timestamp,
        hashtags,
      };
    }
  );

  return posts;
}

/** Fetch the account owner's own comment replies on their posts (how they talk back) */
export async function getAccountCommentReplies(
  igUserId: string,
  posts: InstagramPost[],
  accessToken: string,
  maxPostsToCheck = 10
): Promise<string[]> {
  const replies: string[] = [];
  const postsToCheck = posts.slice(0, maxPostsToCheck);

  for (const post of postsToCheck) {
    try {
      const res = await fetch(
        `${GRAPH_BASE}/${post.id}/comments?fields=id,text,from&limit=25&access_token=${accessToken}`
      );
      const data = await res.json();

      if (!res.ok || data.error) continue;

      for (const comment of data.data ?? []) {
        // Only include comments made by the account owner
        if (comment.from?.id === igUserId && comment.text) {
          replies.push(comment.text);
        }
      }
    } catch {
      // Skip failed post — don't break the whole analysis
    }
  }

  return replies;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function formatFollowerCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

// ── Agent action helpers (Phase 2e) ────────────────────────────────────────────
// All functions are server-side only — never call from client components.

import { decrypt } from "@/lib/encryption";

/** Decrypt a stored Instagram access token */
export function decryptToken(encryptedToken: string): string {
  return decrypt(encryptedToken);
}

/** Reply to a comment on a post */
export async function replyToComment(
  commentId: string,
  message: string,
  accessToken: string
): Promise<string> {
  // access_token must go in the Authorization header, NOT the JSON body.
  const res = await fetch(`${GRAPH_BASE}/${commentId}/replies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to post comment reply");
  }

  return data.id as string; // the new reply's comment ID
}

/** Send a direct message to an Instagram user */
export async function sendDirectMessage(
  recipientId: string,
  message: string,
  accessToken: string
): Promise<string> {
  // access_token must go in the Authorization header, NOT the JSON body.
  const res = await fetch(`${GRAPH_BASE}/me/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text: message },
    }),
  });
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to send direct message");
  }

  return data.message_id as string;
}

/**
 * Subscribe an Instagram account to receive webhook events (comments + messages).
 * Must be called once after the user connects their Instagram account via OAuth.
 * Without this call, Meta will NOT send webhook events for this account even if the
 * app-level webhook is configured in the Meta Developer Dashboard.
 */
export async function subscribeToWebhooks(
  igUserId: string,
  accessToken: string
): Promise<void> {
  const res = await fetch(
    `${GRAPH_BASE}/${igUserId}/subscribed_apps?subscribed_fields=comments,messages&access_token=${accessToken}`,
    { method: "POST" }
  );
  const data = await res.json();

  if (!res.ok || data.error) {
    // Log but don't throw — a failure here shouldn't break the whole connect flow.
    // The user will still be connected; they just might not receive webhooks until
    // they reconnect or it's manually subscribed.
    console.error(
      "[subscribeToWebhooks] Failed to subscribe:",
      data.error?.message ?? "unknown error"
    );
  } else {
    console.log("[subscribeToWebhooks] Subscribed:", igUserId);
  }
}

export interface PostInfo {
  id: string;
  caption: string | null;
  thumbnail_url: string | null;
  permalink: string | null;
}

/** Fetch basic info about a post (for context when generating replies) */
export async function getPostInfo(
  postId: string,
  accessToken: string
): Promise<PostInfo> {
  const res = await fetch(
    `${GRAPH_BASE}/${postId}?fields=id,caption,media_url,thumbnail_url,permalink&access_token=${accessToken}`
  );
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to fetch post info");
  }

  return {
    id: data.id as string,
    caption: (data.caption as string) ?? null,
    // thumbnail_url exists for videos; fall back to media_url for images
    thumbnail_url: (data.thumbnail_url as string) ?? (data.media_url as string) ?? null,
    permalink: (data.permalink as string) ?? null,
  };
}
