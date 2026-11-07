import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeroNavbar } from "@/components/landing/HeroNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { CareerApplicationForm } from "@/components/landing/company/CareerApplicationForm";
import { getCareerRole } from "@/components/landing/company/careerRoles";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const role = getCareerRole(slug);
  return { title: role ? `Apply: ${role.title} | Lysp` : "Application | Lysp" };
}

export default async function CareerApplicationPage({ params }: PageProps) {
  const { slug } = await params;
  const role = getCareerRole(slug);
  if (!role) notFound();

  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-[#fefefc]">
      <HeroNavbar variant="overMedia" />
      <main>
        <CareerApplicationForm role={role} />
      </main>
      <FooterSection />
    </div>
  );
}
