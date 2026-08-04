import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  if (config.url) {
    if (config.url === "/api/auth/login") {
      config.url = "http://localhost:8080/api/v1/auth/login";
    } else if (config.url.startsWith("/api/v1/")) {
      config.url = `http://localhost:8080/api/v1/${config.url.substring(8)}`;
    } else if (config.url.startsWith("/v1/")) {
      config.url = `http://localhost:8080/api/v1/${config.url.substring(4)}`;
    }
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
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
