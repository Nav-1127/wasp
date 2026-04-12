import { redirect } from "next/navigation";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("brand_accounts")
    .select("account_type, instagram_handle, onboarding_completed")
    .eq("user_id", user.id)
    .single();

  const isBrand = account?.account_type !== "creator";
  const handle = account?.instagram_handle;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      {/* Top bar */}
      <header
        className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: "#D5CFC3", backgroundColor: "#EDE8DE" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xl font-black tracking-tighter text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            WASP
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF00]" />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-[#6B6058] hidden sm:block">
            {user.email}
          </span>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="text-xs text-[#9A9080] hover:text-[#5C6B00] transition-colors border border-[#D5CFC3] rounded-lg px-3 py-1.5"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome banner */}
        <div className="border border-[#5C6B00]/30 bg-[#D4FF00]/15 rounded-2xl px-8 py-8 mb-10">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🐝</span>
            <div>
              <h1
                className="text-2xl font-black text-[#1A1A1A] mb-1"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                WASP is set up and ready.
              </h1>
              <p className="text-[#6B6058]">
                {handle
                  ? `@${handle} is connected. Full agent controls are coming in the next update.`
                  : "Your account is configured. Connect your Instagram to go live."}
              </p>
            </div>
          </div>
        </div>

        {/* Status cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: "Account type",
              value: isBrand ? "Brand" : "Creator",
              icon: isBrand ? "🏪" : "🎨",
            },
            {
              label: "Instagram",
              value: handle ? `@${handle}` : "Not connected",
              icon: "📸",
              muted: !handle,
            },
            {
              label: "Agent status",
              value: "Draft mode",
              icon: "⚡",
              badge: "Coming soon",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl p-5"
            >
              <div className="text-2xl mb-2">{card.icon}</div>
              <p className="text-xs text-[#9A9080] uppercase tracking-widest mb-1">
                {card.label}
              </p>
              <p
                className={`font-bold text-sm ${card.muted ? "text-[#9A9080]" : "text-[#1A1A1A]"}`}
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {card.value}
              </p>
              {card.badge && (
                <span className="inline-block mt-2 text-[10px] bg-[#D4FF00]/30 text-[#5C6B00] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {card.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* What's next */}
        <div className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl p-6 sm:p-8">
          <h2
            className="text-lg font-black text-[#1A1A1A] mb-6"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            What&apos;s coming next
          </h2>

          <div className="flex flex-col gap-4">
            {[
              {
                step: "Phase 2b",
                title: "Connect your Instagram",
                description: "Secure OAuth connection via Meta's official API.",
                done: !!handle,
              },
              {
                step: "Phase 2c",
                title: "Live comment & DM monitoring",
                description: "WASP watches your Instagram 24/7 and queues responses for your review.",
                done: false,
              },
              {
                step: "Phase 3",
                title: "Auto-reply mode",
                description: "Flip the switch. WASP replies instantly and automatically.",
                done: false,
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{
                    backgroundColor: item.done ? "#5C6B00" : "#D5CFC3",
                    color: item.done ? "white" : "#9A9080",
                  }}
                >
                  {item.done ? "✓" : "·"}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm text-[#1A1A1A]">{item.title}</p>
                    <span className="text-[10px] text-[#9A9080] bg-[#D5CFC3] rounded-full px-2 py-0.5 font-medium">
                      {item.step}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B6058]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
