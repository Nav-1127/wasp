// Instagram OAuth callback handler
// Meta redirects here after the user grants/denies permissions.

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getInstagramProfile,
  subscribeToWebhooks,
} from "@/lib/instagram";
import { encrypt } from "@/lib/encryption";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  const appUrl = new URL(request.url).origin;

  // User denied permission
  if (errorParam) {
    return NextResponse.redirect(`${appUrl}/onboarding?error=instagram_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${appUrl}/onboarding?error=instagram_no_code`);
  }

  // CSRF state check
  const storedState = request.cookies.get("instagram_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      `${appUrl}/onboarding?error=instagram_state_mismatch`
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${appUrl}/login`);
    }

    // Hardcoded to match exactly what was used in the OAuth connect request.
    const redirectUri =
      process.env.NODE_ENV === "production"
        ? "https://www.joinwasp.com/api/auth/instagram"
        : `${appUrl}/api/auth/instagram`;

    // 1. Exchange code → short-lived token + ig user id
    //    Instagram Login returns the ig_user_id directly — no Pages lookup needed.
    const { access_token: shortLivedToken, user_id: igUserId } =
      await exchangeCodeForToken(code, redirectUri);

    // 2. Short-lived → long-lived token (~60 days)
    const { access_token: longLivedToken, expires_in } =
      await exchangeForLongLivedToken(shortLivedToken);

    // 3. Fetch Instagram profile
    const profile = await getInstagramProfile(igUserId, longLivedToken);

    // 4. Encrypt the token before storing
    const encryptedToken = encrypt(longLivedToken);

    // 5. Calculate expiry timestamp
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // 6. Save to brand_accounts
    const admin = createAdminClient();
    const { error: updateError } = await admin
      .from("brand_accounts")
      .update({
        instagram_user_id: profile.id,
        instagram_handle: profile.username,
        instagram_access_token_encrypted: encryptedToken,
        token_expires_at: tokenExpiresAt,
        profile_pic_url: profile.profile_picture_url,
        follower_count: profile.followers_count,
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("brand_accounts update error:", updateError);
      return NextResponse.redirect(`${appUrl}/onboarding?error=save_failed`);
    }

    // Subscribe this Instagram account to receive webhook events (comments + DMs).
    // Required for Meta to actually deliver events to our webhook URL.
    await subscribeToWebhooks(profile.id, longLivedToken);

    // Clear CSRF cookie and redirect back to onboarding
    const response = NextResponse.redirect(
      `${appUrl}/onboarding?instagram=connected`
    );
    response.cookies.delete("instagram_oauth_state");
    return response;
  } catch (err) {
    console.error("Instagram OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/onboarding?error=instagram_failed`);
  }
}
