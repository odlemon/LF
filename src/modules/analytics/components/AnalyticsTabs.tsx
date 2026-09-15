"use client";

import React, { useEffect, useRef, useState } from "react";
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
  // Hidden from the tab bar for now, per request — the page itself is untouched.
  // { label: "Advisor", route: "/analytics/advisor" },
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

  const isTabActive = (tab: TabDef) =>
    tab.route === "/analytics"
      ? pathname === "/analytics" || pathname.startsWith("/analytics/practice-areas")
      : pathname === tab.route || pathname.startsWith(`${tab.route}/`);

  const containerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; top: number; width: number; height: number } | null>(
    null
  );
  const activeRoute = visible.find(isTabActive)?.route;

  const measure = () => {
    const el = activeRoute ? linkRefs.current.get(activeRoute) : null;
    if (!el) return;
    setIndicator({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight });
  };

  // A long-lived ResizeObserver below must never call back into a stale closure bound to
  // whatever route was active when it was created — see Tabs.tsx for the flicker that causes.
  const measureRef = useRef(measure);
  measureRef.current = measure;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [activeRoute, visible.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measureRef.current());
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      role="tablist"
      className="relative mb-4 inline-flex flex-wrap gap-1 rounded-full border border-border bg-field p-1"
    >
      {indicator && (
        <span
          aria-hidden="true"
          className="absolute rounded-full bg-ink shadow-sm transition-[left,top,width,height] duration-300 ease-out"
          style={{ left: indicator.left, top: indicator.top, width: indicator.width, height: indicator.height }}
        />
      )}
      {visible.map((tab) => {
        const isActive = isTabActive(tab);
        return (
          <Link
            key={tab.route}
            href={tab.route}
            ref={(node) => {
              if (node) linkRefs.current.set(tab.route, node);
              else linkRefs.current.delete(tab.route);
            }}
            role="tab"
            aria-selected={isActive}
            className={`relative z-10 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              isActive ? "text-on-primary" : "text-ink/60 hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
