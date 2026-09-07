"use client";

import React, { useState } from "react";
import { HiLightBulb, HiExclamation } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/utils/permissions";
import {
  useRateRecommendations,
  usePracticeAreas,
} from "@/modules/analytics/hooks/useAnalytics";
import { AnalyticsTabs } from "@/modules/analytics/components/AnalyticsTabs";
import { ConfidenceBadge, PricingPowerBadge } from "@/modules/analytics/components/badges";
import { formatRate, formatNumber, formatDateTime } from "@/modules/analytics/utils/format";

const ALL = "ALL";

export default function RateRecommendationsPage() {
  const canRead = usePermission(PERMISSIONS.RATE_RECOMMENDATION_READ);
  const [practiceAreaUid, setPracticeAreaUid] = useState<string>(ALL);
  const { data: practiceAreas } = usePracticeAreas();

  const { data: recommendations, isLoading, error } = useRateRecommendations(
    practiceAreaUid !== ALL ? practiceAreaUid : undefined
  );

  if (!canRead) {
    return (
      <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-8">
        <AnalyticsTabs />
        <Alert
          variant="warning"
          message="Rate recommendations require RATE_RECOMMENDATION_READ access."
        />
      </div>
    );
  }

  const paName = (uid: string) => practiceAreas?.find((p) => p.uid === uid)?.name ?? uid;

  const paOptions = [
    { value: ALL, label: "All practice areas" },
    ...(practiceAreas ?? [])
      .filter((p) => p.active)
      .map((p) => ({ value: p.uid, label: p.name })),
  ];

  return (
    <div className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Rate Recommendations</h1>
            <p className="text-sm text-ink/55 mt-1">
              Latest market-informed rate guidance per practice area and fee earner level.
            </p>
          </div>
          <div className="w-64">
            <Select options={paOptions} value={practiceAreaUid} onChange={setPracticeAreaUid} />
          </div>
        </div>
        <AnalyticsTabs />
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading && !recommendations ? (
        <div className="h-72 bg-field rounded-2xl animate-pulse" />
      ) : !recommendations || recommendations.length === 0 ? (
        <EmptyState
          title="No rate recommendations yet"
          description="Recommendations are generated from market benchmark data in the Data Room. Ingest benchmarks to unlock guidance."
          icon={<HiLightBulb className="w-5 h-5" />}
        />
      ) : (
        <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-field/50 text-xs font-bold text-ink/55 border-b border-border">
                <th className="px-6 py-4">Practice area</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Current</th>
                <th className="px-6 py-4">Recommended</th>
                <th className="px-6 py-4">Market median</th>
                <th className="px-6 py-4">Market range</th>
                <th className="px-6 py-4">Confidence</th>
                <th className="px-6 py-4">Pricing power</th>
                <th className="px-6 py-4">Sample</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {recommendations.map((rec) => {
                const delta =
                  rec.currentRate != null && rec.currentRate > 0
                    ? ((rec.recommendedRate - rec.currentRate) / rec.currentRate) * 100
                    : null;
                return (
                  <tr key={rec.uid} className="hover:bg-field/40 transition-colors align-top">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-ink">{paName(rec.practiceAreaUid)}</p>
                      {rec.jurisdiction && (
                        <p className="text-[11px] text-ink/45 mt-0.5">{rec.jurisdiction}</p>
                      )}
                      <p className="text-[10px] text-ink/35 mt-1">{formatDateTime(rec.generatedAt)}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-ink">{rec.feeEarnerLevelCode}</td>
                    <td className="px-6 py-4 tabular-nums text-ink/80">{formatRate(rec.currentRate)}</td>
                    <td className="px-6 py-4">
                      <span className="tabular-nums font-bold text-ink">{formatRate(rec.recommendedRate)}</span>
                      {delta != null && Math.abs(delta) >= 0.05 && (
                        <span
                          className={`ml-2 text-[10px] font-bold ${delta > 0 ? "text-emerald-700" : "text-red-600"}`}
                        >
                          {delta > 0 ? "+" : ""}
                          {delta.toFixed(1)}%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 tabular-nums text-ink/80">{formatRate(rec.marketMedian)}</td>
                    <td className="px-6 py-4 tabular-nums text-ink/60 text-xs">
                      {rec.marketLow != null && rec.marketHigh != null
                        ? `${formatRate(rec.marketLow)} – ${formatRate(rec.marketHigh)}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4"><ConfidenceBadge confidence={rec.confidence} /></td>
                    <td className="px-6 py-4"><PricingPowerBadge pricingPower={rec.pricingPower} /></td>
                    <td className="px-6 py-4 tabular-nums text-ink/80">{formatNumber(rec.sampleSize)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reasoning + insufficient-data notices */}
      {recommendations && recommendations.length > 0 && (
        <div className="flex flex-col gap-3">
          {recommendations.map((rec) => (
            <div key={rec.uid} className="bg-surface border border-border/70 rounded-2xl p-5">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <p className="text-xs font-bold text-ink">
                  {paName(rec.practiceAreaUid)} · {rec.feeEarnerLevelCode}
                </p>
                {!rec.dataSufficient && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                    <HiExclamation className="w-3 h-3" />
                    Insufficient data — using market median
                  </span>
                )}
              </div>
              {rec.reasoning ? (
                <p className="text-xs text-ink/65 leading-relaxed">{rec.reasoning}</p>
              ) : (
                <p className="text-xs text-ink/40 italic">No reasoning provided.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
