"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { MARKETING_SHELL, SectionHeader } from "@/components/landing/editorial";

type PracticeId = "ma" | "banking" | "litigation" | "realestate" | "employment";

type Practice = {
  id: PracticeId;
  label: string;
  short: string;
  headline: string;
  line: string;
  image: string;
  imageAlt: string;
};

const PRACTICES: Practice[] = [
  {
    id: "ma",
    label: "Corporate M&A",
    short: "M&A",
    headline: "Fixed fees for diligence-to-close, grounded in your last deals.",
    line: "Scope the RFP, price from comparable acquisitions, send a branded proposal - then negotiate without the email chain.",
    image: "/images/practices/ma-glass.jpg",
    imageAlt: "Looking up at dark glass corporate towers",
  },
  {
    id: "banking",
    label: "Banking & Finance",
    short: "Banking",
    headline: "Panel rates and caps that still protect margin.",
    line: "Price facilities against your history, enforce panel terms, and track volume across bank relationships.",
    image: "/images/practices/banking-glass.jpg",
    imageAlt: "Blue glass skyscrapers against a clear sky",
  },
  {
    id: "litigation",
    label: "Litigation",
    short: "Litigation",
    headline: "Phased budgets clients can approve before discovery eats the estimate.",
    line: "Stage the matter, set confidence bands, and keep Finance and the client aligned as the case evolves.",
    image: "/images/practices/litigation-glass.jpg",
    imageAlt: "Reflective glass towers converging toward the sky",
  },
  {
    id: "realestate",
    label: "Real Estate",
    short: "Real Estate",
    headline: "Repeatable fee schedules across a portfolio of matters.",
    line: "Standard scopes for leases and developments, consistent pricing, volume ladders for institutional clients.",
    image: "/images/practices/realestate-glass.jpg",
    imageAlt: "Glassy city skyline of modern towers at dusk",
  },
  {
    id: "employment",
    label: "Employment",
    short: "Employment",
    headline: "Productized scopes your clients can buy without a custom quote every time.",
    line: "Package advice and investigations into clear fees - then track volume discounts as HR work scales.",
    image: "/images/practices/employment-glass.jpg",
    imageAlt: "Bright white and glass modern high-rise facade",
  },
];

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function PracticeAreasSection() {
  const [activeId, setActiveId] = useState<PracticeId>("ma");
  const [reduceMotion, setReduceMotion] = useState(false);

  const activeIndex = PRACTICES.findIndex((p) => p.id === activeId);
  const active = PRACTICES[activeIndex];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <section
      id="practices"
      className="relative w-full overflow-hidden bg-[#0a0c0b] text-[#fefefc]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(254,254,252,0.06),transparent_45%),radial-gradient(ellipse_at_90%_80%,rgba(254,254,252,0.03),transparent_40%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className={`${MARKETING_SHELL} pt-16 sm:pt-24 lg:pt-28 pb-14 sm:pb-20 lg:pb-24`}>
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 sm:gap-8 xl:gap-16">
          <SectionHeader
            tone="dark"
            eyebrow="Chambers of practice"
            title={
              <>
                Every practice prices differently.
                <span className="block text-white/45 mt-2 sm:mt-3">
                  Lysp meets each one where it wins.
                </span>
              </>
            }
            className="max-w-2xl"
          />

          <p className="max-w-sm xl:max-w-xs text-[13px] sm:text-[15px] leading-relaxed text-white/40 xl:pb-2 text-left">
            Open a chamber. The building holds the atmosphere - the pricing motion is yours.
          </p>
        </div>

        <div
          className="mt-10 sm:mt-14 lg:mt-16 hidden lg:flex gap-2 xl:gap-2.5 h-[min(68vh,600px)] xl:h-[min(72vh,640px)]"
          role="tablist"
          aria-label="Practice areas"
        >
          {PRACTICES.map((p, i) => {
            const isActive = p.id === activeId;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(p.id)}
                className="group relative min-w-0 basis-0 overflow-hidden rounded-[1.25rem] xl:rounded-[1.35rem] text-left outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0c0b]"
                style={{
                  flexGrow: isActive ? 5.4 : 1,
                  transition: reduceMotion ? undefined : `flex-grow 900ms ${EASE}`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.imageAlt}
                  className={`absolute inset-0 h-full w-full object-cover will-change-transform ${
                    isActive ? "scale-100" : "scale-[1.08]"
                  }`}
                  style={{
                    transition: reduceMotion ? undefined : `transform 1.6s ${EASE}`,
                  }}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "auto"}
                />

                <div
                  className={`absolute inset-0 ${
                    isActive
                      ? "bg-gradient-to-t from-black/75 via-black/25 to-black/5"
                      : "bg-black/45 group-hover:bg-black/30"
                  }`}
                  style={{
                    transition: reduceMotion ? undefined : `background-color 700ms ${EASE}`,
                  }}
                />

                <div
                  aria-hidden
                  className={`pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ${
                    isActive ? "ring-white/25" : "ring-white/10"
                  }`}
                />

                <div
                  className={`absolute inset-0 flex items-end justify-center pb-7 xl:pb-9 ${
                    isActive ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                  style={{
                    transition: reduceMotion ? undefined : `opacity 500ms ${EASE}`,
                  }}
                >
                  <div className="flex flex-col items-center gap-5 xl:gap-6">
                    <span className="text-[12px] xl:text-[13px] font-semibold tracking-[0.3em] text-white/45 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="text-[1.05rem] xl:text-[1.25rem] font-semibold tracking-[0.18em] uppercase text-white"
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    >
                      {p.short}
                    </span>
                  </div>
                </div>

                <div
                  className={`absolute inset-x-0 bottom-0 p-6 xl:p-9 ${
                    isActive
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6 pointer-events-none"
                  }`}
                  style={{
                    transition: reduceMotion
                      ? undefined
                      : `opacity 700ms ${EASE}, transform 700ms ${EASE}`,
                  }}
                >
                  <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 xl:gap-8">
                    <div className="min-w-0 max-w-2xl">
                      <div className="flex items-center gap-3 mb-3 xl:mb-4">
                        <span className="text-[12px] font-semibold tracking-[0.28em] uppercase text-white/45 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="h-px w-10 bg-white/25" />
                      </div>
                      <h3 className="text-[2rem] xl:text-[2.75rem] 2xl:text-[3.1rem] font-semibold tracking-tight leading-[1.05] text-white drop-shadow-sm">
                        {p.label}
                      </h3>
                      <p className="mt-3 xl:mt-4 text-[15px] xl:text-base font-medium leading-snug text-white text-balance max-w-xl">
                        {p.headline}
                      </p>
                      <p className="mt-2 xl:mt-3 text-[13px] xl:text-[14px] leading-relaxed text-white/80 max-w-md">
                        {p.line}
                      </p>
                    </div>

                    <Link
                      href="/product"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 inline-flex items-center justify-center gap-2 self-start xl:self-auto rounded-full bg-[#fefefc] px-5 xl:px-6 py-3 text-[13px] font-semibold text-[#0a0a0a] hover:bg-white transition-colors cursor-pointer"
                    >
                      Explore Product
                      <HiArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {isActive ? (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-5 right-5 xl:top-6 xl:right-6 text-[4.5rem] xl:text-[7rem] font-semibold leading-none tracking-tighter text-white/[0.07] select-none"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-10 lg:hidden space-y-2.5 sm:space-y-3">
          {PRACTICES.map((p, i) => {
            const isActive = p.id === activeId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveId(p.id)}
                aria-expanded={isActive}
                className="relative w-full overflow-hidden rounded-2xl text-left cursor-pointer"
                style={{
                  height: isActive ? "min(78vw, 440px)" : "4.75rem",
                  transition: reduceMotion ? undefined : `height 700ms ${EASE}`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "auto"}
                />
                <div
                  className={`absolute inset-0 transition-colors duration-500 ${
                    isActive
                      ? "bg-gradient-to-t from-black/80 via-black/35 to-black/10"
                      : "bg-black/50"
                  }`}
                />

                {!isActive ? (
                  <div className="absolute inset-0 flex items-center justify-between gap-3 px-4 sm:px-5">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <span className="text-[12px] font-semibold tracking-[0.24em] text-white/70 tabular-nums shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[1.15rem] sm:text-[1.35rem] md:text-[1.5rem] font-semibold text-white truncate drop-shadow-sm">
                        {p.label}
                      </span>
                    </div>
                    <span className="text-white/60 text-xl leading-none shrink-0">+</span>
                  </div>
                ) : (
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                    <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/70">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 text-[1.75rem] sm:text-[2.15rem] font-semibold tracking-tight text-white leading-[1.05] drop-shadow-sm">
                      {p.label}
                    </h3>
                    <p className="mt-2.5 text-[14px] sm:text-[15px] font-medium text-white leading-snug text-balance">
                      {p.headline}
                    </p>
                    <p className="mt-2 text-[13px] text-white/80 leading-relaxed max-w-lg">
                      {p.line}
                    </p>
                    <Link
                      href="/product"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#fefefc] px-5 py-2.5 text-[13px] font-semibold text-[#0a0a0a] cursor-pointer"
                    >
                      Explore Product
                      <HiArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 sm:mt-10 lg:mt-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-t border-white/10 pt-5 sm:pt-6">
          <p className="text-[11px] sm:text-[12px] tracking-[0.18em] uppercase text-white/35">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(PRACTICES.length).padStart(2, "0")}
            <span className="mx-2 sm:mx-3 text-white/20">·</span>
            <span className="tracking-normal normal-case text-[13px] sm:text-[14px] font-semibold text-white/70">
              {active.label}
            </span>
          </p>
          <div className="flex items-center -mx-1.5">
            {PRACTICES.map((p) => (
              <button
                key={`dot-${p.id}`}
                type="button"
                aria-label={p.label}
                onClick={() => setActiveId(p.id)}
                className="flex h-6 min-w-6 cursor-pointer items-center justify-center px-1.5"
              >
                <span
                  className="h-1.5 rounded-full"
                  style={{
                    width: p.id === activeId ? "2rem" : "0.375rem",
                    backgroundColor:
                      p.id === activeId ? "#fefefc" : "rgba(255,255,255,0.25)",
                    transition: reduceMotion
                      ? undefined
                      : `width 500ms ${EASE}, background-color 500ms ${EASE}`,
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
