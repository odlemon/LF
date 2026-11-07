import type { Metadata } from "next";
import { HeroNavbar } from "@/components/landing/HeroNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { CareersPageContent } from "@/components/landing/company/CareersPageContent";

export const metadata: Metadata = {
  title: "Careers | Lysp",
  description:
    "Explore careers at Lysp and help build a clearer commercial system for legal work.",
};

export default function CareersPage() {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-[#fefefc]">
      <HeroNavbar variant="overMedia" />
      <main>
        <CareersPageContent />
      </main>
      <FooterSection />
    </div>
  );
}
