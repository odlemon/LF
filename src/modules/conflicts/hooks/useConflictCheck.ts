"use client";

import { useState, useEffect, useCallback } from "react";
import { conflictsApi } from "@/lib/api/modules/conflicts.api";
import { ClearConflictCheckCommand, ConflictCheckView, PartySubmission } from "../types";

export function useConflictCheck(requestUid: string) {
  const [view, setView] = useState<ConflictCheckView | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCheck = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await conflictsApi.get(requestUid);
      setView(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load conflicts check");
    } finally {
      setIsLoading(false);
    }
  }, [requestUid]);

  const runCheck = useCallback(
    async (parties: PartySubmission[]) => {
      setError(null);
      try {
        const updated = await conflictsApi.run(requestUid, parties);
        setView(updated);
        return updated;
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || "Failed to run conflicts check";
        setError(msg);
        throw new Error(msg);
      }
    },
    [requestUid]
  );

  const clearCheck = useCallback(
    async (command: ClearConflictCheckCommand) => {
      setError(null);
      try {
        const updated = await conflictsApi.clear(requestUid, command);
        setView(updated);
        return updated;
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Failed to clear conflicts check";
        setError(msg);
        throw new Error(msg);
      }
    },
    [requestUid]
  );

  useEffect(() => {
    setTimeout(fetchCheck, 0);
  }, [fetchCheck]);

  return {
    view,
    isLoading,
    error,
    runCheck,
    clearCheck,
    refetch: fetchCheck,
  };
}
