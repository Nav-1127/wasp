export default function Problem() {
  const stats = [
    {
      stat: "15%",
      label: "of comments get a reply",
      callout: "Instagram notices the silence.",
    },
    {
      stat: "6hrs",
      label: "average reply time for brands",
      callout: "By then, the moment's dead.",
    },
    {
      stat: "97%",
      label: "of DMs go unanswered",
      callout: "That's revenue walking away.",
    },
  ];

  return (
    <section className="py-24 px-6 bg-[#0D0D0D] border-t border-[#1A1A1A]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <span className="text-xs text-[#D4FF00] font-semibold tracking-widest uppercase mb-4 block">
            The Problem
          </span>
          <h2
            className="text-4xl md:text-5xl font-black text-white leading-tight"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            The algorithm{" "}
            <span className="text-[#D4FF00]">punishes silence</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {stats.map((item, i) => (
            <div
              key={i}
              className="border border-[#2A2A2A] bg-[#111111] rounded-2xl p-8"
            >
              <div
                className="text-5xl font-black text-[#D4FF00] mb-2"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                {item.stat}
              </div>
              <p className="text-[#F5F5F5] font-medium mb-2">{item.label}</p>
              <p className="text-[#6B6B6B] text-sm">{item.callout}</p>
            </div>
          ))}
        </div>

        {/* Key insight */}
        <div className="border border-[#D4FF00]/20 bg-[#D4FF00]/5 rounded-2xl p-8 md:p-10">
          <div className="max-w-3xl">
            <p
              className="text-2xl md:text-3xl font-bold text-white leading-snug mb-4"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              "The algorithm rewards brands that engage. You're leaving reach on the table."
            </p>
            <p className="text-[#6B6B6B] text-base">
              WASP makes your reply rate{" "}
              <span className="text-[#D4FF00] font-semibold">95%+</span>{" "}
              without hiring a social team.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
