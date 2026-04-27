import NavLight from "@/components/landing/light/Nav";
import FooterLight from "@/components/landing/light/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "#FAF8F5",
        minHeight: "100vh",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
        color: "#1A1A1A",
      }}
    >
      <NavLight />
      <main className="flex-1">{children}</main>
      <FooterLight />
    </div>
  );
}
