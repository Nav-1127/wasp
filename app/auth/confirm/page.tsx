"use client";

// This page is the target of the confirmation email link.
// It intentionally does NOT verify immediately on load — email security scanners
// (Proofpoint, Google Safe Browsing, etc.) follow links automatically, which
// would consume the one-time token before the user clicks.
// Instead, we show a button. Only a human clicking it triggers verification.

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ConfirmForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") ?? "email";
  const next = searchParams.get("next") ?? "/onboarding";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleConfirm() {
    if (!token_hash) {
      setStatus("error");
      setErrorMessage("Invalid confirmation link. Please sign up again.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token_hash, type }),
      });

      if (res.ok) {
        setStatus("success");
        setTimeout(() => router.push(next), 800);
      } else {
        const data = await res.json();
        setStatus("error");
        setErrorMessage(
          data.error === "otp_expired"
            ? "This link has expired. Please sign up again for a fresh one."
            : "Confirmation failed. Please sign up again."
        );
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
      style={{ backgroundColor: "#F5F0E8" }}
    >
      <a href="/" className="mb-10 flex items-center">
        <span
          className="text-[#1A1A1A]"
          style={{
            fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
            fontWeight: 700,
            fontSize: "2rem",
            letterSpacing: "0.1em",
          }}
        >
          WASP
        </span>
      </a>

      <div className="w-full max-w-md">
        {status === "success" ? (
          <div className="border border-[#5C6B00]/30 bg-[#D4FF00]/20 rounded-2xl px-8 py-10 text-center">
            <p className="text-3xl mb-3">✅</p>
            <h2
              className="text-xl font-black text-[#1A1A1A] mb-2"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Email confirmed!
            </h2>
            <p className="text-sm text-[#6B6058]">Taking you to setup…</p>
          </div>
        ) : status === "error" ? (
          <div className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl px-8 py-10 text-center">
            <p className="text-3xl mb-3">⚠️</p>
            <h2
              className="text-xl font-black text-[#1A1A1A] mb-2"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Confirmation failed
            </h2>
            <p className="text-sm text-[#6B6058] mb-6">{errorMessage}</p>
            <a
              href="/signup"
              className="inline-block bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors"
            >
              Back to signup
            </a>
          </div>
        ) : (
          <div className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl px-8 py-10 text-center">
            <p className="text-3xl mb-4">📬</p>
            <h1
              className="text-2xl font-black text-[#1A1A1A] mb-2"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Confirm your account
            </h1>
            <p className="text-sm text-[#6B6058] mb-8">
              Click the button below to verify your email and start setting up WASP.
            </p>

            <button
              onClick={handleConfirm}
              disabled={status === "loading"}
              className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-4 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-50"
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Confirming…
                </span>
              ) : (
                "Confirm my account →"
              )}
            </button>

            <p className="text-xs text-[#9A9080] mt-5">
              Wrong email?{" "}
              <a href="/signup" className="text-[#5C6B00] hover:underline">
                Sign up with a different one
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense>
      <ConfirmForm />
    </Suspense>
  );
}
