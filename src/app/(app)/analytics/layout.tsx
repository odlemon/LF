"use client";

import { AnalyticsTabs } from "@/modules/analytics/components/AnalyticsTabs";

/**
 * Every analytics view is its own route (so each is linkable/bookmarkable), but they all share
 * one tab bar. Rendering it here, once, keeps a single AnalyticsTabs instance mounted across
 * sibling navigations — the sliding indicator animates between tabs the same way it does inside
 * a same-page tab control (e.g. Data Room's records explorer), instead of a fresh instance
 * snapping straight to position on every route change with nothing to animate from.
 */
export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-5 pt-8 pb-8 sm:px-8">
      <AnalyticsTabs />
      {children}
    </div>
  );
}
