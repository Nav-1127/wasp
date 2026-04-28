import Link from "next/link";
import Image from "next/image";

export default function HeroLight() {
  return (
    <section
      id="hero"
      className="px-6 pt-32 sm:pt-40 pb-20 sm:pb-32"
    >
      <div className="max-w-6xl mx-auto">
        {/* Left-aligned content column (Linear-style hero).
            Sits inside max-w-6xl outer container; content is bound to a max-w-3xl
            column on the left so the H1's short stacked lines don't sprawl. */}
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <p className="text-xs text-[#888888] tracking-[0.18em] mb-6 sm:mb-8">
            ai-native instagram engagement
          </p>

          {/* Serif H1 (v9): 5 short stacked lines, left-aligned, bigger.
              Container max-w-3xl ensures even the longest line ("Without sounding like a bot.")
              fits without wrapping at 64px desktop. Mobile: clamp lower bound keeps it tight at 36px.
              Lines split via <br /> rather than separate paragraphs so screen readers read it as one heading. */}
          <h1
            className="text-[#0A0A0A] mb-6 sm:mb-8"
            style={{
              fontFamily:
                "var(--font-playfair), 'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize: "clamp(2.25rem, 5vw, 4rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            Every comment.
            <br />
            Every DM.
            <br />
            Every story.
            <br />
            Replied.
            <br />
            Without sounding like a bot.
          </h1>

          {/* Subhead — 11 words, single sentence, left-aligned */}
          <p
            className="text-[#777777] mb-10 sm:mb-12 max-w-2xl"
            style={{
              fontSize: "clamp(1rem, 1.4vw, 1.2rem)",
              lineHeight: 1.55,
            }}
          >
            WASP learns your brand voice in 60 seconds, then replies 24/7.
          </p>

          {/* Single CTA — left-aligned, button + trust line stacked */}
          <div className="flex flex-col items-start gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-white text-sm font-medium rounded-full transition-opacity hover:opacity-90"
              style={{
                backgroundColor: "#5B2B8C",
                padding: "14px 28px",
              }}
            >
              Start free
              <span aria-hidden>→</span>
            </Link>
            <p className="text-xs text-[#888888]">
              free 50 replies/month. no card required.
            </p>
          </div>
        </div>

        {/* Hero visual — full-width within outer container, sits below content column */}
        {/* TODO: replace /landing/hero-placeholder.svg with a real product screenshot or short muted video loop (1200×720) */}
        <div className="mt-16 sm:mt-24">
          <div
            className="relative rounded-2xl overflow-hidden border border-[#EBE5DC]"
            style={{
              aspectRatio: "1200 / 720",
              backgroundColor: "#F2EDE3",
            }}
          >
            <Image
              src="/landing/hero-placeholder.svg"
              alt="WASP dashboard preview"
              fill
              priority
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
