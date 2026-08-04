import type { Metadata } from "next";
import { HeroNavbar } from "@/components/landing/HeroNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { SecurityPageContent } from "@/components/landing/security/SecurityPageContent";

export const metadata: Metadata = {
  title: "Security - Lysp",
  description:
    "How Lysp protects firm pricing data: SOC 2 Type II, ISO 27001 / 27701 / 42001, GDPR, CCPA, encryption, ethical walls, and no model training.",
};

export default function SecurityPage() {
  return (
    <div className="flex flex-col w-full bg-[#fefefc] overflow-hidden min-h-screen">
      <HeroNavbar />
      <main className="pt-14 sm:pt-16">
        <SecurityPageContent />
      </main>
      <FooterSection />
    </div>
  );
}
