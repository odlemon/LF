"use client";

import React from "react";

interface Props {
  consumed: number;
  entitlement: number | null;
  usagePct: number | null;
  overage: number;
}

/**
 * Consumption against contracted entitlement. Deliberately informational — passing 100%
 * never blocks anything, it only changes what this bar says.
 */
export function EntitlementBar({ consumed, entitlement, usagePct, overage }: Props) {
  const hasEntitlement = entitlement !== null && entitlement > 0;
  const pct = usagePct ?? 0;
  const clamped = Math.min(pct, 100);

  const band =
    pct >= 100 ? "over" : pct >= 90 ? "high" : pct >= 75 ? "warn" : "ok";

  const barColour = {
    ok: "bg-emerald-500",
    warn: "bg-amber-500",
    high: "bg-orange-500",
    over: "bg-red-500",
  }[band];

  const label = {
    ok: "Within entitlement",
    warn: "Approaching entitlement",
    high: "Close to entitlement",
    over: "Over entitlement",
  }[band];

  return (
    <div className="rounded-[1.5rem] border border-border bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">
            AI credits this period
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink tabular-nums">
            {consumed.toLocaleString(undefined, { maximumFractionDigits: 3 })}
            {hasEntitlement && (
              <span className="text-lg font-normal text-ink/40">
                {" / "}
                {entitlement!.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            )}
          </p>
        </div>
        {hasEntitlement && (
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums text-ink">{pct}%</p>
            <p className="text-xs text-ink/50">{label}</p>
          </div>
        )}
      </div>

      {hasEntitlement ? (
        <>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-field">
            <div
              className={`h-full rounded-full transition-all ${barColour}`}
              style={{ width: `${clamped}%` }}
            />
          </div>
          {overage > 0 && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {overage.toLocaleString(undefined, { maximumFractionDigits: 3 })} credits over
              entitlement. Work is never blocked — this is carried to your next invoice.
            </p>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-ink/50">
          No contracted entitlement recorded for this firm, so consumption is tracked without a
          ceiling. Add a contract to see usage against entitlement.
        </p>
      )}
    </div>
  );
}
