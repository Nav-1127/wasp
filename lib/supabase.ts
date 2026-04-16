// ── Server-only Supabase clients ─────────────────────────────────────────────
// Do NOT import this file in Client Components.
// For Client Components, import from "@/lib/supabase-browser" instead.

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ── Server client (for Server Components, Route Handlers, Server Actions) ────
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component — cookies can't be set here (safe to ignore)
        }
      },
    },
  });
}

// ── Admin client (service role — server only, never expose to client) ─────────
// Returned as `any`: Supabase v2 returns GenericStringError on query results
// without generated DB types. Since admin queries are server-only and bypass
// RLS, `any` here is safe. Generate types with `supabase gen types typescript`
// to get full type safety in a future migration.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as any;
}
