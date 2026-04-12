import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — WASP",
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#D4FF00 1px, transparent 1px), linear-gradient(90deg, #D4FF00 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10">
        <p
          className="text-[120px] md:text-[180px] font-black leading-none text-[#1A1A1A] select-none mb-0"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          404
        </p>

        <div className="-mt-4 md:-mt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span
              className="text-2xl md:text-3xl font-black text-white"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              WASP
            </span>
            <span className="text-[#D4FF00] text-2xl">⚡</span>
          </div>

          <p className="text-[#6B6B6B] text-base mb-8 max-w-sm mx-auto">
            This page doesn't exist. Even WASP can't reply to something that
            isn't there.
          </p>

          <Link
            href="/"
            className="inline-block bg-[#D4FF00] text-[#0A0A0A] font-bold px-8 py-3.5 rounded-full text-sm hover:bg-white transition-colors duration-200"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
