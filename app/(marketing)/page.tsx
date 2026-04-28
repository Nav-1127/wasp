import HeroLight from "@/components/landing/light/Hero";
import ProblemLight from "@/components/landing/light/Problem";
import HowItWorksLight from "@/components/landing/light/HowItWorks";
import BeforeAfterLight from "@/components/landing/light/BeforeAfter";
import PricingPreviewLight from "@/components/landing/light/PricingPreview";
import FaqLight from "@/components/landing/light/Faq";

// Site-wide dot grid (v6) — applied at the landing-page wrapper level so the
// pattern is unbroken across all sections. 1.25px dots, 24px spacing,
// rgba(26, 26, 26, 0.03) — slightly subtler than v2's hero-only 4% to avoid
// fatigue across the longer canvas. Pricing/privacy/terms/cookies pages
// inherit the marketing layout's plain #FAF8F5 (no pattern).
const landingPattern: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle, rgba(26, 26, 26, 0.03) 1.25px, transparent 1.25px)",
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
