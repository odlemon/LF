/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import { normalizeClient } from "../normalize";
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
} from "@/modules/firm/types";

export async function getFirm(uid: string): Promise<Firm> {
  const res = await apiClient.get<Firm>(ENDPOINTS.FIRM.DETAILS(uid));
  return res.data;
}

export async function updateFirm(uid: string, data: Partial<Firm>): Promise<Firm> {
  const res = await apiClient.put<Firm>(ENDPOINTS.FIRM.UPDATE(uid), data);
  return res.data;
}

export async function getPracticeAreas(): Promise<PracticeArea[]> {
  const res = await apiClient.get<PracticeArea[]>(ENDPOINTS.FIRM.PRACTICE_AREAS);
  return res.data;
}

export async function createPracticeArea(data: CreatePracticeAreaCommand): Promise<PracticeArea> {
  const res = await apiClient.post<PracticeArea>(ENDPOINTS.FIRM.PRACTICE_AREAS, data);
  return res.data;
}

export async function updatePracticeArea(uid: string, data: Partial<PracticeArea>): Promise<PracticeArea> {
  const res = await apiClient.put<PracticeArea>(`/v1/practice-areas/${uid}`, data);
  return res.data;
}

export async function deactivatePracticeArea(uid: string): Promise<PracticeArea> {
  const res = await apiClient.post<PracticeArea>(ENDPOINTS.FIRM.PRACTICE_AREA_DEACTIVATE(uid));
  return res.data;
}

export async function getFeeEarnerLevels(): Promise<FeeEarnerLevel[]> {
  const res = await apiClient.get<FeeEarnerLevel[]>(ENDPOINTS.FIRM.FEE_EARNER_LEVELS);
  return res.data;
}

export async function createFeeEarnerLevel(data: CreateFeeEarnerLevelCommand): Promise<FeeEarnerLevel> {
  const res = await apiClient.post<FeeEarnerLevel>(ENDPOINTS.FIRM.FEE_EARNER_LEVELS, data);
  return res.data;
}

export async function getRateCards(): Promise<RateCard[]> {
  const res = await apiClient.get<any>(ENDPOINTS.FIRM.RATE_CARDS);
  if (res.data && Array.isArray(res.data)) {
    return res.data;
  }
  if (res.data && res.data.content && Array.isArray(res.data.content)) {
    return res.data.content;
  }
  return [];
}

export async function createRateCard(data: CreateRateCardCommand): Promise<RateCard> {
  const res = await apiClient.post<RateCard>(ENDPOINTS.FIRM.RATE_CARDS, data);
  return res.data;
}

export async function addRateCardEntry(uid: string, data: AddRateCardEntryCommand): Promise<RateCardEntry> {
  const res = await apiClient.post<RateCardEntry>(ENDPOINTS.FIRM.RATE_CARD_ENTRIES(uid), data);
  return res.data;
}

export async function activateRateCard(uid: string): Promise<RateCard> {
  const res = await apiClient.post<RateCard>(ENDPOINTS.FIRM.RATE_CARD_ACTIVATE(uid));
  return res.data;
}

export async function getActiveRateCard(): Promise<RateCard | null> {
  const res = await apiClient.get<RateCard>(ENDPOINTS.FIRM.RATE_CARD_ACTIVATE("active"));
  return res.data;
}

export async function getRateCardEntries(rateCardUid: string): Promise<RateCardEntry[]> {
  const res = await apiClient.get<RateCardEntry[]>(ENDPOINTS.FIRM.RATE_CARD_ENTRIES(rateCardUid));
  return res.data;
}

export async function deleteRateCardEntry(uid: string): Promise<void> {
  await apiClient.delete(`/v1/rate-cards/entries/${uid}`);
}

export interface ListClientsParams {
  type?: string;
  tier?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export async function listClients(
  params: ListClientsParams = {}
): Promise<ClientProfile[]> {
  const {
    page = 0,
    size = 100,
    sort = "name,asc",
    type,
    tier,
  } = params;

  const query: Record<string, string | number> = { page, size, sort };
  if (type) query.type = type;
  if (tier) query.tier = tier;

  const res = await apiClient.get(ENDPOINTS.FIRM.CLIENTS, { params: query });
  const data = res.data;
  const items: unknown[] = Array.isArray(data)
    ? data
    : data && typeof data === "object" && "content" in data && Array.isArray(data.content)
    ? data.content
    : [];

  return items.map((item) =>
    normalizeClient(item as Record<string, unknown>)
  );
}

/** @deprecated Prefer listClients with pagination params */
export async function getClients(): Promise<ClientProfile[]> {
  return listClients({ size: 100, sort: "name,asc" });
}

export async function getClient(uid: string): Promise<ClientProfile> {
  const res = await apiClient.get(ENDPOINTS.FIRM.CLIENT_DETAIL(uid));
  return normalizeClient(res.data as Record<string, unknown>);
}

export async function createClient(data: CreateClientProfileCommand): Promise<ClientProfile> {
  const res = await apiClient.post<ClientProfile>(ENDPOINTS.FIRM.CLIENTS, data);
  return res.data;
}

export async function updateClient(uid: string, data: Partial<ClientProfile>): Promise<ClientProfile> {
  const res = await apiClient.put<ClientProfile>(ENDPOINTS.FIRM.CLIENT_DETAIL(uid), data);
  return res.data;
}

export async function getPortalUsers(clientProfileUid: string): Promise<ClientPortalUser[]> {
  const res = await apiClient.get<ClientPortalUser[]>(ENDPOINTS.FIRM.CLIENT_INVITE(clientProfileUid));
  return res.data;
}

export async function invitePortalUser(clientProfileUid: string, data: { name: string; email: string }): Promise<ClientPortalUser> {
  const res = await apiClient.post<ClientPortalUser>(ENDPOINTS.FIRM.CLIENT_INVITE(clientProfileUid), data);
  return res.data;
}

export async function getGuardrails(): Promise<FirmGuardrails> {
  const res = await apiClient.get<FirmGuardrails>(ENDPOINTS.FIRM.GUARDRAILS);
  return res.data;
}

export async function updateGuardrails(data: UpdateGuardrailsCommand): Promise<FirmGuardrails> {
  const res = await apiClient.put<FirmGuardrails>(ENDPOINTS.FIRM.GUARDRAILS, data);
  return res.data;
}
