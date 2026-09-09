export interface IdentityProviderConfig {
  uid: string;
  firmUid: string;
  providerName: string;
  issuerUri?: string | null;
  authorizationUri?: string | null;
  tokenUri?: string | null;
  userInfoUri?: string | null;
  clientId: string;
  emailDomain: string;
  defaultRoleName: string;
  active: boolean;
}

export interface SaveIdentityProviderCommand {
  providerName: string;
  issuerUri?: string;
  authorizationUri?: string;
  tokenUri?: string;
  userInfoUri?: string;
  clientId: string;
  clientSecret?: string;
  emailDomain: string;
  defaultRoleName?: string;
  active?: boolean;
}

/** What the provider's own discovery document says, read back before anything is saved. */
export interface IssuerCheckResult {
  issuerUri: string;
  authorizationUri: string;
  tokenUri: string;
  userInfoUri: string;
  jwkSetUri: string;
  redirectUri: string;
}
