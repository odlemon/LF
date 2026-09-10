"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { MARKETING_SHELL, PageHeroHeader, SectionHeader } from "@/components/landing/editorial";
import { useBookDemo } from "@/components/landing/BookDemoModal";

const BUILDING = [
  {
    step: "01",
    title: "Pricing",
    body: "An RFP becomes a scoped matter, a fee from firm history, and a branded proposal, without spreadsheet handoffs.",
  },
  {
    step: "02",
    title: "Negotiate with an audit trail",
    body: "Clients counter in a portal. Partners and finance approve against margin floors. Every round is attributable.",
  },
  {
    step: "03",
    title: "Volume that stays honest",
    body: "Tiers update as matters close. Clients see savings live. Relationship economics stop drifting from the books.",
  },
  {
    step: "04",
    title: "Firm-wide visibility",
    body: "Win rates, margins, realization, and anomalies across practices - leakage seen before it compounds.",
  },
] as const;

const PRINCIPLES = [
  {
    num: "I",
    title: "Built for the desks that own pricing",
    body: "Partners, pricing, finance, and practice leaders - not a consumer chat wrap wearing a legal costume.",
  },
  {
    num: "II",
    title: "Usage, not seats",
    body: "Commercial intensity should drive cost. Unlimited users. Credits you can model before you buy.",
  },
  {
    num: "III",
    title: "Security as a product requirement",
    body: "Encryption, walls, residency, audits, and a contractual ban on training shared models on your corpus.",
  },
] as const;

export function AboutPageContent() {
  const { openBookDemo } = useBookDemo();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const line = reduceMotion ? "" : "animate-hairline-grow origin-left";

  return (
    <div className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      {/* Full-bleed atmospheric hero */}
      <section className="relative min-h-[min(92vh,860px)] flex flex-col justify-end overflow-hidden bg-[#0a0f0d] text-[#fefefc]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/practices/ma-glass.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-[0.38]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/75 to-[#0a0f0d]/35"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className={`relative ${MARKETING_SHELL} pb-16 sm:pb-20 pt-32 sm:pt-40`}>
          <PageHeroHeader
            tone="dark"
            eyebrow="About"
            title="Pricing intelligence for elite law firms."
            description="We are building the commercial system firms deserve: from RFP to accepted fee."
          >
            <div className="mt-10 flex flex-wrap gap-3">
              <button
              type="button"
              onClick={() => openBookDemo("about")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fefefc] px-7 py-3.5 text-[14px] font-semibold text-[#0a0a0a] hover:bg-white transition-colors"
            >
                Book a demo
                <HiArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/product"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 text-[14px] font-semibold text-white/85 hover:text-white hover:border-white/40 transition-colors"
              >
                Explore product
              </Link>
            </div>
          </PageHeroHeader>
        </div>
      </section>

      {/* Mission - editorial statement */}
      <section className="relative">
        <div className={`${MARKETING_SHELL} py-20 sm:py-28`}>
          <SectionHeader
            eyebrow="Mission"
            title="Make firm pricing as rigorous as the work it prices."
            description="Elite firms win on judgment, relationships, and execution. Pricing should reflect that same discipline - grounded in matter history, constrained by OCGs and rate cards, and visible to the people accountable for margin. Lysp exists so commercial decisions stop living in inboxes and start living in a system firms can trust."
            className="max-w-3xl"
          />
        </div>
      </section>

      {/* Visual break - architecture photo band */}
      <section className="relative h-[42vh] min-h-[280px] max-h-[480px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/practices/litigation-glass.jpg"
          alt="Glass towers reflecting sky"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[#0a0f0d]/55 via-transparent to-[#0a0f0d]/40"
        />
        <div className="absolute inset-0 flex items-end">
          <p className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10 pb-8 sm:pb-10 text-[13px] sm:text-[14px] font-medium tracking-wide text-white/80">
            Built for privileged commercial data - rates, OCGs, realization, negotiation.
          </p>
        </div>
      </section>

      {/* What we build - numbered manifesto rows */}
      <section className="relative bg-[#0a0a0a] text-[#fefefc]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(254,254,252,0.05),transparent_50%)]"
        />
        <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className={`block h-px w-12 bg-white/25 mb-5 ${line}`} />
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-white/45">
              What we are building
            </p>
            <h2 className="mt-4 text-2xl sm:text-4xl font-semibold tracking-tight text-balance leading-[1.1]">
              One commercial system.
              <span className="block text-white/45 mt-2">The full pricing lifecycle.</span>
            </h2>
          </div>

          <ol className="mt-14 sm:mt-16 divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {BUILDING.map((item) => (
              <li
                key={item.step}
                className="group grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-8 py-8 sm:py-10"
              >
                <p className="sm:col-span-2 text-[13px] font-semibold tabular-nums tracking-[0.2em] text-white/45 group-hover:text-white/55 transition-colors">
                  {item.step}
                </p>
                <h3 className="sm:col-span-4 text-[18px] sm:text-[20px] font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="sm:col-span-6 text-[15px] text-white/45 leading-relaxed">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Principles - roman numerals, sparse */}
      <section className="relative">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 py-20 sm:py-28">
          <div className="max-w-xl mb-14 sm:mb-16">
            <span className={`block h-px w-12 bg-[#0a0a0a]/30 mb-5 ${line}`} />
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#0a0a0a]/60">
              Principles
            </p>
            <h2 className="mt-4 text-2xl sm:text-4xl font-semibold tracking-tight text-balance leading-[1.1]">
              How we decide what ships.
            </h2>
          </div>

          <div className="space-y-0 border-t border-black/[0.08]">
            {PRINCIPLES.map((item) => (
              <div
                key={item.num}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-10 sm:py-12 border-b border-black/[0.08]"
              >
                <p className="md:col-span-2 text-[28px] sm:text-[32px] font-semibold tracking-tight text-[#0a0a0a]/60 leading-none">
                  {item.num}
                </p>
                <div className="md:col-span-10 max-w-2xl">
                  <h3 className="text-[1.35rem] sm:text-[1.6rem] font-semibold tracking-tight leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[15px] sm:text-base text-[#0a0a0a]/60 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Close */}
      <section className="relative overflow-hidden bg-[#0a0f0d] text-[#fefefc]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/practices/banking-glass.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div aria-hidden className="absolute inset-0 bg-[#0a0f0d]/70" />
        <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 py-24 sm:py-32">
          <p className="text-[13px] font-semibold tracking-[0.08em] text-white/70">Lysp</p>
          <h2 className="mt-5 max-w-2xl text-3xl sm:text-5xl font-semibold tracking-tight text-balance leading-[1.05]">
            See it on your matters and rate cards.
          </h2>
          <p className="mt-5 max-w-md text-[15px] text-white/50 leading-relaxed">
            A conversation about your pricing workflow - not a generic demo script.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#fefefc] px-7 py-3.5 text-[14px] font-semibold text-[#0a0a0a] hover:bg-white transition-colors"
            >
              Contact us
              <HiArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/security"
              className="inline-flex items-center rounded-full border border-white/20 px-7 py-3.5 text-[14px] font-semibold text-white/80 hover:text-white hover:border-white/40 transition-colors"
            >
              Security
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
