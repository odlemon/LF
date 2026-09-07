"use client";

import { useState, useEffect, useCallback } from "react";
import { analyticsApi } from "@/lib/api/modules/analytics.api";
import { getPracticeAreas, listClients } from "@/lib/api/modules/firm.api";
import type { PracticeArea, ClientProfile } from "@/modules/firm/types";
import type {
  PeriodParams,
  FirmSummaryDto,
  PracticeAreaMetricsDto,
  WinRateRow,
  WinRateDimension,
  ProposalPerformanceDto,
  RateComplianceDto,
  RateRecommendationResponse,
  AnomalyFlagResponse,
  AnomalyListParams,
  ResolveAnomalyCommand,
  ClientMetricsDto,
  MatterDetailDto,
} from "@/modules/analytics/types";

/* eslint-disable @typescript-eslint/no-explicit-any */

function extractError(err: any, fallback: string): string {
  return err?.response?.data?.message || err?.message || fallback;
}

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useAsync<T>(
  fetcher: () => Promise<T>,
  deps: unknown[]
): AsyncState<T> {
  const [tick, setTick] = useState(0);
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const depsKey = JSON.stringify(deps);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        setData(result);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(extractError(err, "Failed to load analytics"));
        setData(null);
        setIsLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, tick]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { data, isLoading, error, refetch };
}

/* ------------------------------------------------------------------ */
/* Metric hooks                                                        */
/* ------------------------------------------------------------------ */

export function useFirmSummary(period: PeriodParams = {}): AsyncState<FirmSummaryDto> {
  return useAsync(
    () => analyticsApi.getFirmSummary(period),
    [period.from ?? "", period.to ?? ""]
  );
}

export function usePracticeAreaMetrics(
  practiceAreaUid: string | undefined,
  period: PeriodParams = {}
): AsyncState<PracticeAreaMetricsDto> {
  return useAsync(
    () =>
      practiceAreaUid
        ? analyticsApi.getPracticeAreaMetrics(practiceAreaUid, period)
        : Promise.reject(new Error("Missing practice area")),
    [practiceAreaUid ?? "", period.from ?? "", period.to ?? ""]
  );
}

export function useWinRate(
  dimension: WinRateDimension,
  period: PeriodParams = {}
): AsyncState<WinRateRow[]> {
  return useAsync(
    () => analyticsApi.getWinRate(dimension, period),
    [dimension, period.from ?? "", period.to ?? ""]
  );
}

export function useProposalPerformance(
  period: PeriodParams = {}
): AsyncState<ProposalPerformanceDto> {
  return useAsync(
    () => analyticsApi.getProposalPerformance(period),
    [period.from ?? "", period.to ?? ""]
  );
}

export function useRateCompliance(
  period: PeriodParams = {},
  practiceAreaUid?: string
): AsyncState<RateComplianceDto> {
  return useAsync(
    () => analyticsApi.getRateCompliance(period, practiceAreaUid),
    [period.from ?? "", period.to ?? "", practiceAreaUid ?? ""]
  );
}

export function useRateRecommendations(
  practiceAreaUid?: string
): AsyncState<RateRecommendationResponse[]> {
  return useAsync(
    () => analyticsApi.getRateRecommendations(practiceAreaUid),
    [practiceAreaUid ?? ""]
  );
}

export function useAnomalies(params: AnomalyListParams = {}): AsyncState<AnomalyFlagResponse[]> {
  return useAsync(() => analyticsApi.listAnomalies(params), [
    params.severity ?? "",
    params.status ?? "",
    params.anomalyType ?? "",
    params.practiceAreaUid ?? "",
    params.from ?? "",
    params.to ?? "",
  ]);
}

export function useClientMetrics(
  clientProfileUid: string | undefined,
  period: PeriodParams = {}
): AsyncState<ClientMetricsDto> {
  return useAsync(
    () =>
      clientProfileUid
        ? analyticsApi.getClientMetrics(clientProfileUid, period)
        : Promise.reject(new Error("Missing client")),
    [clientProfileUid ?? "", period.from ?? "", period.to ?? ""]
  );
}

export function useMatterDetail(uid: string | undefined): AsyncState<MatterDetailDto> {
  return useAsync(
    () =>
      uid
        ? analyticsApi.getMatterDetail(uid)
        : Promise.reject(new Error("Missing matter uid")),
    [uid ?? ""]
  );
}

/* ------------------------------------------------------------------ */
/* Mutations                                                           */
/* ------------------------------------------------------------------ */

export function useResolveAnomaly() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolve = useCallback(
    async (uid: string, command: ResolveAnomalyCommand): Promise<AnomalyFlagResponse> => {
      setIsSubmitting(true);
      try {
        return await analyticsApi.resolveAnomaly(uid, command);
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return { resolve, isSubmitting };
}

/* ------------------------------------------------------------------ */
/* Reference data (practice areas / clients) for names + filters       */
/* ------------------------------------------------------------------ */

export function usePracticeAreas(): AsyncState<PracticeArea[]> {
  return useAsync(() => getPracticeAreas(), []);
}

export function useClients(): AsyncState<ClientProfile[]> {
  return useAsync(() => listClients(), []);
}

/** Practice-area margin rows for the Firm Health dashboard, ranked by margin. */
export interface PracticeAreaMarginRow {
  practiceAreaUid: string;
  practiceAreaName: string;
  revenueBilled: number;
  avgMarginPct: number;
  winRatePct: number;
  targetMarginPct: number | null;
  marginVsTargetPts: number | null;
  mattersPriced: number;
}

/**
 * One request for the whole table. This previously fanned out a request per practice area,
 * and each of those re-read the firm's entire scenario and negotiation set server-side — the
 * reason this section took 10-15 seconds to appear. The backend now groups in a single pass
 * and returns the rows already ranked by margin.
 */
export function usePracticeAreaMarginRows(
  period: PeriodParams = {}
): AsyncState<PracticeAreaMarginRow[]> {
  return useAsync(
    () => analyticsApi.getPracticeAreaLeaderboard(period),
    [period.from ?? "", period.to ?? ""]
  );
}

/** Top clients by revenue for the Firm Health dashboard, ranked server-side. */
export interface TopClientRow {
  clientProfileUid: string;
  clientName: string;
  revenueBilled: number;
  avgMarginPct: number;
  winRatePct: number;
}

export function useTopClients(
  period: PeriodParams = {},
  limit = 5
): AsyncState<TopClientRow[]> {
  // One request, ranked and limited server-side. Same rationale as the practice-area rows.
  return useAsync(
    () => analyticsApi.getClientLeaderboard(period, limit),
    [period.from ?? "", period.to ?? "", limit]
  );
}
