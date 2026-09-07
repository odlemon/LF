"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { ClientUser } from "@/types/api";
import { apiClient } from "@/lib/api/client";
import { getPortalMe, type PortalMe } from "@/modules/client-portal/api";

export interface ClientAuthContextType {
  user: ClientUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearMustChangePassword: () => void;
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

function clearClientSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

function mapMe(me: PortalMe): ClientUser {
  return {
    id: me.uid,
    email: me.email,
    clientName: me.clientName || "Client",
    contactName: me.name || me.email?.split("@")[0] || "Representative",
    mustChangePassword: !!me.mustChangePassword,
    firmUid: me.firmUid,
    clientProfileUid: me.clientProfileUid,
    country: me.country,
    roleLabel: me.roleLabel || "Client representative",
  };
}

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token || token === "mock-client-token") {
      if (token === "mock-client-token") clearClientSession();
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const decoded = parseJwt(token);
      if (!decoded || (decoded.type !== "PORTAL" && decoded.type !== "CLIENT_USER")) {
        clearClientSession();
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const me = await getPortalMe();
        setUser(mapMe(me));
      } catch {
        const email = (decoded.sub || decoded.email || "client@company.com") as string;
        const contactGuess = email.includes("@") ? email.split("@")[0] : email;
        setUser({
          id: decoded.userUid || decoded.sub || "portal-user",
          email,
          clientName: "Client",
          contactName: contactGuess || "Representative",
          clientProfileUid: decoded.clientProfileUid,
          firmUid: decoded.firmUid,
          mustChangePassword: false,
        });
      }
    } catch {
      clearClientSession();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      const hasInviteToken = !!credentials.inviteToken;
      const hasEmailPassword = !!credentials.email && !!credentials.password;
      if (!hasInviteToken && !hasEmailPassword) {
        throw new Error("Enter your email and password, or use your invite link to sign in.");
      }

      const response = await apiClient.post(
        "/v1/portal/auth/login",
        hasInviteToken
          ? { inviteToken: credentials.inviteToken }
          : { email: credentials.email, password: credentials.password }
      );
      const token = response.data.token as string;
      const email = response.data.email as string;
      const userUid = response.data.userUid as string;

      if (!token || token === "mock-client-token") {
        throw new Error("Invalid portal session.");
      }

      localStorage.setItem("token", token);

      const decoded = parseJwt(token);
      if (!decoded || (decoded.type !== "PORTAL" && decoded.type !== "CLIENT_USER")) {
        clearClientSession();
        throw new Error("Invalid portal token.");
      }

      try {
        const me = await getPortalMe();
        setUser(mapMe(me));
      } catch {
        setUser({
          id: userUid || decoded.userUid || "portal-user",
          email: email || decoded.sub || "client@company.com",
          clientName: "Institutional Client",
          contactName: email || "Representative",
          mustChangePassword: !!response.data.mustChangePassword,
          clientProfileUid: response.data.clientProfileUid || decoded.clientProfileUid,
          firmUid: response.data.firmUid || decoded.firmUid,
        });
      }
    } catch (error) {
      clearClientSession();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      clearClientSession();
      setUser(null);
      try {
        await fetch("/api/client-auth/logout", { method: "POST", credentials: "include" });
      } catch {
        // ignore
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const me = await getPortalMe();
      setUser(mapMe(me));
    } catch {
      /* keep current */
    }
  }, []);

  const clearMustChangePassword = useCallback(() => {
    setUser((prev) => (prev ? { ...prev, mustChangePassword: false } : prev));
  }, []);

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
      clearClientSession();
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
        refreshUser,
        clearMustChangePassword,
      }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
}
