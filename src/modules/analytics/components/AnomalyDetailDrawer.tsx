"use client";

import React from "react";
import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { AuditTrailPanel } from "@/components/shared/AuditTrailPanel";
import { SeverityBadge, AnomalyStatusBadge } from "./badges";
import { usePracticeAreas, useClients } from "../hooks/useAnalytics";
import { formatAnomalyType, formatDateTime, formatPct } from "../utils/format";
import type { AnomalyFlagResponse } from "../types";

interface AnomalyDetailDrawerProps {
  anomaly: AnomalyFlagResponse | null;
  onClose: () => void;
  canResolve: boolean;
  onResolve: (anomaly: AnomalyFlagResponse) => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/60 last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-wider text-ink/40 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-xs font-semibold text-ink/85 text-right">{value}</span>
    </div>
  );
}

export function AnomalyDetailDrawer({ anomaly, onClose, canResolve, onResolve }: AnomalyDetailDrawerProps) {
  const { data: practiceAreas } = usePracticeAreas();
  const { data: clients } = useClients();

  if (!anomaly) return null;

  const practiceAreaName = anomaly.practiceAreaUid
    ? practiceAreas?.find((p) => p.uid === anomaly.practiceAreaUid)?.name
    : undefined;
  const clientName = anomaly.clientProfileUid
    ? clients?.find((c) => c.uid === anomaly.clientProfileUid)?.name
    : undefined;

  const isPercentType =
    anomaly.anomalyType === "MARGIN_BELOW_FLOOR" ||
    anomaly.anomalyType === "MARGIN_BELOW_PA_AVG" ||
    anomaly.anomalyType === "DISCOUNT_ABOVE_MAX";

  const formatMetric = (value: number | null) =>
    value == null ? "—" : isPercentType ? formatPct(value) : value.toLocaleString();

  return (
    <Drawer isOpen={anomaly != null} onClose={onClose} title="Anomaly detail" size="lg">
      <div className="flex flex-col gap-6">
        {/* Header badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge severity={anomaly.severity} />
          <AnomalyStatusBadge status={anomaly.status} />
          <span className="text-xs font-bold text-ink/70">
            {formatAnomalyType(anomaly.anomalyType)}
          </span>
        </div>

        {/* AI insight */}
        {(anomaly.aiDescription || anomaly.aiRootCause) && (
          <div className="bg-surface border border-border/70 rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
              AI analysis
            </p>
            {anomaly.aiDescription && (
              <p className="text-sm text-ink/80 leading-relaxed">{anomaly.aiDescription}</p>
            )}
            {anomaly.aiRootCause && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-1">
                  Likely root cause
                </p>
                <p className="text-xs text-ink/65 leading-relaxed">{anomaly.aiRootCause}</p>
              </div>
            )}
          </div>
        )}

        {/* Facts */}
        <div className="bg-surface border border-border/70 rounded-2xl p-5">
          <DetailRow label="Metric value" value={formatMetric(anomaly.metricValue)} />
          <DetailRow label="Threshold" value={formatMetric(anomaly.thresholdValue)} />
          {practiceAreaName && <DetailRow label="Practice area" value={practiceAreaName} />}
          {clientName && <DetailRow label="Client" value={clientName} />}
          {anomaly.sourceUid && anomaly.sourceType === "NEGOTIATION" && (
            <DetailRow
              label="Negotiation"
              value={
                <Link
                  href={`/negotiations/${anomaly.sourceUid}`}
                  className="text-primary hover:underline font-bold py-1.5 -my-1.5 rounded"
                >
                  Open negotiation
                </Link>
              }
            />
          )}
          {anomaly.sourceUid && anomaly.sourceType === "SCENARIO" && (
            <DetailRow
              label="Scenario"
              value={<span className="tabular-nums">{anomaly.sourceUid.slice(0, 8)}…</span>}
            />
          )}
          <DetailRow label="Detected" value={formatDateTime(anomaly.createdAt)} />
          {anomaly.status !== "OPEN" && (
            <>
              <DetailRow label="Resolved" value={formatDateTime(anomaly.resolvedAt)} />
              {anomaly.resolutionNote && (
                <DetailRow label="Note" value={<span className="max-w-[260px] inline-block">{anomaly.resolutionNote}</span>} />
              )}
            </>
          )}
        </div>

        {/* Raw context */}
        {anomaly.context && (
          <div className="bg-field/40 border border-border/60 rounded-2xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-1.5">
              Context
            </p>
            <p className="text-xs text-ink/65 leading-relaxed whitespace-pre-wrap">{anomaly.context}</p>
          </div>
        )}

        {/* Action */}
        {anomaly.status === "OPEN" && canResolve && (
          <Button variant="primary" onClick={() => onResolve(anomaly)} className="self-start">
            Resolve anomaly
          </Button>
        )}

        {/* Audit trail */}
        <div className="bg-surface border border-border/70 rounded-2xl p-5">
          <AuditTrailPanel entityUid={anomaly.uid} title="Anomaly activity" maxRows={8} />
        </div>
      </div>
    </Drawer>
  );
}
