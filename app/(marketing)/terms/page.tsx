import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service · WASP",
  description: "WASP Terms of Service",
};

const serif: React.CSSProperties = {
  fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
  fontWeight: 500,
  letterSpacing: "-0.02em",
};

export default function TermsPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <Link
            href="/"
            className="text-sm text-[#666666] hover:text-[#1A1A1A] transition-colors inline-flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 3L5 7l4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to home
          </Link>
          <h1
            className="text-[#1A1A1A] mt-4 mb-3"
            style={{ ...serif, fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.1 }}
          >
            Terms of service
          </h1>
          <p className="text-[#888888] text-sm">Last updated April 18, 2026</p>
        </div>

        <div className="text-[#444444] text-sm leading-relaxed space-y-10">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of WASP and the services provided at joinwasp.com (&quot;Service&quot;). By creating an account or using WASP, you agree to these Terms. If you do not agree, do not use the Service.
          </p>

          <Section title="1. Account creation">
            <p>To use WASP you must create an account using a valid email address and connect an Instagram Business or Creator account that you own or are authorized to manage. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You must be at least 18 years old to use WASP.</p>
          </Section>

          <Section title="2. Acceptable use">
            <p className="mb-3">You agree to use WASP only for lawful purposes and in accordance with these Terms. You must not use WASP to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mb-3">
              <li>Send spam, unsolicited messages, or bulk automated outreach</li>
              <li>Harass, threaten, or abuse any individual</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Violate Meta&apos;s Platform Terms, Instagram&apos;s Community Guidelines, or any applicable laws</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that violate these rules without prior notice.</p>
          </Section>

          <Section title="3. AI-generated responses">
            <p className="mb-3">WASP uses artificial intelligence to draft responses to Instagram comments and direct messages on your behalf. You acknowledge and agree that:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mb-3">
              <li>AI-generated responses are drafts and may not always be accurate, appropriate, or consistent with your brand voice</li>
              <li>In Draft Mode, you are responsible for reviewing and approving every response before it is sent</li>
              <li>In Auto Mode, responses are sent automatically without manual review. By enabling Auto Mode you accept full responsibility for all content sent</li>
              <li>WASP is a tool to assist you, not a substitute for your own judgment</li>
            </ul>
            <p>We are not liable for any consequences arising from AI-generated content sent through your Instagram account.</p>
          </Section>

          <Section title="4. Instagram data usage">
            <p>
              WASP accesses your Instagram account data solely through the official Meta Instagram API, using permissions you explicitly grant during the OAuth authorization flow. We access your profile information, posts, comments, and direct messages only to the extent necessary to provide the Service. You may revoke WASP&apos;s access at any time by disconnecting your Instagram account from the Settings page or through your Instagram account settings. We handle your Instagram data in accordance with our{" "}
              <a href="/privacy" style={{ color: "#5B2B8C" }} className="underline">
                Privacy Policy
              </a>
              .
            </p>
          </Section>

          <Section title="5. Service availability">
            <p>WASP is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We do not guarantee uninterrupted or error-free operation of the Service. We may modify, suspend, or discontinue the Service at any time without notice. We are not liable for any downtime, data loss, or disruption to your Instagram engagement resulting from service unavailability.</p>
          </Section>

          <Section title="6. Limitation of liability">
            <p>To the fullest extent permitted by applicable law, WASP and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of followers, account restrictions or suspension by Instagram or Meta, loss of revenue or business opportunities, or damage to reputation, arising out of or related to your use of the Service. Our total liability to you for any claim arising from these Terms or your use of WASP shall not exceed the amount you paid us in the twelve months preceding the claim.</p>
          </Section>

          <Section title="7. Account termination">
            <p>You may delete your account at any time from the Settings page. Upon deletion, your personal data and interaction history will be permanently removed from our systems. We may suspend or terminate your account if you violate these Terms, misuse the Service, or engage in conduct that harms other users or the integrity of the platform. Termination does not affect any rights or obligations that arose prior to termination.</p>
          </Section>

          <Section title="8. Updates to these terms">
            <p>We may update these Terms from time to time to reflect changes in the Service or applicable law. When we make material changes, we will update the &quot;Last updated&quot; date at the top of this page and notify you by email. Your continued use of WASP after changes are posted constitutes your acceptance of the updated Terms. If you do not agree to the updated Terms, you must stop using the Service and delete your account.</p>
          </Section>

          <Section title="9. Contact">
            <p>
              Questions about these Terms? Contact us at{" "}
              <a href="mailto:waspprivacy@gmail.com" style={{ color: "#5B2B8C" }} className="underline">
                waspprivacy@gmail.com
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[#1A1A1A] mb-4" style={{ ...serif, fontSize: "1.375rem" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
