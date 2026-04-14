"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatFollowerCount } from "@/lib/instagram";

// ─── Types ────────────────────────────────────────────────────────────────────

type AccountType = "brand" | "creator";

interface InstagramData {
  instagram_handle: string | null;
  profile_pic_url: string | null;
  follower_count: number | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  url: string;
}

interface PersonalityData {
  description: string;
  phrases: string;
  tone: number;   // 0 = casual, 100 = formal
  energy: number; // 0 = playful, 100 = professional
}

// ── Personality profile returned by /api/analyze-personality ──────────────────
interface PersonalityProfile {
  voice_summary: string;
  traits: {
    formal_casual: number;
    serious_playful: number;
    reserved_bold: number;
    minimal_expressive: number;
    corporate_streetwise: number;
  };
  language_patterns: {
    emoji_usage: string;
    emoji_types: string[];
    sentence_length: string;
    slang_level: string;
    signature_phrases: string[];
    capitalization: string;
  };
  engagement_style: {
    to_compliments: string;
    to_product_questions: string;
    to_negative_comments: string;
    to_generic_comments: string;
  };
  content_themes: { theme: string; percentage: number }[];
  sample_responses: {
    to_compliment: string;
    to_product_question: string;
    to_negative_comment: string;
    to_hype_comment: string;
    to_purchase_confirmation: string;
  };
}

interface GoalData {
  interaction_type: "comment" | "dm" | "story_reply";
  goal: string;
}

// ─── Step progress indicator ──────────────────────────────────────────────────

const TOTAL_STEPS = 5;

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === current ? "24px" : "8px",
            backgroundColor: i <= current ? "#5C6B00" : "#D5CFC3",
          }}
        />
      ))}
      <span className="ml-2 text-xs text-[#9A9080]">
        Step {current + 1} of {TOTAL_STEPS}
      </span>
    </div>
  );
}

// ─── Step 0 — Account Type ────────────────────────────────────────────────────

function Step0({ onNext }: { onNext: (type: AccountType) => void }) {
  const [selected, setSelected] = useState<AccountType | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selected || loading) return;
    setLoading(true);
    try {
      await fetch("/api/onboarding/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 0, data: { account_type: selected } }),
      });
      onNext(selected);
    } catch {
      setLoading(false);
    }
  }

  const cards: { type: AccountType; emoji: string; title: string; subtitle: string }[] = [
    {
      type: "brand",
      emoji: "🏪",
      title: "I sell products or services",
      subtitle: "Drive sales, promote products, and convert followers into customers.",
    },
    {
      type: "creator",
      emoji: "🎨",
      title: "I create content and grow my audience",
      subtitle: "Grow engagement, build community, and monetize your following.",
    },
  ];

  return (
    <div>
      <h1
        className="text-3xl font-black text-[#1A1A1A] mb-2"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        How will you use WASP?
      </h1>
      <p className="text-[#6B6058] mb-8">
        This helps us tailor your experience. You can always change it later.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {cards.map((card) => (
          <button
            key={card.type}
            onClick={() => setSelected(card.type)}
            className="text-left border-2 rounded-2xl p-6 transition-all"
            style={{
              borderColor: selected === card.type ? "#5C6B00" : "#D5CFC3",
              background: selected === card.type ? "rgba(212,255,0,0.08)" : "#EDE8DE",
            }}
          >
            <div className="text-3xl mb-3">{card.emoji}</div>
            <p
              className="font-bold text-[#1A1A1A] mb-2 leading-tight"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              {card.title}
            </p>
            <p className="text-sm text-[#6B6058] leading-relaxed">{card.subtitle}</p>
            {selected === card.type && (
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#5C6B00] uppercase tracking-wider">
                <span className="w-3.5 h-3.5 rounded-full bg-[#5C6B00] flex items-center justify-center text-white text-[8px]">✓</span>
                Selected
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!selected || loading}
        className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
      >
        {loading ? "Saving…" : "Continue →"}
      </button>
    </div>
  );
}

// ─── Step 1 — Connect Instagram ───────────────────────────────────────────────

const ERROR_MESSAGES: Record<string, { title: string; body: string; guide?: string[] }> = {
  no_business_account: {
    title: "Instagram Business or Creator account required",
    body: "WASP can only connect to Instagram Business or Creator accounts. Your current account is a Personal account.",
    guide: [
      "Open Instagram → tap your profile → tap the menu (☰)",
      "Go to Settings → Account",
      'Tap "Switch to Professional Account"',
      'Choose "Business" or "Creator"',
      "Come back here and connect again",
    ],
  },
  instagram_denied: {
    title: "Connection cancelled",
    body: "You cancelled the Instagram connection. Tap the button below to try again.",
  },
  save_failed: {
    title: "Something went wrong",
    body: "We connected to Instagram but couldn't save your details. Please try again.",
  },
  instagram_failed: {
    title: "Connection failed",
    body: "Something went wrong with the Instagram connection. Please try again.",
  },
};

function Step1({
  accountType,
  instagram,
  oauthError,
  onNext,
  onBack,
  onDisconnect,
}: {
  accountType: AccountType;
  instagram: InstagramData | null;
  oauthError: string | null;
  onNext: () => void;
  onBack: () => void;
  onDisconnect: () => void;
}) {
  const [disconnecting, setDisconnecting] = useState(false);
  const isMock =
    process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true" ||
    !process.env.NEXT_PUBLIC_META_APP_ID;

  const isConnected = !!instagram?.instagram_handle;
  const errorInfo = oauthError ? ERROR_MESSAGES[oauthError] : null;

  async function handleDisconnect() {
    setDisconnecting(true);
    try {
      await fetch("/api/instagram/disconnect", { method: "POST" });
      onDisconnect();
    } finally {
      setDisconnecting(false);
    }
  }

  return (
    <div>
      <h1
        className="text-3xl font-black text-[#1A1A1A] mb-2"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        Connect your Instagram
      </h1>
      <p className="text-[#6B6058] mb-6">
        {accountType === "brand"
          ? "Link your Instagram Business account. WASP will analyse your content and engage with your audience."
          : "Link your Instagram Creator account. WASP will study your content personality and reply like you."}
      </p>

      {/* Error state */}
      {errorInfo && !isConnected && (
        <div className="border border-orange-200 bg-orange-50 rounded-2xl p-5 mb-5">
          <p className="font-semibold text-orange-800 text-sm mb-1">{errorInfo.title}</p>
          <p className="text-xs text-orange-700 mb-3">{errorInfo.body}</p>
          {errorInfo.guide && (
            <ol className="flex flex-col gap-1">
              {errorInfo.guide.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-orange-700">
                  <span className="font-bold flex-shrink-0">{i + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Connected state */}
      {isConnected ? (
        <div className="mb-6">
          <div
            className="border-2 rounded-2xl p-5 mb-4"
            style={{ borderColor: "#5C6B00", background: "rgba(212,255,0,0.08)" }}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                style={{ backgroundColor: "#5C6B00" }}
              >
                {instagram?.profile_pic_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={instagram.profile_pic_url}
                    alt={instagram.instagram_handle ?? ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (instagram?.instagram_handle?.[0] ?? "?").toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="font-black text-[#1A1A1A] truncate"
                  style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                >
                  @{instagram?.instagram_handle}
                </p>
                {instagram?.follower_count != null && (
                  <p className="text-sm text-[#6B6058]">
                    {formatFollowerCount(instagram.follower_count)} followers
                  </p>
                )}
              </div>

              <div className="flex-shrink-0 flex items-center gap-1.5 bg-[#5C6B00] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="text-[#D4FF00]">✓</span>
                Connected
              </div>
            </div>
          </div>

          {/* What WASP analysis callout */}
          <div className="border border-[#5C6B00]/25 bg-[#D4FF00]/10 rounded-xl px-4 py-3.5 mb-4">
            <p className="text-xs font-semibold text-[#5C6B00] mb-2">
              WASP will now analyse your content
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { icon: "📝", text: "Your last 50 posts & captions" },
                { icon: "💬", text: "Your existing comment replies" },
                { icon: "🧠", text: "Your tone, energy & phrases" },
              ].map((item) => (
                <div key={item.icon} className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <p className="text-xs text-[#6B6058]">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#5C6B00] font-medium mt-2.5">
              → Your content personality report will be ready in the next step.
            </p>
          </div>

          <button
            onClick={handleDisconnect}
            disabled={disconnecting}
            className="text-xs text-[#9A9080] hover:text-red-500 transition-colors"
          >
            {disconnecting ? "Disconnecting…" : "Disconnect this account"}
          </button>
        </div>
      ) : (
        /* Not connected state */
        <div className="mb-6">
          {/* What gets analysed */}
          <div className="border border-[#5C6B00]/25 bg-[#D4FF00]/10 rounded-2xl p-5 mb-5">
            <p className="text-xs font-semibold text-[#5C6B00] uppercase tracking-wider mb-3">
              What WASP analyses when you connect
            </p>
            <div className="flex flex-col gap-2">
              {[
                { icon: "📝", text: "Your last 50 posts & captions" },
                { icon: "💬", text: "Your existing comment replies" },
                { icon: "🧠", text: "Your tone, energy & phrases you use" },
              ].map((item) => (
                <div key={item.icon} className="flex items-center gap-2.5">
                  <span className="text-sm">{item.icon}</span>
                  <p className="text-xs text-[#6B6058]">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#5C6B00] font-medium mt-3">
              → WASP auto-builds your content personality profile in the next step.
            </p>
          </div>

          {isMock && (
            <div className="flex items-center gap-2 bg-[#EDE8DE] border border-[#D5CFC3] rounded-xl px-4 py-2.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse flex-shrink-0" />
              <p className="text-xs text-[#6B6058]">
                <span className="font-semibold">Dev mode:</span> Mock connection active — no real Meta credentials needed.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {isConnected ? (
          <button
            onClick={onNext}
            className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors"
          >
            Continue →
          </button>
        ) : (
          <>
            <a
              href="/api/instagram/connect"
              className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors text-center block"
            >
              {isMock ? "Connect Instagram (Mock)" : "Connect Instagram"}
            </a>
          </>
        )}
        <button
          onClick={onBack}
          className="text-sm text-[#9A9080] hover:text-[#5C6B00] transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}

// ─── Step 2 — Content Personality Analysis ───────────────────────────────────

const TRAIT_LABELS: Record<keyof PersonalityProfile["traits"], [string, string]> = {
  formal_casual:        ["Formal",    "Casual"],
  serious_playful:      ["Serious",   "Playful"],
  reserved_bold:        ["Reserved",  "Bold"],
  minimal_expressive:   ["Minimal",   "Expressive"],
  corporate_streetwise: ["Corporate", "Streetwise"],
};

const LOADING_MESSAGES = [
  "Reading your captions…",
  "Studying how you reply to comments…",
  "Spotting your signature phrases…",
  "Mapping your emoji habits…",
  "Detecting your vibe…",
  "Building your personality profile…",
  "Almost there…",
];

function TraitSlider({
  traitKey,
  value,
  onChange,
}: {
  traitKey: keyof PersonalityProfile["traits"];
  value: number;
  onChange?: (v: number) => void;
}) {
  const [left, right] = TRAIT_LABELS[traitKey];
  const pct = ((value - 1) / 9) * 100;
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs text-[#9A9080]">{left}</span>
        <span className="text-xs text-[#9A9080]">{right}</span>
      </div>
      <div className="relative h-2 rounded-full" style={{ backgroundColor: "#D5CFC3" }}>
        <div
          className="absolute left-0 top-0 h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: "#5C6B00" }}
        />
        {onChange ? (
          <input
            type="range"
            min={1}
            max={10}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
          />
        ) : null}
      </div>
    </div>
  );
}

function ChatBubble({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-[#9A9080] uppercase tracking-wider">{label}</span>
      <div
        className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[#1A1A1A] max-w-xs"
        style={{ backgroundColor: "#EDE8DE", border: "1px solid #D5CFC3" }}
      >
        {text}
      </div>
    </div>
  );
}

function Step2({
  accountType,
  onNext,
  onBack,
}: {
  accountType: AccountType;
  onNext: () => void;
  onBack: () => void;
}) {
  type Phase =
    | "loading"      // running analysis
    | "report"       // showing AI result
    | "tweak"        // editing sliders inline
    | "evolve"       // text field: describe aspiration
    | "fresh";       // free-text, start from scratch

  const [phase,   setPhase]   = useState<Phase>("loading");
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [editedTraits, setEditedTraits] = useState<PersonalityProfile["traits"] | null>(null);
  const [evolveText, setEvolveText]     = useState("");
  const [freshText,  setFreshText]      = useState("");
  const [loadingMsg, setLoadingMsg]     = useState(LOADING_MESSAGES[0]);
  const [msgIndex,   setMsgIndex]       = useState(0);
  const [saving,     setSaving]         = useState(false);
  const [error,      setError]          = useState("");
  const [personalityPrompt, setPersonalityPrompt] = useState("");

  // Cycle loading messages
  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => {
        const next = Math.min(prev + 1, LOADING_MESSAGES.length - 1);
        setLoadingMsg(LOADING_MESSAGES[next]);
        return next;
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [phase]);

  // Run analysis on mount
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/analyze-personality", { method: "POST" });
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error ?? "Analysis failed");
        setProfile(json.profile);
        setPersonalityPrompt(json.personality_prompt);
        setEditedTraits({ ...json.profile.traits });
        setPhase("report");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Analysis failed";
        console.error("Personality analysis failed:", msg);
        setError(msg);
        setPhase("fresh"); // fall back to manual entry
      }
    })();
  }, []);

  async function saveAndContinue(prompt: string, prof: PersonalityProfile | null) {
    setSaving(true);
    await fetch("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: 2,
        data: {
          personality_prompt: prompt,
          personality_profile: prof ?? {},
        },
      }),
    });
    setSaving(false);
    onNext();
  }

  async function handleAccept() {
    await saveAndContinue(personalityPrompt, profile);
  }

  async function handleTweakConfirm() {
    if (!profile || !editedTraits) return;
    // Merge edited traits into profile and regenerate prompt client-side
    const merged = { ...profile, traits: editedTraits };
    const updatedPrompt = buildPromptFromProfile(merged);
    setPersonalityPrompt(updatedPrompt);
    await saveAndContinue(updatedPrompt, merged);
  }

  async function handleEvolve() {
    if (!evolveText.trim()) { setError("Describe how you want your content to sound."); return; }
    setSaving(true);
    setError("");
    try {
      // Re-run analysis with aspiration blend
      const res  = await fetch("/api/analyze-personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evolve_prompt: evolveText }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Analysis failed");
      setProfile(json.profile);
      setPersonalityPrompt(json.personality_prompt);
      setEditedTraits({ ...json.profile.traits });
      setPhase("report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleFresh() {
    if (!freshText.trim()) { setError("Please describe your content personality."); return; }
    setSaving(true);
    setError("");
    try {
      const res  = await fetch("/api/analyze-personality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fresh_description: freshText }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Analysis failed");
      setProfile(json.profile);
      setPersonalityPrompt(json.personality_prompt);
      setEditedTraits({ ...json.profile.traits });
      setPhase("report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {/* Animated wasp */}
        <div className="relative mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: "#D4FF00", animation: "pulse 1.5s ease-in-out infinite" }}
          >
            🐝
          </div>
          <div
            className="absolute -inset-2 rounded-full border-2 border-[#5C6B00]/30"
            style={{ animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite" }}
          />
        </div>
        <h1
          className="text-2xl font-black text-[#1A1A1A] mb-2"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          WASP is studying your content
        </h1>
        <p className="text-sm text-[#5C6B00] font-medium mb-8 min-h-[20px] transition-all">
          {loadingMsg}
        </p>
        {/* Progress bar */}
        <div className="w-64 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#D5CFC3" }}>
          <div
            className="h-full rounded-full"
            style={{
              backgroundColor: "#5C6B00",
              width: `${((msgIndex + 1) / LOADING_MESSAGES.length) * 100}%`,
              transition: "width 2.2s ease",
            }}
          />
        </div>
        <p className="text-xs text-[#9A9080] mt-4">This usually takes 10–15 seconds</p>
      </div>
    );
  }

  // ── "Start fresh" screen ───────────────────────────────────────────────────
  if (phase === "fresh") {
    return (
      <div>
        <h1
          className="text-3xl font-black text-[#1A1A1A] mb-2"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Describe your content personality
        </h1>
        <p className="text-[#6B6058] mb-6">
          Write how you want WASP to sound. Be as specific as you like — tone, energy, phrases, how you handle different comments.
        </p>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">{error}</p>
        )}
        <textarea
          value={freshText}
          onChange={(e) => setFreshText(e.target.value)}
          rows={5}
          placeholder={
            accountType === "brand"
              ? "e.g. We're direct and energetic — no fluff. We use casual language, lots of 'you', and we're confident without being arrogant. We use fire and 💯 emojis. When people ask about products we give the link fast."
              : "e.g. Super casual and real. I write in lowercase mostly, use 'omg' and 'lol' a lot. I keep it short and punchy. When people compliment me I'm grateful but not gushy."
          }
          className="w-full bg-[#F5F0E8] border border-[#D5CFC3] rounded-xl px-4 py-3 text-[#1A1A1A] placeholder-[#9A9080] text-sm focus:outline-none focus:border-[#5C6B00] transition-colors resize-none mb-6"
        />
        <div className="flex flex-col gap-3">
          <button
            onClick={handleFresh}
            disabled={saving}
            className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
          >
            {saving ? "Building your personality…" : "Build my personality →"}
          </button>
          <button onClick={onBack} className="text-sm text-[#9A9080] hover:text-[#5C6B00] transition-colors">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ── "Evolve it" screen ─────────────────────────────────────────────────────
  if (phase === "evolve") {
    return (
      <div>
        <h1
          className="text-3xl font-black text-[#1A1A1A] mb-2"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          How do you want to evolve it?
        </h1>
        <p className="text-[#6B6058] mb-6">
          WASP will blend your current content personality with this new direction.
        </p>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">{error}</p>
        )}
        <textarea
          value={evolveText}
          onChange={(e) => setEvolveText(e.target.value)}
          rows={4}
          placeholder='e.g. "I want to sound more confident and bold, less hesitant. Still casual but more decisive."'
          className="w-full bg-[#F5F0E8] border border-[#D5CFC3] rounded-xl px-4 py-3 text-[#1A1A1A] placeholder-[#9A9080] text-sm focus:outline-none focus:border-[#5C6B00] transition-colors resize-none mb-6"
        />
        <div className="flex flex-col gap-3">
          <button
            onClick={handleEvolve}
            disabled={saving}
            className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
          >
            {saving ? "Evolving your personality…" : "Evolve it →"}
          </button>
          <button onClick={() => { setError(""); setPhase("report"); }} className="text-sm text-[#9A9080] hover:text-[#5C6B00] transition-colors">
            ← Back to report
          </button>
        </div>
      </div>
    );
  }

  // ── Report screen (+ tweak mode) ───────────────────────────────────────────
  if (!profile) return null;

  const isTweaking = phase === "tweak";
  const displayTraits = isTweaking && editedTraits ? editedTraits : profile.traits;

  return (
    <div>
      <h1
        className="text-3xl font-black text-[#1A1A1A] mb-2"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        Your content personality
      </h1>

      {/* Voice summary */}
      <div
        className="border border-[#5C6B00]/30 bg-[#D4FF00]/10 rounded-2xl px-5 py-4 mb-6"
      >
        <p className="text-[10px] text-[#5C6B00] font-semibold uppercase tracking-widest mb-1">WASP says</p>
        <p className="text-sm text-[#1A1A1A] leading-relaxed font-medium">{profile.voice_summary}</p>
      </div>

      {/* Personality traits */}
      <div className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl p-5 mb-4">
        <p className="text-xs font-semibold text-[#6B6058] uppercase tracking-wider mb-4">
          Personality traits {isTweaking && <span className="text-[#5C6B00]">— drag to adjust</span>}
        </p>
        <div className="flex flex-col gap-4">
          {(Object.keys(TRAIT_LABELS) as Array<keyof PersonalityProfile["traits"]>).map((key) => (
            <TraitSlider
              key={key}
              traitKey={key}
              value={displayTraits[key]}
              onChange={isTweaking && editedTraits
                ? (v) => setEditedTraits({ ...editedTraits, [key]: v })
                : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Language patterns */}
      <div className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl p-5 mb-4">
        <p className="text-xs font-semibold text-[#6B6058] uppercase tracking-wider mb-3">Language patterns</p>
        <div className="flex flex-wrap gap-2">
          {[
            `Emoji: ${profile.language_patterns.emoji_usage}`,
            `Sentences: ${profile.language_patterns.sentence_length}`,
            `Slang: ${profile.language_patterns.slang_level}`,
            `Caps: ${profile.language_patterns.capitalization}`,
            ...(profile.language_patterns.emoji_types?.slice(0, 4) ?? []),
            ...(profile.language_patterns.signature_phrases?.slice(0, 3).map((p) => `"${p}"`) ?? []),
          ].map((tag, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1 rounded-full border"
              style={{ backgroundColor: "#F5F0E8", borderColor: "#D5CFC3", color: "#6B6058" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Content themes */}
      {profile.content_themes?.length > 0 && (
        <div className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl p-5 mb-4">
          <p className="text-xs font-semibold text-[#6B6058] uppercase tracking-wider mb-3">Content themes</p>
          <div className="flex flex-col gap-2">
            {profile.content_themes.slice(0, 5).map((t) => (
              <div key={t.theme} className="flex items-center gap-3">
                <span className="text-xs text-[#1A1A1A] w-32 flex-shrink-0 truncate">{t.theme}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#D5CFC3" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${t.percentage}%`, backgroundColor: "#5C6B00" }}
                  />
                </div>
                <span className="text-xs text-[#9A9080] w-8 text-right">{t.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample responses */}
      <div className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl p-5 mb-6">
        <p className="text-xs font-semibold text-[#6B6058] uppercase tracking-wider mb-4">How WASP will reply for you</p>
        <div className="flex flex-col gap-4">
          <ChatBubble label="To a compliment" text={profile.sample_responses.to_compliment} />
          <ChatBubble label="To a product/content question" text={profile.sample_responses.to_product_question} />
          <ChatBubble label="To a negative comment" text={profile.sample_responses.to_negative_comment} />
          <ChatBubble label="To a hype comment 🔥" text={profile.sample_responses.to_hype_comment} />
          <ChatBubble label="To 'just bought / subscribed!'" text={profile.sample_responses.to_purchase_confirmation} />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">{error}</p>
      )}

      {/* Four choice buttons */}
      {!isTweaking ? (
        <div className="flex flex-col gap-3">
          <button
            onClick={handleAccept}
            disabled={saving}
            className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
          >
            {saving ? "Saving…" : "This is me — continue →"}
          </button>
          <button
            onClick={() => { setError(""); setPhase("tweak"); }}
            className="w-full border-2 border-[#D5CFC3] bg-[#EDE8DE] text-[#1A1A1A] font-semibold px-7 py-3 rounded-xl text-sm hover:border-[#5C6B00] transition-colors"
          >
            Tweak it
          </button>
          <button
            onClick={() => { setError(""); setPhase("evolve"); }}
            className="w-full border-2 border-[#D5CFC3] bg-[#EDE8DE] text-[#1A1A1A] font-semibold px-7 py-3 rounded-xl text-sm hover:border-[#5C6B00] transition-colors"
          >
            Evolve it
          </button>
          <button
            onClick={() => { setError(""); setPhase("fresh"); }}
            className="text-sm text-[#9A9080] hover:text-[#5C6B00] transition-colors"
          >
            Start fresh →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            onClick={handleTweakConfirm}
            disabled={saving}
            className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
          >
            {saving ? "Saving…" : "Confirm tweaks →"}
          </button>
          <button
            onClick={() => { setError(""); setPhase("report"); }}
            className="text-sm text-[#9A9080] hover:text-[#5C6B00] transition-colors"
          >
            ← Cancel tweaks
          </button>
        </div>
      )}
    </div>
  );
}

// ── Helper: rebuild personality_prompt from an edited profile (client-side) ────
function buildPromptFromProfile(profile: PersonalityProfile): string {
  const t = profile.traits;
  const l = profile.language_patterns;
  const e = profile.engagement_style;

  const toneLabel    = t.formal_casual      >= 7 ? "casual and relaxed"      : t.formal_casual      <= 3 ? "formal and polished"        : "balanced in tone";
  const playfulLabel = t.serious_playful    >= 7 ? "playful and fun"          : t.serious_playful    <= 3 ? "serious and measured"        : "a mix of serious and playful";
  const boldLabel    = t.reserved_bold      >= 7 ? "bold and direct"          : t.reserved_bold      <= 3 ? "reserved and thoughtful"     : "confident but not overbearing";
  const expressLabel = t.minimal_expressive >= 7 ? "expressive and emotive"   : t.minimal_expressive <= 3 ? "minimal and understated"      : "moderately expressive";
  const streetLabel  = t.corporate_streetwise >= 7 ? "street-savvy and culturally sharp" : t.corporate_streetwise <= 3 ? "professional and polished" : "authentic and approachable";

  const emojiNote = l.emoji_usage === "none"
    ? "Never use emojis."
    : l.emoji_usage === "minimal"
      ? `Use emojis sparingly${l.emoji_types?.length ? ` — typically ${l.emoji_types.slice(0, 3).join(" ")}` : ""}.`
      : l.emoji_usage === "moderate"
        ? `Use emojis naturally${l.emoji_types?.length ? ` — favourites include ${l.emoji_types.slice(0, 4).join(" ")}` : ""}.`
        : `Use emojis freely${l.emoji_types?.length ? ` — ${l.emoji_types.slice(0, 5).join(" ")} are regulars` : ""}.`;

  const sentenceNote = `Sentences are ${l.sentence_length === "very short" ? "very short and punchy" : l.sentence_length === "short" ? "short and to the point" : l.sentence_length === "medium" ? "medium length" : "detailed and thorough"}.`;

  const phrasesNote = l.signature_phrases?.length
    ? `Often use: ${l.signature_phrases.map((p: string) => `"${p}"`).join(", ")}.`
    : "";

  return `${profile.voice_summary}

Personality: ${toneLabel}, ${playfulLabel}, ${boldLabel}, ${expressLabel}, ${streetLabel}.

${emojiNote} ${sentenceNote} ${phrasesNote}

To compliments: ${e.to_compliments}
To product/content questions: ${e.to_product_questions}
To negative comments: ${e.to_negative_comments}
To generic hype: ${e.to_generic_comments}

Keep every response to 1-3 sentences max. Sound like a real person, not a brand account.`.trim();
}

// ─── Step 3 — Products & Links ────────────────────────────────────────────────

function Step3({
  accountType,
  onNext,
  onBack,
}: {
  accountType: AccountType;
  onNext: () => void;
  onBack: () => void;
}) {
  const isBrand = accountType === "brand";
  const [products, setProducts] = useState<Product[]>([
    { id: crypto.randomUUID(), name: "", description: "", url: "" },
  ]);
  const [loading, setLoading] = useState(false);

  function addProduct() {
    setProducts([...products, { id: crypto.randomUUID(), name: "", description: "", url: "" }]);
  }

  function removeProduct(id: string) {
    setProducts(products.filter((p) => p.id !== id));
  }

  function updateProduct(id: string, field: keyof Product, value: string) {
    setProducts(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  async function handleNext(skip = false) {
    setLoading(true);
    const filtered = skip ? [] : products.filter((p) => p.name.trim());
    await fetch("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: 3, data: { products: filtered } }),
    });
    onNext();
  }

  return (
    <div>
      <h1
        className="text-3xl font-black text-[#1A1A1A] mb-2"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        {isBrand ? "Add your products & services" : "Add your links & offers"}
      </h1>
      <p className="text-[#6B6058] mb-8">
        {isBrand
          ? "WASP uses this to mention your products naturally in replies and drive traffic at the right moments."
          : "Add any links, offers, or paid products you want WASP to promote when the moment's right."}
      </p>

      <div className="flex flex-col gap-4 mb-6">
        {products.map((product, i) => (
          <div key={product.id} className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#6B6058] uppercase tracking-wider">
                {isBrand ? `Product / Service ${i + 1}` : `Link / Offer ${i + 1}`}
              </span>
              {products.length > 1 && (
                <button
                  onClick={() => removeProduct(product.id)}
                  className="text-xs text-[#9A9080] hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="flex flex-col gap-3">
              <input
                type="text" value={product.name}
                onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                placeholder={isBrand ? "Product or service name" : "Link or offer name"}
                className="w-full bg-[#F5F0E8] border border-[#D5CFC3] rounded-xl px-4 py-2.5 text-[#1A1A1A] placeholder-[#9A9080] text-sm focus:outline-none focus:border-[#5C6B00] transition-colors"
              />
              <input
                type="text" value={product.description}
                onChange={(e) => updateProduct(product.id, "description", e.target.value)}
                placeholder={isBrand ? "Short description (optional)" : "What is this? (optional)"}
                className="w-full bg-[#F5F0E8] border border-[#D5CFC3] rounded-xl px-4 py-2.5 text-[#1A1A1A] placeholder-[#9A9080] text-sm focus:outline-none focus:border-[#5C6B00] transition-colors"
              />
              <input
                type="url" value={product.url}
                onChange={(e) => updateProduct(product.id, "url", e.target.value)}
                placeholder="https://yoursite.com/product (optional)"
                className="w-full bg-[#F5F0E8] border border-[#D5CFC3] rounded-xl px-4 py-2.5 text-[#1A1A1A] placeholder-[#9A9080] text-sm focus:outline-none focus:border-[#5C6B00] transition-colors"
              />
            </div>
          </div>
        ))}

        <button
          onClick={addProduct}
          className="border border-dashed border-[#D5CFC3] rounded-2xl py-3 text-sm text-[#6B6058] hover:border-[#5C6B00] hover:text-[#5C6B00] transition-colors"
        >
          + Add another
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleNext(false)}
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
        >
          {loading ? "Saving…" : "Continue →"}
        </button>
        {!isBrand && (
          <button
            onClick={() => handleNext(true)}
            disabled={loading}
            className="text-sm text-[#9A9080] hover:text-[#5C6B00] transition-colors py-1"
          >
            Skip — I don&apos;t sell anything
          </button>
        )}
        <button onClick={onBack} className="text-sm text-[#9A9080] hover:text-[#5C6B00] transition-colors">
          ← Back
        </button>
      </div>
    </div>
  );
}

// ─── Step 4 — Engagement Goals ────────────────────────────────────────────────

const BRAND_GOALS = [
  { id: "engage",         label: "Build brand awareness",      description: "Genuine replies that grow affinity" },
  { id: "drive_to_dm",   label: "Convert comments to DMs",     description: "Move conversations to private" },
  { id: "send_link",     label: "Drive traffic to website",    description: "Share product links at the right moment" },
  { id: "collect_email", label: "Collect leads & emails",      description: "Ask interested followers for their email" },
  { id: "book_call",     label: "Book discovery calls",        description: "Invite qualified leads to connect" },
];

const CREATOR_GOALS = [
  { id: "engage",            label: "Grow my engagement",          description: "Real replies that build community" },
  { id: "build_community",   label: "Build community",             description: "Make followers feel seen and heard" },
  { id: "drive_clicks",      label: "Drive link clicks",           description: "Promote your link-in-bio naturally" },
  { id: "collect_email",     label: "Collect email subscribers",   description: "Grow your newsletter list" },
  { id: "convert_followers", label: "Convert followers to fans",   description: "Deepen connection with your audience" },
];

const ENGAGEMENT_LEVELS = [
  {
    id: "smart_select",
    label: "Smart select",
    description: "WASP replies to questions, compliments, meaningful feedback, and purchase intent. Skips emojis and friend tags.",
    recommended: true,
  },
  {
    id: "reply_all",
    label: "Reply to all",
    description: "Respond to every comment, no exceptions.",
    recommended: false,
  },
  {
    id: "questions_only",
    label: "Questions only",
    description: "Only reply when someone asks a question or requests information.",
    recommended: false,
  },
  {
    id: "manual_pick",
    label: "Manual pick",
    description: "WASP drafts replies for all comments, but you choose which ones to send from the dashboard.",
    recommended: false,
  },
];

function Step4({
  accountType,
  onNext,
  onBack,
  onSetupStingTrigger,
}: {
  accountType: AccountType;
  onNext: () => void;
  onBack: () => void;
  onSetupStingTrigger: () => void;
}) {
  const goals = accountType === "brand" ? BRAND_GOALS : CREATOR_GOALS;
  const [selected, setSelected]             = useState<Set<string>>(new Set(["engage"]));
  const [engagementLevel, setEngagementLevel] = useState("smart_select");
  const [loading, setLoading]               = useState(false);

  function toggleGoal(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleFinish(goToStingTrigger = false) {
    setLoading(true);
    const types: Array<"comment" | "dm" | "story_reply"> = ["comment", "dm", "story_reply"];
    const primaryGoal = Array.from(selected)[0];
    const goalRows: GoalData[] = types.map((type, i) => ({
      interaction_type: type,
      goal: Array.from(selected)[Math.min(i, selected.size - 1)] ?? primaryGoal,
    }));

    await fetch("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: 4,
        data: { goals: goalRows, engagement_level: engagementLevel },
      }),
    });

    if (goToStingTrigger) {
      onSetupStingTrigger();
    } else {
      onNext();
    }
  }

  return (
    <div>
      <h1
        className="text-3xl font-black text-[#1A1A1A] mb-2"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        What do you want WASP to do?
      </h1>
      <p className="text-[#6B6058] mb-8">
        {accountType === "brand"
          ? "Choose your engagement goals. WASP will weave these into every reply naturally."
          : "Tell WASP what matters most. It'll prioritise these in every conversation."}
      </p>

      {/* Goals */}
      <div className="flex flex-col gap-3 mb-10">
        {goals.map((goal) => {
          const active = selected.has(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className="flex items-center gap-4 text-left border-2 rounded-2xl p-4 transition-all"
              style={{
                borderColor: active ? "#5C6B00" : "#D5CFC3",
                background: active ? "rgba(212,255,0,0.08)" : "#EDE8DE",
              }}
            >
              <div
                className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all"
                style={{
                  borderColor: active ? "#5C6B00" : "#D5CFC3",
                  backgroundColor: active ? "#5C6B00" : "transparent",
                }}
              >
                {active && <span className="text-white text-[10px]">✓</span>}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#1A1A1A] text-sm">{goal.label}</p>
                <p className="text-xs text-[#6B6058] mt-0.5">{goal.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Engagement Level */}
      <div className="mb-10">
        <h2
          className="text-base font-black text-[#1A1A1A] mb-1"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          How should WASP handle comment volume?
        </h2>
        <p className="text-xs text-[#6B6058] mb-4">
          For DMs and story replies, WASP always responds — these are high-intent by nature.
        </p>
        <div className="flex flex-col gap-2">
          {ENGAGEMENT_LEVELS.map((level) => {
            const active = engagementLevel === level.id;
            return (
              <button
                key={level.id}
                onClick={() => setEngagementLevel(level.id)}
                className="flex items-start gap-4 text-left border-2 rounded-2xl p-4 transition-all"
                style={{
                  borderColor: active ? "#5C6B00" : "#D5CFC3",
                  background: active ? "rgba(212,255,0,0.08)" : "#EDE8DE",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-all"
                  style={{
                    borderColor: active ? "#5C6B00" : "#D5CFC3",
                    backgroundColor: active ? "#5C6B00" : "transparent",
                  }}
                >
                  {active && <span className="text-white text-[10px]">✓</span>}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#1A1A1A] text-sm">{level.label}</p>
                    {level.recommended && (
                      <span className="text-[10px] bg-[#D4FF00]/40 text-[#5C6B00] font-semibold px-2 py-0.5 rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B6058] mt-0.5">{level.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sting Trigger teaser */}
      <div
        className="border-2 rounded-2xl p-5 mb-8"
        style={{ borderColor: "#D5CFC3", background: "#EDE8DE" }}
      >
        <p className="text-sm font-bold text-[#1A1A1A] mb-1">⚡ Auto-DM people who ask for links?</p>
        <p className="text-xs text-[#6B6058] mb-4">
          Set up a Sting Trigger — when someone comments asking for a link or info, WASP
          replies publicly and sends them a DM automatically.
        </p>
        <button
          onClick={() => handleFinish(true)}
          disabled={loading}
          className="text-xs font-semibold text-[#5C6B00] hover:text-[#1A1A1A] transition-colors underline underline-offset-2"
        >
          Set up my first Sting Trigger →
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleFinish(false)}
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
        >
          {loading ? "Finishing setup…" : "Finish setup 🐝"}
        </button>
        <button onClick={onBack} className="text-sm text-[#9A9080] hover:text-[#5C6B00] transition-colors">
          ← Back
        </button>
      </div>
    </div>
  );
}

// ─── Root — with URL param handling ──────────────────────────────────────────

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType>("brand");
  const [instagram, setInstagram] = useState<InstagramData | null>(null);
  const [loaded, setLoaded] = useState(false);

  // URL params from OAuth redirects
  const justConnected = searchParams.get("instagram") === "connected";
  const oauthError = searchParams.get("error");

  const loadExistingData = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding/save");
      const { account } = await res.json();
      if (account) {
        setAccountType(account.account_type ?? "brand");
        setInstagram({
          instagram_handle: account.instagram_handle ?? null,
          profile_pic_url: account.profile_pic_url ?? null,
          follower_count: account.follower_count ?? null,
        });

        const savedStep = Math.min(Math.max(account.onboarding_step ?? 0, 0), 4);

        // If returning from OAuth (connected or error), show Step 1 to confirm
        if (justConnected || (oauthError && savedStep <= 2)) {
          setStep(1);
        } else {
          setStep(savedStep);
        }
      }
    } catch {
      // no-op
    } finally {
      setLoaded(true);
    }
  }, [justConnected, oauthError]);

  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

  function handleComplete() {
    window.location.href = "/dashboard";
  }

  function handleSetupStingTrigger() {
    window.location.href = "/sting-triggers?new=true";
  }

  function handleDisconnect() {
    setInstagram(null);
    // Remove URL params
    router.replace("/onboarding");
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5F0E8" }}>
        <div className="w-6 h-6 rounded-full border-2 border-[#D5CFC3] border-t-[#5C6B00] animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-5 pt-10 pb-16"
      style={{ backgroundColor: "#F5F0E8" }}
    >
      {/* Logo */}
      <div className="mb-7 flex items-center gap-1.5">
        <span
          className="text-4xl font-black tracking-tighter text-[#1A1A1A]"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          WASP
        </span>
        <span className="text-2xl leading-none">⚡</span>
      </div>

      <div className="w-full max-w-lg">
        <StepDots current={step} />

        {step === 0 && (
          <Step0
            onNext={(type) => {
              setAccountType(type);
              setStep(1);
            }}
          />
        )}

        {step === 1 && (
          <Step1
            accountType={accountType}
            instagram={instagram}
            oauthError={oauthError}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
            onDisconnect={handleDisconnect}
          />
        )}

        {step === 2 && (
          <Step2
            accountType={accountType}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <Step3
            accountType={accountType}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <Step4
            accountType={accountType}
            onNext={handleComplete}
            onBack={() => setStep(3)}
            onSetupStingTrigger={handleSetupStingTrigger}
          />
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}
