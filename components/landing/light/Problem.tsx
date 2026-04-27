import Image from "next/image";

const surfaces = [
  {
    label: "Comment",
    image: "/landing/problem-comment-placeholder.svg",
    alt: "Unanswered Instagram comment",
  },
  {
    label: "DM",
    image: "/landing/problem-dm-placeholder.svg",
    alt: "Unread Instagram direct message",
  },
  {
    label: "Story reply",
    image: "/landing/problem-story-placeholder.svg",
    alt: "Ignored Instagram story reply",
  },
];

const stats = [
  "Comments: most go unanswered after the first hour",
  "DMs: 90% of leads go cold after 5 minutes",
  "Story replies: opened, then forgotten",
];

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
          Comments. DMs. Story replies. All going unanswered.
        </h2>

        <p
          className="text-[#666666] mb-12 sm:mb-16 max-w-2xl"
          style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)", lineHeight: 1.55 }}
        >
          The average creator misses 80% of their incoming engagement. Every miss is a customer, follower, or fan who didn't get a reply.
        </p>

        {/* TODO: replace problem-*-placeholder.svg files with real Instagram screenshots (one each: comment, DM, story reply) */}
        <div className="grid sm:grid-cols-3 gap-5 sm:gap-6 mb-14 sm:mb-16">
          {surfaces.map((s) => (
            <div
              key={s.label}
              className="relative rounded-2xl overflow-hidden border border-[#EBE5DC]"
              style={{
                aspectRatio: "3 / 4",
                backgroundColor: "#F2EDE3",
              }}
            >
              <Image
                src={s.image}
                alt={s.alt}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          ))}
        </div>

        <div className="space-y-3 max-w-2xl">
          {stats.map((line) => (
            <p
              key={line}
              className="text-[#1A1A1A]"
              style={{ fontSize: "1.0625rem", lineHeight: 1.55 }}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
