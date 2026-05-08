// TEMPORARY DEBUG ENDPOINT — delete after diagnosing poll-comments issue.
// Read-only. Requires login. Does not modify any data.

import { NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import { decryptToken, getRecentMediaIds } from "@/lib/instagram";

const INSTAGRAM_GRAPH = "https://graph.instagram.com/v21.0";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("brand_accounts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!account?.instagram_user_id || !account?.instagram_access_token_encrypted) {
    return NextResponse.json({ error: "No Instagram account connected" }, { status: 400 });
  }

  const token = decryptToken(account.instagram_access_token_encrypted);

  // ── Comments ───────────────────────────────────────────────────────────────
  const mediaIds = await getRecentMediaIds(account.instagram_user_id, token, 5);

  const posts = await Promise.all(
    mediaIds.map(async (postId) => {
      const res = await fetch(
        `${INSTAGRAM_GRAPH}/${postId}/comments?fields=id,text,timestamp,username&limit=50&access_token=${token}`
      );
      const raw = await res.json();
      return {
        postId,
        httpStatus: res.status,
        commentCount: raw.data?.length ?? 0,
        apiError: raw.error ?? null,
        comments: raw.data ?? [],
      };
    })
  );

  // ── DMs ────────────────────────────────────────────────────────────────────
  let dmsResult: { httpStatus: number; conversationCount: number; apiError: unknown; conversations: unknown[] } = {
    httpStatus: 0,
    conversationCount: 0,
    apiError: null,
    conversations: [],
  };

  const dmRes = await fetch(
    `${INSTAGRAM_GRAPH}/${account.instagram_user_id}/conversations?platform=instagram` +
    `&fields=id,messages.limit(5){id,message,from,created_time}` +
    `&limit=10&access_token=${token}`
  );
  const dmRaw = await dmRes.json();
  dmsResult = {
    httpStatus: dmRes.status,
    conversationCount: dmRaw.data?.length ?? 0,
    apiError: dmRaw.error ?? null,
    conversations: dmRaw.data ?? [],
  };

  return NextResponse.json({
    handle: account.instagram_handle,
    instagramUserId: account.instagram_user_id,
    comments: { postsChecked: mediaIds.length, posts },
    dms: dmsResult,
  });
}
