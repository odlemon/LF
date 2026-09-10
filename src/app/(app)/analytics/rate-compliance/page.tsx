"use client";

import React, { useState } from "react";
import { HiClipboardCheck, HiClipboardList } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/utils/permissions";
import { useRateCompliance } from "@/modules/analytics/hooks/useAnalytics";
import { PeriodFilter, defaultPeriod } from "@/modules/analytics/components/PeriodFilter";
import { AnalyticsTabs } from "@/modules/analytics/components/AnalyticsTabs";
import { ComplianceDonut } from "@/modules/analytics/components/charts";
import { formatNumber, formatPct } from "@/modules/analytics/utils/format";
import type { PeriodParams } from "@/modules/analytics/types";

export default function RateCompliancePage() {
  const financeView = usePermission(PERMISSIONS.ANALYTICS_FINANCE_VIEW);
  const [period, setPeriod] = useState<PeriodParams>(() => defaultPeriod());

  const { data: compliance, isLoading, error } = useRateCompliance(period);

  if (!financeView) {
    return (
      <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-8">
        <AnalyticsTabs />
        <Alert
          variant="warning"
          message="Rate compliance requires finance analytics access (ANALYTICS_FINANCE_VIEW)."
        />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Rate Compliance</h1>
            <p className="text-sm text-ink/55 mt-1">
              Proposed and agreed rate lines compared against the firm&apos;s active rate card.
            </p>
          </div>
          <PeriodFilter period={period} onChange={setPeriod} />
        </div>
        <AnalyticsTabs />
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading && !compliance ? (
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-56 bg-field rounded-2xl" />
          <div className="h-64 bg-field rounded-2xl" />
        </div>
      ) : compliance && !compliance.activeRateCardPresent ? (
        <EmptyState
          title="No active rate card"
          description="Activate a rate card in Settings → Rate Cards to measure rate compliance against it."
          icon={<HiClipboardCheck className="w-5 h-5" />}
        />
      ) : compliance ? (
        <>
          {/* Headline */}
          <div className="bg-surface border border-border/70 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-8">
            <ComplianceDonut pct={compliance.compliantPct} />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                Active rate card
              </p>
              <h3 className="mt-1 text-lg font-bold text-ink tracking-tight">
                {compliance.rateCardName ?? "Rate card"}
              </h3>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Lines evaluated</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-ink">
                    {formatNumber(compliance.linesEvaluated)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Compliant</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {formatNumber(compliance.compliantCount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Non-compliant</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-red-600 dark:text-red-400">
                    {formatNumber(compliance.nonCompliantCount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Unmatched</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-ink/70">
                    {formatNumber(compliance.unmatchedCount)}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[11px] text-ink/45 leading-relaxed">
                Compliance covers scenario and negotiation rate lines — not time-entry billing.
              </p>
            </div>
          </div>

          {/* By level */}
          <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-ink">Discrepancies by fee earner level</h3>
            </div>
            {compliance.byLevel.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No rate lines evaluated"
                  description="Rate line activity will appear once scenarios or negotiations are priced."
                  icon={<HiClipboardList className="w-5 h-5" />}
                />
              </div>
            ) : (
              <div className="overflow-x-auto rates-scrollable">
                <table className="w-full text-left text-sm border-collapse">

                  <thead>
                    <tr className="bg-field/50 text-xs font-bold text-ink/55 border-b border-border">
                      <th className="px-6 py-4">Fee earner level</th>
                      <th className="px-6 py-4">Lines</th>
                      <th className="px-6 py-4">Compliant</th>
                      <th className="px-6 py-4">Below card</th>
                      <th className="px-6 py-4">Above card</th>
                      <th className="px-6 py-4">Avg delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60">
                    {compliance.byLevel.map((level) => {
                      const hasIssues = level.belowCardCount > 0 || level.aboveCardCount > 0;
                      return (
                        <tr key={level.feeEarnerLevelCode} className="hover:bg-field/40 transition-colors">
                          <td className="px-6 py-3.5 font-semibold text-ink">
                            {level.feeEarnerLevelName ?? level.feeEarnerLevelCode}
                          </td>
                          <td className="px-6 py-3.5 tabular-nums text-ink/80">
                            {formatNumber(level.lineCount)}
                          </td>
                          <td className="px-6 py-3.5 tabular-nums text-emerald-700 font-medium dark:text-emerald-400">
                            {formatNumber(level.compliantCount)}
                          </td>
                          <td className={`px-6 py-3.5 tabular-nums ${level.belowCardCount > 0 ? "text-red-600 font-bold" : "text-ink/50"} dark:text-red-400`}>
                            {formatNumber(level.belowCardCount)}
                          </td>
                          <td className={`px-6 py-3.5 tabular-nums ${level.aboveCardCount > 0 ? "text-amber-600 font-bold" : "text-ink/50"} dark:text-amber-400`}>
                            {formatNumber(level.aboveCardCount)}
                          </td>
                          <td className="px-6 py-3.5 tabular-nums text-ink/80">
                            {level.avgDeltaPct != null ? formatPct(level.avgDeltaPct) : "—"}
                            {hasIssues && level.avgDeltaPct == null && "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        !error && (
          <EmptyState
            title="No compliance data"
            description="Close negotiations with recorded rate lines in this period to compare accepted rates against the active card."
          />
        )
      )}
    </div>
  );
}
