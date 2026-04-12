export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Connect",
      description:
        "Link your Instagram Business account in one click. Takes 60 seconds. No dev setup required.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Analyze",
      description:
        "WASP studies your posts, captions, and replies. Builds your unique brand personality profile using AI.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
          <path d="M12 8v4l3 3" strokeLinecap="round" />
          <path d="M9 3.5c0 0 1.5 2.5 3 2.5s3-2.5 3-2.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Engage",
      description:
        "Every comment, DM, and story reply handled in your authentic voice — 24/7. You approve, or let it fly.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 px-6 border-t border-[#1A1A1A]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <span className="text-xs text-[#D4FF00] font-semibold tracking-widest uppercase mb-4 block">
            How It Works
          </span>
          <h2
            className="text-4xl md:text-5xl font-black text-white leading-tight"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Up and running{" "}
            <span className="text-[#D4FF00]">in minutes</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative border border-[#2A2A2A] bg-[#111111] rounded-2xl p-8 group hover:border-[#D4FF00]/30 transition-colors duration-300"
            >
              {/* Number */}
              <div className="text-7xl font-black text-[#1A1A1A] absolute top-6 right-8 select-none"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
                {step.number}
              </div>

              {/* Icon */}
              <div className="text-[#D4FF00] mb-6 relative z-10">{step.icon}</div>

              {/* Content */}
              <h3
                className="text-2xl font-bold text-white mb-3 relative z-10"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {step.title}
              </h3>
              <p className="text-[#6B6B6B] text-sm leading-relaxed relative z-10">
                {step.description}
              </p>

              {/* Connector arrow (not last) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                  <div className="w-8 h-[1px] bg-[#2A2A2A]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
