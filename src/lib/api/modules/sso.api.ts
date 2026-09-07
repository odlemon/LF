import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import { IdentityProviderConfig, SaveIdentityProviderCommand } from "@/modules/sso/types";

export const ssoApi = {
  list: async (): Promise<IdentityProviderConfig[]> => {
    const res = await apiClient.get<IdentityProviderConfig[]>(ENDPOINTS.SSO.IDENTITY_PROVIDERS);
    return res.data;
  },

  create: async (command: SaveIdentityProviderCommand): Promise<IdentityProviderConfig> => {
    const res = await apiClient.post<IdentityProviderConfig>(ENDPOINTS.SSO.IDENTITY_PROVIDERS, command);
    return res.data;
  },

  update: async (uid: string, command: SaveIdentityProviderCommand): Promise<IdentityProviderConfig> => {
    const res = await apiClient.put<IdentityProviderConfig>(ENDPOINTS.SSO.IDENTITY_PROVIDER_BY_UID(uid), command);
    return res.data;
  },
};
