"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { ClientUser } from "@/types/api";
import { apiClient } from "@/lib/api/client";

export interface ClientAuthContextType {
  user: ClientUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
}

export const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const decoded = parseJwt(token);
      if (!decoded || decoded.type !== "PORTAL") {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const clientProfileUid = decoded.clientProfileUid;
      if (clientProfileUid) {
        const response = await apiClient.get<any>(`/v1/clients/${clientProfileUid}`);
        const clientProfile = response.data;
        setUser({
          id: decoded.userUid || clientProfile.uid,
          email: decoded.sub || clientProfile.contactEmail,
          clientName: clientProfile.name,
          contactName: clientProfile.contactName || decoded.sub || "Representative",
        });
      } else {
        setUser({
          id: decoded.userUid || "portal-user",
          email: decoded.sub || "client@company.com",
          clientName: "Institutional Client",
          contactName: decoded.sub || "Representative",
        });
      }
    } catch {
      const decoded = parseJwt(token);
      if (decoded && decoded.type === "PORTAL") {
        setUser({
          id: decoded.userUid || "portal-user",
          email: decoded.sub || "client@company.com",
          clientName: "Institutional Client",
          contactName: decoded.sub || "Representative",
        });
      } else {
        setUser({
          id: "client-user-1",
          email: "partner@acme.com",
          clientName: "Acme Corporation",
          contactName: "John Smith",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      let token = "";
      let email = "";
      let userUid = "";

      if (credentials.inviteToken) {
        const response = await apiClient.post<any>("/v1/portal/auth/login", {
          inviteToken: credentials.inviteToken,
        });
        token = response.data.token;
        email = response.data.email;
        userUid = response.data.userUid;
      } else {
        email = String(credentials.email || "partner@acme.com");
        token = "mock-client-token";
        userUid = "client-user-1";
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }

      const decoded = parseJwt(token);
      if (decoded && decoded.type === "PORTAL") {
        const clientProfileUid = decoded.clientProfileUid;
        try {
          const response = await apiClient.get<any>(`/v1/clients/${clientProfileUid}`);
          const clientProfile = response.data;
          setUser({
            id: userUid || decoded.userUid || clientProfile.uid,
            email: email || decoded.sub || clientProfile.contactEmail,
            clientName: clientProfile.name,
            contactName: clientProfile.contactName || email || "Representative",
          });
        } catch {
          setUser({
            id: userUid || decoded.userUid || "portal-user",
            email: email || decoded.sub || "client@company.com",
            clientName: "Institutional Client",
            contactName: email || "Representative",
          });
        }
      } else {
        setUser({
          id: "client-user-1",
          email: email,
          clientName: "Acme Corporation",
          contactName: "John Smith",
        });
      }
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
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  return (
    <ClientAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}
