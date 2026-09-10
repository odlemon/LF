"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { useScenarioComparables } from "../hooks/useScenarioComparables";

function formatMoney(amount: number | null, currency: string | null | undefined) {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency ?? ""} ${Math.round(amount).toLocaleString()}`;
  }
}

function varianceTone(pct: number | null) {
  if (pct == null) return "text-ink/60";
  if (pct > 10) return "text-red-700";
  if (pct < -10) return "text-ink/60";
  return "text-ink/70";
}

interface ComparablesPanelProps {
  requestUid: string;
  scenarioUid: string;
}

export function ComparablesPanel({ requestUid, scenarioUid }: ComparablesPanelProps) {
  const { data, isLoading } = useScenarioComparables(requestUid, scenarioUid);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
          Comparable matters
        </h4>
        {data && data.length > 0 && (
          <span className="text-[11px] tabular-nums text-ink/60">{data.length}</span>
        )}
      </div>
      <p className="text-[12px] text-ink/60 mb-4">
        The past matters this price was built from.
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-field animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No comparables recorded"
          description="This scenario was generated before comparable tracking was enabled."
        />
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left text-[12px] min-w-[640px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-ink/60">
                <th className="font-semibold px-1 py-1.5">Matter</th>
                <th className="font-semibold px-1 py-1.5">Practice</th>
                <th className="font-semibold px-1 py-1.5 text-right">Fee</th>
                <th className="font-semibold px-1 py-1.5 text-right">Est. vs actual</th>
                <th className="font-semibold px-1 py-1.5 text-right">Hours var.</th>
                <th className="font-semibold px-1 py-1.5 text-right">Margin</th>
                <th className="font-semibold px-1 py-1.5">Outcome</th>
                <th className="font-semibold px-1 py-1.5 text-right">Match</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {data.map((c) => (
                <tr key={c.uid} className="align-top">
                  <td className="px-1 py-2 max-w-[220px]">
                    <p className="font-medium text-ink/85 truncate">{c.matterTitle || "—"}</p>
                    {c.matterReference && (
                      <p className="text-[10px] text-ink/60">{c.matterReference}</p>
                    )}
                  </td>
                  <td className="px-1 py-2 text-ink/60">{c.practiceAreaCode || "—"}</td>
                  <td className="px-1 py-2 text-right tabular-nums text-ink/80">
                    {formatMoney(c.totalFee, c.currency)}
                  </td>
                  <td className={`px-1 py-2 text-right tabular-nums ${varianceTone(c.feeVariancePct)}`}>
                    {c.feeVariancePct != null
                      ? `${c.feeVariancePct > 0 ? "+" : ""}${c.feeVariancePct.toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="px-1 py-2 text-right tabular-nums text-ink/60">
                    {c.hoursVariancePct != null ? `${c.hoursVariancePct.toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-1 py-2 text-right tabular-nums text-ink/60">
                    {c.marginPct != null ? `${c.marginPct.toFixed(1)}%` : "—"}
                  </td>
                  <td className="px-1 py-2 text-ink/60">{c.outcome || "—"}</td>
                  <td
                    className="px-1 py-2 text-right tabular-nums font-medium text-ink/70"
                    title={c.matchReasons.join(", ")}
                  >
                    {Math.round(c.similarityScore * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
