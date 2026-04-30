"use client";

/* Hero — v10 (translated from Claude Design WASP Hero v4.html, 2026-04-29).
 * Single-viewport split layout: content-left, animated Instagram window-right.
 * 21-second comment timeline loops, mixing emoji/tag comments (no reply) and
 * substantive comments (with @northform reply, threaded properly).
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useReducer, useRef } from "react";

/* ────────────────────────────────────────────
   TIMELINE — keeps CD's exact pacing
   ──────────────────────────────────────────── */
type TimelineItem = {
  t: number;
  user: string;
  bg: string;
  text: string;
  reply: string | null;
  replyT?: number;
};

const TIMELINE: TimelineItem[] = [
  { t: 0, user: "paige_b", bg: "#EDD9C3", text: "🔥🔥🔥", reply: null },
  {
    t: 1500,
    user: "lily.k",
    bg: "#EDCFC3",
    text: "what's the fabric? heavyweight?",
    reply: "300gsm french terry, brushed inside. drops thursday at 11am EST 🤎",
    replyT: 3000,
  },
  { t: 4500, user: "j.fit", bg: "#D9C3ED", text: "@maya.r u need this", reply: null },
  {
    t: 6000,
    user: "marcusss",
    bg: "#C3CFED",
    text: "shipping to UK?",
    reply: "5-7 business days to the UK with tracking. free over $150.",
    replyT: 7500,
  },
  { t: 9000, user: "raina.k", bg: "#C3D9ED", text: "🤎", reply: null },
  {
    t: 10000,
    user: "runwithdee",
    bg: "#C3EDC9",
    text: "true to size?",
    reply:
      "runs true on the chest, slightly relaxed in the body. size down for slimmer fit.",
    replyT: 11500,
  },
  { t: 13000, user: "nathan.r", bg: "#C3EDED", text: "obsessed", reply: null },
  { t: 14000, user: "kai.j", bg: "#EDEDC3", text: "@blake.m 👀", reply: null },
  {
    t: 15000,
    user: "sasha.styles",
    bg: "#EDC3D9",
    text: "any plans to restock the cream sweater?",
    reply: "yes! restock drops monday. want me on the early access list?",
    replyT: 16500,
  },
  {
    t: 18000,
    user: "ecoswaps",
    bg: "#CFC3ED",
    text: "where's the cotton sourced?",
    reply: "GOTS-certified farm in Portugal. with us since 2022.",
    replyT: 19500,
  },
];
const LOOP_MS = 21000;

/* ────────────────────────────────────────────
   ANIMATION HOOK — rAF loop driving the entries
   ──────────────────────────────────────────── */
type Entry = TimelineItem & { idx: number; id: number; replyVisible: boolean };

function useCommentTimeline() {
  const [, force] = useReducer((n: number) => n + 1, 0);
  const r = useRef({
    startTime: null as number | null,
    loopCount: 0,
    shownComments: new Set<number>(),
    shownReplies: new Set<number>(),
    entries: [] as Entry[],
    idGen: 0,
  });

  useEffect(() => {
    let raf = 0;
    const frame = (ts: number) => {
      const s = r.current;
      if (s.startTime === null) s.startTime = ts;

      const total = ts - s.startTime;
      const newLoopCount = Math.floor(total / LOOP_MS);
      const elapsed = total % LOOP_MS;

      let changed = false;

      if (newLoopCount > s.loopCount) {
        s.loopCount = newLoopCount;
        s.shownComments = new Set();
        s.shownReplies = new Set();
        s.entries = [];
        changed = true;
      }

      TIMELINE.forEach((item, i) => {
        if (!s.shownComments.has(i) && elapsed >= item.t) {
          s.shownComments.add(i);
          s.entries = [
            ...s.entries,
            { ...item, idx: i, id: s.idGen++, replyVisible: false },
          ];
          changed = true;
        }
        if (
          item.reply &&
          item.replyT !== undefined &&
          !s.shownReplies.has(i) &&
          elapsed >= item.replyT
        ) {
          s.shownReplies.add(i);
          const entry = s.entries.find((e) => e.idx === i);
          if (entry) {
            entry.replyVisible = true;
            changed = true;
          }
        }
      });

      if (changed) force();
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return r.current.entries;
}

/* ────────────────────────────────────────────
   SUB-COMPONENTS
   ──────────────────────────────────────────── */
function VerifiedBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 13,
        height: 13,
        background: "#0095F6",
        borderRadius: "50%",
        flexShrink: 0,
        verticalAlign: "middle",
        marginLeft: 2,
      }}
    >
      <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
        <path
          d="M1 3l2 2 3-4"
          stroke="#fff"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function ActionIcons() {
  return (
    <>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <span style={{ cursor: "pointer" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="#000"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span style={{ cursor: "pointer" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="#000"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span style={{ cursor: "pointer" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="22" y1="2" x2="11" y2="13" stroke="#000" strokeWidth="1.75" strokeLinecap="round" />
            <polygon
              points="22 2 15 22 11 13 2 9 22 2"
              stroke="#000"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </span>
      </div>
      <div style={{ marginLeft: "auto" }}>
        <span style={{ cursor: "pointer" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
              stroke="#000"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </>
  );
}

const igFont =
  "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

function CommentEntry({ entry, isNew }: { entry: Entry; isNew: boolean }) {
  return (
    <div
      style={
        isNew
          ? {
              animation: "wasp-entrySlide 0.3s ease forwards",
            }
          : undefined
      }
    >
      <div
        style={{
          display: "flex",
          gap: 9,
          padding: "8px 12px 2px",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: igFont,
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            background: entry.bg,
          }}
        >
          {entry.user[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: igFont,
              fontSize: 13,
              color: "#000",
              lineHeight: 1.35,
            }}
          >
            <b style={{ fontWeight: 600 }}>{entry.user}</b> {entry.text}
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              fontFamily: igFont,
              fontSize: 11,
              color: "#8e8e8e",
              marginTop: 3,
            }}
          >
            <span>just now</span>
            <span>Reply</span>
          </div>
        </div>
        <div style={{ flexShrink: 0, paddingTop: 3 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="#8e8e8e"
              strokeWidth="1.75"
            />
          </svg>
        </div>
      </div>

      {entry.reply && (
        <div
          style={{
            padding: "2px 12px 8px 49px",
            opacity: entry.replyVisible ? 1 : 0,
            transform: entry.replyVisible ? "translateY(0)" : "translateY(4px)",
            maxHeight: entry.replyVisible ? "80px" : "0px",
            overflow: "hidden",
            transition:
              "opacity 0.38s ease, transform 0.38s ease, max-height 0.38s ease",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                flexShrink: 0,
                background: "#1C1C1E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: igFont,
                fontSize: 9,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              N
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: igFont,
                  fontSize: 13,
                  color: "#000",
                  lineHeight: 1.35,
                }}
              >
                <b style={{ fontWeight: 600 }}>northform</b>
                <VerifiedBadge /> {entry.reply}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  fontFamily: igFont,
                  fontSize: 11,
                  color: "#8e8e8e",
                  marginTop: 3,
                }}
              >
                <span>just now</span>
                <span>Reply</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnimatedComments({ desktop }: { desktop?: boolean }) {
  const entries = useCommentTimeline();
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLen = useRef(0);

  useLayoutEffect(() => {
    if (scrollRef.current && entries.length !== prevLen.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      prevLen.current = entries.length;
    }
  });

  return (
    <div
      ref={scrollRef}
      style={{
        ...(desktop ? { flex: 1, minHeight: 160 } : { height: 230, flexShrink: 0 }),
        overflowY: "scroll",
        scrollbarWidth: "none",
        position: "relative",
      }}
      className="wasp-no-scrollbar"
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          height: 24,
          background: "linear-gradient(to bottom, #fff, transparent)",
          pointerEvents: "none",
          zIndex: 2,
          marginBottom: -24,
        }}
      />
      {entries.map((entry, i) => (
        <CommentEntry
          key={entry.id}
          entry={entry}
          isNew={i === entries.length - 1}
        />
      ))}
      <div style={{ height: 8 }} />
      <div
        style={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          height: 24,
          background: "linear-gradient(to top, #fff, transparent)",
          pointerEvents: "none",
          zIndex: 2,
          marginTop: -24,
        }}
      />
    </div>
  );
}

function IGDesktopWindow() {
  return (
    <div
      className="wasp-ig-desktop"
      style={{
        display: "flex",
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow:
          "0 2px 6px rgba(0,0,0,0.04), 0 10px 32px rgba(0,0,0,0.11), 0 28px 72px rgba(0,0,0,0.07)",
        width: "100%",
        maxWidth: 1060,
        height: 580,
      }}
    >
      {/* Left: post image */}
      <div
        className="wasp-ig-desktop-image"
        style={{
          width: "55%",
          flexShrink: 0,
          position: "relative",
          borderRight: "1px solid #dbdbdb",
        }}
      >
        <Image
          src="/hoodie-brand.jpg"
          alt="northform drop 06 hoodie"
          fill
          sizes="528px"
          style={{ objectFit: "cover", objectPosition: "center 65%" }}
          priority
        />
      </div>

      {/* Right: comments panel */}
      <div
        className="wasp-ig-desktop-panel"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 16px",
            gap: 10,
            borderBottom: "1px solid #dbdbdb",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
              padding: 2,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: "#1C1C1E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: igFont,
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                border: "2.5px solid #fff",
              }}
            >
              N
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: igFont,
                fontSize: 13,
                fontWeight: 600,
                color: "#000",
                display: "flex",
                alignItems: "center",
                gap: 4,
                lineHeight: 1.2,
              }}
            >
              northform <VerifiedBadge />
            </div>
            <div
              style={{
                fontFamily: igFont,
                fontSize: 12,
                fontWeight: 600,
                color: "#0095F6",
                cursor: "pointer",
                lineHeight: 1.2,
              }}
            >
              Following
            </div>
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#000",
              cursor: "pointer",
              fontFamily: igFont,
              letterSpacing: -1,
            }}
          >
            ···
          </div>
        </div>

        {/* Scrollable animated comments */}
        <AnimatedComments desktop />

        {/* Action bar */}
        <div
          style={{
            padding: "10px 16px 6px",
            borderTop: "1px solid #dbdbdb",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 8 }}>
            <ActionIcons />
          </div>
          <div
            className="wasp-ig-action-meta"
            style={{
              fontFamily: igFont,
              fontSize: 13,
              fontWeight: 600,
              color: "#000",
              marginBottom: 3,
            }}
          >
            12,847 likes
          </div>
          <div
            className="wasp-ig-action-meta"
            style={{
              fontFamily: igFont,
              fontSize: 13,
              lineHeight: 1.4,
              color: "#000",
            }}
          >
            <span style={{ fontWeight: 600 }}>northform</span> drop 06 ・ french
            terry hoodie. organic cotton, 300gsm. thursday 11am EST 🤎
          </div>
        </div>

        {/* Add comment */}
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            padding: "8px 16px 10px",
            borderTop: "1px solid #dbdbdb",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#E8E0D4",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, fontFamily: igFont, fontSize: 13, color: "#8e8e8e" }}>
            Add a comment…
          </div>
          <span style={{ fontSize: 15, cursor: "pointer" }}>☺</span>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   HERO ROOT — v10.3 centered layout
   ──────────────────────────────────────────── */
export default function HeroLight() {
  return (
    <section
      id="hero"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        minHeight: "calc(100vh - 60px)",
        background: "#FAF8F5",
        backgroundImage:
          "radial-gradient(circle, rgba(26,26,26,0.10) 1.25px, transparent 1.25px)",
        backgroundSize: "24px 24px",
      }}
    >
      <style>{`
        @keyframes wasp-entrySlide {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wasp-no-scrollbar::-webkit-scrollbar { display: none; }

        .wasp-hero-center {
          text-align: center;
          padding: 80px 48px 56px;
          max-width: 1060px;
          width: 100%;
          box-sizing: border-box;
        }
        .wasp-hero-window-wrap {
          padding: 0 48px 80px;
          display: flex;
          justify-content: center;
          width: 100%;
          box-sizing: border-box;
        }

        .wasp-mobile-break { display: none; }

        @media (max-width: 1024px) {
          .wasp-hero-window-wrap { padding: 0 32px 60px; }
        }
        @media (max-width: 768px) {
          .wasp-hero-center { padding: 52px 20px 36px; }
          .wasp-hero-window-wrap { padding: 0 12px 48px; }
          .wasp-mobile-break { display: block; }
          .wasp-hero-h1 {
            font-size: clamp(2.625rem, 9vw, 3.5rem) !important;
            line-height: 1.06 !important;
          }
          .wasp-hero-sub { font-size: 0.9375rem !important; }
          .wasp-ig-desktop { flex-direction: column !important; height: auto !important; }
          .wasp-ig-desktop-image {
            width: 100% !important;
            height: 240px !important;
            border-right: none !important;
            border-bottom: 1px solid #dbdbdb !important;
          }
          .wasp-ig-desktop-panel {
            height: 520px !important;
            display: flex !important;
            flex-direction: column !important;
          }
        }
        @media (max-width: 380px) {
          .wasp-hero-h1 { font-size: clamp(2.25rem, 8.5vw, 2.75rem) !important; }
        }
      `}</style>

      {/* Centered headline + CTA */}
      <div className="wasp-hero-center">
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#999",
            marginBottom: 20,
          }}
        >
          Instagram Engagement agent for creators &amp; brands
        </div>

        <h1
          className="wasp-hero-h1"
          style={{
            fontFamily:
              "var(--font-bricolage), 'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(2.75rem, 4.5vw, 3.75rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: "#0A0A0A",
            marginBottom: 20,
          }}
        >
          Your Instagram,
          <br className="wasp-mobile-break" />
          {" "}on{" "}
          <mark
            style={{
              background: "rgba(255, 210, 55, 0.45)",
              color: "inherit",
              borderRadius: 5,
              padding: "2px 8px",
            }}
          >
            autopilot.
          </mark>
          <br />
          <em
            style={{
              fontStyle: "italic",
              fontFamily:
                "var(--font-playfair), 'Playfair Display', Georgia, serif",
              fontWeight: 700,
            }}
          >
            Without sounding
            <br className="wasp-mobile-break" />
            {" "}like a bot.
          </em>
        </h1>

        <p
          className="wasp-hero-sub"
          style={{
            fontSize: "1rem",
            color: "#777",
            lineHeight: 1.65,
            maxWidth: 620,
            margin: "0 auto 34px",
          }}
        >
          WASP learns your brand voice from 30 posts and replies to comments,
          DMs, and story replies.{" "}
          <br className="wasp-mobile-break" />
          Automatically. On time. Every time.
        </p>

        <Link
          href="/signup"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.9375rem",
            fontWeight: 500,
            color: "#fff",
            background: "#5B2B8C",
            padding: "13px 26px",
            borderRadius: 8,
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Start for free
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 7h8M8 4l3 3-3 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <p style={{ marginTop: 12, fontSize: "0.8125rem", color: "#999" }}>
          50 replies/month. No card required.
        </p>
      </div>

      {/* Desktop IG window */}
      <div className="wasp-hero-window-wrap">
        <IGDesktopWindow />
      </div>
    </section>
  );
}
