import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 · WASP",
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{
        backgroundColor: "#FAF8F5",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        color: "#1A1A1A",
      }}
    >
      <div className="relative z-10 max-w-md">
        <p
          className="text-[#1A1A1A] mb-4"
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontWeight: 500,
            fontSize: "clamp(5rem, 12vw, 9rem)",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          404
        </p>

        <div className="flex items-center justify-center mb-6">
          <span
            className="text-[#1A1A1A]"
            style={{
              fontFamily: "var(--font-space), 'Space Grotesk', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: "2rem",
              letterSpacing: "0.05em",
              lineHeight: 1,
            }}
          >
            WASP
          </span>
        </div>

        <p
          className="text-[#666666] mb-8"
          style={{ fontSize: "1.0625rem", lineHeight: 1.55 }}
        >
          This page doesn't exist. Even WASP can't reply to something that
          isn't there.
        </p>

        <Link
          href="/"
          className="inline-block text-white text-sm font-medium rounded-full transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#5B2B8C", padding: "12px 26px" }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
