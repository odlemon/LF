/**
 * The signed-in user's firm, read from the token that authorises every request anyway.
 *
 * Exists because a screen that needs "my firm" had no way to ask for it and was falling back to a
 * hardcoded uid — firm_acme_123, from before there was more than one firm — which 404s on every
 * real deployment. The claim is the authoritative answer: the backend scopes by the same value.
 *
 * Not a security control. Nothing here is trusted server-side; the token is verified there.
 */
export function currentFirmUid(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const claims = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as { firmUid?: string };
    return claims.firmUid ?? null;
  } catch {
    return null;
  }
}
