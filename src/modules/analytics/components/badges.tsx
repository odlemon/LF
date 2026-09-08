"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import type { AnomalySeverity, AnomalyStatus } from "../types";

/** HIGH red / MEDIUM amber / LOW neutral — per design spec. */
export function SeverityBadge({ severity }: { severity: AnomalySeverity }) {
  const variants: Record<AnomalySeverity, "error" | "warning" | "neutral"> = {
    HIGH: "error",
    MEDIUM: "warning",
    LOW: "neutral",
  };
  return <Badge variant={variants[severity]}>{severity}</Badge>;
}

export function AnomalyStatusBadge({ status }: { status: AnomalyStatus }) {
  const variants: Record<AnomalyStatus, "primary" | "success" | "info"> = {
    OPEN: "primary",
    RESOLVED: "success",
    VALID_EXCEPTION: "info",
  };
  const labels: Record<AnomalyStatus, string> = {
    OPEN: "Open",
    RESOLVED: "Resolved",
    VALID_EXCEPTION: "Valid exception",
  };
  return <Badge variant={variants[status]}>{labels[status]}</Badge>;
}

export function ConfidenceBadge({ confidence }: { confidence: string | null }) {
  if (!confidence) return <span className="text-ink/40">—</span>;
  const normalized = confidence.toUpperCase();
  const variant =
    normalized === "HIGH" ? "success" : normalized === "MEDIUM" ? "warning" : "neutral";
  return <Badge variant={variant}>{confidence}</Badge>;
}

/** Pricing power: positive = firm can push rates up. */
export function PricingPowerBadge({ pricingPower }: { pricingPower: boolean | null }) {
  if (pricingPower == null) return <span className="text-ink/40">—</span>;
  return pricingPower ? (
    <Badge variant="success">Positive</Badge>
  ) : (
    <Badge variant="neutral">Neutral</Badge>
  );
}
