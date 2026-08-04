import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import {
  normalizePricingRequest,
  normalizeIntakeMessage,
  dedupeIntakeMessages,
} from "../normalize";
import { PaginatedResponse } from "@/types/api";
import {
  PricingRequest,
  IntakeMessage,
  IntakeAttachment,
  MatterScope,
  SendMessageResponse,
  CreatePricingRequestCommand,
  SendMessageCommand,
  CreatePhaseCommand,
  UpdatePhaseCommand,
  CreateTaskCommand,
  UpdateTaskCommand,
  CreateAssumptionCommand,
  MatterPhase,
  PhaseTask,
  ScopeAssumption,
  AttachmentType,
  ListPricingRequestsParams,
  PricingRequestStatus,
} from "@/modules/intake/types";

function normalizePaginatedPricingRequests(
  data: unknown
): PaginatedResponse<PricingRequest> {
  if (data && typeof data === "object" && "content" in data) {
    const page = data as PaginatedResponse<Record<string, unknown>>;
    return {
      ...page,
      content: (page.content ?? []).map((item) =>
        normalizePricingRequest(item as Record<string, unknown>)
      ),
    };
  }
  if (Array.isArray(data)) {
    const content = data.map((item) =>
      normalizePricingRequest(item as Record<string, unknown>)
    );
    return {
      content,
      totalElements: content.length,
      totalPages: 1,
      size: content.length,
      number: 0,
    };
  }
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 0,
    number: 0,
  };
}

export const intakeApi = {
  createRequest: async (command: CreatePricingRequestCommand): Promise<PricingRequest> => {
    const body: Record<string, string> = {
      clientProfileUid: command.clientProfileUid,
      title: command.title,
    };
    if (command.practiceAreaUid) {
      body.practiceAreaUid = command.practiceAreaUid;
    }
    const res = await apiClient.post(ENDPOINTS.PRICING_REQUESTS.CREATE, body);
    return normalizePricingRequest(res.data as Record<string, unknown>);
  },

  listRequests: async (
    params: ListPricingRequestsParams = {}
  ): Promise<PaginatedResponse<PricingRequest>> => {
    const { status, page = 0, size = 20, sort = "createdAt,desc" } = params;
    const query: Record<string, string | number> = { page, size, sort };
    if (status) query.status = status;
    const res = await apiClient.get(ENDPOINTS.PRICING_REQUESTS.LIST, { params: query });
    return normalizePaginatedPricingRequests(res.data);
  },

  getRequest: async (uid: string): Promise<PricingRequest> => {
    const res = await apiClient.get(ENDPOINTS.PRICING_REQUESTS.DETAIL(uid));
    return normalizePricingRequest(res.data as Record<string, unknown>);
  },

  cancelRequest: async (uid: string): Promise<PricingRequest> => {
    const res = await apiClient.post(ENDPOINTS.PRICING_REQUESTS.CANCEL(uid));
    return normalizePricingRequest(res.data as Record<string, unknown>);
  },

  sendMessage: async (uid: string, command: SendMessageCommand): Promise<SendMessageResponse> => {
    const res = await apiClient.post(
      ENDPOINTS.PRICING_REQUESTS.MESSAGES(uid),
      command
    );
    const data = res.data as Record<string, unknown>;
    return {
      userMessage: normalizeIntakeMessage(
        (data.userMessage ?? {}) as Record<string, unknown>
      ),
      aiMessage: normalizeIntakeMessage(
        (data.aiMessage ?? {}) as Record<string, unknown>
      ),
      scopeGenerated: Boolean(data.scopeGenerated),
      scope: data.scope as SendMessageResponse["scope"],
    };
  },

  getMessages: async (uid: string): Promise<IntakeMessage[]> => {
    const res = await apiClient.get(
      ENDPOINTS.PRICING_REQUESTS.MESSAGES(uid)
    );
    const data = res.data;
    const items: unknown[] = Array.isArray(data)
      ? data
      : data && typeof data === "object" && "content" in data && Array.isArray(data.content)
      ? data.content
      : [];
    return dedupeIntakeMessages(
      items.map((item) =>
        normalizeIntakeMessage(item as Record<string, unknown>)
      )
    );
  },

  attachFile: async (
    uid: string,
    file: File,
    attachmentType: AttachmentType = "OTHER"
  ): Promise<IntakeAttachment> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("attachmentType", attachmentType);
    const res = await apiClient.post<IntakeAttachment>(
      ENDPOINTS.PRICING_REQUESTS.ATTACHMENTS(uid),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  deleteAttachment: async (uid: string, attachmentUid: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.PRICING_REQUESTS.ATTACHMENT(uid, attachmentUid));
  },

  listAttachments: async (uid: string): Promise<IntakeAttachment[]> => {
    const res = await apiClient.get<IntakeAttachment[] | { content: IntakeAttachment[] }>(
      ENDPOINTS.PRICING_REQUESTS.ATTACHMENTS(uid)
    );
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && "content" in data && Array.isArray(data.content)) return data.content;
    return [];
  },

  getScope: async (uid: string): Promise<MatterScope> => {
    const res = await apiClient.get<MatterScope>(ENDPOINTS.PRICING_REQUESTS.SCOPE(uid));
    return res.data;
  },

  updatePhase: async (
    uid: string,
    phaseUid: string,
    command: UpdatePhaseCommand
  ): Promise<MatterPhase> => {
    const res = await apiClient.put<MatterPhase>(
      ENDPOINTS.PRICING_REQUESTS.PHASE(uid, phaseUid),
      command
    );
    return res.data;
  },

  addPhase: async (uid: string, command: CreatePhaseCommand): Promise<MatterPhase> => {
    const res = await apiClient.post<MatterPhase>(ENDPOINTS.PRICING_REQUESTS.PHASES(uid), command);
    return res.data;
  },

  deletePhase: async (uid: string, phaseUid: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.PRICING_REQUESTS.PHASE(uid, phaseUid));
  },

  updateTask: async (
    uid: string,
    phaseUid: string,
    taskUid: string,
    command: UpdateTaskCommand
  ): Promise<PhaseTask> => {
    const res = await apiClient.put<PhaseTask>(
      ENDPOINTS.PRICING_REQUESTS.TASK(uid, phaseUid, taskUid),
      command
    );
    return res.data;
  },

  addTask: async (
    uid: string,
    phaseUid: string,
    command: CreateTaskCommand
  ): Promise<PhaseTask> => {
    const res = await apiClient.post<PhaseTask>(
      ENDPOINTS.PRICING_REQUESTS.TASKS(uid, phaseUid),
      command
    );
    return res.data;
  },

  deleteTask: async (uid: string, phaseUid: string, taskUid: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.PRICING_REQUESTS.TASK(uid, phaseUid, taskUid));
  },

  addAssumption: async (
    uid: string,
    command: CreateAssumptionCommand
  ): Promise<ScopeAssumption> => {
    const res = await apiClient.post<ScopeAssumption>(
      ENDPOINTS.PRICING_REQUESTS.ASSUMPTIONS(uid),
      command
    );
    return res.data;
  },

  deleteAssumption: async (uid: string, assumptionUid: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.PRICING_REQUESTS.ASSUMPTION(uid, assumptionUid));
  },

  confirmScope: async (uid: string): Promise<PricingRequest> => {
    const res = await apiClient.post(ENDPOINTS.PRICING_REQUESTS.CONFIRM_SCOPE(uid));
    return normalizePricingRequest(res.data as Record<string, unknown>);
  },
};

export type { PricingRequestStatus };
