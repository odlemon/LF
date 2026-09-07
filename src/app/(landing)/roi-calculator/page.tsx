import type { Metadata } from "next";
import { HeroNavbar } from "@/components/landing/HeroNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { RoiCalculatorPage } from "@/components/landing/roi/RoiCalculatorPage";

export const metadata: Metadata = {
  title: "ROI Calculator | Lysp",
  description:
    "Estimate Lysp’s impact on firm pricing: leakage recovered, realization lift, faster quotes, and protected negotiation margin, net of usage cost.",
};

export default function RoiCalculatorRoute() {
  return (
    <div className="flex flex-col w-full bg-[#fefefc] overflow-hidden min-h-screen">
      <HeroNavbar variant="overMedia" />
      <main>
        <RoiCalculatorPage />
      </main>
      <FooterSection />
    </div>
  );
}
