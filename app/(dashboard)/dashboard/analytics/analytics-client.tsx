"use client";

import { useState, useEffect } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  total_this_month: number;
  reply_rate: number;
  avg_response_time_mins: number;
  agent_accuracy: number;
  daily_counts: { date: string; count: number }[];
  by_type: { comment: number; dm: number; story_reply: number };
  approval_by_day: { date: string; rate: number | null }[];
}

// ── Inline chart helpers ───────────────────────────────────────────────────────

function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  // Show every 7th label
  return (
    <div className="flex items-end gap-[2px] h-28 w-full">
      {data.map((d, i) => {
        const pct = d.count / max;
        const showLabel = i % 7 === 0 || i === data.length - 1;
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            <div
              className="w-full rounded-sm transition-all"
              title={`${d.date}: ${d.count}`}
              style={{
                height: `${Math.max(pct * 100, 2)}%`,
                backgroundColor: d.count > 0 ? "#D4FF00" : "#D5CFC3",
              }}
            />
            {showLabel && (
              <span className="text-[8px] text-[#9A9080] truncate w-full text-center">
                {d.date.slice(5)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({
  comment,
  dm,
  story,
}: {
  comment: number;
  dm: number;
  story: number;
}) {
  const total = comment + dm + story || 1;
  const r = 36;
  const cx = 44;
  const cy = 44;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { value: comment, color: "#D4FF00", label: "Comments" },
    { value: dm, color: "#DDEEFF", label: "DMs" },
    { value: story, color: "#FFE8CC", label: "Story Replies" },
  ];

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const dashLen = pct * circumference;
    const dashOff = circumference - dashLen;
    const rotation = (offset / total) * 360 - 90;
    offset += seg.value;
    return { ...seg, dashLen, dashOff, rotation };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width="88" height="88" className="flex-shrink-0">
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="14"
            strokeDasharray={`${arc.dashLen} ${arc.dashOff}`}
            transform={`rotate(${arc.rotation}, ${cx}, ${cy})`}
          />
        ))}
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          className="text-[12px] font-bold"
          fill="#1A1A1A"
          fontSize="12"
          fontWeight="700"
        >
          {total}
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-[#6B6058]">
              {seg.label}:{" "}
              <strong className="text-[#1A1A1A]">{seg.value}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({
  data,
}: {
  data: { date: string; rate: number | null }[];
}) {
  const withData = data.filter((d) => d.rate !== null);
  if (withData.length < 2) {
    return (
      <p className="text-sm text-[#9A9080] py-4 text-center">
        More interactions needed to show a trend.
      </p>
    );
  }

  const W = 400;
  const H = 80;
  const pad = 4;

  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = d.rate === null ? null : H - pad - (d.rate / 100) * (H - pad * 2);
    return { x, y, rate: d.rate };
  });

  const pathParts: string[] = [];
  let inLine = false;
  points.forEach((p) => {
    if (p.y === null) { inLine = false; return; }
    if (!inLine) { pathParts.push(`M ${p.x} ${p.y}`); inLine = true; }
    else { pathParts.push(`L ${p.x} ${p.y}`); }
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 80 }}>
      {/* 50% reference line */}
      <line
        x1={pad}
        y1={H / 2}
        x2={W - pad}
        y2={H / 2}
        stroke="#D5CFC3"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <path
        d={pathParts.join(" ")}
        fill="none"
        stroke="#5C6B00"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots for data points */}
      {points
        .filter((p) => p.y !== null)
        .map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y!} r="2.5" fill="#D4FF00" stroke="#5C6B00" strokeWidth="1" />
        ))}
    </svg>
  );
}

// ── Metric Card ────────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  suffix,
  sub,
}: {
  icon: string;
  label: string;
  value: number | string;
  suffix?: string;
  sub?: string;
}) {
  return (
    <div
      className="border rounded-2xl p-5 flex flex-col gap-1"
      style={{ borderColor: "#D5CFC3", backgroundColor: "#EDE8DE" }}
    >
      <span className="text-2xl">{icon}</span>
      <p className="text-[10px] text-[#9A9080] uppercase tracking-widest mt-1">
        {label}
      </p>
      <p
        className="text-3xl font-black text-[#1A1A1A] leading-none"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        {value}
        {suffix && (
          <span className="text-lg font-bold text-[#5C6B00] ml-0.5">{suffix}</span>
        )}
      </p>
      {sub && <p className="text-xs text-[#9A9080]">{sub}</p>}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <h1
        className="text-xl font-black text-[#1A1A1A] mb-1"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        Analytics
      </h1>
      <p className="text-xs text-[#9A9080] mb-6">This month · Last 30 days</p>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-[#D5CFC3] border-t-[#5C6B00] animate-spin" />
        </div>
      ) : error ? (
        <p className="text-sm text-[#8B1A1A] text-center py-10">{error}</p>
      ) : data ? (
        <div className="flex flex-col gap-6">

          {/* Hero metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              icon="💬"
              label="Total this month"
              value={data.total_this_month}
              sub="interactions handled"
            />
            <MetricCard
              icon="📨"
              label="Reply rate"
              value={data.reply_rate}
              suffix="%"
              sub="of handled comments/DMs"
            />
            <MetricCard
              icon="⚡"
              label="Avg response time"
              value={
                data.avg_response_time_mins < 1
                  ? "<1"
                  : data.avg_response_time_mins
              }
              suffix=" min"
              sub="from received to sent"
            />
            <MetricCard
              icon="🎯"
              label="Agent accuracy"
              value={data.agent_accuracy}
              suffix="%"
              sub="approved without edits"
            />
          </div>

          {/* Interactions per day */}
          <div
            className="border rounded-2xl p-5"
            style={{ borderColor: "#D5CFC3", backgroundColor: "#EDE8DE" }}
          >
            <h2
              className="font-black text-[#1A1A1A] text-sm mb-4"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Interactions per day — last 30 days
            </h2>
            {data.daily_counts.every((d) => d.count === 0) ? (
              <p className="text-sm text-[#9A9080] text-center py-6">
                No interactions yet. Use the Test Agent to generate data.
              </p>
            ) : (
              <BarChart data={data.daily_counts} />
            )}
          </div>

          {/* Two columns: donut + approval rate */}
          <div className="grid sm:grid-cols-2 gap-4">

            {/* Breakdown by type */}
            <div
              className="border rounded-2xl p-5"
              style={{ borderColor: "#D5CFC3", backgroundColor: "#EDE8DE" }}
            >
              <h2
                className="font-black text-[#1A1A1A] text-sm mb-4"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                Breakdown by type
              </h2>
              <DonutChart
                comment={data.by_type.comment}
                dm={data.by_type.dm}
                story={data.by_type.story_reply}
              />
            </div>

            {/* Approval rate trend */}
            <div
              className="border rounded-2xl p-5"
              style={{ borderColor: "#D5CFC3", backgroundColor: "#EDE8DE" }}
            >
              <h2
                className="font-black text-[#1A1A1A] text-sm mb-1"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                Approval rate trend
              </h2>
              <p className="text-xs text-[#9A9080] mb-4">
                % of drafts approved without edits
              </p>
              <LineChart data={data.approval_by_day} />
            </div>
          </div>

          {/* Before/After placeholder */}
          <div
            className="border border-dashed rounded-2xl p-6 text-center"
            style={{ borderColor: "#D5CFC3" }}
          >
            <span className="text-3xl mb-3 block">📈</span>
            <p
              className="font-black text-[#1A1A1A] mb-1 text-sm"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Before vs. After
            </p>
            <p className="text-xs text-[#9A9080]">
              More data needed — check back after 7 days of activity to see how
              WASP has improved your engagement.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
