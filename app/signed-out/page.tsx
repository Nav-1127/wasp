import { Suspense } from "react";
import SignedOutContent from "./signed-out-content";

export default function SignedOutPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{
        backgroundColor: "#FAF8F5",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        color: "#1A1A1A",
      }}
    >
      <div className="mb-10 flex items-center">
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

      <Suspense fallback={null}>
        <SignedOutContent />
      </Suspense>

      <p className="mt-8 text-xs text-[#9A9080]">
        © {new Date().getFullYear()} WASP · joinwasp.com
      </p>
    </div>
  );
}
