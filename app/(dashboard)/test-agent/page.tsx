// app/(dashboard)/test-agent/page.tsx
// Test the AI agent by simulating comments and DMs without real Instagram traffic.
// Development / testing only — requires onboarding to be complete.

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";
import DashboardShell from "@/components/dashboard-shell";
import TestAgentClient from "./test-agent-client";

export default async function TestAgentPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <DashboardShell email={user.email ?? ""}>
      <TestAgentClient />
    </DashboardShell>
  );
}
