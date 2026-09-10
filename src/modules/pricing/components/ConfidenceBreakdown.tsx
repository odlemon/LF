"use client";

import { useState } from "react";
import { HiOutlineInformationCircle } from "react-icons/hi";
import type { ConfidenceDrivers } from "../types";

function parseDrivers(raw: string | null | undefined): ConfidenceDrivers | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as ConfidenceDrivers;
    return null;
  } catch {
    return null;
  }
}

function Bar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full rounded-full bg-field overflow-hidden">
      <div
        className="h-full rounded-full bg-ink transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

interface ConfidenceBreakdownProps {
  confidence: number | null | undefined;
  drivers?: string | null;
  method?: string | null;
  /** Compact renders just the number with a small info icon; used on cards/lists. */
  compact?: boolean;
  /** Set when the trigger sits on a dark band (e.g. the partner-review hero) so the text stays legible. */
  onDark?: boolean;
}

export function ConfidenceBreakdown({
  confidence,
  drivers,
  method,
  compact,
  onDark,
}: ConfidenceBreakdownProps) {
  const [open, setOpen] = useState(false);

  if (confidence == null) {
    return <span className={onDark ? "text-on-primary/40" : "text-ink/60"}>—</span>;
  }

  const parsed = parseDrivers(drivers);
  const triggerTone = onDark
    ? "text-on-primary hover:text-on-primary"
    : compact
      ? "text-ink/60 hover:text-ink"
      : "text-ink hover:text-ink";

  return (
    <div className="relative inline-flex items-center gap-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`inline-flex items-center gap-1 rounded-md py-1 -my-1 transition-colors ${
          compact ? "text-[11px] font-medium" : "text-sm font-semibold"
        } ${triggerTone}`}
      >
        {confidence}%
        <HiOutlineInformationCircle className="w-3.5 h-3.5 opacity-60" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          />
          <div
            className="absolute z-50 top-full mt-2 left-0 w-80 rounded-2xl border border-border bg-surface p-4 shadow-lg text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-bold text-ink/80">How this is calculated</p>

            {!parsed || method === "deterministic-v1" ? (
              <p className="mt-2 text-[11px] leading-relaxed text-ink/60">
                Generated without AI — score derived from scope and rate card only.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <div>
                  <div className="flex items-baseline justify-between text-[11px] text-ink/60 mb-1">
                    <span>Comparable sample</span>
                    <span className="tabular-nums">{parsed.sampleSize} matters</span>
                  </div>
                  <Bar value={parsed.sampleScore} />
                </div>
                <div>
                  <div className="flex items-baseline justify-between text-[11px] text-ink/60 mb-1">
                    <span>Historical fee variance</span>
                    <span className="tabular-nums">
                      {parsed.feeVarianceStdDevPct != null ? `±${parsed.feeVarianceStdDevPct}%` : "n/a"}
                    </span>
                  </div>
                  <Bar value={parsed.varianceScore} />
                </div>
                <div>
                  <div className="flex items-baseline justify-between text-[11px] text-ink/60 mb-1">
                    <span>Rate-card coverage</span>
                    <span className="tabular-nums">{parsed.rateCardCoveragePct}%</span>
                  </div>
                  <Bar value={parsed.coverageScore} />
                </div>
                <div>
                  <div className="flex items-baseline justify-between text-[11px] text-ink/60 mb-1">
                    <span>Margin headroom</span>
                    <span className="tabular-nums">
                      {parsed.marginHeadroomPts != null ? `${parsed.marginHeadroomPts} pts` : "n/a"}
                    </span>
                  </div>
                  <Bar value={parsed.headroomScore} />
                </div>
                <p className="text-[10px] text-ink/60 pt-1 border-t border-border/60">
                  Weighted 35 / 30 / 20 / 15.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
