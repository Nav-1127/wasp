"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";

// ── Types ──────────────────────────────────────────────────────────────────────

interface StingTrigger {
  id: string;
  name: string;
  trigger_type: "keyword" | "smart_intent";
  trigger_keywords: string[] | null;
  trigger_description: string | null;
  comment_reply: string;
  dm_message: string;
  dm_link: string | null;
  applies_to: "all_posts" | "specific_posts";
  is_active: boolean;
  times_triggered: number;
  created_at: string;
}

type FormData = Omit<StingTrigger, "id" | "times_triggered" | "created_at">;

const EMPTY_FORM: FormData = {
  name:                "",
  trigger_type:        "keyword",
  trigger_keywords:    [],
  trigger_description: "",
  comment_reply:       "",
  dm_message:          "",
  dm_link:             "",
  applies_to:          "all_posts",
  is_active:           true,
};

// ── Main page ──────────────────────────────────────────────────────────────────

function StingTriggersContent() {
  const searchParams    = useSearchParams();
  const openNew         = searchParams.get("new") === "true";

  const [triggers, setTriggers]         = useState<StingTrigger[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [form, setForm]                 = useState<FormData>(EMPTY_FORM);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");
  // Email not available in client — passed via DashboardShell default
  const [email, setEmail]               = useState("");

  const loadTriggers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/sting-triggers");
      const json = await res.json();
      setTriggers(json.triggers ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTriggers();
    // Get email for shell
    fetch("/api/onboarding/save")
      .then((r) => r.json())
      .catch(() => null);
  }, [loadTriggers]);

  // Auto-open form when arriving from onboarding
  useEffect(() => {
    if (openNew) {
      setShowForm(true);
      setEditingId(null);
      setForm(EMPTY_FORM);
      setKeywordsInput("");
    }
  }, [openNew]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setKeywordsInput("");
    setError("");
    setShowForm(true);
  }

  function openEdit(trigger: StingTrigger) {
    setEditingId(trigger.id);
    setForm({
      name:                trigger.name,
      trigger_type:        trigger.trigger_type,
      trigger_keywords:    trigger.trigger_keywords ?? [],
      trigger_description: trigger.trigger_description ?? "",
      comment_reply:       trigger.comment_reply,
      dm_message:          trigger.dm_message,
      dm_link:             trigger.dm_link ?? "",
      applies_to:          trigger.applies_to,
      is_active:           trigger.is_active,
    });
    setKeywordsInput((trigger.trigger_keywords ?? []).join(", "));
    setError("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setError("");
  }

  async function handleSave() {
    if (!form.name.trim())          { setError("Give this trigger a name."); return; }
    if (!form.comment_reply.trim()) { setError("Add a public comment reply."); return; }
    if (!form.dm_message.trim())    { setError("Add the DM message."); return; }
    if (form.trigger_type === "keyword" && !keywordsInput.trim()) {
      setError("Add at least one keyword."); return;
    }

    setSaving(true);
    setError("");

    const keywords = keywordsInput
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const payload = { ...form, trigger_keywords: keywords };

    try {
      if (editingId) {
        await fetch(`/api/sting-triggers/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/sting-triggers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      await loadTriggers();
      cancelForm();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(trigger: StingTrigger) {
    await fetch(`/api/sting-triggers/${trigger.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !trigger.is_active }),
    });
    setTriggers((prev) =>
      prev.map((t) =>
        t.id === trigger.id ? { ...t, is_active: !t.is_active } : t
      )
    );
  }

  async function deleteTrigger(id: string) {
    if (!confirm("Delete this Sting Trigger? This cannot be undone.")) return;
    await fetch(`/api/sting-triggers/${id}`, { method: "DELETE" });
    setTriggers((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-black text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              ⚡ Sting Triggers
            </h1>
            <p className="text-sm text-[#6B6058] mt-1">
              When someone comments with a keyword or intent, WASP replies publicly and sends them a DM simultaneously.
            </p>
          </div>
          {!showForm && (
            <button
              onClick={openCreate}
              className="flex-shrink-0 text-xs font-semibold bg-[#1A1A1A] text-[#F5F0E8] px-4 py-2.5 rounded-xl hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors"
            >
              + New trigger
            </button>
          )}
        </div>

        {/* ── Create / Edit form ─────────────────────────────────────────────── */}
        {showForm && (
          <div
            className="border-2 border-[#5C6B00] bg-[#EDE8DE] rounded-2xl p-6 mb-8"
          >
            <h2
              className="text-base font-black text-[#1A1A1A] mb-6"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              {editingId ? "Edit trigger" : "New Sting Trigger"}
            </h2>

            <div className="flex flex-col gap-5">

              {/* Name */}
              <Field label="Trigger name">
                <input
                  type="text"
                  placeholder='e.g. "Free Guide Link"'
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={INPUT_CLS}
                />
              </Field>

              {/* Trigger type toggle */}
              <Field label="Trigger type">
                <div className="flex gap-2">
                  {(["keyword", "smart_intent"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, trigger_type: t })}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-colors"
                      style={{
                        borderColor: form.trigger_type === t ? "#5C6B00" : "#D5CFC3",
                        backgroundColor: form.trigger_type === t ? "rgba(212,255,0,0.12)" : "#F5F0E8",
                        color: form.trigger_type === t ? "#1A1A1A" : "#6B6058",
                      }}
                    >
                      {t === "keyword" ? "Keyword match" : "Smart intent"}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Keywords or intent description */}
              {form.trigger_type === "keyword" ? (
                <Field
                  label="Keywords"
                  hint="Comma-separated. Case-insensitive. e.g. link, guide, send, info"
                >
                  <input
                    type="text"
                    placeholder="link, guide, send, info"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    className={INPUT_CLS}
                  />
                </Field>
              ) : (
                <Field
                  label="Describe the intent to detect"
                  hint="WASP uses AI to match this. Be specific."
                >
                  <textarea
                    rows={2}
                    placeholder='e.g. "Someone asking for a link, wanting more info, or requesting pricing"'
                    value={form.trigger_description ?? ""}
                    onChange={(e) => setForm({ ...form, trigger_description: e.target.value })}
                    className={INPUT_CLS + " resize-none"}
                  />
                </Field>
              )}

              {/* Comment reply */}
              <Field
                label="Public comment reply"
                hint="This is posted on the comment, visible to everyone."
              >
                <input
                  type="text"
                  placeholder="Just sent it to your DMs! 📩"
                  value={form.comment_reply}
                  onChange={(e) => setForm({ ...form, comment_reply: e.target.value })}
                  className={INPUT_CLS}
                />
              </Field>

              {/* DM message */}
              <Field
                label="DM message"
                hint="This is sent privately to the commenter."
              >
                <textarea
                  rows={3}
                  placeholder="Hey! Here's the link you asked for…"
                  value={form.dm_message}
                  onChange={(e) => setForm({ ...form, dm_message: e.target.value })}
                  className={INPUT_CLS + " resize-none"}
                />
              </Field>

              {/* DM link */}
              <Field label="DM link (optional)" hint="A URL to include in the DM.">
                <input
                  type="url"
                  placeholder="https://yoursite.com/guide"
                  value={form.dm_link ?? ""}
                  onChange={(e) => setForm({ ...form, dm_link: e.target.value })}
                  className={INPUT_CLS}
                />
              </Field>

              {/* Applies to */}
              <Field label="Apply to">
                <div className="flex gap-2">
                  {(["all_posts", "specific_posts"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setForm({ ...form, applies_to: opt })}
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-colors"
                      style={{
                        borderColor: form.applies_to === opt ? "#5C6B00" : "#D5CFC3",
                        backgroundColor: form.applies_to === opt ? "rgba(212,255,0,0.12)" : "#F5F0E8",
                        color: form.applies_to === opt ? "#1A1A1A" : "#6B6058",
                      }}
                    >
                      {opt === "all_posts" ? "All posts" : "Specific posts"}
                    </button>
                  ))}
                </div>
                {form.applies_to === "specific_posts" && (
                  <p className="text-xs text-[#9A9080] mt-2">
                    Specific post selection is coming in Phase 3 when live monitoring is active.
                  </p>
                )}
              </Field>

              {/* Active toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6B6058] uppercase tracking-wider">Active</p>
                  <p className="text-xs text-[#9A9080]">Inactive triggers are saved but won&apos;t fire.</p>
                </div>
                <button
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                  style={{ backgroundColor: form.is_active ? "#5C6B00" : "#D5CFC3" }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                    style={{ transform: form.is_active ? "translateX(22px)" : "translateX(2px)" }}
                  />
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-[#1A1A1A] text-[#F5F0E8] font-bold px-5 py-3 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
                >
                  {saving ? "Saving…" : editingId ? "Save changes" : "Create trigger"}
                </button>
                <button
                  onClick={cancelForm}
                  className="px-5 py-3 rounded-xl text-sm text-[#6B6058] border border-[#D5CFC3] hover:border-[#5C6B00] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Trigger list ───────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-[#D5CFC3] border-t-[#5C6B00] animate-spin" />
          </div>
        ) : triggers.length === 0 ? (
          <div className="border-2 border-dashed border-[#D5CFC3] rounded-2xl p-12 text-center">
            <p className="text-4xl mb-3">⚡</p>
            <p className="font-bold text-[#1A1A1A] mb-1">No Sting Triggers yet</p>
            <p className="text-sm text-[#6B6058] mb-6">
              Create your first trigger to start auto-DMing people who ask for links.
            </p>
            <button
              onClick={openCreate}
              className="text-sm font-semibold bg-[#1A1A1A] text-[#F5F0E8] px-6 py-3 rounded-xl hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors"
            >
              Create my first trigger
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {triggers.map((trigger) => (
              <div
                key={trigger.id}
                className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl p-5"
                style={{ opacity: trigger.is_active ? 1 : 0.6 }}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-[#1A1A1A]">{trigger.name}</p>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: trigger.trigger_type === "keyword" ? "#EDE8DE" : "rgba(212,255,0,0.2)",
                        color: "#5C6B00",
                        border: "1px solid #D5CFC3",
                      }}
                    >
                      {trigger.trigger_type === "keyword" ? "Keyword" : "Smart intent"}
                    </span>
                    {!trigger.is_active && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D5CFC3] text-[#9A9080]">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Active toggle */}
                    <button
                      onClick={() => toggleActive(trigger)}
                      title={trigger.is_active ? "Deactivate" : "Activate"}
                      className="relative w-9 h-5 rounded-full transition-colors"
                      style={{ backgroundColor: trigger.is_active ? "#5C6B00" : "#D5CFC3" }}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                        style={{ transform: trigger.is_active ? "translateX(18px)" : "translateX(2px)" }}
                      />
                    </button>
                    <button
                      onClick={() => openEdit(trigger)}
                      className="text-xs text-[#6B6058] hover:text-[#5C6B00] transition-colors px-2 py-1 rounded-lg hover:bg-[#F5F0E8]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTrigger(trigger.id)}
                      className="text-xs text-[#9A9080] hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-[#F5F0E8]"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Trigger details */}
                {trigger.trigger_type === "keyword" && trigger.trigger_keywords && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {trigger.trigger_keywords.map((kw) => (
                      <span
                        key={kw}
                        className="text-[11px] bg-[#F5F0E8] border border-[#D5CFC3] text-[#6B6058] px-2 py-0.5 rounded-lg"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                )}
                {trigger.trigger_type === "smart_intent" && trigger.trigger_description && (
                  <p className="text-xs text-[#6B6058] mb-3 italic">&ldquo;{trigger.trigger_description}&rdquo;</p>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-[#F5F0E8] rounded-xl p-3">
                    <p className="text-[10px] text-[#9A9080] uppercase tracking-wider mb-1">Comment reply</p>
                    <p className="text-xs text-[#1A1A1A]">{trigger.comment_reply}</p>
                  </div>
                  <div className="bg-[#F5F0E8] rounded-xl p-3">
                    <p className="text-[10px] text-[#9A9080] uppercase tracking-wider mb-1">DM message</p>
                    <p className="text-xs text-[#1A1A1A]">{trigger.dm_message}</p>
                    {trigger.dm_link && (
                      <p className="text-[11px] text-[#5C6B00] mt-1 truncate">🔗 {trigger.dm_link}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-[#9A9080]">
                    Applies to: <span className="font-medium">{trigger.applies_to === "all_posts" ? "All posts" : "Specific posts"}</span>
                  </p>
                  <p className="text-xs text-[#9A9080]">
                    Fired <span className="font-bold text-[#5C6B00]">{trigger.times_triggered}</span> times
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const INPUT_CLS =
  "w-full bg-[#F5F0E8] border border-[#D5CFC3] rounded-xl px-4 py-3 text-[#1A1A1A] placeholder-[#9A9080] text-sm focus:outline-none focus:border-[#5C6B00] transition-colors";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#6B6058] mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[#9A9080] mt-1">{hint}</p>}
    </div>
  );
}

// ── Export ─────────────────────────────────────────────────────────────────────

export default function StingTriggersPage() {
  return (
    <Suspense>
      <StingTriggersContent />
    </Suspense>
  );
}
