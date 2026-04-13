import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware handles the redirect, but this is an extra safety net
  if (!user) {
    redirect("/login");
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#F5F0E8" }}
    >
      {children}
    </div>
  );
}
