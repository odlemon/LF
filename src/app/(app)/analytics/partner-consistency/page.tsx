"use client";

import React, { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/utils/permissions";
import { AnalyticsTabs } from "@/modules/analytics/components/AnalyticsTabs";
import { PeriodFilter, defaultPeriod } from "@/modules/analytics/components/PeriodFilter";
import { analyticsApi } from "@/lib/api/modules/analytics.api";
import { HiOutlineScale } from "react-icons/hi";
import type { PeriodParams, PracticeAreaConsistency } from "@/modules/analytics/types";

function pct(value: number | null): string {
  return value === null ? "—" : `${value.toFixed(2)}%`;
}

function signed(value: number | null): string {
  if (value === null) return "—";
  const r = Math.round(value * 100) / 100;
  return `${r > 0 ? "+" : ""}${r}`;
}

export default function PartnerConsistencyPage() {
  const allowed = usePermission(PERMISSIONS.PARTNER_CONSISTENCY_READ);
  const [period, setPeriod] = useState<PeriodParams>(() => defaultPeriod());
  const [rows, setRows] = useState<PracticeAreaConsistency[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!allowed) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    analyticsApi
      .getPartnerConsistency(period)
      .then((d) => {
        if (!cancelled) {
          setRows(d);
          setError(null);
        }
      })
      .catch((err: any) => {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load partner consistency");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period, allowed]);

  if (!allowed) {
    return (
      <div className="p-8 max-w-7xl w-full mx-auto">
        <EmptyState
          icon={<HiOutlineScale className="w-5 h-5" />}
          title="Not available"
          description="Comparing named partners requires the Partner Consistency permission, which is granted separately from general analytics access."
        />
      </div>
    );
  }

  const compared = (rows ?? []).filter((r) => r.comparisonDrawn);

  return (
    <div className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Partner Consistency</h1>
            <p className="text-sm text-ink/55 mt-1 max-w-2xl">
              How consistently partners price comparable matters, within each practice area.
              Deviation is reported, not judged — a partner may be discounting more because
              their matters are harder, and this data cannot see that.
            </p>
          </div>
          <PeriodFilter period={period} onChange={setPeriod} />
        </div>
        <AnalyticsTabs />
      </div>

      {error && <Alert variant="error" message={error} />}

      {loading && !rows ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-field rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !rows || rows.length === 0 ? (
        <EmptyState
          icon={<HiOutlineScale className="w-5 h-5" />}
          title="No priced matters in this period"
          description="Nothing has been approved in this window to compare."
        />
      ) : (
        <>
          {compared.length === 0 && (
            <div className="rounded-2xl border border-border bg-field/50 p-4 text-sm text-ink/60">
              No practice area yet has two partners with enough matters to compare. Each row
              below shows who was excluded and why, so the gap is visible rather than silent.
            </div>
          )}

          <div className="flex flex-col gap-5">
            {rows.map((area) => (
              <section
                key={area.practiceAreaUid}
                className="bg-surface border border-border/70 rounded-2xl p-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-base font-semibold text-ink tracking-tight">
                    {area.practiceAreaName}
                  </h2>
                  {area.comparisonDrawn && area.discountSpreadPts !== null && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        area.discountSpreadPts > 10
                          ? "bg-amber-50 text-amber-700"
                          : "bg-field text-ink/55"
                      }`}
                    >
                      {area.discountSpreadPts} pts spread
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-ink/50">{area.note}</p>

                {area.partners.length > 0 && (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-[11px] text-ink/45">
                          <th className="pb-2 font-medium">Partner</th>
                          <th className="pb-2 text-right font-medium">Matters</th>
                          <th className="pb-2 text-right font-medium">Avg discount</th>
                          <th className="pb-2 text-right font-medium">vs median</th>
                          <th className="pb-2 text-right font-medium">Avg margin</th>
                          <th className="pb-2 text-right font-medium">vs median</th>
                        </tr>
                      </thead>
                      <tbody>
                        {area.partners.map((p) => (
                          <tr
                            key={p.partnerKey}
                            className="border-b border-border/50 last:border-0"
                          >
                            <td className="py-2.5 text-ink">
                              {p.partnerName}
                              {p.outlier && (
                                <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                  Outlier
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 text-right tabular-nums text-ink/70">
                              {p.matters}
                            </td>
                            <td className="py-2.5 text-right tabular-nums text-ink">
                              {pct(p.avgDiscountPct)}
                            </td>
                            <td className="py-2.5 text-right tabular-nums text-ink/55">
                              {signed(p.discountVsMedianPts)}
                            </td>
                            <td className="py-2.5 text-right tabular-nums text-ink">
                              {pct(p.avgMarginPct)}
                            </td>
                            <td className="py-2.5 text-right tabular-nums text-ink/55">
                              {signed(p.marginVsMedianPts)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {area.excludedPartners.length > 0 && (
                  <p className="mt-3 text-[11px] text-ink/40">
                    Excluded for too few matters:{" "}
                    {area.excludedPartners
                      .map((p) => `${p.partnerName} (${p.matters})`)
                      .join(", ")}
                  </p>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
