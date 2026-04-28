export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{
        backgroundColor: "#FAF8F5",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        color: "#1A1A1A",
      }}
    >
      <a href="/" className="mb-8 flex items-center group">
        <span
          className="text-[#1A1A1A]"
          style={{
            fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "2rem",
            letterSpacing: "0.05em",
            fontVariationSettings: '"opsz" 32',
          }}
        >
          WASP
        </span>
      </a>

      <div className="w-full max-w-md">{children}</div>

      <p className="mt-8 text-xs text-[#888888]">
        © {new Date().getFullYear()} WASP · joinwasp.com
      </p>
    </div>
  );
}
