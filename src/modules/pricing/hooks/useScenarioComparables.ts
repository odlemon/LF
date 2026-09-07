"use client";

import { useCallback, useEffect, useState } from "react";
import { getScenarioComparables } from "@/modules/pricing/api";
import type { ScenarioComparable } from "@/modules/pricing/types";

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

export function useScenarioComparables(
  requestUid: string | null | undefined,
  scenarioUid: string | null | undefined
): AsyncState<ScenarioComparable[]> {
  const [tick, setTick] = useState(0);
  const requestKey = JSON.stringify([requestUid, scenarioUid, tick]);
  const [resolved, setResolved] = useState<{
    key: string;
    data: ScenarioComparable[] | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!requestUid || !scenarioUid) {
      setResolved({ key: requestKey, data: [], error: null });
      return;
    }
    let isActive = true;
    getScenarioComparables(requestUid, scenarioUid)
      .then((result) => {
        if (isActive) setResolved({ key: requestKey, data: result, error: null });
      })
      .catch((err) => {
        if (isActive)
          setResolved({
            key: requestKey,
            data: null,
            error: extractError(err, "Failed to load comparables"),
          });
      });
    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  const isCurrent = resolved != null && resolved.key === requestKey;
  return {
    data: isCurrent ? resolved.data : null,
    isLoading: !isCurrent,
    error: isCurrent ? resolved.error : null,
    refetch,
  };
}
