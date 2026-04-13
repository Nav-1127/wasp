import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

// This route handles email confirmation links.
// The Supabase email template points here using {{ .TokenHash }} instead of
// {{ .ConfirmationURL }}, which prevents email scanners from accidentally
// consuming the one-time token before the user clicks it.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "signup" | "recovery" | "email" | null;
  const next = searchParams.get("next") ?? "/onboarding";

  if (token_hash && type) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (!error) {
      // Verified — send to onboarding (middleware will redirect if already done)
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("Email verification error:", error.message);
  }

  // Verification failed — send back to signup with friendly error
  return NextResponse.redirect(`${origin}/signup?error=link_expired`);
}
