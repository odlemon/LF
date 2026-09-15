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
