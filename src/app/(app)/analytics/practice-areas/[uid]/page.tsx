"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HiArrowLeft, HiExclamation } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/utils/permissions";
import { analyticsApi } from "@/lib/api/modules/analytics.api";
import { usePracticeAreaMetrics } from "@/modules/analytics/hooks/useAnalytics";
import { PeriodFilter, defaultPeriod } from "@/modules/analytics/components/PeriodFilter";
import { PageSkeleton } from "@/modules/analytics/components/KpiCard";
import { FeesMarginTrendChart, ModelDistributionChart } from "@/modules/analytics/components/charts";
import {
  formatMoney,
  formatPct,
  formatNumber,
  formatRate,
  formatDateTime,
  formatDelta,
  formatPricingModel,
} from "@/modules/analytics/utils/format";
import type { PeriodParams, RateComplianceDto } from "@/modules/analytics/types";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface border border-border/70 rounded-2xl p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">{label}</p>
      <p className="mt-2 text-xl font-bold tabular-nums text-ink tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-ink/45 mt-1">{sub}</p>}
    </div>
  );
}

/** Same period shifted back one year (backend default: last 12 months). */
function priorPeriodOf(period: PeriodParams): PeriodParams {
  const shift = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().slice(0, 10);
  };
  const now = new Date();
  const to = period.to ?? now.toISOString().slice(0, 10);
  const fromFallback = new Date(now);
  fromFallback.setFullYear(fromFallback.getFullYear() - 1);
  const from = period.from ?? fromFallback.toISOString().slice(0, 10);
  return { from: shift(from), to: shift(to) };
}

export default function PracticeAreaDeepDivePage() {
  const params = useParams<{ uid: string }>();
  const uid = params?.uid;
  const [period, setPeriod] = useState<PeriodParams>(() => defaultPeriod());
  const financeView = usePermission(PERMISSIONS.ANALYTICS_FINANCE_VIEW);

  const { data: metrics, isLoading, error } = usePracticeAreaMetrics(uid, period);

  // Win rate vs the same period last year (second-period call, computed client-side).
  const [priorWinRate, setPriorWinRate] = useState<number | null | undefined>(undefined);
  useEffect(() => {
    if (!uid) return;
    let active = true;
    setPriorWinRate(undefined);
    analyticsApi
      .getPracticeAreaMetrics(uid, priorPeriodOf(period))
      .then((m) => {
        if (active) setPriorWinRate(m.winRatePct);
      })
      .catch(() => {
        if (active) setPriorWinRate(null);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, period.from ?? "", period.to ?? ""]);

  // Rate card compliance for this practice area (finance-scoped endpoint).
  const [compliance, setCompliance] = useState<RateComplianceDto | null>(null);
  useEffect(() => {
    if (!uid || !financeView) return;
    let active = true;
    analyticsApi
      .getRateCompliance(period, uid)
      .then((dto) => {
        if (active) setCompliance(dto);
      })
      .catch(() => {
        if (active) setCompliance(null);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, financeView, period.from ?? "", period.to ?? ""]);

  const winRateDeltaPts =
    metrics && priorWinRate != null ? metrics.winRatePct - priorWinRate : null;

  return (
    <div className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <Link
              href="/analytics"
              className="inline-flex items-center gap-1 text-xs font-bold text-ink/50 hover:text-ink transition-colors mb-2 py-1.5"
            >
              <HiArrowLeft className="w-3.5 h-3.5" />
              Firm health
            </Link>
            <h1 className="text-2xl font-bold text-ink tracking-tight">
              {metrics?.practiceAreaName ?? "Practice area"}
            </h1>
            <p className="text-sm text-ink/55 mt-1">Deep dive — fees, margin, win rate and top matters.</p>
          </div>
          <PeriodFilter period={period} onChange={setPeriod} />
        </div>
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading && !metrics ? (
        <PageSkeleton />
      ) : metrics ? (
        <>
          {/* Headline stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Stat label="Revenue billed" value={formatMoney(metrics.revenueBilled, true)} sub="Won work only" />
            <Stat label="Avg margin" value={formatPct(metrics.avgMarginPct)} />
            <Stat
              label="Win rate"
              value={formatPct(metrics.winRatePct, 0)}
              sub={`${metrics.proposalsWon}W / ${metrics.proposalsLost}L of ${metrics.proposalsSent} sent${
                winRateDeltaPts != null
                  ? ` · ${winRateDeltaPts >= 0 ? "+" : ""}${winRateDeltaPts.toFixed(1)} pts vs prior yr`
                  : ""
              }`}
            />
            <Stat label="Matters priced" value={formatNumber(metrics.mattersPriced)} />
            <Stat
              label="Margin vs target"
              value={metrics.marginVsTargetPts != null ? formatDelta(metrics.marginVsTargetPts, "pts") : "—"}
              sub={metrics.targetMarginPct != null ? `Target ${formatPct(metrics.targetMarginPct)}` : "No target set"}
            />
            <Stat
              label="Market median rate"
              value={formatRate(metrics.marketMedianRate)}
              sub={metrics.marketMedianSource ?? "No benchmark"}
            />
          </div>

          {/* Margin positioning strip */}
          <div className="bg-surface border border-border/70 rounded-2xl p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35 mb-3">
              Positioning
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs font-semibold text-ink/50">Average achieved margin</p>
                <p className={`text-lg font-bold tabular-nums mt-1 ${metrics.marginVsTargetPts != null && metrics.marginVsTargetPts < 0 ? "text-red-600" : "text-ink"} dark:text-red-400`}>
                  {formatPct(metrics.avgMarginPct)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink/50">Target margin</p>
                <p className="text-lg font-bold tabular-nums text-ink mt-1">
                  {metrics.targetMarginPct != null ? formatPct(metrics.targetMarginPct) : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink/50">Market median rate</p>
                <p className="text-lg font-bold tabular-nums text-ink mt-1">
                  {formatRate(metrics.marketMedianRate)}
                  {metrics.marketMedianSource && (
                    <span className="ml-2 text-[11px] font-semibold text-ink/40">
                      ({metrics.marketMedianSource})
                    </span>
                  )}
                </p>
              </div>
            </div>
            {metrics.marginVsTargetPts != null && metrics.marginVsTargetPts < 0 && (
              <div className="mt-4">
                <Alert
                  variant="warning"
                  message={`Average margin is ${Math.abs(metrics.marginVsTargetPts).toFixed(1)} pts below the ${formatPct(metrics.targetMarginPct)} target for this practice area.`}
                />
              </div>
            )}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface border border-border/70 rounded-2xl p-5">
              {metrics.monthlyTrend.length === 0 ? (
                <EmptyState
                  title="No monthly activity"
                  description="Approve pricing scenarios in this practice area to build a fees and margin trend here."
                />
              ) : (
                <FeesMarginTrendChart data={metrics.monthlyTrend} />
              )}
            </div>
            <div className="bg-surface border border-border/70 rounded-2xl p-5">
              {metrics.pricingModelDistribution.length === 0 ? (
                <EmptyState
                  title="No pricing mix"
                  description="Approved scenarios in this period will break down by pricing model here."
                />
              ) : (
                <ModelDistributionChart data={metrics.pricingModelDistribution} />
              )}
            </div>
          </div>

          {/* Rate card compliance for this practice area (finance view only) */}
          {financeView && compliance && (
            <div className="bg-surface border border-border/70 rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35 mb-3">
                Rate card compliance
              </p>
              {!compliance.activeRateCardPresent ? (
                <p className="text-sm text-ink/55">No active rate card - compliance cannot be evaluated.</p>
              ) : compliance.linesEvaluated === 0 && compliance.unmatchedCount === 0 ? (
                <p className="text-sm text-ink/55">No priced matters in this practice area for the selected period.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs font-semibold text-ink/50">Compliant rate lines</p>
                    <p className={`text-lg font-bold tabular-nums mt-1 ${compliance.compliantPct < 100 ? "text-amber-600" : "text-emerald-600"} dark:text-amber-400`}>
                      {formatPct(compliance.compliantPct)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink/50">Lines evaluated</p>
                    <p className="text-lg font-bold tabular-nums text-ink mt-1">
                      {formatNumber(compliance.linesEvaluated)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink/50">Off-card</p>
                    <p className="text-lg font-bold tabular-nums text-ink mt-1">
                      {formatNumber(compliance.nonCompliantCount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-ink/50">Unmatched</p>
                    <p className="text-lg font-bold tabular-nums text-ink mt-1">
                      {formatNumber(compliance.unmatchedCount)}
                    </p>
                  </div>
                </div>
              )}
              {compliance.activeRateCardPresent && compliance.rateCardName && (
                <p className="text-[11px] text-ink/40 mt-3">
                  Card: {compliance.rateCardName}
                </p>
              )}
            </div>
          )}

          {/* Clients in this practice area + relationship health */}
          <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-ink">Clients in this practice area</h3>
              <p className="text-[11px] text-ink/45 mt-0.5">
                Relationship health from this practice area&apos;s priced work in the selected period.
              </p>
            </div>
            {metrics.clients.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No clients yet"
                  description="Create a pricing request in this practice area to start tracking client relationships here."
                />
              </div>
            ) : (
              <div className="overflow-x-auto rates-scrollable">
                <table className="w-full text-left text-sm border-collapse">

                  <thead>
                    <tr className="bg-field/50 text-xs font-bold text-ink/55 border-b border-border">
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Revenue</th>
                      <th className="px-6 py-4">Avg margin</th>
                      <th className="px-6 py-4">Win rate</th>
                      <th className="px-6 py-4">Matters</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60">
                    {metrics.clients.map((client) => (
                      <tr key={client.clientProfileUid} className="hover:bg-field/40 transition-colors">
                        <td className="px-6 py-3.5">
                          <Link
                            href={`/clients/${client.clientProfileUid}`}
                            className="font-semibold text-ink hover:text-primary transition-colors"
                          >
                            {client.clientName ?? client.clientProfileUid}
                          </Link>
                        </td>
                        <td className="px-6 py-3.5 tabular-nums font-medium text-ink">
                          {formatMoney(client.revenue)}
                        </td>
                        <td className="px-6 py-3.5 tabular-nums text-ink/80">
                          {formatPct(client.avgMarginPct)}
                        </td>
                        <td className="px-6 py-3.5 tabular-nums text-ink/80">
                          {formatPct(client.winRatePct, 0)}
                        </td>
                        <td className="px-6 py-3.5 tabular-nums text-ink/80">
                          {formatNumber(client.mattersCount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pricing model table */}
          {metrics.pricingModelDistribution.length > 0 && (
            <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-sm">
              <div className="overflow-x-auto rates-scrollable">
                <table className="w-full text-left text-sm border-collapse">

                  <thead>
                    <tr className="bg-field/50 text-xs font-bold text-ink/55 border-b border-border">
                      <th className="px-6 py-4">Pricing model</th>
                      <th className="px-6 py-4">Matters</th>
                      <th className="px-6 py-4">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60">
                    {metrics.pricingModelDistribution.map((m) => (
                      <tr key={m.pricingModel} className="hover:bg-field/40 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-ink">
                          {formatPricingModel(m.pricingModel)}
                        </td>
                        <td className="px-6 py-3.5 tabular-nums text-ink/80">{formatNumber(m.count)}</td>
                        <td className="px-6 py-3.5 tabular-nums text-ink/80">{formatPct(m.pct)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top matters */}
          <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-ink">Top matters</h3>
            </div>
            {metrics.topMatters.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No matters"
                  description="Win negotiations in this practice area to populate top matters by revenue."
                />
              </div>
            ) : (
              <div className="overflow-x-auto rates-scrollable">
                <table className="w-full text-left text-sm border-collapse">

                  <thead>
                    <tr className="bg-field/50 text-xs font-bold text-ink/55 border-b border-border">
                      <th className="px-6 py-4">Matter</th>
                      <th className="px-6 py-4">Source</th>
                      <th className="px-6 py-4">Gross fees</th>
                      <th className="px-6 py-4">Margin</th>
                      <th className="px-6 py-4">Closed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60">
                    {metrics.topMatters.map((matter) => (
                      <tr key={matter.uid} className="hover:bg-field/40 transition-colors">
                        <td className="px-6 py-3.5">
                          {matter.source === "NEGOTIATION" ? (
                            <Link
                              href={`/negotiations/${matter.uid}`}
                              className="font-semibold text-ink hover:text-primary transition-colors"
                            >
                              {matter.title}
                            </Link>
                          ) : (
                            <span className="font-semibold text-ink">{matter.title}</span>
                          )}
                          {matter.marginPct < 10 && (
                            <span
                              className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400"
                              title="Low margin matter"
                            >
                              <HiExclamation className="w-3 h-3" />
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 text-xs text-ink/60 capitalize">
                          {matter.source.toLowerCase()}
                        </td>
                        <td className="px-6 py-3.5 tabular-nums font-medium text-ink">
                          {formatMoney(matter.grossFees)}
                        </td>
                        <td className="px-6 py-3.5 tabular-nums text-ink/80">{formatPct(matter.marginPct)}</td>
                        <td className="px-6 py-3.5 text-xs text-ink/60">{formatDateTime(matter.closedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        !error && (
          <EmptyState
            title="Practice area not found"
            description="This practice area has no analytics data."
          />
        )
      )}
    </div>
  );
}
