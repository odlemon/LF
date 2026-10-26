import React from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { CustomersSection } from "@/components/landing/CustomersSection";
import { PlatformSection } from "@/components/landing/PlatformSection";
import { PracticeAreasSection } from "@/components/landing/PracticeAreasSection";
import { OutcomesSection } from "@/components/landing/OutcomesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full bg-white">
      <HeroSection />
      <CustomersSection />
      <PlatformSection />
      <PracticeAreasSection />
      <OutcomesSection />
      <PricingSection />
      <SecuritySection />
      <FooterSection />
    </div>
  );
}
