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
          <p className="text-[#6B6B6B] text-sm">Last updated April 18, 2026</p>
        </div>

        <div className="space-y-8 text-[#9A9A9A] text-sm leading-relaxed">

          <p>
            This Privacy Notice for WASP (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) describes how and why we might access, collect, store, use, and/or share (&quot;process&quot;) your personal information when you use our services (&quot;Services&quot;), including when you:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Visit our website at <a href="https://www.joinwasp.com" className="text-[#D4FF00] hover:underline">https://www.joinwasp.com</a> or any website of ours that links to this Privacy Notice</li>
            <li>Use WASP. WASP is an AI-powered Instagram engagement tool for business and creator accounts. It reads incoming comments and direct messages, drafts responses in the account owner&apos;s authentic voice using AI, and lets the owner review and approve replies before they go live. Users can also switch to Auto Mode, where WASP sends approved-style responses automatically without manual review.</li>
            <li>Engage with us in other related ways, including any marketing or events</li>
          </ul>
          <p>
            <strong className="text-white">Questions or concerns?</strong> Contact us at <a href="mailto:waspprivacy@gmail.com" className="text-[#D4FF00] hover:underline">waspprivacy@gmail.com</a>.
          </p>

          {/* TOC */}
          <div className="border border-[#2A2A2A] rounded-xl p-5">
            <p className="text-white font-bold mb-3">TABLE OF CONTENTS</p>
            <ol className="list-decimal list-inside space-y-1 text-[#6B6B6B] text-xs">
              {[
                "WHAT INFORMATION DO WE COLLECT?",
                "HOW DO WE PROCESS YOUR INFORMATION?",
                "WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?",
                "WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?",
                "DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?",
                "DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?",
                "IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?",
                "HOW LONG DO WE KEEP YOUR INFORMATION?",
                "HOW DO WE KEEP YOUR INFORMATION SAFE?",
                "DO WE COLLECT INFORMATION FROM MINORS?",
                "WHAT ARE YOUR PRIVACY RIGHTS?",
                "CONTROLS FOR DO-NOT-TRACK FEATURES",
                "DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?",
                "DO WE MAKE UPDATES TO THIS NOTICE?",
                "HOW CAN YOU CONTACT US ABOUT THIS NOTICE?",
                "HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?",
              ].map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </div>

          <Section title="1. WHAT INFORMATION DO WE COLLECT?">
            <p className="mb-3"><em>In Short: We collect personal information that you provide to us.</em></p>
            <p className="mb-3">We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</p>
            <p className="mb-2"><strong className="text-white">Personal Information Provided by You.</strong> The personal information we collect may include:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>Email addresses</li>
              <li>Passwords</li>
            </ul>
            <p className="mb-3"><strong className="text-white">Sensitive Information.</strong> We do not process sensitive information.</p>
            <p className="mb-3">All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</p>
            <p className="mb-2"><strong className="text-white">Information collected from other sources.</strong> We may collect limited data from public databases, marketing partners, and other outside sources, including information from social media platforms when you connect your Instagram account to our Services.</p>
          </Section>

          <Section title="2. HOW DO WE PROCESS YOUR INFORMATION?">
            <p className="mb-3"><em>In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</em></p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>To facilitate account creation and authentication and otherwise manage user accounts.</li>
              <li>To deliver and facilitate delivery of services to the user.</li>
              <li>To send administrative information to you.</li>
              <li>To request feedback.</li>
              <li>To send you marketing and promotional communications (you can opt out at any time).</li>
              <li>To protect our Services, including fraud monitoring and prevention.</li>
              <li>To identify usage trends and improve our Services.</li>
              <li>To save or protect an individual&apos;s vital interest.</li>
            </ul>
          </Section>

          <Section title="3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?">
            <p className="mb-3"><em>In Short: We only process your personal information when we have a valid legal reason to do so.</em></p>
            <p className="mb-3">If you are located in the EU or UK, we rely on the following legal bases:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
              <li><strong className="text-white">Consent.</strong> We may process your information if you have given us permission for a specific purpose. You can withdraw your consent at any time.</li>
              <li><strong className="text-white">Performance of a Contract.</strong> We may process your personal information when necessary to fulfill our contractual obligations to you.</li>
              <li><strong className="text-white">Legitimate Interests.</strong> We may process your information when reasonably necessary to achieve our legitimate business interests, including to send information about offers, analyze service usage, diagnose problems, and understand how users use our products.</li>
              <li><strong className="text-white">Legal Obligations.</strong> We may process your information where necessary for compliance with our legal obligations.</li>
              <li><strong className="text-white">Vital Interests.</strong> We may process your information where necessary to protect your vital interests or those of a third party.</li>
            </ul>
            <p>If you are located in Canada, we may process your information if you have given us specific permission, or in situations where your permission can be inferred.</p>
          </Section>

          <Section title="4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?">
            <p className="mb-3"><em>In Short: We may share information in specific situations and with the following third parties.</em></p>
            <p className="mb-3">We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf. The third parties we share personal information with are:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
              <li><strong className="text-white">AI Service Providers:</strong> Anthropic</li>
              <li><strong className="text-white">Allow Users to Connect to Their Third-Party Accounts:</strong> Instagram</li>
              <li><strong className="text-white">Website Hosting:</strong> Vercel and Supabase</li>
            </ul>
            <p>We may also share or transfer your information in connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business.</p>
          </Section>

          <Section title="5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?">
            <p className="mb-3"><em>In Short: We may use cookies and other tracking technologies to collect and store your information.</em></p>
            <p className="mb-3">We use cookies to maintain the security of our Services and your account, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.</p>
            <p>Specific information about how we use such technologies and how you can refuse certain cookies is set out in our <a href="/cookies" className="text-[#D4FF00] hover:underline">Cookie Policy</a>.</p>
          </Section>

          <Section title="6. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?">
            <p className="mb-3"><em>In Short: We offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies.</em></p>
            <p className="mb-3">We provide AI Products through third-party service providers, including Anthropic. Your input, output, and personal information will be shared with and processed by these AI Service Providers to enable your use of our AI Products.</p>
            <p className="mb-3">Our AI Products are designed for: AI automation, natural language processing, text analysis, and image analysis.</p>
            <p className="mb-2"><strong className="text-white">How to Opt Out:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Log in to your account settings and update your user account.</li>
              <li>Disconnect your Instagram account from the Settings page to stop all Instagram data access and AI processing.</li>
            </ul>
          </Section>

          <Section title="7. IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?">
            <p className="mb-3"><em>In Short: We may transfer, store, and process your information in countries other than your own.</em></p>
            <p className="mb-3">Our servers are located in India and the United States. If you are a resident in the EEA, UK, or Switzerland, please be aware that your information may be transferred to, stored by, and processed by us in the United States and India.</p>
            <p>We have implemented the European Commission&apos;s Standard Contractual Clauses for transfers of personal information to ensure all recipients protect personal information originating from the EEA or UK in accordance with European data protection laws.</p>
          </Section>

          <Section title="8. HOW LONG DO WE KEEP YOUR INFORMATION?">
            <p className="mb-3"><em>In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice.</em></p>
            <p>We will only keep your personal information for as long as you have an account with us. When we have no ongoing legitimate business need to process your personal information, we will delete or anonymize it.</p>
          </Section>

          <Section title="9. HOW DO WE KEEP YOUR INFORMATION SAFE?">
            <p className="mb-3"><em>In Short: We aim to protect your personal information through a system of organizational and technical security measures.</em></p>
            <p>We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process, including AES-256-GCM encryption for access tokens and Row Level Security in our database. However, no electronic transmission over the Internet can be guaranteed to be 100% secure.</p>
          </Section>

          <Section title="10. DO WE COLLECT INFORMATION FROM MINORS?">
            <p className="mb-3"><em>In Short: We do not knowingly collect data from or market to children under 18 years of age.</em></p>
            <p>We do not knowingly collect, solicit data from, or market to children under 18 years of age. By using the Services, you represent that you are at least 18 years of age. If you become aware of any data we may have collected from children under age 18, please contact us at <a href="mailto:waspprivacy@gmail.com" className="text-[#D4FF00] hover:underline">waspprivacy@gmail.com</a>.</p>
          </Section>

          <Section title="11. WHAT ARE YOUR PRIVACY RIGHTS?">
            <p className="mb-3"><em>In Short: Depending on your location, you may have certain rights regarding your personal information.</em></p>
            <p className="mb-3">In some regions (like the EEA, UK, Switzerland, and Canada), you have rights including: the right to access and obtain a copy of your personal information, to request rectification or erasure, to restrict processing, to data portability, and not to be subject to automated decision-making.</p>
            <p className="mb-3"><strong className="text-white">Withdrawing your consent:</strong> You have the right to withdraw your consent at any time by contacting us at <a href="mailto:waspprivacy@gmail.com" className="text-[#D4FF00] hover:underline">waspprivacy@gmail.com</a>.</p>
            <p className="mb-3"><strong className="text-white">Opting out of marketing:</strong> You can unsubscribe from marketing communications at any time by clicking the unsubscribe link in our emails.</p>
            <p className="mb-3"><strong className="text-white">Account Information:</strong> You may review, change, or terminate your account at any time by logging in to your account settings or contacting us.</p>
            <p>For cookie management, see our <a href="/cookies" className="text-[#D4FF00] hover:underline">Cookie Policy</a>.</p>
          </Section>

          <Section title="12. CONTROLS FOR DO-NOT-TRACK FEATURES">
            <p>Most web browsers include a Do-Not-Track (&quot;DNT&quot;) feature. As no uniform technology standard for recognizing and implementing DNT signals has been finalized, we do not currently respond to DNT browser signals. If a standard is adopted that we must follow in the future, we will inform you in a revised version of this Privacy Notice.</p>
          </Section>

          <Section title="13. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?">
            <p className="mb-3"><em>In Short: If you are a US resident, you may have the right to request access to, correct, or delete your personal information.</em></p>
            <p className="mb-3">The categories of personal information we have collected in the past twelve months include: Identifiers (email address) and Inferences (personality profile derived from your Instagram content).</p>
            <p className="mb-3">We have not sold or shared any personal information to third parties for a business or commercial purpose in the preceding twelve months.</p>
            <p className="mb-2"><strong className="text-white">Your rights include:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>Right to know whether or not we are processing your personal data</li>
              <li>Right to access your personal data</li>
              <li>Right to correct inaccuracies in your personal data</li>
              <li>Right to request the deletion of your personal data</li>
              <li>Right to obtain a copy of the personal data you previously shared with us</li>
              <li>Right to non-discrimination for exercising your rights</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:waspprivacy@gmail.com" className="text-[#D4FF00] hover:underline">waspprivacy@gmail.com</a>.</p>
          </Section>

          <Section title="14. DO WE MAKE UPDATES TO THIS NOTICE?">
            <p>Yes, we will update this notice as necessary to stay compliant with relevant laws. The updated version will be indicated by an updated &quot;Last updated&quot; date at the top of this Privacy Notice. We encourage you to review this Privacy Notice frequently.</p>
          </Section>

          <Section title="15. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?">
            <p className="mb-3">If you have questions or comments about this notice, you may contact our Data Protection Officer (DPO) by email at <a href="mailto:waspprivacy@gmail.com" className="text-[#D4FF00] hover:underline">waspprivacy@gmail.com</a>, or by post at:</p>
            <p className="text-white">
              WASP<br />
              Data Protection Officer<br />
              Punjab, India
            </p>
          </Section>

          <Section title="16. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?">
            <p>Based on the applicable laws of your country or state of residence, you may have the right to request access to the personal information we collect from you, correct inaccuracies, or delete your personal information. To submit a request, please contact us at <a href="mailto:waspprivacy@gmail.com" className="text-[#D4FF00] hover:underline">waspprivacy@gmail.com</a>.</p>
          </Section>

          <p className="text-[#6B6B6B] text-xs pt-4 border-t border-[#2A2A2A]">
            This Privacy Policy was generated using Termly&apos;s Privacy Policy Generator.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="text-base font-bold text-white mb-3"
        style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
