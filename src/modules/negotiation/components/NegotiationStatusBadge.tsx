"use client";

import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { negotiationStatusLabel } from "../utils";

function negotiationStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "SENT":
      return "info";
    case "NEGOTIATING":
      return "warning";
    case "CLIENT_APPROVED":
      return "success";
    case "CLIENT_REJECTED":
    case "WITHDRAWN":
      return "error";
    default:
      return "neutral";
  }
}

export function NegotiationStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={negotiationStatusVariant(status)}>
      {negotiationStatusLabel(status)}
    </Badge>
  );
}
