"use client";

import React from "react";
import type { UsageSummaryRow } from "@/modules/billing/types";
import { HiTrendingDown } from "react-icons/hi";

interface UsageSummaryProps {
  data: UsageSummaryRow[];
  loading?: boolean;
}

export function UsageSummary({ data, loading }: UsageSummaryProps) {
  const formatCredits = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border/70 rounded-2xl p-6">
        <div className="h-4 w-32 bg-field/80 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-field/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-surface border border-border/70 rounded-2xl p-8 text-center">
        <HiTrendingDown className="w-10 h-10 text-ink/25 mx-auto mb-3" />
        <p className="text-sm text-ink/55">No usage recorded yet.</p>
      </div>
    );
  }

  const totalCredits = data.reduce((sum, row) => sum + row.totalCredits, 0);

  return (
    <div className="bg-surface border border-border/70 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60">
        <h3 className="text-sm font-bold text-ink">Usage by Feature</h3>
        <p className="text-xs text-ink/50 mt-0.5">
          Total consumed: <span className="font-semibold tabular-nums">{formatCredits(totalCredits)} credits</span>
        </p>
      </div>
      <div className="divide-y divide-gray-100/60">
        {data.map((row) => (
          <div key={row.feature} className="px-6 py-4 flex items-center justify-between hover:bg-field/30 transition-colors">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold border border-border bg-field/50 text-ink/70 uppercase tracking-wider">
                {row.feature}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums text-ink">
                {formatCredits(row.totalCredits)} <span className="text-[10px] font-medium text-ink/40">credits</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
