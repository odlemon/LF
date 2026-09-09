import axios from "axios";
import { resolveBackendUrl } from "./baseUrl";

export const apiClient = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (config.url) {
    const url = config.url;
    // Same-origin Next.js BFF auth routes stay relative (cookies work).
    const isBffAuth =
      url.startsWith("/api/auth") || url.startsWith("/api/client-auth");

    if (!isBffAuth && (url.startsWith("/api/v1/") || url.startsWith("/v1/"))) {
      config.url = resolveBackendUrl(url);
    }
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token && token !== "mock-client-token") {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * A backend restart is not an error the user should have to see.
 *
 * The API sits behind nginx with a single upstream, so while the service is coming back up every
 * call returns 502 — and every page that was mid-load renders its error state at once. Retrying a
 * read for a short window turns that into a slower load instead of a wall of failures.
 *
 * Only reads are retried. A POST that timed out may well have been applied, and replaying it
 * would submit twice.
 */
const RETRY_STATUSES = [502, 503, 504];
const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000];

function isRetryable(error: {
  config?: { method?: string; __retryCount?: number };
  response?: { status?: number };
  code?: string;
}): boolean {
  const method = error.config?.method?.toLowerCase();
  if (method !== "get" && method !== "head") return false;
  if ((error.config?.__retryCount ?? 0) >= RETRY_DELAYS_MS.length) return false;
  // No response at all means the connection was refused or dropped — the same restart window,
  // seen a moment earlier, before nginx has a 502 to give.
  if (!error.response) return error.code !== "ERR_CANCELED";
  return RETRY_STATUSES.includes(error.response.status ?? 0);
}

apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    if (method && ["post", "put", "delete", "patch"].includes(method)) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("audit:mutated"));
      }
    }
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }

    if (error.config && isRetryable(error)) {
      const attempt = error.config.__retryCount ?? 0;
      error.config.__retryCount = attempt + 1;
      if (typeof window !== "undefined" && attempt === 0) {
        // Lets the shell say "reconnecting" rather than leaving the page silently frozen.
        window.dispatchEvent(new CustomEvent("api:unreachable"));
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
      const response = await apiClient.request(error.config);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("api:reachable"));
      }
      return response;
    }

    return Promise.reject(error);
  }
);
