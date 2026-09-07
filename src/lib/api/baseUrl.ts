/**
 * Server and browser API base. NEXT_PUBLIC_* is visible in the bundle by design;
 * never put secrets here. Prefer BACKEND_API_URL on the server for BFF routes.
 */
export function getPublicApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return raw.replace(/\/$/, "");
}

export function getServerBackendApiBase(): string {
  const raw =
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080/api";
  return raw.replace(/\/$/, "");
}

/** Resolve a path like /v1/foo or /api/v1/foo against the public API base. */
export function resolveBackendUrl(path: string): string {
  const base = getPublicApiBase();

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/api/v1/")) {
    return `${base}${path}`;
  }

  if (path.startsWith("/v1/")) {
    return `${base}/api${path}`;
  }

  if (path.startsWith("/")) {
    return `${base}${path}`;
  }

  return `${base}/${path}`;
}

export function isMockClientAuthAllowed(): boolean {
  if (process.env.NEXT_PUBLIC_ALLOW_MOCK_CLIENT_AUTH === "true") {
    return process.env.NODE_ENV !== "production";
  }
  return process.env.NODE_ENV === "development";
}
