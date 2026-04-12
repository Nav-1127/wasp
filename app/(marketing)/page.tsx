import HeroLight from "@/components/landing/light/Hero";
import HowItWorksLight from "@/components/landing/light/HowItWorks";
import ProblemLight from "@/components/landing/light/Problem";
import BeforeAfterLight from "@/components/landing/light/BeforeAfter";
import PricingPreviewLight from "@/components/landing/light/PricingPreview";

export default function LandingPage() {
  return (
    <>
      <HeroLight />
      <HowItWorksLight />
      <ProblemLight />
      <BeforeAfterLight />
      <PricingPreviewLight />
    </>
  );
}
