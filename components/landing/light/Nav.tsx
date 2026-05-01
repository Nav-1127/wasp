"use client";

import Link from "next/link";
import { useState } from "react";

/* Nav — v10.3 (font update 2026-04-30)
 * Wordmark: Syne ExtraBold 1.875rem 0.04em
 * Links: How it works (anchor scroll), Pricing, Sign up free
 * CTA: dark ink #0A0A0A bg, white text
 * Sticky positioned so it stays visible while the rest of the page scrolls.
 * (CD's design has it inline-non-fixed; we keep sticky for UX so visitors
 * always have a way back to nav while exploring deeper sections.)
 */

export default function NavLight() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 48px",
        height: 60,
        borderBottom: "1px solid #EBE5DC",
        background: "#FAF8F5",
      }}
    >
      <Link href="/" style={{ textDecoration: "none" }}>
        <span
          style={{
            fontFamily:
              "var(--font-syne), 'Syne', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "1.875rem",
            letterSpacing: "0.04em",
            color: "#0A0A0A",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          WASP
        </span>
      </Link>

      <div className="wasp-nav-links">
        <a
          href="#how-it-works"
          style={{
            fontSize: "0.875rem",
            color: "#777",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          How it works
        </a>
        <a
          href="#pricing"
          style={{
            fontSize: "0.875rem",
            color: "#777",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Pricing
        </a>
        <Link
          href="/signup"
          style={{
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#FAF8F5",
            background: "#0A0A0A",
            padding: "8px 18px",
            borderRadius: 6,
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Sign up free
        </Link>
      </div>

      <button
        className="wasp-nav-burger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#0A0A0A",
        }}
      >
        {menuOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {menuOpen && (
        <div
          className="wasp-nav-mobile"
          style={{
            position: "absolute",
            top: 60,
            left: 0,
            right: 0,
            background: "#FAF8F5",
            borderTop: "1px solid #EBE5DC",
            borderBottom: "1px solid #EBE5DC",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <a
            href="#how-it-works"
            onClick={() => setMenuOpen(false)}
            style={{ fontSize: "0.875rem", color: "#0A0A0A", textDecoration: "none" }}
          >
            How it works
          </a>
          <a
            href="#pricing"
            onClick={() => setMenuOpen(false)}
            style={{ fontSize: "0.875rem", color: "#0A0A0A", textDecoration: "none" }}
          >
            Pricing
          </a>
          <Link
            href="/signup"
            onClick={() => setMenuOpen(false)}
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#FAF8F5",
              background: "#0A0A0A",
              padding: "10px 18px",
              borderRadius: 6,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Sign up free
          </Link>
        </div>
      )}

      <style>{`
        .wasp-nav-links {
          display: flex;
          gap: 28px;
          align-items: center;
        }
        .wasp-nav-burger { display: none; }

        @media (max-width: 768px) {
          nav { padding: 0 20px !important; }
          .wasp-nav-links { display: none; }
          .wasp-nav-burger { display: flex; }
        }
      `}</style>
    </nav>
  );
}
