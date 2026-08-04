import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import { AiProviderConfig, SaveAiProviderCommand, AiConnectionTestResult } from "@/modules/ai-config/types";

export const aiConfigApi = {
  listProviders: async (): Promise<AiProviderConfig[]> => {
    const response = await apiClient.get(ENDPOINTS.AI_CONFIG.PROVIDERS);
    return response.data;
  },

  getActiveProvider: async (): Promise<AiProviderConfig> => {
    const response = await apiClient.get(ENDPOINTS.AI_CONFIG.ACTIVE);
    return response.data;
  },

  saveProvider: async (command: SaveAiProviderCommand): Promise<AiProviderConfig> => {
    const response = await apiClient.post(ENDPOINTS.AI_CONFIG.PROVIDERS, command);
    return response.data;
  },

  activateProvider: async (uid: string): Promise<AiProviderConfig> => {
    const response = await apiClient.post(ENDPOINTS.AI_CONFIG.ACTIVATE(uid));
    return response.data;
  },

  testProvider: async (uid: string): Promise<AiConnectionTestResult> => {
    const response = await apiClient.post(ENDPOINTS.AI_CONFIG.TEST(uid));
    return response.data;
  },

  deleteProvider: async (uid: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.AI_CONFIG.BY_UID(uid));
  },
};
