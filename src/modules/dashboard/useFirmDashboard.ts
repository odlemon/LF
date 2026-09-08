"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

export type DashboardKpi = {
  id: string;
  label: string;
  value: string;
  /** Absent when there is no comparable prior period — not the same as "no change". */
  delta: string | null;
  positive: boolean | null;
  caption: string;
};

export type TrendPoint = {
  month: string;
  feesWon: number;
  pipeline: number;
  marginPct: number;
  winRate: number;
  /** The month is still running, so this point is not comparable to the rest. */
  partial: boolean;
};

export type StagePoint = { stage: string; count: number; value: number };
export type PracticePoint = { name: string; fees: number; matters: number };

export type LiveMatter = {
  id: string;
  title: string;
  client: string;
  stage: string;
  value: number | null;
  owner: string;
  updated: string;
};

export type DashboardSnapshot = {
  openRequests: number;
  awaitingPartner: number;
  scenariosThisWeek: number;
  approvalsThisWeek: number;
  firstPassAccept: string;
  compsUsed: number;
};

export type FirmDashboard = {
  firmName: string;
  currency: string;
  kpis: DashboardKpi[];
  trend: TrendPoint[];
  stages: StagePoint[];
  practices: PracticePoint[];
  liveMatters: LiveMatter[];
  snapshot: DashboardSnapshot;
  hasData: boolean;
};

/**
 * The firm dashboard, from the API.
 *
 * <p>One request, not six: the panels are different views of the same period, and fetching
 * them separately lets one disagree with the next. It also means a single failure to handle
 * rather than six partial states to reason about.
 */
export function useFirmDashboard() {
  const [data, setData] = useState<FirmDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<FirmDashboard>("/api/v1/analytics/dashboard");
      setData(res.data);
    } catch (e: unknown) {
      const status =
        typeof e === "object" && e !== null && "response" in e
          ? (e as { response?: { status?: number } }).response?.status
          : undefined;
      setError(
        status === 403
          ? "Your role does not include access to firm metrics."
          : "Could not load the firm overview."
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
