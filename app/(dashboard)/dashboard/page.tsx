// app/(dashboard)/dashboard/page.tsx
// Drafts tab — the main view. Fetches initial pending interactions server-side
// then hands off to DraftsClient for real-time updates and interactive actions.

import { redirect } from "next/navigation";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import DashboardShell from "@/components/dashboard-shell";
import DraftsClient from "./drafts-client";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: interactions } = await admin
    .from("interactions")
    .select("*")
    .eq("user_id", user.id)
    .in("status", ["pending", "scheduled"])
    .order("created_at", { ascending: false });

  return (
    <DashboardShell>
      <DraftsClient
        userId={user.id}
        initialInteractions={interactions ?? []}
      />
    </DashboardShell>
  );
}
