"use client";

import {
  formatTrailValue,
  parseChangeSummary,
} from "../changeTrail";

interface ScenarioChangeTrailProps {
  changeSummaryJson?: string | null;
  currency: string;
  className?: string;
  /** Compact for cards / side panels */
  dense?: boolean;
}

export function ScenarioChangeTrailPanel({
  changeSummaryJson,
  currency,
  className = "",
  dense = false,
}: ScenarioChangeTrailProps) {
  const summary = parseChangeSummary(changeSummaryJson);
  if (!summary) return null;

  const changedEntries = summary.entries.filter((e) => e.direction !== "same");
  const lineChanges = summary.lineChanges || [];
  const hasChanges =
    summary.hasChanges ?? (changedEntries.length > 0 || lineChanges.length > 0);

  return (
    <section
      className={`rounded-2xl border border-border/70 bg-surface overflow-hidden ${className}`}
    >
      <div
        className={`border-b border-border/60 ${dense ? "px-4 py-3" : "px-5 py-4"}`}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
          Change trail
        </p>
        <h3
          className={`mt-1 font-semibold text-ink tracking-tight ${
            dense ? "text-sm" : "text-base"
          }`}
        >
          {hasChanges ? "What changed since return" : "No economic changes yet"}
        </h3>
        <p className="mt-1 text-[11px] text-ink/60 leading-relaxed">
          Compared to the version the partner returned for correction.
        </p>
      </div>

      {!hasChanges ? (
        <p className={`${dense ? "px-4 py-4" : "px-5 py-5"} text-sm text-ink/60`}>
          Adjust hours, discount, or cap — the trail updates as you edit.
        </p>
      ) : (
        <div className={dense ? "px-4 py-3 space-y-3" : "px-5 py-4 space-y-4"}>
          {changedEntries.length > 0 && (
            <ul className="space-y-2">
              {changedEntries.map((entry) => (
                <li
                  key={entry.label}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-ink/60 font-medium shrink-0">
                    {entry.label}
                  </span>
                  <span className="flex items-center gap-2 tabular-nums text-right min-w-0">
                    <span className="text-ink/60 line-through decoration-ink/20 truncate">
                      {formatTrailValue(entry.before, currency, entry.moneyLike)}
                      {entry.label === "Effort scale" ? "×" : ""}
                    </span>
                    <span className="text-ink/25" aria-hidden>
                      →
                    </span>
                    <span
                      className={`font-semibold truncate ${
                        entry.direction === "up"
                          ? "text-emerald-800 dark:text-emerald-300"
                          : entry.direction === "down"
                            ? "text-amber-900 dark:text-amber-200"
                            : "text-ink"
                      }`}
                    >
                      {formatTrailValue(entry.after, currency, entry.moneyLike)}
                      {entry.label === "Effort scale" ? "×" : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {lineChanges.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60 mb-2">
                Line items
              </p>
              <ul className="space-y-2">
                {lineChanges.slice(0, dense ? 4 : 8).map((line, i) => (
                  <li
                    key={`${line.label}-${i}`}
                    className="flex items-start justify-between gap-3 text-[13px]"
                  >
                    <div className="min-w-0">
                      <p className="text-ink/75 font-medium truncate">
                        {line.label}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-ink/60 mt-0.5">
                        {line.kind}
                      </p>
                    </div>
                    <span className="tabular-nums text-right shrink-0 text-ink/70">
                      {line.kind === "added" ? (
                        <span className="text-emerald-800 dark:text-emerald-300 font-semibold">
                          +
                          {formatTrailValue(line.afterAmount, currency, true)}
                        </span>
                      ) : line.kind === "removed" ? (
                        <span className="text-red-700 dark:text-red-300 font-semibold">
                          −
                          {formatTrailValue(line.beforeAmount, currency, true)}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span className="text-ink/60 line-through">
                            {formatTrailValue(line.beforeAmount, currency, true)}
                          </span>
                          <span className="text-ink/25">→</span>
                          <span className="font-semibold text-ink">
                            {formatTrailValue(line.afterAmount, currency, true)}
                          </span>
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
