export default function BeforeAfter() {
  const metrics = [
    {
      label: "Reply Rate",
      before: "12%",
      after: "97%",
      beforeColor: "#6B6B6B",
    },
    {
      label: "Avg. Reply Time",
      before: "6 hours",
      after: "2 minutes",
      beforeColor: "#6B6B6B",
    },
    {
      label: "Comments Answered / Day",
      before: "23",
      after: "200+",
      beforeColor: "#6B6B6B",
    },
    {
      label: "Social Team Needed",
      before: "Yes",
      after: "Nope",
      beforeColor: "#6B6B6B",
    },
  ];

  return (
    <section className="py-24 px-6 border-t border-[#1A1A1A]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-2xl">
          <span className="text-xs text-[#D4FF00] font-semibold tracking-widest uppercase mb-4 block">
            The Difference
          </span>
          <h2
            className="text-4xl md:text-5xl font-black text-white leading-tight"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            What changes when{" "}
            <span className="text-[#D4FF00]">WASP is on</span>
          </h2>
        </div>

        {/* Comparison table */}
        <div className="grid grid-cols-1 gap-4">
          {/* Header row */}
          <div className="grid grid-cols-3 gap-4 pb-4 border-b border-[#2A2A2A]">
            <div />
            <div className="text-center">
              <span className="text-xs font-semibold text-[#6B6B6B] tracking-widest uppercase">
                Before WASP
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs font-semibold text-[#D4FF00] tracking-widest uppercase">
                After WASP
              </span>
            </div>
          </div>

          {/* Metric rows */}
          {metrics.map((m, i) => (
            <div
              key={i}
              className="grid grid-cols-3 gap-4 py-5 border-b border-[#1A1A1A] items-center group"
            >
              <div className="text-sm font-medium text-[#6B6B6B] group-hover:text-[#F5F5F5] transition-colors">
                {m.label}
              </div>
              <div className="text-center">
                <span
                  className="text-xl font-bold line-through"
                  style={{ color: m.beforeColor, textDecorationColor: "#3A3A3A" }}
                >
                  {m.before}
                </span>
              </div>
              <div className="text-center">
                <span
                  className="text-xl font-black text-[#D4FF00]"
                  style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                >
                  {m.after}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Visual bar */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {/* Reply rate bar */}
          <div className="border border-[#2A2A2A] bg-[#111111] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#6B6B6B]">Reply Rate</span>
              <span className="text-xs text-[#4A4A4A]">monthly average</span>
            </div>

            {/* Before */}
            <div className="mb-3">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-[#4A4A4A]">Before</span>
                <span className="text-xs text-[#6B6B6B] font-medium">12%</span>
              </div>
              <div className="h-2.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#3A3A3A]"
                  style={{ width: "12%" }}
                />
              </div>
            </div>

            {/* After */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-[#D4FF00]">After WASP</span>
                <span className="text-xs text-[#D4FF00] font-bold">97%</span>
              </div>
              <div className="h-2.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#D4FF00]"
                  style={{ width: "97%" }}
                />
              </div>
            </div>
          </div>

          {/* Response time bar */}
          <div className="border border-[#2A2A2A] bg-[#111111] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#6B6B6B]">Response Time</span>
              <span className="text-xs text-[#4A4A4A]">average</span>
            </div>

            {/* Before */}
            <div className="mb-3">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-[#4A4A4A]">Before</span>
                <span className="text-xs text-[#6B6B6B] font-medium">6 hours</span>
              </div>
              <div className="h-2.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#3A3A3A]"
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            {/* After */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-[#D4FF00]">After WASP</span>
                <span className="text-xs text-[#D4FF00] font-bold">2 minutes</span>
              </div>
              <div className="h-2.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#D4FF00]/30"
                  style={{ width: "1.5%" }}
                />
                <div
                  className="h-full rounded-full bg-[#D4FF00] -mt-2.5"
                  style={{ width: "1.5%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
