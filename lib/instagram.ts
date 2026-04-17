// Instagram Graph API utilities — Instagram Login for Business
// Uses instagram.com OAuth + graph.instagram.com (no Facebook Page required).
// Server-side only.

const INSTAGRAM_API  = "https://api.instagram.com";
const INSTAGRAM_GRAPH = "https://graph.instagram.com/v21.0";

// ── Token exchange ─────────────────────────────────────────────────────────────

/**
 * Exchange the OAuth code for a short-lived token.
 * Instagram Login returns the ig_user_id directly — no extra profile call needed.
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; user_id: string }> {
  const body = new URLSearchParams({
    client_id:     process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    grant_type:    "authorization_code",
    redirect_uri:  redirectUri,
    code,
  });

  console.log("[exchangeCodeForToken] client_id:", process.env.META_APP_ID);
  console.log("[exchangeCodeForToken] redirect_uri:", redirectUri);

  const res = await fetch(`${INSTAGRAM_API}/oauth/access_token`, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  console.log("[exchangeCodeForToken] response:", JSON.stringify(data));

  if (!res.ok || data.error_type) {
    throw new Error(data.error_message ?? "Failed to exchange code for token");
  }

  return {
    access_token: data.access_token as string,
    user_id:      String(data.user_id),
  };
}

/**
 * Exchange a short-lived token for a long-lived token (~60 days).
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const params = new URLSearchParams({
    grant_type:    "ig_exchange_token",
    client_id:     process.env.META_APP_ID!,
    client_secret: process.env.META_APP_SECRET!,
    access_token:  shortLivedToken,
  });

  const res = await fetch(`https://graph.instagram.com/access_token?${params}`);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to get long-lived token");
  }

  return {
    access_token: data.access_token as string,
    expires_in:   (data.expires_in as number) ?? 5183944, // ~60 days
  };
}

// ── Profile info ───────────────────────────────────────────────────────────────

export interface InstagramProfile {
  id:                  string;
  username:            string;
  profile_picture_url: string | null;
  followers_count:     number;
}

export async function getInstagramProfile(
  igUserId: string,
  accessToken: string
): Promise<InstagramProfile> {
  const res = await fetch(
    `${INSTAGRAM_GRAPH}/${igUserId}?fields=id,username,profile_picture_url,followers_count&access_token=${accessToken}`
  );
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to fetch Instagram profile");
  }

  return {
    id:                  data.id as string,
    username:            data.username as string,
    profile_picture_url: (data.profile_picture_url as string) ?? null,
    followers_count:     (data.followers_count as number) ?? 0,
  };
}

// ── Content fetching for personality analysis ──────────────────────────────────

export interface InstagramPost {
  id:        string;
  caption:   string | null;
  timestamp: string;
  hashtags:  string[];
}

export interface InstagramComment {
  id:                  string;
  text:                string;
  from_account_owner:  boolean;
}

/** Fetch last N posts with captions and timestamps */
export async function getRecentPosts(
  igUserId: string,
  accessToken: string,
  limit = 50
): Promise<InstagramPost[]> {
  const res = await fetch(
    `${INSTAGRAM_GRAPH}/${igUserId}/media?fields=id,caption,timestamp&limit=${limit}&access_token=${accessToken}`
  );
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to fetch posts");
  }

  return (data.data ?? []).map(
    (p: { id: string; caption?: string; timestamp: string }) => {
      const caption  = p.caption ?? "";
      const hashtags = (caption.match(/#\w+/g) ?? []).map((h: string) =>
        h.toLowerCase()
      );
      return { id: p.id, caption, timestamp: p.timestamp, hashtags };
    }
  );
}

/** Fetch the account owner's own comment replies on their posts (how they talk back) */
export async function getAccountCommentReplies(
  igUserId: string,
  posts: InstagramPost[],
  accessToken: string,
  maxPostsToCheck = 10
): Promise<string[]> {
  const replies: string[] = [];

  for (const post of posts.slice(0, maxPostsToCheck)) {
    try {
      const res = await fetch(
        `${INSTAGRAM_GRAPH}/${post.id}/comments?fields=id,text,from&limit=25&access_token=${accessToken}`
      );
      const data = await res.json();
      if (!res.ok || data.error) continue;

      for (const comment of data.data ?? []) {
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
  if (count >= 1_000)     return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

// ── Agent action helpers ───────────────────────────────────────────────────────

import { decrypt } from "@/lib/encryption";

/** Decrypt a stored Instagram access token */
export function decryptToken(encryptedToken: string): string {
  return decrypt(encryptedToken);
}

/** Reply to a comment on a post */
export async function replyToComment(
  commentId:   string,
  message:     string,
  accessToken: string
): Promise<string> {
  const res = await fetch(`${INSTAGRAM_GRAPH}/${commentId}/replies`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message }),
  });
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to post comment reply");
  }

  return data.id as string;
}

/** Send a direct message to an Instagram user */
export async function sendDirectMessage(
  recipientId: string,
  message:     string,
  accessToken: string
): Promise<string> {
  const res = await fetch(`${INSTAGRAM_GRAPH}/me/messages`, {
    method:  "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message:   { text: message },
    }),
  });
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to send direct message");
  }

  return data.message_id as string;
}

export interface PostInfo {
  id:            string;
  caption:       string | null;
  thumbnail_url: string | null;
  permalink:     string | null;
}

/** Fetch basic info about a post (for context when generating replies) */
export async function getPostInfo(
  postId:      string,
  accessToken: string
): Promise<PostInfo> {
  const res = await fetch(
    `${INSTAGRAM_GRAPH}/${postId}?fields=id,caption,media_url,thumbnail_url,permalink&access_token=${accessToken}`
  );
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? "Failed to fetch post info");
  }

  return {
    id:            data.id as string,
    caption:       (data.caption as string) ?? null,
    thumbnail_url: (data.thumbnail_url as string) ?? (data.media_url as string) ?? null,
    permalink:     (data.permalink as string) ?? null,
  };
}

/**
 * Subscribe an Instagram account to receive webhook events (comments + messages).
 * Must be called once after the user connects via OAuth.
 */
export async function subscribeToWebhooks(
  igUserId:    string,
  accessToken: string
): Promise<void> {
  const res = await fetch(
    `${INSTAGRAM_GRAPH}/${igUserId}/subscribed_apps?subscribed_fields=comments,messages&access_token=${accessToken}`,
    { method: "POST" }
  );
  const data = await res.json();

  if (!res.ok || data.error) {
    console.error(
      "[subscribeToWebhooks] Failed:",
      data.error?.message ?? "unknown error"
    );
  } else {
    console.log("[subscribeToWebhooks] Subscribed:", igUserId);
  }
}
