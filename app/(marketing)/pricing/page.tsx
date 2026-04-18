import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — WASP",
  description:
    "Simple, transparent pricing. Start free, upgrade when you're ready to go full auto-pilot.",
};

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Start testing WASP with zero commitment.",
    features: [
      { text: "1 Instagram account", included: true },
      { text: "Draft Mode only (you approve every reply)", included: true },
      { text: "50 AI responses per month", included: true },
      { text: "Brand personality analysis", included: true },
      { text: "Basic analytics", included: true },
      { text: "Auto Mode", included: false },
      { text: "Unlimited responses", included: false },
      { text: "Full analytics", included: false },
      { text: "Product catalog import", included: false },
    ],
    cta: "Start Free",
    ctaType: "secondary" as const,
    note: "No credit card required",
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For creators & brands that want 24/7 engagement on auto-pilot.",
    badge: "Most Popular",
    features: [
      { text: "1 Instagram account", included: true },
      { text: "Draft Mode + Auto Mode", included: true },
      { text: "Unlimited AI responses", included: true },
      { text: "Brand personality analysis", included: true },
      { text: "Full before/after analytics", included: true },
      { text: "Product catalog import", included: true },
      { text: "Priority response queue", included: true },
      { text: "Up to 5 accounts", included: false },
      { text: "Team member access", included: false },
    ],
    cta: "Start Free Trial",
    ctaType: "primary" as const,
    note: "14-day free trial, no credit card",
  },
  {
    name: "Agency",
    price: "$99",
    period: "/month",
    description: "For agencies managing multiple accounts at scale.",
    features: [
      { text: "Up to 5 Instagram accounts", included: true },
      { text: "Draft Mode + Auto Mode", included: true },
      { text: "Unlimited AI responses", included: true },
      { text: "Brand personality per account", included: true },
      { text: "Full analytics per account", included: true },
      { text: "Product catalog import", included: true },
      { text: "Team member access", included: true },
      { text: "Agency dashboard", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Contact Us",
    ctaType: "secondary" as const,
    note: "Custom onboarding included",
  },
];

const faqs = [
  {
    q: "What counts as an AI response?",
    a: "Each time WASP generates a reply to a comment, DM, or story reply — that counts as one response. Approving, editing, or rejecting a draft doesn't cost extra.",
  },
  {
    q: "What is Draft Mode vs Auto Mode?",
    a: "In Draft Mode, WASP writes a reply but waits for your approval before sending it. In Auto Mode, WASP sends replies automatically without needing your sign-off. You can set this per interaction type (comments, DMs, story replies).",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel anytime from your account settings. You keep access until the end of your billing period. No questions asked.",
  },
  {
    q: "Does WASP sound like a bot?",
    a: "It shouldn't. WASP analyzes your last 50 posts and replies to build a personality profile that matches your actual voice — slang, emoji habits, tone, everything. Most followers can't tell.",
  },
  {
    q: "What Instagram account type do I need?",
    a: "You need an Instagram Business or Creator account. Personal accounts don't have API access.",
  },
  {
    q: "Is Stripe / payments live yet?",
    a: "We're currently in early access. All signups start on Free. Pro and Agency tiers will be available when we launch billing.",
  },
];

export default function PricingPage() {
  return (
    <div className="pt-24 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs text-[#D4FF00] font-semibold tracking-widest uppercase mb-4 block">
            Pricing
          </span>
          <h1
            className="text-5xl md:text-6xl font-black text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Simple pricing,{" "}
            <span className="text-[#D4FF00]">serious results</span>
          </h1>
          <p className="text-[#6B6B6B] text-lg max-w-xl mx-auto">
            Start free. No credit card. Upgrade when WASP has already paid for itself.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative border rounded-2xl p-8 flex flex-col bg-white ${
                plan.badge ? "border-black shadow-md" : "border-gray-200"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-black text-white text-xs font-black px-4 py-1 rounded-full tracking-wide">
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <p className="text-sm font-semibold mb-1 text-gray-500">{plan.name}</p>
                <div className="flex items-end gap-1 mb-3">
                  <span
                    className="text-5xl font-black text-black"
                    style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-gray-400 text-sm mb-1.5">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
                    className={`flex items-start gap-3 text-sm ${
                      feature.included ? "text-black" : "text-gray-300"
                    }`}
                  >
                    {feature.included ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#5C6B00] mt-0.5 flex-shrink-0">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-300 mt-0.5 flex-shrink-0">
                        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M6 10l4-4M10 10L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                    {feature.text}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div>
                <Link
                  href="/signup"
                  className={`block text-center font-bold py-3.5 rounded-xl text-sm transition-colors duration-200 mb-2 ${
                    plan.ctaType === "primary"
                      ? "bg-black text-white hover:bg-[#5C6B00]"
                      : "border border-gray-200 text-black hover:border-black"
                  }`}
                >
                  {plan.cta}
                </Link>
                {plan.note && (
                  <p className="text-center text-xs text-gray-400">{plan.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl p-10 mt-4">
          <h2
            className="text-3xl font-black text-black mb-10"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Frequently asked questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-gray-200 pb-8">
                <h3
                  className="text-base font-bold text-black mb-3"
                  style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                >
                  {faq.q}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center bg-white rounded-2xl p-12">
          <h2
            className="text-3xl md:text-4xl font-black text-black mb-4"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Ready to let WASP handle it?
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Start free. No credit card required. Connect your Instagram in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-[#D4FF00] text-[#0A0A0A] font-bold px-10 py-4 rounded-full text-sm hover:bg-white transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
