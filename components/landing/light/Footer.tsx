import Link from "next/link";

export default function FooterLight() {
  return (
    <footer
      className="border-t border-[#EBE5DC] py-16 px-6"
      style={{ backgroundColor: "#FAF8F5" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
          <div>
            <div className="flex items-center mb-3">
              <span
                className="text-[#1A1A1A]"
                style={{
                  fontFamily:
                    "var(--font-space), 'Space Grotesk', system-ui, sans-serif",
                  fontWeight: 700,
                  fontSize: "2rem",
                  letterSpacing: "0.05em",
                  lineHeight: 1,
                }}
              >
                WASP
              </span>
            </div>
            <p
              className="text-[#666666]"
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: "0.95rem",
              }}
            >
              An AI engagement agent for Instagram.
            </p>
            <p
              className="text-[#999999]"
              style={{ fontSize: "0.75rem", marginTop: 10, maxWidth: 320, lineHeight: 1.6 }}
            >
              WASP is built by AMAAR, a Meta-verified Tech Provider. Your Instagram account stays safe and your data stays yours.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-10 gap-y-6 text-sm">
            <div className="flex flex-col gap-3">
              <span className="text-xs text-[#888888] tracking-[0.18em]">product</span>
              <Link
                href="/pricing"
                className="text-[#1A1A1A] hover:opacity-70 transition-opacity"
              >
                Pricing
              </Link>
              <Link
                href="/signup"
                className="text-[#1A1A1A] hover:opacity-70 transition-opacity"
              >
                Sign up
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs text-[#888888] tracking-[0.18em]">legal</span>
              <Link
                href="/privacy"
                className="text-[#1A1A1A] hover:opacity-70 transition-opacity"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-[#1A1A1A] hover:opacity-70 transition-opacity"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-[#EBE5DC]">
          <p className="text-[#888888] text-xs">
            © {new Date().getFullYear()} WASP. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
