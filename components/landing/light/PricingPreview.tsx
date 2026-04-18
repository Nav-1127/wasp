import Link from "next/link";

export default function PricingPreviewLight() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      description: "Start testing WASP at zero risk.",
      features: [
        "1 Instagram account",
        "Draft Mode only",
        "50 AI responses/month",
        "Brand personality analysis",
        "Basic analytics",
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For creators & brands serious about engagement.",
      features: [
        "Everything in Free",
        "Unlimited AI responses",
        "Auto Mode — set it & forget it",
        "Full before/after analytics",
        "Product catalog import",
        "Priority response queue",
      ],
      cta: "Start Free Trial",
      highlighted: true,
      badge: "Most Popular",
    },
    {
      name: "Agency",
      price: "$99",
      period: "/month",
      description: "Manage multiple accounts from one dashboard.",
      features: [
        "Everything in Pro",
        "Up to 5 Instagram accounts",
        "Team member access",
        "Agency dashboard",
        "Priority support",
      ],
      cta: "Contact Us",
      highlighted: false,
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-5 sm:px-6 bg-[#EDE8DE] border-t border-[#D5CFC3]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 sm:mb-16 text-center">
          <span className="text-xs text-[#5C6B00] font-semibold tracking-widest uppercase mb-4 block">
            Pricing
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1A1A] leading-tight"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Simple pricing,{" "}
            <span className="text-[#5C6B00]">serious results</span>
          </h2>
          <p className="text-[#6B6058] mt-4 text-base sm:text-lg max-w-xl mx-auto">
            Start free. Upgrade when you're hooked.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative border rounded-2xl p-6 sm:p-8 flex flex-col ${
                plan.highlighted
                  ? "border-[#5C6B00]/40 bg-[#F5F0E8] shadow-md"
                  : "border-[#D5CFC3] bg-[#F5F0E8]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#1A1A1A] text-[#F5F0E8] text-xs font-black px-4 py-1 rounded-full tracking-wide">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className={`text-sm font-medium mb-1 ${plan.highlighted ? "text-[#5C6B00]" : "text-[#6B6058]"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-2">
                  <span
                    className="text-4xl font-black text-[#1A1A1A]"
                    style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[#9A9080] text-sm mb-1">{plan.period}</span>
                </div>
                <p className="text-sm text-[#9A9080]">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-[#1A1A1A]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#5C6B00] mt-0.5 flex-shrink-0">
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block text-center font-bold py-3 rounded-xl text-sm transition-colors duration-200 ${
                  plan.highlighted
                    ? "bg-[#1A1A1A] text-[#F5F0E8] hover:bg-[#D4FF00] hover:text-[#1A1A1A]"
                    : "border border-[#D5CFC3] text-[#1A1A1A] hover:border-[#5C6B00] hover:text-[#5C6B00]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/pricing" className="text-sm text-[#6B6058] hover:text-[#5C6B00] transition-colors">
            View full pricing details →
          </Link>
        </div>
      </div>
    </section>
  );
}
