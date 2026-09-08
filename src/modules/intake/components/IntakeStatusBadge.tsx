import React from "react";
import { PricingRequestStatus, ChatMode } from "../types";

type BadgeVariant = "neutral" | "info" | "warning" | "success" | "error";

const STATUS_CONFIG: Record<
  PricingRequestStatus,
  { variant: BadgeVariant; label: string }
> = {
  DRAFT: { variant: "neutral", label: "Draft" },
  IN_PROGRESS: { variant: "info", label: "In Progress" },
  SCOPE_GENERATED: { variant: "warning", label: "Scope Ready" },
  SCOPE_CONFIRMED: { variant: "success", label: "Scope Confirmed" },
  CANCELLED: { variant: "error", label: "Cancelled" },
};

const CHAT_MODE_CONFIG: Record<
  ChatMode,
  { variant: BadgeVariant; label: string }
> = {
  GENERAL: { variant: "neutral", label: "Open" },
  SCOPING: { variant: "info", label: "Scoping" },
  SCOPE_GENERATED: { variant: "warning", label: "Scope Ready" },
  SCOPE_CONFIRMED: { variant: "success", label: "Confirmed" },
};

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  neutral: "bg-canvas text-ink/80 border-border/60",
  info: "bg-blue-50 text-blue-700 border-blue-200/60",
  warning: "bg-amber-50 text-amber-700 border-amber-200/60",
  success: "bg-hover text-ink/80 border-border/60",
  error: "bg-red-50 text-red-700 border-red-200/60",
};

interface IntakeStatusBadgeProps {
  status: PricingRequestStatus;
  className?: string;
}

export function IntakeStatusBadge({ status, className = "" }: IntakeStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${VARIANT_STYLES[config.variant]} ${className}`}
    >
      {config.label}
    </span>
  );
}

interface ChatModeBadgeProps {
  chatMode: ChatMode;
  className?: string;
}

export function ChatModeBadge({ chatMode, className = "" }: ChatModeBadgeProps) {
  const config = CHAT_MODE_CONFIG[chatMode] ?? CHAT_MODE_CONFIG.GENERAL;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full border ${VARIANT_STYLES[config.variant]} ${className}`}
    >
      {config.label}
    </span>
  );
}
