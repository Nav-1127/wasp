import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#1A1A1A] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xl font-black text-white tracking-tighter"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                WASP
              </span>
              <span className="text-[#D4FF00] text-lg leading-none">⚡</span>
            </div>
            <p className="text-[#4A4A4A] text-xs max-w-[200px]">
              AI Instagram Engagement Agent
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-8 text-sm">
            <div className="flex flex-col gap-3">
              <span className="text-xs text-[#4A4A4A] font-semibold uppercase tracking-widest">
                Product
              </span>
              <Link href="/pricing" className="text-[#6B6B6B] hover:text-white transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs text-[#4A4A4A] font-semibold uppercase tracking-widest">
                Legal
              </span>
              <Link href="/privacy" className="text-[#6B6B6B] hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[#6B6B6B] hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs text-[#4A4A4A] font-semibold uppercase tracking-widest">
                Connect
              </span>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6B6B6B] hover:text-white transition-colors"
              >
                Twitter / X
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6B6B6B] hover:text-white transition-colors"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#1A1A1A] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#4A4A4A] text-xs">
            © {new Date().getFullYear()} WASP. All rights reserved.
          </p>
          <p className="text-[#4A4A4A] text-xs">
            Built by{" "}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6B6B6B] hover:text-[#D4FF00] transition-colors"
            >
              Nav
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
