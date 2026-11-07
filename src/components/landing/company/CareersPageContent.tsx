import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import {
  MARKETING_SHELL,
  PageHeroHeader,
  SectionHeader,
} from "@/components/landing/editorial";
import { CAREER_ROLES } from "@/components/landing/company/careerRoles";

const WORK_AREAS = [
  {
    number: "01",
    title: "Understand the matter",
    body: "Turn an incoming request into a clear, reviewable scope of work.",
  },
  {
    number: "02",
    title: "Make the commercial call",
    body: "Give pricing, partners, and finance the context to shape and approve a fee.",
  },
  {
    number: "03",
    title: "Stay connected to the client",
    body: "Keep proposals, negotiation, and agreed terms in one traceable workflow.",
  },
] as const;

const PRINCIPLES = [
  {
    number: "01",
    title: "Start with the real work",
    body: "Build around the decisions legal teams make every day, with the people who make them.",
  },
  {
    number: "02",
    title: "Earn trust in the details",
    body: "Commercial information is sensitive. Good product judgment includes how it is handled, shared, and protected.",
  },
  {
    number: "03",
    title: "Make complexity clearer",
    body: "Turn scattered context into a useful view, without taking judgment away from the people responsible for it.",
  },
] as const;

export function CareersPageContent() {
  return (
    <div className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      <section className="relative flex min-h-[min(78vh,720px)] flex-col justify-end overflow-hidden bg-[#0a0f0d] text-[#fefefc]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/practices/employment-glass.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-[0.34]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/75 to-[#0a0f0d]/35"
        />
        <div className={`relative ${MARKETING_SHELL} pb-16 pt-32 sm:pb-20 sm:pt-36`}>
          <PageHeroHeader
            tone="dark"
            eyebrow="Careers at Lysp"
            title="Build a more considered way to price legal work."
            description="Lysp brings matter scope, pricing decisions, approvals, and client negotiation into one clearer commercial workflow for law firms."
          >
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="#opportunities"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fefefc] px-6 py-3.5 text-[14px] font-semibold text-[#0a0a0a] transition-colors hover:bg-white"
              >
                See opportunities
                <HiArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-[14px] font-semibold text-white/85 transition-colors hover:border-white/40 hover:text-white"
              >
                Get to know Lysp
              </Link>
            </div>
          </PageHeroHeader>
        </div>
      </section>

      <section id="how-we-work" className="scroll-mt-24 border-b border-black/[0.06]">
        <div className={`${MARKETING_SHELL} grid grid-cols-1 gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-16`}>
          <div className="lg:col-span-5">
            <SectionHeader
              eyebrow="The work"
              title="A better system for the decisions behind legal fees."
              description="Legal work is complex. The commercial process around it should make the important context easier to see and act on."
            />
          </div>
          <ol className="divide-y divide-black/[0.08] border-y border-black/[0.08] lg:col-span-7">
            {WORK_AREAS.map((area) => (
              <li
                key={area.number}
                className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-2 py-6 sm:grid-cols-[3rem_1fr] sm:gap-x-6 sm:py-7"
              >
                <span className="row-span-2 pt-1 text-[12px] font-semibold tabular-nums tracking-[0.18em] text-[#0a0a0a]/45">
                  {area.number}
                </span>
                <h3 className="text-[18px] font-semibold tracking-tight sm:text-[20px]">
                  {area.title}
                </h3>
                <p className="text-[14px] leading-relaxed text-[#0a0a0a]/60 sm:text-[15px]">
                  {area.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative bg-[#0a0a0a] text-[#fefefc]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(254,254,252,0.06),transparent_48%)]"
        />
        <div className="relative mx-auto max-w-[1200px] px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
          <SectionHeader
            tone="dark"
            eyebrow="How we work"
            title="Thoughtful work. Clear ownership."
            description="The product only works when it respects the judgment, relationships, and responsibilities already inside a firm."
            className="max-w-2xl"
          />
          <div className="mt-12 grid grid-cols-1 gap-0 border-t border-white/[0.12] sm:grid-cols-3 sm:divide-x sm:divide-white/[0.12]">
            {PRINCIPLES.map((principle) => (
              <article
                key={principle.number}
                className="border-b border-white/[0.12] py-7 sm:border-b-0 sm:px-6 sm:py-8 first:sm:pl-0 last:sm:pr-0"
              >
                <p className="text-[11px] font-semibold tracking-[0.2em] text-white/45">
                  {principle.number}
                </p>
                <h3 className="mt-4 text-[18px] font-semibold tracking-tight">
                  {principle.title}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-white/55">
                  {principle.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="opportunities" className="scroll-mt-24">
        <div className={`${MARKETING_SHELL} py-20 sm:py-24`}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
            <div className="lg:col-span-7">
            <SectionHeader
              eyebrow="Opportunities"
                title="Find your place in the work."
                description="Join the team building a clearer way for law firms to make commercial decisions."
            />
            </div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/45 lg:col-span-5 lg:justify-self-end lg:pb-2">
              2 roles open
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {CAREER_ROLES.map((role, index) => (
              <Link
                key={role.slug}
                href={`/careers/${role.slug}`}
                className="group rounded-2xl border border-black/[0.08] bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-black/[0.16] hover:shadow-[0_18px_45px_-32px_rgba(0,0,0,0.35)] sm:p-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] font-semibold tabular-nums tracking-[0.2em] text-[#0a0a0a]/45">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-7 text-[1.45rem] font-semibold tracking-tight sm:text-2xl">
                  {role.title}
                </h3>
                <p className="mt-2 text-[12px] font-medium text-[#0a0a0a]/50">
                  {role.team} <span aria-hidden>·</span> {role.employmentType}
                </p>
                <p className="mt-5 text-[14px] leading-relaxed text-[#0a0a0a]/60 sm:text-[15px]">
                  {role.summary}
                </p>
                <span className="mt-7 inline-flex items-center gap-2 text-[14px] font-semibold text-[#0a0a0a] transition-all group-hover:gap-3">
                  View role details
                  <HiArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
