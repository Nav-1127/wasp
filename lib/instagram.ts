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

// ── Helpers ────────────────────────────────────────────────────────────────────

export function formatFollowerCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}
