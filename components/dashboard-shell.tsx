"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface SummaryData {
  email: string | null;
  instagram_handle: string | null;
  profile_pic_url: string | null;
  agent_mode: "draft" | "auto";
  comment_mode: "draft" | "auto";
  dm_mode: "draft" | "auto";
  story_mode: "draft" | "auto";
  pending_count: number;
}

// ── Nav config ─────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/dashboard",           label: "Drafts",         icon: "📨", exact: true  },
  { href: "/dashboard/live-feed", label: "Live Feed",      icon: "📡", exact: false },
  { href: "/sting-triggers",      label: "Sting Triggers", icon: "⚡", exact: false },
  { href: "/dashboard/analytics", label: "Analytics",      icon: "📊", exact: false },
  { href: "/test-agent",          label: "Test Agent",     icon: "🧪", exact: false },
  { href: "/settings",            label: "Settings",       icon: "⚙️", exact: false },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [togglingMode, setTogglingMode] = useState(false);
  const [showModeConfirm, setShowModeConfirm] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const fetchSummary = useCallback(async () => {
    try {
      const r = await fetch("/api/dashboard/summary");
      if (r.ok) setSummary(await r.json());
    } catch {
      // silent — shell degrades gracefully
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    // Re-fetch when interaction actions happen (dispatched by DraftsClient)
    const handler = () => fetchSummary();
    window.addEventListener("wasp:interaction-update", handler);
    return () => window.removeEventListener("wasp:interaction-update", handler);
  }, [fetchSummary]);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  async function toggleAgentMode() {
    if (!summary) return;
    if (summary.agent_mode === "draft") {
      setShowModeConfirm(true);
    } else {
      await applyMode("draft");
    }
  }

  async function applyMode(mode: "draft" | "auto") {
    setTogglingMode(true);
    try {
      await fetch("/api/settings/agent-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_mode: mode }),
      });
      setSummary((s) => (s ? { ...s, agent_mode: mode } : s));
    } finally {
      setTogglingMode(false);
      setShowModeConfirm(false);
    }
  }

  const pendingCount = summary?.pending_count ?? 0;
  const isAuto = summary?.agent_mode === "auto";

  const NavList = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <nav className="flex flex-col gap-1 pt-2">
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const isDrafts = item.href === "/dashboard" && item.exact;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors"
            style={{
              backgroundColor: active ? "#D4FF00" : "transparent",
              color: active ? "#1A1A1A" : "#6B6058",
              fontWeight: active ? 700 : 500,
            }}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {isDrafts && pendingCount > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none"
                style={{
                  backgroundColor: active ? "#1A1A1A" : "#D4FF00",
                  color: active ? "#D4FF00" : "#1A1A1A",
                }}
              >
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>

      {/* ── Auto Mode confirmation dialog ─────────────────────────────────────── */}
      {showModeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            className="w-full max-w-sm border rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: "#EDE8DE", borderColor: "#D5CFC3" }}
          >
            <p
              className="font-black text-[#1A1A1A] text-lg mb-2"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Switch to Auto Mode?
            </p>
            <p className="text-sm text-[#6B6058] mb-5 leading-relaxed">
              WASP will respond automatically without your approval. You can
              switch back to Draft Mode anytime.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => applyMode("auto")}
                disabled={togglingMode}
                className="flex-1 bg-[#1A1A1A] text-[#F5F0E8] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
              >
                {togglingMode ? "Switching…" : "Enable Auto Mode"}
              </button>
              <button
                onClick={() => setShowModeConfirm(false)}
                className="flex-1 border font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#D5CFC3] transition-colors"
                style={{ borderColor: "#D5CFC3", color: "#6B6058" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top bar ───────────────────────────────────────────────────────────── */}
      <header
        className="border-b px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-30 gap-3"
        style={{ borderColor: "#D5CFC3", backgroundColor: "#EDE8DE" }}
      >
        {/* Left: hamburger (mobile) + logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            className="md:hidden p-1 rounded-lg hover:bg-[#D5CFC3] transition-colors"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Open navigation"
          >
            <div className="w-5 flex flex-col gap-[5px]">
              <span
                className="h-0.5 bg-[#1A1A1A] block rounded-full transition-transform"
                style={{
                  transform: mobileNavOpen
                    ? "translateY(7px) rotate(45deg)"
                    : "none",
                }}
              />
              <span
                className="h-0.5 bg-[#1A1A1A] block rounded-full transition-opacity"
                style={{ opacity: mobileNavOpen ? 0 : 1 }}
              />
              <span
                className="h-0.5 bg-[#1A1A1A] block rounded-full transition-transform"
                style={{
                  transform: mobileNavOpen
                    ? "translateY(-7px) rotate(-45deg)"
                    : "none",
                }}
              />
            </div>
          </button>
          <div className="flex items-center gap-1">
            <span
              className="text-xl font-black tracking-tighter text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              WASP
            </span>
            <span className="text-base leading-none">⚡</span>
          </div>
        </div>

        {/* Center: Instagram handle */}
        {summary?.instagram_handle && (
          <div className="hidden sm:flex items-center gap-2 flex-1 justify-center">
            {summary.profile_pic_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={summary.profile_pic_url}
                alt={summary.instagram_handle}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: "#D5CFC3", color: "#6B6058" }}
              >
                {summary.instagram_handle[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-[#1A1A1A]">
              @{summary.instagram_handle}
            </span>
          </div>
        )}

        {/* Right: pending bell + mode toggle + sign out */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {pendingCount > 0 && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
              style={{ backgroundColor: "#1A1A1A", color: "#D4FF00" }}
            >
              <span>🔔</span>
              <span className="tabular-nums">{pendingCount}</span>
            </Link>
          )}

          <button
            onClick={toggleAgentMode}
            disabled={togglingMode}
            title={isAuto ? "Switch to Draft Mode" : "Switch to Auto Mode"}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all disabled:opacity-40"
            style={{
              backgroundColor: isAuto ? "#D4FF00" : "#F5F0E8",
              borderColor: isAuto ? "#5C6B00" : "#D5CFC3",
              color: isAuto ? "#1A1A1A" : "#6B6058",
            }}
          >
            <span>{isAuto ? "⚡" : "✏️"}</span>
            <span className="hidden sm:inline">
              {isAuto ? "Auto Mode" : "Draft Mode"}
            </span>
          </button>

          <form action="/api/auth/signout" method="POST" className="hidden sm:block">
            <button
              type="submit"
              className="text-xs font-semibold border rounded-lg px-3 py-1.5 hover:bg-[#1A1A1A] hover:text-[#F5F0E8] transition-colors"
              style={{
                borderColor: "#D5CFC3",
                color: "#1A1A1A",
                backgroundColor: "transparent",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex">

        {/* Desktop sidebar */}
        <aside
          className="w-56 border-r p-4 hidden md:flex flex-col flex-shrink-0 sticky top-14"
          style={{
            borderColor: "#D5CFC3",
            backgroundColor: "#EDE8DE",
            height: "calc(100vh - 56px)",
          }}
        >
          <NavList />
          <div
            className="mt-auto pt-4 border-t"
            style={{ borderColor: "#D5CFC3" }}
          >
            {summary?.email && (
              <p className="text-xs text-[#9A9080] truncate">{summary.email}</p>
            )}
          </div>
        </aside>

        {/* Mobile nav overlay */}
        {mobileNavOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-20 bg-black/30 md:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            {/* Drawer */}
            <div
              className="fixed left-0 top-14 bottom-0 z-30 w-64 p-4 border-r shadow-xl md:hidden flex flex-col"
              style={{
                backgroundColor: "#EDE8DE",
                borderColor: "#D5CFC3",
              }}
            >
              <NavList onLinkClick={() => setMobileNavOpen(false)} />
              <form
                action="/api/auth/signout"
                method="POST"
                className="mt-4 pt-4 border-t"
                style={{ borderColor: "#D5CFC3" }}
              >
                <button
                  type="submit"
                  className="w-full text-xs font-semibold border rounded-xl px-3 py-2.5 hover:bg-[#1A1A1A] hover:text-[#F5F0E8] transition-colors"
                  style={{ borderColor: "#D5CFC3", color: "#1A1A1A" }}
                >
                  Sign out
                </button>
              </form>
              {summary?.email && (
                <p className="text-xs text-[#9A9080] mt-3 truncate">
                  {summary.email}
                </p>
              )}
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
