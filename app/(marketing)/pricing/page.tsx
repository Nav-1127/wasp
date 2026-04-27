import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing · WASP",
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
      { text: "Brand voice analysis", included: true },
      { text: "Basic analytics", included: true },
      { text: "Auto Mode", included: false },
      { text: "Unlimited responses", included: false },
      { text: "Full analytics", included: false },
      { text: "Product catalog import", included: false },
    ],
    cta: "Start free",
    ctaType: "secondary" as const,
    note: "No credit card required",
  },
  {
    name: "Creator",
    price: "$19",
    period: "/month",
    description: "For creators who want auto-reply on one account.",
    features: [
      { text: "1 Instagram account", included: true },
      { text: "Draft Mode + Auto Mode", included: true },
      { text: "1,000 interactions per month", included: true },
      { text: "Brand voice analysis", included: true },
      { text: "Basic analytics", included: true },
      { text: "Product catalog import", included: false },
      { text: "Up to 3 accounts", included: false },
      { text: "Story replies", included: false },
      { text: "Comment-to-DM", included: false },
    ],
    cta: "Get started",
    ctaType: "primary" as const,
    note: "14-day free trial, no credit card",
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For brands running engagement at scale.",
    features: [
      { text: "Up to 3 Instagram accounts", included: true },
      { text: "Draft Mode + Auto Mode", included: true },
      { text: "5,000 interactions per month", included: true },
      { text: "Brand voice per account", included: true },
      { text: "Full analytics per account", included: true },
      { text: "Product catalog import", included: true },
      { text: "Story replies", included: true },
      { text: "Comment-to-DM", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Get started",
    ctaType: "primary" as const,
    note: "Custom onboarding included",
  },
];

const faqs = [
  {
    q: "What counts as an AI response?",
    a: "Each time WASP generates a reply to a comment, DM, or story reply, that counts as one response. Approving, editing, or rejecting a draft doesn't cost extra.",
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
    a: "It shouldn't. WASP analyzes your last 50 posts and replies to build a brand voice profile that matches your actual voice (slang, emoji habits, tone, everything). Most followers can't tell.",
  },
  {
    q: "What Instagram account type do I need?",
    a: "You need an Instagram Business or Creator account. Personal accounts don't have API access.",
  },
  {
    q: "Is Stripe / payments live yet?",
    a: "We're currently in early access. All signups start on Free. Paid tiers will be available when we launch billing.",
  },
];

const serif: React.CSSProperties = {
  fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
  fontWeight: 500,
  letterSpacing: "-0.02em",
};

export default function PricingPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-[#888888] tracking-[0.18em] mb-6">pricing</p>
          <h1
            className="text-[#1A1A1A] mb-4"
            style={{ ...serif, fontSize: "clamp(2.25rem, 5vw, 3.75rem)", lineHeight: 1.05 }}
          >
            Simple pricing. Serious results.
          </h1>
          <p className="text-[#666666] text-lg max-w-xl mx-auto" style={{ lineHeight: 1.55 }}>
            Start free. No credit card. Upgrade when WASP has already paid for itself.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6 mb-20">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl border border-[#EBE5DC] p-7 sm:p-8 flex flex-col"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <div className="mb-6">
                <p className="text-sm font-medium mb-2 text-[#1A1A1A]">{plan.name}</p>
                <div className="flex items-end gap-1 mb-3">
                  <span
                    className="text-[#1A1A1A]"
                    style={{ ...serif, fontSize: "2.75rem", lineHeight: 1 }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[#888888] text-sm mb-1.5">{plan.period}</span>
                </div>
                <p className="text-sm text-[#666666]" style={{ lineHeight: 1.5 }}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature.text}
                    className={`flex items-start gap-2.5 text-sm ${
                      feature.included ? "text-[#1A1A1A]" : "text-[#BBBBBB]"
                    }`}
                  >
                    {feature.included ? (
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
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-[#DDDDDD] mt-1 flex-shrink-0"
                      >
                        <path
                          d="M5 8h6"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                    <span style={{ lineHeight: 1.45 }}>{feature.text}</span>
                  </li>
                ))}
              </ul>

              <div>
                <Link
                  href="/signup"
                  className="block text-center text-sm font-medium py-3 rounded-full transition-opacity hover:opacity-90 mb-2"
                  style={{
                    backgroundColor: plan.ctaType === "primary" ? "#5B2B8C" : "#1A1A1A",
                    color: "#FFFFFF",
                  }}
                >
                  {plan.cta}
                </Link>
                {plan.note && (
                  <p className="text-center text-xs text-[#888888]">{plan.note}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-10 border border-[#EBE5DC]"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <h2
            className="text-[#1A1A1A] mb-10"
            style={{ ...serif, fontSize: "1.75rem" }}
          >
            Frequently asked questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq) => (
              <div key={faq.q} className="border-b border-[#EBE5DC] pb-8">
                <h3 className="text-base font-medium text-[#1A1A1A] mb-3">{faq.q}</h3>
                <p className="text-sm text-[#666666] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="mt-8 text-center rounded-2xl p-12 border border-[#EBE5DC]"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <h2
            className="text-[#1A1A1A] mb-4"
            style={{ ...serif, fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)", lineHeight: 1.1 }}
          >
            Ready to let WASP handle it?
          </h2>
          <p className="text-[#666666] mb-8 max-w-md mx-auto">
            Start free. No credit card required. Connect your Instagram in minutes.
          </p>
          <Link
            href="/signup"
            className="inline-block text-white text-sm font-medium rounded-full transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#5B2B8C", padding: "14px 32px" }}
          >
            Start free
          </Link>
        </div>
      </div>
    </div>
  );
}
