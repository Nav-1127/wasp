import { Suspense } from "react";
import SignedOutContent from "./signed-out-content";

export default function SignedOutPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ backgroundColor: "#F5F0E8" }}
    >
      {/* Logo */}
      <div className="mb-10 flex items-center gap-1.5">
        <span
          className="text-4xl font-black tracking-tighter text-[#1A1A1A]"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          WASP
        </span>
        <span className="text-2xl leading-none">⚡</span>
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
