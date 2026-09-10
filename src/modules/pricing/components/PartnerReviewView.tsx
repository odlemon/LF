"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DecisionModal } from "./DecisionModal";
import { PartnerReturnBanner } from "./PartnerReturnBanner";
import { ScenarioChangeTrailPanel } from "./ScenarioChangeTrailPanel";
import { ConfidenceBreakdown } from "./ConfidenceBreakdown";
import { ComparablesPanel } from "./ComparablesPanel";
import {
  GuardrailStrip,
  ClientContextSection,
  ScopeSummarySection,
} from "./ApprovalPackSections";
import { useApprovalPack } from "../hooks/useApprovalPack";
import {
  ScenarioStageRail,
  ScenarioStatusBadge,
  scenarioStatusMeta,
} from "./ScenarioStatusBadge";
import type { PricingScenario } from "../types";
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

interface PartnerReviewViewProps {
  matterTitle: string;
  clientName: string;
  scenario: PricingScenario;
  deciding: boolean;
  onDecide: (
    action: "approve" | "reject" | "return",
    comment?: string
  ) => Promise<void>;
  onBack: () => void;
  /** When approved, partner can open the send-to-client flow. */
  onSendToClient?: () => void;
}

export function PartnerReviewView({
  matterTitle,
  clientName,
  scenario,
  deciding,
  onDecide,
  onBack,
  onSendToClient,
}: PartnerReviewViewProps) {
  const [decision, setDecision] = useState<"approve" | "reject" | "return" | null>(
    null
  );
  const { data: pack } = useApprovalPack(scenario.id);
  const lines = scenario.lines ?? [];
  const byPhase = new Map<string, typeof lines>();
  for (const line of lines) {
    const key = line.phaseName || "Other";
    if (!byPhase.has(key)) byPhase.set(key, []);
    byPhase.get(key)!.push(line);
  }

  const pending = isAwaitingDecision(scenario.status);
  const canSend = scenario.status === "APPROVED" && !!onSendToClient;

  // Sum of the priced lines, for the rounding note above.
  const lineTotal = (scenario.lines ?? []).reduce(
    (sum, l) => sum + Number(l.amount ?? 0),
    0
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-canvas relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 80% 0%, rgba(10,10,10,0.05), transparent 55%)",
        }}
      />

      <div className="relative flex items-center justify-between px-6 py-3.5 border-b border-border bg-surface shrink-0">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
            Partner review
          </p>
          <h1 className="text-base font-semibold text-ink truncate tracking-tight mt-0.5">
            {matterTitle}
          </h1>
          <p className="text-xs text-ink/60 truncate mt-0.5">{clientName}</p>
        </div>
        <Button variant="secondary" onClick={onBack}>
          Back to approvals
        </Button>
      </div>

      <div className="relative flex-1 overflow-y-auto rates-scrollable">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <div className="rounded-[1.75rem] bg-band text-on-primary p-6 sm:p-8 shadow-[0_20px_50px_rgba(10,10,10,0.16)]">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-on-primary/45">
                Preferred scenario ·{" "}
                {PRICING_MODEL_LABELS[scenario.pricingModel] ?? scenario.pricingModel}
              </p>
              <ScenarioStatusBadge status={scenario.status} size="sm" />
            </div>
            <p className="mt-2 text-xl font-semibold tracking-tight">{scenario.name}</p>
            <p className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight tabular-nums">
              {formatMoney(Number(scenario.grossFees), scenario.currency)}
            </p>
            {/* A fixed fee is rounded to a quotable number, so it rarely equals the time value
                below it. Saying so stops a partner reconciling a difference that is intentional. */}
            {scenario.pricingModel === "FIXED_FEE" && lineTotal > 0
              && Math.abs(lineTotal - Number(scenario.grossFees)) >= 1 && (
              <p className="mt-1.5 text-[11px] text-on-primary/50">
                Rounded for quoting · time value{" "}
                {formatMoney(lineTotal, scenario.currency)}
              </p>
            )}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-primary/40">
                  Margin
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {Number(scenario.marginPct).toFixed(1)}%
                  {scenario.costBasis === "RATIO" && (
                    <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-warning">
                      est.
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-primary/40">
                  Est. cost
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {formatMoney(Number(scenario.estimatedCost), scenario.currency)}
                </p>
              </div>
              {scenario.aiConfidence != null && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-primary/40">
                    AI confidence
                  </p>
                  <div className="mt-1 text-lg font-semibold tabular-nums">
                    <ConfidenceBreakdown
                      confidence={scenario.aiConfidence}
                      drivers={scenario.confidenceDrivers}
                      method={scenario.confidenceMethod}
                      onDark
                    />
                  </div>
                </div>
              )}
            </div>
            {scenario.submittedByEmail && (
              <p className="mt-5 text-xs text-on-primary/40">
                Submitted by {scenario.submittedByEmail}
                {scenario.submittedAt
                  ? ` · ${new Date(scenario.submittedAt).toLocaleString()}`
                  : ""}
              </p>
            )}
          </div>

          {pack && (
            <div className="mt-5">
              <GuardrailStrip pack={pack} currency={scenario.currency} />
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-border/70 bg-surface overflow-hidden">
            <div className="px-5 py-4">
              <ScenarioStageRail status={scenario.status} />
            </div>
            {canSend && (
              <div className="border-t border-border/60 bg-gradient-to-r from-field/50 via-surface to-surface px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
                    Next step
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink tracking-tight">
                    Send approved rates to {clientName}
                  </p>
                  <p className="mt-0.5 text-xs text-ink/60 leading-relaxed">
                    Opens negotiation on the portal — no need to pick the client
                    again.
                  </p>
                </div>
                <Button
                  variant="cta"
                  className="shrink-0 self-stretch sm:self-auto"
                  onClick={onSendToClient}
                >
                  Send to client
                </Button>
              </div>
            )}
          </div>

          {pack && (
            <div className="mt-5">
              <ClientContextSection pack={pack} />
            </div>
          )}

          {scenario.returnComment && (
            <div className="mt-5">
              <PartnerReturnBanner
                comment={scenario.returnComment}
                partnerName={null}
                decidedAt={scenario.decidedAt}
                tone="review"
              />
            </div>
          )}

          {scenario.changeSummaryJson && (
            <div className="mt-5">
              <ScenarioChangeTrailPanel
                changeSummaryJson={scenario.changeSummaryJson}
                currency={scenario.currency}
              />
            </div>
          )}

          {scenario.aiReasoning && (
            <section className="mt-6 rounded-2xl border border-border/70 bg-surface p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
                Why this price
              </p>
              <p className="mt-3 text-sm text-ink/70 leading-relaxed whitespace-pre-wrap">
                {scenario.aiReasoning}
              </p>
            </section>
          )}

          {pack && (
            <div className="mt-6">
              <ScopeSummarySection pack={pack} currency={scenario.currency} />
            </div>
          )}

          <div className="mt-6">
            <ComparablesPanel
              requestUid={scenario.pricingRequestUid}
              scenarioUid={scenario.id}
            />
          </div>

          <section className="mt-6 rounded-2xl border border-border/70 bg-surface overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-border/60">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
                Fee breakdown
              </p>
              <h2 className="mt-1 text-base font-semibold text-ink tracking-tight">
                Read-only · no what-if on partner review
              </h2>
            </div>
            <div className="divide-y divide-border/50">
              {[...byPhase.entries()].map(([phase, phaseLines]) => (
                <div key={phase} className="px-5 sm:px-6 py-4">
                  <p className="text-xs font-semibold text-ink/60 mb-2">{phase}</p>
                  <ul className="space-y-2">
                    {phaseLines.map((line) => (
                      <li
                        key={line.id}
                        className="flex items-start justify-between gap-4 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="text-ink/80 font-medium truncate">
                            {line.description || line.feeEarnerLevelName || "Line"}
                          </p>
                          <p className="text-[11px] text-ink/60 mt-0.5">
                            {Number(line.hours).toFixed(1)}h ·{" "}
                            {formatMoney(Number(line.hourlyRate), scenario.currency)}
                            /h
                          </p>
                        </div>
                        <p className="font-semibold tabular-nums text-ink shrink-0">
                          {formatMoney(Number(line.amount), scenario.currency)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {lines.length === 0 && (
                <p className="px-5 py-8 text-sm text-ink/60 text-center">
                  No line items on this scenario.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>

      {(pending || !canSend) && (
        <div className="relative shrink-0 border-t border-border bg-surface/95 backdrop-blur-sm px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink/60 max-w-md">
            {pending
              ? scenario.changeSummaryJson
                ? "Review the change trail against your correction request, then decide."
                : "Your call: approve to progress, reject to stop, or return for the team to rework."
              : scenarioStatusMeta(scenario.status).hint ||
                scenarioStatusMeta(scenario.status).label}
          </p>
          {pending && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                loading={deciding}
                onClick={() => setDecision("return")}
              >
                Return
              </Button>
              <Button
                variant="secondary"
                loading={deciding}
                onClick={() => setDecision("reject")}
              >
                Reject
              </Button>
              <Button
                variant="cta"
                loading={deciding}
                onClick={() => setDecision("approve")}
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      )}

      <DecisionModal
        open={decision !== null}
        title={
          decision === "approve"
            ? "Approve scenario"
            : decision === "reject"
              ? "Reject scenario"
              : "Return for correction"
        }
        confirmLabel={
          decision === "approve"
            ? "Approve"
            : decision === "reject"
              ? "Reject"
              : "Return"
        }
        loading={deciding}
        requireComment={decision === "reject" || decision === "return"}
        onClose={() => setDecision(null)}
        onConfirm={async (comment) => {
          if (!decision) return;
          try {
            await onDecide(decision, comment);
            setDecision(null);
          } catch {
            /* toast in hook */
          }
        }}
      />
    </div>
  );
}
