"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/dashboard-shell";

const ENGAGEMENT_LEVELS = [
  {
    id: "smart_select",
    label: "Smart select",
    description: "Replies to questions, compliments, meaningful feedback, and purchase intent. Skips emojis and friend tags.",
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
    description: "WASP drafts replies for all comments, but you choose which ones to send.",
    recommended: false,
  },
];

export default function SettingsPage() {
  const [engagementLevel, setEngagementLevel] = useState("smart_select");
  const [email, setEmail]                     = useState("");
  const [saving, setSaving]                   = useState(false);
  const [saved, setSaved]                     = useState(false);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    fetch("/api/onboarding/save")
      .then((r) => r.json())
      .then((json) => {
        if (json.account) {
          setEngagementLevel(json.account.engagement_level ?? "smart_select");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engagement_level: engagementLevel }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <DashboardShell email={email}>
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1
          className="text-2xl font-black text-[#1A1A1A] mb-1"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Settings
        </h1>
        <p className="text-sm text-[#6B6058] mb-10">Control how WASP behaves on your account.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-[#D5CFC3] border-t-[#5C6B00] animate-spin" />
          </div>
        ) : (
          <>
            {/* Engagement level */}
            <div className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl p-6 mb-6">
              <h2
                className="font-black text-[#1A1A1A] mb-1"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                Comment engagement level
              </h2>
              <p className="text-xs text-[#6B6058] mb-5">
                For DMs and story replies, WASP always responds — those are high-intent.
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
                        background: active ? "rgba(212,255,0,0.08)" : "#F5F0E8",
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
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-[#1A1A1A]">{level.label}</p>
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

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-40"
            >
              {saving ? "Saving…" : saved ? "Saved ✓" : "Save settings"}
            </button>
          </>
        )}
      </div>
    </DashboardShell>
  );
}
