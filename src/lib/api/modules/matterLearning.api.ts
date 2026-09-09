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

export const matterLearningApi = {
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
