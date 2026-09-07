import { getPublicApiBase } from "./baseUrl";

export function resolveApiUrl(path: string): string {
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

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && token !== "mock-client-token") {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}
