// app/api/dashboard/summary/route.ts
// Returns account summary data for the dashboard shell top bar:
// instagram handle, profile pic, agent mode, and pending interaction count.

import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const [accountResult, countResult] = await Promise.all([
      admin.from("brand_accounts").select("*").eq("user_id", user.id).single(),
      admin
        .from("interactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "pending"),
    ]);

    const account = accountResult.data;
    const pendingCount = countResult.count ?? 0;

    return Response.json({
      email: user.email ?? null,
      instagram_handle: account?.instagram_handle ?? null,
      profile_pic_url: account?.profile_pic_url ?? null,
      agent_mode: account?.agent_mode ?? "draft",
      comment_mode: account?.comment_mode ?? "draft",
      dm_mode: account?.dm_mode ?? "draft",
      story_mode: account?.story_mode ?? "draft",
      pending_count: pendingCount,
    });
  } catch {
    return Response.json({ error: "Failed to load summary" }, { status: 500 });
  }
}
