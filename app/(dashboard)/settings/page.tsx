"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/dashboard-shell";

// ── Types ──────────────────────────────────────────────────────────────────────

interface CategorySetting {
  respond: boolean;
  routing: "public" | "both";
}

type CategorySettings = Record<string, CategorySetting>;

interface AccountData {
  instagram_handle: string | null;
  profile_pic_url: string | null;
  follower_count: number | null;
  token_expires_at: string | null;
  agent_mode: "draft" | "auto";
  comment_mode: "draft" | "auto";
  dm_mode: "draft" | "auto";
  story_mode: "draft" | "auto";
  primary_objective: string | null;
  personality_profile: Record<string, unknown> | null;
  personality_prompt: string | null;
  account_type: string;
  category_settings: CategorySettings;
  auto_reply_sensitive: boolean;
  reply_delay_mode: "off" | "short" | "medium" | "custom";
  reply_delay_min_seconds: number;
  reply_delay_max_seconds: number;
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

const CATEGORY_META: Record<string, { label: string; description: string }> = {
  customer_support:    { label: "Customer Support",     description: "Complaints, order issues, shipping problems, requests for help." },
  purchase_intent:     { label: "Purchase Intent",      description: "Pricing questions, 'where to buy', product availability." },
  discount_promo:      { label: "Discount & Promo",     description: "Promo code requests, discount asks, special offer queries." },
  compliment:          { label: "Compliments",          description: "Praise, positive reactions, enthusiasm." },
  meaningful_feedback: { label: "Meaningful Feedback",  description: "Suggestions, constructive criticism, thoughtful opinions." },
  spam_noise:          { label: "Spam & Noise",         description: "Emojis-only, gibberish, follow-for-follow, irrelevant tags." },
  other:               { label: "Other",                description: "Everything that doesn't fit the above categories." },
};

const DEFAULT_CATEGORY_SETTINGS: Record<string, CategorySetting> = {
  customer_support:    { respond: true,  routing: "both" },
  purchase_intent:     { respond: true,  routing: "public" },
  discount_promo:      { respond: true,  routing: "both" },
  compliment:          { respond: true,  routing: "public" },
  meaningful_feedback: { respond: true,  routing: "public" },
  spam_noise:          { respond: false, routing: "public" },
  other:               { respond: false, routing: "public" },
};

const CATEGORY_ORDER = [
  "customer_support", "purchase_intent", "discount_promo",
  "compliment", "meaningful_feedback", "spam_noise", "other",
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

// ── Toggle Row ────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  value,
  onChange,
  disabled,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-3 border-b last:border-b-0"
      style={{ borderColor: "#D5CFC3" }}
    >
      <div>
        <p className="text-sm font-semibold text-[#1A1A1A]">{label}</p>
        <p className="text-xs text-[#9A9080] mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        disabled={disabled}
        className="relative flex-shrink-0 w-10 h-5.5 rounded-full transition-colors disabled:opacity-40"
        style={{ backgroundColor: value ? "#5C6B00" : "#D5CFC3", height: "22px", minWidth: "40px" }}
      >
        <span
          className="absolute top-0.5 rounded-full bg-white shadow transition-transform"
          style={{
            width: "18px",
            height: "18px",
            transform: value ? "translateX(20px)" : "translateX(2px)",
          }}
        />
      </button>
    </div>
  );
}

// ── Category Row ──────────────────────────────────────────────────────────────

function CategoryRow({
  category,
  setting,
  onChange,
  onDisableAttempt,
}: {
  category: string;
  setting: CategorySetting;
  onChange: (updated: CategorySetting) => void;
  onDisableAttempt?: () => void;
}) {
  const meta = CATEGORY_META[category];
  if (!meta) return null;

  function handleRespondToggle(next: boolean) {
    if (!next && onDisableAttempt) {
      onDisableAttempt();
      return;
    }
    onChange({ ...setting, respond: next });
  }

  return (
    <div className="flex flex-col gap-2 py-3.5 border-b last:border-b-0" style={{ borderColor: "#D5CFC3" }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1A1A1A]">{meta.label}</p>
          <p className="text-xs text-[#9A9080] mt-0.5">{meta.description}</p>
        </div>
        <button
          role="switch"
          aria-checked={setting.respond}
          onClick={() => handleRespondToggle(!setting.respond)}
          className="relative flex-shrink-0 rounded-full transition-colors"
          style={{
            backgroundColor: setting.respond ? "#5C6B00" : "#D5CFC3",
            height: "22px",
            width: "40px",
            minWidth: "40px",
          }}
        >
          <span
            className="absolute top-0.5 rounded-full bg-white shadow transition-transform"
            style={{
              width: "18px",
              height: "18px",
              transform: setting.respond ? "translateX(20px)" : "translateX(2px)",
            }}
          />
        </button>
      </div>

      {setting.respond && (
        <div className="flex items-center gap-3 pt-0.5">
          <p className="text-xs text-[#9A9080]">Reply via:</p>
          <div className="flex items-center gap-0.5 border rounded-xl p-0.5" style={{ borderColor: "#D5CFC3", backgroundColor: "#F5F0E8" }}>
            {(["public", "both"] as const).map((r) => (
              <button
                key={r}
                onClick={() => onChange({ ...setting, routing: r })}
                className="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
                style={{
                  backgroundColor: setting.routing === r ? "#1A1A1A" : "transparent",
                  color: setting.routing === r ? "#F5F0E8" : "#9A9080",
                }}
              >
                {r === "public" ? "Comment" : "Comment + DM"}
              </button>
            ))}
          </div>
        </div>
      )}
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
  const [savingDelay, setSavingDelay] = useState(false);
  const [savingCategories, setSavingCategories] = useState(false);
  const [savingObjective, setSavingObjective] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Confirm dialogs
  const [showAutoConfirm, setShowAutoConfirm] = useState<string | null>(null); // field name
  const [pendingAutoValue, setPendingAutoValue] = useState<string | null>(null);
  const [showCsWarning, setShowCsWarning] = useState(false);

  // Delete account
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteZone, setShowDeleteZone] = useState(false);

  // Disconnect Instagram
  const [disconnecting, setDisconnecting] = useState(false);

  async function handleDisconnect() {
    if (!confirm("Disconnect Instagram? WASP will stop processing comments and DMs.")) return;
    setDisconnecting(true);
    try {
      await fetch("/api/instagram/disconnect", { method: "POST" });
      setAccount((a) => a ? { ...a, instagram_handle: null, profile_pic_url: null, follower_count: null, token_expires_at: null } : a);
      flash("Instagram disconnected");
    } finally {
      setDisconnecting(false);
    }
  }

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
            primary_objective: a.primary_objective ?? null,
            personality_profile: a.personality_profile ?? null,
            personality_prompt:  a.personality_prompt ?? null,
            account_type:      a.account_type ?? "brand",
            category_settings: a.category_settings && typeof a.category_settings === "object"
              ? { ...DEFAULT_CATEGORY_SETTINGS, ...a.category_settings }
              : { ...DEFAULT_CATEGORY_SETTINGS },
            auto_reply_sensitive: a.auto_reply_sensitive === true,
            reply_delay_mode: (["off", "short", "medium", "custom"].includes(a.reply_delay_mode) ? a.reply_delay_mode : "short") as AccountData["reply_delay_mode"],
            reply_delay_min_seconds: typeof a.reply_delay_min_seconds === "number" ? a.reply_delay_min_seconds : 30,
            reply_delay_max_seconds: typeof a.reply_delay_max_seconds === "number" ? a.reply_delay_max_seconds : 120,
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

  async function saveDelay() {
    if (!account) return;
    setSavingDelay(true);
    try {
      await fetch("/api/settings/agent-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reply_delay_mode:        account.reply_delay_mode,
          reply_delay_min_seconds: account.reply_delay_min_seconds,
          reply_delay_max_seconds: account.reply_delay_max_seconds,
        }),
      });
      flash("Reply delay saved");
    } finally {
      setSavingDelay(false);
    }
  }

  async function saveCategorySettings() {
    if (!account) return;
    setSavingCategories(true);
    try {
      await fetch("/api/settings/agent-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_settings: account.category_settings,
          auto_reply_sensitive: account.auto_reply_sensitive,
        }),
      });
      flash("Settings saved");
    } finally {
      setSavingCategories(false);
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

        {/* Customer Support disable warning */}
        {showCsWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div
              className="w-full max-w-sm border rounded-2xl p-6 shadow-2xl"
              style={{ backgroundColor: "#EDE8DE", borderColor: "#D5CFC3" }}
            >
              <p
                className="font-black text-[#1A1A1A] text-lg mb-2"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                Disable Customer Support replies?
              </p>
              <p className="text-sm text-[#6B6058] mb-5">
                WASP won&apos;t respond to complaints, order issues, or help requests. Customers who need support will go unanswered. You can re-enable this anytime.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setAccount((a) =>
                      a
                        ? {
                            ...a,
                            category_settings: {
                              ...a.category_settings,
                              customer_support: { ...a.category_settings.customer_support, respond: false },
                            },
                          }
                        : a
                    );
                    setShowCsWarning(false);
                  }}
                  className="flex-1 bg-[#8B1A1A] text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:opacity-80 transition-opacity"
                >
                  Disable anyway
                </button>
                <button
                  onClick={() => setShowCsWarning(false)}
                  className="flex-1 border font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#D5CFC3] transition-colors"
                  style={{ borderColor: "#D5CFC3", color: "#6B6058" }}
                >
                  Keep enabled
                </button>
              </div>
            </div>
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

            {/* ── 2. Reply Delay ────────────────────────────────────────────── */}
            <Section title="Reply Delay">
              <p className="text-xs text-[#9A9080] mb-4">
                Add a natural pause before WASP sends replies. Instant responses are a clear bot signal — a short delay costs nothing in engagement but dramatically reduces that perception. Applies to all comments and DMs.
              </p>
              <div className="flex flex-col gap-3">
                {(["off", "short", "medium", "custom"] as const).map((opt) => {
                  const labels: Record<string, { label: string; desc: string }> = {
                    off:    { label: "Off",    desc: "Send immediately" },
                    short:  { label: "Short",  desc: "30 sec – 2 min, randomised (recommended)" },
                    medium: { label: "Medium", desc: "2 – 5 min, randomised" },
                    custom: { label: "Custom", desc: "Set your own range" },
                  };
                  const { label, desc } = labels[opt];
                  return (
                    <label key={opt} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="reply_delay_mode"
                        value={opt}
                        checked={account.reply_delay_mode === opt}
                        onChange={() => setAccount((a) => a ? { ...a, reply_delay_mode: opt } : a)}
                        className="mt-0.5 accent-[#5C6B00]"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A1A]">{label}</p>
                        <p className="text-xs text-[#9A9080]">{desc}</p>
                      </div>
                    </label>
                  );
                })}
                {account.reply_delay_mode === "custom" && (
                  <div className="flex gap-4 mt-1 ml-6">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-[#6B6058]">Min (seconds)</span>
                      <input
                        type="number"
                        min={0}
                        max={600}
                        value={account.reply_delay_min_seconds}
                        onChange={(e) =>
                          setAccount((a) => a ? { ...a, reply_delay_min_seconds: parseInt(e.target.value) || 0 } : a)
                        }
                        className="w-24 px-3 py-1.5 text-sm border rounded-lg outline-none focus:border-[#5C6B00] transition-colors"
                        style={{ borderColor: "#D5CFC3", backgroundColor: "#F5F0E8", color: "#1A1A1A" }}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-[#6B6058]">Max (seconds)</span>
                      <input
                        type="number"
                        min={30}
                        max={600}
                        value={account.reply_delay_max_seconds}
                        onChange={(e) =>
                          setAccount((a) => a ? { ...a, reply_delay_max_seconds: parseInt(e.target.value) || 120 } : a)
                        }
                        className="w-24 px-3 py-1.5 text-sm border rounded-lg outline-none focus:border-[#5C6B00] transition-colors"
                        style={{ borderColor: "#D5CFC3", backgroundColor: "#F5F0E8", color: "#1A1A1A" }}
                      />
                    </label>
                  </div>
                )}
              </div>
              <button
                onClick={saveDelay}
                disabled={savingDelay}
                className="mt-4 w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold text-sm px-5 py-3 rounded-xl hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
              >
                {savingDelay ? "Saving…" : "Save reply delay"}
              </button>
            </Section>

            {/* ── 3. Comment & DM Handling ──────────────────────────────────── */}
            <Section title="Comment & DM Handling">
              <p className="text-xs text-[#9A9080] mb-1">
                WASP classifies every comment and DM into one of these categories. Toggle <strong>Respond</strong> to control whether WASP replies at all. When responding, choose between a public comment reply only, or a public acknowledgement <strong>and</strong> a DM.
              </p>
              <p className="text-xs text-[#9A9080] mb-4">
                For anything that doesn&apos;t fit neatly (a complaint buried in a compliment, an edge case the category misses), WASP runs an automatic sensitivity check and routes it to Comment + DM. These are always held for your review in auto mode unless you turn on the override at the bottom.
              </p>
              <div>
                {CATEGORY_ORDER.map((cat) => {
                  const setting = account.category_settings[cat] ?? DEFAULT_CATEGORY_SETTINGS[cat];
                  return (
                    <CategoryRow
                      key={cat}
                      category={cat}
                      setting={setting}
                      onChange={(updated) =>
                        setAccount((a) =>
                          a
                            ? {
                                ...a,
                                category_settings: { ...a.category_settings, [cat]: updated },
                              }
                            : a
                        )
                      }
                      onDisableAttempt={cat === "customer_support" ? () => setShowCsWarning(true) : undefined}
                    />
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "#D5CFC3" }}>
                <ToggleRow
                  label="Auto-send sensitive replies"
                  description="By default, WASP holds sensitivity-flagged replies for your review even in auto mode. Turn this on to let them fire automatically."
                  value={account.auto_reply_sensitive}
                  onChange={(v) =>
                    setAccount((a) => a ? { ...a, auto_reply_sensitive: v } : a)
                  }
                />
              </div>
              <button
                onClick={saveCategorySettings}
                disabled={savingCategories}
                className="mt-4 w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold text-sm px-5 py-3 rounded-xl hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
              >
                {savingCategories ? "Saving…" : "Save"}
              </button>
            </Section>

            {/* ── 4. Content Personality ────────────────────────────────────── */}
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

            {/* ── 5. Products & Links ───────────────────────────────────────── */}
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

            {/* ── 6. Engagement Goals ───────────────────────────────────────── */}
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

            {/* ── 7. Connected Account ──────────────────────────────────────── */}
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
                  <div className="flex flex-col gap-2 items-end">
                    {tokenStatus(account.token_expires_at).label === "Expired" && (
                      <a
                        href="/api/instagram/connect"
                        className="text-xs font-semibold bg-[#FFD5D5] text-[#8B1A1A] px-3 py-2 rounded-xl hover:opacity-80 transition-opacity"
                      >
                        Reconnect
                      </a>
                    )}
                    <button
                      onClick={handleDisconnect}
                      disabled={disconnecting}
                      className="text-xs font-semibold text-[#9A9080] hover:text-[#8B1A1A] hover:underline disabled:opacity-40 transition-colors"
                    >
                      {disconnecting ? "Disconnecting…" : "Disconnect"}
                    </button>
                  </div>
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

            {/* ── 8. Account ────────────────────────────────────────────────── */}
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
