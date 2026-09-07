"use client";

import type { RateLevelDraft } from "../types";
import { formatMoney, formatRate } from "../utils";

interface RateCardEditorProps {
  currency: string;
  drafts: RateLevelDraft[];
  editable: boolean;
  onChange?: (next: RateLevelDraft[]) => void;
  compareAgainst?: RateLevelDraft[] | null;
  compareLabel?: string;
}

export function RateCardEditor({
  currency,
  drafts,
  editable,
  onChange,
  compareAgainst,
  compareLabel = "Previous",
}: RateCardEditorProps) {
  const compareMap = new Map(
    (compareAgainst || []).map((d) => [d.key, d.hourlyRate])
  );

  const totalHours = drafts.reduce((s, d) => s + (d.hours || 0), 0);
  const totalFees = drafts.reduce(
    (s, d) => s + (d.hours || 0) * (d.hourlyRate || 0),
    0
  );

  if (drafts.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm font-semibold text-ink">No rate lines</p>
        <p className="mt-1 text-xs text-ink/45">
          This round does not include a fee earner breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-3 flex items-baseline justify-between gap-3 border-b border-border/50 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
          Fee earner mix
        </p>
        <p className="text-[11px] tabular-nums text-ink/40">
          {totalHours.toLocaleString(undefined, { maximumFractionDigits: 1 })} hrs
          <span className="mx-1.5 text-ink/20">·</span>
          {formatMoney(totalFees, currency)}
        </p>
      </div>

      <ul className="divide-y divide-border/40">
        {drafts.map((row, idx) => {
          const prior = compareMap.get(row.key);
          const lineTotal = (row.hours || 0) * (row.hourlyRate || 0);
          const delta =
            prior != null && Number.isFinite(prior)
              ? row.hourlyRate - prior
              : null;

          return (
            <li
              key={row.key}
              className="group grid grid-cols-[minmax(0,1.4fr)_minmax(4.5rem,auto)_minmax(6.5rem,auto)] items-center gap-x-3 gap-y-1 py-3.5 first:pt-1"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold tracking-tight text-ink">
                  {row.feeEarnerLevelName}
                </p>
                <p className="mt-0.5 text-[11px] tabular-nums text-ink/40">
                  Line {formatMoney(lineTotal, currency)}
                  {delta != null && Math.abs(delta) >= 0.5 && (
                    <span
                      className={
                        delta < 0
                          ? "ml-2 font-semibold text-emerald-700"
                          : "ml-2 font-semibold text-ink/45"
                      }
                    >
                      {delta < 0 ? "↓" : "↑"} {formatRate(Math.abs(delta), currency)}
                      /hr vs {compareLabel.toLowerCase()}
                    </span>
                  )}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/30">
                  Hours
                </p>
                <p className="mt-0.5 text-sm tabular-nums text-ink/65">
                  {row.hours.toLocaleString(undefined, {
                    maximumFractionDigits: 1,
                  })}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/30">
                  {editable ? "Your rate" : "Rate"}
                </p>
                {editable && onChange ? (
                  <div className="mt-0.5 flex items-center justify-end gap-1">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={row.hourlyRate}
                      onChange={(e) => {
                        const next = [...drafts];
                        next[idx] = {
                          ...row,
                          hourlyRate: Number(e.target.value) || 0,
                        };
                        onChange(next);
                      }}
                      className="h-9 w-[5.75rem] rounded-lg border border-border bg-field px-2 text-right text-sm font-semibold tabular-nums text-ink focus:outline-none focus:ring-2 focus:ring-primary/15"
                    />
                    <span className="text-[11px] text-ink/35">/hr</span>
                  </div>
                ) : (
                  <p className="mt-0.5 text-[15px] font-semibold tabular-nums tracking-tight text-ink">
                    {formatRate(row.hourlyRate, currency)}
                    <span className="ml-1 text-[11px] font-normal text-ink/35">
                      /hr
                    </span>
                  </p>
                )}
                {compareAgainst && prior != null && !editable && (
                  <p className="mt-0.5 text-[10px] tabular-nums text-ink/35">
                    {compareLabel} {formatRate(prior, currency)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
