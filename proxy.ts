import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // ── Intercept Supabase auth errors redirected to the site URL ───────────────
  // When an OTP/email link expires or is invalid, Supabase redirects to
  // [siteURL]?error=access_denied&error_code=otp_expired&...
  // Catch this before it reaches the page and show a friendly message instead.
  const errorCode = request.nextUrl.searchParams.get("error_code");
  if (errorCode === "otp_expired" || errorCode === "access_denied") {
    const url = request.nextUrl.clone();
    url.pathname = "/signup";
    url.search = "?error=link_expired";
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — always call getUser() to keep tokens fresh
  // Wrapped in try/catch so a Supabase error never causes a 500
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    console.error("Proxy: getUser() failed", err);
    return supabaseResponse;
  }

  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  // Not authenticated → redirect to /login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const onboardingCompleted = user.app_metadata?.onboarding_completed === true;

    // Authenticated user hits /login or /signup → send them home
    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = onboardingCompleted ? "/dashboard" : "/onboarding";
      return NextResponse.redirect(url);
    }

    // Authenticated but onboarding incomplete → keep them in /onboarding
    if (pathname.startsWith("/dashboard") && !onboardingCompleted) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    // Onboarding done, somehow ended up in /onboarding → send to /dashboard
    if (pathname.startsWith("/onboarding") && onboardingCompleted) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
