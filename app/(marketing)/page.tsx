import HeroLight from "@/components/landing/light/Hero";
import DemoSectionLight from "@/components/landing/light/DemoSection";
import ProblemLight from "@/components/landing/light/Problem";
import HowItWorksLight from "@/components/landing/light/HowItWorks";
import BeforeAfterLight from "@/components/landing/light/BeforeAfter";
import PricingPreviewLight from "@/components/landing/light/PricingPreview";
import FaqLight from "@/components/landing/light/Faq";

// Site-wide dot grid (v8) — opacity dialed back from 20% → 10% so the
// pattern reads as supporting texture rather than competing with the H1.
// Visible but quiet. Dot size and spacing unchanged.
const landingPattern: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle, rgba(26, 26, 26, 0.10) 1.25px, transparent 1.25px)",
  backgroundSize: "24px 24px",
};

export default function LandingPage() {
  return (
    <div style={landingPattern}>
      <HeroLight />
      <ProblemLight />
      <DemoSectionLight />
      <HowItWorksLight />
      <BeforeAfterLight />
      <PricingPreviewLight />
      <FaqLight />
    </div>
  );
}
