"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { User } from "@/types/api";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

interface BackendPermission {
  name: string;
}

interface BackendRole {
  name: string;
  permissions?: BackendPermission[];
}

interface BackendUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  roles?: BackendRole[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Record<string, unknown>) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || token === "mock-client-token") {
      if (token === "mock-client-token" && typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (payload?.type === "CLIENT_USER" || payload?.type === "PORTAL") {
        setUser({
          id: payload.userUid || payload.sub || "client",
          email: payload.sub || payload.email || "",
          firstName: "Client",
          lastName: "",
          roles: ["CLIENT_USER"],
          permissions: [],
          userType: "CLIENT_USER",
          clientProfileUid: payload.clientProfileUid,
        });
        setIsLoading(false);
        return;
      }

      const userResponse = await apiClient.get<BackendUser>(ENDPOINTS.AUTH.ME);
      const backendUser = userResponse.data;
      const mappedUser: User = {
        id: backendUser.uid,
        email: backendUser.email,
        firstName: backendUser.firstName,
        lastName: backendUser.lastName,
        roles: backendUser.roles ? backendUser.roles.map((r) => r.name) : [],
        permissions: backendUser.roles
          ? backendUser.roles.flatMap((r) => (r.permissions ? r.permissions.map((p) => p.name) : []))
          : [],
        userType: "FIRM_USER",
      };
      setUser(mappedUser);
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: Record<string, unknown>): Promise<User> => {
    setIsLoading(true);
    try {
      const loginResponse = await apiClient.post<{
        token: string;
        email: string;
        userUid?: string;
        userType?: string;
        clientProfileUid?: string;
      }>(ENDPOINTS.AUTH.LOGIN, credentials);
      const { token, email, userUid, userType, clientProfileUid } = loginResponse.data;

      if (!token || token === "mock-client-token") {
        throw new Error("Invalid authentication response.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }

      if (userType === "CLIENT_USER") {
        const mappedUser: User = {
          id: userUid || email,
          email: email || String(credentials.email || ""),
          firstName: "Client",
          lastName: "",
          roles: ["CLIENT_USER"],
          permissions: [],
          userType: "CLIENT_USER",
          clientProfileUid,
        };
        setUser(mappedUser);
        return mappedUser;
      }

      const userResponse = await apiClient.get<BackendUser>(ENDPOINTS.AUTH.ME);
      const backendUser = userResponse.data;
      const mappedUser: User = {
        id: backendUser.uid,
        email: backendUser.email,
        firstName: backendUser.firstName,
        lastName: backendUser.lastName,
        roles: backendUser.roles ? backendUser.roles.map((r) => r.name) : [],
        permissions: backendUser.roles
          ? backendUser.roles.flatMap((r) => (r.permissions ? r.permissions.map((p) => p.name) : []))
          : [],
        userType: "FIRM_USER",
      };
      setUser(mappedUser);
      return mappedUser;
    } catch (error) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setUser(null);
      try {
        await fetch(ENDPOINTS.AUTH.LOGOUT, { method: "POST", credentials: "include" });
      } catch {
        // ignore network errors on logout
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCurrentUser();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchCurrentUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
