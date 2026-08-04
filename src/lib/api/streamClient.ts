const DEFAULT_API_BASE = "http://localhost:8080";

export function resolveApiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE;

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/api/v1/")) {
    const suffix = path.substring("/api/v1/".length);
    return `${base.replace(/\/$/, "")}/api/v1/${suffix}`;
  }

  if (path.startsWith("/v1/")) {
    const suffix = path.substring("/v1/".length);
    return `${base.replace(/\/$/, "")}/api/v1/${suffix}`;
  }

  if (path.startsWith("/")) {
    return `${base.replace(/\/$/, "")}${path}`;
  }

  return `${base.replace(/\/$/, "")}/${path}`;
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "text/event-stream",
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}
