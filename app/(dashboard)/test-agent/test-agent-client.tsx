"use client";

import { useState } from "react";

type SimResult = {
  skipped?: boolean;
  message?: string;
  interaction?: {
    id: string;
    interaction_type: string;
    message_text: string;
    drafted_response: string | null;
    status: string;
    comment_category: string | null;
    error_message: string | null;
  };
};

type SimType = "comment" | "dm";

export default function TestAgentClient() {
  const [commentText, setCommentText] = useState("");
  const [dmText, setDmText]           = useState("");
  const [commentResult, setCommentResult] = useState<SimResult | null>(null);
  const [dmResult, setDmResult]           = useState<SimResult | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const [dmLoading, setDmLoading]           = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [dmError, setDmError]           = useState<string | null>(null);

  async function simulate(type: SimType, text: string) {
    const setLoading = type === "comment" ? setCommentLoading : setDmLoading;
    const setResult  = type === "comment" ? setCommentResult  : setDmResult;
    const setError   = type === "comment" ? setCommentError   : setDmError;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/webhook/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, text }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error — check that the dev server is running");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-black tracking-tight mb-1"
          style={{ color: "#1A1A1A" }}
        >
          Test Agent
        </h1>
        <p className="text-sm" style={{ color: "#6B6058" }}>
          Simulate comments and DMs to see how WASP drafts responses — no real
          Instagram traffic needed.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Simulate Comment ───────────────────────────────────────────── */}
        <SimCard
          title="Simulate a Comment"
          description="Paste or type a comment to see WASP's drafted reply."
          placeholder='e.g. "How much does this cost?" or "Love this! 🔥"'
          value={commentText}
          onChange={setCommentText}
          onSubmit={() => simulate("comment", commentText)}
          loading={commentLoading}
          buttonLabel="Simulate Comment"
          result={commentResult}
          error={commentError}
        />

        {/* ── Simulate DM ────────────────────────────────────────────────── */}
        <SimCard
          title="Simulate a DM"
          description="Paste or type a direct message to see WASP's drafted reply."
          placeholder='e.g. "Hey! I saw your post about the course — can you tell me more?"'
          value={dmText}
          onChange={setDmText}
          onSubmit={() => simulate("dm", dmText)}
          loading={dmLoading}
          buttonLabel="Simulate DM"
          result={dmResult}
          error={dmError}
        />
      </div>
    </div>
  );
}

// ── SimCard component ──────────────────────────────────────────────────────────

function SimCard({
  title,
  description,
  placeholder,
  value,
  onChange,
  onSubmit,
  loading,
  buttonLabel,
  result,
  error,
}: {
  title: string;
  description: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  buttonLabel: string;
  result: SimResult | null;
  error: string | null;
}) {
  return (
    <div
      className="rounded-2xl border p-5"
      style={{ backgroundColor: "#EDE8DE", borderColor: "#D5CFC3" }}
    >
      <h2 className="text-base font-bold mb-0.5" style={{ color: "#1A1A1A" }}>
        {title}
      </h2>
      <p className="text-xs mb-4" style={{ color: "#6B6058" }}>
        {description}
      </p>

      <textarea
        className="w-full rounded-xl border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#5C6B00]"
        style={{
          backgroundColor: "#F5F0E8",
          borderColor: "#D5CFC3",
          color: "#1A1A1A",
          minHeight: "88px",
        }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            if (value.trim() && !loading) onSubmit();
          }
        }}
      />

      <button
        onClick={onSubmit}
        disabled={loading || !value.trim()}
        className="mt-3 px-5 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: "#D4FF00",
          color: "#1A1A1A",
        }}
      >
        {loading ? "Thinking..." : buttonLabel}
      </button>

      {/* Error */}
      {error && (
        <p
          className="mt-4 text-sm rounded-xl px-4 py-3 border"
          style={{
            backgroundColor: "#FEE2E2",
            borderColor: "#FCA5A5",
            color: "#991B1B",
          }}
        >
          {error}
        </p>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4">
          {result.skipped ? (
            <div
              className="text-sm rounded-xl px-4 py-3 border"
              style={{
                backgroundColor: "#FFF9E6",
                borderColor: "#FDE68A",
                color: "#92400E",
              }}
            >
              <strong>Filtered out</strong> — {result.message}
            </div>
          ) : result.interaction ? (
            <InteractionResult interaction={result.interaction} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function InteractionResult({
  interaction,
}: {
  interaction: NonNullable<SimResult["interaction"]>;
}) {
  const hasResponse = !!interaction.drafted_response;

  return (
    <div>
      {/* Category badge */}
      {interaction.comment_category && (
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: "#D4FF00", color: "#1A1A1A" }}
          >
            {interaction.comment_category.replace("_", " ")}
          </span>
          <span className="text-xs" style={{ color: "#6B6058" }}>
            classified as
          </span>
        </div>
      )}

      {/* Response box */}
      <div
        className="rounded-xl border p-4"
        style={{
          backgroundColor: hasResponse ? "#F5F0E8" : "#FEF3C7",
          borderColor: hasResponse ? "#D5CFC3" : "#FDE68A",
        }}
      >
        <p
          className="text-xs font-semibold mb-1.5 uppercase tracking-wider"
          style={{ color: "#6B6058" }}
        >
          {hasResponse ? "Drafted response" : "No response generated"}
        </p>

        {hasResponse ? (
          <p className="text-sm leading-relaxed" style={{ color: "#1A1A1A" }}>
            {interaction.drafted_response}
          </p>
        ) : (
          <p className="text-sm" style={{ color: "#92400E" }}>
            {interaction.error_message ??
              "Claude API did not return a response. Check your ANTHROPIC_API_KEY."}
          </p>
        )}
      </div>

      {/* Status pill */}
      <p className="mt-2 text-xs" style={{ color: "#6B6058" }}>
        Status:{" "}
        <span className="font-semibold" style={{ color: "#1A1A1A" }}>
          {interaction.status}
        </span>{" "}
        · Saved as interaction{" "}
        <span className="font-mono text-xs">{interaction.id.slice(0, 8)}…</span>
      </p>
    </div>
  );
}
