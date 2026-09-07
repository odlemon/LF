"use client";

import { useState, useEffect, useCallback } from "react";
import { ssoApi } from "@/lib/api/modules/sso.api";
import { IdentityProviderConfig, SaveIdentityProviderCommand } from "../types";

export function useIdentityProviders() {
  const [providers, setProviders] = useState<IdentityProviderConfig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ssoApi.list();
      setProviders(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load identity providers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProvider = useCallback(async (command: SaveIdentityProviderCommand) => {
    setError(null);
    try {
      const created = await ssoApi.create(command);
      setProviders((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create identity provider";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const updateProvider = useCallback(async (uid: string, command: SaveIdentityProviderCommand) => {
    setError(null);
    try {
      const updated = await ssoApi.update(uid, command);
      setProviders((prev) => prev.map((p) => (p.uid === uid ? updated : p)));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update identity provider";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  useEffect(() => {
    setTimeout(fetchProviders, 0);
  }, [fetchProviders]);

  return {
    providers,
    isLoading,
    error,
    createProvider,
    updateProvider,
    refetch: fetchProviders,
  };
}
