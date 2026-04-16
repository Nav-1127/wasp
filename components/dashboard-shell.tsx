"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardShellProps {
  email: string;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: "/dashboard",       label: "Dashboard",      icon: "🏠" },
  { href: "/sting-triggers",  label: "Sting Triggers", icon: "⚡" },
  { href: "/settings",        label: "Settings",       icon: "⚙️" },
  { href: "/test-agent",      label: "Test Agent",     icon: "🧪" },
];

export default function DashboardShell({ email, children }: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>

      {/* ── Top header ──────────────────────────────────────────────────────── */}
      <header
        className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{ borderColor: "#D5CFC3", backgroundColor: "#EDE8DE" }}
      >
        <div className="flex items-center gap-1.5">
          <span
            className="text-2xl font-black tracking-tighter text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            WASP
          </span>
          <span className="text-lg leading-none">⚡</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-[#6B6058] hidden sm:block">{email}</span>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="text-xs font-semibold text-[#1A1A1A] bg-[#EDE8DE] hover:bg-[#1A1A1A] hover:text-[#F5F0E8] transition-colors border border-[#D5CFC3] rounded-lg px-4 py-2"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex">

        {/* Sidebar — hidden on mobile */}
        <aside
          className="w-56 min-h-[calc(100vh-57px)] border-r p-4 hidden md:block flex-shrink-0"
          style={{ borderColor: "#D5CFC3", backgroundColor: "#EDE8DE" }}
        >
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: active ? "#D4FF00" : "transparent",
                    color: active ? "#1A1A1A" : "#6B6058",
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
