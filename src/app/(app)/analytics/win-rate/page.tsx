"use client";

import React, { useState } from "react";
import { HiScale } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { useProposalPerformance } from "@/modules/analytics/hooks/useAnalytics";
import { PeriodFilter, defaultPeriod } from "@/modules/analytics/components/PeriodFilter";
import { AnalyticsTabs } from "@/modules/analytics/components/AnalyticsTabs";
import { KpiCard, PageSkeleton } from "@/modules/analytics/components/KpiCard";
import { WinRateBars } from "@/modules/analytics/components/charts";
import {
  formatNumber,
  formatPct,
  formatDays,
  formatRounds,
  formatPricingModel,
} from "@/modules/analytics/utils/format";
import type { PeriodParams, WinRateRow } from "@/modules/analytics/types";

function WinRateTable({ rows, labelFor }: { rows: WinRateRow[]; labelFor?: (v: string) => string }) {
  return (
    <div className="overflow-x-auto rates-scrollable">
      <table className="w-full text-left text-sm border-collapse">

        <thead>
          <tr className="bg-field/50 text-xs font-bold text-ink/60 border-b border-border">
            <th className="px-6 py-4">Segment</th>
            <th className="px-6 py-4">Won</th>
            <th className="px-6 py-4">Lost</th>
            <th className="px-6 py-4">Win rate</th>
            <th className="px-6 py-4">Avg rounds</th>
            <th className="px-6 py-4">Avg days</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/60">
          {rows.map((row) => (
            <tr key={row.dimensionValue} className="hover:bg-field/40 transition-colors">
              <td className="px-6 py-3.5 font-semibold text-ink">
                {labelFor ? labelFor(row.dimensionValue) : row.dimensionValue}
              </td>
              <td className="px-6 py-3.5 tabular-nums text-emerald-700 font-medium dark:text-emerald-400">{row.wins}</td>
              <td className="px-6 py-3.5 tabular-nums text-red-600 font-medium dark:text-red-400">{row.losses}</td>
              <td className="px-6 py-3.5 tabular-nums font-bold text-ink">{formatPct(row.winRatePct)}</td>
              <td className="px-6 py-3.5 tabular-nums text-ink/80">{formatRounds(row.avgRoundsToClose)}</td>
              <td className="px-6 py-3.5 tabular-nums text-ink/80">{formatDays(row.avgDaysToClose)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WinRatePage() {
  const [period, setPeriod] = useState<PeriodParams>(() => defaultPeriod());
  const { data: perf, isLoading, error } = useProposalPerformance(period);

  return (
    <div className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Proposal Performance</h1>
            <p className="text-sm text-ink/60 mt-1">
              Win rates, cycle time and outcomes across pricing models and practice areas.
            </p>
          </div>
          <PeriodFilter period={period} onChange={setPeriod} />
        </div>
        <AnalyticsTabs />
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading && !perf ? (
        <PageSkeleton />
      ) : perf ? (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard label="Proposals sent" value={formatNumber(perf.sent)} caption={`${perf.pending} pending · ${perf.withdrawn} withdrawn`} />
            <KpiCard label="Won" value={formatNumber(perf.won)} />
            <KpiCard label="Lost" value={formatNumber(perf.lost)} />
            <KpiCard label="Win rate" value={formatPct(perf.winRatePct, 0)} caption="Wins / (wins + losses)" />
            <KpiCard
              label="Avg cycle"
              value={formatDays(perf.avgDaysToClose)}
              caption={`${formatRounds(perf.avgRoundsToClose)} rounds avg`}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface border border-border/70 rounded-2xl p-5">
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
                  Outcomes
                </p>
                <h3 className="mt-1 text-base font-semibold text-ink tracking-tight">
                  Win rate by pricing model
                </h3>
              </div>
              {perf.byPricingModel.length === 0 ? (
                <EmptyState
                  title="No closed proposals"
                  description="Send proposals to clients and record their decisions to see win rate by pricing model."
                  icon={<HiScale className="w-5 h-5" />}
                />
              ) : (
                <WinRateBars data={perf.byPricingModel} />
              )}
            </div>
            <div className="bg-surface border border-border/70 rounded-2xl p-5">
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
                  Outcomes
                </p>
                <h3 className="mt-1 text-base font-semibold text-ink tracking-tight">
                  Win rate by practice area
                </h3>
              </div>
              {perf.byPracticeArea.length === 0 ? (
                <EmptyState
                  title="No closed proposals"
                  description="Send proposals to clients and record their decisions to see win rate by practice area."
                  icon={<HiScale className="w-5 h-5" />}
                />
              ) : (
                <WinRateBars data={perf.byPracticeArea} />
              )}
            </div>
          </div>

          {/* Tables */}
          {perf.byPricingModel.length > 0 && (
            <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-sm font-bold text-ink">By pricing model</h3>
              </div>
              <WinRateTable rows={perf.byPricingModel} labelFor={formatPricingModel} />
            </div>
          )}

          {perf.byPracticeArea.length > 0 && (
            <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-sm font-bold text-ink">By practice area</h3>
              </div>
              <WinRateTable rows={perf.byPracticeArea} />
            </div>
          )}
        </>
      ) : (
        !error && (
          <EmptyState
            title="No proposal activity"
            description="Win/loss analytics will appear once proposals are sent."
            icon={<HiScale className="w-5 h-5" />}
          />
        )
      )}
    </div>
  );
}
