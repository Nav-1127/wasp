"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Interaction {
  id: string;
  instagram_username: string | null;
  instagram_user_id: string | null;
  interaction_type: "comment" | "dm" | "story_reply";
  message_text: string;
  final_response: string | null;
  drafted_response: string | null;
  status: string;
  created_at: string;
  responded_at: string | null;
}

interface ConversationThread {
  id: string;
  instagram_username: string | null;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  auto_sent:  { label: "Auto-sent",  color: "#1A4B8B", bg: "#DDEEFF" },
  approved:   { label: "Approved",   color: "#2D5A00", bg: "#D4FF00" },
  edited:     { label: "Edited",     color: "#7B4F00", bg: "#FFE8B0" },
  rejected:   { label: "Rejected",   color: "#8B1A1A", bg: "#FFD5D5" },
  skipped:    { label: "Skipped",    color: "#6B6058", bg: "#D5CFC3" },
  pending:    { label: "Pending",    color: "#5C3800", bg: "#FFE0A0" },
  failed:     { label: "Failed",     color: "#8B1A1A", bg: "#FFD5D5" },
};

const TYPE_LABELS: Record<string, string> = {
  comment:     "Comment",
  dm:          "DM",
  story_reply: "Story Reply",
};

const FILTER_OPTIONS = [
  { id: "all",       label: "All" },
  { id: "comment",   label: "Comments" },
  { id: "dm",        label: "DMs" },
  { id: "auto_sent", label: "Auto-sent" },
  { id: "edited",    label: "Edited" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const PAGE_SIZE = 20;

// ── Main Component ─────────────────────────────────────────────────────────────

export default function LiveFeedClient({
  userId,
  initialItems,
}: {
  userId: string;
  initialItems: Interaction[];
}) {
  const [items, setItems] = useState<Interaction[]>(initialItems);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
  const [threads, setThreads] = useState<Record<string, ConversationThread>>({});
  const [loadingThread, setLoadingThread] = useState<string | null>(null);

  // Realtime: prepend new interactions to the feed
  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`live-feed-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "interactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setItems((prev) => {
            if (prev.find((i) => i.id === (payload.new as Interaction).id))
              return prev;
            return [payload.new as Interaction, ...prev];
          });
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
          const updated = payload.new as Interaction;
          setItems((prev) =>
            prev.map((i) => (i.id === updated.id ? updated : i))
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // Filter + search
  const filtered = items.filter((item) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "comment" || filter === "dm"
        ? item.interaction_type === filter
        : item.status === filter;

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (item.instagram_username ?? "").toLowerCase().includes(q) ||
      item.message_text.toLowerCase().includes(q) ||
      (item.final_response ?? item.drafted_response ?? "")
        .toLowerCase()
        .includes(q);

    return matchesFilter && matchesSearch;
  });

  const pageItems = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = filtered.length > pageItems.length;

  const toggleThread = useCallback(
    async (item: Interaction) => {
      if (item.interaction_type !== "dm") return;
      const id = item.id;
      if (expandedThreads.has(id)) {
        setExpandedThreads((s) => { const n = new Set(s); n.delete(id); return n; });
        return;
      }
      setExpandedThreads((s) => new Set(s).add(id));
      if (threads[id]) return; // already loaded
      if (!item.instagram_user_id) return;

      setLoadingThread(id);
      try {
        const r = await fetch(
          `/api/conversations?instagram_user_id=${encodeURIComponent(item.instagram_user_id)}`
        );
        if (r.ok) {
          const data = await r.json();
          setThreads((t) => ({ ...t, [id]: data.thread }));
        }
      } finally {
        setLoadingThread(null);
      }
    },
    [expandedThreads, threads]
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">

      {/* Header */}
      <h1
        className="text-xl font-black text-[#1A1A1A] mb-4"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        Live Feed
      </h1>

      {/* Filters + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setFilter(opt.id); setPage(1); }}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
              style={{
                backgroundColor: filter === opt.id ? "#1A1A1A" : "transparent",
                color: filter === opt.id ? "#F5F0E8" : "#6B6058",
                borderColor: filter === opt.id ? "#1A1A1A" : "#D5CFC3",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search username or message…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 text-sm px-4 py-1.5 border rounded-full outline-none transition-colors min-w-0"
          style={{
            backgroundColor: "#F5F0E8",
            borderColor: "#D5CFC3",
            color: "#1A1A1A",
          }}
        />
      </div>

      {/* Feed items */}
      {pageItems.length === 0 ? (
        <div className="text-center py-16 text-[#9A9080] text-sm">
          No interactions yet. Start the Test Agent to generate some.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pageItems.map((item) => {
            const statusStyle =
              STATUS_STYLES[item.status] ?? STATUS_STYLES.pending;
            const response = item.final_response ?? item.drafted_response;
            const isExpanded = expandedThreads.has(item.id);
            const thread = threads[item.id];

            return (
              <div
                key={item.id}
                className="border rounded-2xl p-4 transition-colors"
                style={{ borderColor: "#D5CFC3", backgroundColor: "#EDE8DE" }}
              >
                {/* Row: user + badges + time */}
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: "#D5CFC3", color: "#6B6058" }}
                    >
                      {(item.instagram_username ?? "?")[0].toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm text-[#1A1A1A] truncate">
                      @{item.instagram_username ?? "unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                      }}
                    >
                      {statusStyle.label}
                    </span>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#F5F0E8", color: "#9A9080" }}
                    >
                      {TYPE_LABELS[item.interaction_type] ?? item.interaction_type}
                    </span>
                    <span className="text-[11px] text-[#9A9080]">
                      {timeAgo(item.created_at)}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm text-[#6B6058] mb-2">{item.message_text}</p>

                {/* Response */}
                {response && (
                  <div
                    className="text-sm text-[#1A1A1A] px-3 py-2 rounded-xl border-l-2"
                    style={{
                      backgroundColor: "#F5F0E8",
                      borderLeftColor: "#5C6B00",
                    }}
                  >
                    {response}
                  </div>
                )}

                {/* Expand thread for DMs */}
                {item.interaction_type === "dm" && (
                  <button
                    onClick={() => toggleThread(item)}
                    className="mt-2.5 text-xs font-medium text-[#5C6B00] hover:underline"
                  >
                    {isExpanded ? "Hide thread ↑" : "View full thread ↓"}
                  </button>
                )}

                {/* Thread */}
                {isExpanded && (
                  <div className="mt-3 border-t pt-3" style={{ borderColor: "#D5CFC3" }}>
                    {loadingThread === item.id ? (
                      <div className="flex justify-center py-3">
                        <div className="w-4 h-4 rounded-full border-2 border-[#D5CFC3] border-t-[#5C6B00] animate-spin" />
                      </div>
                    ) : thread?.messages?.length ? (
                      <div className="flex flex-col gap-2">
                        {thread.messages.map((msg, i) => (
                          <div
                            key={i}
                            className={`text-xs px-3 py-2 rounded-xl max-w-[85%] ${
                              msg.role === "assistant"
                                ? "self-end bg-[#D4FF00] text-[#1A1A1A]"
                                : "self-start bg-[#F5F0E8] text-[#6B6058]"
                            }`}
                          >
                            {msg.content}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#9A9080] text-center">No thread data</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="text-sm font-semibold text-[#5C6B00] hover:underline px-4 py-2"
          >
            Load more ({filtered.length - pageItems.length} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
