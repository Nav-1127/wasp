"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/dashboard-shell";

// ── Types ──────────────────────────────────────────────────────────────────────

interface StingTrigger {
  id: string;
  name: string;
  trigger_keywords: string[] | null;
  comment_reply: string;
  dm_message: string;
  dm_link: string | null;
  applies_to: "all_posts" | "specific_posts";
  specific_post_ids: string[] | null;
  is_active: boolean;
  times_triggered: number;
  last_fired_at: string | null;
  created_at: string;
}

interface IGPost {
  id: string;
  caption: string | null;
  thumbnail_url: string | null;
  timestamp: string;
  media_type: string;
}

interface FormData {
  name: string;
  trigger_keywords: string[];
  comment_reply: string;
  dm_message: string;
  dm_link: string;
  applies_to: "all_posts" | "specific_posts";
  specific_post_ids: string[];
  is_active: boolean;
}

const EMPTY_FORM: FormData = {
  name: "",
  trigger_keywords: [],
  comment_reply: "",
  dm_message: "",
  dm_link: "",
  applies_to: "all_posts",
  specific_post_ids: [],
  is_active: true,
};

// ── Template library ───────────────────────────────────────────────────────────

const TEMPLATES: Array<
  Pick<FormData, "name" | "trigger_keywords" | "comment_reply" | "dm_message" | "dm_link">
  & { icon: string }
> = [
  {
    icon: "🔗",
    name: "Send the link",
    trigger_keywords: ["link", "send", "info"],
    comment_reply: "Just sent it to your DMs! 📩",
    dm_message: "Hey! Here's the link you asked for:",
    dm_link: "",
  },
  {
    icon: "🎁",
    name: "Discount code",
    trigger_keywords: ["discount", "promo", "code", "deal"],
    comment_reply: "Check your DMs for your exclusive code! 🎁",
    dm_message: "Hey! Here's your special discount code:",
    dm_link: "",
  },
  {
    icon: "📖",
    name: "Free guide",
    trigger_keywords: ["guide", "free", "download", "pdf"],
    comment_reply: "Sent you the guide! Check your DMs 📖",
    dm_message: "Hey! Here's your free guide:",
    dm_link: "",
  },
  {
    icon: "🤝",
    name: "Collab enquiry",
    trigger_keywords: ["collab", "partner", "sponsor"],
    comment_reply: "Love it! Sending details to your DMs 🤝",
    dm_message: "Hey! Thanks for your interest in working together:",
    dm_link: "",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

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

// ── Keyword tag input ──────────────────────────────────────────────────────────

function KeywordTagInput({
  keywords,
  onChange,
}: {
  keywords: string[];
  onChange: (kws: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addKeyword(raw: string) {
    const kw = raw.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) onChange([...keywords, kw]);
    setDraft("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword(draft);
    } else if (e.key === "Backspace" && draft === "" && keywords.length > 0) {
      onChange(keywords.slice(0, -1));
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val.includes(",")) {
      const parts = val.split(",");
      parts.slice(0, -1).forEach((p) => addKeyword(p));
      setDraft(parts[parts.length - 1]);
    } else {
      setDraft(val);
    }
  }

  function onBlur() {
    if (draft.trim()) addKeyword(draft);
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 items-center bg-[#F5F0E8] border border-[#D5CFC3] rounded-xl px-3 py-2.5 min-h-[46px] cursor-text focus-within:border-[#5C6B00] transition-colors"
      onClick={() => inputRef.current?.focus()}
    >
      {keywords.map((kw) => (
        <span
          key={kw}
          className="flex items-center gap-1 text-xs bg-[#EDE8DE] border border-[#D5CFC3] text-[#1A1A1A] px-2 py-0.5 rounded-lg"
        >
          {kw}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(keywords.filter((k) => k !== kw));
            }}
            className="text-[#9A9080] hover:text-red-500 leading-none ml-0.5"
          >
            ×
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        placeholder={
          keywords.length === 0 ? "Type a keyword, press Enter to add" : "Add another…"
        }
        className="flex-1 min-w-[140px] bg-transparent text-[#1A1A1A] text-sm placeholder-[#9A9080] outline-none"
      />
    </div>
  );
}

// ── Post picker modal ──────────────────────────────────────────────────────────

function PostPickerModal({
  selectedIds,
  onDone,
  onClose,
}: {
  selectedIds: string[];
  onDone: (ids: string[]) => void;
  onClose: () => void;
}) {
  const [posts, setPosts] = useState<IGPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));

  useEffect(() => {
    fetch("/api/instagram/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter((p) => {
    if (!search.trim()) return true;
    return p.caption?.toLowerCase().includes(search.toLowerCase());
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-[#F5F0E8] rounded-2xl w-full max-w-lg max-h-[82vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#D5CFC3]">
          <h3
            className="font-black text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Select posts
          </h3>
          <button
            onClick={onClose}
            className="text-[#9A9080] hover:text-[#1A1A1A] text-2xl leading-none w-7 h-7 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-[#D5CFC3]">
          <input
            type="text"
            placeholder="Search by caption…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#D5CFC3] rounded-xl px-4 py-2.5 text-sm text-[#1A1A1A] placeholder-[#9A9080] focus:outline-none focus:border-[#5C6B00] transition-colors"
          />
        </div>

        {/* Post grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="w-5 h-5 rounded-full border-2 border-[#D5CFC3] border-t-[#5C6B00] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[#9A9080] text-center py-12">
              {search ? "No posts match that search." : "No posts found."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filtered.map((post) => {
                const isSelected = selected.has(post.id);
                return (
                  <button
                    key={post.id}
                    onClick={() => toggle(post.id)}
                    className="relative aspect-square rounded-xl overflow-hidden border-2 transition-all focus:outline-none"
                    style={{ borderColor: isSelected ? "#5C6B00" : "transparent" }}
                  >
                    {post.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.thumbnail_url}
                        alt={post.caption ?? "Post"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#EDE8DE] flex flex-col items-center justify-center gap-1">
                        <span className="text-2xl">📷</span>
                        <p className="text-[9px] text-[#9A9080] px-2 text-center line-clamp-2 leading-tight">
                          {post.caption ?? "No caption"}
                        </p>
                      </div>
                    )}
                    {/* Caption hover overlay */}
                    {post.thumbnail_url && (
                      <div className="absolute inset-0 bg-black/55 opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                        <p className="text-[10px] text-white line-clamp-3 text-left leading-snug">
                          {post.caption ?? "No caption"}
                        </p>
                      </div>
                    )}
                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#5C6B00] flex items-center justify-center shadow">
                        <span className="text-white text-[10px] font-bold">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#D5CFC3] flex items-center justify-between">
          <p className="text-sm text-[#6B6058]">
            {selected.size === 0
              ? "No posts selected"
              : `${selected.size} post${selected.size === 1 ? "" : "s"} selected`}
          </p>
          <button
            onClick={() => onDone(Array.from(selected))}
            className="bg-[#1A1A1A] text-[#F5F0E8] font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

function StingTriggersContent() {
  const searchParams = useSearchParams();
  const openNew = searchParams.get("new") === "true";

  const [triggers, setTriggers] = useState<StingTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPostPicker, setShowPostPicker] = useState(false);

  const loadTriggers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sting-triggers");
      const json = await res.json();
      setTriggers(json.triggers ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTriggers();
  }, [loadTriggers]);

  useEffect(() => {
    if (openNew) {
      setShowForm(true);
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
  }, [openNew]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(trigger: StingTrigger) {
    setEditingId(trigger.id);
    setForm({
      name: trigger.name,
      trigger_keywords: trigger.trigger_keywords ?? [],
      comment_reply: trigger.comment_reply,
      dm_message: trigger.dm_message,
      dm_link: trigger.dm_link ?? "",
      applies_to: trigger.applies_to,
      specific_post_ids: trigger.specific_post_ids ?? [],
      is_active: trigger.is_active,
    });
    setError("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setError("");
  }

  function applyTemplate(
    t: (typeof TEMPLATES)[number]
  ) {
    setForm({
      ...EMPTY_FORM,
      name: t.name,
      trigger_keywords: t.trigger_keywords,
      comment_reply: t.comment_reply,
      dm_message: t.dm_message,
      dm_link: t.dm_link,
    });
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Give this trigger a name."); return; }
    if (!form.comment_reply.trim()) { setError("Add a public comment reply."); return; }
    if (!form.dm_message.trim()) { setError("Add the DM message."); return; }
    if (form.trigger_keywords.length === 0) { setError("Add at least one keyword."); return; }

    setSaving(true);
    setError("");

    const payload = {
      ...form,
      trigger_type: "keyword",
      dm_link: form.dm_link.trim() || null,
    };

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-black text-[#1A1A1A]"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              ⚡ Sting Triggers
            </h1>
            <p className="text-sm text-[#6B6058] mt-1 max-w-md">
              Someone comments a keyword — WASP replies publicly and sends them a DM instantly, no approval needed.
            </p>
          </div>
          {!showForm && (
            <button
              onClick={openCreate}
              className="self-start flex-shrink-0 text-xs font-semibold bg-[#1A1A1A] text-[#F5F0E8] px-4 py-2.5 rounded-xl hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors"
            >
              + New trigger
            </button>
          )}
        </div>

        {/* ── Create / Edit form ─────────────────────────────────────────────── */}
        {showForm && (
          <div className="border-2 border-[#5C6B00] bg-[#EDE8DE] rounded-2xl p-6 mb-8">
            <h2
              className="text-base font-black text-[#1A1A1A] mb-6"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              {editingId ? "Edit trigger" : "New Sting Trigger"}
            </h2>

            <div className="flex flex-col gap-5">

              {/* Template quick-start (only when creating new) */}
              {!editingId && (
                <div>
                  <p className="text-xs font-semibold text-[#9A9080] uppercase tracking-wider mb-2">
                    Quick start from a template
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => applyTemplate(t)}
                        className="flex items-center gap-2.5 p-3 rounded-xl border border-[#D5CFC3] bg-[#F5F0E8] hover:border-[#5C6B00] hover:bg-white transition-colors text-left"
                      >
                        <span className="text-xl flex-shrink-0">{t.icon}</span>
                        <div>
                          <p className="text-xs font-semibold text-[#1A1A1A]">{t.name}</p>
                          <p className="text-[10px] text-[#9A9080]">
                            {t.trigger_keywords.join(", ")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 my-5">
                    <hr className="flex-1 border-[#D5CFC3]" />
                    <span className="text-xs text-[#9A9080]">or build from scratch</span>
                    <hr className="flex-1 border-[#D5CFC3]" />
                  </div>
                </div>
              )}

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

              {/* Keywords */}
              <Field
                label="Keywords"
                hint="Any of these words in a comment fires this trigger. Press Enter or comma to add each one."
              >
                <KeywordTagInput
                  keywords={form.trigger_keywords}
                  onChange={(kws) => setForm({ ...form, trigger_keywords: kws })}
                />
              </Field>

              {/* Comment reply */}
              <Field
                label="Public comment reply"
                hint="Posted publicly on the comment, visible to everyone."
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
                hint="Sent privately to the commenter."
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
              <Field label="DM link (optional)" hint="A URL to include at the end of the DM.">
                <input
                  type="url"
                  placeholder="https://yoursite.com/guide"
                  value={form.dm_link ?? ""}
                  onChange={(e) => setForm({ ...form, dm_link: e.target.value })}
                  className={INPUT_CLS}
                />
              </Field>

              {/* Apply to */}
              <Field label="Apply to">
                <div className="flex gap-2">
                  {(["all_posts", "specific_posts"] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() =>
                        setForm({ ...form, applies_to: opt, specific_post_ids: [] })
                      }
                      className="flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-colors"
                      style={{
                        borderColor:
                          form.applies_to === opt ? "#5C6B00" : "#D5CFC3",
                        backgroundColor:
                          form.applies_to === opt
                            ? "rgba(212,255,0,0.12)"
                            : "#F5F0E8",
                        color: form.applies_to === opt ? "#1A1A1A" : "#6B6058",
                      }}
                    >
                      {opt === "all_posts" ? "All posts" : "Specific posts"}
                    </button>
                  ))}
                </div>

                {/* Post picker trigger (only when specific_posts selected) */}
                {form.applies_to === "specific_posts" && (
                  <div className="mt-3 flex items-center gap-3">
                    {form.specific_post_ids.length === 0 ? (
                      <button
                        onClick={() => setShowPostPicker(true)}
                        className="text-xs font-semibold text-[#5C6B00] border border-[#5C6B00] px-4 py-2 rounded-xl hover:bg-[#5C6B00] hover:text-white transition-colors"
                      >
                        Select posts
                      </button>
                    ) : (
                      <>
                        <span className="text-xs text-[#1A1A1A] font-semibold">
                          {form.specific_post_ids.length} post
                          {form.specific_post_ids.length === 1 ? "" : "s"} selected
                        </span>
                        <button
                          onClick={() => setShowPostPicker(true)}
                          className="text-xs text-[#5C6B00] hover:underline"
                        >
                          Edit selection
                        </button>
                        <button
                          onClick={() => setForm({ ...form, specific_post_ids: [] })}
                          className="text-xs text-[#9A9080] hover:text-red-500"
                        >
                          Clear
                        </button>
                      </>
                    )}
                  </div>
                )}
              </Field>

              {/* Active toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#6B6058] uppercase tracking-wider">
                    Active
                  </p>
                  <p className="text-xs text-[#9A9080]">
                    Inactive triggers are saved but won&apos;t fire.
                  </p>
                </div>
                <button
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                  style={{ backgroundColor: form.is_active ? "#5C6B00" : "#D5CFC3" }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                    style={{
                      transform: form.is_active
                        ? "translateX(22px)"
                        : "translateX(2px)",
                    }}
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
              Create your first trigger to start auto-DMing people who ask for links,
              codes, or anything else.
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
                {/* Top row: name + controls */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-[#1A1A1A]">{trigger.name}</p>
                    {!trigger.is_active && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#D5CFC3] text-[#9A9080]">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(trigger)}
                      title={trigger.is_active ? "Deactivate" : "Activate"}
                      className="relative w-9 h-5 rounded-full transition-colors"
                      style={{
                        backgroundColor: trigger.is_active ? "#5C6B00" : "#D5CFC3",
                      }}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform"
                        style={{
                          transform: trigger.is_active
                            ? "translateX(18px)"
                            : "translateX(2px)",
                        }}
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

                {/* Keyword pills */}
                {trigger.trigger_keywords && trigger.trigger_keywords.length > 0 && (
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

                {/* Reply + DM preview */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-[#F5F0E8] rounded-xl p-3">
                    <p className="text-[10px] text-[#9A9080] uppercase tracking-wider mb-1">
                      Comment reply
                    </p>
                    <p className="text-xs text-[#1A1A1A]">{trigger.comment_reply}</p>
                  </div>
                  <div className="bg-[#F5F0E8] rounded-xl p-3">
                    <p className="text-[10px] text-[#9A9080] uppercase tracking-wider mb-1">
                      DM message
                    </p>
                    <p className="text-xs text-[#1A1A1A]">{trigger.dm_message}</p>
                    {trigger.dm_link && (
                      <p className="text-[11px] text-[#5C6B00] mt-1 truncate">
                        🔗 {trigger.dm_link}
                      </p>
                    )}
                  </div>
                </div>

                {/* Analytics row */}
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-3">
                  <p className="text-xs text-[#9A9080]">
                    {trigger.applies_to === "all_posts"
                      ? "All posts"
                      : `${(trigger.specific_post_ids ?? []).length} specific post${
                          (trigger.specific_post_ids ?? []).length === 1 ? "" : "s"
                        }`}
                  </p>
                  <span className="text-[#D5CFC3] text-xs">·</span>
                  <p className="text-xs text-[#9A9080]">
                    Fired{" "}
                    <span className="font-bold text-[#5C6B00]">
                      {trigger.times_triggered}
                    </span>{" "}
                    time{trigger.times_triggered === 1 ? "" : "s"}
                  </p>
                  {trigger.last_fired_at && (
                    <>
                      <span className="text-[#D5CFC3] text-xs">·</span>
                      <p className="text-xs text-[#9A9080]">
                        Last fired{" "}
                        <span className="font-medium text-[#6B6058]">
                          {relativeTime(trigger.last_fired_at)}
                        </span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post picker modal */}
      {showPostPicker && (
        <PostPickerModal
          selectedIds={form.specific_post_ids}
          onDone={(ids) => {
            setForm((prev) => ({ ...prev, specific_post_ids: ids }));
            setShowPostPicker(false);
          }}
          onClose={() => setShowPostPicker(false)}
        />
      )}
    </DashboardShell>
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
