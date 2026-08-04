"use client";

import React, { useEffect, useState } from "react";

type UseCaseId =
  | "scoping"
  | "pricing"
  | "proposals"
  | "approvals"
  | "dataroom";

type UseCase = {
  id: UseCaseId;
  label: string;
  title: string;
  description: string;
};

const USE_CASES: UseCase[] = [
  {
    id: "scoping",
    label: "Matter Scoping",
    title: "Scope matters in a conversation, not a spreadsheet.",
    description:
      "Describe the matter. Attach the RFP. Lysp builds phases, tasks, fee earner mix, and hours from similar work your firm has already done.",
  },
  {
    id: "pricing",
    label: "Fee Pricing",
    title: "Every fee recommendation grounded in what your firm has actually done.",
    description:
      "Historical matters, time entries, and rate cards produce pricing with confidence scores, margin projections, and the reasoning partners need.",
  },
  {
    id: "proposals",
    label: "Proposals",
    title: "From approved scope to client proposal in one click.",
    description:
      "Firm-branded proposals with phased plans, fee breakdowns, and rate cards — ready for the client portal.",
  },
  {
    id: "approvals",
    label: "Approvals",
    title: "Partner, then Finance. Every action attributable.",
    description:
      "Two-stage approval, discount routing by threshold, and a complete audit trail — without email chains.",
  },
  {
    id: "dataroom",
    label: "Data Room",
    title: "Decades of matter history, finally usable.",
    description:
      "CSV, Excel, PDF — Lysp maps, cleans, and structures it. Your historical data becomes the firm's private pricing intelligence.",
  },
];

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

function Sidebar({ active }: { active: string }) {
  const items = ["Matters", "Pricing", "Proposals", "Approvals", "Data Room"];
  return (
    <aside className="hidden sm:flex w-[180px] lg:w-[200px] shrink-0 flex-col gap-1 border-r border-white/[0.06] bg-black/30 p-3">
      <p className="px-2.5 pt-1 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
        Lysp
      </p>
      {items.map((item) => (
        <div
          key={item}
          className={`rounded-lg px-2.5 py-2 text-[12px] font-medium transition-colors ${
            item === active
              ? "bg-white/[0.08] text-white"
              : "text-white/35 hover:text-white/55"
          }`}
        >
          {item}
        </div>
      ))}
    </aside>
  );
}

function ScopingMock() {
  return (
    <MockChrome title="Matter intake">
      <Sidebar active="Matters" />
      <div className="flex flex-1 min-w-0 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col gap-4 border-b border-white/[0.06] p-4 sm:p-6 lg:border-b-0 lg:border-r">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">
              New matter
            </p>
            <h4 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
              Project Meridian
            </h4>
            <p className="mt-1 text-[13px] text-white/40">Cross-border acquisition · Corporate M&A</p>
          </div>

          <div className="mt-auto space-y-3">
            <div className="max-w-[92%] rounded-2xl rounded-tl-md bg-white/[0.06] px-3.5 py-3">
              <p className="text-[12px] leading-relaxed text-white/70">
                Describe the matter or attach the RFP. I will build a structured scope from similar past work.
              </p>
            </div>
            <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-[#1a3d2e] px-3.5 py-3">
              <p className="text-[12px] leading-relaxed text-[#c8e6d4]">
                $420M share purchase. UK/DE diligence, SPA negotiation, regulatory filings. Closing in Q3.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
              RFP_Meridian_SPA.pdf · attached
            </div>
          </div>
        </div>

        <div className="flex w-full lg:w-[280px] xl:w-[320px] flex-col gap-3 p-4 sm:p-5 bg-black/20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Structured scope
          </p>
          {[
            { phase: "01 Diligence", hours: "420h", mix: "Partner 18%" },
            { phase: "02 SPA & negotiation", hours: "310h", mix: "Partner 24%" },
            { phase: "03 Regulatory", hours: "180h", mix: "Counsel 40%" },
            { phase: "04 Closing", hours: "95h", mix: "Associate 55%" },
          ].map((row) => (
            <div
              key={row.phase}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] font-semibold text-white/85">{row.phase}</span>
                <span className="text-[11px] font-medium tabular-nums text-white/40">{row.hours}</span>
              </div>
              <p className="mt-1 text-[11px] text-white/30">{row.mix}</p>
            </div>
          ))}
          <p className="mt-1 text-[11px] text-emerald-400/80 font-medium">
            4 comparable acquisitions in data room
          </p>
        </div>
      </div>
    </MockChrome>
  );
}

function PricingMock() {
  return (
    <MockChrome title="Pricing intelligence">
      <Sidebar active="Pricing" />
      <div className="flex flex-1 min-w-0 flex-col p-4 sm:p-6 gap-5 overflow-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">
              Recommendation
            </p>
            <h4 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
              Project Meridian — fee structure
            </h4>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
            87% confidence
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-5 sm:p-6">
            <p className="text-[11px] font-medium text-white/35">Recommended fixed fee</p>
            <p className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-white tabular-nums">
              $485,000
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/25 font-semibold">
                  Projected margin
                </p>
                <p className="mt-1 text-xl font-semibold text-white tabular-nums">42%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/25 font-semibold">
                  Realization band
                </p>
                <p className="mt-1 text-xl font-semibold text-white tabular-nums">91–94%</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-[10px] font-semibold text-white/30 mb-1.5">
                <span>CONFIDENCE</span>
                <span>87%</span>
              </div>
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div className="h-full w-[87%] rounded-full bg-emerald-400/80" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-black/25 p-4 sm:p-5 flex flex-col gap-3">
            <p className="text-[10px] uppercase tracking-wider text-white/25 font-semibold">
              Alternatives
            </p>
            {[
              { name: "Capped hourly", value: "$520k max" },
              { name: "Blended hourly", value: "$425 / hr" },
              { name: "Phased fixed", value: "4 milestones" },
            ].map((alt) => (
              <div
                key={alt.name}
                className="rounded-xl border border-white/[0.05] bg-white/[0.03] px-3 py-2.5"
              >
                <p className="text-[12px] font-medium text-white/70">{alt.name}</p>
                <p className="text-[11px] text-white/35 mt-0.5">{alt.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
          <p className="text-[11px] text-white/40">
            <span className="text-white/60 font-medium">Why this number — </span>
            12 comparable acquisitions · median fee $470k · write-off rate under 4% on similar scopes
          </p>
        </div>
      </div>
    </MockChrome>
  );
}

function ProposalsMock() {
  return (
    <MockChrome title="Proposal">
      <Sidebar active="Proposals" />
      <div className="flex flex-1 min-w-0 flex-col lg:flex-row">
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-white/[0.06]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">
                Client proposal
              </p>
              <h4 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
                Fee proposal — Project Meridian
              </h4>
              <p className="mt-1 text-[13px] text-white/40">Prepared for Meridian Holdings Ltd</p>
            </div>
            <span className="shrink-0 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/50">
              v3
            </span>
          </div>

          <div className="mt-2 rounded-2xl border border-white/[0.08] bg-[#fefefc] text-[#0a0a0a] p-5 sm:p-6 shadow-inner flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/35">
              Lysp · Confidential
            </p>
            <p className="mt-3 text-base font-semibold tracking-tight">Engagement proposal</p>
            <p className="mt-1 text-[12px] text-black/50 leading-relaxed">
              Scope, phases, and fees for the proposed share purchase transaction.
            </p>
            <div className="mt-5 space-y-2 border-t border-black/8 pt-4">
              {[
                { label: "Diligence", fee: "$185,000" },
                { label: "SPA & negotiation", fee: "$165,000" },
                { label: "Regulatory & closing", fee: "$135,000" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-[12px] font-medium">
                  <span className="text-black/60">{row.label}</span>
                  <span className="tabular-nums text-black/90">{row.fee}</span>
                </div>
              ))}
              <div className="flex justify-between text-[13px] font-semibold border-t border-black/8 pt-2 mt-2">
                <span>Total fixed fee</span>
                <span className="tabular-nums">$485,000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[260px] xl:w-[280px] p-4 sm:p-5 bg-black/20 flex flex-col gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Portal
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5">
            <p className="text-[12px] font-semibold text-white/80">Client review</p>
            <p className="mt-1 text-[11px] text-white/35 leading-relaxed">
              Meridian can review rate cards, submit counter-offers, and accept in one place.
            </p>
          </div>
          <div className="mt-auto space-y-2">
            <div className="w-full rounded-full bg-white text-[#0a0a0a] text-center text-[12px] font-semibold py-2.5">
              Send to client portal
            </div>
            <p className="text-center text-[10px] text-white/30">Partner approved · Finance cleared</p>
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

function ApprovalsMock() {
  return (
    <MockChrome title="Approvals">
      <Sidebar active="Approvals" />
      <div className="flex flex-1 min-w-0 flex-col p-4 sm:p-6 gap-5 overflow-auto">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">
            Workflow
          </p>
          <h4 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
            Two-stage approval — Project Meridian
          </h4>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {[
            { step: "01", role: "Partner", name: "E. Caldwell", status: "Approved", done: true },
            { step: "02", role: "Finance", name: "Pending review", status: "In queue", done: false },
          ].map((s) => (
            <div
              key={s.step}
              className={`flex-1 rounded-2xl border px-4 py-4 ${
                s.done
                  ? "border-emerald-400/20 bg-emerald-400/[0.06]"
                  : "border-white/[0.08] bg-white/[0.03]"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                {s.step} · {s.role}
              </p>
              <p className="mt-2 text-[14px] font-semibold text-white">{s.name}</p>
              <p
                className={`mt-1 text-[12px] font-medium ${
                  s.done ? "text-emerald-300/90" : "text-white/40"
                }`}
              >
                {s.status}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">
            <span>Event</span>
            <span>Actor</span>
            <span>Time</span>
          </div>
          {[
            { event: "Discount request — 8%", actor: "BD", time: "14:02" },
            { event: "Partner approved scope", actor: "E. Caldwell", time: "14:18" },
            { event: "Routed to Finance (>5%)", actor: "System", time: "14:18" },
          ].map((row) => (
            <div
              key={row.event}
              className="grid grid-cols-[1fr_auto_auto] gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0 text-[12px]"
            >
              <span className="text-white/70 font-medium truncate">{row.event}</span>
              <span className="text-white/35">{row.actor}</span>
              <span className="text-white/25 tabular-nums">{row.time}</span>
            </div>
          ))}
        </div>
      </div>
    </MockChrome>
  );
}

function DataRoomMock() {
  return (
    <MockChrome title="Data Room">
      <Sidebar active="Data Room" />
      <div className="flex flex-1 min-w-0 flex-col p-4 sm:p-6 gap-5 overflow-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">
              Firm intelligence
            </p>
            <h4 className="mt-1.5 text-lg font-semibold tracking-tight text-white">
              Historical matter library
            </h4>
          </div>
          <p className="text-[12px] text-white/40">
            <span className="text-white font-semibold tabular-nums">12,840</span> matters indexed
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Matters", value: "12.8k" },
            { label: "Time entries", value: "2.1M" },
            { label: "Rate cards", value: "64" },
            { label: "Mapped fields", value: "98%" },
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
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="grid grid-cols-[1.2fr_0.8fr_0.6fr_0.5fr] gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">
            <span>Source</span>
            <span>Type</span>
            <span>Status</span>
            <span>Rows</span>
          </div>
          {[
            { src: "aderant_matters_2019-25.csv", type: "CSV", status: "Mapped", rows: "8,402" },
            { src: "intapp_time_export.xlsx", type: "Excel", status: "Mapped", rows: "412k" },
            { src: "rate_card_FY26.pdf", type: "PDF", status: "Extracted", rows: "64" },
            { src: "ocg_guidelines_pack.zip", type: "Docs", status: "Processing", rows: "—" },
          ].map((row) => (
            <div
              key={row.src}
              className="grid grid-cols-[1.2fr_0.8fr_0.6fr_0.5fr] gap-2 px-4 py-3 border-b border-white/[0.04] last:border-0 text-[12px]"
            >
              <span className="text-white/75 font-medium truncate">{row.src}</span>
              <span className="text-white/35">{row.type}</span>
              <span
                className={
                  row.status === "Processing" ? "text-amber-300/80" : "text-emerald-300/80"
                }
              >
                {row.status}
              </span>
              <span className="text-white/30 tabular-nums">{row.rows}</span>
            </div>
          ))}
        </div>
      </div>
    </MockChrome>
  );
}

function UseCaseStage({ id }: { id: UseCaseId }) {
  switch (id) {
    case "scoping":
      return <ScopingMock />;
    case "pricing":
      return <PricingMock />;
    case "proposals":
      return <ProposalsMock />;
    case "approvals":
      return <ApprovalsMock />;
    case "dataroom":
      return <DataRoomMock />;
  }
}

export function PlatformSection() {
  const [active, setActive] = useState<UseCaseId>("scoping");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const current = USE_CASES.find((u) => u.id === active)!;

  const select = (id: UseCaseId) => {
    if (id === active) return;
    setActive(id);
    setFadeKey((k) => k + 1);
  };

  return (
    <section id="platform" className="relative w-full bg-[#fefefc]">
      {/* Intro — Legora-scale typography, sparse */}
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 pt-20 sm:pt-28 pb-10 sm:pb-14">
        <p className="text-[12px] font-medium tracking-[0.22em] uppercase text-[#0a0a0a]/40">
          Platform
        </p>
        <h2 className="mt-5 max-w-4xl text-balance text-[2rem] sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.08] tracking-tight text-[#0a0a0a]">
          Everything your team needs to scope, price and win work — powered by your own data.
        </h2>
        <p className="mt-5 max-w-2xl text-base sm:text-lg text-[#0a0a0a]/55 leading-relaxed font-medium">
          Built for enterprise law firms. One system from RFP to accepted proposal.
        </p>
      </div>

      {/* Use-case rail — Harvey pattern: text tabs, not pill chrome */}
      <div className="border-y border-black/[0.06]">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10">
          <div
            className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-none -mb-px"
            role="tablist"
            aria-label="Platform use cases"
          >
            {USE_CASES.map((uc) => {
              const isActive = active === uc.id;
              return (
                <button
                  key={uc.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => select(uc.id)}
                  className={`relative shrink-0 px-3 sm:px-4 py-4 sm:py-5 text-[13px] sm:text-sm font-semibold transition-colors ${
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

      {/* Copy for active use case */}
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8">
        <div
          key={`copy-${fadeKey}`}
          className={`max-w-3xl ${reduceMotion ? "" : "animate-fade-in"}`}
        >
          <h3 className="text-xl sm:text-2xl lg:text-[1.75rem] font-semibold tracking-tight text-[#0a0a0a] text-balance leading-snug">
            {current.title}
          </h3>
          <p className="mt-3 text-[15px] sm:text-base text-[#0a0a0a]/55 leading-relaxed max-w-2xl">
            {current.description}
          </p>
        </div>
      </div>

      {/* Immersive product stage — full width dark canvas */}
      <div className="bg-[#0a0f0d] pt-8 sm:pt-12 pb-16 sm:pb-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10">
          <div
            key={`stage-${fadeKey}`}
            className={reduceMotion ? "" : "animate-fade-in"}
          >
            <UseCaseStage id={active} />
          </div>
        </div>
      </div>
    </section>
  );
}
