import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HeroNavbar } from "@/components/landing/HeroNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { CareerRoleDetail } from "@/components/landing/company/CareerRoleDetail";
import { CAREER_ROLES, getCareerRole, type CareerRole } from "@/components/landing/company/careerRoles";

type PageProps = { params: Promise<{ slug: string }> };
const SITE_URL = (process.env.NEXT_PUBLIC_LANDING_URL ?? "https://lysp.ai").replace(/\/$/, "");

function getRoleShareDescription(role: CareerRole) {
  const salary = role.facts?.find((fact) => fact.label === "Salary")?.value;
  const baseSalary = role.facts?.find((fact) => fact.label === "Base salary")?.value;
  const onTargetEarnings = role.facts?.find((fact) => fact.label === "On target earnings")?.value;
  const equity = role.facts?.find((fact) => fact.label === "Equity")?.value;
  const location = role.facts?.find((fact) => fact.label === "Location")?.value;
  const inPerson = role.facts?.find((fact) => fact.label === "In person")?.value;
  const workArrangement = role.facts?.find((fact) => fact.label === "Work arrangement")?.value;
  const cleanCompensation = (value: string) =>
    value.replace(/ per year/g, "").replace(", including base and commission", "");
  const compensation = [
    baseSalary ? `${cleanCompensation(baseSalary)} base` : null,
    onTargetEarnings ? `${cleanCompensation(onTargetEarnings)} OTE` : null,
    salary ? `${cleanCompensation(salary)} salary` : null,
    equity ? `${equity} equity` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return [
    compensation ? `${compensation}.` : role.summary,
    workArrangement ? `${workArrangement}.` : null,
    location ? `${location}.` : null,
    inPerson ? `${inPerson}.` : null,
    "View the role and apply.",
  ]
    .filter(Boolean)
    .join(" ");
}

export function generateStaticParams() {
  return CAREER_ROLES.map((role) => ({ slug: role.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const role = getCareerRole(slug);
  if (!role) return { title: { absolute: "Role not found | Lysp" } };

  const shareTitle = `${role.title} at Lysp`;
  const shareDescription = getRoleShareDescription(role);
  const roleUrl = `${SITE_URL}/careers/${role.slug}`;
  const shareImage = `${SITE_URL}/opengraph-image.png`;

  return {
    title: { absolute: shareTitle },
    description: shareDescription,
    alternates: { canonical: roleUrl },
    openGraph: {
      type: "website",
      siteName: "Lysp",
      title: shareTitle,
      description: shareDescription,
      url: roleUrl,
      images: [{ url: shareImage, width: 1200, height: 630, alt: `${role.title} at Lysp` }],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: shareDescription,
      images: [shareImage],
    },
  };
}

export default async function CareerRolePage({ params }: PageProps) {
  const { slug } = await params;
  const role = getCareerRole(slug);
  if (!role) notFound();

  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-[#fefefc]">
      <HeroNavbar />
      <main>
        <CareerRoleDetail role={role} />
      </main>
      <FooterSection />
    </div>
  );
}
