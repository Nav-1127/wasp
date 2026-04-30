/* BeforeAfter — v1.0 (2026-04-30)
 * Restyled to match landing page design system: Bricolage 800 headline,
 * warm card for generic reply, dark card for WASP reply (mirrors Problem trap card).
 */

export default function BeforeAfterLight() {
  return (
    <section style={{ background: "#FAF8F5", borderTop: "1px solid #EBE5DC" }}>
      <div className="wasp-ba-wrap">

        {/* Headline */}
        <h2
          className="wasp-ba-headline"
          style={{
            fontFamily: "var(--font-bricolage), 'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: "#0A0A0A",
            marginBottom: 20,
            maxWidth: 780,
          }}
        >
          It doesn&apos;t just reply.{" "}
          <span
            style={{
              background: "rgba(240, 210, 80, 0.42)",
              borderRadius: 5,
              padding: "0 6px",
            }}
          >
            It replies like you.
          </span>
        </h2>

        {/* Subheading */}
        <p
          style={{
            fontSize: "clamp(1rem, 1.2vw, 1.1rem)",
            lineHeight: 1.6,
            color: "rgba(10,10,10,0.5)",
            marginBottom: 52,
            maxWidth: 520,
          }}
        >
          Same comment. Two replies. One sounds like a chatbot.
          The other sounds like the brand your followers actually follow.
        </p>

        {/* The comment */}
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto 20px",
            background: "#FFFFFF",
            border: "1.5px solid rgba(10,10,10,0.09)",
            borderRadius: 14,
            padding: "18px 22px",
          }}
        >
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(10,10,10,0.35)",
              marginBottom: 8,
            }}
          >
            @sneakerhead_mike commented
          </p>
          <p style={{ fontSize: "1rem", lineHeight: 1.55, color: "#0A0A0A" }}>
            These colorways are insane. Where can I cop a pair?
          </p>
        </div>

        {/* Connector arrow */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v11M5 10l5 6 5-6" stroke="rgba(10,10,10,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Two reply cards */}
        <div className="wasp-ba-grid">

          {/* Generic AI reply */}
          <div
            style={{
              background: "#F0EDE8",
              borderRadius: 18,
              padding: "36px 36px 28px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-syne), 'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(10,10,10,0.35)",
                marginBottom: 20,
              }}
            >
              Generic AI reply
            </p>
            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.65,
                color: "rgba(10,10,10,0.55)",
                flex: 1,
                marginBottom: 20,
              }}
            >
              Thank you so much for your kind words! We&apos;re thrilled you love the
              new colorways. Please visit our website to make a purchase. We appreciate
              your support!
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "rgba(10,10,10,0.35)",
                fontStyle: "italic",
              }}
            >
              Sounds like a help desk.
            </p>
          </div>

          {/* WASP reply */}
          <div
            style={{
              background: "#0A0A0A",
              borderRadius: 18,
              padding: "36px 36px 28px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-syne), 'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
                marginBottom: 20,
              }}
            >
              WASP reply
            </p>
            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.65,
                color: "#FAF8F5",
                flex: 1,
                marginBottom: 20,
              }}
            >
              appreciate you mike 🙏 limited run, link in bio. DMs open if your
              size sells out, we&apos;ll sort you out.
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                fontStyle: "italic",
              }}
            >
              Same voice you use in your captions.
            </p>
          </div>

        </div>
      </div>

      <style>{`
        .wasp-ba-wrap {
          max-width: 1060px;
          margin: 0 auto;
          padding: 80px 40px 100px;
        }
        .wasp-ba-headline {
          font-size: clamp(2.25rem, 4.5vw, 3.75rem);
        }
        .wasp-ba-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          max-width: 860px;
          margin: 0 auto;
        }
        @media (max-width: 680px) {
          .wasp-ba-wrap { padding: 60px 24px 80px; }
          .wasp-ba-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
