"use client";

import { PRICING_MODEL_LABELS, type PricingScenario } from "../types";
import { ScenarioStatusBadge } from "./ScenarioStatusBadge";
import { ConfidenceBreakdown } from "./ConfidenceBreakdown";
import { isAwaitingDecision } from "../types";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}

interface ScenarioCardProps {
  scenario: PricingScenario;
  selected: boolean;
  index: number;
  onSelect: () => void;
}

export function ScenarioCard({
  scenario,
  selected,
  index,
  onSelect,
}: ScenarioCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{ animationDelay: `${index * 80}ms` }}
      className={`pricing-scenario-enter group relative w-full text-left overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
        selected
          ? "border-ink/25 bg-surface shadow-[0_20px_50px_-32px_rgba(10,10,10,0.55)]"
          : "border-border/80 bg-surface/70 hover:border-ink/15 hover:bg-surface"
      }`}
    >
      <span
        className={`absolute inset-y-0 left-0 w-[3px] transition-colors ${
          selected ? "bg-ink" : "bg-transparent group-hover:bg-ink/20"
        }`}
        aria-hidden
      />

      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/40">
                {PRICING_MODEL_LABELS[scenario.pricingModel] ??
                  scenario.pricingModel}
              </p>
              {scenario.preferred && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-ink/70">
                  Preferred
                </span>
              )}
            </div>
            <h3 className="mt-1.5 text-[15px] font-semibold text-ink tracking-tight truncate">
              {scenario.name}
            </h3>
            <div className="mt-2.5">
              <ScenarioStatusBadge status={scenario.status} size="sm" />
            </div>
          </div>
          {scenario.aiConfidence != null && (
            <div className="shrink-0 pt-0.5">
              <ConfidenceBreakdown
                confidence={scenario.aiConfidence}
                drivers={scenario.confidenceDrivers}
                method={scenario.confidenceMethod}
                compact
              />
            </div>
          )}
        </div>

        <p className="mt-5 text-[1.75rem] font-semibold tracking-tight text-ink tabular-nums leading-none">
          {formatMoney(Number(scenario.grossFees), scenario.currency)}
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs text-ink/45">
          <span className="tabular-nums font-medium text-ink/60">
            {Number(scenario.marginPct).toFixed(1)}% margin
            {scenario.costBasis === "RATIO" && (
              <span
                className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-warning"
                title="Estimated from the firm's target cost ratio — add cost rates to fee earner levels for a costed margin"
              >
                est.
              </span>
            )}
          </span>
          {scenario.assignedPartnerName &&
            (isAwaitingDecision(scenario.status) ||
              scenario.status === "RETURNED_FOR_CORRECTION") && (
              <>
                <span className="text-ink/20">·</span>
                <span className="truncate">
                  {scenario.status === "RETURNED_FOR_CORRECTION"
                    ? `Back to ${scenario.assignedPartnerName}`
                    : `With ${scenario.assignedPartnerName}`}
                </span>
              </>
            )}
        </div>
      </div>
    </div>
  );
}
