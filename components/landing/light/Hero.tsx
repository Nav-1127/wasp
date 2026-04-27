import Link from "next/link";
import Image from "next/image";

export default function HeroLight() {
  return (
    <section
      id="hero"
      className="px-6 pt-32 sm:pt-40 pb-20 sm:pb-32"
      style={{ backgroundColor: "#FAF8F5" }}
    >
      <div className="max-w-5xl mx-auto text-center">
        {/* Eyebrow */}
        <p className="text-xs text-[#888888] tracking-[0.18em] mb-6 sm:mb-8">
          ai-native instagram engagement
        </p>

        {/* Serif H1 */}
        <h1
          className="text-[#1A1A1A] mb-6 sm:mb-8"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontWeight: 500,
            fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          Your Instagram talks back.
          <br />
          <span style={{ fontStyle: "italic", fontWeight: 400 }}>
            Wasp makes sure it sounds like you.
          </span>
        </h1>

        {/* Subhead */}
        <p
          className="text-[#666666] mx-auto mb-10 sm:mb-12 max-w-2xl"
          style={{
            fontSize: "clamp(1rem, 1.4vw, 1.2rem)",
            lineHeight: 1.55,
          }}
        >
          An AI engagement agent that learns your content personality in 60 seconds,
          then replies to every comment and DM the way you would.
        </p>

        {/* Single CTA */}
        <div className="flex flex-col items-center gap-3">
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

        {/* Hero visual */}
        {/* TODO: replace /landing/hero-placeholder.svg with a real product screenshot or short muted video loop (1200×720) */}
        <div className="mt-16 sm:mt-24">
          <div
            className="relative mx-auto rounded-2xl overflow-hidden border border-[#EBE5DC]"
            style={{
              maxWidth: "1100px",
              aspectRatio: "1200 / 720",
              backgroundColor: "#F2EDE3",
            }}
          >
            <Image
              src="/landing/hero-placeholder.svg"
              alt="Wasp dashboard preview"
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
