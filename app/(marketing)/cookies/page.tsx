import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy · WASP",
  description: "WASP Cookie Policy",
};

const serifH1: React.CSSProperties = {
  fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
  fontWeight: 500,
  fontSize: "clamp(2rem, 4vw, 3rem)",
  lineHeight: 1.1,
  letterSpacing: "-0.02em",
};

const serifH2: React.CSSProperties = {
  fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
  fontWeight: 500,
  fontSize: "1.375rem",
  letterSpacing: "-0.01em",
};

export default function CookiesPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm text-[#666666] hover:text-[#1A1A1A] transition-colors mb-6 inline-flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 3L5 7l4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to home
          </Link>
          <h1 className="text-[#1A1A1A] mt-4 mb-3" style={serifH1}>
            Cookie policy
          </h1>
          <p className="text-[#888888] text-sm">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div
          className="rounded-2xl p-5 mb-10 border border-[#EBE5DC]"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          <p className="text-sm text-[#666666]">
            <strong className="text-[#1A1A1A]">Note:</strong> This is a placeholder cookie policy.
            The full policy will be generated via Termly and published here before WASP launches.
          </p>
        </div>

        <div className="space-y-10 text-[#444444] text-sm leading-relaxed">
          <section>
            <h2 className="text-[#1A1A1A] mb-3" style={serifH2}>
              What are cookies?
            </h2>
            <p>
              Cookies are small text files stored on your device when you visit a website.
              WASP uses only strictly necessary cookies. No advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-[#1A1A1A] mb-3" style={serifH2}>
              Cookies we use
            </h2>
            <div className="flex flex-col gap-4">
              <div
                className="rounded-xl p-4 border border-[#EBE5DC]"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <p className="font-semibold text-[#1A1A1A] mb-1">Authentication session cookie</p>
                <p className="text-xs text-[#888888] mb-2">Provider: Supabase</p>
                <p>
                  Keeps you logged in to your WASP account. This cookie is strictly necessary
                  for the app to function. Without it you would be logged out on every page.
                  It is httpOnly and secure, meaning it cannot be accessed by JavaScript.
                </p>
              </div>
              <div
                className="rounded-xl p-4 border border-[#EBE5DC]"
                style={{ backgroundColor: "#FFFFFF" }}
              >
                <p className="font-semibold text-[#1A1A1A] mb-1">OAuth state cookie</p>
                <p className="text-xs text-[#888888] mb-2">Name: instagram_oauth_state</p>
                <p>
                  A temporary security cookie used only during Instagram account connection.
                  It prevents CSRF attacks during the OAuth flow and is automatically deleted
                  after 10 minutes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-[#1A1A1A] mb-3" style={serifH2}>
              What we do not use
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>No advertising or retargeting cookies</li>
              <li>No analytics cookies (no Google Analytics, Mixpanel, etc.)</li>
              <li>No third-party tracking pixels</li>
              <li>No cross-site tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#1A1A1A] mb-3" style={serifH2}>
              Managing cookies
            </h2>
            <p>
              Since we only use strictly necessary cookies, disabling them will prevent WASP
              from functioning. You can clear cookies at any time through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-[#1A1A1A] mb-3" style={serifH2}>
              Contact
            </h2>
            <p>
              Questions about this policy? Email us at{" "}
              <span style={{ color: "#5B2B8C" }}>privacy@joinwasp.com</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
