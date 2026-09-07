import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { CreditAccount, CreditTransaction, UsageSummaryRow, CreateAdjustmentCommand } from "@/modules/billing/types";

export const billingApi = {
  getAccount: async (): Promise<CreditAccount> => {
    const res = await apiClient.get(ENDPOINTS.BILLING.ACCOUNT);
    return res.data as CreditAccount;
  },

  getTransactions: async (page = 0, size = 20): Promise<{ content: CreditTransaction[]; totalElements: number }> => {
    const res = await apiClient.get(ENDPOINTS.BILLING.TRANSACTIONS, { params: { page, size } });
    const data = res.data;
    if (Array.isArray(data)) {
      return { content: data as CreditTransaction[], totalElements: data.length };
    }
    return data as { content: CreditTransaction[]; totalElements: number };
  },

  getRecentTransactions: async (limit = 20): Promise<CreditTransaction[]> => {
    const res = await apiClient.get(ENDPOINTS.BILLING.TRANSACTIONS_RECENT, { params: { limit } });
    return res.data as CreditTransaction[];
  },

  getUsageSummary: async (from: string, to: string): Promise<UsageSummaryRow[]> => {
    const res = await apiClient.get(ENDPOINTS.BILLING.USAGE_SUMMARY, { params: { from, to } });
    return res.data as UsageSummaryRow[];
  },

  createAdjustment: async (command: CreateAdjustmentCommand): Promise<CreditTransaction> => {
    const res = await apiClient.post(ENDPOINTS.BILLING.ADJUST, command);
    return res.data as CreditTransaction;
  },
};
