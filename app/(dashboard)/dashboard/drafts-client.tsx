"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";

const POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

// ── Types ──────────────────────────────────────────────────────────────────────

interface Interaction {
  id: string;
  instagram_username: string | null;
  instagram_user_id: string | null;
  interaction_type: "comment" | "dm" | "story_reply";
  source_post_thumbnail: string | null;
  message_text: string;
  drafted_response: string | null;
  routing_decision: "public" | "both" | null;
  sensitivity_reason: string | null;
  public_acknowledgement: string | null;
  status: string;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs === 1) return "1 hr ago";
  if (hrs < 24) return `${hrs} hrs ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  comment: { label: "Comment", color: "#5C6B00", bg: "#D4FF00" },
  dm: { label: "DM", color: "#1A4B8B", bg: "#DDEEFF" },
  story_reply: { label: "Story Reply", color: "#7B3F00", bg: "#FFE8CC" },
};

const ROUTING_LABELS: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  public: { label: "Public reply", icon: "💬", color: "#4A5500", bg: "#F0FFB0" },
  both:   { label: "Public + DM",  icon: "📩", color: "#5A2E00", bg: "#FFE0CC" },
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function DraftsClient({
  userId,
  initialInteractions,
}: {
  userId: string;
  initialInteractions: Interaction[];
}) {
  const [items, setItems] = useState<Interaction[]>(initialInteractions);
  const [editTexts, setEditTexts] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showApproveAll, setShowApproveAll] = useState(false);
  const [approvingAll, setApprovingAll] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [polling, setPolling] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const pollingRef = useRef(false); // ref so runPoll stays stable for the interval

  // Tick "time ago" every 30s
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  void now; // referenced above in timeAgo via Date.now()

  // Supabase realtime subscription
  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`drafts-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as Interaction;
          if (row.status !== "pending") return;
          setItems((prev) => {
            if (prev.find((i) => i.id === row.id)) return prev;
            return [row, ...prev];
          });
          setNewIds((prev) => new Set(prev).add(row.id));
          setTimeout(() => {
            setNewIds((prev) => {
              const n = new Set(prev);
              n.delete(row.id);
              return n;
            });
          }, 3000);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "interactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as Interaction;
          // Remove non-pending from drafts list
          if (row.status !== "pending") {
            setItems((prev) => prev.filter((i) => i.id !== row.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      const isTyping = tag === "TEXTAREA" || tag === "INPUT";

      if (!isTyping) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, items.length - 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "a" || e.key === "A") {
          if (items[selectedIndex]) handleAction("approve", items[selectedIndex]);
        } else if (e.key === "r" || e.key === "R") {
          if (items[selectedIndex]) handleAction("reject", items[selectedIndex]);
        } else if (e.key === "s" || e.key === "S") {
          if (items[selectedIndex]) handleAction("skip", items[selectedIndex]);
        } else if (e.key === "e" || e.key === "E") {
          e.preventDefault();
          if (items[selectedIndex]) {
            textareaRefs.current[items[selectedIndex].id]?.focus();
          }
        }
      } else if (e.key === "Escape") {
        (document.activeElement as HTMLElement)?.blur();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [items, selectedIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll selected card into view
  useEffect(() => {
    const card = items[selectedIndex];
    if (card) {
      cardRefs.current[card.id]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex, items]);

  const notifyShell = useCallback(() => {
    window.dispatchEvent(new Event("wasp:interaction-update"));
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const runPoll = useCallback(async () => {
    if (pollingRef.current) return;
    pollingRef.current = true;
    setPolling(true);
    try {
      const r = await fetch("/api/poll-comments", { method: "POST" });
      if (!r.ok) { showToast("Check failed — try again"); return; }
      const data = await r.json();
      const total: number = data.total ?? 0;
      showToast(total > 0 ? `Found ${total} new item${total !== 1 ? "s" : ""}` : "No new activity");
      if (total > 0) notifyShell();
      window.dispatchEvent(
        new CustomEvent("wasp:poll-complete", { detail: { lastChecked: Date.now() } })
      );
    } catch {
      showToast("Check failed — try again");
    } finally {
      pollingRef.current = false;
      setPolling(false);
    }
  }, [notifyShell, showToast]); // no `polling` dep — uses ref so interval stays stable

  // Auto-poll every 2 minutes while the dashboard is open
  useEffect(() => {
    const interval = setInterval(runPoll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [runPoll]);

  async function handleAction(
    action: "approve" | "reject" | "skip" | "edit",
    item: Interaction
  ) {
    if (actionLoading[item.id]) return;
    setActionLoading((l) => ({ ...l, [item.id]: true }));

    try {
      const endpoint = `/api/interactions/${action}`;
      const body: Record<string, string> = { interaction_id: item.id };
      if (action === "edit") {
        body.edited_text = editTexts[item.id] ?? item.drafted_response ?? "";
      }

      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (r.ok) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        setSelectedIndex((idx) => Math.max(0, Math.min(idx, items.length - 2)));
        notifyShell();
      }
    } finally {
      setActionLoading((l) => ({ ...l, [item.id]: false }));
    }
  }

  async function handleApproveAll() {
    setApprovingAll(true);
    try {
      const r = await fetch("/api/interactions/approve-all", { method: "POST" });
      if (r.ok) {
        setItems([]);
        notifyShell();
      }
    } finally {
      setApprovingAll(false);
      setShowApproveAll(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

      {/* Toast notification */}
      {toast && (
        <div
          className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all"
          style={{ backgroundColor: "#1A1A1A", color: "#D4FF00" }}
        >
          {toast}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
          <div className="text-5xl mb-4">🐝</div>
          <h2
            className="text-xl font-black text-[#1A1A1A] mb-2"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            All clear!
          </h2>
          <p className="text-[#6B6058] max-w-xs mb-6">
            WASP has no pending drafts. Your audience is quiet… for now.
          </p>
          <PollButton onClick={runPoll} polling={polling} />
        </div>
      )}

      {/* Non-empty state */}
      {items.length > 0 && <>

      {/* Header row */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <h1
            className="text-xl font-black text-[#1A1A1A]"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Drafts
          </h1>
          <p className="text-xs text-[#9A9080] mt-0.5">
            {items.length} pending · Use A / R / S / ↑↓ to navigate
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <PollButton onClick={runPoll} polling={polling} />
          <button
            onClick={() => setShowApproveAll(true)}
            className="text-xs font-semibold bg-[#1A1A1A] text-[#D4FF00] px-4 py-2 rounded-xl hover:bg-[#5C6B00] transition-colors"
          >
            Approve All ({items.length})
          </button>
        </div>
      </div>

      {/* Approve All confirmation */}
      {showApproveAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            className="w-full max-w-sm border rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: "#EDE8DE", borderColor: "#D5CFC3" }}
          >
            <p
              className="font-black text-[#1A1A1A] text-lg mb-2"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Approve all {items.length} drafts?
            </p>
            <p className="text-sm text-[#6B6058] mb-5">
              All drafted responses will be sent to Instagram immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleApproveAll}
                disabled={approvingAll}
                className="flex-1 bg-[#1A1A1A] text-[#D4FF00] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#5C6B00] transition-colors disabled:opacity-40"
              >
                {approvingAll ? "Sending…" : "Yes, approve all"}
              </button>
              <button
                onClick={() => setShowApproveAll(false)}
                className="flex-1 border font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-[#D5CFC3] transition-colors"
                style={{ borderColor: "#D5CFC3", color: "#6B6058" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="flex flex-col gap-4">
        {items.map((item, idx) => {
          const typeInfo = TYPE_LABELS[item.interaction_type] ?? TYPE_LABELS.comment;
          const isSelected = idx === selectedIndex;
          const isLoading = actionLoading[item.id];
          const isNew = newIds.has(item.id);
          const editText =
            editTexts[item.id] ?? item.drafted_response ?? "";

          const routingInfo = item.routing_decision
            ? ROUTING_LABELS[item.routing_decision]
            : null;
          const isBothRouting = item.routing_decision === "both";

          return (
            <div
              key={item.id}
              ref={(el) => { cardRefs.current[item.id] = el; }}
              onClick={() => setSelectedIndex(idx)}
              className="border rounded-2xl p-4 sm:p-5 transition-all cursor-default"
              style={{
                borderColor: isSelected ? "#5C6B00" : isNew ? "#D4FF00" : "#D5CFC3",
                backgroundColor: isNew
                  ? "#F0FFD0"
                  : isSelected
                  ? "rgba(212,255,0,0.06)"
                  : "#EDE8DE",
                boxShadow: isNew ? "0 0 0 2px #D4FF00" : "none",
              }}
            >
              {/* Top row: username + badges + timestamp */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Avatar placeholder */}
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: "#D5CFC3", color: "#6B6058" }}
                  >
                    {(item.instagram_username ?? "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-[#1A1A1A] truncate">
                      @{item.instagram_username ?? "unknown"}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: typeInfo.bg,
                          color: typeInfo.color,
                        }}
                      >
                        {typeInfo.label}
                      </span>
                      {/* Routing badge — shown when non-public */}
                      {routingInfo && item.routing_decision !== "public" && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: routingInfo.bg,
                            color: routingInfo.color,
                          }}
                          title={item.sensitivity_reason ?? undefined}
                        >
                          {routingInfo.icon} {routingInfo.label}
                        </span>
                      )}
                      {/* Sensitivity reason pill */}
                      {item.sensitivity_reason && (
                        <span className="text-[10px] text-[#9A9080] italic">
                          {item.sensitivity_reason}
                        </span>
                      )}
                      {/* Post thumbnail for comments */}
                      {item.interaction_type === "comment" &&
                        item.source_post_thumbnail && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.source_post_thumbnail}
                            alt="Post"
                            className="w-5 h-5 rounded object-cover"
                          />
                        )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#9A9080] flex-shrink-0 mt-0.5">
                  {timeAgo(item.created_at)}
                </p>
              </div>

              {/* Original message */}
              <div
                className="text-sm text-[#6B6058] mb-3 p-3 rounded-xl"
                style={{ backgroundColor: "#F5F0E8" }}
              >
                {item.message_text}
              </div>

              {/* Dual preview for 'both' routing: public acknowledgement + DM draft */}
              {isBothRouting && (
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-[#9A9080] uppercase tracking-widest mb-1">
                    💬 Public reply
                  </p>
                  <div
                    className="text-sm text-[#6B6058] p-3 rounded-xl mb-3"
                    style={{ backgroundColor: "#F0FFB0", border: "1px solid #D4E800" }}
                  >
                    {item.public_acknowledgement ?? "I've sent you a DM with the details!"}
                  </div>
                  <p className="text-[10px] font-bold text-[#9A9080] uppercase tracking-widest mb-1">
                    📩 DM draft
                  </p>
                </div>
              )}

              {/* WASP's drafted response — editable */}
              <textarea
                ref={(el) => { textareaRefs.current[item.id] = el; }}
                value={editText}
                onChange={(e) =>
                  setEditTexts((t) => ({ ...t, [item.id]: e.target.value }))
                }
                rows={3}
                placeholder="No draft generated"
                className="w-full text-sm rounded-xl px-3 py-2.5 border resize-none outline-none transition-colors mb-3"
                style={{
                  backgroundColor: "#F5F0E8",
                  borderColor: "#D5CFC3",
                  color: "#1A1A1A",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#5C6B00";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#D5CFC3";
                }}
              />

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <ActionBtn
                  onClick={() => handleAction("approve", item)}
                  disabled={isLoading}
                  color="#5C6B00"
                  bg="#D4FF00"
                  label="Approve"
                  shortcut="A"
                  icon="✓"
                />
                <ActionBtn
                  onClick={() => handleAction("edit", item)}
                  disabled={isLoading || !editText.trim()}
                  color="#7B4F00"
                  bg="#FFE8B0"
                  label="Edit & Send"
                  icon="✏️"
                />
                <ActionBtn
                  onClick={() => handleAction("reject", item)}
                  disabled={isLoading}
                  color="#8B1A1A"
                  bg="#FFD5D5"
                  label="Reject"
                  shortcut="R"
                  icon="✕"
                />
                <ActionBtn
                  onClick={() => handleAction("skip", item)}
                  disabled={isLoading}
                  color="#6B6058"
                  bg="#D5CFC3"
                  label="Skip"
                  shortcut="S"
                  icon="→"
                />
                {isLoading && (
                  <span className="text-xs text-[#9A9080] self-center ml-1">
                    Sending…
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Keyboard shortcut legend */}
      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-1 justify-center">
        {[
          { key: "A", desc: "Approve" },
          { key: "R", desc: "Reject" },
          { key: "S", desc: "Skip" },
          { key: "E", desc: "Edit" },
          { key: "↑↓", desc: "Navigate" },
          { key: "Esc", desc: "Blur" },
        ].map(({ key, desc }) => (
          <span key={key} className="text-[11px] text-[#9A9080]">
            <kbd
              className="font-mono bg-[#D5CFC3] text-[#6B6058] px-1.5 py-0.5 rounded text-[10px] font-bold"
            >
              {key}
            </kbd>{" "}
            {desc}
          </span>
        ))}
      </div>

      </>}
    </div>
  );
}

// ── Poll Button ────────────────────────────────────────────────────────────────

function PollButton({ onClick, polling }: { onClick: () => void; polling: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={polling}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors hover:bg-[#D5CFC3] disabled:opacity-40"
      style={{ borderColor: "#D5CFC3", color: "#6B6058", backgroundColor: "#F5F0E8" }}
    >
      <span
        style={{
          display: "inline-block",
          animation: polling ? "spin 1s linear infinite" : "none",
        }}
      >
        ↺
      </span>
      {polling ? "Checking…" : "Check for new activity"}
    </button>
  );
}

// ── Action Button ──────────────────────────────────────────────────────────────

function ActionBtn({
  onClick,
  disabled,
  color,
  bg,
  label,
  shortcut,
  icon,
}: {
  onClick: () => void;
  disabled: boolean;
  color: string;
  bg: string;
  label: string;
  shortcut?: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-40 hover:opacity-80"
      style={{ backgroundColor: bg, color }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {shortcut && (
        <kbd
          className="ml-0.5 font-mono text-[9px] px-1 py-0.5 rounded opacity-60"
          style={{ backgroundColor: color + "22" }}
        >
          {shortcut}
        </kbd>
      )}
    </button>
  );
}
