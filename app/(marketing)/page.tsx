import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Problem from "@/components/landing/Problem";
import BeforeAfter from "@/components/landing/BeforeAfter";
import PricingPreview from "@/components/landing/PricingPreview";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Problem />
      <BeforeAfter />
      <PricingPreview />
    </>
  );
}
