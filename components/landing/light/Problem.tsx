export default function ProblemLight() {
  const stats = [
    {
      stat: "fewer than 1 in 5",
      label: "comments ever get a reply from the account that posted",
      callout: "",
    },
    {
      stat: "10+ hrs",
      label: "average Instagram response time for businesses*",
      callout: "",
    },
    {
      stat: "4–6 hrs",
      label: "how long the average creator takes to reply to DMs. By then, they've moved on.*",
      callout: "",
    },
  ];

  return (
    <section className="py-16 sm:py-24 px-5 sm:px-6 bg-[#EDE8DE] border-t border-[#D5CFC3]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 sm:mb-16 max-w-2xl">
          <span className="text-xs text-[#5C6B00] font-semibold tracking-widest uppercase mb-4 block">
            The Problem
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1A1A] leading-tight"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            The algorithm{" "}
            <span className="text-[#5C6B00]">punishes silence</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {stats.map((item, i) => (
            <div
              key={i}
              className="border border-[#D5CFC3] bg-[#F5F0E8] rounded-2xl p-6 sm:p-8"
            >
              <div
                className="text-3xl sm:text-4xl font-black text-[#5C6B00] mb-3 leading-tight"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {item.stat}
              </div>
              <p className="text-[#1A1A1A] font-medium text-sm leading-relaxed">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Footnote */}
        <p className="text-xs text-[#9A9080] mb-10 sm:mb-16">
          * Sources: Sprout Social 2024 Instagram Benchmark Report; Spur.us Instagram Response Time Study 2026
        </p>

        <div className="border border-[#5C6B00]/20 bg-[#D4FF00]/15 rounded-2xl p-8 md:p-10">
          <div className="max-w-3xl">
            <p
              className="text-2xl md:text-3xl font-bold text-[#1A1A1A] leading-snug mb-4"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              "The algorithm rewards those who engage. You're leaving reach on the table."
            </p>
            <p className="text-[#6B6058] text-base">
              WASP makes your reply rate{" "}
              <span className="text-[#5C6B00] font-semibold">95%+</span>{" "}
              without hiring a social team.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
