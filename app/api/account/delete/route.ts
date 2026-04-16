// app/api/account/delete/route.ts
// Permanently deletes the authenticated user's account and all associated data.
// Cascades through brand_accounts → products, account_assets, interactions,
// conversation_threads, sting_triggers, and finally the auth.users row.

import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    // Delete auth user — Supabase cascades ON DELETE CASCADE to all tables
    // that reference auth.users(id), so this removes all user data.
    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
      console.error("Delete account error:", error);
      return Response.json({ error: "Failed to delete account" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Delete account error:", err);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
