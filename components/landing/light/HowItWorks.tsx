import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "Connect your Instagram.",
    sub: "OAuth connection in 30 seconds. Read-only until you say otherwise.",
    image: "/landing/step-1-placeholder.svg",
    alt: "Instagram connect screen",
  },
  {
    number: "02",
    title: "WASP learns your voice.",
    sub: "Reads your last 30 posts and synthesizes a brand voice profile in 60 seconds.",
    image: "/landing/step-2-placeholder.svg",
    alt: "Content personality analysis",
  },
  {
    number: "03",
    title: "Replies that sound like you.",
    sub: "Auto-reply or draft mode. You stay in control.",
    image: "/landing/step-3-placeholder.svg",
    alt: "Reply drafts in dashboard",
  },
];

export default function HowItWorksLight() {
  return (
    <section
      className="px-6 py-24 sm:py-40"
      style={{ borderTop: "1px solid #EBE5DC" }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-xs text-[#888888] tracking-[0.18em] mb-6">how it works</p>
        <h2
          className="text-[#1A1A1A] mb-16 sm:mb-24 max-w-3xl"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontWeight: 500,
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Three steps. Then it just runs.
        </h2>

        <div className="space-y-24 sm:space-y-32">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="grid md:grid-cols-2 gap-10 sm:gap-16 items-center"
            >
              {/* TODO: replace placeholder with real product screenshot for "${step.title}" */}
              <div
                className={`relative rounded-2xl overflow-hidden border border-[#EBE5DC] ${
                  i % 2 === 1 ? "md:order-2" : ""
                }`}
                style={{
                  aspectRatio: "4 / 3",
                  backgroundColor: "#F2EDE3",
                }}
              >
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div className={i % 2 === 1 ? "md:order-1" : ""}>
                <p className="text-xs text-[#888888] tracking-[0.18em] mb-4">
                  step {step.number}
                </p>
                <h3
                  className="text-[#1A1A1A] mb-4"
                  style={{
                    fontFamily:
                      "var(--font-playfair), 'Playfair Display', Georgia, serif",
                    fontWeight: 500,
                    fontSize: "clamp(1.5rem, 2.6vw, 2rem)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-[#666666] max-w-md"
                  style={{ fontSize: "1.0625rem", lineHeight: 1.55 }}
                >
                  {step.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
