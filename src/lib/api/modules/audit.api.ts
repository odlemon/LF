import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import { AuditEvent, AuditTrailFilter } from "@/modules/audit-trail/types";

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export const auditApi = {
  listEvents: async (
    filter: AuditTrailFilter,
    page: number,
    size: number = 20
  ): Promise<PaginatedResponse<AuditEvent>> => {
    // Construct query parameters
    const params: Record<string, string | number> = {
      page,
      size,
    };

    if (filter.entityUid) params.entityUid = filter.entityUid;
    if (filter.actorUid) params.actorUid = filter.actorUid;
    if (filter.actionType && filter.actionType !== "ALL") {
      params.actionType = filter.actionType;
    }
    if (filter.resourceName && filter.resourceName !== "ALL") {
      params.resourceName = filter.resourceName;
    }
    
    // Map dates to ISO strings for backend parsing
    if (filter.dateFrom) {
      params.dateFrom = `${filter.dateFrom}T00:00:00`;
    }
    if (filter.dateTo) {
      params.dateTo = `${filter.dateTo}T23:59:59`;
    }

    const response = await apiClient.get<PaginatedResponse<AuditEvent>>(
      ENDPOINTS.AUDIT_TRAIL.BASE,
      { params }
    );
    return response.data;
  },

  getEvent: async (uid: string): Promise<AuditEvent> => {
    const response = await apiClient.get<AuditEvent>(
      ENDPOINTS.AUDIT_TRAIL.BY_UID(uid)
    );
    return response.data;
  },
};
