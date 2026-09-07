export interface Firm {
  uid: string;
  name: string;
  country: string;
  timezone: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED";
  registrationNumber?: string;
  taxId?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  establishedDate?: string;
}

export interface PracticeArea {
  uid: string;
  firmUid: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
}

export interface FeeEarnerLevel {
  uid: string;
  firmUid: string;
  name: string;
  code: string;
  sortOrder: number;
}

export interface RateCard {
  uid: string;
  firmUid: string;
  name: string;
  currency: string;
  effectiveDate: string;
  expiryDate?: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  officeCode?: string | null;
}

export interface RateCardEntry {
  uid: string;
  rateCardUid: string;
  feeEarnerLevelUid: string;
  practiceAreaUid?: string | null;
  hourlyRate: number;
  currency: string;
}

export interface ExchangeRate {
  uid: string;
  firmUid: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  asOfDate: string;
}

export interface CreateExchangeRateCommand {
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  asOfDate: string;
}

export interface ApprovalStageDefinition {
  uid?: string;
  sequenceNo: number;
  stageName: string;
  approverPermission: string;
  triggerMinDiscountPct?: number | null;
  triggerMinAmount?: number | null;
}

export interface ClientProfile {
  uid: string;
  firmUid: string;
  name: string;
  type: "CORPORATE" | "INDIVIDUAL" | "GOVERNMENT" | "FINANCIAL_INSTITUTION";
  tier: "STANDARD" | "PREFERRED" | "STRATEGIC";
  contactEmail: string;
  contactName: string;
  country: string;
}

export interface ClientPortalUser {
  uid: string;
  clientProfileUid: string;
  firmUid: string;
  email: string;
  name: string;
  active: boolean;
  inviteToken?: string | null;
}

export interface FirmGuardrails {
  uid: string;
  firmUid: string;
  minMarginPct: number;
  discountAutoMaxPct: number;
  discountPartnerMaxPct: number;
  discountAbovePartnerApprover: "COMMITTEE";
}

export interface CreatePracticeAreaCommand {
  name: string;
  code: string;
  description?: string;
}

export interface CreateFeeEarnerLevelCommand {
  name: string;
  code: string;
  sortOrder: number;
}

export interface CreateRateCardCommand {
  name: string;
  currency: string;
  effectiveDate: string;
  expiryDate?: string;
  officeCode?: string;
}

export interface AddRateCardEntryCommand {
  feeEarnerLevelUid: string;
  practiceAreaUid?: string | null;
  hourlyRate: number;
  currency: string;
}

export interface CreateClientProfileCommand {
  name: string;
  type: "CORPORATE" | "INDIVIDUAL" | "GOVERNMENT" | "FINANCIAL_INSTITUTION";
  tier: "STANDARD" | "PREFERRED" | "STRATEGIC";
  contactEmail: string;
  contactName: string;
  country: string;
}

export interface UpdateGuardrailsCommand {
  minMarginPct: number;
  discountAutoMaxPct: number;
  discountPartnerMaxPct: number;
}
