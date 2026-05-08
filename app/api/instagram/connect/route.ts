import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { randomBytes } from "crypto";

// Instagram Login for Business scopes.
// instagram_basic and instagram_manage_comments are legacy permissions —
// they are submitted for Meta app review as dependency chain requirements
// but must NOT appear in the OAuth URL (causes "Invalid platform app" error).
const SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
  "instagram_business_manage_comments",
].join("%2C");

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

  // Hardcoded to avoid www vs non-www mismatch between connect and callback.
  // Must exactly match the URI registered in Meta's Business Login Settings.
  const redirectUri =
    process.env.NODE_ENV === "production"
      ? "https://www.joinwasp.com/api/auth/instagram"
      : `${appUrl}/api/auth/instagram`;

  // Build URL manually — encode redirect_uri but keep scope pre-encoded (%2C)
  const authUrl =
    `https://www.instagram.com/oauth/authorize` +
    `?force_reauth=true` +
    `&client_id=${process.env.META_APP_ID}` +
    `&redirect_uri=${redirectUri}` +
    `&response_type=code` +
    `&scope=${SCOPES}` +
    `&state=${state}`;

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
