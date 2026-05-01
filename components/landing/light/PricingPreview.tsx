"use client";

import Link from "next/link";
import { useState } from "react";

type Plan = {
  name: string;
  monthly: number;
  yearly: number;
  description: string;
  features: string[];
  cta: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    description: "Try WASP before committing. See exactly how it sounds like you.",
    features: [
      "1 Instagram account",
      "Draft mode — you approve every reply",
      "50 interactions/month",
      "Brand voice analysis",
      "Up to 3 sting triggers",
    ],
    cta: "Start free",
  },
  {
    name: "Creator",
    monthly: 19,
    yearly: 16,
    description: "For solo creators and small brands ready to run on autopilot.",
    features: [
      "1 Instagram account",
      "Auto-reply mode (comments + DMs)",
      "1,000 interactions/month",
      "Unlimited sting triggers",
      "Comment sensitivity routing",
      "Human reply delay",
      "Basic analytics",
    ],
    cta: "Get started",
  },
  {
    name: "Pro",
    monthly: 49,
    yearly: 39,
    description: "For growing brands managing multiple accounts at scale.",
    features: [
      "3 Instagram accounts",
      "5,000 interactions/month",
      "Everything in Creator",
      "Comment-to-DM automation",
      "Comment priority queue",
      "Full analytics",
      "Priority support",
    ],
    cta: "Get started",
  },
];

export default function PricingPreviewLight() {
  const [annual, setAnnual] = useState(false);

  return (
    <section
      id="pricing"
      className="px-6 pt-10 pb-24 sm:pt-10 sm:pb-40"
      style={{ borderTop: "1px solid #EBE5DC" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs text-[#888888] tracking-[0.18em] mb-6">pricing</p>
          <h2
            className="text-[#1A1A1A] mb-8"
            style={{
              fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
              fontWeight: 500,
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Pick a plan. Change it later.
          </h2>

          <div
            className="inline-flex items-center gap-1 p-1 rounded-full border border-[#EBE5DC]"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <button
              onClick={() => setAnnual(false)}
              className="text-sm px-4 py-1.5 rounded-full transition-colors"
              style={{
                backgroundColor: !annual ? "#1A1A1A" : "transparent",
                color: !annual ? "#FFFFFF" : "#666666",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className="text-sm px-4 py-1.5 rounded-full transition-colors flex items-center gap-2"
              style={{
                backgroundColor: annual ? "#1A1A1A" : "transparent",
                color: annual ? "#FFFFFF" : "#666666",
              }}
            >
              Annual
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: annual ? "rgba(255,255,255,0.15)" : "#EBE5DC",
                  color: annual ? "#FFFFFF" : "#666666",
                }}
              >
                20% off
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {plans.map((plan) => {
            const price = annual ? plan.yearly : plan.monthly;
            return (
              <div
                key={plan.name}
                className="rounded-2xl border border-[#EBE5DC] p-7 sm:p-8 flex flex-col"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <p className="text-sm font-medium text-[#1A1A1A] mb-2">{plan.name}</p>
                <div className="flex items-end gap-1 mb-3">
                  <span
                    className="text-[#1A1A1A]"
                    style={{
                      fontFamily:
                        "var(--font-playfair), 'Playfair Display', Georgia, serif",
                      fontWeight: 500,
                      fontSize: "2.75rem",
                      lineHeight: 1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    ${price}
                  </span>
                  <span className="text-sm text-[#888888] mb-1.5">/month</span>
                </div>
                <p
                  className="text-sm text-[#666666] mb-6"
                  style={{ lineHeight: 1.5 }}
                >
                  {plan.description}
                </p>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-[#1A1A1A]"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="mt-1 flex-shrink-0"
                        style={{ color: "#5B2B8C" }}
                      >
                        <path
                          d="M3 8.5l3 3 7-7"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span style={{ lineHeight: 1.45 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className="block text-center text-sm font-medium py-3 rounded-full transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: plan.name === "Free" ? "#1A1A1A" : "#5B2B8C",
                    color: "#FFFFFF",
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
