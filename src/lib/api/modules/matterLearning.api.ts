import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";

export interface MatterLearning {
  uid: string;
  title: string;
  learningText: string;
  practiceAreaCode?: string | null;
  clientType?: string | null;
  matterReference?: string | null;
  loggedByName?: string | null;
  createdAt: string;
}

export interface MatterLearningCommand {
  title: string;
  learningText: string;
  practiceAreaCode?: string;
  clientType?: string;
  matterReference?: string;
}

/** One position as it was handed to the agent, with where it came from. */
export interface CitedPosition {
  uid: string;
  title: string;
  learningText: string;
  practiceAreaCode?: string | null;
  clientType?: string | null;
  matterReference?: string | null;
  loggedByName?: string | null;
  automatic: boolean;
  createdAt: string;
}

export interface HouseViewForRequest {
  practiceAreaCode: string;
  clientType: string;
  positions: CitedPosition[];
}

export const matterLearningApi = {
  /**
   * What the firm's house view told the agent about this matter. Recomputed on each call rather
   * than stored against a message, so a correction shows up the moment it is made.
   */
  forRequest: async (requestUid: string): Promise<HouseViewForRequest> => {
    const res = await apiClient.get<HouseViewForRequest>(
      ENDPOINTS.MATTER_LEARNINGS.FOR_REQUEST(requestUid)
    );
    return res.data;
  },

  list: async (): Promise<MatterLearning[]> => {
    const res = await apiClient.get<MatterLearning[]>(ENDPOINTS.MATTER_LEARNINGS.BASE);
    return Array.isArray(res.data) ? res.data : [];
  },

  create: async (command: MatterLearningCommand): Promise<MatterLearning> => {
    const res = await apiClient.post<MatterLearning>(ENDPOINTS.MATTER_LEARNINGS.BASE, command);
    return res.data;
  },

  update: async (uid: string, command: MatterLearningCommand): Promise<MatterLearning> => {
    const res = await apiClient.put<MatterLearning>(ENDPOINTS.MATTER_LEARNINGS.BY_UID(uid), command);
    return res.data;
  },

  remove: async (uid: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.MATTER_LEARNINGS.BY_UID(uid));
  },
};
