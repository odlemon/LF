"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/utils/permissions";
import { useAnalyticsScope } from "../useAnalyticsScope";

interface TabDef {
  label: string;
  route: string;
  permission?: string;
  /** Hidden from CRM-restricted users, who the server will refuse anyway. */
  firmWideOnly?: boolean;
}

const TABS: TabDef[] = [
  // Firm-wide financials. The server restricts these to non-CRM roles, so the tabs follow.
  { label: "Firm Health", route: "/analytics", firmWideOnly: true },
  { label: "Win Rate", route: "/analytics/win-rate", firmWideOnly: true },
  { label: "Rate Recommendations", route: "/analytics/rate-recommendations", permission: PERMISSIONS.RATE_RECOMMENDATION_READ },
  { label: "Margin Monitor", route: "/analytics/margin-monitor", permission: PERMISSIONS.ANALYTICS_FINANCE_VIEW },
  { label: "Rate Compliance", route: "/analytics/rate-compliance", permission: PERMISSIONS.ANALYTICS_FINANCE_VIEW },
  {
    label: "Partner Consistency",
    route: "/analytics/partner-consistency",
    permission: PERMISSIONS.PARTNER_CONSISTENCY_READ,
  },
  { label: "Advisor", route: "/analytics/advisor" },
];

/** Secondary navigation across the analytics pages (role-aware). */
export function AnalyticsTabs() {
  const pathname = usePathname();
  const financeView = usePermission(PERMISSIONS.ANALYTICS_FINANCE_VIEW);
  const recsRead = usePermission(PERMISSIONS.RATE_RECOMMENDATION_READ);
  // Named-partner comparison is its own grant, not something ANALYTICS_READ carries.
  const partnerConsistency = usePermission(PERMISSIONS.PARTNER_CONSISTENCY_READ);
  const { crmRestricted } = useAnalyticsScope();

  const visible = TABS.filter((tab) => {
    if (tab.firmWideOnly && crmRestricted) return false;
    if (tab.permission === PERMISSIONS.ANALYTICS_FINANCE_VIEW) return financeView;
    if (tab.permission === PERMISSIONS.RATE_RECOMMENDATION_READ) return recsRead;
    if (tab.permission === PERMISSIONS.PARTNER_CONSISTENCY_READ) return partnerConsistency;
    return true;
  });

  return (
    <div className="flex flex-wrap gap-1.5 border-b border-border pb-4">
      {visible.map((tab) => {
        const isActive =
          tab.route === "/analytics"
            ? pathname === "/analytics" || pathname.startsWith("/analytics/practice-areas")
            : pathname === tab.route || pathname.startsWith(`${tab.route}/`);
        return (
          <Link
            key={tab.route}
            href={tab.route}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              isActive
                ? "bg-ink text-on-primary shadow-sm"
                : "bg-field text-ink/60 hover:text-ink hover:bg-hover border border-border"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
