"use client";

import React, { useEffect, useState } from "react";
import { analyticsApi } from "@/lib/api/modules/analytics.api";
import type { ClientIntelligence, ClientSignal } from "@/modules/analytics/types";

interface Props {
  clientProfileUid: string;
}

const TONE_STYLES: Record<string, { chip: string; label: string }> = {
  RISK: { chip: "bg-red-50 text-red-700", label: "Risk" },
  WATCH: { chip: "bg-amber-50 text-amber-700", label: "Watch" },
  OPPORTUNITY: { chip: "bg-sky-50 text-sky-700", label: "Opportunity" },
  POSITIVE: { chip: "bg-emerald-50 text-emerald-700", label: "Healthy" },
  NEUTRAL: { chip: "bg-field text-ink/50", label: "Note" },
};

function money(value: number | null): string {
  if (value === null) return "—";
  if (Math.abs(value) >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}m`;
  if (Math.abs(value) >= 1_000) return `£${(value / 1_000).toFixed(0)}k`;
  return `£${value.toFixed(0)}`;
}

function pct(value: number | null, digits = 1): string {
  return value === null ? "—" : `${value.toFixed(digits)}%`;
}

/**
 * Direction is shown only when there is a comparable prior figure AND enough settled matters
 * in both periods for the movement to mean anything. Showing "+100 pts" off a single matter
 * while the panel simultaneously says trends are unreliable would contradict itself.
 */
function Change({
  value,
  suffix,
  goodWhenUp = true,
  reliable = true,
}: {
  value: number | null;
  suffix: string;
  goodWhenUp?: boolean;
  reliable?: boolean;
}) {
  if (!reliable) {
    return <span className="text-[11px] text-ink/30">too little history</span>;
  }
  if (value === null) {
    return <span className="text-[11px] text-ink/30">no prior period</span>;
  }
  const rounded = Math.round(value * 10) / 10;
  if (Math.abs(rounded) < 0.05) {
    return <span className="text-[11px] text-ink/40">flat</span>;
  }
  const good = goodWhenUp ? rounded > 0 : rounded < 0;
  return (
    <span className={`text-[11px] tabular-nums ${good ? "text-emerald-700" : "text-amber-700"} dark:text-emerald-400`}>
      {rounded > 0 ? "+" : ""}
      {rounded}
      {suffix}
    </span>
  );
}

function Metric({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-field/40 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="mt-1">{change}</p>
    </div>
  );
}

/**
 * Relationship intelligence on the client profile, where the relationship partner already is.
 * Deliberately not a separate destination — a page nobody opens delivers nothing.
 */
export function ClientIntelligencePanel({ clientProfileUid }: Props) {
  const [data, setData] = useState<ClientIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    analyticsApi
      .getClientIntelligence(clientProfileUid)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        // A user without analytics access simply does not see this section.
        if (!cancelled) {
          setDenied(err?.response?.status === 403);
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [clientProfileUid]);

  if (denied) return null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/60 bg-surface p-6 shadow-sm">
        <div className="h-4 w-44 animate-pulse rounded bg-field" />
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-field/60" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-surface p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2">
        <h2 className="text-sm font-bold text-ink">Relationship Intelligence</h2>
        <p className="text-[11px] text-ink/45">
          {data.periodFrom} → {data.periodTo}, against the same period a year earlier
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric
          label="Revenue"
          value={money(data.revenueBilled)}
          change={
            <Change
              value={data.revenueChangePct}
              suffix="%"
              reliable={data.trendReliable}
            />
          }
        />
        <Metric
          label="Avg margin"
          value={pct(data.avgMarginPct)}
          change={
            <Change
              value={data.marginChangePts}
              suffix=" pts"
              reliable={data.trendReliable}
            />
          }
        />
        <Metric
          label="Avg discount"
          value={pct(data.avgDiscountPct)}
          change={
            <Change
              value={data.discountChangePts}
              suffix=" pts"
              goodWhenUp={false}
              reliable={data.trendReliable}
            />
          }
        />
        <Metric
          label="Win rate"
          value={pct(data.winRatePct, 0)}
          change={
            <Change
              value={data.winRateChangePts}
              suffix=" pts"
              reliable={data.trendReliable}
            />
          }
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric
          label="Rounds to close"
          value={data.avgRoundsToClose === null ? "—" : data.avgRoundsToClose.toFixed(1)}
          change={<span className="text-[11px] text-ink/40">how hard they negotiate</span>}
        />
        <Metric
          label="Days to close"
          value={data.avgDaysToClose === null ? "—" : data.avgDaysToClose.toFixed(0)}
          change={<span className="text-[11px] text-ink/40">sent → decision</span>}
        />
        <Metric
          label="Practice areas"
          value={`${data.practiceAreasUsed} / ${data.practiceAreasAvailable}`}
          change={<span className="text-[11px] text-ink/40">instructed</span>}
        />
        <Metric
          label="Discount given"
          value={money(data.discountCost)}
          change={<span className="text-[11px] text-ink/40">this period</span>}
        />
      </div>

      {!data.trendReliable && (
        <p className="mt-4 rounded-xl border border-border bg-field/50 p-3 text-xs text-ink/55">
          Too few settled matters in one of the two periods to read a reliable year-on-year
          trend, so movement signals are suppressed rather than reported from a single matter.
        </p>
      )}

      <div className="mt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">Signals</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {data.signals.map((signal: ClientSignal, i: number) => {
            const tone = TONE_STYLES[signal.tone] ?? TONE_STYLES.NEUTRAL;
            return (
              <li key={`${signal.title}-${i}`} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tone.chip}`}
                >
                  {tone.label}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{signal.title}</p>
                  <p className="text-[13px] leading-relaxed text-ink/55">{signal.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {data.practiceAreasUnusedNames.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
            Never instructed
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.practiceAreasUnusedNames.map((name) => (
              <span
                key={name}
                className="rounded-full border border-border bg-field px-2.5 py-1 text-xs text-ink/60"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
