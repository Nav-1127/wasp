import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { randomBytes } from "crypto";

const SCOPES = [
  "instagram_basic",
  "instagram_manage_comments",
  "instagram_manage_messages",
  "pages_manage_metadata",
  "pages_read_engagement",
].join(",");

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // ── Mock / dev mode ────────────────────────────────────────────────────────
  // Active when META_APP_ID is not set OR USE_MOCK_AUTH=true
  const isMock =
    !process.env.META_APP_ID || process.env.USE_MOCK_AUTH === "true";

  if (isMock) {
    return NextResponse.redirect(
      new URL("/api/instagram/mock-connect", request.url)
    );
  }

  // ── Real OAuth ─────────────────────────────────────────────────────────────
  const state = randomBytes(16).toString("hex");
  const redirectUri = `${appUrl}/api/auth/instagram`;

  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    scope: SCOPES,
    response_type: "code",
    state,
  });

  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params}`;

  const response = NextResponse.redirect(authUrl);

  // Store state in cookie for CSRF verification in the callback
  response.cookies.set("instagram_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
