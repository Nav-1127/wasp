// app/(dashboard)/dashboard/analytics/page.tsx
// Analytics tab — engagement metrics and charts.

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import DashboardShell from "@/components/dashboard-shell";
import AnalyticsClient from "./analytics-client";

export default async function AnalyticsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <DashboardShell>
      <AnalyticsClient />
    </DashboardShell>
  );
}
