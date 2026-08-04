"use client";

import React, { useEffect, useState } from "react";
import { USE_CASES, type UseCaseId } from "./useCases";

function MockChrome({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex h-full min-h-[420px] sm:min-h-[480px] lg:min-h-[560px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0e0d] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="rounded-md bg-white/[0.04] px-4 py-1 text-[11px] font-medium tracking-wide text-white/35">
            app.lysp.ai · {title}
          </div>
        </div>
        <div className="w-12" />
      </div>
      <div className="flex flex-1 min-h-0">{children}</div>
    </div>
  );
}

function FlowMock() {
  return (
    <MockChrome title="Scope → Price → Propose">
      <div className="flex flex-1 min-w-0 flex-col p-4 sm:p-6 gap-5 overflow-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">
              Pricing flow
            </p>
            <h4 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
              Project Meridian
            </h4>
            <p className="mt-1 text-[13px] text-white/40">
              One continuous path from RFP to client-ready proposal
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold">
            {["Scope", "Price", "Propose"].map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 ? <span className="text-white/20 px-0.5">→</span> : null}
                <span className="rounded-full bg-white text-[#0a0a0a] px-3 py-1">{s}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                01 · AI Matter Scoping
              </p>
              <span className="text-[10px] text-white/40">Done</span>
            </div>
            <div className="rounded-xl bg-white/[0.05] px-3.5 py-3">
              <p className="text-[12px] leading-relaxed text-white/70">
                $420M share purchase. UK/DE diligence, SPA negotiation, regulatory filings.
              </p>
            </div>
            <div className="space-y-2 mt-auto">
              {[
                { phase: "Diligence", hours: "420h", mix: "Partner 18%" },
                { phase: "SPA & negotiation", hours: "310h", mix: "Partner 24%" },
                { phase: "Regulatory", hours: "180h", mix: "Counsel 40%" },
                { phase: "Closing", hours: "95h", mix: "Associate 55%" },
              ].map((row) => (
                <div
                  key={row.phase}
                  className="rounded-xl border border-white/[0.06] px-3 py-2.5 flex justify-between gap-2"
                >
                  <div>
                    <p className="text-[12px] font-semibold text-white/85">{row.phase}</p>
                    <p className="text-[10px] text-white/30">{row.mix}</p>
                  </div>
                  <span className="text-[11px] tabular-nums text-white/40">{row.hours}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                02 · Data-Driven Pricing
              </p>
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                87% confidence
              </span>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-5">
              <p className="text-[11px] text-white/35">Recommended fixed fee</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-white tabular-nums">
                $485,000
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/25 font-semibold">
                    Margin
                  </p>
                  <p className="mt-0.5 text-xl font-semibold text-white tabular-nums">42%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-white/25 font-semibold">
                    Realization
                  </p>
                  <p className="mt-0.5 text-xl font-semibold text-white tabular-nums">91–94%</p>
                </div>
              </div>
            </div>
            <p className="mt-auto text-[12px] text-white/40 leading-relaxed">
              Grounded in 12 comparable acquisitions · median fee $470k · write-offs under 4%
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#fefefc] text-[#0a0a0a] p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/35">
                03 · Proposal Generation
              </p>
              <span className="text-[10px] font-semibold text-black/40">Ready</span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/30">
              Lysp · Confidential
            </p>
            <p className="text-base font-semibold tracking-tight">Fee proposal - Meridian</p>
            <p className="text-[12px] text-black/50 leading-relaxed">
              Branded, structured, ready to send from approved scope.
            </p>
            <div className="mt-auto space-y-2 border-t border-black/8 pt-3">
              {[
                { label: "Diligence", fee: "$185,000" },
                { label: "SPA & negotiation", fee: "$165,000" },
                { label: "Regulatory & closing", fee: "$135,000" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-[12px] font-medium">
                  <span className="text-black/55">{row.label}</span>
                  <span className="tabular-nums">{row.fee}</span>
                </div>
              ))}
              <div className="flex justify-between text-[13px] font-semibold border-t border-black/8 pt-2">
                <span>Total fixed fee</span>
                <span className="tabular-nums">$485,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

function NegotiationMock() {
  return (
    <MockChrome title="Rate negotiation">
      <div className="flex flex-1 min-w-0 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/[0.06]">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">
              Client portal
            </p>
            <h4 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
              Meridian Holdings - rate negotiation
            </h4>
            <p className="mt-1 text-[13px] text-white/40">Round 2 of 3 · every action attributable</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">
                Firm offer
              </p>
              <p className="mt-2 text-3xl font-semibold text-white tabular-nums">$485k</p>
              <p className="mt-1 text-[11px] text-white/40">Fixed · sent Mar 12</p>
            </div>
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.06] p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">
                Client counter
              </p>
              <p className="mt-2 text-3xl font-semibold text-white tabular-nums">$440k</p>
              <p className="mt-1 text-[11px] text-white/40">−9.3% · Mar 14</p>
            </div>
          </div>

          <div className="mt-auto rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5">
            <p className="text-[12px] font-semibold text-white/80">No email chains</p>
            <p className="mt-1 text-[11px] text-white/40 leading-relaxed">
              Clients submit counters and accept rates in one place. Partners approve with full
              context.
            </p>
          </div>
        </div>

        <div className="w-full lg:w-[300px] xl:w-[320px] p-4 sm:p-5 bg-black/20 flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Negotiation log
          </p>
          {[
            { who: "Client", text: "Counter at $440k - volume relationship", time: "14:22" },
            { who: "Partner", text: "Accept if margin ≥ 38%", time: "15:01" },
            { who: "Finance", text: "Margin cleared at 39.2%", time: "15:18" },
            { who: "Portal", text: "Revised offer shared", time: "15:20" },
          ].map((row) => (
            <div
              key={row.time + row.who}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
            >
              <div className="flex justify-between gap-2">
                <span className="text-[11px] font-semibold text-white/70">{row.who}</span>
                <span className="text-[10px] tabular-nums text-white/25">{row.time}</span>
              </div>
              <p className="mt-1 text-[11px] text-white/45 leading-snug">{row.text}</p>
            </div>
          ))}
        </div>
      </div>
    </MockChrome>
  );
}

function DiscountsMock() {
  return (
    <MockChrome title="Volume discounts">
      <div className="flex flex-1 min-w-0 flex-col p-4 sm:p-6 gap-5 overflow-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">
              Client relationship
            </p>
            <h4 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
              Apex Global Legal - volume tiers
            </h4>
          </div>
          <p className="text-[12px] text-white/40">
            YTD spend{" "}
            <span className="text-white font-semibold tabular-nums">$2.4M</span>
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-[15px] font-semibold text-white">
              Tier 3 active · 8% volume discount
            </p>
            <p className="text-[13px] font-semibold text-white/70 tabular-nums">72% to Tier 4</p>
          </div>
          <div className="mt-4 h-2.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full w-[72%] rounded-full bg-white/85" />
          </div>
          <div className="mt-3 flex justify-between text-[11px] text-white/35">
            <span>Tier 3 · $2.0M</span>
            <span className="text-white/55">Next: Tier 4 at $3.0M · 12%</span>
            <span>$3.0M</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Current savings", value: "$192k" },
            { label: "Matters counted", value: "18" },
            { label: "To next tier", value: "$600k" },
            { label: "Client visibility", value: "Live" },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3.5"
            >
              <p className="text-[10px] uppercase tracking-wider text-white/25 font-semibold">
                {m.label}
              </p>
              <p className="mt-1.5 text-xl font-semibold tracking-tight text-white tabular-nums">
                {m.value}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
          <p className="text-[12px] text-white/45">
            <span className="text-white/70 font-medium">Automatic tracking - </span>
            tiers update as matters close. Clients see savings and progress in the portal in real
            time.
          </p>
        </div>
      </div>
    </MockChrome>
  );
}

function AnalyticsMock() {
  const bars = [38, 45, 42, 55, 51, 62, 58, 70, 66, 74, 71, 82];
  return (
    <MockChrome title="Pricing analytics">
      <div className="flex flex-1 min-w-0 flex-col p-4 sm:p-6 gap-5 overflow-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">
              Firm-wide
            </p>
            <h4 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
              Pricing performance
            </h4>
          </div>
          <p className="text-[12px] text-white/40">Last 12 weeks · all practices</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Win rate", value: "68%", delta: "+4.2 pts" },
            { label: "Avg margin", value: "41%", delta: "+1.8 pts" },
            { label: "Realization", value: "93%", delta: "+0.6 pts" },
            { label: "Anomalies", value: "3", delta: "Tax flagged" },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3.5"
            >
              <p className="text-[10px] uppercase tracking-wider text-white/25 font-semibold">
                {m.label}
              </p>
              <p className="mt-1.5 text-2xl font-semibold tracking-tight text-white tabular-nums">
                {m.value}
              </p>
              <p className="mt-1 text-[11px] text-white/40">{m.delta}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <p className="text-[12px] font-semibold text-white/70">Win rate trend</p>
            <p className="text-[11px] text-white/35">Benchmark vs peer set</p>
          </div>
          <div className="flex items-end gap-1.5 h-28">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-white/30"
                style={{ height: `${h}%`, opacity: 0.3 + (i / bars.length) * 0.7 }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.05] overflow-hidden">
          <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr] gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">
            <span>Practice</span>
            <span>Win rate</span>
            <span>Margin</span>
            <span>Status</span>
          </div>
          {[
            { practice: "Corporate M&A", win: "74%", margin: "44%", status: "Strong" },
            { practice: "Banking", win: "61%", margin: "39%", status: "Stable" },
            { practice: "Tax", win: "48%", margin: "36%", status: "Watch" },
          ].map((row) => (
            <div
              key={row.practice}
              className="grid grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr] gap-2 px-4 py-3 border-b border-white/[0.04] last:border-0 text-[12px]"
            >
              <span className="text-white/75 font-medium">{row.practice}</span>
              <span className="text-white/45 tabular-nums">{row.win}</span>
              <span className="text-white/45 tabular-nums">{row.margin}</span>
              <span className="text-white/55">{row.status}</span>
            </div>
          ))}
        </div>
      </div>
    </MockChrome>
  );
}

function UseCaseStage({ id }: { id: UseCaseId }) {
  switch (id) {
    case "flow":
      return <FlowMock />;
    case "negotiation":
      return <NegotiationMock />;
    case "discounts":
      return <DiscountsMock />;
    case "analytics":
      return <AnalyticsMock />;
  }
}

type ProductExplorerProps = {
  initialId?: UseCaseId;
};

export function ProductExplorer({ initialId = "flow" }: ProductExplorerProps) {
  const [active, setActive] = useState<UseCaseId>(initialId);
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
    <div id="product-detail" className="relative w-full bg-[#fefefc]">
      <div className="border-y border-black/[0.06]">
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
                  className={`relative shrink-0 px-3 sm:px-4 py-4 sm:py-5 text-[13px] sm:text-sm font-semibold transition-colors scroll-mt-24 ${
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

      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8">
        <div
          key={`copy-${fadeKey}`}
          className={`max-w-3xl ${reduceMotion ? "" : "animate-fade-in"}`}
        >
          <h2 className="text-xl sm:text-2xl lg:text-[1.75rem] font-semibold tracking-tight text-[#0a0a0a] text-balance leading-snug">
            {current.title}
          </h2>
          <p className="mt-3 text-[15px] sm:text-base text-[#0a0a0a]/55 leading-relaxed max-w-2xl">
            {current.description}
          </p>
        </div>
      </div>

      <div className="bg-[#0a0f0d] pt-8 sm:pt-12 pb-16 sm:pb-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10">
          <div key={`stage-${fadeKey}`} className={reduceMotion ? "" : "animate-fade-in"}>
            <UseCaseStage id={active} />
          </div>
        </div>
      </div>
    </div>
  );
}
