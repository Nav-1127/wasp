// Mock Instagram connection for local dev / testing
// Active when USE_MOCK_AUTH=true or META_APP_ID is not set.
// Simulates a successful connection with realistic test data.

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("brand_accounts")
    .update({
      instagram_user_id: "mock_ig_17841400000000001",
      instagram_handle: "your_instagram",
      instagram_access_token_encrypted: "mock_token_not_real",
      token_expires_at: new Date(
        Date.now() + 60 * 24 * 60 * 60 * 1000
      ).toISOString(), // 60 days
      profile_pic_url: null,
      follower_count: 4820,
    })
    .eq("user_id", user.id);

  if (error) {
    console.error("Mock connect error:", error);
    return NextResponse.redirect(`${appUrl}/onboarding?error=save_failed`);
  }

  return NextResponse.redirect(`${appUrl}/onboarding?instagram=connected`);
}
