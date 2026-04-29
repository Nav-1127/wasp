"use client";

/* DemoSection — v11 (translated from Claude Design WASP Demo Section.html, 2026-04-30).
 * 7-scene narrative: volume problem → WASP reads → smart select → reply at scale
 * → comment-to-DM → sting triggers → outcome. 44-second loop, rAF-driven.
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────
   SCENE TIMING
───────────────────────────────────────────────── */
const SCENE_DUR = [5000, 4000, 6000, 8000, 8000, 8000, 5000]; // ms each
const SCENE_START = SCENE_DUR.reduce<number[]>((acc, d, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENE_DUR[i - 1]);
  return acc;
}, []);
const TOTAL = SCENE_DUR.reduce((a, b) => a + b, 0); // 44 000 ms
const LOOP_GAP = 2500;

const CAPTIONS = [
  "8,492 comments. Most never get a reply.",
  "WASP reads every one.",
  "And picks the ones worth answering.",
  "Replies in your voice. Instantly.",
  "When public isn't right, WASP takes it private.",
  "Set rules. WASP enforces them.",
  "Every comment answered. Every DM handled. In your voice.",
];

const LABELS = [
  "Volume problem",
  "WASP enters",
  "Smart selection",
  "Reply at scale",
  "Comment to DM",
  "Sting triggers",
  "Outcome",
];

/* ─────────────────────────────────────────────────
   COMMENT DATA
───────────────────────────────────────────────── */
type CommentItem = {
  id: number;
  user: string;
  bg: string;
  text: string;
  intent: "low" | "high";
  reply?: string;
};

const CORE: CommentItem[] = [
  { id: 1,  user: "paige_b",      bg: "#EDD9C3", text: "🔥🔥🔥",                                      intent: "low" },
  { id: 2,  user: "lily.k",       bg: "#EDCFC3", text: "what's the fabric? heavyweight?",              intent: "high", reply: "300gsm french terry, brushed inside. drops thursday at 11am 🤎" },
  { id: 3,  user: "j.fit",        bg: "#D9C3ED", text: "@maya.r u need this",                         intent: "low" },
  { id: 4,  user: "marcusss",     bg: "#C3CFED", text: "shipping to UK?",                             intent: "high", reply: "5-7 business days to the UK with tracking. free over $150." },
  { id: 5,  user: "raina.k",      bg: "#C3D9ED", text: "🤎",                                          intent: "low" },
  { id: 6,  user: "runwithdee",   bg: "#C3EDC9", text: "true to size?",                               intent: "high", reply: "runs true on the chest, slightly relaxed in the body." },
  { id: 7,  user: "nathan.r",     bg: "#C3EDED", text: "obsessed",                                   intent: "low" },
  { id: 8,  user: "kai.j",        bg: "#EDEDC3", text: "@blake.m 👀",                                 intent: "low" },
  { id: 9,  user: "sasha.styles", bg: "#EDC3D9", text: "any plans to restock the cream sweater?",    intent: "high", reply: "yes! restock drops monday. want early access?" },
  { id: 10, user: "ecoswaps",     bg: "#CFC3ED", text: "where's the cotton sourced?",                 intent: "high", reply: "GOTS-certified farm in Portugal. with us since 2022." },
];

const EXTENDED: CommentItem[] = [
  ...CORE,
  { id: 11, user: "zoe.m",   bg: "#EDD9C3", text: "😍😍",                          intent: "low" },
  { id: 12, user: "tomas.r", bg: "#C3CFED", text: "price on this one?",             intent: "high" },
  { id: 13, user: "mia.w",   bg: "#D9C3ED", text: "need this in my life",           intent: "low" },
  { id: 14, user: "alex.f",  bg: "#C3D9ED", text: "do you ship to Canada?",         intent: "high" },
  { id: 15, user: "cam.d",   bg: "#C3EDC9", text: "❤️",                             intent: "low" },
  { id: 16, user: "priya.k", bg: "#EDC3D9", text: "any other colourways planned?",  intent: "high" },
  { id: 17, user: "lucas.b", bg: "#EDEDC3", text: "@joe.s cop or not",              intent: "low" },
  { id: 18, user: "hana.t",  bg: "#C3EDED", text: "machine washable?",              intent: "high" },
  { id: 19, user: "jay.p",   bg: "#CFC3ED", text: "🙌",                             intent: "low" },
  { id: 20, user: "nina.s",  bg: "#EDD9C3", text: "link??",                         intent: "high" },
];

/* ─────────────────────────────────────────────────
   SCENE TIMER HOOK
───────────────────────────────────────────────── */
function useSceneTimer() {
  const [state, setState] = useState({ scene: 0, progress: 0 });
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    function tick(ts: number) {
      if (!startRef.current) startRef.current = ts;
      let elapsed = (ts - startRef.current) % (TOTAL + LOOP_GAP);
      if (elapsed > TOTAL) elapsed = TOTAL - 1;

      let scene = 0;
      for (let i = SCENE_START.length - 1; i >= 0; i--) {
        if (elapsed >= SCENE_START[i]) { scene = i; break; }
      }
      const progress = Math.min((elapsed - SCENE_START[scene]) / SCENE_DUR[scene], 1);
      setState(prev =>
        prev.scene === scene && Math.abs(prev.progress - progress) < 0.002
          ? prev
          : { scene, progress }
      );
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return state;
}

/* ─────────────────────────────────────────────────
   SHARED IG ATOMS
───────────────────────────────────────────────── */
const igFont = "-apple-system, 'Helvetica Neue', Arial, sans-serif";

function VBadge() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 13, height: 13, background: "#0095F6", borderRadius: "50%", flexShrink: 0, verticalAlign: "middle", marginLeft: 2 }}>
      <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
        <path d="M1 3l2 2 3-4" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Avatar({ initial, bg, size = 26 }: { initial: string; bg: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg || "#DDD5C8", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: igFont, fontSize: size * 0.42, fontWeight: 700, color: "#fff" }}>
      {initial}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   IG WINDOW SHELL (post header + image + meta)
   children = the scrollable comment area
───────────────────────────────────────────────── */
function IGShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 318, background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.04),0 10px 32px rgba(0,0,0,0.11),0 28px 72px rgba(0,0,0,0.07)", display: "flex", flexDirection: "column" }}>

      {/* Post header */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", gap: 10, flexShrink: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", padding: 2, flexShrink: 0 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1C1C1E", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: igFont, fontSize: 10, fontWeight: 700, color: "#fff", border: "2.5px solid #fff" }}>N</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: igFont, fontSize: 13, fontWeight: 600, color: "#000", display: "flex", alignItems: "center", gap: 4 }}>northform <VBadge /></div>
          <div style={{ fontFamily: igFont, fontSize: 12, fontWeight: 600, color: "#0095F6" }}>Following</div>
        </div>
        <div style={{ fontFamily: igFont, fontSize: 18, color: "#000", letterSpacing: -1 }}>···</div>
      </div>

      {/* Photo */}
      <div style={{ position: "relative", width: "100%", height: 155, flexShrink: 0, background: "#DDD5C8" }}>
        <Image
          src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=636&h=310&fit=crop&q=80&auto=format"
          alt="northform drop 06 hoodie"
          fill
          sizes="318px"
          style={{ objectFit: "cover" }}
          unoptimized
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", padding: "8px 12px 4px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ cursor: "pointer" }}><svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="#000" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          <span style={{ cursor: "pointer" }}><svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#000" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
          <span style={{ cursor: "pointer" }}><svg width="21" height="21" viewBox="0 0 24 24" fill="none"><line x1="22" y1="2" x2="11" y2="13" stroke="#000" strokeWidth="1.75" strokeLinecap="round" /><polygon points="22 2 15 22 11 13 2 9 22 2" stroke="#000" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg></span>
        </div>
        <div style={{ marginLeft: "auto", cursor: "pointer" }}><svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="#000" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
      </div>

      {/* Likes + caption + view-all */}
      <div style={{ padding: "0 12px 2px", fontFamily: igFont, fontSize: 13, fontWeight: 600, color: "#000", flexShrink: 0 }}>12,847 likes</div>
      <div style={{ padding: "0 12px 3px", fontFamily: igFont, fontSize: 13, lineHeight: 1.4, color: "#000", flexShrink: 0 }}>
        <span style={{ fontWeight: 600 }}>northform</span>{" "}drop 06 french terry hoodie. thursday 11am EST 🤎
      </div>
      <div style={{ padding: "0 12px 6px", fontFamily: igFont, fontSize: 13, color: "#8e8e8e", flexShrink: 0 }}>View all 8,492 comments</div>
      <div style={{ height: 1, background: "#dbdbdb", flexShrink: 0 }} />

      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   COMMENT ROW (reusable across scenes)
───────────────────────────────────────────────── */
function CRow({ c, glow = false, replyVisible = false, replyText = "" }: {
  c: CommentItem;
  glow?: boolean;
  replyVisible?: boolean;
  replyText?: string;
}) {
  return (
    <div style={{
      background: glow ? "rgba(91,43,140,0.055)" : "transparent",
      borderLeft: glow ? "2px solid rgba(91,43,140,0.22)" : "2px solid transparent",
      transition: "background 0.55s ease, border-color 0.55s ease",
    }}>
      <div style={{ display: "flex", gap: 8, padding: "6px 12px 2px", alignItems: "flex-start" }}>
        <Avatar initial={c.user[0].toUpperCase()} bg={c.bg} size={24} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: igFont, fontSize: 12.5, color: "#000", lineHeight: 1.35 }}>
            <b>{c.user}</b> {c.text}
          </div>
          <div style={{ display: "flex", gap: 10, fontFamily: igFont, fontSize: 11, color: "#8e8e8e", marginTop: 2 }}>
            <span>2h</span><span style={{ cursor: "pointer" }}>Reply</span>
          </div>
        </div>
      </div>

      {replyText && (
        <div style={{
          padding: "2px 12px 6px 44px",
          maxHeight: replyVisible ? 70 : 0,
          overflow: "hidden",
          opacity: replyVisible ? 1 : 0,
          transform: replyVisible ? "translateY(0)" : "translateY(4px)",
          transition: "max-height 0.4s ease, opacity 0.4s ease, transform 0.4s ease",
        }}>
          <div style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#1C1C1E", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: igFont, fontSize: 8, fontWeight: 700, color: "#fff" }}>N</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: igFont, fontSize: 12.5, color: "#000", lineHeight: 1.35 }}>
                <b>northform</b><VBadge /> {replyText}
              </div>
              <div style={{ display: "flex", gap: 10, fontFamily: igFont, fontSize: 11, color: "#8e8e8e", marginTop: 2 }}><span>just now</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   ADD COMMENT BAR
───────────────────────────────────────────────── */
function AddCommentBar() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 12px 9px", borderTop: "1px solid #dbdbdb", flexShrink: 0 }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#E8E0D4", flexShrink: 0 }} />
      <div style={{ flex: 1, fontFamily: igFont, fontSize: 13, color: "#8e8e8e" }}>Add a comment…</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   SCENE 0 — fast scroll (volume problem)
───────────────────────────────────────────────── */
function S0() {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const t0 = useRef<number | null>(null);

  useEffect(() => {
    function tick(ts: number) {
      if (!t0.current) t0.current = ts;
      const el = ref.current;
      if (el) {
        const max = el.scrollHeight - el.clientHeight;
        el.scrollTop = ((ts - t0.current) / 1000 * 85) % Math.max(max, 1);
      }
      raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  return (
    <>
      <div ref={ref} className="wasp-demo-no-sb" style={{ height: 230, overflowY: "scroll", flexShrink: 0 }}>
        {EXTENDED.map(c => <CRow key={c.id} c={c} />)}
        {EXTENDED.slice(0, 8).map(c => <CRow key={`x${c.id}`} c={c} />)}
      </div>
      <AddCommentBar />
    </>
  );
}

/* ─────────────────────────────────────────────────
   SCENE 1 — freeze + shimmer sweep (WASP enters)
───────────────────────────────────────────────── */
function S1({ progress }: { progress: number }) {
  const shimmered = progress > 0.65;
  return (
    <>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div className="wasp-demo-no-sb" style={{ height: 230, overflowY: "hidden" }}>
          {CORE.map(c => <CRow key={c.id} c={c} />)}
        </div>
        {!shimmered && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(105deg,transparent 20%,rgba(255,255,255,0.6) 50%,transparent 80%)",
              animation: "waspDemoShimmer 1.15s cubic-bezier(0.4,0,0.2,1) 0.25s forwards",
            }} />
          </div>
        )}
      </div>
      <AddCommentBar />
    </>
  );
}

/* ─────────────────────────────────────────────────
   SCENE 2 — glow on high-intent (smart selection)
───────────────────────────────────────────────── */
function S2({ progress }: { progress: number }) {
  const highPos = [1, 3, 5, 8, 9];
  return (
    <>
      <div className="wasp-demo-no-sb" style={{ height: 230, overflowY: "hidden", flexShrink: 0 }}>
        {CORE.map((c, i) => {
          const hIdx = highPos.indexOf(i);
          const glow = hIdx >= 0 && progress >= (hIdx / (highPos.length - 1)) * 0.65;
          return <CRow key={c.id} c={c} glow={glow} />;
        })}
      </div>
      <AddCommentBar />
    </>
  );
}

/* ─────────────────────────────────────────────────
   SCENE 3 — replies appear (reply at scale)
───────────────────────────────────────────────── */
function S3({ progress }: { progress: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);
  const elapsed = progress * 8;
  const times = [1.2, 2.2, 3.3, 4.4, 5.4];
  const highIds = [2, 4, 6, 9, 10];
  const visible = new Set(highIds.filter((_, i) => elapsed >= times[i]));

  useLayoutEffect(() => {
    if (ref.current && visible.size !== prevCount.current) {
      prevCount.current = visible.size;
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  });

  return (
    <>
      <div ref={ref} className="wasp-demo-no-sb" style={{ height: 230, overflowY: "scroll", flexShrink: 0 }}>
        {CORE.map(c => (
          <CRow
            key={c.id} c={c}
            glow={c.intent === "high"}
            replyVisible={visible.has(c.id)}
            replyText={c.reply || ""}
          />
        ))}
      </div>
      <AddCommentBar />
    </>
  );
}

/* ─────────────────────────────────────────────────
   SCENE 4 — comment to DM
───────────────────────────────────────────────── */
const DISCOUNT: CommentItem = { id: 99, user: "discount_dani", bg: "#F0C3C3", text: "can I get a discount code?", intent: "high" };

function DMThread({ elapsed }: { elapsed: number }) {
  const msgVisible = elapsed >= 5.2;
  const sentVisible = elapsed >= 6.1;
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "8px 12px", gap: 10, borderBottom: "1px solid #dbdbdb", flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#000" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <Avatar initial="D" bg="#F0C3C3" size={26} />
        <div style={{ fontFamily: igFont, fontSize: 13, fontWeight: 600, color: "#000" }}>discount_dani</div>
      </div>
      <div style={{ flex: 1, padding: "12px 12px 8px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "flex-end" }}>
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div style={{ background: "#efefef", borderRadius: "18px 18px 18px 4px", padding: "8px 12px", fontFamily: igFont, fontSize: 13, color: "#000", maxWidth: "80%" }}>
            can I get a discount code?
          </div>
        </div>
        <div style={{
          display: "flex", justifyContent: "flex-end",
          opacity: msgVisible ? 1 : 0,
          transform: msgVisible ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.45s ease, transform 0.45s ease",
        }}>
          <div style={{ background: "#3797F0", borderRadius: "18px 18px 4px 18px", padding: "8px 12px", fontFamily: igFont, fontSize: 13, color: "#fff", maxWidth: "88%" }}>
            hey! here's a code just for you: TERRY15. valid through sunday 🤎
          </div>
        </div>
        <div style={{
          display: "flex", justifyContent: "flex-end",
          fontFamily: igFont, fontSize: 11, color: "#8e8e8e",
          opacity: sentVisible ? 1 : 0,
          transition: "opacity 0.4s ease",
        }}>Sent</div>
      </div>
      <div style={{ borderTop: "1px solid #dbdbdb", padding: "8px 12px", display: "flex", flexShrink: 0 }}>
        <div style={{ flex: 1, background: "#efefef", borderRadius: 22, padding: "7px 14px", fontFamily: igFont, fontSize: 13, color: "#8e8e8e" }}>Message…</div>
      </div>
    </div>
  );
}

function S4({ progress }: { progress: number }) {
  const elapsed = progress * 8;
  const showReply = elapsed >= 2.2;
  const slide = elapsed >= 3.6 ? Math.min((elapsed - 3.6) / 0.75, 1) : 0;
  const eased = slide < 0.5 ? 2 * slide * slide : -1 + (4 - 2 * slide) * slide;

  return (
    <div style={{ height: 230, overflow: "hidden", flexShrink: 0, position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${-eased * 100}%)` }}>
        <div className="wasp-demo-no-sb" style={{ height: "100%", overflowY: "hidden", paddingTop: 4 }}>
          {CORE.slice(5, 8).map(c => <CRow key={c.id} c={c} />)}
          <CRow c={DISCOUNT} glow replyVisible={showReply} replyText="DMed you 👇" />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - eased) * 100}%)` }}>
        <DMThread elapsed={elapsed} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   SCENE 5 — sting triggers
───────────────────────────────────────────────── */
function S5({ progress }: { progress: number }) {
  const elapsed = progress * 8;
  const showFire = elapsed >= 3.6;
  const showSent = elapsed >= 5.1;

  return (
    <div style={{ height: 230, overflow: "hidden", flexShrink: 0, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>

      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: "#5B2B8C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#fff" /></svg>
        </div>
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, color: "#0A0A0A", letterSpacing: "0.01em" }}>Sting rules</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 5px rgba(34,197,94,0.55)" }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#777" }}>active</span>
        </div>
      </div>

      {/* Rule card */}
      <div style={{ background: "#FAFAF8", border: "1px solid #EBE5DC", borderRadius: 8, padding: "9px 11px", display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, color: "#999", width: 50, flexShrink: 0 }}>Keyword</span>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, fontWeight: 600, color: "#0A0A0A", background: "#EDE8FF", padding: "1px 8px", borderRadius: 4 }}>"link"</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, color: "#999", width: 50, flexShrink: 0 }}>Action</span>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: "#0A0A0A" }}>Send DM instantly</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10.5, color: "#999", width: 50, flexShrink: 0 }}>Message</span>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#777", fontStyle: "italic" }}>"Here's the link to our store…"</span>
        </div>
      </div>

      <div style={{ height: 1, background: "#EBE5DC" }} />

      {/* Live fire */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 6,
        opacity: showFire ? 1 : 0,
        transform: showFire ? "translateY(0)" : "translateY(5px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 500, color: "#999", textTransform: "uppercase", letterSpacing: "0.07em" }}>Live</div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 9px", background: "#F5F0FF", borderRadius: 7, border: "1px solid #DDD5F5" }}>
          <Avatar initial="A" bg="#C3EDC9" size={20} />
          <div style={{ flex: 1, fontFamily: igFont, fontSize: 12, color: "#000" }}><b>alex.m</b> link</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 500, color: "#5B2B8C", background: "rgba(91,43,140,0.1)", padding: "2px 7px", borderRadius: 9 }}>matched</div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 7, padding: "5px 9px", background: "#F0FFF4", borderRadius: 7, border: "1px solid #BBF7D0",
          opacity: showSent ? 1 : 0,
          transform: showSent ? "translateY(0)" : "translateY(4px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: "#15803d" }}>DM sent to alex.m</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   SCENE 6 — outcome (all answered)
───────────────────────────────────────────────── */
function S6() {
  return (
    <>
      <div className="wasp-demo-no-sb" style={{ height: 230, overflowY: "hidden", flexShrink: 0 }}>
        {CORE.map(c => (
          <CRow key={c.id} c={c} glow={c.intent === "high"} replyVisible={!!c.reply} replyText={c.reply || ""} />
        ))}
      </div>
      <AddCommentBar />
    </>
  );
}

/* ─────────────────────────────────────────────────
   WINDOW CONTENT — key forces remount on scene
   change so waspDemoFadeIn re-plays each time
───────────────────────────────────────────────── */
function WindowContent({ scene, progress }: { scene: number; progress: number }) {
  return (
    <div key={scene} style={{ animation: "waspDemoFadeIn 0.42s ease forwards", display: "flex", flexDirection: "column" }}>
      {scene === 0 && <S0 />}
      {scene === 1 && <S1 progress={progress} />}
      {scene === 2 && <S2 progress={progress} />}
      {scene === 3 && <S3 progress={progress} />}
      {scene === 4 && <S4 progress={progress} />}
      {scene === 5 && <S5 progress={progress} />}
      {scene === 6 && <S6 />}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   CAPTION (left column)
───────────────────────────────────────────────── */
function Caption({ scene, progress }: { scene: number; progress: number }) {
  const isOutcome = scene === 6;

  // Fade in 0-15%, hold 15-82%, fade out 82-100%
  let op = 1;
  if (progress < 0.15) op = progress / 0.15;
  else if (progress > 0.82) op = (1 - progress) / 0.18;

  return (
    <div className="wasp-demo-caption" style={{ display: "flex", flexDirection: "column" }}>

      {/* Scene counter */}
      <div style={{
        fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 500,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: "rgba(10,10,10,0.32)", marginBottom: 18,
        opacity: op, transition: "opacity 0.08s",
      }}>
        {String(scene + 1).padStart(2, "0")} / 07&nbsp;&nbsp;·&nbsp;&nbsp;{LABELS[scene]}
      </div>

      {/* Caption text — key forces re-mount so fade-in plays on each scene */}
      <div key={scene} style={{
        fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
        fontWeight: 700,
        fontSize: isOutcome ? "clamp(1.55rem,2.8vw,2.2rem)" : "clamp(1.8rem,3.2vw,2.6rem)",
        lineHeight: 1.18,
        color: "#0A0A0A",
        letterSpacing: "-0.02em",
        opacity: op,
        transition: "opacity 0.08s",
      }}>
        {CAPTIONS[scene]}
      </div>

      {/* CTA — outcome scene only */}
      {isOutcome && (
        <Link href="/signup" style={{
          display: "inline-flex", alignItems: "center", gap: 8, marginTop: 28,
          fontFamily: "Inter, sans-serif", fontSize: "0.9375rem", fontWeight: 500,
          color: "#fff", background: "#5B2B8C",
          padding: "13px 26px", borderRadius: 8,
          textDecoration: "none", alignSelf: "flex-start",
          opacity: progress > 0.25 ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}>
          Start free
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      )}

      {/* Progress bar */}
      <div className="wasp-demo-prog-bar" style={{ marginTop: 24, height: 1.5, background: "rgba(10,10,10,0.1)", borderRadius: 2, maxWidth: 260, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: "#5B2B8C", borderRadius: 2, transition: "width 0.05s linear" }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   DEMO SECTION ROOT
───────────────────────────────────────────────── */
export default function DemoSectionLight() {
  const { scene, progress } = useSceneTimer();

  return (
    <section id="demo" style={{ width: "100%", paddingBottom: 80, borderTop: "1px solid #EBE5DC" }}>
      <style>{`
        @keyframes waspDemoFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes waspDemoShimmer {
          from { transform: translateX(-120%); }
          to   { transform: translateX(220%); }
        }
        .wasp-demo-no-sb { scrollbar-width: none; -ms-overflow-style: none; }
        .wasp-demo-no-sb::-webkit-scrollbar { display: none; }

        @media (max-width: 760px) {
          .wasp-demo-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .wasp-demo-caption { order: -1; text-align: center; }
          .wasp-demo-caption .wasp-demo-prog-bar { margin-left: auto; margin-right: auto; }
          .wasp-demo-inner { padding: 0 24px !important; }
          .wasp-demo-header { padding: 48px 24px 36px !important; }
        }
      `}</style>

      {/* Section header */}
      <div className="wasp-demo-header" style={{ textAlign: "center", padding: "64px 48px 48px" }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(10,10,10,0.35)", marginBottom: 14 }}>
          Product demo
        </div>
        <h2 style={{
          fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
          fontWeight: 700,
          fontSize: "clamp(2rem,4vw,3rem)",
          lineHeight: 1.1,
          color: "#0A0A0A",
          letterSpacing: "-0.025em",
          margin: 0,
        }}>
          See WASP work.{" "}
          <em style={{ color: "rgba(10,10,10,0.42)" }}>Scene by scene.</em>
        </h2>
      </div>

      {/* 2-col grid: caption left, IG window right */}
      <div className="wasp-demo-inner" style={{ maxWidth: 1080, margin: "0 auto", padding: "0 48px" }}>
        <div className="wasp-demo-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <Caption scene={scene} progress={progress} />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <IGShell>
              <WindowContent scene={scene} progress={progress} />
            </IGShell>
          </div>
        </div>
      </div>
    </section>
  );
}
