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
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);
