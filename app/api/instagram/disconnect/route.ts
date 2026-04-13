import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("brand_accounts")
    .update({
      instagram_user_id: null,
      instagram_handle: null,
      instagram_access_token_encrypted: null,
      token_expires_at: null,
      profile_pic_url: null,
      follower_count: null,
    })
    .eq("user_id", user.id);

  if (error) {
    return Response.json({ error: "Failed to disconnect" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
