"use client";

import React, { useState } from "react";
import type { UseCaseId } from "./useCases";

function Chrome({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-[#0c0e0d] shadow-[0_28px_80px_-36px_rgba(0,0,0,0.55)]">
      <div className="flex shrink-0 items-center gap-3 border-b border-white/[0.06] px-3.5 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="rounded-md bg-white/[0.04] px-3 py-0.5 text-[10px] font-medium tracking-wide text-white/35">
            app.lysp.ai · {title}
          </div>
        </div>
        <div className="w-8" />
      </div>
      <div className="flex min-h-0 flex-1">{children}</div>
    </div>
  );
}

const FLOW_STEPS = [
  {
    id: "scope" as const,
    label: "Scope",
    detail: {
      title: "AI Matter Scoping",
      rows: [
        { phase: "01 Diligence", hours: "420h", mix: "P 18% · SA 42% · A 40%", fee: "$185,000" },
        { phase: "02 SPA & negotiation", hours: "310h", mix: "P 24% · SA 38% · A 38%", fee: "$165,000" },
        { phase: "03 Regulatory", hours: "180h", mix: "Counsel 40% · A 60%", fee: "$95,000" },
        { phase: "04 Closing", hours: "95h", mix: "SA 30% · A 70%", fee: "$40,000" },
      ],
    },
  },
  {
    id: "price" as const,
    label: "Price",
    detail: {
      title: "Data-Driven Pricing",
      fee: "$485,000",
      confidence: 87,
      margin: 42,
      realization: "91–94%",
      comps: [
        { matter: "Helios / Northbridge", year: "2024", fee: "$470k", delta: "−3%" },
        { matter: "Vantage SPA", year: "2023", fee: "$510k", delta: "+5%" },
        { matter: "Orion cross-border", year: "2025", fee: "$455k", delta: "−6%" },
      ],
    },
  },
  {
    id: "propose" as const,
    label: "Propose",
    detail: {
      title: "Proposal Generation",
      lines: [
        { label: "Diligence", fee: "$185,000" },
        { label: "SPA & negotiation", fee: "$165,000" },
        { label: "Regulatory & closing", fee: "$135,000" },
      ],
      total: "$485,000",
    },
  },
];

function FlowPreview() {
  const [step, setStep] = useState<(typeof FLOW_STEPS)[number]["id"]>("price");
  const active = FLOW_STEPS.find((s) => s.id === step)!;

  return (
    <Chrome title="Pricing flow">
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
              Project Meridian · PR-20481
            </p>
            <p className="mt-0.5 text-[13px] text-white/55">$420M SPA · UK / DE · Close Q3</p>
          </div>
          <span className="shrink-0 rounded-full border border-white/12 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold text-white/65">
            RFP_Meridian.pdf
          </span>
        </div>

        <div className="flex items-center gap-1.5" role="tablist" aria-label="Flow steps">
          {FLOW_STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              {i > 0 ? <span className="h-px flex-1 bg-white/12" aria-hidden /> : null}
              <button
                type="button"
                role="tab"
                aria-selected={step === s.id}
                onClick={() => setStep(s.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  step === s.id
                    ? "bg-white text-[#0a0a0a]"
                    : "bg-white/[0.06] text-white/45 hover:text-white/70"
                }`}
              >
                {String(i + 1).padStart(2, "0")} {s.label}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="min-h-0 flex-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 sm:p-4 overflow-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
            {active.detail.title}
          </p>

          {step === "scope" && (
            <div className="mt-3 space-y-1.5">
              {active.detail.rows!.map((row) => (
                <div
                  key={row.phase}
                  className="grid grid-cols-[1.2fr_0.5fr_1fr_0.7fr] gap-2 rounded-lg border border-white/[0.05] px-2.5 py-2 text-[11px]"
                >
                  <span className="font-semibold text-white/85 truncate">{row.phase}</span>
                  <span className="tabular-nums text-white/45">{row.hours}</span>
                  <span className="text-white/35 truncate">{row.mix}</span>
                  <span className="tabular-nums text-white/70 text-right">{row.fee}</span>
                </div>
              ))}
              <p className="pt-2 text-[11px] text-white/40">
                1,005h total · 4 comps from Aderant 2019–25
              </p>
            </div>
          )}

          {step === "price" && (
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] text-white/35">Recommended fixed fee</p>
                  <p className="mt-0.5 text-3xl font-semibold tracking-tight text-white tabular-nums">
                    {active.detail.fee}
                  </p>
                </div>
                <div className="text-right text-[11px]">
                  <p className="text-white/70 font-semibold">{active.detail.confidence}% confidence</p>
                  <p className="text-white/40 mt-0.5">
                    Margin {active.detail.margin}% · Realization {active.detail.realization}
                  </p>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/75"
                  style={{ width: `${active.detail.confidence}%` }}
                />
              </div>
              <div className="space-y-1">
                {active.detail.comps!.map((c) => (
                  <div
                    key={c.matter}
                    className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.05] px-2.5 py-1.5 text-[11px]"
                  >
                    <span className="text-white/70 truncate">{c.matter}</span>
                    <span className="text-white/30">{c.year}</span>
                    <span className="tabular-nums text-white/80">{c.fee}</span>
                    <span className="tabular-nums text-white/40 w-10 text-right">{c.delta}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "propose" && (
            <div className="mt-3 rounded-xl bg-[#fefefc] text-[#0a0a0a] p-3.5">
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-black/35">
                Lysp · Confidential · v3
              </p>
              <p className="mt-2 text-[13px] font-semibold">Fee proposal - Meridian Holdings Ltd</p>
              <div className="mt-3 space-y-1.5 border-t border-black/8 pt-2.5">
                {active.detail.lines!.map((r) => (
                  <div key={r.label} className="flex justify-between text-[11px] font-medium">
                    <span className="text-black/55">{r.label}</span>
                    <span className="tabular-nums">{r.fee}</span>
                  </div>
                ))}
                <div className="flex justify-between text-[12px] font-semibold border-t border-black/8 pt-2">
                  <span>Total fixed fee</span>
                  <span className="tabular-nums">{active.detail.total}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Chrome>
  );
}

const NEGOTIATION_ROUNDS = [
  {
    id: 1,
    label: "Round 1",
    status: "Accepted",
    firm: "$485,000",
    client: "-",
    note: "Initial fixed-fee proposal sent",
    log: [
      { who: "BD", text: "Proposal v1 issued to portal", time: "Mar 12 · 09:14" },
      { who: "Client", text: "Opened · viewing rate card", time: "Mar 12 · 11:02" },
    ],
  },
  {
    id: 2,
    label: "Round 2",
    status: "Active",
    firm: "$465,000",
    client: "$440,000",
    note: "Client counter on volume relationship",
    log: [
      { who: "Client", text: "Counter $440k - Apex volume terms", time: "Mar 14 · 14:22" },
      { who: "Partner", text: "Accept if Finance clears ≥ 38% margin", time: "Mar 14 · 15:01" },
      { who: "Finance", text: "Cleared at 39.2% projected margin", time: "Mar 14 · 15:18" },
    ],
  },
  {
    id: 3,
    label: "Round 3",
    status: "Pending",
    firm: "$455,000",
    client: "-",
    note: "Revised offer ready to share",
    log: [
      { who: "Pricing", text: "Revised fixed fee drafted at $455k", time: "Mar 14 · 16:40" },
    ],
  },
];

function NegotiationPreview() {
  const [roundId, setRoundId] = useState(2);
  const round = NEGOTIATION_ROUNDS.find((r) => r.id === roundId)!;

  return (
    <Chrome title="Client portal">
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5 overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
              Meridian Holdings Ltd
            </p>
            <p className="mt-1 text-[15px] font-semibold text-white">Rate negotiation</p>
          </div>
          <span className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/70">
            {round.status}
          </span>
        </div>

        <div className="flex gap-1.5" role="tablist" aria-label="Negotiation rounds">
          {NEGOTIATION_ROUNDS.map((r) => (
            <button
              key={r.id}
              type="button"
              role="tab"
              aria-selected={roundId === r.id}
              onClick={() => setRoundId(r.id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                roundId === r.id
                  ? "bg-white text-[#0a0a0a]"
                  : "bg-white/[0.06] text-white/45 hover:text-white/70"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
            <p className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">
              Firm offer
            </p>
            <p className="mt-1 text-2xl font-semibold text-white tabular-nums">{round.firm}</p>
          </div>
          <div className="rounded-xl border border-white/[0.1] bg-white/[0.06] p-3">
            <p className="text-[9px] uppercase tracking-wider text-white/30 font-semibold">
              Client counter
            </p>
            <p className="mt-1 text-2xl font-semibold text-white tabular-nums">{round.client}</p>
          </div>
        </div>

        <p className="text-[11px] text-white/45">{round.note}</p>

        <div className="rounded-xl border border-white/[0.06] overflow-hidden min-h-0 flex-1 overflow-y-auto">
          {round.log.map((row) => (
            <div
              key={row.time + row.who}
              className="flex gap-3 border-b border-white/[0.04] px-3 py-2.5 last:border-0"
            >
              <span className="w-14 shrink-0 text-[10px] font-semibold text-white/45">{row.who}</span>
              <span className="flex-1 text-[11px] text-white/70 min-w-0">{row.text}</span>
              <span className="shrink-0 text-[10px] text-white/25 whitespace-nowrap">{row.time}</span>
            </div>
          ))}
        </div>
      </div>
    </Chrome>
  );
}

const DISCOUNT_CLIENTS = [
  {
    id: "apex",
    name: "Apex Global Legal",
    spend: 2_400_000,
    tier: 3,
    discount: 8,
    progress: 72,
    nextSpend: 3_000_000,
    nextDiscount: 12,
    savings: 192_000,
    matters: 18,
    remaining: 600_000,
  },
  {
    id: "north",
    name: "Northbridge Partners",
    spend: 980_000,
    tier: 2,
    discount: 5,
    progress: 49,
    nextSpend: 2_000_000,
    nextDiscount: 8,
    savings: 49_000,
    matters: 7,
    remaining: 1_020_000,
  },
  {
    id: "helix",
    name: "Helix Industrials",
    spend: 3_150_000,
    tier: 4,
    discount: 12,
    progress: 100,
    nextSpend: 3_150_000,
    nextDiscount: 12,
    savings: 378_000,
    matters: 24,
    remaining: 0,
  },
];

function formatMoney(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

function DiscountsPreview() {
  const [clientId, setClientId] = useState("apex");
  const client = DISCOUNT_CLIENTS.find((c) => c.id === clientId)!;

  return (
    <Chrome title="Volume discounts">
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5 overflow-hidden">
        <div className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DISCOUNT_CLIENTS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setClientId(c.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                clientId === c.id
                  ? "bg-white text-[#0a0a0a]"
                  : "bg-white/[0.06] text-white/45 hover:text-white/70"
              }`}
            >
              {c.name.split(" ")[0]}
            </button>
          ))}
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/30">
              Client relationship
            </p>
            <p className="mt-1 text-[15px] font-semibold text-white">{client.name}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/35">YTD spend</p>
            <p className="text-[15px] font-semibold text-white tabular-nums">
              {formatMoney(client.spend)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-semibold text-white">
              Tier {client.tier} · {client.discount}% volume discount
            </p>
            <p className="text-[11px] font-semibold text-white/70 tabular-nums">{client.progress}%</p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-white/80 transition-all duration-500"
              style={{ width: `${client.progress}%` }}
            />
          </div>
          <div className="mt-2.5 flex justify-between text-[10px] text-white/35">
            <span>Tier {client.tier}</span>
            <span className="text-white/55">
              {client.remaining > 0
                ? `Next tier at ${formatMoney(client.nextSpend)} · ${client.nextDiscount}%`
                : "Top tier reached"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Current savings", value: formatMoney(client.savings) },
            { label: "Matters counted", value: String(client.matters) },
            {
              label: "To next tier",
              value: client.remaining > 0 ? formatMoney(client.remaining) : "-",
            },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-2.5 py-2.5"
            >
              <p className="text-[8px] uppercase tracking-wider text-white/25 font-semibold">
                {m.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-white tabular-nums">{m.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Chrome>
  );
}

const ANALYTICS_PRACTICES = [
  {
    id: "all",
    label: "All",
    win: 68,
    margin: 41,
    realization: 93,
    deltaWin: "+4.2",
    deltaMargin: "+1.8",
    bars: [42, 48, 45, 55, 52, 61, 58, 67, 64, 72, 69, 78],
    rows: [
      { practice: "Corporate M&A", win: "74%", margin: "44%", status: "Strong" },
      { practice: "Banking", win: "61%", margin: "39%", status: "Stable" },
      { practice: "Tax", win: "48%", margin: "36%", status: "Watch" },
    ],
  },
  {
    id: "ma",
    label: "M&A",
    win: 74,
    margin: 44,
    realization: 95,
    deltaWin: "+6.1",
    deltaMargin: "+2.4",
    bars: [55, 58, 62, 60, 68, 71, 69, 74, 72, 78, 76, 82],
    rows: [
      { practice: "Public M&A", win: "71%", margin: "43%", status: "Strong" },
      { practice: "Private equity", win: "78%", margin: "46%", status: "Strong" },
      { practice: "Carve-outs", win: "66%", margin: "41%", status: "Stable" },
    ],
  },
  {
    id: "banking",
    label: "Banking",
    win: 61,
    margin: 39,
    realization: 91,
    deltaWin: "+1.2",
    deltaMargin: "0.0",
    bars: [50, 52, 49, 54, 53, 58, 56, 60, 59, 62, 61, 63],
    rows: [
      { practice: "Leveraged finance", win: "64%", margin: "40%", status: "Stable" },
      { practice: "DCM", win: "58%", margin: "38%", status: "Stable" },
      { practice: "Restructuring", win: "55%", margin: "37%", status: "Watch" },
    ],
  },
  {
    id: "tax",
    label: "Tax",
    win: 48,
    margin: 36,
    realization: 88,
    deltaWin: "−3.4",
    deltaMargin: "−1.1",
    bars: [58, 55, 52, 50, 49, 47, 48, 46, 45, 44, 46, 48],
    rows: [
      { practice: "Transfer pricing", win: "52%", margin: "37%", status: "Watch" },
      { practice: "Controversy", win: "44%", margin: "34%", status: "Alert" },
      { practice: "Advisory", win: "51%", margin: "38%", status: "Watch" },
    ],
  },
];

function AnalyticsPreview() {
  const [practiceId, setPracticeId] = useState("all");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const practice = ANALYTICS_PRACTICES.find((p) => p.id === practiceId)!;

  return (
    <Chrome title="Pricing analytics">
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[13px] font-semibold text-white">Q1 pricing performance</p>
          <div className="flex gap-1" role="tablist" aria-label="Practice filter">
            {ANALYTICS_PRACTICES.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={practiceId === p.id}
                onClick={() => setPracticeId(p.id)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                  practiceId === p.id
                    ? "bg-white text-[#0a0a0a]"
                    : "bg-white/[0.06] text-white/45 hover:text-white/70"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Win rate", value: `${practice.win}%`, delta: `${practice.deltaWin} pts` },
            {
              label: "Avg margin",
              value: `${practice.margin}%`,
              delta: `${practice.deltaMargin} pts`,
            },
            { label: "Realization", value: `${practice.realization}%`, delta: "vs FY25" },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-2.5 py-2.5"
            >
              <p className="text-[8px] uppercase tracking-wider text-white/25 font-semibold">
                {m.label}
              </p>
              <p className="mt-1 text-lg font-semibold text-white tabular-nums">{m.value}</p>
              <p className="mt-0.5 text-[10px] text-white/45">{m.delta}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-white/50">Win rate by week</p>
            <p className="text-[10px] text-white/35 tabular-nums">
              {hoveredBar !== null
                ? `W${hoveredBar + 1}: ${practice.bars[hoveredBar]}%`
                : "Hover a bar"}
            </p>
          </div>
          <div className="mt-3 flex flex-1 items-end gap-1 min-h-[64px]">
            {practice.bars.map((h, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Week ${i + 1}: ${h}%`}
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
                onFocus={() => setHoveredBar(i)}
                onBlur={() => setHoveredBar(null)}
                className="flex-1 rounded-sm bg-white/30 transition-opacity hover:bg-white/55 focus:outline-none focus:bg-white/55"
                style={{
                  height: `${h}%`,
                  opacity: hoveredBar === null || hoveredBar === i ? 0.85 : 0.3,
                }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
          {practice.rows.map((row) => (
            <div
              key={row.practice}
              className="grid grid-cols-[1.4fr_0.6fr_0.6fr_0.7fr] gap-2 border-b border-white/[0.04] px-3 py-2 last:border-0 text-[11px]"
            >
              <span className="text-white/75 font-medium truncate">{row.practice}</span>
              <span className="text-white/45 tabular-nums">{row.win}</span>
              <span className="text-white/45 tabular-nums">{row.margin}</span>
              <span className="text-white/55">{row.status}</span>
            </div>
          ))}
        </div>
      </div>
    </Chrome>
  );
}

export function FeaturePreview({ id }: { id: UseCaseId }) {
  switch (id) {
    case "flow":
      return <FlowPreview />;
    case "negotiation":
      return <NegotiationPreview />;
    case "discounts":
      return <DiscountsPreview />;
    case "analytics":
      return <AnalyticsPreview />;
  }
}
