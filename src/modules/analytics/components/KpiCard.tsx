"use client";

import React from "react";
import { HiTrendingUp, HiTrendingDown } from "react-icons/hi";

interface KpiCardProps {
  label: string;
  value: string;
  caption?: string;
  /** Signed delta; sign determines arrow direction. */
  delta?: string;
  deltaValue?: number | null;
  /** If true, a negative movement is good (e.g. fewer days to close). */
  invert?: boolean;
  loading?: boolean;
}

/**
 * KPI card with prior-period delta indicator (▲/▼), matching the platform's
 * card styling.
 */
export function KpiCard({ label, value, caption, delta, deltaValue, invert = false, loading = false }: KpiCardProps) {
  const hasDelta = delta != null && deltaValue != null && deltaValue !== 0;
  const isUp = (deltaValue ?? 0) > 0;
  const isGood = invert ? !isUp : isUp;

  return (
    <div className="bg-surface border border-border/70 rounded-2xl p-5 flex flex-col gap-2 min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60 truncate">
        {label}
      </p>
      {loading ? (
        <div className="h-8 w-24 bg-field rounded-lg animate-pulse" />
      ) : (
        <p className="text-[26px] leading-8 font-bold tabular-nums text-ink tracking-tight truncate">
          {value}
        </p>
      )}
      <div className="flex items-center gap-2 min-h-[18px]">
        {hasDelta ? (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold rounded-full px-2 py-0.5 ${
              isGood
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
            title="vs same period last year"
          >
            {isUp ? <HiTrendingUp className="w-3 h-3" /> : <HiTrendingDown className="w-3 h-3" />}
            {delta}
          </span>
        ) : null}
        {caption && <span className="text-[11px] font-medium text-ink/60 truncate">{caption}</span>}
      </div>
    </div>
  );
}

/** Skeleton block used while analytics pages load. */
export function PageSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-field rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-field rounded-2xl" />
      <div className="h-48 bg-field rounded-2xl" />
    </div>
  );
}
