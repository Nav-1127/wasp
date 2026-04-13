import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

// Supabase redirects here after email confirmation / OAuth
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Let middleware handle the final redirect based on onboarding_completed
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send to login with error flag
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
