import HeroLight from "@/components/landing/light/Hero";
import ProblemLight from "@/components/landing/light/Problem";
import HowItWorksLight from "@/components/landing/light/HowItWorks";
import BeforeAfterLight from "@/components/landing/light/BeforeAfter";
import PricingPreviewLight from "@/components/landing/light/PricingPreview";
import FaqLight from "@/components/landing/light/Faq";

// Site-wide dot grid (v7) — opacity bumped from 3% → 20%. Dropping the
// "barely perceptible" goal in favor of a clearly visible graph-paper
// texture. Dot size and spacing unchanged. Pricing/privacy/terms/cookies
// pages still inherit the plain marketing layout bg (no pattern).
const landingPattern: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle, rgba(26, 26, 26, 0.20) 1.25px, transparent 1.25px)",
  backgroundSize: "24px 24px",
};

export default function LandingPage() {
  return (
    <div style={landingPattern}>
      <HeroLight />
      <ProblemLight />
      <HowItWorksLight />
      <BeforeAfterLight />
      <PricingPreviewLight />
      <FaqLight />
    </div>
  );
}
