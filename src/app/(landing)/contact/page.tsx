import type { Metadata } from "next";
import { HeroNavbar } from "@/components/landing/HeroNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { ContactPageContent } from "@/components/landing/company/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact - Lysp",
  description:
    "Contact Lysp sales, customer support, or send a general inquiry about pricing intelligence for your firm.",
};

export default function ContactPage() {
  return (
    <div className="flex flex-col w-full bg-[#fefefc] overflow-hidden min-h-screen">
      <HeroNavbar variant="overMedia" />
      <main>
        <ContactPageContent />
      </main>
      <FooterSection />
    </div>
  );
}
