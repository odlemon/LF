"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HiChevronRight,
  HiOutlineTrendingUp,
  HiShieldExclamation,
  HiClipboardCheck,
} from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/utils/permissions";
import {
  useFirmSummary,
  usePracticeAreaMarginRows,
  useTopClients,
} from "@/modules/analytics/hooks/useAnalytics";
import { PeriodFilter, defaultPeriod } from "@/modules/analytics/components/PeriodFilter";
import { AnalyticsExportButtons } from "@/modules/analytics/components/AnalyticsExportButtons";
import { KpiCard, PageSkeleton } from "@/modules/analytics/components/KpiCard";
import { AnalyticsTabs } from "@/modules/analytics/components/AnalyticsTabs";
import {
  formatMoney,
  formatPct,
  formatNumber,
  formatDays,
  formatDelta,
} from "@/modules/analytics/utils/format";
import type { PeriodParams } from "@/modules/analytics/types";

export default function AnalyticsFirmHealthPage() {
  const [period, setPeriod] = useState<PeriodParams>(() => defaultPeriod());
  const financeView = usePermission(PERMISSIONS.ANALYTICS_FINANCE_VIEW);

  const { data: summary, isLoading, error } = useFirmSummary(period);
  const { data: paRows, isLoading: paLoading } = usePracticeAreaMarginRows(period);
  // Top clients rely on per-client metrics — finance-sensitive, gated.
  const { data: topClients, isLoading: clientsLoading } = useTopClients(period);

  const prior = summary?.priorPeriod ?? null;

  return (
    <div className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Analytics</h1>
            <p className="text-sm text-ink/55 mt-1">
              Pricing intelligence across the firm — revenue, margin, win rate and cycle time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PeriodFilter period={period} onChange={setPeriod} />
            <AnalyticsExportButtons period={period} />
          </div>
        </div>
        <AnalyticsTabs />
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading && !summary ? (
        <PageSkeleton />
      ) : summary && summary.hasData ? (
        <>
          {/* KPI row with YoY deltas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard
              label="Revenue billed"
              value={formatMoney(summary.revenueBilled, true)}
              caption="Won work, gross fees"
              delta={prior ? formatDelta(prior.revenueDeltaPct, "pct") : undefined}
              deltaValue={prior?.revenueDeltaPct}
            />
            <KpiCard
              label="Avg margin"
              value={formatPct(summary.avgMarginPct)}
              caption="Across priced work"
              delta={prior ? formatDelta(prior.marginDeltaPts, "pts") : undefined}
              deltaValue={prior?.marginDeltaPts}
            />
            <KpiCard
              label="Win rate"
              value={formatPct(summary.winRatePct, 0)}
              caption={`${summary.proposalsWon} won / ${summary.proposalsLost} lost`}
              delta={prior ? formatDelta(prior.winRateDeltaPts, "pts") : undefined}
              deltaValue={prior?.winRateDeltaPts}
            />
            <KpiCard
              label="Avg proposal cycle"
              value={formatDays(summary.avgProposalDays)}
              caption="Sent → decision"
              delta={prior ? formatDelta(prior.proposalDaysDelta, "days") : undefined}
              deltaValue={prior?.proposalDaysDelta}
              invert
            />
            <KpiCard
              label="Matters priced"
              value={formatNumber(summary.mattersPriced)}
              caption={`${summary.proposalsSent} proposals sent`}
              delta={prior ? formatDelta(prior.mattersPricedDeltaPct, "count") : undefined}
              deltaValue={prior?.mattersPricedDeltaPct}
            />
          </div>

          {/* Finance-only quick links */}
          {financeView && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/analytics/margin-monitor"
                className="group flex items-center gap-4 bg-surface border border-border/70 rounded-2xl p-5 hover:border-ink/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <HiShieldExclamation className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">Margin Monitor</p>
                  <p className="text-xs text-ink/50 mt-0.5">
                    AI-flagged pricing anomalies needing review
                  </p>
                </div>
                <HiChevronRight className="w-4 h-4 text-ink/30 group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
              </Link>
              <Link
                href="/analytics/rate-compliance"
                className="group flex items-center gap-4 bg-surface border border-border/70 rounded-2xl p-5 hover:border-ink/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-field text-ink/70 flex items-center justify-center shrink-0">
                  <HiClipboardCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">Rate Compliance</p>
                  <p className="text-xs text-ink/50 mt-0.5">
                    Proposed rates vs the active rate card
                  </p>
                </div>
                <HiChevronRight className="w-4 h-4 text-ink/30 group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Practice-area margin list */}
            <div className="lg:col-span-3 bg-surface border border-border/70 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                    Profitability
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-ink tracking-tight">
                    Practice area margins
                  </h3>
                </div>
              </div>

              {paLoading && !paRows ? (
                <div className="h-56 bg-field rounded-xl animate-pulse" />
              ) : !paRows || paRows.length === 0 ? (
                <EmptyState
                  title="No practice area activity"
                  description="No priced work found for this period."
                />
              ) : (
                <div className="flex flex-col">
                  {paRows.map((row) => {
                    const belowTarget =
                      row.marginVsTargetPts != null && row.marginVsTargetPts < 0;
                    return (
                      <Link
                        key={row.practiceAreaUid}
                        href={`/analytics/practice-areas/${row.practiceAreaUid}`}
                        className="group flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-field/60 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-ink truncate">
                            {row.practiceAreaName}
                          </p>
                          <p className="text-[11px] text-ink/45 mt-0.5">
                            {formatNumber(row.mattersPriced)}{" "}
                            {row.mattersPriced === 1 ? "matter" : "matters"} · win rate{" "}
                            {formatPct(row.winRatePct, 0)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold tabular-nums text-ink">
                            {formatPct(row.avgMarginPct)}
                          </p>
                          <p className="text-[11px] text-ink/45 mt-0.5">
                            {formatMoney(row.revenueBilled, true)} billed
                          </p>
                        </div>
                        {belowTarget ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 shrink-0"
                            title={`Below target by ${Math.abs(row.marginVsTargetPts ?? 0).toFixed(1)} pts`}
                          >
                            {formatDelta(row.marginVsTargetPts, "pts")} vs target
                          </span>
                        ) : row.marginVsTargetPts != null ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 shrink-0">
                            {formatDelta(row.marginVsTargetPts, "pts")} vs target
                          </span>
                        ) : null}
                        <HiChevronRight className="w-4 h-4 text-ink/25 group-hover:text-ink shrink-0 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top clients by revenue */}
            <div className="lg:col-span-2 bg-surface border border-border/70 rounded-2xl p-5">
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                  Client concentration
                </p>
                <h3 className="mt-1 text-base font-semibold text-ink tracking-tight">
                  Top clients by revenue
                </h3>
              </div>

              {clientsLoading && !topClients ? (
                <div className="h-56 bg-field rounded-xl animate-pulse" />
              ) : !topClients || topClients.length === 0 ? (
                <EmptyState
                  title="No client revenue yet"
                  description="Won work per client will appear here."
                  icon={<HiOutlineTrendingUp className="w-5 h-5" />}
                />
              ) : (
                <div className="flex flex-col">
                  {topClients.map((client, index) => (
                    <div
                      key={client.clientProfileUid}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-field/60 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-field border border-border text-[10px] font-bold text-ink/55 flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-ink truncate">{client.clientName}</p>
                        <p className="text-[11px] text-ink/45 mt-0.5">
                          margin {formatPct(client.avgMarginPct)} · win rate{" "}
                          {formatPct(client.winRatePct, 0)}
                        </p>
                      </div>
                      <p className="text-sm font-bold tabular-nums text-ink shrink-0">
                        {formatMoney(client.revenueBilled, true)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Deep dive entry point */}
          <div className="flex justify-end">
            <Link
              href="/analytics/win-rate"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
              Proposal performance & win rates
              <HiChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      ) : (
        <EmptyState
          title="No analytics available"
          description="Pricing metrics will appear once matters are priced."
        />
      )}
    </div>
  );
}
