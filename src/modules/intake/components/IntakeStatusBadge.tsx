import React from "react";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { PricingRequestStatus, ChatMode } from "../types";

const STATUS_CONFIG: Record<
  PricingRequestStatus,
  { variant: BadgeVariant; label: string }
> = {
  DRAFT: { variant: "neutral", label: "Draft" },
  IN_PROGRESS: { variant: "info", label: "In Progress" },
  SCOPE_GENERATED: { variant: "warning", label: "Scope Ready" },
  SCOPE_CONFIRMED: { variant: "success", label: "Confirmed" },
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

interface IntakeStatusBadgeProps {
  status: PricingRequestStatus;
  className?: string;
}

export function IntakeStatusBadge({ status, className = "" }: IntakeStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

interface ChatModeBadgeProps {
  chatMode: ChatMode;
  className?: string;
}

export function ChatModeBadge({ chatMode, className = "" }: ChatModeBadgeProps) {
  const config = CHAT_MODE_CONFIG[chatMode] ?? CHAT_MODE_CONFIG.GENERAL;
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
