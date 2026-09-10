"use client";

import React, { useEffect, useMemo, useState } from "react";
import { volumeDiscountApi } from "@/lib/api/modules/volumeDiscount.api";
import type { VolumeDiscountProgram, VolumeDiscountDashboard } from "@/modules/volume-discount/types";
import {
  PortalAtmosphere,
  PortalPageHeader,
} from "@/modules/client-portal/PortalChrome";
import { Badge } from "@/components/ui/Badge";

export default function ClientDiscountStatusPage() {
  const [programs, setPrograms] = useState<VolumeDiscountProgram[]>([]);
  const [dashboards, setDashboards] = useState<Record<string, VolumeDiscountDashboard>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function doLoad() {
      try {
        const data = await volumeDiscountApi.listPortalPrograms();
        if (!isActive) return;
        setPrograms(data);
        setLoading(false);

        // Fetched together, not one after another: a client on a slow connection should not
        // wait through one round trip per programme before seeing any of their own figures.
        const results = await Promise.allSettled(
          data.map((p) => volumeDiscountApi.getPortalDashboard(p.uid)),
        );
        const dashboardMap: Record<string, VolumeDiscountDashboard> = {};
        results.forEach((result, i) => {
          // A dashboard can legitimately fail for an inactive programme.
          if (result.status === "fulfilled") dashboardMap[data[i].uid] = result.value;
        });
        if (isActive) {
          setDashboards(dashboardMap);
        }
      } catch {
        if (isActive) {
          setPrograms([]);
          setDashboards({});
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void doLoad();
    return () => {
      isActive = false;
    };
  }, []);

  const formatMoney = (value: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency,
      }).format(value);
    } catch {
      return `${currency} ${value.toFixed(2)}`;
    }
  };

  const totalSavings = useMemo(
    () => Object.values(dashboards).reduce((sum, d) => sum + d.savingsToDate, 0),
    [dashboards]
  );

  const currency = programs[0]?.currency || "GBP";

  return (
    <PortalAtmosphere>
      <div className="mx-auto w-full max-w-5xl space-y-6 px-5 py-6 sm:px-8 sm:py-8 animate-fade-in">
        <PortalPageHeader
          eyebrow="Discount status"
          title="Volume discount position"
          description="Your active discount programs, tier progress, and savings to date."
        />

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Active programs", value: String(programs.filter((p) => p.status === "ACTIVE").length) },
            { label: "Total savings", value: formatMoney(totalSavings, currency) },
            { label: "Current tier", value: dashboards[programs[0]?.uid]?.currentTierName || "—" },
          ].map((k, i) => (
            <article
              key={k.label}
              className="rounded-2xl border border-border/70 bg-surface p-5 animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
                {k.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
                {loading ? "…" : k.value}
              </p>
            </article>
          ))}
        </section>

        {loading ? (
          <div className="mt-6 h-40 animate-pulse rounded-xl bg-field" />
        ) : programs.length === 0 ? (
          <section className="rounded-[1.5rem] border border-border/70 bg-surface p-6 text-center">
            <p className="text-sm text-ink/55">No volume discount programs found for your account.</p>
          </section>
        ) : (
          programs.map((program) => {
            const dashboard = dashboards[program.uid];
            const progress = dashboard?.nextThreshold
              ? Math.min(100, (dashboard.cumulativeSpend / dashboard.nextThreshold) * 100)
              : 100;

            return (
              <section
                key={program.uid}
                className="rounded-[1.5rem] border border-border/70 bg-surface p-5 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                      Program
                    </p>
                    <h2 className="mt-1 text-base font-semibold tracking-tight text-ink">
                      {program.currency} Volume Discount
                    </h2>
                    <p className="text-xs text-ink/55 mt-1">
                      {program.periodStart} — {program.periodEnd}
                    </p>
                  </div>
                  <Badge
                    className="self-start"
                    variant={
                      program.status === "ACTIVE"
                        ? "success"
                        : program.status === "DRAFT"
                        ? "warning"
                        : "neutral"
                    }
                  >
                    {program.status}
                  </Badge>
                </div>

                {dashboard && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-ink/75">
                        {dashboard.currentTierName || "No tier"} ({dashboard.currentDiscountPct}% off)
                      </span>
                      <span className="tabular-nums text-ink/55">
                        {formatMoney(dashboard.cumulativeSpend, program.currency)} spent
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-field">
                      <div
                        className="h-full rounded-full bg-ink/80 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {dashboard.nextTierName && (
                      <p className="text-xs text-ink/55">
                        {formatMoney(
                          (dashboard.nextThreshold ?? 0) - dashboard.cumulativeSpend,
                          program.currency
                        )}{" "}
                        more to reach {dashboard.nextTierName} ({dashboard.nextDiscountPct}% off)
                      </p>
                    )}
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-ink/55">
                        Savings to date:{" "}
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {formatMoney(dashboard.savingsToDate, program.currency)}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </PortalAtmosphere>
  );
}
