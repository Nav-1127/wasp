"use client";

import { useState, useEffect, useCallback } from "react";
// Note: no supabase import needed here — all data ops go through API routes
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

type AccountType = "brand" | "creator";

interface Product {
  id: string;
  name: string;
  description: string;
  url: string;
}

interface PersonalityData {
  description: string;
  phrases: string;
  tone: number; // 0 = casual, 100 = formal
  energy: number; // 0 = playful, 100 = professional
}

interface GoalData {
  interaction_type: "comment" | "dm" | "story_reply";
  goal: string;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

const TOTAL_STEPS = 5; // 0–4

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
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
              backgroundColor: selected === card.type ? "#D4FF00/10" : "#EDE8DE",
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

// ─── Step 1 — Connect Instagram (Phase 2b placeholder) ────────────────────────

function Step1({
  accountType,
  onNext,
  onBack,
}: {
  accountType: AccountType;
  onNext: () => void;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSkip() {
    setLoading(true);
    await fetch("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: 1, data: {} }),
    });
    onNext();
  }

  return (
    <div>
      <h1
        className="text-3xl font-black text-[#1A1A1A] mb-2"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        Connect your Instagram
      </h1>
      <p className="text-[#6B6058] mb-8">
        {accountType === "brand"
          ? "Link your brand's Instagram Business account so WASP can monitor and respond to comments and DMs."
          : "Link your Instagram Creator account so WASP can engage with your audience automatically."}
      </p>

      {/* What WASP will analyze */}
      <div className="border border-[#5C6B00]/25 bg-[#D4FF00]/10 rounded-2xl p-5 mb-5">
        <p className="text-xs font-semibold text-[#5C6B00] uppercase tracking-wider mb-3">
          What WASP analyzes when you connect
        </p>
        <div className="flex flex-col gap-2">
          {[
            { icon: "📝", text: "Your last 50 posts & captions" },
            { icon: "💬", text: "Your existing comment replies" },
            { icon: "🧠", text: "Your tone, energy, and phrases you use" },
          ].map((item) => (
            <div key={item.icon} className="flex items-center gap-2.5">
              <span className="text-sm">{item.icon}</span>
              <p className="text-xs text-[#6B6058]">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#5C6B00] font-medium mt-3">
          → WASP auto-fills your voice profile in the next step. You just review it.
        </p>
      </div>

      {/* Placeholder card */}
      <div className="border-2 border-dashed border-[#D5CFC3] rounded-2xl p-6 text-center mb-6">
        <div className="text-3xl mb-2">📸</div>
        <p
          className="font-bold text-[#1A1A1A] mb-1.5"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Instagram OAuth
        </p>
        <p className="text-sm text-[#6B6058] mb-4">
          Secure connection via Meta's official API. No passwords stored.
        </p>
        <div className="inline-flex items-center gap-2 bg-[#EDE8DE] border border-[#D5CFC3] rounded-full px-4 py-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D4FF00] animate-pulse" />
          <span className="text-xs text-[#6B6058] font-medium">Coming in the next update</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          disabled
          className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm opacity-40 cursor-not-allowed"
        >
          Connect Instagram
        </button>
        <button
          onClick={handleSkip}
          disabled={loading}
          className="w-full border border-[#D5CFC3] bg-transparent text-[#6B6058] font-medium px-7 py-3 rounded-xl text-sm hover:border-[#5C6B00] hover:text-[#5C6B00] transition-colors disabled:opacity-40"
        >
          {loading ? "Saving…" : "Skip for now →"}
        </button>
      </div>

      <button
        onClick={onBack}
        className="mt-4 text-sm text-[#9A9080] hover:text-[#5C6B00] transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}

// ─── Step 2 — Brand Voice / Personality ───────────────────────────────────────

function Step2({
  accountType,
  onNext,
  onBack,
}: {
  accountType: AccountType;
  onNext: () => void;
  onBack: () => void;
}) {
  const [data, setData] = useState<PersonalityData>({
    description: "",
    phrases: "",
    tone: 30,
    energy: 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isBrand = accountType === "brand";

  async function handleNext() {
    if (!data.description.trim()) {
      setError("Please describe your voice so WASP can sound like you.");
      return;
    }
    setLoading(true);
    setError("");

    const personalityProfile = {
      tone: data.tone,
      energy: data.energy,
      phrases: data.phrases,
    };
    const personalityPrompt = `${data.description}${data.phrases ? ` Common phrases I use: ${data.phrases}.` : ""} Tone: ${data.tone < 40 ? "casual" : data.tone > 60 ? "formal" : "balanced"}. Energy: ${data.energy < 40 ? "playful" : data.energy > 60 ? "professional" : "balanced"}.`;

    await fetch("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        step: 2,
        data: { personality_prompt: personalityPrompt, personality_profile: personalityProfile },
      }),
    });
    onNext();
  }

  return (
    <div>
      <h1
        className="text-3xl font-black text-[#1A1A1A] mb-2"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        {isBrand ? "What's your brand voice?" : "What's your content style?"}
      </h1>
      <p className="text-[#6B6058] mb-5">
        {isBrand
          ? "WASP will study this and write replies that sound exactly like you — not robotic, not generic."
          : "WASP will match your style perfectly so your audience can't tell the difference."}
      </p>

      {/* Profile analysis note */}
      <div className="flex items-start gap-3 border border-[#5C6B00]/25 bg-[#D4FF00]/10 rounded-xl px-4 py-3.5 mb-6">
        <span className="text-base flex-shrink-0 mt-0.5">🔍</span>
        <p className="text-xs text-[#5C6B00] leading-relaxed">
          <span className="font-semibold">Once you connect Instagram,</span> WASP will automatically analyze your posts, captions, and comment replies to pre-fill this for you. For now, fill it in manually — you can always update it later.
        </p>
      </div>

      <div className="flex flex-col gap-5 mb-6">
        <div>
          <label className="block text-xs font-semibold text-[#6B6058] mb-1.5 uppercase tracking-wider">
            {isBrand ? "Describe how your brand talks to your audience *" : "Describe how you talk to your audience *"}
          </label>
          <textarea
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            rows={4}
            placeholder={
              isBrand
                ? "e.g. We're direct and energetic — no fluff, just results. We use 'you' a lot, never 'one'. We're confident but never arrogant."
                : "e.g. I'm super casual and real. I swear sometimes, I use a lot of 'omg' and 'lol'. I keep it short and punchy."
            }
            className="w-full bg-[#F5F0E8] border border-[#D5CFC3] rounded-xl px-4 py-3 text-[#1A1A1A] placeholder-[#9A9080] text-sm focus:outline-none focus:border-[#5C6B00] transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#6B6058] mb-1.5 uppercase tracking-wider">
            Phrases or expressions you often use{" "}
            <span className="normal-case font-normal text-[#9A9080]">(optional)</span>
          </label>
          <input
            type="text"
            value={data.phrases}
            onChange={(e) => setData({ ...data, phrases: e.target.value })}
            placeholder={isBrand ? 'e.g. "built different", "the real deal", "no cap"' : 'e.g. "bestie", "let\'s go!", "that\'s the vibe"'}
            className="w-full bg-[#F5F0E8] border border-[#D5CFC3] rounded-xl px-4 py-3 text-[#1A1A1A] placeholder-[#9A9080] text-sm focus:outline-none focus:border-[#5C6B00] transition-colors"
          />
        </div>

        {/* Sliders */}
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-semibold text-[#6B6058] uppercase tracking-wider">Tone</label>
              <span className="text-xs text-[#9A9080]">
                {data.tone < 40 ? "Casual" : data.tone > 60 ? "Formal" : "Balanced"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={data.tone}
              onChange={(e) => setData({ ...data, tone: Number(e.target.value) })}
              className="w-full accent-[#5C6B00]"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-[#9A9080]">Casual</span>
              <span className="text-xs text-[#9A9080]">Formal</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-semibold text-[#6B6058] uppercase tracking-wider">Energy</label>
              <span className="text-xs text-[#9A9080]">
                {data.energy < 40 ? "Playful" : data.energy > 60 ? "Professional" : "Balanced"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={data.energy}
              onChange={(e) => setData({ ...data, energy: Number(e.target.value) })}
              className="w-full accent-[#5C6B00]"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-[#9A9080]">Playful</span>
              <span className="text-xs text-[#9A9080]">Professional</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleNext}
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
        >
          {loading ? "Saving…" : "Continue →"}
        </button>
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
          <div
            key={product.id}
            className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl p-4"
          >
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
                type="text"
                value={product.name}
                onChange={(e) => updateProduct(product.id, "name", e.target.value)}
                placeholder={isBrand ? "Product or service name" : "Link or offer name"}
                className="w-full bg-[#F5F0E8] border border-[#D5CFC3] rounded-xl px-4 py-2.5 text-[#1A1A1A] placeholder-[#9A9080] text-sm focus:outline-none focus:border-[#5C6B00] transition-colors"
              />
              <input
                type="text"
                value={product.description}
                onChange={(e) => updateProduct(product.id, "description", e.target.value)}
                placeholder={isBrand ? "Short description (optional)" : "What is this? (optional)"}
                className="w-full bg-[#F5F0E8] border border-[#D5CFC3] rounded-xl px-4 py-2.5 text-[#1A1A1A] placeholder-[#9A9080] text-sm focus:outline-none focus:border-[#5C6B00] transition-colors"
              />
              <input
                type="url"
                value={product.url}
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
            Skip — I don't sell anything
          </button>
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

// ─── Step 4 — Engagement Goals ────────────────────────────────────────────────

const BRAND_GOALS = [
  { id: "engage", label: "Build brand awareness", description: "Genuine replies that grow affinity" },
  { id: "drive_to_dm", label: "Convert comments to DMs", description: "Move conversations to private" },
  { id: "send_link", label: "Drive traffic to website", description: "Share product links at the right moment" },
  { id: "collect_email", label: "Collect leads & emails", description: "Ask interested followers for their email" },
  { id: "book_call", label: "Book discovery calls", description: "Invite qualified leads to connect" },
];

const CREATOR_GOALS = [
  { id: "engage", label: "Grow my engagement", description: "Real replies that build community" },
  { id: "build_community", label: "Build community", description: "Make followers feel seen and heard" },
  { id: "drive_clicks", label: "Drive link clicks", description: "Promote your link-in-bio naturally" },
  { id: "collect_email", label: "Collect email subscribers", description: "Grow your newsletter list" },
  { id: "convert_followers", label: "Convert followers to fans", description: "Deepen connection with your audience" },
];

function Step4({
  accountType,
  onNext,
  onBack,
}: {
  accountType: AccountType;
  onNext: () => void;
  onBack: () => void;
}) {
  const isBrand = accountType === "brand";
  const goals = isBrand ? BRAND_GOALS : CREATOR_GOALS;

  const [selected, setSelected] = useState<Set<string>>(new Set(["engage"]));
  const [loading, setLoading] = useState(false);

  function toggleGoal(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id); // keep at least one
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleFinish() {
    setLoading(true);
    // Apply selected goals to all interaction types
    const goalRows: GoalData[] = [];
    const types: Array<"comment" | "dm" | "story_reply"> = ["comment", "dm", "story_reply"];

    // Primary goal for comments, secondary for DMs
    const primaryGoal = Array.from(selected)[0];
    types.forEach((type, i) => {
      const goal = i === 0 ? primaryGoal : Array.from(selected)[Math.min(i, selected.size - 1)];
      goalRows.push({ interaction_type: type, goal });
    });

    await fetch("/api/onboarding/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: 4, data: { goals: goalRows } }),
    });
    onNext();
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
        {isBrand
          ? "Choose your engagement goals. WASP will weave these into every reply naturally."
          : "Tell WASP what matters most. It'll prioritise these in every conversation."}
      </p>

      <div className="flex flex-col gap-3 mb-8">
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

      <div className="flex flex-col gap-3">
        <button
          onClick={handleFinish}
          disabled={loading}
          className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
        >
          {loading ? "Finishing setup…" : "Finish setup 🐝"}
        </button>
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

// ─── Root Onboarding Page ─────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [accountType, setAccountType] = useState<AccountType>("brand");
  const [loaded, setLoaded] = useState(false);

  // Resume from saved step if user refreshes mid-onboarding
  const loadExistingData = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding/save");
      const { account } = await res.json();
      if (account) {
        setAccountType(account.account_type ?? "brand");
        // Clamp step to a valid range (0–4)
        const savedStep = Math.min(Math.max(account.onboarding_step ?? 0, 0), 4);
        setStep(savedStep);
      }
    } catch {
      // no-op
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

  function handleComplete() {
    // Hard redirect — middleware will see onboarding_completed=true and allow /dashboard
    window.location.href = "/dashboard";
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
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
          />
        )}
      </div>
    </div>
  );
}
