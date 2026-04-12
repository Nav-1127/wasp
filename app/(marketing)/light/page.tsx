import type { Metadata } from "next";
import HeroLight from "@/components/landing/light/Hero";
import HowItWorksLight from "@/components/landing/light/HowItWorks";
import ProblemLight from "@/components/landing/light/Problem";
import BeforeAfterLight from "@/components/landing/light/BeforeAfter";
import PricingPreviewLight from "@/components/landing/light/PricingPreview";

export const metadata: Metadata = {
  title: "WASP — AI Instagram Engagement Agent",
  robots: { index: false }, // don't index this comparison page
};

export default function LightPage() {
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
