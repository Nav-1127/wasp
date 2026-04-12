import Link from "next/link";

export default function PricingPreview() {
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
      href: "/pricing",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For brands serious about engagement.",
      features: [
        "Everything in Free",
        "Unlimited AI responses",
        "Auto Mode — set it & forget it",
        "Full before/after analytics",
        "Product catalog import",
        "Priority response queue",
      ],
      cta: "Start Free Trial",
      href: "/pricing",
      highlighted: true,
      badge: "Most Popular",
    },
    {
      name: "Agency",
      price: "$99",
      period: "/month",
      description: "Manage multiple brands from one dashboard.",
      features: [
        "Everything in Pro",
        "Up to 5 Instagram accounts",
        "Team member access",
        "Agency dashboard",
        "Priority support",
      ],
      cta: "Contact Us",
      href: "/pricing",
      highlighted: false,
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-5 sm:px-6 bg-[#0D0D0D] border-t border-[#1A1A1A]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 sm:mb-16 text-center">
          <span className="text-xs text-[#D4FF00] font-semibold tracking-widest uppercase mb-4 block">
            Pricing
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Simple pricing,{" "}
            <span className="text-[#D4FF00]">serious results</span>
          </h2>
          <p className="text-[#6B6B6B] mt-4 text-base sm:text-lg max-w-xl mx-auto">
            Start free. Upgrade when you're hooked.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative border rounded-2xl p-6 sm:p-8 flex flex-col ${
                plan.highlighted
                  ? "border-[#D4FF00]/40 bg-[#111111] shadow-[0_0_60px_rgba(212,255,0,0.05)]"
                  : "border-[#2A2A2A] bg-[#111111]"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#D4FF00] text-[#0A0A0A] text-xs font-black px-4 py-1 rounded-full tracking-wide">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm text-[#6B6B6B] font-medium mb-1">{plan.name}</p>
                <div className="flex items-end gap-1 mb-2">
                  <span
                    className="text-4xl font-black text-white"
                    style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-[#4A4A4A] text-sm mb-1">{plan.period}</span>
                </div>
                <p className="text-sm text-[#4A4A4A]">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-[#F5F5F5]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="text-[#D4FF00] mt-0.5 flex-shrink-0"
                    >
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path
                        d="M5 8l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center font-bold py-3 rounded-xl text-sm transition-colors duration-200 ${
                  plan.highlighted
                    ? "bg-[#D4FF00] text-[#0A0A0A] hover:bg-white"
                    : "border border-[#2A2A2A] text-[#F5F5F5] hover:border-[#D4FF00]/50 hover:text-[#D4FF00]"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/pricing"
            className="text-sm text-[#6B6B6B] hover:text-[#D4FF00] transition-colors"
          >
            View full pricing details →
          </Link>
        </div>
      </div>
    </section>
  );
}
