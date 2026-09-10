import type { AiProvider, AiProviderConfig } from "../types";

/**
 * How a firm reaches a model.
 *
 * The screen used to ask one question — which vendor's consumer API key would you like to paste —
 * which is not how a firm of this size buys inference. They hold their own capacity in their own
 * tenant, under their own agreement, in a region their clients have signed off on, and they
 * expect to point software at it. That is the question this now asks.
 *
 * The three kinds are not new columns; they are what the existing fields already mean:
 *
 * - AZURE   a resource endpoint plus a named deployment and a dated API version
 * - PRIVATE any other endpoint speaking the OpenAI wire format — a gateway, a proxy, self-hosted
 * - MANAGED no endpoint of the firm's own, so the request goes to the vendor through Lysp
 */
export type DeploymentKind = "AZURE" | "PRIVATE" | "MANAGED";

export function deploymentKind(config: AiProviderConfig): DeploymentKind {
  if (config.deploymentName && config.baseUrl) return "AZURE";
  if (config.baseUrl && !isVendorDefault(config.baseUrl, config.provider)) return "PRIVATE";
  return "MANAGED";
}

/**
 * A base URL that simply restates the vendor's public endpoint is not a private deployment.
 * Without this, setting the override to the value it already had would relabel a managed
 * connection as the firm's own infrastructure.
 */
function isVendorDefault(baseUrl: string, provider: AiProvider): boolean {
  const host = safeHost(baseUrl);
  const defaults: Record<AiProvider, string> = {
    OPENAI: "api.openai.com",
    ANTHROPIC: "api.anthropic.com",
    GEMINI: "generativelanguage.googleapis.com",
    DEEPSEEK: "api.deepseek.com",
  };
  return host === defaults[provider];
}

export function safeHost(url: string | null | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).host;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

export const KIND_LABEL: Record<DeploymentKind, string> = {
  AZURE: "Azure OpenAI",
  PRIVATE: "Private endpoint",
  MANAGED: "Managed by Lysp",
};

export const KIND_BLURB: Record<DeploymentKind, string> = {
  AZURE:
    "Your own Azure OpenAI resource. Requests never leave your tenant's region, and the deployment is governed by your agreement with Microsoft.",
  PRIVATE:
    "Any endpoint speaking the OpenAI wire format — a gateway you operate, a proxy in front of a vendor, or a model you host yourself.",
  MANAGED:
    "Lysp calls the vendor on your behalf using its own commercial agreement. Quickest to start with, and the right choice only until your own capacity is in place.",
};

/** Where a request under this configuration actually goes. */
export function endpointLabel(config: AiProviderConfig): string {
  const kind = deploymentKind(config);
  if (kind === "MANAGED") {
    return vendorHost(config.provider);
  }
  return safeHost(config.baseUrl);
}

export function vendorHost(provider: AiProvider): string {
  switch (provider) {
    case "OPENAI":
      return "api.openai.com";
    case "ANTHROPIC":
      return "api.anthropic.com";
    case "GEMINI":
      return "generativelanguage.googleapis.com";
    case "DEEPSEEK":
      return "api.deepseek.com";
    default:
      return "";
  }
}

/**
 * The honest sentence about who holds the commercial relationship, which is what actually decides
 * retention and training terms — not anything this application can assert on its own.
 */
export function governedBy(config: AiProviderConfig): string {
  const kind = deploymentKind(config);
  if (kind === "AZURE") {
    return "Your Microsoft agreement. Retention and training terms are the ones you hold with Microsoft for this resource.";
  }
  if (kind === "PRIVATE") {
    return "Whatever governs the endpoint you have pointed Lysp at.";
  }
  return "Lysp's agreement with the vendor. Ask for the current terms before relying on it for client data.";
}

export const PROVIDER_LABEL: Record<AiProvider, string> = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GEMINI: "Google Gemini",
  DEEPSEEK: "DeepSeek",
};
