"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/dashboard-shell";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AccountData {
  instagram_handle: string | null;
  profile_pic_url: string | null;
  follower_count: number | null;
  token_expires_at: string | null;
  agent_mode: "draft" | "auto";
  comment_mode: "draft" | "auto";
  dm_mode: "draft" | "auto";
  story_mode: "draft" | "auto";
  engagement_level: string;
  primary_objective: string | null;
  personality_profile: Record<string, unknown> | null;
  personality_prompt: string | null;
  account_type: string;
}

interface Product {
  id?: string;
  name: string;
  description: string;
  price_range: string;
  url: string;
}

interface Asset {
  id?: string;
  label: string;
  url: string;
  when_to_share: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ENGAGEMENT_LEVELS = [
  {
    id: "smart_select",
    label: "Smart select",
    description: "Replies to questions, compliments, meaningful feedback, and purchase intent.",
    recommended: true,
  },
  {
    id: "reply_all",
    label: "Reply to all",
    description: "Respond to every comment, no exceptions.",
    recommended: false,
  },
  {
    id: "questions_only",
    label: "Questions only",
    description: "Only reply when someone asks a question or requests information.",
    recommended: false,
  },
  {
    id: "manual_pick",
    label: "Manual pick",
    description: "WASP drafts replies for all comments, but you choose which ones to send.",
    recommended: false,
  },
];

const OBJECTIVES: { id: string; label: string }[] = [
  { id: "grow_engagement",  label: "Grow engagement" },
  { id: "drive_sales",      label: "Drive sales" },
  { id: "grow_email_list",  label: "Grow email list" },
  { id: "book_calls",       label: "Book calls" },
  { id: "grow_followers",   label: "Grow followers" },
  { id: "mix",              label: "Mix of the above" },
];

// ── Reusable Section Shell ─────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="border rounded-2xl p-5 sm:p-6"
      style={{ borderColor: "#D5CFC3", backgroundColor: "#EDE8DE" }}
    >
      <h2
        className="font-black text-[#1A1A1A] mb-4 text-base"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

// ── Mode Toggle Row ────────────────────────────────────────────────────────────

function ModeRow({
  label,
  description,
  value,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  value: "draft" | "auto";
  onChange: (v: "draft" | "auto") => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b last:border-b-0" style={{ borderColor: "#D5CFC3" }}>
      <div>
        <p className="text-sm font-semibold text-[#1A1A1A]">{label}</p>
        <p className="text-xs text-[#9A9080] mt-0.5">{description}</p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1 border rounded-xl p-0.5" style={{ borderColor: "#D5CFC3", backgroundColor: "#F5F0E8" }}>
        {(["draft", "auto"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            disabled={disabled}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-40"
            style={{
              backgroundColor: value === mode ? (mode === "auto" ? "#D4FF00" : "#1A1A1A") : "transparent",
              color: value === mode ? (mode === "auto" ? "#1A1A1A" : "#F5F0E8") : "#9A9080",
            }}
          >
            {mode === "draft" ? "Draft" : "Auto"}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Settings Page ─────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  // Saving states per section
  const [savingMode, setSavingMode] = useState(false);
  const [savingEngagement, setSavingEngagement] = useState(false);
  const [savingObjective, setSavingObjective] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Confirm dialogs
  const [showAutoConfirm, setShowAutoConfirm] = useState<string | null>(null); // field name
  const [pendingAutoValue, setPendingAutoValue] = useState<string | null>(null);

  // Delete account
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteZone, setShowDeleteZone] = useState(false);

  useEffect(() => {
    fetch("/api/onboarding/save")
      .then((r) => r.json())
      .then((json) => {
        if (json.account) {
          const a = json.account;
          setAccount({
            instagram_handle:  a.instagram_handle ?? null,
            profile_pic_url:   a.profile_pic_url ?? null,
            follower_count:    a.follower_count ?? null,
            token_expires_at:  a.token_expires_at ?? null,
            agent_mode:        a.agent_mode ?? "draft",
            comment_mode:      a.comment_mode ?? "draft",
            dm_mode:           a.dm_mode ?? "draft",
            story_mode:        a.story_mode ?? "draft",
            engagement_level:  a.engagement_level ?? "smart_select",
            primary_objective: a.primary_objective ?? null,
            personality_profile: a.personality_profile ?? null,
            personality_prompt:  a.personality_prompt ?? null,
            account_type:      a.account_type ?? "brand",
          });
          setProducts(
            (a.products ?? []).map((p: Record<string, string>) => ({
              id:          p.id,
              name:        p.name ?? "",
              description: p.description ?? "",
              price_range: p.price_range ?? "",
              url:         p.url ?? "",
            }))
          );
          setAssets(
            (a.account_assets ?? []).map((x: Record<string, string>) => ({
              id:            x.id,
              label:         x.label ?? "",
              url:           x.url ?? "",
              when_to_share: x.when_to_share ?? "",
            }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function flash(msg: string) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(null), 3000);
  }

  // Agent mode field change with auto-confirm dialog
  function requestModeChange(field: string, value: "draft" | "auto") {
    if (value === "auto") {
      setShowAutoConfirm(field);
      setPendingAutoValue(value);
    } else {
      applyModeChange(field, value);
    }
  }

  function applyModeChange(field: string, value: string) {
    if (field === "agent_mode") {
      // Master mode cascades to all per-type modes
      const v = value as "draft" | "auto";
      setAccount((a) =>
        a
          ? { ...a, agent_mode: v, comment_mode: v, dm_mode: v, story_mode: v }
          : a
      );
    } else {
      setAccount((a) => a ? { ...a, [field]: value } as AccountData : a);
    }
    setShowAutoConfirm(null);
    setPendingAutoValue(null);
  }

  async function saveAgentMode() {
    if (!account) return;
    setSavingMode(true);
    try {
      await fetch("/api/settings/agent-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_mode:   account.agent_mode,
          comment_mode: account.comment_mode,
          dm_mode:      account.dm_mode,
          story_mode:   account.story_mode,
        }),
      });
      flash("Agent mode saved");
      window.dispatchEvent(new Event("wasp:interaction-update"));
    } finally {
      setSavingMode(false);
    }
  }

  async function saveEngagementLevel() {
    if (!account) return;
    setSavingEngagement(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engagement_level: account.engagement_level }),
      });
      flash("Engagement level saved");
    } finally {
      setSavingEngagement(false);
    }
  }

  async function saveObjective() {
    if (!account) return;
    setSavingObjective(true);
    try {
      // Re-use settings endpoint (or onboarding/save step 4 is too complex here)
      // We'll just update primary_objective via a dedicated PATCH-style POST
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primary_objective: account.primary_objective }),
      });
      flash("Objective saved");
    } finally {
      setSavingObjective(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "DELETE") return;
    setDeleting(true);
    try {
      const r = await fetch("/api/account/delete", { method: "POST" });
      if (r.ok) {
        window.location.href = "/signed-out?deleted=true";
      }
    } finally {
      setDeleting(false);
    }
  }

  function tokenStatus(expiresAt: string | null): {
    label: string;
    color: string;
    bg: string;
  } {
    if (!expiresAt)
      return { label: "Valid", color: "#2D5A00", bg: "#D4FF00" };
    const diff =
      new Date(expiresAt).getTime() - Date.now();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days < 0)
      return { label: "Expired", color: "#8B1A1A", bg: "#FFD5D5" };
    if (days < 7)
      return { label: "Expiring soon", color: "#7B4F00", bg: "#FFE8B0" };
    return { label: "Valid", color: "#2D5A00", bg: "#D4FF00" };
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">

        {/* Saved toast */}
        {savedMsg && (
          <div
            className="fixed bottom-6 right-6 z-50 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg"
            style={{ backgroundColor: "#D4FF00", color: "#1A1A1A" }}
          >
            ✓ {savedMsg}
          </div>
        )}

        {/* Auto Mode confirmation */}
        {showAutoConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div
              className="w-full max-w-sm border rounded-2xl p-6 shadow-2xl"
              style={{ backgroundColor: "#EDE8DE", borderColor: "#D5CFC3" }}
            >
              <p
                className="font-black text-[#1A1A1A] text-lg mb-2"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                Enable Auto Mode?
              </p>
              <p className="text-sm text-[#6B6058] mb-5">
                WASP will respond automatically without your approval for this
                interaction type. You can switch back anytime.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    applyModeChange(showAutoConfirm, pendingAutoValue!)
                  }
                  className="flex-1 bg-[#1A1A1A] text-[#D4FF00] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#5C6B00] transition-colors"
                >
                  Enable Auto
                </button>
                <button
                  onClick={() => {
                    setShowAutoConfirm(null);
                    setPendingAutoValue(null);
                  }}
                  className="flex-1 border font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#D5CFC3] transition-colors"
                  style={{ borderColor: "#D5CFC3", color: "#6B6058" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <h1
          className="text-xl font-black text-[#1A1A1A] mb-1"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Settings
        </h1>
        <p className="text-xs text-[#9A9080] mb-6">
          Control how WASP behaves on your account.
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-[#D5CFC3] border-t-[#5C6B00] animate-spin" />
          </div>
        ) : account ? (
          <div className="flex flex-col gap-5">

            {/* ── 1. Agent Mode ──────────────────────────────────────────────── */}
            <Section title="Agent Mode">
              <ModeRow
                label="Master mode"
                description="Sets Draft or Auto for all interaction types at once."
                value={account.agent_mode}
                onChange={(v) => requestModeChange("agent_mode", v)}
              />
              <ModeRow
                label="Comments"
                description="Override mode for comment replies specifically."
                value={account.comment_mode}
                onChange={(v) => requestModeChange("comment_mode", v)}
              />
              <ModeRow
                label="Direct Messages"
                description="Override mode for DM replies specifically."
                value={account.dm_mode}
                onChange={(v) => requestModeChange("dm_mode", v)}
              />
              <ModeRow
                label="Story Replies"
                description="Override mode for story reply responses specifically."
                value={account.story_mode}
                onChange={(v) => requestModeChange("story_mode", v)}
              />
              <button
                onClick={saveAgentMode}
                disabled={savingMode}
                className="mt-4 w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold text-sm px-5 py-3 rounded-xl hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
              >
                {savingMode ? "Saving…" : "Save agent mode"}
              </button>
            </Section>

            {/* ── 2. Comment Engagement Level ───────────────────────────────── */}
            <Section title="Comment Engagement Level">
              <p className="text-xs text-[#9A9080] mb-4">
                For DMs and story replies, WASP always responds — those are
                high-intent signals.
              </p>
              <div className="flex flex-col gap-2">
                {ENGAGEMENT_LEVELS.map((level) => {
                  const active = account.engagement_level === level.id;
                  return (
                    <button
                      key={level.id}
                      onClick={() =>
                        setAccount((a) =>
                          a ? { ...a, engagement_level: level.id } : a
                        )
                      }
                      className="flex items-start gap-3 text-left border-2 rounded-xl p-3.5 transition-all"
                      style={{
                        borderColor: active ? "#5C6B00" : "#D5CFC3",
                        backgroundColor: active ? "rgba(212,255,0,0.08)" : "#F5F0E8",
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5"
                        style={{
                          borderColor: active ? "#5C6B00" : "#D5CFC3",
                          backgroundColor: active ? "#5C6B00" : "transparent",
                        }}
                      >
                        {active && (
                          <span className="text-white text-[8px]">✓</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-[#1A1A1A]">
                            {level.label}
                          </p>
                          {level.recommended && (
                            <span className="text-[9px] bg-[#D4FF00]/40 text-[#5C6B00] font-bold px-1.5 py-0.5 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#9A9080] mt-0.5">
                          {level.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={saveEngagementLevel}
                disabled={savingEngagement}
                className="mt-4 w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold text-sm px-5 py-3 rounded-xl hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
              >
                {savingEngagement ? "Saving…" : "Save engagement level"}
              </button>
            </Section>

            {/* ── 3. Content Personality ────────────────────────────────────── */}
            <Section title="Content Personality">
              {account.personality_profile ? (
                <div className="flex flex-col gap-3">
                  {account.personality_prompt && (
                    <p className="text-sm text-[#6B6058] leading-relaxed line-clamp-4">
                      {account.personality_prompt.slice(0, 300)}
                      {account.personality_prompt.length > 300 ? "…" : ""}
                    </p>
                  )}
                  <a
                    href="/onboarding?step=2"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C6B00] hover:underline"
                  >
                    ✏️ Re-analyze or edit personality
                  </a>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-[#9A9080] mb-3">
                    No content personality set up yet.
                  </p>
                  <a
                    href="/onboarding?step=2"
                    className="text-xs font-semibold bg-[#1A1A1A] text-[#F5F0E8] px-4 py-2 rounded-xl hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors"
                  >
                    Analyze my content personality
                  </a>
                </div>
              )}
            </Section>

            {/* ── 4. Products & Links ───────────────────────────────────────── */}
            <Section title="Products & Links">
              {products.length === 0 ? (
                <p className="text-sm text-[#9A9080] mb-3">No products added.</p>
              ) : (
                <div className="flex flex-col gap-2 mb-3">
                  {products.map((p, i) => (
                    <div
                      key={p.id ?? i}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl"
                      style={{ backgroundColor: "#F5F0E8" }}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                          {p.name}
                        </p>
                        {p.price_range && (
                          <p className="text-xs text-[#9A9080]">{p.price_range}</p>
                        )}
                      </div>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#5C6B00] hover:underline flex-shrink-0"
                        >
                          Link ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <a
                href="/onboarding?step=3"
                className="text-xs font-semibold text-[#5C6B00] hover:underline"
              >
                + Manage products & links
              </a>
            </Section>

            {/* ── 5. Engagement Goals ───────────────────────────────────────── */}
            <Section title="Engagement Goals">
              <div className="mb-4">
                <p className="text-xs font-semibold text-[#9A9080] uppercase tracking-widest mb-2">
                  Primary objective
                </p>
                <div className="flex flex-wrap gap-2">
                  {OBJECTIVES.map((obj) => {
                    const active = account.primary_objective === obj.id;
                    return (
                      <button
                        key={obj.id}
                        onClick={() =>
                          setAccount((a) =>
                            a ? { ...a, primary_objective: obj.id } : a
                          )
                        }
                        className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
                        style={{
                          backgroundColor: active ? "#D4FF00" : "transparent",
                          borderColor: active ? "#5C6B00" : "#D5CFC3",
                          color: active ? "#1A1A1A" : "#6B6058",
                        }}
                      >
                        {obj.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {assets.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-[#9A9080] uppercase tracking-widest mb-2">
                    Available assets
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {assets.map((a, i) => (
                      <div
                        key={a.id ?? i}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                        style={{ backgroundColor: "#F5F0E8" }}
                      >
                        <span className="text-[#1A1A1A] font-medium truncate flex-1">
                          {a.label}
                        </span>
                        {a.url && (
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#5C6B00] hover:underline flex-shrink-0"
                          >
                            ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={saveObjective}
                disabled={savingObjective}
                className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold text-sm px-5 py-3 rounded-xl hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40 mb-2"
              >
                {savingObjective ? "Saving…" : "Save objective"}
              </button>
              <a
                href="/onboarding?step=4"
                className="block text-center text-xs font-semibold text-[#5C6B00] hover:underline"
              >
                + Manage assets & goals
              </a>
            </Section>

            {/* ── 6. Connected Account ──────────────────────────────────────── */}
            <Section title="Connected Account">
              {account.instagram_handle ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {account.profile_pic_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={account.profile_pic_url}
                        alt={account.instagram_handle}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: "#D5CFC3", color: "#6B6058" }}
                      >
                        {account.instagram_handle[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-[#1A1A1A]">
                        @{account.instagram_handle}
                      </p>
                      {account.follower_count !== null && (
                        <p className="text-xs text-[#9A9080]">
                          {account.follower_count.toLocaleString()} followers
                        </p>
                      )}
                      {/* Token status */}
                      {(() => {
                        const ts = tokenStatus(account.token_expires_at);
                        return (
                          <span
                            className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: ts.bg, color: ts.color }}
                          >
                            Token: {ts.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  {tokenStatus(account.token_expires_at).label === "Expired" && (
                    <a
                      href="/api/instagram/connect"
                      className="text-xs font-semibold bg-[#FFD5D5] text-[#8B1A1A] px-3 py-2 rounded-xl hover:opacity-80 transition-opacity"
                    >
                      Reconnect
                    </a>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-[#9A9080] mb-3">
                    No Instagram account connected.
                  </p>
                  <a
                    href="/onboarding?step=1"
                    className="text-xs font-semibold bg-[#1A1A1A] text-[#F5F0E8] px-4 py-2 rounded-xl hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors"
                  >
                    Connect Instagram
                  </a>
                </div>
              )}
            </Section>

            {/* ── 7. Account ────────────────────────────────────────────────── */}
            <Section title="Account">
              <div
                className="flex items-center justify-between py-2 border-b"
                style={{ borderColor: "#D5CFC3" }}
              >
                <p className="text-sm text-[#6B6058]">Plan</p>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "#D4FF00", color: "#1A1A1A" }}
                >
                  Free tier
                </span>
              </div>

              {/* Danger zone */}
              <div className="mt-5">
                <button
                  onClick={() => setShowDeleteZone((v) => !v)}
                  className="text-xs font-semibold text-[#8B1A1A] hover:underline"
                >
                  {showDeleteZone ? "Hide" : "Delete account"} ↓
                </button>

                {showDeleteZone && (
                  <div
                    className="mt-4 border-2 border-dashed rounded-xl p-4"
                    style={{ borderColor: "#FFD5D5", backgroundColor: "#FFF5F5" }}
                  >
                    <p className="text-sm font-semibold text-[#8B1A1A] mb-1">
                      Danger Zone
                    </p>
                    <p className="text-xs text-[#9A9080] mb-3">
                      This will permanently delete your account and all associated
                      data. Type{" "}
                      <strong className="font-mono text-[#8B1A1A]">DELETE</strong>{" "}
                      to confirm.
                    </p>
                    <input
                      type="text"
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      placeholder="Type DELETE to confirm"
                      className="w-full text-sm border rounded-lg px-3 py-2 mb-3 outline-none"
                      style={{
                        borderColor: "#FFD5D5",
                        backgroundColor: "#FFF5F5",
                        color: "#1A1A1A",
                      }}
                    />
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteInput !== "DELETE" || deleting}
                      className="w-full bg-[#8B1A1A] text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:opacity-80 transition-opacity disabled:opacity-30"
                    >
                      {deleting ? "Deleting…" : "Delete my account"}
                    </button>
                  </div>
                )}
              </div>
            </Section>

          </div>
        ) : (
          <p className="text-sm text-[#9A9080] text-center py-10">
            Could not load account data.
          </p>
        )}
      </div>
    </DashboardShell>
  );
}
