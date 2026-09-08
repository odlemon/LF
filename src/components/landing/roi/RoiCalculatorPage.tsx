"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { MARKETING_SHELL, PageHeroHeader } from "@/components/landing/editorial";
import {
  CREDIT_USD,
  FIRM_PROFILES,
  computeRoi,
  formatMultiple,
  formatUsd,
  inputsFromSimple,
  type FirmProfile,
} from "./roiMath";

function useAnimatedNumber(target: number, duration = 520) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return formatUsd(n);
}

const FEE_PRESETS = [
  { label: "$1M", value: 1_000_000 },
  { label: "$2.5M", value: 2_500_000 },
  { label: "$5M", value: 5_000_000 },
] as const;

export function RoiCalculatorPage() {
  const [matters, setMatters] = useState(40);
  const [avgFee, setAvgFee] = useState(2_400_000);
  const [profile, setProfile] = useState<FirmProfile>("balanced");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
  }, []);

  const inputs = useMemo(
    () => inputsFromSimple({ matters, avgFee, profile }),
    [matters, avgFee, profile],
  );
  const result = useMemo(() => computeRoi(inputs), [inputs]);
  const profileMeta = FIRM_PROFILES[profile];

  const animNet = useAnimatedNumber(result.netAnnualImpact, reduceMotion ? 0 : 560);
  const animGross = useAnimatedNumber(result.grossAnnualImpact, reduceMotion ? 0 : 520);
  const animCost = useAnimatedNumber(result.lyspAnnualCost, reduceMotion ? 0 : 480);

  const mattersPct = ((matters - 5) / (200 - 5)) * 100;
  const feePct = ((avgFee - 250_000) / (8_000_000 - 250_000)) * 100;

  const shareMailto = () => {
    const body = [
      "Lysp ROI estimate (illustrative)",
      "",
      `Matters priced per year: ${matters}`,
      `Average matter fee: ${formatUsd(avgFee)}`,
      `Pricing posture: ${profileMeta.label}`,
      "",
      `Net annual impact: ${formatUsd(result.netAnnualImpact)}`,
      `Gross impact before Lysp cost: ${formatUsd(result.grossAnnualImpact)}`,
      `Estimated Lysp cost: ${formatUsd(result.lyspAnnualCost)}`,
      `Return multiple: ${formatMultiple(result.roiMultiple)}`,
      "",
      "For internal discussion only. Not a guarantee of results.",
    ].join("\n");
    window.location.href = `mailto:?subject=${encodeURIComponent("Lysp ROI estimate")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      <section className="relative min-h-[min(100vh,960px)] flex flex-col bg-[#0a0f0d] text-[#fefefc]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/practices/litigation-glass.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-[0.22]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(254,254,252,0.08),transparent_50%),linear-gradient(180deg,#0a0f0d_0%,rgba(10,15,13,0.75)_40%,#0a0f0d_100%)]"
        />

        <div className={`relative ${MARKETING_SHELL} pt-28 sm:pt-32 pb-10 sm:pb-14 flex-1 flex flex-col`}>
          <PageHeroHeader
            tone="dark"
            eyebrow="ROI"
            title={
              <>
                What does better pricing
                <span className="text-white/40"> return for your firm?</span>
              </>
            }
            description="Set three things your partners already know. Lysp estimates fees protected from underpricing, write-downs, slow proposals, and soft negotiations, after estimated platform cost."
            className="max-w-2xl"
          />

          <div className="mt-10 sm:mt-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Result */}
            <div className="lg:col-span-7 flex flex-col justify-end order-2 lg:order-1">
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-white/35">
                Estimated net annual impact
              </p>
              <p className="mt-3 text-[3.5rem] sm:text-6xl lg:text-[5.5rem] font-semibold tracking-tight tabular-nums leading-[0.95]">
                {formatCompact(animNet)}
              </p>
              <p className="mt-4 text-[15px] text-white/45 max-w-lg leading-relaxed">
                After estimated Lysp usage of {formatUsd(animCost)} per year. About{" "}
                {formatMultiple(result.roiMultiple)} back for every dollar of platform cost.
              </p>

              <div className="mt-10 sm:mt-12 grid grid-cols-3 gap-px bg-white/[0.08] rounded-2xl overflow-hidden border border-white/[0.08]">
                {[
                  {
                    label: "Underpricing held",
                    value: formatCompact(result.leakageRecovered),
                  },
                  {
                    label: "Realization lift",
                    value: formatCompact(result.realizationGain),
                  },
                  {
                    label: "Before Lysp cost",
                    value: formatCompact(animGross),
                  },
                ].map((m) => (
                  <div key={m.label} className="bg-[#0a0f0d]/80 px-4 py-4 sm:px-5 sm:py-5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      {m.label}
                    </p>
                    <p className="mt-2 text-[15px] sm:text-lg font-semibold tabular-nums tracking-tight">
                      {m.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              <div className="relative h-full rounded-[1.75rem] border border-white/[0.12] bg-gradient-to-b from-white/[0.09] to-white/[0.03] p-6 sm:p-7 flex flex-col shadow-[0_40px_80px_-40px_rgba(0,0,0,0.65)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/40">
                    Your book
                  </p>
                  <p className="text-[11px] text-white/25 tabular-nums">
                    {formatCompact(result.grossFeeVolume)} fee volume
                  </p>
                </div>

                <div className="mt-8 space-y-8 flex-1">
                  {/* Matters */}
                  <div>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <label className="text-[13px] font-semibold text-white/90">
                          Matters you price each year
                        </label>
                        <p className="mt-1 text-[12px] text-white/35 leading-snug">
                          RFPs and pitches that need a fee
                        </p>
                      </div>
                      <span className="min-w-[3.25rem] text-right text-[22px] font-semibold tabular-nums tracking-tight leading-none">
                        {matters}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={200}
                      step={1}
                      value={matters}
                      onChange={(e) => setMatters(Number(e.target.value))}
                      className="roi-range mt-5 w-full cursor-pointer"
                      style={
                        {
                          "--roi-fill": `${mattersPct}%`,
                        } as React.CSSProperties
                      }
                      aria-label="Matters priced per year"
                    />
                  </div>

                  {/* Average fee */}
                  <div>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <label className="text-[13px] font-semibold text-white/90">
                          Typical matter fee
                        </label>
                        <p className="mt-1 text-[12px] text-white/35 leading-snug">
                          Average agreed fee across that book
                        </p>
                      </div>
                      <span className="text-right text-[22px] font-semibold tabular-nums tracking-tight leading-none">
                        {formatCompact(avgFee)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={250_000}
                      max={8_000_000}
                      step={50_000}
                      value={avgFee}
                      onChange={(e) => setAvgFee(Number(e.target.value))}
                      className="roi-range mt-5 w-full cursor-pointer"
                      style={
                        {
                          "--roi-fill": `${feePct}%`,
                        } as React.CSSProperties
                      }
                      aria-label="Average matter fee"
                    />
                    <div className="mt-3 flex gap-2">
                      {FEE_PRESETS.map((p) => {
                        const active = Math.abs(avgFee - p.value) < 25_000;
                        return (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => setAvgFee(p.value)}
                            className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide transition-colors cursor-pointer ${
                              active
                                ? "bg-white text-[#0a0a0a]"
                                : "bg-white/[0.06] text-white/45 hover:text-white/80 hover:bg-white/[0.1]"
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Intensity: segmented */}
                  <div>
                    <p className="text-[13px] font-semibold text-white/90">
                      How hard do clients push on price?
                    </p>
                    <p className="mt-1 text-[12px] text-white/35 leading-snug">
                      Sets how aggressive the estimate is on negotiation and recovery
                    </p>
                    <div
                      className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-black/35 p-1 border border-white/[0.08]"
                      role="radiogroup"
                      aria-label="Pricing intensity"
                    >
                      {(Object.keys(FIRM_PROFILES) as FirmProfile[]).map((id) => {
                        const active = profile === id;
                        const meta = FIRM_PROFILES[id];
                        return (
                          <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => setProfile(id)}
                            className={`rounded-[0.9rem] px-2 py-3.5 text-center transition-all cursor-pointer ${
                              active
                                ? "bg-[#fefefc] text-[#0a0a0a] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)]"
                                : "text-white/50 hover:text-white/80"
                            }`}
                          >
                            <span className="block text-[13px] font-semibold tracking-tight">
                              {meta.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-[12px] text-white/40 leading-relaxed min-h-[2.5rem]">
                      {profileMeta.line}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* The input itself is the touch target, so it is 28px tall even though the
                 track it draws is 2px. At 2px (the visual height) the slider was almost
                 impossible to grab on a phone. */
              .roi-range {
                -webkit-appearance: none;
                appearance: none;
                height: 28px;
                background: transparent;
                outline: none;
              }
              .roi-range::-webkit-slider-runnable-track {
                height: 2px;
                border-radius: 9999px;
                background: linear-gradient(
                  to right,
                  #fefefc var(--roi-fill, 0%),
                  rgba(255, 255, 255, 0.14) var(--roi-fill, 0%)
                );
              }
              .roi-range::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px;
                height: 18px;
                margin-top: -8px;
                border-radius: 9999px;
                background: #fefefc;
                border: 2px solid #0a0f0d;
                box-shadow: 0 0 0 1px rgba(254, 254, 252, 0.35);
                cursor: pointer;
              }
              .roi-range::-moz-range-thumb {
                width: 18px;
                height: 18px;
                border-radius: 9999px;
                background: #fefefc;
                border: 2px solid #0a0f0d;
                box-shadow: 0 0 0 1px rgba(254, 254, 252, 0.35);
                cursor: pointer;
              }
              .roi-range::-moz-range-track {
                height: 2px;
                border-radius: 9999px;
                background: linear-gradient(
                  to right,
                  #fefefc var(--roi-fill, 0%),
                  rgba(255, 255, 255, 0.14) var(--roi-fill, 0%)
                );
              }
            `,
          }}
        />
      </section>

      {/* Plain-language breakdown */}
      <section className="relative border-b border-black/[0.06] bg-[#fefefc]">
        <div className={`${MARKETING_SHELL} py-14 sm:py-16`}>
          <div className="max-w-2xl mb-10 sm:mb-12">
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#0a0a0a]/35">
              How to read the number
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              Five ways pricing discipline shows up in the P&amp;L.
            </h2>
            <p className="mt-4 text-[15px] text-[#0a0a0a]/50 leading-relaxed">
              Each line is an annual estimate for a book like yours. Nothing here is a promise. It is
              a structured way to talk about leakage, realization, and negotiation with partners and
              finance.
            </p>
          </div>

          <ol className="border-t border-black/[0.08]">
            {[
              {
                n: "01",
                title: "Fees you stop giving away",
                body: "When partners price without firm history, fees often land below what comparable matters actually support. This line is a conservative share of that underpricing, held back by comps, confidence bands, and approvals.",
                value: result.leakageRecovered,
              },
              {
                n: "02",
                title: "More of what you bill, collected",
                body: `Realization rises by about ${inputs.realizationLiftPts} points on your fee volume when scopes, rates, and write-down pressure are clearer before the engagement starts. Capped at elite-firm levels.`,
                value: result.realizationGain,
              },
              {
                n: "03",
                title: "Faster path to a priced proposal",
                body: `About ${result.quoteDaysSaved} fewer days from RFP to a fee the firm will stand behind. Valued lightly, because partner time freed up is only partly economic.`,
                value: result.quoteCapacityValue,
              },
              {
                n: "04",
                title: "Margin kept in negotiation",
                body: "On matters where clients counter, attributable rounds and margin floors protect a slice of fee that often erodes in email threads and hallway approvals.",
                value: result.negotiationValue,
              },
              {
                n: "05",
                title: "Estimated Lysp cost",
                body: `${profileMeta.label} usage on the public credit model (${result.lyspCredits} credits at $${CREDIT_USD}). Firm commercial terms are custom.`,
                value: -result.lyspAnnualCost,
              },
            ].map((row) => (
              <li
                key={row.n}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 py-7 sm:py-8 border-b border-black/[0.08]"
              >
                <span className="sm:col-span-1 text-[12px] font-semibold tabular-nums tracking-wider text-[#0a0a0a]/25">
                  {row.n}
                </span>
                <div className="sm:col-span-7">
                  <p className="text-[16px] font-semibold tracking-tight">{row.title}</p>
                  <p className="mt-1.5 text-[14px] text-[#0a0a0a]/48 leading-relaxed max-w-xl">
                    {row.body}
                  </p>
                </div>
                <p
                  className={`sm:col-span-4 sm:text-right text-[16px] font-semibold tabular-nums ${
                    row.value < 0 ? "text-[#0a0a0a]/40" : "text-[#0a0a0a]"
                  }`}
                >
                  {row.value < 0 ? `−${formatUsd(Math.abs(row.value))}` : formatUsd(row.value)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-[#0a0a0a] text-[#fefefc]">
        <div
          className={`${MARKETING_SHELL} py-16 sm:py-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8`}
        >
          <div className="max-w-lg">
            <p className="text-[13px] font-semibold tracking-[0.08em] text-white/55">Lysp</p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              Run the same math on your last twenty deals.
            </h2>
            <p className="mt-3 text-[14px] text-white/45 leading-relaxed">
              A short working session with your pricing or finance lead is enough to replace these
              defaults with your real book.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-full bg-[#fefefc] px-6 py-3.5 text-[14px] font-semibold text-[#0a0a0a]"
            >
              Book a demo
              <HiArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={shareMailto}
              className="inline-flex items-center rounded-full border border-white/20 px-6 py-3.5 text-[14px] font-semibold text-white/80 hover:text-white cursor-pointer"
            >
              Share estimate
            </button>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="relative">
        <div className="relative mx-auto w-full max-w-[720px] px-5 sm:px-8 lg:px-10 py-14 sm:py-16">
          <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#0a0a0a]/35">
            Methodology
          </p>
          <div className="mt-5 space-y-4 text-[15px] text-[#0a0a0a]/55 leading-relaxed">
            <p>
              Fee volume is matters times typical fee. We start from a 7% underpricing baseline
              (common when elite work is priced without firm comps) and recover only the share that
              matches your intensity setting.
            </p>
            <p>
              Realization lift, negotiation margin, and quote-cycle value also scale with that
              setting. Lysp cost uses the public ${CREDIT_USD} per credit model. Realization is
              capped at 95%.
            </p>
            <p className="text-[13px] text-[#0a0a0a]/40">
              Estimates are for internal discussion only. Lysp does not guarantee any particular
              financial outcome. Firm commercial terms are custom.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
