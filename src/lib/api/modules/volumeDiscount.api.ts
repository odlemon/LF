import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type {
  VolumeDiscountProgram,
  ClientSpendRecord,
  VolumeDiscountDashboard,
  CreateVolumeDiscountProgramCommand,
  UpdateVolumeDiscountProgramCommand,
  AddSpendRecordCommand,
  PanelAgreement,
  CreatePanelAgreementCommand,
  MfnCheckResult,
} from "@/modules/volume-discount/types";

export const volumeDiscountApi = {
  listPrograms: async (): Promise<VolumeDiscountProgram[]> => {
    const res = await apiClient.get(ENDPOINTS.VOLUME_DISCOUNT.LIST);
    return res.data as VolumeDiscountProgram[];
  },

  getProgram: async (uid: string): Promise<VolumeDiscountProgram> => {
    const res = await apiClient.get(ENDPOINTS.VOLUME_DISCOUNT.DETAIL(uid));
    return res.data as VolumeDiscountProgram;
  },

  createProgram: async (
    command: CreateVolumeDiscountProgramCommand
  ): Promise<VolumeDiscountProgram> => {
    const res = await apiClient.post(
      ENDPOINTS.VOLUME_DISCOUNT.CREATE,
      command
    );
    return res.data as VolumeDiscountProgram;
  },

  updateProgram: async (
    uid: string,
    command: UpdateVolumeDiscountProgramCommand
  ): Promise<VolumeDiscountProgram> => {
    const res = await apiClient.put(
      ENDPOINTS.VOLUME_DISCOUNT.UPDATE(uid),
      command
    );
    return res.data as VolumeDiscountProgram;
  },

  activateProgram: async (uid: string): Promise<VolumeDiscountProgram> => {
    const res = await apiClient.post(
      ENDPOINTS.VOLUME_DISCOUNT.ACTIVATE(uid)
    );
    return res.data as VolumeDiscountProgram;
  },

  addSpendRecord: async (
    programUid: string,
    command: AddSpendRecordCommand
  ): Promise<ClientSpendRecord> => {
    const res = await apiClient.post(
      ENDPOINTS.VOLUME_DISCOUNT.SPEND(programUid),
      command
    );
    return res.data as ClientSpendRecord;
  },

  listSpendRecords: async (
    programUid: string
  ): Promise<ClientSpendRecord[]> => {
    const res = await apiClient.get(
      ENDPOINTS.VOLUME_DISCOUNT.SPEND(programUid)
    );
    const data = res.data;
    if (Array.isArray(data)) {
      return data as ClientSpendRecord[];
    }
    if (data && typeof data === "object" && "content" in data) {
      return (data as { content: ClientSpendRecord[] }).content;
    }
    return [];
  },

  getDashboard: async (
    programUid: string
  ): Promise<VolumeDiscountDashboard> => {
    const res = await apiClient.get(
      ENDPOINTS.VOLUME_DISCOUNT.DASHBOARD(programUid)
    );
    return res.data as VolumeDiscountDashboard;
  },

  listPortalPrograms: async (): Promise<VolumeDiscountProgram[]> => {
    const res = await apiClient.get(ENDPOINTS.VOLUME_DISCOUNT.PORTAL_LIST);
    return res.data as VolumeDiscountProgram[];
  },

  getPortalDashboard: async (
    programUid: string
  ): Promise<VolumeDiscountDashboard> => {
    const res = await apiClient.get(
      ENDPOINTS.VOLUME_DISCOUNT.PORTAL_DASHBOARD(programUid)
    );
    return res.data as VolumeDiscountDashboard;
  },

  getPanelAgreement: async (programUid: string): Promise<PanelAgreement | null> => {
    try {
      const res = await apiClient.get(ENDPOINTS.VOLUME_DISCOUNT.PANEL_AGREEMENT(programUid));
      return res.data as PanelAgreement;
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  createPanelAgreement: async (
    programUid: string,
    command: CreatePanelAgreementCommand
  ): Promise<PanelAgreement> => {
    const res = await apiClient.post(ENDPOINTS.VOLUME_DISCOUNT.PANEL_AGREEMENT(programUid), command);
    return res.data as PanelAgreement;
  },

  recordSecondmentUsage: async (
    programUid: string,
    hours: number,
    matterUid?: string
  ): Promise<PanelAgreement> => {
    const res = await apiClient.post(ENDPOINTS.VOLUME_DISCOUNT.PANEL_SECONDMENT_USAGE(programUid), {
      hours,
      matterUid,
    });
    return res.data as PanelAgreement;
  },

  checkMfnCompliance: async (programUid: string): Promise<MfnCheckResult> => {
    const res = await apiClient.get(ENDPOINTS.VOLUME_DISCOUNT.PANEL_MFN_CHECK(programUid));
    return res.data as MfnCheckResult;
  },
};
