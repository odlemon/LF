export interface FirmContract {
  uid: string;
  firmUid: string;
  contractReference: string;
  contractType: "COMMERCIAL" | "PILOT" | "TRIAL";
  billable: boolean;
  currency: string;
  periodStart: string;
  periodEnd: string;
  renewalDate: string | null;
  seatEntitlement: number | null;
  aiCreditEntitlement: number | null;
  storageEntitlementGb: number | null;
  hardCeilingMultiplier: number | null;
  active: boolean;
}

export interface ConsumptionSnapshot {
  firmUid: string;
  billingPeriod: string;
  contract: FirmContract | null;
  creditEntitlement: number | null;
  consumedCredits: number;
  usagePct: number | null;
  overageCredits: number;
  aiInputTokens: number;
  aiOutputTokens: number;
  aiCalls: number;
  operations: number;
  documentsProcessed: number;
  recordsImported: number;
  bytesStored: number;
  logins: number;
  activeSeats: number;
  seatEntitlement: number | null;
}

export interface BreakdownRow {
  bucket: string;
  events: number;
  tokens: number;
}

export interface AiDetailRow {
  provider: string;
  model: string;
  feature: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
}

export interface LineItemRow {
  eventType: string;
  unit: string;
  events: number;
  quantity: number;
}

export interface TrendRow {
  period: string;
  tokens: number;
  events: number;
}

export interface Statement {
  firmUid: string;
  period: string;
  contractReference: string;
  contractType: string;
  billable: boolean;
  currency: string;
  entitlement: number | null;
  consumed: number;
  usagePct: number | null;
  overage: number;
  activeSeats: number;
  seatEntitlement: number | null;
  lineItems: LineItemRow[];
  aiDetail: AiDetailRow[];
}

export interface FirmUsageRow {
  firmUid: string;
  period: string;
  contractReference: string;
  contractType: string;
  billable: boolean;
  entitlement: number | null;
  consumedCredits: number;
  usagePct: number | null;
  overageCredits: number;
  aiCalls: number;
  aiInputTokens: number;
  aiOutputTokens: number;
  activeSeats: number;
  seatEntitlement: number | null;
}
