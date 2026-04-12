import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — WASP",
  description: "WASP Privacy Policy",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-[#6B6B6B] text-sm">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <div className="border border-[#D4FF00]/20 bg-[#D4FF00]/5 rounded-xl p-5 mb-10">
          <p className="text-sm text-[#D4FF00]/80">
            <strong className="text-[#D4FF00]">Note:</strong> This is a placeholder privacy policy.
            The full legal policy will be generated via Termly and published here before WASP launches.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-[#6B6B6B] text-sm leading-relaxed">
          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              1. Who We Are
            </h2>
            <p>
              WASP ("we," "our," or "us") is an AI-powered Instagram engagement tool operated
              by its founders. Our product helps brands automate Instagram engagement using
              artificial intelligence. This privacy policy describes how we collect, use,
              and protect your information.
            </p>
            <p className="mt-2">Contact: privacy@joinwasp.com (placeholder)</p>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              2. Information We Collect
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-[#F5F5F5]">Account information:</strong> Email address and password
                (stored securely via Supabase Auth).
              </li>
              <li>
                <strong className="text-[#F5F5F5]">Instagram data:</strong> When you connect your
                Instagram Business account, we access your profile information, posts,
                comments, and DMs via the Meta Instagram API — only as needed to provide
                the service.
              </li>
              <li>
                <strong className="text-[#F5F5F5]">Usage data:</strong> We track how you use WASP
                (responses generated, approvals, etc.) to improve the product and enforce
                plan limits.
              </li>
              <li>
                <strong className="text-[#F5F5F5]">Waitlist:</strong> If you join our waitlist,
                we store your email address.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              3. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To provide and improve the WASP service</li>
              <li>To generate AI responses in your brand's voice</li>
              <li>To analyze your Instagram content to build your personality profile</li>
              <li>To send you product updates and announcements (you can unsubscribe)</li>
              <li>To enforce plan limits and billing</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              4. Data Security
            </h2>
            <p>
              We take security seriously. Instagram access tokens are encrypted at rest using
              AES-256 encryption. We use Row Level Security in our database so your data is
              never accessible to other users. All data is stored on Supabase (Postgres)
              hosted on secure infrastructure.
            </p>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              5. Data Retention & Deletion
            </h2>
            <p>
              You can delete your account at any time from your settings page. This permanently
              removes all your data from our systems — brand profiles, Instagram data, responses,
              everything. We don't keep backups of deleted accounts.
            </p>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              6. Third-Party Services
            </h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>
                <strong className="text-[#F5F5F5]">Supabase:</strong> Authentication and database
              </li>
              <li>
                <strong className="text-[#F5F5F5]">Anthropic Claude:</strong> AI response generation
              </li>
              <li>
                <strong className="text-[#F5F5F5]">Meta / Instagram API:</strong> Instagram integration
              </li>
              <li>
                <strong className="text-[#F5F5F5]">Vercel:</strong> Hosting and deployment
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="text-xl font-bold text-white mb-3"
              style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
            >
              7. Contact
            </h2>
            <p>
              Questions about this policy? Email us at{" "}
              <span className="text-[#D4FF00]">privacy@joinwasp.com</span> (placeholder — will be
              active before launch).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
