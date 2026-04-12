"use client";

import Link from "next/link";
import { useState } from "react";

export default function NavLight() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#D5CFC3] bg-[#F5F0E8]/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/light" className="flex items-center gap-2 group">
          <span
            className="text-2xl font-black tracking-tighter text-[#1A1A1A] group-hover:text-[#5C6B00] transition-colors duration-200"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            WASP
          </span>
          <span className="text-xl leading-none">⚡</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/pricing"
            className="text-sm text-[#6B6058] hover:text-[#1A1A1A] transition-colors duration-200"
          >
            Pricing
          </Link>
          <a
            href="#waitlist-light"
            className="text-sm font-semibold bg-[#1A1A1A] text-[#F5F0E8] px-5 py-2.5 rounded-full hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors duration-200"
          >
            Join Waitlist
          </a>
        </div>

        <button
          className="md:hidden text-[#6B6058] hover:text-[#1A1A1A] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-[#D5CFC3] bg-[#F5F0E8] px-6 py-4 flex flex-col gap-4">
          <Link
            href="/pricing"
            className="text-sm text-[#6B6058] hover:text-[#1A1A1A] transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Pricing
          </Link>
          <a
            href="#waitlist-light"
            className="text-sm font-semibold bg-[#1A1A1A] text-[#F5F0E8] px-5 py-2.5 rounded-full text-center"
            onClick={() => setMenuOpen(false)}
          >
            Join Waitlist
          </a>
        </div>
      )}
    </nav>
  );
}
