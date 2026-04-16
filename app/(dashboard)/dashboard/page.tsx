import { redirect } from "next/navigation";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase";
import DashboardShell from "@/components/dashboard-shell";

const ENGAGEMENT_LEVEL_LABELS: Record<string, string> = {
  smart_select:   "Smart select",
  reply_all:      "Reply to all",
  questions_only: "Questions only",
  manual_pick:    "Manual pick",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("brand_accounts")
    .select("account_type, instagram_handle, onboarding_completed, engagement_level")
    .eq("user_id", user.id)
    .single();

  const isBrand         = account?.account_type !== "creator";
  const handle          = account?.instagram_handle;
  const engagementLevel = account?.engagement_level ?? "smart_select";
  const params          = await searchParams;
  const isFirstVisit    = params.welcome === "true";

  return (
    <DashboardShell email={user.email ?? ""}>
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Welcome banner */}
        {isFirstVisit ? (
          <div className="border-2 border-[#5C6B00] bg-[#D4FF00]/20 rounded-2xl px-8 py-8 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🐝</span>
              <div>
                <h1
                  className="text-2xl font-black text-[#1A1A1A] mb-2"
                  style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                >
                  You&apos;re all set up!
                </h1>
                <p className="text-[#6B6058] mb-1">
                  {handle
                    ? `@${handle} is connected and your content personality is ready.`
                    : "Your account is configured and ready to go."}
                </p>
                <p className="text-sm text-[#5C6B00] font-medium">
                  Full agent controls — live comment and DM monitoring — are coming in Phase 3.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-[#5C6B00]/30 bg-[#D4FF00]/15 rounded-2xl px-8 py-8 mb-8">
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
        )}

        {/* Status cards */}
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
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
              label: "Engagement mode",
              value: ENGAGEMENT_LEVEL_LABELS[engagementLevel] ?? "Smart select",
              icon: "🎯",
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

        {/* Sting Triggers quick-access */}
        <div
          className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl p-6 mb-8 flex items-center justify-between gap-4"
        >
          <div>
            <p
              className="font-black text-[#1A1A1A] mb-1"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              ⚡ Sting Triggers
            </p>
            <p className="text-sm text-[#6B6058]">
              Auto-DM anyone who comments asking for links or info. Set up keyword and smart-intent triggers.
            </p>
          </div>
          <a
            href="/sting-triggers"
            className="flex-shrink-0 text-xs font-semibold bg-[#1A1A1A] text-[#F5F0E8] px-4 py-2.5 rounded-xl hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors"
          >
            Manage →
          </a>
        </div>

        {/* Roadmap */}
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
                title: "Engagement Level + Sting Triggers",
                description: "Control how WASP handles comment volume and set up comment-to-DM automations.",
                done: true,
              },
              {
                step: "Phase 3",
                title: "Live comment & DM monitoring",
                description: "WASP watches your Instagram 24/7 and replies automatically.",
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

      </div>
    </DashboardShell>
  );
}
