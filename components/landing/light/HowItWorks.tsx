export default function HowItWorksLight() {
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
    <section className="py-16 sm:py-24 px-5 sm:px-6 border-t border-[#D5CFC3]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 sm:mb-16 max-w-2xl">
          <span className="text-xs text-[#5C6B00] font-semibold tracking-widest uppercase mb-4 block">
            How It Works
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1A1A] leading-tight"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Up and running{" "}
            <span className="text-[#5C6B00]">in minutes</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative border border-[#3D4A1A] bg-[#2D3A10] rounded-2xl p-6 sm:p-8 group hover:border-[#5C6B00] transition-colors duration-300"
            >
              <div
                className="text-7xl font-black text-[#3D4A1A] absolute top-6 right-8 select-none"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {step.number}
              </div>

              <div className="text-[#D4FF00] mb-6 relative z-10">{step.icon}</div>

              <h3
                className="text-2xl font-bold text-[#F5F0E8] mb-3 relative z-10"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {step.title}
              </h3>
              <p className="text-[#A8B880] text-sm leading-relaxed relative z-10">
                {step.description}
              </p>

              {i < steps.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                  <div className="w-8 h-[1px] bg-[#3D4A1A]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
