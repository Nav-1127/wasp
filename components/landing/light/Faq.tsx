"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Is this safe for my Instagram account?",
    a: "Yes. Wasp uses Instagram's official Business Login API — the same API ManyChat and Sprout use. No password sharing, no scraping, no automation that violates Meta's terms. You can disconnect anytime from settings.",
  },
  {
    q: "How is this different from ManyChat?",
    a: "ManyChat is a flow builder — you draw if/then trees by hand. Wasp is an agent — it reads your posts and replies in your voice. No flows to build, no keywords to map.",
  },
  {
    q: "What happens if I don't like a reply?",
    a: "In draft mode every reply waits for your approval. Reject it, edit it, or skip it. Wasp learns from your edits over time so the next draft sounds more like you.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. One click in settings. You keep access until the end of your billing period.",
  },
  {
    q: "Does the AI learn from my edits?",
    a: "Yes. Every approved edit feeds back into your content personality profile. The longer you use Wasp, the closer it sounds to you.",
  },
];

export default function FaqLight() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      className="px-6 py-24 sm:py-40"
      style={{ backgroundColor: "#FAF8F5", borderTop: "1px solid #EBE5DC" }}
    >
      <div className="max-w-3xl mx-auto">
        <p className="text-xs text-[#888888] tracking-[0.18em] mb-6">questions</p>
        <h2
          className="text-[#1A1A1A] mb-12 sm:mb-16"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontWeight: 500,
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Frequently asked.
        </h2>

        <div className="border-t border-[#EBE5DC]">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q} className="border-b border-[#EBE5DC]">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left"
                >
                  <span
                    className="text-[#1A1A1A] font-medium"
                    style={{ fontSize: "1.0625rem", lineHeight: 1.4 }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-transform"
                    style={{
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      color: "#666666",
                    }}
                    aria-hidden
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 3v10M3 8h10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all"
                  style={{
                    maxHeight: isOpen ? "240px" : "0",
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p
                    className="text-[#666666] pb-6 pr-10"
                    style={{ fontSize: "1rem", lineHeight: 1.6 }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
