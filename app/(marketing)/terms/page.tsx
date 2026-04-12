import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — WASP",
  description: "WASP Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="pt-24 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
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
            Terms of Service
          </h1>
          <p className="text-[#6B6B6B] text-sm">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="border border-[#D4FF00]/20 bg-[#D4FF00]/5 rounded-xl p-5 mb-10">
          <p className="text-sm text-[#D4FF00]/80">
            <strong className="text-[#D4FF00]">Note:</strong> This is a placeholder terms of service.
            The full legal terms will be generated via Termly and published here before WASP launches.
          </p>
        </div>

        <div className="space-y-8 text-[#6B6B6B] text-sm leading-relaxed">
          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              1. Acceptance of Terms
            </h2>
            <p>
              By using WASP, you agree to these Terms of Service. If you do not agree,
              do not use WASP. We may update these terms from time to time — we'll notify
              you of material changes via email.
            </p>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              2. What WASP Does
            </h2>
            <p>
              WASP is an AI-powered tool that generates Instagram engagement responses
              (comments, DMs, story replies) based on your brand's personality profile.
              WASP integrates with Instagram via the official Meta Instagram Graph API.
            </p>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              3. Your Responsibilities
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                You must have an Instagram Business or Creator account that you own or
                have authorization to manage.
              </li>
              <li>
                You are responsible for reviewing AI-generated responses in Draft Mode
                before they go out. WASP generates content — you are responsible for
                what gets sent.
              </li>
              <li>
                You agree to use WASP in compliance with Meta's Platform Terms and
                Instagram's Community Guidelines.
              </li>
              <li>
                You will not use WASP to spam, harass, mislead, or violate any applicable
                laws or platform rules.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              4. Auto Mode Disclaimer
            </h2>
            <p>
              When you enable Auto Mode, WASP sends responses to your Instagram followers
              without prior human review. By enabling Auto Mode, you accept full
              responsibility for all automatically sent content. We strongly recommend
              starting in Draft Mode and reviewing WASP's output quality before enabling
              Auto Mode.
            </p>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              5. Free Tier Limits
            </h2>
            <p>
              Free tier users are limited to 50 AI responses per month. If you exceed
              this limit, WASP will stop generating new responses until you upgrade or
              the new month begins. Responses are tracked per calendar month.
            </p>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              6. Intellectual Property
            </h2>
            <p>
              The AI-generated responses WASP creates are based on your brand's content
              and are provided to you for your use. WASP's software, branding, and
              underlying systems remain our intellectual property.
            </p>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              7. Limitation of Liability
            </h2>
            <p>
              WASP is provided "as is." We are not liable for any indirect, incidental,
              or consequential damages arising from your use of the service, including
              but not limited to loss of followers, account restrictions by Instagram,
              or revenue loss. Use WASP at your own discretion.
            </p>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              8. Termination
            </h2>
            <p>
              You can delete your account at any time. We may suspend or terminate accounts
              that violate these terms without prior notice. Upon termination, your data
              will be permanently deleted.
            </p>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              9. Contact
            </h2>
            <p>
              Questions about these terms? Email us at{" "}
              <span className="text-[#D4FF00]">legal@joinwasp.com</span> (placeholder — will
              be active before launch).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
