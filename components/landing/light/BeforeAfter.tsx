// TODO: replace @sneakerhead_mike with real brand voice example once available
export default function BeforeAfterLight() {
  return (
    <section
      className="px-6 py-24 sm:py-40"
      style={{ backgroundColor: "#FAF8F5", borderTop: "1px solid #EBE5DC" }}
    >
      <div className="max-w-5xl mx-auto">
        <p className="text-xs text-[#888888] tracking-[0.18em] mb-6">brand voice</p>

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
          It doesn't just reply. It replies like you.
        </h2>

        <p
          className="text-[#666666] mb-14 sm:mb-20 max-w-2xl"
          style={{ fontSize: "clamp(1rem, 1.3vw, 1.125rem)", lineHeight: 1.55 }}
        >
          Same comment. Two replies. One sounds like a chatbot. The other sounds like
          the brand your followers actually follow.
        </p>

        {/* TODO: replace @sneakerhead_mike with real brand voice example once available */}
        <div className="max-w-2xl mx-auto mb-10">
          <div
            className="rounded-2xl border border-[#EBE5DC] p-5 sm:p-6"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <p className="text-xs text-[#888888] mb-2">@sneakerhead_mike commented</p>
            <p className="text-[#1A1A1A]" style={{ fontSize: "1rem", lineHeight: 1.5 }}>
              These colorways are insane. Where can I cop a pair?
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
          <div
            className="rounded-2xl border border-[#EBE5DC] p-6 sm:p-7"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <p className="text-xs text-[#888888] tracking-[0.18em] mb-4">
              generic ai reply
            </p>
            <p
              className="text-[#666666] mb-4"
              style={{ fontSize: "1.0625rem", lineHeight: 1.55 }}
            >
              Thank you so much for your kind words! We're thrilled you love the new
              colorways. Please visit our website to make a purchase. We appreciate
              your support!
            </p>
            <p className="text-xs text-[#999999]">Sounds like a help desk.</p>
          </div>

          <div
            className="rounded-2xl p-6 sm:p-7"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #5B2B8C",
            }}
          >
            <p
              className="text-xs tracking-[0.18em] mb-4"
              style={{ color: "#5B2B8C" }}
            >
              wasp reply
            </p>
            <p
              className="text-[#1A1A1A] mb-4"
              style={{ fontSize: "1.0625rem", lineHeight: 1.55 }}
            >
              appreciate you mike 🙏 limited run, link in bio. DMs open if your
              size sells out, we'll sort you out.
            </p>
            <p className="text-xs" style={{ color: "#5B2B8C" }}>
              Same voice you use in your captions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
