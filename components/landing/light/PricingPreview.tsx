"use client";

import Link from "next/link";
import { useState } from "react";

type Feature = {
  text: string;
  tooltip?: string;
};

type Plan = {
  name: string;
  monthly: number;
  yearly: number;
  description: string;
  features: Feature[];
  cta: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    description: "Try WASP before committing. See exactly how it sounds like you.",
    features: [
      { text: "1 Instagram account" },
      { text: "Draft mode. You approve every reply." },
      { text: "50 interactions/month" },
      {
        text: "Brand voice analysis",
        tooltip: "WASP analyzes your existing posts and captions to learn your tone, vocabulary, and style. Every reply sounds like you wrote it.",
      },
      { text: "Up to 3 sting triggers",
        tooltip: "Sting triggers fire automatically on keyword matches, no approval needed. Use them to intercept sensitive topics like pricing or availability and move those conversations to DMs privately.",
      },
      {
        text: "Comment sensitivity routing",
        tooltip: "WASP detects comments that are risky to auto-reply to (complaints, confrontational messages, sensitive topics) and holds them for your review, even when auto-reply is on.",
      },
      {
        text: "Human reply delay",
        tooltip: "Replies are sent with a randomized delay so responses feel like they came from a real person, not an instant bot. In draft mode, the delay starts after you approve.",
      },
    ],
    cta: "Start free",
  },
  {
    name: "Creator",
    monthly: 19,
    yearly: 16,
    description: "For solo creators and small brands ready to run on autopilot.",
    features: [
      { text: "1 Instagram account" },
      { text: "Auto-reply mode (comments + DMs)" },
      { text: "1,000 interactions/month" },
      { text: "Unlimited sting triggers",
        tooltip: "Sting triggers fire automatically on keyword matches, no approval needed. Use them to intercept sensitive topics like pricing or availability and move those conversations to DMs privately.",
      },
      {
        text: "Comment sensitivity routing",
        tooltip: "WASP detects comments that are risky to auto-reply to (complaints, confrontational messages, sensitive topics) and holds them for your review, even when auto-reply is on.",
      },
      {
        text: "Comment priority queue",
        tooltip: "During high-volume periods, comments with buying intent are processed and replied to first, before general engagement or questions.",
      },
      {
        text: "Human reply delay",
        tooltip: "Replies are sent with a randomized delay so responses feel like they came from a real person, not an instant bot.",
      },
      { text: "Analytics" },
    ],
    cta: "Get started",
  },
  {
    name: "Pro",
    monthly: 49,
    yearly: 39,
    description: "For growing brands managing multiple accounts at scale.",
    features: [
      { text: "3 Instagram accounts" },
      { text: "5,000 interactions/month" },
      { text: "Everything in Creator" },
      { text: "Priority support" },
    ],
    cta: "Get started",
  },
];

function FeatureItem({ feature }: { feature: Feature }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="flex items-start gap-2.5 text-sm text-[#1A1A1A]">
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
      <span style={{ lineHeight: 1.45, flex: 1 }}>{feature.text}</span>
      {feature.tooltip && (
        <span
          className="relative flex-shrink-0"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 15,
              height: 15,
              borderRadius: "50%",
              border: "1px solid rgba(10,10,10,0.2)",
              fontSize: 9,
              fontWeight: 600,
              color: "rgba(10,10,10,0.4)",
              cursor: "default",
              lineHeight: 1,
              marginTop: 2,
            }}
          >
            ?
          </span>
          {open && (
            <span
              style={{
                position: "absolute",
                bottom: "calc(100% + 6px)",
                right: "-8px",
                width: 220,
                background: "#1A1A1A",
                color: "#F5F0E8",
                fontSize: 11.5,
                lineHeight: 1.55,
                padding: "10px 13px",
                borderRadius: 10,
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              {feature.tooltip}
              <span
                style={{
                  position: "absolute",
                  bottom: -5,
                  right: 13,
                  width: 10,
                  height: 10,
                  background: "#1A1A1A",
                  transform: "rotate(45deg)",
                  borderRadius: 2,
                }}
              />
            </span>
          )}
        </span>
      )}
    </li>
  );
}

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
                    <FeatureItem key={f.text} feature={f} />
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
