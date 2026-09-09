import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";

export interface DemoRequestCommand {
  fullName: string;
  workEmail: string;
  firmName: string;
  roleTitle?: string;
  firmSize?: string;
  country?: string;
  phone?: string;
  message?: string;
  source?: string;
}

export interface DemoRequestAck {
  reference: string;
  message: string;
}

export const demoRequestApi = {
  submit: async (command: DemoRequestCommand): Promise<DemoRequestAck> => {
    const response = await apiClient.post<DemoRequestAck>(
      ENDPOINTS.DEMO_REQUESTS.SUBMIT,
      command
    );
    return response.data;
  },
};

export interface DemoRequestRecord {
  uid: string;
  fullName: string;
  workEmail: string;
  firmName: string;
  roleTitle?: string | null;
  firmSize?: string | null;
  country?: string | null;
  phone?: string | null;
  message?: string | null;
  source?: string | null;
  status: string;
  internalNote?: string | null;
  handledBy?: string | null;
  notified: boolean;
  createdAt: string;
}

export interface DemoRequestPage {
  content: DemoRequestRecord[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export const demoRequestAdminApi = {
  list: async (status: string, page = 0, size = 20): Promise<DemoRequestPage> => {
    const query = new URLSearchParams({ page: String(page), size: String(size) });
    if (status && status !== "all") query.set("status", status);
    const response = await apiClient.get<DemoRequestPage>(
      `${ENDPOINTS.DEMO_REQUESTS.LIST}?${query.toString()}`
    );
    return response.data;
  },

  update: async (
    uid: string,
    status: string,
    internalNote?: string
  ): Promise<DemoRequestRecord> => {
    const response = await apiClient.put<DemoRequestRecord>(
      ENDPOINTS.DEMO_REQUESTS.UPDATE(uid),
      { status, internalNote: internalNote ?? null }
    );
    return response.data;
  },
};
