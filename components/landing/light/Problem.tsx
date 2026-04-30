/* Problem — v1.0 (2026-04-30)
 * CD handoff translated to Next.js. "You started this to create" closer omitted per Nav.
 * Body font: Inter (DM Sans not loaded in project — visually equivalent).
 */

export default function ProblemLight() {
  return (
    <section style={{ background: "#FAF8F5" }}>
      <div className="wasp-problem-wrap">

        {/* Eyebrow */}
        <p
          style={{
            fontFamily: "var(--font-syne), 'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            opacity: 0.38,
            marginBottom: 24,
            color: "#0A0A0A",
          }}
        >
          The Cost of Inaction
        </p>

        {/* Headline */}
        <h2
          className="wasp-problem-headline"
          style={{
            fontFamily: "var(--font-bricolage), 'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            marginBottom: 64,
            maxWidth: 820,
            color: "#0A0A0A",
          }}
        >
          Running your comments yourself{" "}
          <span
            style={{
              background: "rgba(240, 210, 80, 0.42)",
              borderRadius: 5,
              padding: "0 6px",
            }}
          >
            isn&apos;t working.
          </span>
        </h2>

        {/* Main row: Trap card + Table card */}
        <div className="wasp-problem-row">

          {/* The Trap */}
          <div
            style={{
              background: "#0A0A0A",
              borderRadius: 18,
              padding: "44px 36px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-syne), 'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#FAF8F5",
                opacity: 0.35,
              }}
            >
              The Trap
            </span>
            <div style={{ marginTop: 40 }}>
              <p
                className="wasp-trap-headline"
                style={{
                  fontFamily: "var(--font-bricolage), 'Bricolage Grotesque', sans-serif",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "#FAF8F5",
                }}
              >
                You can&apos;t log off. Because your audience never sleeps.
              </p>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "#FAF8F5",
                  opacity: 0.45,
                  marginTop: 18,
                }}
              >
                Every hour you&apos;re away is an hour comments pile up, engagement cools, and the algorithm notices. There is no off switch.
              </p>
            </div>
          </div>

          {/* Scale table */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid rgba(10,10,10,0.09)",
              borderRadius: 18,
              padding: "40px 40px 36px",
              overflow: "hidden",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-syne), 'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 10,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                opacity: 0.38,
                marginBottom: 28,
                color: "#0A0A0A",
              }}
            >
              It doesn&apos;t get easier
            </p>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid rgba(10,10,10,0.09)" }}>
                  <th className="wasp-th" style={{ width: "14%" }}>Followers</th>
                  <th className="wasp-th wasp-col-hide" style={{ width: "18%" }}>Comments + DMs / day</th>
                  <th className="wasp-th" style={{ width: "20%" }}>What you can handle</th>
                  <th className="wasp-th" style={{ width: "48%" }}>What happens if you don&apos;t reply</th>
                </tr>
              </thead>
              <tbody>
                {/* 10k row */}
                <tr style={{ borderBottom: "1px solid rgba(10,10,10,0.06)" }}>
                  <td className="wasp-td wasp-followers">10k</td>
                  <td className="wasp-td wasp-col-hide wasp-muted">~30–60</td>
                  <td className="wasp-td wasp-muted">Manageable</td>
                  <td className="wasp-td">Some missed sales. Minor churn.</td>
                </tr>
                {/* 50k row */}
                <tr style={{ borderBottom: "1px solid rgba(10,10,10,0.06)" }}>
                  <td className="wasp-td wasp-followers">50k</td>
                  <td className="wasp-td wasp-col-hide wasp-muted">~150–300</td>
                  <td className="wasp-td wasp-muted">Part-time job</td>
                  <td className="wasp-td">Regular revenue leaks. Followers disengage.</td>
                </tr>
                {/* 100k row — alarm state */}
                <tr>
                  <td className="wasp-td wasp-followers wasp-alarm">100k</td>
                  <td className="wasp-td wasp-col-hide wasp-alarm" style={{ opacity: 0.7 }}>~500–1,000</td>
                  <td className="wasp-td wasp-alarm" style={{ opacity: 0.75 }}>Impossible alone</td>
                  <td className="wasp-td wasp-alarm" style={{ fontWeight: 500 }}>
                    Algorithm deprioritizes your posts.
                    <span style={{ display: "block", fontSize: 12, marginTop: 4, opacity: 0.75 }}>
                      Engagement rate collapses. Buyers stop commenting.
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

      <style>{`
        .wasp-problem-wrap {
          max-width: 1120px;
          margin: 0 auto;
          padding: 120px 40px 140px;
        }
        .wasp-problem-headline {
          font-size: clamp(38px, 5.5vw, 66px);
        }
        .wasp-problem-row {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 16px;
          align-items: stretch;
        }
        .wasp-trap-headline {
          font-size: clamp(26px, 3vw, 36px);
        }
        .wasp-th {
          font-family: var(--font-syne), 'Syne', sans-serif;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          opacity: 0.38;
          text-align: left;
          padding: 0 12px 14px 0;
          color: #0A0A0A;
        }
        .wasp-th:last-child { padding-right: 0; }
        .wasp-td {
          padding: 18px 12px 18px 0;
          vertical-align: top;
          font-size: 13px;
          line-height: 1.45;
          color: #0A0A0A;
        }
        .wasp-td:last-child { padding-right: 0; }
        .wasp-followers {
          font-family: var(--font-bricolage), 'Bricolage Grotesque', sans-serif;
          font-weight: 800;
          font-size: 20px !important;
          letter-spacing: -0.02em;
          white-space: nowrap;
        }
        .wasp-muted { opacity: 0.55; }
        .wasp-alarm { color: #B91C1C !important; }

        @media (max-width: 900px) {
          .wasp-problem-row {
            grid-template-columns: 1fr;
          }
          .wasp-problem-wrap {
            padding: 80px 24px 100px;
          }
        }
        @media (max-width: 600px) {
          .wasp-col-hide { display: none; }
        }
      `}</style>
    </section>
  );
}
