"use client";

import Link from "next/link";
import { useState } from "react";

export default function NavLight() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#EBE5DC]"
      style={{ backgroundColor: "rgba(250, 248, 245, 0.85)", backdropFilter: "blur(8px)" }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <span
            className="text-[#1A1A1A]"
            style={{
              fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "1.5rem",
              letterSpacing: "0.1em",
            }}
          >
            WASP
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/pricing"
            className="text-sm text-[#666666] hover:text-[#1A1A1A] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-white px-5 py-2 rounded-full transition-colors"
            style={{ backgroundColor: "#5B2B8C" }}
          >
            Start free
          </Link>
        </div>

        <button
          className="md:hidden text-[#666666] hover:text-[#1A1A1A] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
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
      </div>

      {menuOpen && (
        <div
          className="md:hidden border-t border-[#EBE5DC] px-6 py-4 flex flex-col gap-4"
          style={{ backgroundColor: "#FAF8F5" }}
        >
          <Link
            href="/pricing"
            className="text-sm text-[#666666] hover:text-[#1A1A1A] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium text-white px-5 py-2.5 rounded-full text-center"
            style={{ backgroundColor: "#5B2B8C" }}
            onClick={() => setMenuOpen(false)}
          >
            Start free
          </Link>
        </div>
      )}
    </nav>
  );
}
