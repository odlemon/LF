import React from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { CustomersSection } from "@/components/landing/CustomersSection";
import { PlatformSection } from "@/components/landing/PlatformSection";
import { PainSection } from "@/components/landing/PainSection";
import { KnowledgeComplianceSection } from "@/components/landing/KnowledgeComplianceSection";
import { IntegrationsCTASection } from "@/components/landing/IntegrationsCTASection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full bg-white overflow-hidden">
      <HeroSection />
      <CustomersSection />
      <PlatformSection />
      <PainSection />
      <KnowledgeComplianceSection />
      <IntegrationsCTASection />
      <PricingSection />
      <FAQSection />
      <FooterSection />
    </div>
  );
}
