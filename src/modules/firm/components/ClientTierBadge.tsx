import React from "react";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";

const TIER_VARIANT: Record<string, BadgeVariant> = {
  STRATEGIC: "primary",
  PREFERRED: "info",
  STANDARD: "neutral",
};

export function ClientTierBadge({ tier }: { tier: string }) {
  return <Badge variant={TIER_VARIANT[tier] ?? "neutral"}>{tier}</Badge>;
}
