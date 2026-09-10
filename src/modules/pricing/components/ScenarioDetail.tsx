"use client";

import { useEffect, useState } from "react";
import { HiOutlineExclamation } from "react-icons/hi";
import { getFeeEarnerLevels } from "@/lib/api/modules/firm.api";
import type { FeeEarnerLevel } from "@/modules/firm/types";
import { WhatIfPanel } from "./WhatIfPanel";
import { PartnerReturnBanner } from "./PartnerReturnBanner";
import { ScenarioChangeTrailPanel } from "./ScenarioChangeTrailPanel";
import { ComparablesPanel } from "./ComparablesPanel";
import { ConfidenceBreakdown } from "./ConfidenceBreakdown";
import {
  ScenarioStatusBadge,
  scenarioStatusMeta,
} from "./ScenarioStatusBadge";
import type { PricingScenario, UpdateScenarioCommand } from "../types";
import { PRICING_MODEL_LABELS } from "../types";
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

interface ScenarioDetailProps {
  scenario: PricingScenario | null;
  savingWhatIf: boolean;
  onWhatIf: (command: UpdateScenarioCommand) => Promise<void>;
}

export function ScenarioDetail({
  scenario,
  savingWhatIf,
  onWhatIf,
}: ScenarioDetailProps) {
  const [feeEarnerLevels, setFeeEarnerLevels] = useState<FeeEarnerLevel[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const levels = await getFeeEarnerLevels();
        if (!cancelled) setFeeEarnerLevels(levels);
      } catch {
        if (!cancelled) setFeeEarnerLevels([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!scenario) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 text-center bg-surface">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
          Detail
        </p>
        <p className="mt-2 text-sm text-ink/60 max-w-[14rem] leading-relaxed">
          Select a scenario to review the breakdown and adjust levers
        </p>
      </div>
    );
  }

  const editable =
    scenario.status === "DRAFT" ||
    scenario.status === "RETURNED_FOR_CORRECTION";

  const lines = scenario.lines ?? [];
  const byPhase = new Map<string, typeof lines>();
  for (const line of lines) {
    const key = line.phaseName || "Other";
    if (!byPhase.has(key)) byPhase.set(key, []);
    byPhase.get(key)!.push(line);
  }

  const metrics = [
    {
      label: "Margin",
      value: `${Number(scenario.marginPct).toFixed(1)}%`,
    },
    {
      label: "Est. cost",
      value: formatMoney(Number(scenario.estimatedCost), scenario.currency),
    },
    {
      label: "Effort",
      value: `${Number(scenario.hoursMultiplier || 1).toFixed(2)}×`,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-surface min-h-0">
      <div className="relative shrink-0 px-7 pt-7 pb-5 border-b border-border/50">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
                {PRICING_MODEL_LABELS[scenario.pricingModel]}
              </p>
              {scenario.preferred && (
                <span className="rounded-md bg-ink px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-on-primary">
                  Preferred
                </span>
              )}
              <ScenarioStatusBadge status={scenario.status} size="sm" />
            </div>
            <h2 className="mt-2 text-xl font-semibold text-ink tracking-tight leading-snug">
              {scenario.name}
            </h2>
          </div>
        </div>

        <p
          key={`${scenario.id}-${scenario.grossFees}`}
          className="pricing-fee-tick mt-6 text-[2.35rem] font-semibold tabular-nums text-ink tracking-tight leading-none"
        >
          {formatMoney(Number(scenario.grossFees), scenario.currency)}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-xl border border-border/50 bg-canvas/60 px-3 py-2.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/60">
                {m.label}
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums text-ink tracking-tight">
                {m.value}
              </p>
            </div>
          ))}
          <div className="rounded-xl border border-border/50 bg-canvas/60 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/60">
              Confidence
            </p>
            <div className="mt-1 text-sm font-semibold tabular-nums text-ink tracking-tight">
              <ConfidenceBreakdown
                confidence={scenario.aiConfidence}
                drivers={scenario.confidenceDrivers}
                method={scenario.confidenceMethod}
              />
            </div>
          </div>
        </div>

        {scenario.generationMode && scenario.generationMode !== "AGENT" && (
          <div className="mt-5 rounded-xl border border-border bg-field px-4 py-3 flex items-start gap-2.5">
            <HiOutlineExclamation className="w-4 h-4 text-ink/60 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink/80">
                Priced from your scope and rate card without the AI agent.
              </p>
              {scenario.generationNote && (
                <p className="mt-0.5 text-[12px] text-ink/60 leading-relaxed">
                  {scenario.generationNote}
                </p>
              )}
            </div>
          </div>
        )}

        {scenario.aiReasoning && (
          <p className="mt-5 text-[13px] leading-relaxed text-ink/60 border-l-2 border-ink/15 pl-3">
            {scenario.aiReasoning}
          </p>
        )}
      </div>

      <div className="relative flex-1 overflow-y-auto rates-scrollable px-7 py-6 space-y-8 min-h-0">
        {(scenario.status === "RETURNED_FOR_CORRECTION" ||
          (isAwaitingDecision(scenario.status) && scenario.returnComment)) &&
          scenario.returnComment && (
            <PartnerReturnBanner
              comment={scenario.returnComment}
              partnerName={scenario.assignedPartnerName || scenario.decidedByEmail}
              decidedAt={scenario.decidedAt}
              tone={
                scenario.status === "RETURNED_FOR_CORRECTION"
                  ? "correction"
                  : "review"
              }
            />
          )}

        {(scenario.changeSummaryJson ||
          scenario.status === "RETURNED_FOR_CORRECTION") && (
          <ScenarioChangeTrailPanel
            changeSummaryJson={scenario.changeSummaryJson}
            currency={scenario.currency}
            dense
          />
        )}

        <ComparablesPanel requestUid={scenario.pricingRequestUid} scenarioUid={scenario.id} />

        {editable ? (
          <WhatIfPanel
            scenario={scenario}
            saving={savingWhatIf}
            feeEarnerLevels={feeEarnerLevels ?? []}
            onApply={onWhatIf}
          />
        ) : (
          <>
            <div className="rounded-xl border border-border/60 bg-field/50 px-4 py-3">
              <p className="text-xs font-semibold text-ink/70">
                Editing locked
              </p>
              <p className="mt-1 text-[11px] text-ink/60 leading-relaxed">
                This scenario is{" "}
                <span className="font-semibold text-ink/60">
                  {scenarioStatusMeta(scenario.status).label.toLowerCase()}
                </span>
                . Adjustments are only available while drafting or correcting
                {isAwaitingDecision(scenario.status)
                  ? " — ask the reviewer to return it first"
                  : ""}
                .
              </p>
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-3 mb-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
                  Fee breakdown
                </h4>
                <span className="text-[11px] tabular-nums text-ink/60">
                  {lines.length} line{lines.length === 1 ? "" : "s"}
                </span>
              </div>
              {lines.length === 0 ? (
                <p className="text-sm text-ink/60">No line items</p>
              ) : (
                <div className="space-y-6">
                  {[...byPhase.entries()].map(([phase, phaseLines]) => {
                    const phaseTotal = phaseLines.reduce(
                      (sum, l) => sum + Number(l.amount || 0),
                      0
                    );
                    return (
                      <div key={phase}>
                        <div className="flex items-baseline justify-between gap-2 mb-2.5">
                          <p className="text-[13px] font-semibold text-ink tracking-tight">
                            {phase}
                          </p>
                          <p className="text-xs tabular-nums font-semibold text-ink/60">
                            {formatMoney(phaseTotal, scenario.currency)}
                          </p>
                        </div>
                        <ul className="rounded-xl border border-border/50 overflow-hidden bg-canvas/40 divide-y divide-border/40">
                          {phaseLines.map((line) => (
                            <li
                              key={line.id}
                              className="flex items-start justify-between gap-3 px-3.5 py-3 text-sm"
                            >
                              <div className="min-w-0">
                                <p className="text-ink/90 truncate font-medium">
                                  {line.description ||
                                    line.feeEarnerLevelName ||
                                    "Task"}
                                </p>
                                <p className="text-[11px] text-ink/60 mt-0.5 tabular-nums">
                                  {Number(line.hours).toFixed(1)}h ·{" "}
                                  {formatMoney(
                                    Number(line.hourlyRate),
                                    scenario.currency
                                  )}
                                  /h
                                  {line.feeEarnerLevelCode
                                    ? ` · ${line.feeEarnerLevelCode}`
                                    : ""}
                                </p>
                              </div>
                              <span className="tabular-nums font-semibold text-ink shrink-0">
                                {formatMoney(
                                  Number(line.amount),
                                  scenario.currency
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
