// Instagram OAuth callback handler
// Meta redirects here after the user grants/denies permissions.

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import {
  exchangeCodeForToken,
  exchangeForLongLivedToken,
  getUserPages,
  getInstagramAccountForPage,
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

    const redirectUri = `${appUrl}/api/auth/instagram`;

    // 1. Exchange code → short-lived token
    const shortLivedToken = await exchangeCodeForToken(code, redirectUri);

    // 2. Short-lived → long-lived token (60 days)
    const { access_token: longLivedToken, expires_in } =
      await exchangeForLongLivedToken(shortLivedToken);

    // 3. Get Facebook Pages this user manages
    const pages = await getUserPages(longLivedToken);

    if (pages.length === 0) {
      // User has no Facebook Pages → can't have Instagram Business account
      return NextResponse.redirect(`${appUrl}/onboarding?error=no_business_account`);
    }

    // 4. Find connected Instagram Business/Creator account
    let igUserId: string | null = null;
    let activeToken = longLivedToken;

    for (const page of pages) {
      const igId = await getInstagramAccountForPage(
        page.id,
        page.access_token || longLivedToken
      );
      if (igId) {
        igUserId = igId;
        activeToken = page.access_token || longLivedToken;
        break;
      }
    }

    if (!igUserId) {
      // User has pages but none connected to Instagram Business/Creator
      return NextResponse.redirect(`${appUrl}/onboarding?error=no_business_account`);
    }

    // 5. Fetch Instagram profile
    const profile = await getInstagramProfile(igUserId, activeToken);

    // 6. Encrypt the token before storing
    const encryptedToken = encrypt(longLivedToken);

    // 7. Calculate expiry timestamp
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();

    // 8. Save to brand_accounts
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
    // This is required for Meta to actually send events to our webhook URL.
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
