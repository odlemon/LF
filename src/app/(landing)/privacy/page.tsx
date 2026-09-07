import type { Metadata } from "next";
import { HeroNavbar } from "@/components/landing/HeroNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { PrivacyPageContent } from "@/components/landing/company/PrivacyPageContent";

export const metadata: Metadata = {
  title: "Privacy Policy - Lysp",
  description:
    "Lysp Privacy Policy: how we collect, use, and protect personal information across our websites and platform.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col w-full bg-[#fefefc] overflow-hidden min-h-screen">
      <HeroNavbar />
      <main className="pt-14 sm:pt-16">
        <PrivacyPageContent />
      </main>
      <FooterSection />
    </div>
  );
}
