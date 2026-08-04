import { useState, useEffect, useCallback, useMemo } from "react";
import { auditApi, PaginatedResponse } from "@/lib/api/modules/audit.api";
import { AuditEvent, AuditTrailFilter } from "../types";
import toast from "react-hot-toast";

/**
 * Hook to retrieve all paginated audit trail events with dynamic filtering.
 */
export function useAuditTrail(filters: AuditTrailFilter, page: number) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<AuditEvent>, "content"> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const memoizedFilters = useMemo(() => {
    return {
      entityUid: filters.entityUid,
      actorUid: filters.actorUid,
      actionType: filters.actionType,
      resourceName: filters.resourceName,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    };
  }, [
    filters.entityUid,
    filters.actorUid,
    filters.actionType,
    filters.resourceName,
    filters.dateFrom,
    filters.dateTo,
  ]);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await auditApi.listEvents(memoizedFilters, page);
      setEvents(response.content || []);
      setPagination({
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        size: response.size,
        number: response.number,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to load audit events";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [memoizedFilters, page]);

  useEffect(() => {
    fetchEvents();

    if (typeof window !== "undefined") {
      const handleMutation = () => {
        setTimeout(() => {
          fetchEvents();
        }, 300);
      };
      window.addEventListener("audit:mutated", handleMutation);
      return () => {
        window.removeEventListener("audit:mutated", handleMutation);
      };
    }
  }, [fetchEvents]);

  return { events, pagination, isLoading, error, refetch: fetchEvents };
}

/**
 * Hook to retrieve details for a single audit trail log entry.
 */
export function useAuditEvent(uid: string) {
  const [event, setEvent] = useState<AuditEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!uid) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditApi.getEvent(uid);
      setEvent(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to load audit event details";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { event, isLoading, error, refetch: fetchEvent };
}

/**
 * Hook to retrieve the recent history of a specific entity.
 */
export function useEntityAuditTrail(entityUid: string, maxRows: number = 10) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntityTrail = useCallback(async () => {
    if (!entityUid) {
      setEvents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await auditApi.listEvents({ entityUid }, 0, maxRows);
      setEvents(response.content || []);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to load activity history";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [entityUid, maxRows]);

  useEffect(() => {
    fetchEntityTrail();

    if (typeof window !== "undefined") {
      const handleMutation = () => {
        setTimeout(() => {
          fetchEntityTrail();
        }, 300);
      };
      window.addEventListener("audit:mutated", handleMutation);
      return () => {
        window.removeEventListener("audit:mutated", handleMutation);
      };
    }
  }, [fetchEntityTrail]);

  return { events, isLoading, error, refetch: fetchEntityTrail };
}
