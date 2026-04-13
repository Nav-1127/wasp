"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";

function SignupForm() {
  const searchParams = useSearchParams();
  const linkExpired = searchParams.get("error") === "link_expired";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");

    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Points to our /auth/confirm route so the token_hash is verified
        // on our server. Using window.location.origin means this works on
        // both localhost (dev) and joinwasp.com (production).
        emailRedirectTo: `${window.location.origin}/auth/confirm?type=email&next=/onboarding`,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("success");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-[#5C6B00]/30 bg-[#D4FF00]/20 rounded-2xl px-8 py-10 text-center">
        <p className="text-2xl mb-2">📬</p>
        <h2
          className="text-xl font-black text-[#1A1A1A] mb-2"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Check your inbox
        </h2>
        <p className="text-sm text-[#6B6058] mb-1">
          We sent a confirmation link to
        </p>
        <p className="text-sm font-semibold text-[#1A1A1A] mb-4">{email}</p>
        <p className="text-xs text-[#9A9080]">
          Click the link in the email to activate your account and start setup.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Link expired banner */}
      {linkExpired && (
        <div className="border border-orange-200 bg-orange-50 rounded-2xl px-5 py-4 flex items-start gap-3">
          <span className="text-lg flex-shrink-0">⏱️</span>
          <div>
            <p className="text-sm font-semibold text-orange-800 mb-0.5">
              Your confirmation link expired
            </p>
            <p className="text-xs text-orange-700 leading-relaxed">
              Email links expire after 1 hour. Sign up again below and we&apos;ll send you a fresh one — confirm it straight away this time.
            </p>
          </div>
        </div>
      )}

      <div className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl px-8 py-8">
        <h1
          className="text-2xl font-black text-[#1A1A1A] mb-1"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          Create your account
        </h1>
        <p className="text-sm text-[#6B6058] mb-7">
          Already have one?{" "}
          <a href="/login" className="text-[#5C6B00] font-medium hover:underline">
            Sign in
          </a>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#6B6058] mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full bg-[#F5F0E8] border border-[#D5CFC3] rounded-xl px-4 py-3 text-[#1A1A1A] placeholder-[#9A9080] text-sm focus:outline-none focus:border-[#5C6B00] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6B6058] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
              className="w-full bg-[#F5F0E8] border border-[#D5CFC3] rounded-xl px-4 py-3 text-[#1A1A1A] placeholder-[#9A9080] text-sm focus:outline-none focus:border-[#5C6B00] transition-colors"
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-[#1A1A1A] text-[#F5F0E8] font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#D4FF00] hover:text-[#1A1A1A] transition-colors disabled:opacity-60 mt-1"
          >
            {status === "loading" ? "Creating account…" : "Create account →"}
          </button>

          <p className="text-xs text-[#9A9080] text-center">
            By signing up you agree to our{" "}
            <a href="/terms" className="underline hover:text-[#5C6B00]">Terms</a>
            {" "}and{" "}
            <a href="/privacy" className="underline hover:text-[#5C6B00]">Privacy Policy</a>.
          </p>
        </form>
      </div>

      {/* What WASP does — profile analysis promise */}
      <div className="border border-[#D5CFC3] bg-[#EDE8DE] rounded-2xl px-6 py-5">
        <p className="text-xs font-semibold text-[#5C6B00] uppercase tracking-wider mb-3">
          What WASP does after you connect Instagram
        </p>
        <div className="flex flex-col gap-2.5">
          {[
            {
              icon: "🔍",
              text: "Reads your last 50 posts, captions, and comment replies to understand exactly how you communicate",
            },
            {
              icon: "🧠",
              text: "Builds a full personality profile of your Instagram voice — tone, energy, phrases you use",
            },
            {
              icon: "✍️",
              text: "Uses that profile to write every reply so your audience can't tell the difference",
            },
          ].map((item) => (
            <div key={item.icon} className="flex items-start gap-3">
              <span className="text-base leading-none mt-0.5 flex-shrink-0">{item.icon}</span>
              <p className="text-xs text-[#6B6058] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
