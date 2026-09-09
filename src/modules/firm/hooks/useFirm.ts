/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import * as api from "@/lib/api/modules/firm.api";
import {
  Firm,
  PracticeArea,
  FeeEarnerLevel,
  RateCard,
  RateCardEntry,
  ClientProfile,
  ClientPortalUser,
  FirmGuardrails,
  CreatePracticeAreaCommand,
  CreateFeeEarnerLevelCommand,
  CreateRateCardCommand,
  AddRateCardEntryCommand,
  CreateClientProfileCommand,
  UpdateGuardrailsCommand,
  ExchangeRate,
  CreateExchangeRateCommand,
  ApprovalStageDefinition,
} from "../types";

export function useFirmDetails(uid: string = "firm_acme_123") {
  const [firm, setFirm] = useState<Firm | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFirm = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getFirm(uid);
      setFirm(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load firm details");
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  const updateFirm = useCallback(async (data: Partial<Firm>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await api.updateFirm(uid, data);
      setFirm(updated);
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update firm details";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFirm();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchFirm]);

  return { firm, isLoading, error, updateFirm, refetch: fetchFirm };
}

export function usePracticeAreas() {
  const [areas, setAreas] = useState<PracticeArea[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPracticeAreas();
      setAreas(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load practice areas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createArea = useCallback(async (data: CreatePracticeAreaCommand) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await api.createPracticeArea(data);
      setAreas((prev) => [...prev, created]);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create practice area";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deactivateArea = useCallback(async (uid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await api.deactivatePracticeArea(uid);
      setAreas((prev) => prev.map((a) => (a.uid === uid ? updated : a)));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to deactivate practice area";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateArea = useCallback(async (uid: string, data: Partial<PracticeArea>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await api.updatePracticeArea(uid, data);
      setAreas((prev) => prev.map((a) => (a.uid === uid ? updated : a)));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update practice area";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAreas();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchAreas]);

  return { areas, isLoading, error, createArea, updateArea, deactivateArea, refetch: fetchAreas };
}

export function useFeeEarnerLevels() {
  const [levels, setLevels] = useState<FeeEarnerLevel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getFeeEarnerLevels();
      setLevels(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load fee earner levels");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createLevel = useCallback(async (data: CreateFeeEarnerLevelCommand) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await api.createFeeEarnerLevel(data);
      setLevels((prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create fee earner level";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLevel = useCallback(async (uid: string, data: CreateFeeEarnerLevelCommand) => {
    try {
      const updated = await api.updateFeeEarnerLevel(uid, data);
      await fetchLevels();
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update fee earner level";
      setError(msg);
      throw new Error(msg);
    }
  }, [fetchLevels]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLevels();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchLevels]);

  return { levels, isLoading, error, createLevel, updateLevel, refetch: fetchLevels };
}

export function useRateCards() {
  const [cards, setCards] = useState<RateCard[]>([]);
  const [activeCard, setActiveCard] = useState<RateCard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const allCards = await api.getRateCards();
      setCards(allCards);
      const active = allCards.find((c) => c.status === "ACTIVE") || null;
      setActiveCard(active);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load rate cards");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCard = useCallback(async (data: CreateRateCardCommand) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await api.createRateCard(data);
      setCards((prev) => [...prev, created]);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create rate card";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activateCard = useCallback(async (uid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const activated = await api.activateRateCard(uid);
      await fetchCards();
      return activated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to activate rate card";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCards]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCards();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchCards]);

  return { cards, activeCard, isLoading, error, createCard, activateCard, refetch: fetchCards };
}

export function useRateCardEntries(rateCardUid: string) {
  const [entries, setEntries] = useState<RateCardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!rateCardUid) return;
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getRateCardEntries(rateCardUid);
      setEntries(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load rate card entries");
    } finally {
      setIsLoading(false);
    }
  }, [rateCardUid]);

  const addEntry = useCallback(async (data: AddRateCardEntryCommand) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await api.addRateCardEntry(rateCardUid, data);
      setEntries((prev) => {
        const filtered = prev.filter(
          (e) =>
            !(
              e.feeEarnerLevelUid === data.feeEarnerLevelUid &&
              e.practiceAreaUid === (data.practiceAreaUid || null)
            )
        );
        return [...filtered, created];
      });
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to add rate entry";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [rateCardUid]);

  const deleteEntry = useCallback(async (uid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteRateCardEntry(uid);
      setEntries((prev) => prev.filter((e) => e.uid !== uid));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete rate entry";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEntries();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchEntries]);

  return { entries, isLoading, error, addEntry, deleteEntry, refetch: fetchEntries };
}

export function useClients(filters?: { query?: string }) {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getClients();
      if (filters?.query) {
        const q = filters.query.toLowerCase();
        setClients(
          data.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.contactName.toLowerCase().includes(q) ||
              c.contactEmail.toLowerCase().includes(q)
          )
        );
      } else {
        setClients(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load clients");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.query]);

  const createClient = useCallback(async (data: CreateClientProfileCommand) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await api.createClient(data);
      setClients((prev) => [...prev, created]);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create client profile";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateClient = useCallback(async (uid: string, data: Partial<ClientProfile>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await api.updateClient(uid, data);
      setClients((prev) => prev.map((c) => (c.uid === uid ? updated : c)));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update client profile";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchClients]);

  return { clients, isLoading, error, createClient, updateClient, refetch: fetchClients };
}

export function useClientDetail(uid: string) {
  const [client, setClient] = useState<ClientProfile | null>(null);
  const [portalUsers, setPortalUsers] = useState<ClientPortalUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!uid) return;
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const [cData, uData] = await Promise.all([
        api.getClient(uid),
        api.getPortalUsers(uid),
      ]);
      setClient(cData);
      setPortalUsers(uData);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load client details");
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  const updateClient = useCallback(async (data: Partial<ClientProfile>) => {
    if (!uid) return;
    setIsLoading(true);
    setError(null);
    try {
      const updated = await api.updateClient(uid, data);
      setClient(updated);
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update client profile";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  const invitePortalUser = useCallback(async (data: { name: string; email: string }) => {
    if (!uid) return;
    setIsLoading(true);
    setError(null);
    try {
      const created = await api.invitePortalUser(uid, data);
      setPortalUsers((prev) => [...prev, created]);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to invite portal user";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDetail();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchDetail]);

  return { client, portalUsers, isLoading, error, updateClient, invitePortalUser, refetch: fetchDetail };
}

export function useGuardrails() {
  const [guardrails, setGuardrails] = useState<FirmGuardrails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuardrails = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getGuardrails();
      setGuardrails(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load firm guardrails");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateGuardrails = useCallback(async (data: UpdateGuardrailsCommand) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await api.updateGuardrails(data);
      setGuardrails(updated);
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update guardrails";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGuardrails();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchGuardrails]);

  return { guardrails, isLoading, error, updateGuardrails, refetch: fetchGuardrails };
}

export function useFxRates() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getFxRates();
      setRates(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load exchange rates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRate = useCallback(async (data: CreateExchangeRateCommand) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await api.createFxRate(data);
      setRates((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create exchange rate";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRate = useCallback(async (uid: string, data: CreateExchangeRateCommand) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await api.updateFxRate(uid, data);
      setRates((prev) => prev.map((r) => (r.uid === uid ? updated : r)));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update exchange rate";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteRate = useCallback(async (uid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteFxRate(uid);
      setRates((prev) => prev.filter((r) => r.uid !== uid));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to remove exchange rate";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRates();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchRates]);

  return { rates, isLoading, error, createRate, updateRate, deleteRate, refetch: fetchRates };
}

export function useApprovalMatrix() {
  const [stages, setStages] = useState<ApprovalStageDefinition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStages = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getApprovalMatrix();
      setStages(data.sort((a, b) => a.sequenceNo - b.sequenceNo));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load approval matrix");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveStages = useCallback(async (newStages: ApprovalStageDefinition[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const saved = await api.saveApprovalMatrix(newStages);
      setStages(saved.sort((a, b) => a.sequenceNo - b.sequenceNo));
      return saved;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to save approval matrix";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStages();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchStages]);

  return { stages, isLoading, error, saveStages, refetch: fetchStages };
}
