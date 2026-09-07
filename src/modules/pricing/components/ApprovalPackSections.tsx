"use client";

import { useState } from "react";
import { HiChevronDown, HiChevronRight } from "react-icons/hi";
import type { ApprovalPack } from "../types";

function formatMoney(amount: number | null, currency: string) {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}

const GUARDRAIL_LABEL: Record<string, string> = {
  PASS: "Above floor",
  AT_FLOOR: "At floor",
  BELOW_FLOOR: "Below floor",
};

const GUARDRAIL_STYLE: Record<string, string> = {
  PASS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  AT_FLOOR: "bg-amber-50 text-amber-700 border-amber-200",
  BELOW_FLOOR: "bg-red-50 text-red-700 border-red-200",
};

const APPROVAL_LEVEL_LABEL: Record<string, string> = {
  AUTO: "Auto",
  PARTNER: "Partner",
  COMMITTEE: "Committee",
};

interface GuardrailStripProps {
  pack: ApprovalPack;
  currency: string;
}

export function GuardrailStrip({ pack, currency }: GuardrailStripProps) {
  const isBelowFloor = pack.guardrailStatus === "BELOW_FLOOR";
  const badgeStyle = GUARDRAIL_STYLE[pack.guardrailStatus] ?? GUARDRAIL_STYLE.PASS;
  const badgeLabel = GUARDRAIL_LABEL[pack.guardrailStatus] ?? pack.guardrailStatus;
  const levelLabel = APPROVAL_LEVEL_LABEL[pack.discountApprovalLevel] ?? pack.discountApprovalLevel;

  const facts = [
    {
      label: "Margin vs floor",
      value:
        pack.marginPct != null
          ? `${pack.marginPct.toFixed(1)}%${
              pack.marginHeadroomPts != null
                ? ` (${pack.marginHeadroomPts >= 0 ? "+" : ""}${pack.marginHeadroomPts.toFixed(1)} pts)`
                : ""
            }`
          : "—",
    },
    { label: "Discount", value: pack.discountPct != null ? `${pack.discountPct.toFixed(1)}%` : "—" },
    { label: "Approval level", value: levelLabel },
    { label: "Comparables", value: String(pack.comparableCount) },
  ];

  return (
    <div
      className={`rounded-2xl border bg-surface px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 ${
        isBelowFloor ? "border-red-200" : "border-border"
      }`}
    >
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${badgeStyle}`}
      >
        {badgeLabel}
      </span>
      {facts.map((f) => (
        <div key={f.label} className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/35">
            {f.label}
          </p>
          <p className="text-sm font-semibold tabular-nums text-ink">{f.value}</p>
        </div>
      ))}
    </div>
  );
}

export function ClientContextSection({ pack }: { pack: ApprovalPack }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
      {pack.clientTier && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider bg-field text-ink/70 border-border">
          {pack.clientTier}
        </span>
      )}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/35">
          Prior matters
        </p>
        <p className="text-sm font-semibold tabular-nums text-ink">{pack.clientMatterCount}</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/35">
          Avg. margin on wins
        </p>
        <p className="text-sm font-semibold tabular-nums text-ink">
          {pack.clientAvgMarginPct != null ? `${pack.clientAvgMarginPct.toFixed(1)}%` : "—"}
        </p>
      </div>
    </div>
  );
}

export function ScopeSummarySection({ pack, currency }: { pack: ApprovalPack; currency: string }) {
  const [open, setOpen] = useState(false);
  const byType = new Map<string, string[]>();
  for (const a of pack.assumptions) {
    if (!byType.has(a.type)) byType.set(a.type, []);
    byType.get(a.type)!.push(a.text);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-hover transition-colors"
      >
        <span className="text-sm font-semibold text-ink">
          Scope · {pack.phaseCount} phase{pack.phaseCount === 1 ? "" : "s"} ·{" "}
          {Number(pack.totalHours).toFixed(0)} hours
        </span>
        {open ? (
          <HiChevronDown className="w-4 h-4 text-ink/40 shrink-0" />
        ) : (
          <HiChevronRight className="w-4 h-4 text-ink/40 shrink-0" />
        )}
      </button>
      {open && (
        <div className="border-t border-border/60 px-5 py-4 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] min-w-[420px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-ink/35">
                  <th className="font-semibold px-1 py-1.5">Phase</th>
                  <th className="font-semibold px-1 py-1.5 text-right">Tasks</th>
                  <th className="font-semibold px-1 py-1.5 text-right">Hours</th>
                  <th className="font-semibold px-1 py-1.5 text-right">Fee portion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {pack.phases.map((p) => (
                  <tr key={p.name}>
                    <td className="px-1 py-2 font-medium text-ink/85">{p.name}</td>
                    <td className="px-1 py-2 text-right tabular-nums text-ink/55">{p.taskCount}</td>
                    <td className="px-1 py-2 text-right tabular-nums text-ink/55">
                      {Number(p.hours).toFixed(1)}
                    </td>
                    <td className="px-1 py-2 text-right tabular-nums text-ink/70">
                      {formatMoney(p.feePortion, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {byType.size > 0 && (
            <div className="space-y-2.5">
              {[...byType.entries()].map(([type, texts]) => (
                <div key={type}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/35 mb-1">
                    {type.toLowerCase()}
                  </p>
                  <ul className="space-y-1">
                    {texts.map((t, i) => (
                      <li key={i} className="text-[12px] text-ink/60 leading-relaxed">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
