export default function BeforeAfterLight() {
  const metrics = [
    { label: "Reply Rate", before: "12%", after: "97%" },
    { label: "Avg. Reply Time", before: "6 hours", after: "2 minutes" },
    { label: "Comments Answered / Day", before: "23", after: "200+" },
    { label: "Social Team Needed", before: "Yes", after: "Nope" },
  ];

  return (
    <section className="py-16 sm:py-24 px-5 sm:px-6 border-t border-[#D5CFC3]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 sm:mb-16 max-w-2xl">
          <span className="text-xs text-[#5C6B00] font-semibold tracking-widest uppercase mb-4 block">
            The Difference
          </span>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A1A1A] leading-tight"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            What changes when{" "}
            <span className="text-[#5C6B00]">WASP is on</span>
          </h2>
        </div>

        {/* Comparison table */}
        <div className="grid grid-cols-1 gap-0">
          {/* Desktop header */}
          <div className="hidden sm:grid grid-cols-3 gap-4 pb-4 border-b border-[#D5CFC3]">
            <div />
            <div className="text-center">
              <span className="text-xs font-semibold text-[#9A9080] tracking-widest uppercase">
                Before WASP
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs font-semibold text-[#5C6B00] tracking-widest uppercase">
                After WASP
              </span>
            </div>
          </div>
          {/* Mobile header */}
          <div className="sm:hidden flex justify-between pb-3 border-b border-[#D5CFC3] mb-1">
            <span className="text-xs font-semibold text-[#9A9080] tracking-widest uppercase">Metric</span>
            <div className="flex gap-4">
              <span className="text-xs font-semibold text-[#9A9080] tracking-widest uppercase">Before</span>
              <span className="text-xs font-semibold text-[#5C6B00] tracking-widest uppercase w-14 text-right">After</span>
            </div>
          </div>

          {metrics.map((m, i) => (
            <div key={i} className="border-b border-[#E5DFD3]">
              {/* Desktop row */}
              <div className="hidden sm:grid grid-cols-3 gap-4 py-5 items-center group">
                <div className="text-sm font-medium text-[#6B6058] group-hover:text-[#1A1A1A] transition-colors">
                  {m.label}
                </div>
                <div className="text-center">
                  <span className="text-xl font-bold line-through text-[#C5BFB3]" style={{ textDecorationColor: "#C5BFB3" }}>
                    {m.before}
                  </span>
                </div>
                <div className="text-center">
                  <span
                    className="text-xl font-black text-[#5C6B00]"
                    style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                  >
                    {m.after}
                  </span>
                </div>
              </div>
              {/* Mobile row */}
              <div className="sm:hidden flex items-center justify-between py-4 gap-4">
                <span className="text-sm font-medium text-[#6B6058] flex-1 min-w-0">{m.label}</span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-base font-bold line-through text-[#C5BFB3]">{m.before}</span>
                  <span className="text-[#C5BFB3] text-sm">→</span>
                  <span
                    className="text-base font-black text-[#5C6B00] w-14 text-right"
                    style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
                  >
                    {m.after}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Visual bars */}
        <div className="mt-8 sm:mt-12 grid md:grid-cols-2 gap-4 sm:gap-8">
          <div className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#6B6058]">Reply Rate</span>
              <span className="text-xs text-[#9A9080]">monthly average</span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-[#9A9080]">Before</span>
                <span className="text-xs text-[#9A9080] font-medium">12%</span>
              </div>
              <div className="h-2.5 bg-[#D5CFC3] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#C5BFB3]" style={{ width: "12%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-[#5C6B00]">After WASP</span>
                <span className="text-xs text-[#5C6B00] font-bold">97%</span>
              </div>
              <div className="h-2.5 bg-[#D5CFC3] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#5C6B00]" style={{ width: "97%" }} />
              </div>
            </div>
          </div>

          <div className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[#6B6058]">Response Time</span>
              <span className="text-xs text-[#9A9080]">average</span>
            </div>
            <div className="mb-3">
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-[#9A9080]">Before</span>
                <span className="text-xs text-[#9A9080] font-medium">6 hours</span>
              </div>
              <div className="h-2.5 bg-[#D5CFC3] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#C5BFB3]" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs text-[#5C6B00]">After WASP</span>
                <span className="text-xs text-[#5C6B00] font-bold">2 minutes</span>
              </div>
              <div className="h-2.5 bg-[#D5CFC3] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#5C6B00]" style={{ width: "1.5%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
