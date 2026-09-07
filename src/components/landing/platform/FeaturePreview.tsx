"use client";

import React, { useState } from "react";
import type { UseCaseId } from "./useCases";

/** Premium marketing instrument: black / paper. */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-[1.75rem] border border-white/[0.1] bg-[#0c0e0d] text-[#fefefc] shadow-[0_40px_100px_-48px_rgba(0,0,0,0.7)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(254,254,252,0.06),transparent_45%)]"
      />
      <div className="relative flex h-full min-h-0 flex-col">{children}</div>
    </div>
  );
}

function StageLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
      {children}
    </p>
  );
}

/** Fine underline tabs inside the UI stage. */
function FineTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div
      className="flex gap-0 border-b border-white/[0.08] px-5 sm:px-7"
      role="tablist"
      aria-label={label}
    >
      {tabs.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`relative px-3.5 sm:px-4 py-3.5 text-[12px] sm:text-[13px] font-semibold tracking-tight transition-colors cursor-pointer ${
              active ? "text-[#fefefc]" : "text-white/40 hover:text-white/70"
            }`}
          >
            {tab.label}
            <span
              className={`absolute inset-x-3 sm:inset-x-4 bottom-0 h-[1.5px] transition-opacity ${
                active ? "bg-[#fefefc] opacity-100" : "opacity-0"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

function StageHeader({
  kicker,
  title,
  meta,
  badge,
}: {
  kicker: string;
  title: string;
  meta?: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 sm:px-7 pt-5 sm:pt-6 pb-1">
      <div className="min-w-0">
        <StageLabel>{kicker}</StageLabel>
        <p className="mt-1.5 text-[17px] sm:text-[18px] font-semibold tracking-tight truncate">
          {title}
        </p>
        {meta ? <p className="mt-0.5 text-[13px] text-white/40 truncate">{meta}</p> : null}
      </div>
      {badge ? (
        <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold text-white/70">
          {badge}
        </span>
      ) : null}
    </div>
  );
}

type PricingTab = "brief" | "scope" | "fee" | "proposal";

function PricingMock() {
  const [tab, setTab] = useState<PricingTab>("scope");

  return (
    <Stage>
      <StageHeader
        kicker="Pricing request"
        title="Project Meridian SPA"
        meta="Meridian Holdings Ltd · $420M · UK / DE"
        badge="Ready to price"
      />
      <FineTabs
        label="Pricing stages"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "brief", label: "Brief" },
          { id: "scope", label: "Scope" },
          { id: "fee", label: "Fee" },
          { id: "proposal", label: "Proposal" },
        ]}
      />
      <div className="min-h-0 flex-1 overflow-hidden p-5 sm:p-7">
        {tab === "brief" && (
          <div className="grid h-full grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4">
                <p className="text-[11px] font-semibold text-white/35">Lysp</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/70">
                  Cross-border SPA. Diligence, negotiation, dual regulatory, close Q3. Attach the RFP
                  and I will build the phases.
                </p>
              </div>
              <div className="rounded-2xl bg-[#fefefc] p-4 text-[#0a0a0a]">
                <p className="text-[11px] font-semibold text-black/40">Partner</p>
                <p className="mt-1.5 text-[13px] leading-relaxed">
                  Standard DD plus SPA. Exclude antitrust filing. Dual jurisdiction is the risk.
                </p>
              </div>
              <p className="text-[11px] text-white/30">RFP_Meridian.pdf · OCG_Apex.pdf</p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 flex flex-col justify-between">
              <div>
                <StageLabel>Matter facts</StageLabel>
                <ul className="mt-4 space-y-3 text-[13px]">
                  {[
                    ["Practice", "Corporate M&A"],
                    ["Fee type", "Fixed fee"],
                    ["Close", "Q3 2026"],
                    ["Jurisdictions", "UK · Germany"],
                  ].map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-3 border-b border-white/[0.06] pb-2">
                      <span className="text-white/40">{k}</span>
                      <span className="font-medium text-white/80">{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {tab === "scope" && (
          <div className="flex h-full flex-col gap-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
              <div>
                <p className="text-[13px] font-semibold">Scoped matter</p>
                <p className="mt-0.5 text-[11px] text-white/35">1,005h · 4 comps from firm history</p>
              </div>
              <p className="text-[28px] font-semibold tabular-nums tracking-tight">87%</p>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-hidden">
              {[
                { phase: "01 Diligence", mix: "P 18% · SA 42% · A 40%", hrs: "420h", fee: "$185,000" },
                { phase: "02 SPA & negotiation", mix: "P 24% · SA 38% · A 38%", hrs: "310h", fee: "$165,000" },
                { phase: "03 Regulatory", mix: "Counsel 40% · A 60%", hrs: "180h", fee: "$95,000" },
                { phase: "04 Closing", mix: "SA 30% · A 70%", hrs: "95h", fee: "$40,000" },
              ].map((row) => (
                <div
                  key={row.phase}
                  className="grid grid-cols-[1.3fr_1fr_0.55fr_0.85fr] gap-2 rounded-xl border border-white/[0.06] px-3.5 py-2.5 text-[12px]"
                >
                  <span className="font-semibold text-white/85 truncate">{row.phase}</span>
                  <span className="text-white/35 truncate">{row.mix}</span>
                  <span className="tabular-nums text-white/45">{row.hrs}</span>
                  <span className="tabular-nums text-right font-semibold text-white/80">{row.fee}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full border border-white/12 px-2.5 py-1 text-[10px] text-white/55">
                Included · Standard DD
              </span>
              <span className="rounded-full border border-white/12 px-2.5 py-1 text-[10px] text-white/55">
                Excluded · Antitrust
              </span>
              <span className="rounded-full border border-white/12 px-2.5 py-1 text-[10px] text-white/55">
                Risk · Dual jurisdiction
              </span>
            </div>
          </div>
        )}

        {tab === "fee" && (
          <div className="flex h-full flex-col">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <p className="text-[13px] text-white/40">Recommended fixed fee</p>
                <p className="mt-1 text-[3.25rem] sm:text-5xl font-semibold tracking-tight tabular-nums leading-none">
                  $485,000
                </p>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
                {[
                  ["Margin", "42%"],
                  ["Realization", "91 to 94%"],
                  ["vs comps", "+3%"],
                  ["Floor", "38%"],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider font-semibold">
                      {k}
                    </p>
                    <p className="mt-0.5 font-semibold tabular-nums">{v}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-4 text-[12px] text-white/35">
              Above minimum target profit margin · Active rate card USD 2026
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { matter: "Helios / Northbridge", year: "2024", fee: "$470k", delta: "−3%" },
                { matter: "Vantage SPA", year: "2023", fee: "$510k", delta: "+5%" },
                { matter: "Orion cross-border", year: "2025", fee: "$455k", delta: "−6%" },
              ].map((c) => (
                <div
                  key={c.matter}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-3"
                >
                  <p className="truncate text-[12px] font-medium text-white/80">{c.matter}</p>
                  <div className="mt-1 flex justify-between text-[11px] text-white/35">
                    <span>{c.year}</span>
                    <span className="tabular-nums text-white/60">{c.fee}</span>
                    <span className="tabular-nums">{c.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "proposal" && (
          <div className="flex h-full items-start justify-center">
            <div className="w-full max-w-md rounded-2xl bg-[#fefefc] text-[#0a0a0a] p-5 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/35">
                Confidential · Fee proposal v3
              </p>
              <p className="mt-3 text-[16px] font-semibold tracking-tight">Meridian Holdings Ltd</p>
              <p className="mt-1 text-[13px] text-black/45">
                Project Meridian SPA · Fixed fee engagement
              </p>
              <div className="mt-5 space-y-2.5 border-t border-black/[0.08] pt-4">
                {[
                  { label: "Diligence", fee: "$185,000" },
                  { label: "SPA & negotiation", fee: "$165,000" },
                  { label: "Regulatory & closing", fee: "$135,000" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-[13px]">
                    <span className="text-black/50">{r.label}</span>
                    <span className="font-semibold tabular-nums">{r.fee}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-black/[0.08] pt-3 text-[15px] font-semibold">
                  <span>Total fixed fee</span>
                  <span className="tabular-nums">$485,000</span>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-black/40 leading-relaxed">
                Valid 30 days · Subject to engagement letter · OCG terms applied
              </p>
            </div>
          </div>
        )}
      </div>
    </Stage>
  );
}

type NegTab = "offer" | "trail" | "approvals";

const NEG_ROUNDS = [
  {
    id: 1,
    label: "R1",
    status: "Sent",
    firm: "$485,000",
    client: "-",
    margin: "42.0%",
    note: "Initial fixed-fee proposal issued to portal",
    log: [
      { who: "BD", text: "Proposal v1 shared with client contacts", time: "Mar 12 · 09:14" },
      { who: "Client", text: "Opened proposal · viewing phase breakdown", time: "Mar 12 · 11:02" },
    ],
  },
  {
    id: 2,
    label: "R2",
    status: "Active",
    firm: "$465,000",
    client: "$440,000",
    margin: "39.2%",
    note: "Client counter cites Apex volume relationship",
    log: [
      { who: "Client", text: "Counter $440k · request volume tier credit", time: "Mar 14 · 14:22" },
      { who: "Partner", text: "Accept path if Finance clears ≥ 38% margin", time: "Mar 14 · 15:01" },
      { who: "Finance", text: "Projected margin 39.2% · cleared", time: "Mar 14 · 15:18" },
      { who: "Pricing", text: "Revised offer drafted at $455k", time: "Mar 14 · 16:40" },
    ],
  },
  {
    id: 3,
    label: "R3",
    status: "Accepted",
    firm: "$455,000",
    client: "$455,000",
    margin: "39.8%",
    note: "Client accepted revised fixed fee",
    log: [
      { who: "BD", text: "Revised offer $455k shared to portal", time: "Mar 15 · 10:05" },
      { who: "Client", text: "Accepted · engagement to follow", time: "Mar 15 · 14:41" },
    ],
  },
];

function NegotiationMock() {
  const [tab, setTab] = useState<NegTab>("offer");
  const [roundId, setRoundId] = useState(2);
  const round = NEG_ROUNDS.find((r) => r.id === roundId)!;

  return (
    <Stage>
      <StageHeader
        kicker="Client portal"
        title="Meridian Holdings Ltd"
        meta="Rate negotiation · Project Meridian SPA"
        badge={round.status}
      />
      <FineTabs
        label="Negotiation views"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "offer", label: "Offer" },
          { id: "trail", label: "Trail" },
          { id: "approvals", label: "Approvals" },
        ]}
      />

      <div className="flex shrink-0 gap-1.5 px-5 sm:px-7 pt-4">
        {NEG_ROUNDS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRoundId(r.id)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold cursor-pointer ${
              roundId === r.id
                ? "bg-[#fefefc] text-[#0a0a0a]"
                : "bg-white/[0.05] text-white/40 hover:text-white/70"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-5 sm:p-7 pt-4">
        {tab === "offer" && (
          <div className="flex h-full flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
                <StageLabel>Firm offer</StageLabel>
                <p className="mt-3 text-[2rem] sm:text-[2.5rem] font-semibold tabular-nums tracking-tight leading-none">
                  {round.firm}
                </p>
                <p className="mt-3 text-[12px] text-white/35">Projected margin {round.margin}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.12] bg-white/[0.06] p-5">
                <StageLabel>Client counter</StageLabel>
                <p className="mt-3 text-[2rem] sm:text-[2.5rem] font-semibold tabular-nums tracking-tight leading-none">
                  {round.client}
                </p>
                <p className="mt-3 text-[12px] text-white/35">Portal submission</p>
              </div>
            </div>
            <p className="text-[13px] text-white/50 leading-relaxed">{round.note}</p>
            <div className="mt-auto grid grid-cols-3 gap-2">
              {[
                ["Delta", round.client === "-" ? "-" : "−$25k"],
                ["Rounds", String(round.id)],
                ["Floor", "38%"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-3"
                >
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-white/30">
                    {k}
                  </p>
                  <p className="mt-1 text-[14px] font-semibold tabular-nums">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "trail" && (
          <div className="h-full overflow-hidden rounded-2xl border border-white/[0.07]">
            <div className="border-b border-white/[0.06] px-4 py-2.5 text-[11px] text-white/35">
              Attributable actions · Round {round.id}
            </div>
            {round.log.map((row) => (
              <div
                key={row.time + row.who}
                className="flex gap-3 border-b border-white/[0.05] px-4 py-3.5 last:border-0"
              >
                <span className="w-16 shrink-0 text-[11px] font-semibold text-white/40">{row.who}</span>
                <span className="min-w-0 flex-1 text-[13px] text-white/75">{row.text}</span>
                <span className="shrink-0 text-[11px] tabular-nums text-white/25">{row.time}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "approvals" && (
          <div className="flex h-full flex-col gap-3">
            {[
              {
                role: "Partner",
                name: "E. Hartwell",
                status: roundId >= 2 ? "Cleared" : "Pending",
                detail: "Commercial acceptance subject to floor",
              },
              {
                role: "Finance",
                name: "Pricing desk",
                status: roundId >= 2 ? "Cleared" : "Waiting",
                detail: `Margin check · floor 38% · actual ${round.margin}`,
              },
              {
                role: "Committee",
                name: "Not required",
                status: "N/A",
                detail: "Auto-route: under partner-approval band",
              },
            ].map((row) => (
              <div
                key={row.role}
                className="flex items-start justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4"
              >
                <div>
                  <p className="text-[13px] font-semibold">{row.role}</p>
                  <p className="mt-0.5 text-[12px] text-white/40">{row.name}</p>
                  <p className="mt-2 text-[12px] text-white/55 leading-snug">{row.detail}</p>
                </div>
                <span className="shrink-0 rounded-full border border-white/12 px-2.5 py-1 text-[10px] font-semibold text-white/65">
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Stage>
  );
}

type DiscTab = "overview" | "tiers" | "matters";

const DISCOUNT_BOOKS = [
  {
    id: "apex",
    name: "Apex Global Legal",
    spend: 2_400_000,
    spendLabel: "$2.4M",
    tier: 3,
    discount: 8,
    progress: 72,
    nextSpend: "$3.0M",
    nextDiscount: 12,
    savings: "$192k",
    matters: 18,
    remaining: "$600k",
    bands: [
      { tier: 1, from: "$0", to: "$1.0M", pct: "3%" },
      { tier: 2, from: "$1.0M", to: "$2.0M", pct: "5%" },
      { tier: 3, from: "$2.0M", to: "$3.0M", pct: "8%", active: true },
      { tier: 4, from: "$3.0M", to: "+", pct: "12%" },
    ],
    recent: [
      { matter: "Apex refinance", fee: "$420k", when: "Feb 2026" },
      { matter: "Panel counsel Q4", fee: "$310k", when: "Jan 2026" },
      { matter: "Cross-border JV", fee: "$680k", when: "Nov 2025" },
    ],
  },
  {
    id: "helix",
    name: "Helix Industrials",
    spend: 3_150_000,
    spendLabel: "$3.2M",
    tier: 4,
    discount: 12,
    progress: 100,
    nextSpend: "-",
    nextDiscount: 12,
    savings: "$378k",
    matters: 24,
    remaining: "-",
    bands: [
      { tier: 1, from: "$0", to: "$1.0M", pct: "3%" },
      { tier: 2, from: "$1.0M", to: "$2.0M", pct: "5%" },
      { tier: 3, from: "$2.0M", to: "$3.0M", pct: "8%" },
      { tier: 4, from: "$3.0M", to: "+", pct: "12%", active: true },
    ],
    recent: [
      { matter: "Plant sale SPA", fee: "$520k", when: "Mar 2026" },
      { matter: "Supply contract", fee: "$190k", when: "Feb 2026" },
      { matter: "Dispute phase 2", fee: "$410k", when: "Dec 2025" },
    ],
  },
];

function DiscountsMock() {
  const [tab, setTab] = useState<DiscTab>("overview");
  const [bookId, setBookId] = useState("apex");
  const book = DISCOUNT_BOOKS.find((c) => c.id === bookId)!;

  return (
    <Stage>
      <div className="flex items-start justify-between gap-4 px-5 sm:px-7 pt-5 sm:pt-6 pb-1">
        <div>
          <StageLabel>Volume relationship</StageLabel>
          <p className="mt-1.5 text-[17px] sm:text-[18px] font-semibold tracking-tight">{book.name}</p>
        </div>
        <div className="flex gap-1.5">
          {DISCOUNT_BOOKS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setBookId(c.id)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold cursor-pointer ${
                bookId === c.id
                  ? "bg-[#fefefc] text-[#0a0a0a]"
                  : "bg-white/[0.05] text-white/40"
              }`}
            >
              {c.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <FineTabs
        label="Volume views"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "tiers", label: "Tiers" },
          { id: "matters", label: "Matters" },
        ]}
      />

      <div className="min-h-0 flex-1 overflow-hidden p-5 sm:p-7">
        {tab === "overview" && (
          <div className="flex h-full flex-col">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[13px] text-white/40">YTD spend</p>
                <p className="mt-1 text-[3rem] sm:text-[3.5rem] font-semibold tracking-tight tabular-nums leading-none">
                  {book.spendLabel}
                </p>
              </div>
              <div className="text-right pb-1">
                <p className="text-[14px] font-semibold">
                  Tier {book.tier} · {book.discount}%
                </p>
                <p className="mt-1 text-[12px] text-white/35">
                  {book.remaining === "-"
                    ? "Top tier reached"
                    : `${book.remaining} to ${book.nextDiscount}%`}
                </p>
              </div>
            </div>
            <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-[#fefefc] transition-all duration-500"
                style={{ width: `${book.progress}%` }}
              />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2">
              {[
                ["Savings", book.savings],
                ["Matters", String(book.matters)],
                ["Progress", `${book.progress}%`],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-4"
                >
                  <StageLabel>{k}</StageLabel>
                  <p className="mt-2 text-[1.35rem] font-semibold tabular-nums tracking-tight">{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-auto pt-6 text-[12px] text-white/35 leading-relaxed">
              Same number for BD and finance. Updates as matters close.
            </p>
          </div>
        )}

        {tab === "tiers" && (
          <div className="space-y-2">
            {book.bands.map((b) => (
              <div
                key={b.tier}
                className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 ${
                  b.active
                    ? "border-white/25 bg-white/[0.08]"
                    : "border-white/[0.07] bg-white/[0.02]"
                }`}
              >
                <div>
                  <p className="text-[13px] font-semibold">
                    Tier {b.tier}
                    {b.active ? " · current" : ""}
                  </p>
                  <p className="mt-0.5 text-[12px] text-white/40">
                    {b.from} to {b.to}
                  </p>
                </div>
                <p className="text-[18px] font-semibold tabular-nums">{b.pct}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "matters" && (
          <div className="h-full overflow-hidden rounded-2xl border border-white/[0.07]">
            <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr] gap-2 border-b border-white/[0.06] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
              <span>Counted matter</span>
              <span>Fee</span>
              <span>Closed</span>
            </div>
            {book.recent.map((m) => (
              <div
                key={m.matter}
                className="grid grid-cols-[1.4fr_0.7fr_0.7fr] gap-2 border-b border-white/[0.05] px-4 py-3.5 last:border-0 text-[13px]"
              >
                <span className="font-medium text-white/80 truncate">{m.matter}</span>
                <span className="tabular-nums text-white/55">{m.fee}</span>
                <span className="text-white/40">{m.when}</span>
              </div>
            ))}
            <p className="px-4 py-3 text-[11px] text-white/30">
              {book.matters} matters counted YTD · only closed work advances the tier
            </p>
          </div>
        )}
      </div>
    </Stage>
  );
}

type AnalyticsTab = "performance" | "practices" | "leakage";

const ANALYTICS = {
  performance: {
    win: "68%",
    margin: "41%",
    realization: "93%",
    deltaWin: "+4.2 pts",
    deltaMargin: "+1.8 pts",
    bars: [42, 48, 45, 55, 52, 61, 58, 67, 64, 72, 69, 78],
  },
  practices: [
    { name: "Corporate M&A", win: "74%", margin: "44%", realization: "95%", status: "Strong" },
    { name: "Banking", win: "61%", margin: "39%", realization: "91%", status: "Stable" },
    { name: "Litigation", win: "57%", margin: "38%", realization: "89%", status: "Stable" },
    { name: "Tax", win: "48%", margin: "36%", realization: "88%", status: "Watch" },
    { name: "Employment", win: "52%", margin: "37%", realization: "90%", status: "Watch" },
  ],
  leakage: [
    { signal: "Underpricing vs comps", desk: "Tax · Controversy", impact: "$1.2M", severity: "Alert" },
    { signal: "Write-down drift", desk: "Employment", impact: "$480k", severity: "Watch" },
    { signal: "Discount above band", desk: "Banking · DCM", impact: "$310k", severity: "Watch" },
    { signal: "Slow quote cycle", desk: "Litigation", impact: "4.2 days", severity: "Stable" },
  ],
};

function AnalyticsMock() {
  const [tab, setTab] = useState<AnalyticsTab>("performance");
  const [hover, setHover] = useState<number | null>(null);
  const perf = ANALYTICS.performance;

  return (
    <Stage>
      <StageHeader
        kicker="Pricing analytics"
        title="Q1 pricing performance"
        meta="Firm rollup · filterable by practice"
      />
      <FineTabs
        label="Analytics views"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "performance", label: "Performance" },
          { id: "practices", label: "Practices" },
          { id: "leakage", label: "Leakage" },
        ]}
      />

      <div className="min-h-0 flex-1 overflow-hidden p-5 sm:p-7">
        {tab === "performance" && (
          <div className="flex h-full flex-col gap-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Win rate", value: perf.win, delta: perf.deltaWin },
                { label: "Avg margin", value: perf.margin, delta: perf.deltaMargin },
                { label: "Realization", value: perf.realization, delta: "vs FY25" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 sm:px-4 py-4"
                >
                  <StageLabel>{m.label}</StageLabel>
                  <p className="mt-2 text-[1.5rem] sm:text-[1.85rem] font-semibold tabular-nums tracking-tight">
                    {m.value}
                  </p>
                  <p className="mt-1 text-[11px] text-white/40">{m.delta}</p>
                </div>
              ))}
            </div>
            <div className="min-h-0 flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 flex flex-col">
              <div className="flex justify-between text-[11px] text-white/35">
                <span>Win rate by week</span>
                <span className="tabular-nums">
                  {hover !== null ? `W${hover + 1}: ${perf.bars[hover]}%` : "Hover"}
                </span>
              </div>
              <div className="mt-4 flex flex-1 items-end gap-1.5 min-h-[100px]">
                {perf.bars.map((h, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Week ${i + 1}`}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    className="flex-1 rounded-sm bg-white/55 transition-opacity cursor-pointer hover:bg-white"
                    style={{
                      height: `${h}%`,
                      opacity: hover === null || hover === i ? 1 : 0.28,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "practices" && (
          <div className="h-full overflow-hidden rounded-2xl border border-white/[0.07]">
            <div className="grid grid-cols-[1.3fr_0.55fr_0.55fr_0.55fr_0.7fr] gap-2 border-b border-white/[0.06] bg-white/[0.03] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-white/30">
              <span>Practice</span>
              <span>Win</span>
              <span>Margin</span>
              <span>Real.</span>
              <span>Status</span>
            </div>
            {ANALYTICS.practices.map((row) => (
              <div
                key={row.name}
                className="grid grid-cols-[1.3fr_0.55fr_0.55fr_0.55fr_0.7fr] gap-2 border-b border-white/[0.05] px-4 py-3 last:border-0 text-[12px] sm:text-[13px]"
              >
                <span className="font-medium text-white/80 truncate">{row.name}</span>
                <span className="tabular-nums text-white/50">{row.win}</span>
                <span className="tabular-nums text-white/50">{row.margin}</span>
                <span className="tabular-nums text-white/50">{row.realization}</span>
                <span className="text-white/55">{row.status}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "leakage" && (
          <div className="flex h-full flex-col gap-2">
            {ANALYTICS.leakage.map((row) => (
              <div
                key={row.signal}
                className="flex items-start justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-white/90">{row.signal}</p>
                  <p className="mt-1 text-[12px] text-white/40">{row.desk}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[14px] font-semibold tabular-nums">{row.impact}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                    {row.severity}
                  </p>
                </div>
              </div>
            ))}
            <p className="mt-auto pt-2 text-[12px] text-white/30 leading-relaxed">
              Flags surface before write-downs compound. Drill into the desk that moved the number.
            </p>
          </div>
        )}
      </div>
    </Stage>
  );
}

export function FeaturePreview({ id }: { id: UseCaseId }) {
  switch (id) {
    case "flow":
      return <PricingMock />;
    case "negotiation":
      return <NegotiationMock />;
    case "discounts":
      return <DiscountsMock />;
    case "analytics":
      return <AnalyticsMock />;
  }
}
