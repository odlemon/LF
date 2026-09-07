export interface CreditAccount {
  uid: string;
  firmUid: string;
  balance: number;
  currency: string;
  creditUnitPrice: number;
  active: boolean;
  totalConsumed: number;
  totalTopups: number;
  transactionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  uid: string;
  type: "USAGE" | "TOPUP" | "ADJUSTMENT";
  amount: number;
  balanceAfter: number;
  currency: string;
  description: string;
  feature?: string;
  referenceUid?: string;
  createdAt: string;
}

export interface UsageSummaryRow {
  feature: string;
  totalCredits: number;
  totalAmount: number;
}

export interface CreateAdjustmentCommand {
  amount: number;
  description: string;
}
