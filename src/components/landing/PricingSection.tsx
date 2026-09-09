"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HiArrowRight, HiCheck } from "react-icons/hi";
import { MARKETING_SHELL, SectionHeader } from "@/components/landing/editorial";
import { useBookDemo } from "@/components/landing/BookDemoModal";

/** Illustrative public rate - firm rate cards are custom. */
const CREDIT_USD = 32;

const ACTION_COST = {
  matter: 3,
  negotiation: 5,
  scenario: 2,
  analytics: 1,
} as const;

type Pace = "light" | "typical" | "busy";

const PACE: Record<
  Pace,
  { label: string; hint: string; negotiate: number; scenarios: number; analytics: number }
> = {
  light: {
    label: "Light",
    hint: "Fewer counters, steady proposals",
    negotiate: 0.15,
    scenarios: 0.5,
    analytics: 6,
  },
  typical: {
    label: "Typical",
    hint: "Normal commercial volume",
    negotiate: 0.3,
    scenarios: 0.8,
    analytics: 12,
  },
  busy: {
    label: "Busy",
    hint: "Heavy negotiation & modeling",
    negotiate: 0.5,
    scenarios: 1.2,
    analytics: 24,
  },
};

const PLAIN_EXAMPLES = [
  {
    action: "Price one matter",
    detail: "Request → fee → proposal",
    credits: ACTION_COST.matter,
  },
  {
    action: "Run a negotiation",
    detail: "Client counter to approval",
    credits: ACTION_COST.negotiation,
  },
  {
    action: "Build fee scenarios",
    detail: "Compare structures",
    credits: ACTION_COST.scenario,
  },
  {
    action: "Pull an analytics digest",
    detail: "Realization & leakage",
    credits: ACTION_COST.analytics,
  },
];

const INCLUDED = [
  "Unlimited users - no seat fees",
  "Client portals & proposal viewers",
  "OCG guardrails & rate cards",
  "Billing & PMS integrations",
];

const MATTERS_MIN = 5;
const MATTERS_MAX = 200;
const MATTERS_DEFAULT = Math.round((MATTERS_MIN + MATTERS_MAX) / 2);

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function useAnimatedNumber(target: number, duration = 420) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    let frame = 0;
    const start = value;
    const delta = target - start;
    if (delta === 0) return;
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(start + delta * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate from last displayed value
  }, [target, duration]);

  return value;
}

export function PricingSection() {
  const { openBookDemo } = useBookDemo();
  const [matters, setMatters] = useState(MATTERS_DEFAULT);
  const [pace, setPace] = useState<Pace>("typical");

  const estimate = useMemo(() => {
    const profile = PACE[pace];
    const negotiations = Math.round(matters * profile.negotiate);
    const scenarios = Math.round(matters * profile.scenarios);
    const analytics = profile.analytics;

    const credits =
      matters * ACTION_COST.matter +
      negotiations * ACTION_COST.negotiation +
      scenarios * ACTION_COST.scenario +
      analytics * ACTION_COST.analytics;

    const mid = Math.round(credits * CREDIT_USD);
    return {
      negotiations,
      scenarios,
      analytics,
      credits: Math.round(credits),
      mid,
      low: Math.round(mid * 0.85),
      high: Math.round(mid * 1.15),
      perMatter: ACTION_COST.matter * CREDIT_USD,
    };
  }, [matters, pace]);

  const animatedMid = useAnimatedNumber(estimate.mid);
  const animatedCredits = useAnimatedNumber(estimate.credits);

  const sliderPct =
    ((matters - MATTERS_MIN) / (MATTERS_MAX - MATTERS_MIN)) * 100;

  return (
    <section id="pricing" className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 8% 0%, rgba(10,10,10,0.035), transparent 55%),
            radial-gradient(ellipse 55% 45% at 92% 100%, rgba(10,10,10,0.028), transparent 50%),
            linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 28%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
        }}
      />

      <div className={`${MARKETING_SHELL} pt-20 sm:pt-28 pb-20 sm:pb-28`}>
        <SectionHeader
          eyebrow="Pricing · usage-based"
          title={
            <>
              One credit.
              <span className="text-[#0a0a0a]/38"> One clear price.</span>
            </>
          }
          description="No seats. No opaque tiers. You buy credits; Lysp spends them when your firm prices, negotiates, and reports. Your rate card is custom - this is the public reference."
        />

        {/* Credit hero + examples */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
          <div className="lg:col-span-5 relative overflow-hidden rounded-[1.85rem] border border-black/[0.07] bg-white p-8 sm:p-10 flex flex-col justify-between shadow-[0_24px_60px_-40px_rgba(10,10,10,0.28)]">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-[#0a0a0a]/35">
                Cost of 1 credit
              </p>
              <div className="mt-7 flex items-baseline gap-2.5">
                <span className="text-6xl sm:text-7xl font-semibold tracking-tight tabular-nums leading-none">
                  ${CREDIT_USD}
                </span>
                <span className="text-[15px] text-[#0a0a0a]/40 font-medium pb-1">/ credit</span>
              </div>
              <p className="mt-6 text-[15px] text-[#0a0a0a]/55 leading-relaxed max-w-sm">
                A credit is one unit of pricing work. Pricing a matter uses{" "}
                <span className="text-[#0a0a0a] font-semibold">{ACTION_COST.matter} credits</span>
                {" "}- about {formatUsd(estimate.perMatter)}.
              </p>
            </div>

            <div className="relative mt-10 flex items-center gap-3 border-t border-black/[0.06] pt-5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0a0a0a]/25" />
              <p className="text-[12px] text-[#0a0a0a]/40">
                Illustrative rate · firm contracts are custom
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-[1.85rem] border border-black/[0.07] bg-white/80 backdrop-blur-sm overflow-hidden shadow-[0_24px_60px_-42px_rgba(10,10,10,0.22)]">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {PLAIN_EXAMPLES.map((item, i) => {
                const dollars = item.credits * CREDIT_USD;
                return (
                  <div
                    key={item.action}
                    className={`group/cell relative p-6 sm:p-7 flex flex-col justify-between min-h-[156px] transition-colors duration-300 hover:bg-[#fafaf8]
                      ${i % 2 === 0 ? "sm:border-r border-black/[0.06]" : ""}
                      ${i < 2 ? "border-b border-black/[0.06]" : ""}`}
                  >
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#0a0a0a]/28">
                        0{i + 1}
                      </p>
                      <p className="mt-2.5 text-[15px] sm:text-[16px] font-semibold tracking-tight">
                        {item.action}
                      </p>
                      <p className="mt-1 text-[13px] text-[#0a0a0a]/45">{item.detail}</p>
                    </div>
                    <div className="mt-6 flex items-end justify-between gap-3">
                      <p className="text-[13px] text-[#0a0a0a]/40">
                        {item.credits} credit{item.credits === 1 ? "" : "s"}
                      </p>
                      <p className="text-2xl font-semibold tabular-nums tracking-tight transition-transform duration-300 group-hover/cell:-translate-y-0.5">
                        {formatUsd(dollars)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Calculator */}
        <div className="mt-5 lg:mt-6 relative overflow-hidden rounded-[1.85rem] border border-black/[0.07] bg-white shadow-[0_28px_70px_-48px_rgba(10,10,10,0.3)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent"
          />

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
              <div className="lg:col-span-7 flex flex-col gap-10">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/35">
                    Quick estimate
                  </p>
                  <h3 className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight">
                    Two questions. Instant monthly range.
                  </h3>
                </div>

                <div>
                  <div className="flex items-end justify-between gap-4">
                    <label
                      htmlFor="matters-slider"
                      className="text-[15px] font-medium text-[#0a0a0a]/65"
                    >
                      How many matters do you price each month?
                    </label>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-semibold tabular-nums tracking-tight leading-none">
                        {matters}
                      </span>
                      <span className="text-[12px] text-[#0a0a0a]/35 font-medium">/ mo</span>
                    </div>
                  </div>

                  <div className="relative mt-7 px-0.5">
                    <div className="h-2 w-full rounded-full bg-[#eeeef0] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] transition-[width] duration-75"
                        style={{ width: `${sliderPct}%` }}
                      />
                    </div>
                    <input
                      id="matters-slider"
                      type="range"
                      min={MATTERS_MIN}
                      max={MATTERS_MAX}
                      step={5}
                      value={matters}
                      onChange={(e) =>
                        setMatters(clamp(Number(e.target.value), MATTERS_MIN, MATTERS_MAX))
                      }
                      className="absolute inset-0 w-full h-2 appearance-none bg-transparent cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[22px] [&::-webkit-slider-thumb]:w-[22px]
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-black/10
                        [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(10,10,10,0.18),0_0_0_4px_rgba(10,10,10,0.04)]
                        [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10
                        [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-black/10 [&::-moz-range-thumb]:bg-white
                        [&::-moz-range-track]:bg-transparent"
                    />
                  </div>
                  <div className="mt-3 flex justify-between text-[11px] text-[#0a0a0a]/28 tabular-nums">
                    <span>{MATTERS_MIN}</span>
                    <span className="text-[#0a0a0a]/40">Centered at {MATTERS_DEFAULT}</span>
                    <span>{MATTERS_MAX}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[15px] font-medium text-[#0a0a0a]/65">
                    How busy is negotiation & modeling?
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[#f3f3f1] ring-1 ring-black/[0.04]">
                    {(Object.keys(PACE) as Pace[]).map((key) => {
                      const active = pace === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPace(key)}
                          className={`relative rounded-[0.85rem] px-3 py-3.5 text-left transition-all duration-200 cursor-pointer ${
                            active
                              ? "bg-white text-[#0a0a0a] shadow-[0_4px_14px_-4px_rgba(10,10,10,0.14)] ring-1 ring-black/[0.06]"
                              : "text-[#0a0a0a]/42 hover:text-[#0a0a0a]/65"
                          }`}
                        >
                          {active && (
                            <span
                              aria-hidden
                              className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#0a0a0a]"
                            />
                          )}
                          <span className="block text-[14px] font-semibold">{PACE[key].label}</span>
                          <span
                            className={`mt-0.5 block text-[11px] leading-snug ${
                              active ? "text-[#0a0a0a]/45" : "text-[#0a0a0a]/28"
                            }`}
                          >
                            {PACE[key].hint}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Estimate panel */}
              <div className="lg:col-span-5 relative flex flex-col overflow-hidden rounded-[1.45rem] bg-[#0a0a0a] text-[#fefefc] p-7 sm:p-8 shadow-[0_20px_50px_-24px_rgba(10,10,10,0.55)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/[0.05]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-white/[0.03]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
                />

                <p className="relative text-[11px] font-semibold tracking-[0.22em] uppercase text-white/40">
                  Estimated monthly spend
                </p>
                <p className="relative mt-5 text-4xl sm:text-5xl font-semibold tracking-tight tabular-nums leading-none">
                  {formatUsd(animatedMid)}
                </p>
                <p className="relative mt-3 text-[14px] text-white/45">
                  Range{" "}
                  <span className="text-white/75 tabular-nums font-medium">
                    {formatUsd(estimate.low)} to {formatUsd(estimate.high)}
                  </span>
                </p>

                <div className="relative mt-8 space-y-3 border-t border-white/10 pt-6 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-white/40">Credits used</span>
                    <span className="font-semibold tabular-nums">
                      {animatedCredits.toLocaleString()} x ${CREDIT_USD}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Matters priced</span>
                    <span className="font-semibold tabular-nums">{matters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Negotiations (est.)</span>
                    <span className="font-semibold tabular-nums">{estimate.negotiations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40">Seat fees</span>
                    <span className="font-semibold">$0</span>
                  </div>
                </div>

                <button
              type="button"
              onClick={() => openBookDemo("pricing")}
              className="relative mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#fefefc] px-6 py-3.5 text-[14px] font-semibold text-[#0a0a0a] hover:bg-white transition-all duration-200 hover:gap-3 cursor-pointer shadow-[0_8px_24px_-12px_rgba(254,254,252,0.5)]"
            >
                  Book a demo
                  <HiArrowRight className="h-4 w-4" />
                </button>
                <p className="relative mt-4 text-center text-[11px] text-white/30 leading-relaxed">
                  Final pricing is custom. Estimate uses the public ${CREDIT_USD}/credit reference.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-t border-black/[0.07] pt-10">
          <p className="text-[14px] text-[#0a0a0a]/40 max-w-sm leading-relaxed">
            Platform access for the whole firm. You only pay when pricing work runs.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
            {INCLUDED.map((item) => (
              <li
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/70 px-3.5 py-1.5 text-[12px] text-[#0a0a0a]/55 shadow-[0_1px_2px_rgba(10,10,10,0.03)]"
              >
                <HiCheck className="h-3.5 w-3.5 shrink-0 text-[#0a0a0a]/40" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
