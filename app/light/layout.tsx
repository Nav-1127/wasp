import NavLight from "@/components/landing/light/Nav";
import FooterLight from "@/components/landing/light/Footer";

export default function LightLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#F5F0E8", minHeight: "100vh" }}>
      <NavLight />
      <main>{children}</main>
      <FooterLight />
    </div>
  );
}
