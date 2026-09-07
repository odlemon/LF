"use client";

import React, { useState } from "react";
import { HiShieldExclamation, HiRefresh } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/utils/permissions";
import {
  useAnomalies,
  usePracticeAreas,
  useClients,
} from "@/modules/analytics/hooks/useAnalytics";
import { AnalyticsTabs } from "@/modules/analytics/components/AnalyticsTabs";
import { DetectorTuningPanel } from "@/modules/analytics/components/DetectorTuningPanel";
import { SeverityBadge, AnomalyStatusBadge } from "@/modules/analytics/components/badges";
import { AnomalyDetailDrawer } from "@/modules/analytics/components/AnomalyDetailDrawer";
import { ResolveAnomalyModal } from "@/modules/analytics/components/ResolveAnomalyModal";
import { formatAnomalyType, formatDateTime } from "@/modules/analytics/utils/format";
import type {
  AnomalyFlagResponse,
  AnomalyListParams,
  AnomalySeverity,
  AnomalyStatus,
  AnomalyType,
} from "@/modules/analytics/types";

const ALL = "ALL";

const SEVERITY_OPTIONS = [
  { value: ALL, label: "All severities" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const STATUS_OPTIONS = [
  { value: ALL, label: "All statuses" },
  { value: "OPEN", label: "Open" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "VALID_EXCEPTION", label: "Valid exception" },
];

const TYPE_OPTIONS = [
  { value: ALL, label: "All types" },
  { value: "MARGIN_BELOW_FLOOR", label: "Margin below floor" },
  { value: "MARGIN_BELOW_PA_AVG", label: "Margin below practice avg" },
  { value: "DISCOUNT_ABOVE_MAX", label: "Discount above max" },
  { value: "RATE_ABOVE_CARD", label: "Rate above card" },
  { value: "RATE_DEVIATION", label: "Rate deviation" },
  { value: "EXCESS_ROUNDS", label: "Excess rounds" },
  { value: "SCOPE_OVERRUN", label: "Scope overrun" },
];

export default function MarginMonitorPage() {
  const financeView = usePermission(PERMISSIONS.ANALYTICS_FINANCE_VIEW);
  const canResolve = usePermission(PERMISSIONS.ANOMALY_RESOLVE);

  const [severity, setSeverity] = useState<string>(ALL);
  const [status, setStatus] = useState<string>("OPEN");
  const [anomalyType, setAnomalyType] = useState<string>(ALL);

  const params: AnomalyListParams = {
    severity: severity !== ALL ? (severity as AnomalySeverity) : undefined,
    status: status !== ALL ? (status as AnomalyStatus) : undefined,
    anomalyType: anomalyType !== ALL ? (anomalyType as AnomalyType) : undefined,
  };

  const { data: anomalies, isLoading, error, refetch } = useAnomalies(params);
  const { data: practiceAreas } = usePracticeAreas();
  const { data: clients } = useClients();

  const [selected, setSelected] = useState<AnomalyFlagResponse | null>(null);
  const [resolving, setResolving] = useState<AnomalyFlagResponse | null>(null);

  if (!financeView) {
    return (
      <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-8">
        <AnalyticsTabs />
        <Alert
          variant="warning"
          message="The Margin Monitor requires finance analytics access (ANALYTICS_FINANCE_VIEW)."
        />
      </div>
    );
  }

  const practiceAreaName = (uid: string | null) =>
    uid ? practiceAreas?.find((p) => p.uid === uid)?.name ?? null : null;
  const clientName = (uid: string | null) =>
    uid ? clients?.find((c) => c.uid === uid)?.name ?? null : null;

  const openList = anomalies?.filter((a) => a.status === "OPEN") ?? [];
  const openCount = openList.length;
  const openHigh = openList.filter((a) => a.severity === "HIGH").length;
  const openMedium = openList.filter((a) => a.severity === "MEDIUM").length;
  const openLow = openList.filter((a) => a.severity === "LOW").length;

  return (
    <div className="p-8 max-w-7xl w-full mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Margin Monitor</h1>
            <p className="text-sm text-ink/55 mt-1">
              AI-flagged pricing anomalies — review, resolve or mark as valid exceptions.
            </p>
          </div>
          <Button variant="secondary" onClick={refetch} disabled={isLoading}>
            <HiRefresh className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <AnalyticsTabs />
      </div>

      {/* Detector performance sits above the queue: whether these flags are worth reading
          is the first question, and the answer changes how you read what follows. */}
      <DetectorTuningPanel />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-44">
          <Select options={SEVERITY_OPTIONS} value={severity} onChange={setSeverity} />
        </div>
        <div className="w-44">
          <Select options={STATUS_OPTIONS} value={status} onChange={setStatus} />
        </div>
        <div className="w-56">
          <Select options={TYPE_OPTIONS} value={anomalyType} onChange={setAnomalyType} />
        </div>
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading && !anomalies ? (
        <div className="flex flex-col gap-3 animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-field rounded-2xl" />
          ))}
        </div>
      ) : !anomalies || anomalies.length === 0 ? (
        <EmptyState
          title="No anomalies found"
          description={
            status === "OPEN"
              ? "Nothing flagged right now — pricing looks healthy for these filters."
              : "No anomalies match the current filters."
          }
          icon={<HiShieldExclamation className="w-5 h-5" />}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2 -mt-3">
            <p className="text-xs font-semibold text-ink/45">
              {anomalies.length} flag{anomalies.length === 1 ? "" : "s"} · Open anomalies: {openCount}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
              HIGH {openHigh}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              MEDIUM {openMedium}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5">
              LOW {openLow}
            </span>
          </div>

          {/* Anomaly cards */}
          <div className="flex flex-col gap-3">
            {anomalies.map((anomaly) => {
              const paName = practiceAreaName(anomaly.practiceAreaUid);
              const cName = clientName(anomaly.clientProfileUid);
              return (
                <button
                  key={anomaly.uid}
                  type="button"
                  onClick={() => setSelected(anomaly)}
                  className={`text-left bg-surface border rounded-2xl p-5 transition-all hover:border-ink/30 hover:shadow-sm cursor-pointer ${
                    anomaly.severity === "HIGH" && anomaly.status === "OPEN"
                      ? "border-red-200/80"
                      : "border-border/70"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge severity={anomaly.severity} />
                    <AnomalyStatusBadge status={anomaly.status} />
                    <span className="text-xs font-bold text-ink/75">
                      {formatAnomalyType(anomaly.anomalyType)}
                    </span>
                    {paName && (
                      <span className="text-[11px] font-semibold text-ink/45">· {paName}</span>
                    )}
                    {cName && (
                      <span className="text-[11px] font-semibold text-ink/45">· {cName}</span>
                    )}
                    <span className="ml-auto text-[11px] text-ink/40">
                      {formatDateTime(anomaly.createdAt)}
                    </span>
                  </div>

                  {anomaly.aiDescription ? (
                    <p className="mt-2.5 text-sm text-ink/75 leading-relaxed line-clamp-2">
                      {anomaly.aiDescription}
                    </p>
                  ) : (
                    <p className="mt-2.5 text-sm text-ink/55 leading-relaxed">
                      {anomaly.context ?? "No description available."}
                    </p>
                  )}

                  {anomaly.aiRootCause && (
                    <p className="mt-1.5 text-xs text-ink/50 leading-relaxed line-clamp-1">
                      <span className="font-bold text-ink/60">Root cause:</span>{" "}
                      {anomaly.aiRootCause}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-4 text-[11px] font-semibold text-ink/45 tabular-nums">
                    {anomaly.metricValue != null && (
                      <span>Value: {anomaly.metricValue.toLocaleString()}</span>
                    )}
                    {anomaly.thresholdValue != null && (
                      <span>Threshold: {anomaly.thresholdValue.toLocaleString()}</span>
                    )}
                    {anomaly.status !== "OPEN" && anomaly.resolutionNote && (
                      <span className="text-ink/55 truncate max-w-[420px]">
                        Note: {anomaly.resolutionNote}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Detail drawer */}
      <AnomalyDetailDrawer
        anomaly={selected}
        onClose={() => setSelected(null)}
        canResolve={canResolve}
        onResolve={(anomaly) => {
          setSelected(null);
          setResolving(anomaly);
        }}
      />

      {/* Resolution modal */}
      <ResolveAnomalyModal
        anomaly={resolving}
        onClose={() => setResolving(null)}
        onResolved={refetch}
      />
    </div>
  );
}
