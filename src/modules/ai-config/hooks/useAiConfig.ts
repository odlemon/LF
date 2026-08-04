/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { aiConfigApi } from "@/lib/api/modules/aiconfig.api";
import { AiProviderConfig, SaveAiProviderCommand, AiConnectionTestResult } from "../types";
import toast from "react-hot-toast";

export function useAiProviders() {
  const [providers, setProviders] = useState<AiProviderConfig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiConfigApi.listProviders();
      setProviders(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load provider configurations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return { providers, isLoading, error, refetch: fetchProviders };
}

export function useActiveProvider() {
  const [activeProvider, setActiveProvider] = useState<AiProviderConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActive = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await aiConfigApi.getActiveProvider();
      setActiveProvider(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setActiveProvider(null);
      } else {
        setError(err.response?.data?.message || err.message || "Failed to load active provider");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

  return { activeProvider, isLoading, error, refetch: fetchActive };
}

export function useSaveProvider() {
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const saveProvider = useCallback(async (command: SaveAiProviderCommand) => {
    setIsSaving(true);
    try {
      const data = await aiConfigApi.saveProvider(command);
      toast.success("API key saved successfully");
      return data;
    } catch (err: any) {
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { saveProvider, isSaving };
}

export function useActivateProvider() {
  const [isActivating, setIsActivating] = useState<boolean>(false);

  const activateProvider = useCallback(async (uid: string, providerDisplayName: string) => {
    setIsActivating(true);
    try {
      const data = await aiConfigApi.activateProvider(uid);
      toast.success(`${providerDisplayName} is now active`);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to activate provider";
      toast.error(errorMessage);
      throw err;
    } finally {
      setIsActivating(false);
    }
  }, []);

  return { activateProvider, isActivating };
}

export function useTestProvider() {
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<AiConnectionTestResult | null>(null);

  const testProvider = useCallback(async (uid: string) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await aiConfigApi.testProvider(uid);
      setTestResult(result);
      return result;
    } catch (err: any) {
      const errorResult: AiConnectionTestResult = {
        success: false,
        message: err.response?.data?.message || err.message || "Test connection failed",
        provider: "ANTHROPIC",
        modelName: "",
        responseTimeMs: 0,
      };
      setTestResult(errorResult);
      return errorResult;
    } finally {
      setIsTesting(false);
    }
  }, []);

  return { testProvider, isTesting, testResult };
}

export function useDeleteProvider() {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const deleteProvider = useCallback(async (uid: string) => {
    setIsDeleting(true);
    try {
      await aiConfigApi.deleteProvider(uid);
      toast.success("Provider configuration removed");
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.error("Cannot remove the active provider");
      } else {
        toast.error(err.response?.data?.message || err.message || "Failed to remove provider configuration");
      }
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteProvider, isDeleting };
}
