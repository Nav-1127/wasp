"use client";

/* DemoSection — v12 (2026-04-30)
 * Layout: centered headline → scene caption above window → desktop IG window → 7-seg progress bar
 * Desktop window: photo left (42%) + scrollable comments right (58%), 560px tall
 * Progress bar: 7 clickable segments, fills as each scene plays
 * Headline: "Watch it work." (Bricolage 800)
 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────
   SCENE TIMING
───────────────────────────────────────────────── */
const SCENE_DUR = [5000, 4000, 6000, 8000, 8000, 8000, 5000];
const SCENE_START = SCENE_DUR.reduce<number[]>((acc, d, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENE_DUR[i - 1]);
  return acc;
}, []);
const TOTAL = SCENE_DUR.reduce((a, b) => a + b, 0);
const LOOP_GAP = 2500;

const AREA_H = 376; // scene content height inside desktop window right panel

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
  { id: 7,  user: "nathan.r",     bg: "#C3EDED", text: "obsessed",                                    intent: "low" },
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
   SCENE TIMER HOOK — with jump support
───────────────────────────────────────────────── */
function useSceneTimer() {
  const [state, setState] = useState({ scene: 0, progress: 0 });
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const jumpTo = useCallback((sceneIndex: number) => {
    startRef.current = performance.now() - SCENE_START[sceneIndex];
  }, []);

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
          ? prev : { scene, progress }
      );
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return { scene: state.scene, progress: state.progress, jumpTo };
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
   DESKTOP IG SHELL — photo left, comments right
───────────────────────────────────────────────── */
function IGDesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="wasp-demo-window" style={{
      width: "100%",
      background: "#fff",
      borderRadius: 16,
      overflow: "hidden",
      boxShadow: "0 2px 6px rgba(0,0,0,0.04),0 10px 32px rgba(0,0,0,0.11),0 28px 72px rgba(0,0,0,0.07)",
      display: "flex",
      height: 560,
    }}>
      {/* Left: post photo */}
      <div className="wasp-demo-photo" style={{ width: "42%", flexShrink: 0, position: "relative", background: "#DDD5C8", borderRight: "1px solid #dbdbdb" }}>
        <Image
          src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=636&h=800&fit=crop&q=80&auto=format"
          alt="northform drop 06 hoodie"
          fill
          style={{ objectFit: "cover" }}
          unoptimized
        />
      </div>

      {/* Right: header + meta + scene content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Post header */}
        <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 10, borderBottom: "1px solid #dbdbdb", flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", padding: 2, flexShrink: 0 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#1C1C1E", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: igFont, fontSize: 10, fontWeight: 700, color: "#fff", border: "2.5px solid #fff" }}>N</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: igFont, fontSize: 13, fontWeight: 600, color: "#000", display: "flex", alignItems: "center", gap: 4 }}>northform <VBadge /></div>
            <div style={{ fontFamily: igFont, fontSize: 12, fontWeight: 600, color: "#0095F6" }}>Following</div>
          </div>
          <div style={{ fontFamily: igFont, fontSize: 18, color: "#000", letterSpacing: -1 }}>···</div>
        </div>

        {/* Likes + caption + view-all */}
        <div style={{ padding: "8px 16px 6px", flexShrink: 0 }}>
          <div style={{ fontFamily: igFont, fontSize: 13, fontWeight: 600, color: "#000", marginBottom: 2 }}>12,847 likes</div>
          <div style={{ fontFamily: igFont, fontSize: 13, lineHeight: 1.4, color: "#000", marginBottom: 2 }}>
            <span style={{ fontWeight: 600 }}>northform</span>{" "}drop 06 french terry hoodie. thursday 11am EST 🤎
          </div>
          <div style={{ fontFamily: igFont, fontSize: 13, color: "#8e8e8e" }}>View all 8,492 comments</div>
        </div>
        <div style={{ height: 1, background: "#dbdbdb", flexShrink: 0 }} />

        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   COMMENT ROW
───────────────────────────────────────────────── */
function CRow({ c, glow = false, replyVisible = false, replyText = "" }: {
  c: CommentItem; glow?: boolean; replyVisible?: boolean; replyText?: string;
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

function AddCommentBar() {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 12px 9px", borderTop: "1px solid #dbdbdb", flexShrink: 0 }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#E8E0D4", flexShrink: 0 }} />
      <div style={{ flex: 1, fontFamily: igFont, fontSize: 13, color: "#8e8e8e" }}>Add a comment…</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   SCENES 0 – 6
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
      <div ref={ref} className="wasp-demo-no-sb wasp-demo-area" style={{ overflowY: "scroll", flexShrink: 0 }}>
        {EXTENDED.map(c => <CRow key={c.id} c={c} />)}
        {EXTENDED.slice(0, 8).map(c => <CRow key={`x${c.id}`} c={c} />)}
      </div>
      <AddCommentBar />
    </>
  );
}

function S1({ progress }: { progress: number }) {
  const shimmered = progress > 0.65;
  return (
    <>
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div className="wasp-demo-no-sb wasp-demo-area" style={{ overflowY: "hidden" }}>
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

function S2({ progress }: { progress: number }) {
  const highPos = [1, 3, 5, 8, 9];
  return (
    <>
      <div className="wasp-demo-no-sb wasp-demo-area" style={{ overflowY: "hidden", flexShrink: 0 }}>
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
      <div ref={ref} className="wasp-demo-no-sb wasp-demo-area" style={{ overflowY: "scroll", flexShrink: 0 }}>
        {CORE.map(c => (
          <CRow key={c.id} c={c} glow={c.intent === "high"} replyVisible={visible.has(c.id)} replyText={c.reply || ""} />
        ))}
      </div>
      <AddCommentBar />
    </>
  );
}

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
        <div style={{ display: "flex", justifyContent: "flex-end", opacity: msgVisible ? 1 : 0, transform: msgVisible ? "translateY(0)" : "translateY(8px)", transition: "opacity 0.45s ease, transform 0.45s ease" }}>
          <div style={{ background: "#3797F0", borderRadius: "18px 18px 4px 18px", padding: "8px 12px", fontFamily: igFont, fontSize: 13, color: "#fff", maxWidth: "88%" }}>
            hey! here's a code just for you: TERRY15. valid through sunday 🤎
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", fontFamily: igFont, fontSize: 11, color: "#8e8e8e", opacity: sentVisible ? 1 : 0, transition: "opacity 0.4s ease" }}>Sent</div>
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
    <div className="wasp-demo-area" style={{ overflow: "hidden", flexShrink: 0, position: "relative" }}>
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

function S5({ progress }: { progress: number }) {
  const elapsed = progress * 8;
  const showFire = elapsed >= 3.6;
  const showSent = elapsed >= 5.1;
  return (
    <div className="wasp-demo-area" style={{ overflow: "hidden", flexShrink: 0, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
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
      <div style={{ display: "flex", flexDirection: "column", gap: 6, opacity: showFire ? 1 : 0, transform: showFire ? "translateY(0)" : "translateY(5px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 500, color: "#999", textTransform: "uppercase", letterSpacing: "0.07em" }}>Live</div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 9px", background: "#F5F0FF", borderRadius: 7, border: "1px solid #DDD5F5" }}>
          <Avatar initial="A" bg="#C3EDC9" size={20} />
          <div style={{ flex: 1, fontFamily: igFont, fontSize: 12, color: "#000" }}><b>alex.m</b> link</div>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 500, color: "#5B2B8C", background: "rgba(91,43,140,0.1)", padding: "2px 7px", borderRadius: 9 }}>matched</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 9px", background: "#F0FFF4", borderRadius: 7, border: "1px solid #BBF7D0", opacity: showSent ? 1 : 0, transform: showSent ? "translateY(0)" : "translateY(4px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: "#15803d" }}>DM sent to alex.m</span>
        </div>
      </div>
    </div>
  );
}

function S6() {
  return (
    <>
      <div className="wasp-demo-no-sb wasp-demo-area" style={{ overflowY: "hidden", flexShrink: 0 }}>
        {CORE.map(c => (
          <CRow key={c.id} c={c} glow={c.intent === "high"} replyVisible={!!c.reply} replyText={c.reply || ""} />
        ))}
      </div>
      <AddCommentBar />
    </>
  );
}

function WindowContent({ scene, progress }: { scene: number; progress: number }) {
  return (
    <div key={scene} style={{ animation: "waspDemoFadeIn 0.42s ease forwards", display: "flex", flexDirection: "column", flex: 1 }}>
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
   SCENE CAPTION (above window)
───────────────────────────────────────────────── */
function SceneCaption({ scene, progress }: { scene: number; progress: number }) {
  const isOutcome = scene === 6;
  let op = 1;
  if (progress < 0.15) op = progress / 0.15;
  else if (progress > 0.82) op = (1 - progress) / 0.18;
  return (
    <div style={{ textAlign: "center", marginBottom: 28, minHeight: 100 }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(10,10,10,0.35)", marginBottom: 10, opacity: op, transition: "opacity 0.08s" }}>
        {String(scene + 1).padStart(2, "0")} / 07&nbsp;&nbsp;·&nbsp;&nbsp;{LABELS[scene]}
      </div>
      <div key={scene} style={{
        fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
        fontWeight: 700,
        fontSize: isOutcome ? "clamp(1.5rem,2.2vw,2rem)" : "clamp(1.6rem,2.5vw,2.25rem)",
        lineHeight: 1.2,
        color: "#0A0A0A",
        letterSpacing: "-0.02em",
        opacity: op,
        transition: "opacity 0.08s",
        maxWidth: 600,
        margin: "0 auto",
        animation: "waspDemoFadeIn 0.42s ease forwards",
      }}>
        {CAPTIONS[scene]}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   7-SEGMENT PROGRESS BAR
───────────────────────────────────────────────── */
function ProgressBar({ scene, progress, onJump }: {
  scene: number; progress: number; onJump: (i: number) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 6, width: "100%", marginTop: 18 }}>
      {LABELS.map((label, i) => {
        const isActive = i === scene;
        const isDone = i < scene;
        const fill = isDone ? 1 : isActive ? progress : 0;
        return (
          <div key={i} onClick={() => onJump(i)} style={{ flex: 1, cursor: "pointer" }}>
            <div style={{ height: 3, background: "rgba(10,10,10,0.1)", borderRadius: 2, overflow: "hidden", marginBottom: 7 }}>
              <div style={{
                height: "100%",
                width: `${fill * 100}%`,
                background: isDone ? "rgba(10,10,10,0.45)" : "#0A0A0A",
                borderRadius: 2,
                transition: isActive ? "width 0.1s linear" : "width 0.3s ease",
              }} />
            </div>
            <div className="wasp-demo-seg-label" style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 10,
              color: isActive ? "#0A0A0A" : "rgba(10,10,10,0.35)",
              fontWeight: isActive ? 600 : 400,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   DEMO SECTION ROOT
───────────────────────────────────────────────── */
export default function DemoSectionLight() {
  const { scene, progress, jumpTo } = useSceneTimer();

  return (
    <section id="how-it-works" style={{ width: "100%", borderTop: "1px solid #EBE5DC" }}>
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
        .wasp-demo-area { height: ${AREA_H}px; }

        @media (max-width: 760px) {
          .wasp-demo-photo { display: none !important; }
          .wasp-demo-window { height: auto !important; }
          .wasp-demo-area { height: 260px !important; }
          .wasp-demo-seg-label { display: none; }
          .wasp-demo-wrap { padding: 48px 20px 60px !important; }
        }
      `}</style>

      <div className="wasp-demo-wrap" style={{ maxWidth: 1060, margin: "0 auto", padding: "40px 40px 80px" }}>

        {/* Headline */}
        <h2 style={{
          fontFamily: "var(--font-bricolage), 'Bricolage Grotesque', sans-serif",
          fontWeight: 800,
          fontSize: "clamp(2.5rem, 5vw, 4rem)",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          color: "#0A0A0A",
          textAlign: "center",
          marginBottom: 40,
        }}>
          Watch it work.
        </h2>

        {/* Scene caption above window */}
        <SceneCaption scene={scene} progress={progress} />

        {/* 7-segment progress bar */}
        <ProgressBar scene={scene} progress={progress} onJump={jumpTo} />

        {/* Desktop IG window */}
        <div style={{ marginTop: 16 }}>
          <IGDesktopShell>
            <WindowContent scene={scene} progress={progress} />
          </IGDesktopShell>
        </div>

        {/* Outcome CTA — appears on scene 6 */}
        <div style={{
          marginTop: 32,
          display: "flex",
          justifyContent: "center",
          opacity: scene === 6 && progress > 0.25 ? 1 : 0,
          transition: "opacity 0.5s ease",
          pointerEvents: scene === 6 ? "auto" : "none",
        }}>
          <Link href="/signup" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: "Inter, sans-serif", fontSize: "0.9375rem", fontWeight: 500,
            color: "#fff", background: "#0A0A0A",
            padding: "13px 26px", borderRadius: 8, textDecoration: "none",
          }}>
            Start free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}
