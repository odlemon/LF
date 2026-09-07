"use client";

import React from "react";
import type { AnomalySeverity, AnomalyStatus } from "../types";

/** HIGH red / MEDIUM amber / LOW gray — per design spec. */
export function SeverityBadge({ severity }: { severity: AnomalySeverity }) {
  const styles: Record<AnomalySeverity, string> = {
    HIGH: "bg-red-50 text-red-700 border-red-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    LOW: "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${styles[severity]}`}
    >
      {severity}
    </span>
  );
}

export function AnomalyStatusBadge({ status }: { status: AnomalyStatus }) {
  const styles: Record<AnomalyStatus, string> = {
    OPEN: "bg-primary/10 text-ink/80 border-border",
    RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    VALID_EXCEPTION: "bg-sky-50 text-sky-700 border-sky-200",
  };
  const labels: Record<AnomalyStatus, string> = {
    OPEN: "Open",
    RESOLVED: "Resolved",
    VALID_EXCEPTION: "Valid exception",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: string | null }) {
  if (!confidence) return <span className="text-ink/40">—</span>;
  const normalized = confidence.toUpperCase();
  const styles =
    normalized === "HIGH"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : normalized === "MEDIUM"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${styles}`}
    >
      {confidence}
    </span>
  );
}

/** Pricing power: positive = firm can push rates up. */
export function PricingPowerBadge({ pricingPower }: { pricingPower: boolean | null }) {
  if (pricingPower == null) return <span className="text-ink/40">—</span>;
  return pricingPower ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200">
      Positive
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider bg-gray-100 text-gray-600 border-gray-200">
      Neutral
    </span>
  );
}
