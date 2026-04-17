import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { randomBytes } from "crypto";

const SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_comments",
  "instagram_business_manage_messages",
].join(",");

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const appUrl = new URL(request.url).origin;

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

  const authUrl = `https://www.instagram.com/oauth/authorize?${params}`;

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
