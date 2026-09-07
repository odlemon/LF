import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  NegotiationActionCommand,
  NegotiationAiSuggest,
  NegotiationDetail,
  NegotiationListItem,
  SendToClientCommand,
} from "./types";

export async function listNegotiations(
  status?: string
): Promise<NegotiationListItem[]> {
  const res = await apiClient.get<NegotiationListItem[]>(
    ENDPOINTS.NEGOTIATIONS.LIST,
    { params: status && status !== "all" ? { status } : undefined }
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function getNegotiation(uid: string): Promise<NegotiationDetail> {
  const res = await apiClient.get<NegotiationDetail>(
    ENDPOINTS.NEGOTIATIONS.DETAIL(uid)
  );
  return res.data;
}

export async function sendToClient(
  requestUid: string,
  scenarioUid: string,
  command: SendToClientCommand = {}
): Promise<NegotiationDetail> {
  const res = await apiClient.post<NegotiationDetail>(
    ENDPOINTS.NEGOTIATIONS.SEND_TO_CLIENT(requestUid, scenarioUid),
    command
  );
  return res.data;
}

export async function firmCounter(
  uid: string,
  command: NegotiationActionCommand
): Promise<NegotiationDetail> {
  const res = await apiClient.post<NegotiationDetail>(
    ENDPOINTS.NEGOTIATIONS.COUNTER(uid),
    command
  );
  return res.data;
}

export async function firmAcceptCounter(
  uid: string,
  command: NegotiationActionCommand = {}
): Promise<NegotiationDetail> {
  const res = await apiClient.post<NegotiationDetail>(
    ENDPOINTS.NEGOTIATIONS.ACCEPT_COUNTER(uid),
    command
  );
  return res.data;
}

export async function firmReject(
  uid: string,
  command: NegotiationActionCommand = {}
): Promise<NegotiationDetail> {
  const res = await apiClient.post<NegotiationDetail>(
    ENDPOINTS.NEGOTIATIONS.REJECT(uid),
    command
  );
  return res.data;
}

export async function firmWithdraw(
  uid: string,
  command: NegotiationActionCommand = {}
): Promise<NegotiationDetail> {
  const res = await apiClient.post<NegotiationDetail>(
    ENDPOINTS.NEGOTIATIONS.WITHDRAW(uid),
    command
  );
  return res.data;
}

export async function firmAiSuggest(
  uid: string,
  intent?: string
): Promise<NegotiationAiSuggest> {
  const res = await apiClient.post<NegotiationAiSuggest>(
    ENDPOINTS.NEGOTIATIONS.AI_SUGGEST(uid),
    intent ? { intent } : {}
  );
  return res.data;
}

export async function listPortalNegotiations(
  status?: string
): Promise<NegotiationListItem[]> {
  const res = await apiClient.get<NegotiationListItem[]>(
    ENDPOINTS.NEGOTIATIONS.PORTAL_LIST,
    { params: status && status !== "all" ? { status } : undefined }
  );
  return Array.isArray(res.data) ? res.data : [];
}

export async function getPortalNegotiation(
  uid: string
): Promise<NegotiationDetail> {
  const res = await apiClient.get<NegotiationDetail>(
    ENDPOINTS.NEGOTIATIONS.PORTAL_DETAIL(uid)
  );
  return res.data;
}

export async function portalAccept(
  uid: string,
  command: NegotiationActionCommand = {}
): Promise<NegotiationDetail> {
  const res = await apiClient.post<NegotiationDetail>(
    ENDPOINTS.NEGOTIATIONS.PORTAL_ACCEPT(uid),
    command
  );
  return res.data;
}

export async function portalReject(
  uid: string,
  command: NegotiationActionCommand = {}
): Promise<NegotiationDetail> {
  const res = await apiClient.post<NegotiationDetail>(
    ENDPOINTS.NEGOTIATIONS.PORTAL_REJECT(uid),
    command
  );
  return res.data;
}

export async function portalCounter(
  uid: string,
  command: NegotiationActionCommand
): Promise<NegotiationDetail> {
  const res = await apiClient.post<NegotiationDetail>(
    ENDPOINTS.NEGOTIATIONS.PORTAL_COUNTER(uid),
    command
  );
  return res.data;
}

export async function portalAiSuggest(
  uid: string,
  intent?: string,
  message?: string
): Promise<NegotiationAiSuggest> {
  const body: Record<string, string> = {};
  if (intent) body.intent = intent;
  if (message) body.message = message;
  const res = await apiClient.post<NegotiationAiSuggest>(
    ENDPOINTS.NEGOTIATIONS.PORTAL_AI_SUGGEST(uid),
    body
  );
  return res.data;
}

export async function listFirmAiMessages(
  uid: string
): Promise<
  import("@/lib/api/modules/negotiation.stream").NegotiationChatMessageDto[]
> {
  const res = await apiClient.get(ENDPOINTS.NEGOTIATIONS.AI_MESSAGES(uid));
  return Array.isArray(res.data) ? res.data : [];
}

export async function listPortalAiMessages(
  uid: string
): Promise<
  import("@/lib/api/modules/negotiation.stream").NegotiationChatMessageDto[]
> {
  const res = await apiClient.get(ENDPOINTS.NEGOTIATIONS.PORTAL_AI_MESSAGES(uid));
  return Array.isArray(res.data) ? res.data : [];
}

export async function generateEngagementPack(
  uid: string
): Promise<import("./types").EngagementPack> {
  const res = await apiClient.post(ENDPOINTS.NEGOTIATIONS.ENGAGEMENT_PACK(uid));
  return res.data;
}

export async function getEngagementPack(
  uid: string
): Promise<import("./types").EngagementPack> {
  const res = await apiClient.get(ENDPOINTS.NEGOTIATIONS.ENGAGEMENT_PACK(uid));
  return res.data;
}

export async function sendEngagementPack(
  uid: string
): Promise<import("./types").EngagementPack> {
  const res = await apiClient.post(
    ENDPOINTS.NEGOTIATIONS.ENGAGEMENT_PACK_SEND(uid)
  );
  return res.data;
}

export async function getPortalEngagementPack(
  uid: string
): Promise<import("./types").EngagementPack> {
  const res = await apiClient.get(
    ENDPOINTS.NEGOTIATIONS.PORTAL_ENGAGEMENT_PACK(uid)
  );
  return res.data;
}

export async function acknowledgeEngagementPack(
  uid: string
): Promise<import("./types").EngagementPack> {
  const res = await apiClient.post(
    ENDPOINTS.NEGOTIATIONS.PORTAL_ENGAGEMENT_PACK_ACK(uid)
  );
  return res.data;
}
