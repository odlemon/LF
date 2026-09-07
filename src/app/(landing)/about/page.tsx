import type { Metadata } from "next";
import { HeroNavbar } from "@/components/landing/HeroNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { AboutPageContent } from "@/components/landing/company/AboutPageContent";

export const metadata: Metadata = {
  title: "About | Lysp",
  description:
    "Lysp builds pricing intelligence for elite law firms: scope, price, propose, negotiate, and measure realization on one platform.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full bg-[#fefefc] overflow-hidden min-h-screen">
      <HeroNavbar variant="overMedia" />
      <main>
        <AboutPageContent />
      </main>
      <FooterSection />
    </div>
  );
}
