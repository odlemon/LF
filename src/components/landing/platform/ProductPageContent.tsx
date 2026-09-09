"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { FeaturePreview } from "./FeaturePreview";
import { PRODUCT_ROLES, USE_CASES, type UseCase } from "./useCases";
import {
  MARKETING_SHELL,
  PageHeroHeader,
  SectionHeader,
} from "@/components/landing/editorial";
import { useBookDemo } from "@/components/landing/BookDemoModal";

function CapabilitySection({
  uc,
  index,
  tone,
}: {
  uc: UseCase;
  index: number;
  tone: "light" | "dark";
}) {
  const isDark = tone === "dark";

  return (
    <section
      id={uc.anchor}
      className={`relative scroll-mt-20 ${
        isDark
          ? "bg-[#0a0f0d] text-[#fefefc]"
          : "bg-[#fefefc] text-[#0a0a0a] border-t border-black/[0.06]"
      }`}
    >
      {uc.id === "flow" ? <span id="pricing-flow" className="sr-only" /> : null}

      <div className={`${MARKETING_SHELL} py-16 sm:py-24 lg:py-28`}>
        <SectionHeader
          tone={tone}
          eyebrow={`${String(index + 1).padStart(2, "0")} · ${uc.label}`}
          title={uc.title}
          description={uc.description}
          className="max-w-2xl"
        />

        {/* Outcome narrative, not feature checklist */}
        <div className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {uc.outcomes.map((beat) => (
            <div key={beat.n}>
              <p
                className={`text-[11px] font-semibold tabular-nums tracking-[0.18em] ${
                  isDark ? "text-white/30" : "text-[#0a0a0a]/25"
                }`}
              >
                {beat.n}
              </p>
              <h3
                className={`mt-3 text-[15px] sm:text-[16px] font-semibold tracking-tight text-balance leading-snug ${
                  isDark ? "text-white" : "text-[#0a0a0a]"
                }`}
              >
                {beat.title}
              </h3>
              <p
                className={`mt-2 text-[13px] leading-relaxed ${
                  isDark ? "text-white/45" : "text-[#0a0a0a]/50"
                }`}
              >
                {beat.body}
              </p>
            </div>
          ))}
        </div>

        {uc.foundation ? (
          <p
            className={`mt-8 text-[13px] leading-relaxed max-w-2xl ${
              isDark ? "text-white/35" : "text-[#0a0a0a]/40"
            }`}
          >
            {uc.foundation}{" "}
            <Link
              href="/security"
              className={`font-semibold underline-offset-2 hover:underline ${
                isDark ? "text-white/65" : "text-[#0a0a0a]"
              }`}
            >
              How we protect it
            </Link>
          </p>
        ) : null}

        {/* Large stage */}
        <div className="mt-12 sm:mt-14 h-[min(720px,82vh)] min-h-[520px] sm:min-h-[600px]">
          <FeaturePreview id={uc.id} />
        </div>
      </div>
    </section>
  );
}

export function ProductPageContent() {
  const { openBookDemo } = useBookDemo();
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      <section className="relative border-b border-black/[0.06]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(10,10,10,0.035),transparent_42%),radial-gradient(ellipse_at_100%_20%,rgba(10,10,10,0.02),transparent_40%)]"
        />
        <div className={`relative ${MARKETING_SHELL} pt-16 sm:pt-24 pb-14 sm:pb-20`}>
          <PageHeroHeader
            eyebrow="Product"
            title={
              <>
                Pricing intelligence
                <span className="text-[#0a0a0a]/38"> for the desks that own the fee.</span>
              </>
            }
            description="When elite firms price well, they win better work and keep more of it. Lysp is the commercial system behind that: pricing, negotiation, volume, and visibility in one place."
            className="max-w-3xl"
          >
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
              type="button"
              onClick={() => openBookDemo("product")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-3 text-[14px] font-semibold text-[#fefefc] hover:bg-black transition-colors"
            >
                Book a demo
                <HiArrowRight className="h-4 w-4" />
              </button>
            </div>
          </PageHeroHeader>
        </div>
      </section>

      {USE_CASES.map((uc, i) => (
        <CapabilitySection
          key={uc.id}
          uc={uc}
          index={i}
          tone={i % 2 === 1 ? "dark" : "light"}
        />
      ))}

      <section className="relative border-t border-black/[0.06] bg-[#fefefc]">
        <div className={`${MARKETING_SHELL} py-14 sm:py-16`}>
          <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#0a0a0a]/35">
            Built for the desk
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
            {PRODUCT_ROLES.map((item) => (
              <div key={item.role}>
                <h3 className="text-[14px] font-semibold tracking-tight text-[#0a0a0a]">
                  {item.role}
                </h3>
                <p className="mt-2 text-[13px] text-[#0a0a0a]/50 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
