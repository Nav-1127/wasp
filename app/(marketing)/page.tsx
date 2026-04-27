import HeroLight from "@/components/landing/light/Hero";
import ProblemLight from "@/components/landing/light/Problem";
import HowItWorksLight from "@/components/landing/light/HowItWorks";
import BeforeAfterLight from "@/components/landing/light/BeforeAfter";
import PricingPreviewLight from "@/components/landing/light/PricingPreview";
import FaqLight from "@/components/landing/light/Faq";

export default function LandingPage() {
  return (
    <>
      <HeroLight />
      <ProblemLight />
      <HowItWorksLight />
      <BeforeAfterLight />
      <PricingPreviewLight />
      <FaqLight />
    </>
  );
}
