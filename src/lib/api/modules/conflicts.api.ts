import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import {
  ClearConflictCheckCommand,
  ConflictCheckView,
  PartySubmission,
} from "@/modules/conflicts/types";

export const conflictsApi = {
  get: async (requestUid: string): Promise<ConflictCheckView> => {
    const res = await apiClient.get<ConflictCheckView>(
      ENDPOINTS.PRICING_REQUESTS.CONFLICTS_CHECK(requestUid)
    );
    return res.data;
  },

  run: async (requestUid: string, parties: PartySubmission[]): Promise<ConflictCheckView> => {
    const res = await apiClient.post<ConflictCheckView>(
      ENDPOINTS.PRICING_REQUESTS.CONFLICTS_CHECK(requestUid),
      { parties }
    );
    return res.data;
  },

  clear: async (
    requestUid: string,
    command: ClearConflictCheckCommand
  ): Promise<ConflictCheckView> => {
    const res = await apiClient.post<ConflictCheckView>(
      ENDPOINTS.PRICING_REQUESTS.CONFLICTS_CHECK_CLEAR(requestUid),
      command
    );
    return res.data;
  },
};
