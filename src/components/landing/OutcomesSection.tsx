"use client";

import React from "react";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { MARKETING_SHELL, SectionHeader } from "@/components/landing/editorial";
import { useBookDemo } from "@/components/landing/BookDemoModal";

/**
 * Single generalized large-matter scenario for elite commercial firms.
 * Anchored in public industry patterns (Am Law realization ~78%, rising write-offs,
 * multi-day manual quote cycles) without interactive scenario pickers.
 */
const SCENARIO = {
  matterFee: "$2.4M",
  matterLabel: "Typical large commercial matter",
  leakPerMatter: "$168k",
  leakRate: "7%",
  firmMatters: 40,
  firmAnnual: "$6.7M",
  quoteWithout: "3 to 5 days",
  quoteWith: "same day",
  realizationLift: "+6 to 8 pts",
};

export function OutcomesSection() {
  const { openBookDemo } = useBookDemo();
  return (
    <section id="outcomes" className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(10,10,10,0.03),transparent_40%),radial-gradient(ellipse_at_100%_100%,rgba(10,10,10,0.025),transparent_45%)]"
      />

      <div className={`${MARKETING_SHELL} pt-20 sm:pt-28 pb-20 sm:pb-28`}>
        <SectionHeader
          eyebrow="Firm outcomes"
          title={
            <>
              On a large matter, a few points of leakage
              <span className="text-[#0a0a0a]/60"> is a seven-figure story.</span>
            </>
          }
          description="Am Law 100 overall realization sits near 78%, and most firms still expect write-offs to climb. Here is what that looks like on one common large matter - then across a year of them."
        />

        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-5">
          {/* One matter */}
          <div className="lg:col-span-5 rounded-[1.5rem] border border-black/[0.08] bg-white p-6 sm:p-8 flex flex-col">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/60">
              One large matter
            </p>
            <p className="mt-4 text-4xl sm:text-5xl font-semibold tracking-tight tabular-nums">
              {SCENARIO.matterFee}
            </p>
            <p className="mt-2 text-[14px] text-[#0a0a0a]/60">{SCENARIO.matterLabel}</p>

            <div className="mt-8 space-y-5 flex-1">
              <div className="flex items-end justify-between gap-4 border-b border-black/[0.06] pb-4">
                <div>
                  <p className="text-[12px] text-[#0a0a0a]/60">Leakage without pricing discipline</p>
                  <p className="mt-1 text-[13px] text-[#0a0a0a]/60">
                    ~{SCENARIO.leakRate} underprice / write-down pressure
                  </p>
                </div>
                <p className="text-2xl sm:text-3xl font-semibold tabular-nums text-[#0a0a0a]/60 line-through decoration-[#0a0a0a]/20">
                  {SCENARIO.leakPerMatter}
                </p>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[12px] text-[#0a0a0a]/60">Held with Lysp</p>
                  <p className="mt-1 text-[13px] text-[#0a0a0a]/60">
                    Comps, confidence, and approvals before the fee ships
                  </p>
                </div>
                <p className="text-2xl sm:text-3xl font-semibold tabular-nums">
                  {SCENARIO.leakPerMatter}
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 pt-5 border-t border-black/[0.06]">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#0a0a0a]/60">
                  Quote cycle
                </p>
                <p className="mt-1.5 text-[15px] font-semibold">
                  <span className="text-[#0a0a0a]/60 line-through mr-2">
                    {SCENARIO.quoteWithout}
                  </span>
                  {SCENARIO.quoteWith}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#0a0a0a]/60">
                  Realization
                </p>
                <p className="mt-1.5 text-[15px] font-semibold tabular-nums">
                  {SCENARIO.realizationLift}
                </p>
              </div>
            </div>
          </div>

          {/* Firm year */}
          <div className="lg:col-span-7 relative overflow-hidden rounded-[1.5rem] bg-[#0a0a0a] text-[#fefefc] p-6 sm:p-8 lg:p-10 flex flex-col">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/[0.04]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-white/[0.03]"
            />

            <p className="relative text-[11px] font-semibold tracking-[0.22em] uppercase text-white/45">
              Across the firm year
            </p>
            <p className="relative mt-3 max-w-md text-[15px] text-white/55 leading-relaxed">
              {SCENARIO.firmMatters} matters at this scale - a normal large-matter book for an elite
              commercial practice.
            </p>

            <p className="relative mt-8 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight tabular-nums leading-none">
              {SCENARIO.firmAnnual}
            </p>
            <p className="relative mt-3 text-[14px] text-white/45">
              Annualized fee integrity on the large-matter book - not chatbot minutes.
            </p>

            <div className="relative mt-10 flex flex-wrap gap-1.5">
              {Array.from({ length: SCENARIO.firmMatters }).map((_, i) => (
                <span
                  key={i}
                  className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-[2px] bg-white/25"
                  style={{ opacity: 0.28 + (i / SCENARIO.firmMatters) * 0.72 }}
                />
              ))}
            </div>
            <p className="relative mt-4 text-[12px] text-white/45">
              Each mark = one large matter in the annual portfolio
            </p>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-black/[0.08] pt-10">
          <div>
            <p className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums">78%</p>
            <p className="mt-2 text-[13px] text-[#0a0a0a]/60 leading-relaxed">
              Am Law 100 overall realization - flat even as rates climb.{" "}
              <span className="text-[#0a0a0a]/60">Law.com FY2025</span>
            </p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums">75%</p>
            <p className="mt-2 text-[13px] text-[#0a0a0a]/60 leading-relaxed">
              Of firms expect write-offs to increase again.{" "}
              <span className="text-[#0a0a0a]/60">BigHand 2025</span>
            </p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums">Hours</p>
            <p className="mt-2 text-[13px] text-[#0a0a0a]/60 leading-relaxed">
              Not days - to a priced proposal, while the opportunity is still warm.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <p className="text-[12px] text-[#0a0a0a]/60 max-w-xl leading-relaxed">
            Illustrative for a typical elite large-matter book. In a demo we run the same math on
            your last twenty deals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 self-start sm:self-auto">
            <Link
              href="/roi-calculator"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3.5 text-[14px] font-semibold text-[#0a0a0a] hover:bg-black/[0.03] transition-colors cursor-pointer"
            >
              Model your firm’s impact
              <HiArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => openBookDemo("outcomes")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-3.5 text-[14px] font-semibold text-[#fefefc] hover:bg-black transition-colors cursor-pointer"
            >
              Book a demo
              <HiArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
