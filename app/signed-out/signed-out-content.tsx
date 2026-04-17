"use client";

import { useSearchParams } from "next/navigation";

export default function SignedOutContent() {
  const searchParams = useSearchParams();
  const isDeleted = searchParams.get("deleted") === "true";

  if (isDeleted) {
    return (
      <div className="w-full max-w-md border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl px-8 py-10 text-center">
        <div className="text-4xl mb-4">🗑️</div>
        <h1
          className="text-2xl font-black text-[#1A1A1A] mb-2"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Account deleted
        </h1>
        <p className="text-sm text-[#6B6058] mb-8">
          Your account and all associated data have been permanently deleted.
          You can safely close this tab.
        </p>
        <a
          href="/signup"
          className="inline-block w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors"
        >
          Create a new account
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl px-8 py-10 text-center">
      <div className="text-4xl mb-4">👋</div>
      <h1
        className="text-2xl font-black text-[#1A1A1A] mb-2"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        You&apos;re signed out
      </h1>
      <p className="text-sm text-[#6B6058] mb-8">
        You&apos;ve been signed out successfully. You can safely close this
        tab, or sign back in anytime.
      </p>
      <a
        href="/login"
        className="inline-block w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors"
      >
        Sign back in
      </a>
    </div>
  );
}
