import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import {
  IdentityProviderConfig,
  IssuerCheckResult,
  SaveIdentityProviderCommand,
} from "@/modules/sso/types";

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

  /**
   * Asks the identity provider what it advertises, and reports back the callback URL this
   * deployment will use. Both halves of an SSO misconfiguration are things you cannot see from
   * the form alone.
   */
  verifyIssuer: async (issuerUri: string, providerName: string): Promise<IssuerCheckResult> => {
    const res = await apiClient.post<IssuerCheckResult>(ENDPOINTS.SSO.VERIFY_ISSUER, {
      issuerUri,
      providerName,
    });
    return res.data;
  },

  redirectUri: async (providerName: string): Promise<string> => {
    const res = await apiClient.get<{ redirectUri: string }>(
      `${ENDPOINTS.SSO.REDIRECT_URI}?providerName=${encodeURIComponent(providerName)}`
    );
    return res.data.redirectUri;
  },
};
