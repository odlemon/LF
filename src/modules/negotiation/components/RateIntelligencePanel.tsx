"use client";

import React, { useMemo } from "react";
import type { RateLevelDraft } from "@/modules/negotiation/types";
import type {
  NegotiationRateIntelligence,
  RateLevelIntelligence,
} from "@/modules/analytics/types";

interface Props {
  intelligence: NegotiationRateIntelligence | null;
  isLoading: boolean;
  /** The rates currently on screen, so the comparison is against what the partner is about to send. */
  drafts: RateLevelDraft[];
  currency: string;
}

function money(value: number | null | undefined, currency: string): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Percentage difference of the draft rate against a reference, or null when either is missing. */
function delta(draft: number | undefined, reference: number | null): number | null {
  if (draft === undefined || draft <= 0 || reference === null || reference <= 0) return null;
  return ((draft - reference) / reference) * 100;
}

function DeltaChip({ value }: { value: number | null }) {
  if (value === null) return <span className="text-ink/60">—</span>;
  const rounded = Math.round(value * 10) / 10;
  if (Math.abs(rounded) < 0.05) {
    return <span className="text-ink/60 tabular-nums">on</span>;
  }
  // Above a reference is not automatically good or bad, so this stays neutral in tone:
  // it reports direction and size, and lets the partner judge.
  const tone = rounded > 0 ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50";
  return (
    <span className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${tone}`}>
      {rounded > 0 ? "+" : ""}
      {rounded}%
    </span>
  );
}

/**
 * Rate intelligence beside the rate editor.
 *
 * <p>The firm already computed recommendations and holds every rate a client has agreed, but
 * that lived on separate analytics pages nobody opens mid-negotiation. This puts it next to
 * the field being edited, compared against the draft rather than against the sent offer.
 */
export function RateIntelligencePanel({ intelligence, isLoading, drafts, currency }: Props) {
  const draftByCode = useMemo(() => {
    const map = new Map<string, number>();
    drafts.forEach((d) => {
      if (d.feeEarnerLevelCode) map.set(d.feeEarnerLevelCode, d.hourlyRate);
    });
    return map;
  }, [drafts]);

  if (isLoading) {
    return (
      <div className="rounded-[1.25rem] border border-border bg-surface p-5">
        <div className="h-4 w-40 animate-pulse rounded bg-field" />
        <div className="mt-4 h-32 animate-pulse rounded-xl bg-field/60" />
      </div>
    );
  }

  if (!intelligence || intelligence.levels.length === 0) {
    return null;
  }

  const hasAnyReference = intelligence.levels.some(
    (l) =>
      l.recommendedRate !== null ||
      l.marketMedian !== null ||
      l.clientAgreedAvgRate !== null ||
      l.practiceAgreedAvgRate !== null
  );
  if (!hasAnyReference) {
    return (
      <div className="rounded-[1.25rem] border border-border bg-surface p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
          Rate intelligence
        </p>
        <p className="mt-3 text-sm text-ink/60">
          Nothing to compare against yet. Once this firm has settled matters and benchmark data,
          card, recommended and historically-agreed rates appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.25rem] border border-border bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
          Rate intelligence
        </p>
        <p className="text-xs text-ink/60">{intelligence.note}</p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] text-ink/60">
              <th className="pb-2 font-medium">Level</th>
              <th className="pb-2 text-right font-medium">Draft</th>
              <th className="pb-2 text-right font-medium">Card</th>
              <th className="pb-2 text-right font-medium">Recommended</th>
              <th className="pb-2 text-right font-medium">Market median</th>
              <th className="pb-2 text-right font-medium">This client</th>
              <th className="pb-2 text-right font-medium">vs client</th>
            </tr>
          </thead>
          <tbody>
            {intelligence.levels.map((level: RateLevelIntelligence) => {
              const draft = draftByCode.get(level.feeEarnerLevelCode);
              return (
                <tr
                  key={level.feeEarnerLevelCode}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-2.5">
                    <span className="text-ink">{level.feeEarnerLevelName}</span>
                    {level.marketLow !== null && level.marketHigh !== null && (
                      <span className="ml-2 text-[11px] text-ink/60">
                        mkt {money(level.marketLow, currency)}–{money(level.marketHigh, currency)}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-right font-semibold tabular-nums text-ink">
                    {draft === undefined ? "—" : money(draft, currency)}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-ink/60">
                    {money(level.rateCardRate, currency)}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-ink/60">
                    {money(level.recommendedRate, currency)}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-ink/60">
                    {money(level.marketMedian, currency)}
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-ink/60">
                    {money(level.clientAgreedAvgRate, currency)}
                    {level.clientAgreedSampleSize > 0 && (
                      <span className="ml-1 text-[11px] text-ink/60">
                        n={level.clientAgreedSampleSize}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    <DeltaChip value={delta(draft, level.clientAgreedAvgRate)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-ink/60">
        &ldquo;This client&rdquo; is the average rate this client has actually agreed on settled
        matters, excluding this one. A dash means there is no recorded history for that level —
        no figure is estimated.
        {intelligence.levels.some((l) => l.confidence === "INSUFFICIENT_DATA") && (
          <> Levels marked insufficient have too few comparable matters for a reliable market band.</>
        )}
      </p>
    </div>
  );
}
