import type { Metadata } from "next";
import { HeroNavbar } from "@/components/landing/HeroNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { ProductPageContent } from "@/components/landing/platform/ProductPageContent";

export const metadata: Metadata = {
  title: "Product | Lysp",
  description:
    "Explore Lysp pricing intelligence: pricing requests, rate negotiation, volume discounts, and firm-wide analytics.",
};

export default function ProductPage() {
  return (
    <div className="flex flex-col w-full bg-[#fefefc] overflow-hidden min-h-screen">
      <HeroNavbar />
      <main className="pt-14 sm:pt-16">
        <ProductPageContent />
      </main>
      <FooterSection />
    </div>
  );
}
