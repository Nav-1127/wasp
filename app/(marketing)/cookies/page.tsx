import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy — WASP",
  description: "WASP Cookie Policy",
};

export default function CookiesPage() {
  return (
    <div className="pt-24 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm text-[#6B6B6B] hover:text-[#D4FF00] transition-colors mb-6 inline-flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 3L5 7l4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to home
          </Link>
          <h1
            className="text-4xl md:text-5xl font-black text-white mt-4 mb-3"
            style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
          >
            Cookie Policy
          </h1>
          <p className="text-[#6B6B6B] text-sm">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="border border-[#D4FF00]/20 bg-[#D4FF00]/5 rounded-xl p-5 mb-10">
          <p className="text-sm text-[#D4FF00]/80">
            <strong className="text-[#D4FF00]">Note:</strong> This is a placeholder cookie policy.
            The full policy will be generated via Termly and published here before WASP launches.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-[#6B6B6B] text-sm leading-relaxed">
          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              What Are Cookies?
            </h2>
            <p>
              Cookies are small text files stored on your device when you visit a website.
              WASP uses only strictly necessary cookies — no advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Cookies We Use
            </h2>
            <div className="flex flex-col gap-4">
              <div className="border border-[#2A2A2A] rounded-xl p-4">
                <p className="font-semibold text-white mb-1">Authentication Session Cookie</p>
                <p className="text-xs text-[#9A9080] mb-2">Provider: Supabase</p>
                <p>
                  Keeps you logged in to your WASP account. This cookie is strictly necessary
                  for the app to function — without it you would be logged out on every page.
                  It is httpOnly and secure, meaning it cannot be accessed by JavaScript.
                </p>
              </div>
              <div className="border border-[#2A2A2A] rounded-xl p-4">
                <p className="font-semibold text-white mb-1">OAuth State Cookie</p>
                <p className="text-xs text-[#9A9080] mb-2">Name: instagram_oauth_state</p>
                <p>
                  A temporary security cookie used only during Instagram account connection.
                  It prevents CSRF attacks during the OAuth flow and is automatically deleted
                  after 10 minutes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              What We Do NOT Use
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>No advertising or retargeting cookies</li>
              <li>No analytics cookies (no Google Analytics, Mixpanel, etc.)</li>
              <li>No third-party tracking pixels</li>
              <li>No cross-site tracking</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Managing Cookies
            </h2>
            <p>
              Since we only use strictly necessary cookies, disabling them will prevent WASP
              from functioning. You can clear cookies at any time through your browser settings.
            </p>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              Contact
            </h2>
            <p>
              Questions about this policy? Email us at{" "}
              <span className="text-[#D4FF00]">privacy@joinwasp.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
