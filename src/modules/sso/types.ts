export interface IdentityProviderConfig {
  uid: string;
  firmUid: string;
  providerName: string;
  issuerUri?: string | null;
  authorizationUri: string;
  tokenUri: string;
  userInfoUri: string;
  clientId: string;
  emailDomain: string;
  defaultRoleName: string;
  active: boolean;
}

export interface SaveIdentityProviderCommand {
  providerName: string;
  issuerUri?: string;
  authorizationUri: string;
  tokenUri: string;
  userInfoUri: string;
  clientId: string;
  clientSecret?: string;
  emailDomain: string;
  defaultRoleName?: string;
  active?: boolean;
}
