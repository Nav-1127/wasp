export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ backgroundColor: "#F5F0E8" }}
    >
      {/* Logo */}
      <a href="/" className="mb-8 flex items-center gap-1.5 group">
        <span
          className="text-4xl font-black tracking-tighter text-[#1A1A1A] group-hover:text-[#5C6B00] transition-colors"
          style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}
        >
          WASP
        </span>
        <span className="text-2xl leading-none">⚡</span>
      </a>

      <div className="w-full max-w-md">{children}</div>

      <p className="mt-8 text-xs text-[#9A9080]">
        © {new Date().getFullYear()} WASP · joinwasp.com
      </p>
    </div>
  );
}
