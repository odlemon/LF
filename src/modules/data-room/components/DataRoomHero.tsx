"use client";

import React from "react";
import { DataRoomSummary } from "../types";

/**
 * The Data Room's opening statement.
 *
 * Replaces a thin readiness band sitting above four equal metric boxes. That arrangement gave
 * the most important thing on the page — whether the firm has enough history to price from —
 * a strip of empty space, while four identical tiles competed for attention with no hierarchy
 * between them.
 *
 * The numbers now sit inside the readiness card because they are the evidence for it: the
 * headline claim and the figures behind it belong together, and the matter count is doing two
 * jobs at once, so showing it twice was noise.
 */

const LEVELS = {
  HIGH: {
    label: "Data ready",
    headline: "Pricing runs on your own history.",
    detail:
      "Enough comparable matters to ground a fee in what this firm actually charged, rather than a market average.",
    accent: "text-ink",
    chip: "bg-ink text-on-primary",
  },
  MEDIUM: {
    label: "Partly ready",
    headline: "Some history to price from.",
    detail:
      "Recommendations are partly grounded in your matters. More past-matter data sharpens every scope from here.",
    accent: "text-warning",
    chip: "bg-warning/10 text-warning border border-warning/25",
  },
  LOW: {
    label: "Limited data",
    headline: "Not enough history yet.",
    detail:
      "Fees will be priced from general benchmarks until more past matters are ingested. Upload a matter export to change that.",
    accent: "text-warning",
    chip: "bg-warning/10 text-warning border border-warning/25",
  },
} as const;

/** Where the ingestion goal sits. Matches the thresholds the backend uses to set readiness. */
const TARGET_MATTERS = 50;

export function DataRoomHero({
  summary,
  loading,
}: {
  summary: DataRoomSummary | null;
  loading: boolean;
}) {
  if (loading) {
    return <div className="h-56 rounded-3xl border border-border bg-surface animate-pulse" />;
  }
  if (!summary) return null;

  const level = LEVELS[(summary.dataReadiness || "LOW") as keyof typeof LEVELS] ?? LEVELS.LOW;
  const matters = summary.totalPastMatters || 0;
  const pct = Math.max(4, Math.min(100, Math.round((matters / TARGET_MATTERS) * 100)));

  const figures = [
    { label: "Past matters", value: matters.toLocaleString() },
    { label: "Time entries", value: (summary.totalTimeEntries || 0).toLocaleString() },
    {
      label: "Files processed",
      value: `${summary.processedDocumentsCount || 0}/${summary.totalDocumentsCount || 0}`,
    },
    { label: "Practice areas", value: String(summary.coveredPracticeAreas?.length ?? 0) },
  ];

  return (
    <section className="rounded-3xl border border-border bg-surface overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${level.chip}`}
          >
            {level.label}
          </span>
          <span className="text-[11px] font-semibold text-ink/40">
            {matters.toLocaleString()} of {TARGET_MATTERS}+ matters ingested
          </span>
        </div>

        <h2 className={`mt-4 text-2xl sm:text-3xl font-semibold tracking-tight ${level.accent}`}>
          {level.headline}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60 leading-relaxed">{level.detail}</p>

        {/* One bar, honestly scaled against the goal rather than three stacked tiers. */}
        <div className="mt-6 h-1.5 w-full rounded-full bg-field overflow-hidden">
          <div
            className="h-full rounded-full bg-ink transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 border-t border-border divide-x divide-border">
        {figures.map((f) => (
          <div key={f.label} className="px-6 py-5">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-ink/40">
              {f.label}
            </dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
