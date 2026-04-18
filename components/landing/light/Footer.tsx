import Link from "next/link";

export default function FooterLight() {
  return (
    <footer className="border-t border-[#D5CFC3] bg-[#F5F0E8] py-10 sm:py-12 px-5 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 sm:gap-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xl font-black text-[#1A1A1A] tracking-tighter"
                style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
              >
                WASP
              </span>
              <span className="text-lg leading-none">⚡</span>
            </div>
            <p className="text-[#9A9080] text-xs max-w-[200px]">AI Agent for Instagram Engagement</p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-6 text-sm">
            <div className="flex flex-col gap-3">
              <span className="text-xs text-[#9A9080] font-semibold uppercase tracking-widest">Product</span>
              <Link href="/pricing" className="text-[#6B6058] hover:text-[#1A1A1A] transition-colors">Pricing</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs text-[#9A9080] font-semibold uppercase tracking-widest">Legal</span>
              <Link href="/privacy" className="text-[#6B6058] hover:text-[#1A1A1A] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[#6B6058] hover:text-[#1A1A1A] transition-colors">Terms of Service</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs text-[#9A9080] font-semibold uppercase tracking-widest">Connect</span>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#6B6058] hover:text-[#1A1A1A] transition-colors">Twitter / X</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#6B6058] hover:text-[#1A1A1A] transition-colors">Instagram</a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E5DFD5] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#9A9080] text-xs">© {new Date().getFullYear()} WASP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
