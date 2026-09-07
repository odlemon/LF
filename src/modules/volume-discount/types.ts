export interface VolumeDiscountProgram {
  uid: string;
  firmUid: string;
  clientProfileUid: string;
  currency: string;
  periodStart: string;
  periodEnd: string;
  status: "DRAFT" | "ACTIVE" | "EXPIRED" | "SUSPENDED";
}

export interface DiscountTier {
  uid: string;
  programUid: string;
  tierName: string;
  spendThreshold: number;
  discountPct: number;
  sortOrder: number;
}

export interface ClientSpendRecord {
  uid: string;
  programUid: string;
  invoiceReference?: string;
  amount: number;
  currency: string;
  spendDate: string;
  source: "MANUAL" | "AUTOMATED";
}

export interface TierChangeEvent {
  uid: string;
  programUid: string;
  clientProfileUid: string;
  oldTierUid?: string;
  newTierUid?: string;
  triggeredBySpendUid?: string;
  cumulativeSpendAtChange: number;
  retroactiveAdjustmentAmount: number;
  createdAt: string;
}

export interface DiscountAdjustment {
  uid: string;
  programUid: string;
  clientProfileUid: string;
  tierChangeEventUid: string;
  amount: number;
  currency: string;
  status: "PENDING" | "ISSUED" | "CANCELLED";
  issuedAt?: string;
}

export interface VolumeDiscountDashboard {
  programUid: string;
  clientProfileUid: string;
  status: "DRAFT" | "ACTIVE" | "EXPIRED" | "SUSPENDED";
  currency: string;
  periodStart: string;
  periodEnd: string;
  cumulativeSpend: number;
  currentTierUid?: string;
  currentTierName?: string;
  currentDiscountPct: number;
  nextTierUid?: string;
  nextTierName?: string;
  nextThreshold?: number;
  nextDiscountPct?: number;
  savingsToDate: number;
  totalSpendRecords: number;
  /** True when spend already qualifies for a tier not yet booked as a TierChangeEvent. */
  tierChangePending: boolean;
}

export interface CreateVolumeDiscountProgramCommand {
  clientProfileUid: string;
  currency: string;
  periodStart: string;
  periodEnd: string;
  tiers: TierCommand[];
}

export interface UpdateVolumeDiscountProgramCommand {
  currency: string;
  periodStart: string;
  periodEnd: string;
  tiers: TierCommand[];
}

export interface TierCommand {
  tierName: string;
  spendThreshold: number;
  discountPct: number;
  sortOrder: number;
}

export interface AddSpendRecordCommand {
  invoiceReference?: string;
  amount: number;
  currency: string;
  spendDate: string;
  source?: "MANUAL" | "AUTOMATED";
}

export interface PanelAgreement {
  uid: string;
  firmUid: string;
  programUid: string;
  clientProfileUid: string;
  agreementPeriodStart: string;
  agreementPeriodEnd: string;
  renewalDate?: string | null;
  mfnEnabled: boolean;
  secondmentCreditHours: number;
  secondmentCreditHoursUsed: number;
}

export interface CreatePanelAgreementCommand {
  agreementPeriodStart: string;
  agreementPeriodEnd: string;
  renewalDate?: string;
  mfnEnabled: boolean;
  secondmentCreditHours: number;
}

export interface MfnCheckResult {
  compliant: boolean;
  thisClientDiscountPct: number;
  bestComparableDiscountPct: number;
  bestComparableProgramUid?: string | null;
}
