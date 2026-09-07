import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AiDetailRow,
  BreakdownRow,
  ConsumptionSnapshot,
  FirmContract,
  FirmUsageRow,
  Statement,
  TrendRow,
} from "@/modules/billing/metering.types";

const withPeriod = (period?: string) => (period ? { params: { period } } : undefined);

export const meteringApi = {
  getSummary: async (period?: string): Promise<ConsumptionSnapshot> => {
    const res = await apiClient.get(ENDPOINTS.METERING.SUMMARY, withPeriod(period));
    return res.data as ConsumptionSnapshot;
  },

  getByOffice: async (period?: string): Promise<BreakdownRow[]> => {
    const res = await apiClient.get(ENDPOINTS.METERING.BY_OFFICE, withPeriod(period));
    return res.data as BreakdownRow[];
  },

  getByPracticeArea: async (period?: string): Promise<BreakdownRow[]> => {
    const res = await apiClient.get(ENDPOINTS.METERING.BY_PRACTICE_AREA, withPeriod(period));
    return res.data as BreakdownRow[];
  },

  getByClient: async (period?: string): Promise<BreakdownRow[]> => {
    const res = await apiClient.get(ENDPOINTS.METERING.BY_CLIENT, withPeriod(period));
    return res.data as BreakdownRow[];
  },

  /** Requires USAGE_USER_DETAIL_READ — per-person figures are not shown to every admin. */
  getByUser: async (period?: string): Promise<BreakdownRow[]> => {
    const res = await apiClient.get(ENDPOINTS.METERING.BY_USER, withPeriod(period));
    return res.data as BreakdownRow[];
  },

  getAiDetail: async (period?: string): Promise<AiDetailRow[]> => {
    const res = await apiClient.get(ENDPOINTS.METERING.AI_DETAIL, withPeriod(period));
    return res.data as AiDetailRow[];
  },

  getTrend: async (): Promise<TrendRow[]> => {
    const res = await apiClient.get(ENDPOINTS.METERING.TREND);
    return res.data as TrendRow[];
  },

  getStatement: async (period?: string): Promise<Statement> => {
    const res = await apiClient.get(ENDPOINTS.METERING.STATEMENT, withPeriod(period));
    return res.data as Statement;
  },

  /** Returns the raw CSV text; the caller turns it into a download. */
  getStatementCsv: async (period?: string): Promise<string> => {
    const res = await apiClient.get(ENDPOINTS.METERING.STATEMENT_CSV, {
      ...withPeriod(period),
      responseType: "text",
    });
    return res.data as string;
  },

  /** Binary — must be requested as an ArrayBuffer or the bytes are mangled as text. */
  getStatementPdf: async (period?: string): Promise<ArrayBuffer> => {
    const res = await apiClient.get(ENDPOINTS.METERING.STATEMENT_PDF, {
      ...withPeriod(period),
      responseType: "arraybuffer",
    });
    return res.data as ArrayBuffer;
  },

  getFirmStatementPdf: async (firmUid: string, period?: string): Promise<ArrayBuffer> => {
    const res = await apiClient.get(ENDPOINTS.METERING.ADMIN_FIRM_STATEMENT_PDF(firmUid), {
      ...withPeriod(period),
      responseType: "arraybuffer",
    });
    return res.data as ArrayBuffer;
  },

  getContract: async (): Promise<FirmContract | null> => {
    const res = await apiClient.get(ENDPOINTS.METERING.CONTRACT);
    return (res.data ?? null) as FirmContract | null;
  },

  saveContract: async (command: Partial<FirmContract>): Promise<FirmContract> => {
    const res = await apiClient.put(ENDPOINTS.METERING.CONTRACT, command);
    return res.data as FirmContract;
  },

  getAllFirms: async (period?: string): Promise<FirmUsageRow[]> => {
    const res = await apiClient.get(ENDPOINTS.METERING.ADMIN_FIRMS, withPeriod(period));
    return res.data as FirmUsageRow[];
  },

  getFirmStatement: async (firmUid: string, period?: string): Promise<Statement> => {
    const res = await apiClient.get(
      ENDPOINTS.METERING.ADMIN_FIRM_STATEMENT(firmUid),
      withPeriod(period),
    );
    return res.data as Statement;
  },
};
