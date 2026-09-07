import type { Metadata } from "next";
import { HeroNavbar } from "@/components/landing/HeroNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { BlogPageContent } from "@/components/landing/company/BlogPageContent";

export const metadata: Metadata = {
  title: "Blog | Lysp",
  description:
    "Notes on pricing intelligence for elite law firms: fee setting, negotiation, volume economics, and security.",
};

export default function BlogPage() {
  return (
    <div className="flex flex-col w-full bg-[#fefefc] overflow-hidden min-h-screen">
      <HeroNavbar variant="overMedia" />
      <main>
        <BlogPageContent />
      </main>
      <FooterSection />
    </div>
  );
}
