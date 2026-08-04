"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HiArrowRight, HiCheck } from "react-icons/hi";
import { FeaturePreview } from "./FeaturePreview";
import {
  PRODUCT_FOUNDATIONS,
  PRODUCT_ROLES,
  USE_CASES,
  type UseCaseId,
} from "./useCases";

const HERO_STATS = [
  { label: "Continuous flow", value: "RFP → fee" },
  { label: "Negotiation", value: "Every round logged" },
  { label: "Discounts", value: "Tiers that update" },
  { label: "Analytics", value: "Firm-wide view" },
] as const;

export function ProductPageContent() {
  const [active, setActive] = useState<UseCaseId>("flow");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "") as UseCaseId;
      if (USE_CASES.some((u) => u.id === hash)) {
        setActive(hash);
        setFadeKey((k) => k + 1);
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const current = USE_CASES.find((u) => u.id === active)!;

  const select = (id: UseCaseId) => {
    if (id === active) return;
    setActive(id);
    setFadeKey((k) => k + 1);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(10,10,10,0.035),transparent_42%),radial-gradient(ellipse_at_100%_20%,rgba(10,10,10,0.02),transparent_40%)]"
      />

      {/* Hero */}
      <section className="relative border-b border-black/[0.06]">
        <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 pt-16 sm:pt-24 pb-12 sm:pb-16">
          <p className="text-[12px] font-medium tracking-[0.22em] uppercase text-[#0a0a0a]/40">
            Product
          </p>
          <h1 className="mt-5 max-w-4xl text-balance text-[2.25rem] sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.08] tracking-tight">
            Everything your team needs to scope, price and win work
            <span className="text-[#0a0a0a]/38"> - powered by your own data.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base sm:text-lg text-[#0a0a0a]/55 leading-relaxed font-medium">
            Built for enterprise law firms. One system from RFP to accepted proposal - with
            negotiation, volume economics, and firm-wide pricing intelligence in the same place.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-3 text-[14px] font-semibold text-[#fefefc] hover:bg-black transition-colors"
            >
              Book a demo
              <HiArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/#platform"
              className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-6 py-3 text-[14px] font-semibold text-[#0a0a0a] hover:bg-black/[0.03] transition-colors"
            >
              Back to overview
            </Link>
          </div>

          <div className="mt-12 sm:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-black/[0.07] bg-white/80 px-4 py-4 sm:px-5 sm:py-5"
              >
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/35">
                  {stat.label}
                </p>
                <p className="mt-2 text-[15px] sm:text-[17px] font-semibold tracking-tight">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capability explorer */}
      <section id="product-detail" className="relative">
        <div className="border-b border-black/[0.06] bg-[#fefefc]/90 backdrop-blur-sm sticky top-14 sm:top-16 z-20">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
            <div
              className="flex gap-1 sm:gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mb-px"
              role="tablist"
              aria-label="Product capabilities"
            >
              {USE_CASES.map((uc) => {
                const isActive = active === uc.id;
                return (
                  <button
                    key={uc.id}
                    type="button"
                    id={uc.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => select(uc.id)}
                    className={`relative shrink-0 px-3 sm:px-4 py-4 sm:py-5 text-[13px] sm:text-sm font-semibold transition-colors scroll-mt-28 ${
                      isActive ? "text-[#0a0a0a]" : "text-[#0a0a0a]/40 hover:text-[#0a0a0a]/70"
                    }`}
                  >
                    {uc.label}
                    <span
                      className={`absolute inset-x-3 sm:inset-x-4 bottom-0 h-[2px] transition-opacity ${
                        isActive ? "bg-[#0a0a0a] opacity-100" : "opacity-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 pt-10 sm:pt-12 pb-10 sm:pb-14">
          <div
            key={`copy-${fadeKey}`}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 ${
              reduceMotion ? "" : "animate-fade-in"
            }`}
          >
            <div className="lg:col-span-5">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/35">
                Capability
              </p>
              <h2 className="mt-3 text-xl sm:text-2xl lg:text-[1.85rem] font-semibold tracking-tight text-balance leading-snug">
                {current.title}
              </h2>
              <p className="mt-4 text-[15px] sm:text-base text-[#0a0a0a]/55 leading-relaxed">
                {current.description}
              </p>
              <p className="mt-4 text-[14px] font-semibold text-[#0a0a0a]/70">{current.outcome}</p>
            </div>

            <div className="lg:col-span-7">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/35 mb-4">
                What you get
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {current.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 items-start">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-[#fefefc]">
                      <HiCheck className="h-3 w-3" />
                    </span>
                    <span className="text-[14px] text-[#0a0a0a]/70 leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-[#0a0f0d] pt-8 sm:pt-12 pb-14 sm:pb-20">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10">
            <div
              key={`stage-${fadeKey}`}
              className={`h-[min(640px,78vh)] min-h-[420px] sm:min-h-[520px] ${
                reduceMotion ? "" : "animate-fade-in"
              }`}
            >
              <FeaturePreview id={active} />
            </div>
            <p className="mt-5 text-center text-[12px] text-white/35">
              Interactive preview - switch steps, rounds, clients, and practices above.
            </p>
          </div>
        </div>
      </section>

      {/* All capabilities at a glance */}
      <section className="relative border-t border-black/[0.06]">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/35">
              Platform map
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              Four capabilities. One commercial system.
            </h2>
            <p className="mt-3 text-[15px] text-[#0a0a0a]/55 leading-relaxed">
              Jump into any part of the pricing lifecycle - or run the full path without leaving
              Lysp.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
            {USE_CASES.map((uc, i) => (
              <button
                key={uc.id}
                type="button"
                onClick={() => {
                  select(uc.id);
                  document.getElementById("product-detail")?.scrollIntoView({
                    behavior: reduceMotion ? "auto" : "smooth",
                    block: "start",
                  });
                }}
                className="group text-left rounded-[1.35rem] border border-black/[0.08] bg-white p-6 sm:p-7 transition-colors hover:bg-[#fafaf8] cursor-pointer"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-[11px] font-semibold tabular-nums tracking-wider text-[#0a0a0a]/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <HiArrowRight className="h-4 w-4 text-[#0a0a0a]/25 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0a0a0a]/55" />
                </div>
                <h3 className="mt-4 text-[17px] sm:text-lg font-semibold tracking-tight">
                  {uc.label}
                </h3>
                <p className="mt-2 text-[14px] text-[#0a0a0a]/55 leading-relaxed">{uc.brief}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="relative bg-[#0a0a0a] text-[#fefefc]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(254,254,252,0.06),transparent_45%)]"
        />
        <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/35">
              Built for the desk
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              Designed around how pricing actually happens.
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRODUCT_ROLES.map((item) => (
              <div
                key={item.role}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6"
              >
                <h3 className="text-[15px] font-semibold tracking-tight">{item.role}</h3>
                <p className="mt-3 text-[13px] sm:text-[14px] text-white/45 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data foundation */}
      <section className="relative border-t border-black/[0.06]">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-4">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/35">
                Data foundation
              </p>
              <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
                Recommendations from your firm - not a generic model.
              </h2>
              <p className="mt-4 text-[15px] text-[#0a0a0a]/55 leading-relaxed">
                Lysp prices from matter history, rate cards, OCGs, and the walls you already run.
                Your commercial data stays yours.
              </p>
              <Link
                href="/security"
                className="mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-[#0a0a0a] hover:gap-3 transition-all"
              >
                Read how we protect it
                <HiArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRODUCT_FOUNDATIONS.map((item, i) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6"
                >
                  <span className="text-[11px] font-semibold tabular-nums tracking-wider text-[#0a0a0a]/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 text-[16px] font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-[14px] text-[#0a0a0a]/55 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative border-t border-black/[0.06]">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20">
          <div className="rounded-[1.75rem] border border-black/[0.08] bg-white px-6 sm:px-10 py-10 sm:py-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/35">
                Next step
              </p>
              <h2 className="mt-3 text-2xl sm:text-[1.85rem] font-semibold tracking-tight text-balance">
                See Lysp on your matters, rate cards, and OCGs.
              </h2>
              <p className="mt-3 text-[15px] text-[#0a0a0a]/55 leading-relaxed">
                We’ll walk through scoping, pricing, negotiation, and analytics with your team -
                on firm data, not a generic demo script.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-3.5 text-[14px] font-semibold text-[#fefefc] hover:bg-black transition-colors"
              >
                Book a demo
                <HiArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center rounded-full border border-black/15 bg-[#fefefc] px-6 py-3.5 text-[14px] font-semibold text-[#0a0a0a] hover:bg-black/[0.03] transition-colors"
              >
                Usage pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
