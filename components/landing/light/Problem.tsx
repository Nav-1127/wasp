import Image from "next/image";

export default function ProblemLight() {
  return (
    <section
      className="px-6 py-24 sm:py-40"
      style={{ backgroundColor: "#FAF8F5", borderTop: "1px solid #EBE5DC" }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-xs text-[#888888] tracking-[0.18em] mb-6">the problem</p>

        <h2
          className="text-[#1A1A1A] mb-6 max-w-3xl"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontWeight: 500,
            fontSize: "clamp(1.75rem, 4vw, 3rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          You're missing 80% of your comments.
        </h2>

        <p
          className="text-[#666666] mb-12 sm:mb-16 max-w-2xl"
          style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)", lineHeight: 1.55 }}
        >
          Every unanswered comment is reach the algorithm quietly takes back. The cost
          isn't theoretical — it shows up as fewer impressions on your next post.
        </p>

        {/* Single screenshot */}
        {/* TODO: replace /landing/problem-placeholder.svg with a real Instagram comments screenshot */}
        <div
          className="relative mx-auto rounded-2xl overflow-hidden border border-[#EBE5DC]"
          style={{
            maxWidth: "900px",
            aspectRatio: "1200 / 720",
            backgroundColor: "#F2EDE3",
          }}
        >
          <Image
            src="/landing/problem-placeholder.svg"
            alt="Unanswered comments piling up"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      </div>
    </section>
  );
}
