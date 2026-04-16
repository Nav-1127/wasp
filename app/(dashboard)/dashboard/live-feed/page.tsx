// app/(dashboard)/dashboard/live-feed/page.tsx
// Live Feed — a chronological stream of all handled interactions.

import { redirect } from "next/navigation";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import DashboardShell from "@/components/dashboard-shell";
import LiveFeedClient from "./live-feed-client";

export default async function LiveFeedPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  // Load initial 60 interactions (most recent first)
  const { data: interactions } = await admin
    .from("interactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(60);

  return (
    <DashboardShell>
      <LiveFeedClient
        userId={user.id}
        initialItems={interactions ?? []}
      />
    </DashboardShell>
  );
}
