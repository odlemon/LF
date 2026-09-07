export type NegotiationStatus =
  | "DRAFT"
  | "SENT"
  | "NEGOTIATING"
  | "CLIENT_APPROVED"
  | "CLIENT_REJECTED"
  | "WITHDRAWN";

export type NegotiationParty = "FIRM" | "CLIENT";

export type NegotiationRoundAction =
  | "OPENING_OFFER"
  | "COUNTER"
  | "ACCEPT"
  | "REJECT"
  | "WITHDRAW";

export interface NegotiationRateLine {
  id: string;
  phaseName?: string | null;
  feeEarnerLevelUid?: string | null;
  feeEarnerLevelCode?: string | null;
  feeEarnerLevelName?: string | null;
  description?: string | null;
  hours?: number | null;
  hourlyRate?: number | null;
  amount?: number | null;
  sortOrder?: number;
}

export interface NegotiationRound {
  id: string;
  roundNumber: number;
  party: NegotiationParty | string;
  action: NegotiationRoundAction | string;
  comment?: string | null;
  currency?: string | null;
  grossFees?: number | null;
  estimatedCost?: number | null;
  marginPct?: number | null;
  discountPct?: number | null;
  createdByEmail?: string | null;
  createdAt?: string | null;
  lines: NegotiationRateLine[];
}

export interface NegotiationListItem {
  id: string;
  matterTitle?: string | null;
  clientName?: string | null;
  status: NegotiationStatus | string;
  currency?: string | null;
  latestGrossFees?: number | null;
  currentRound?: number | null;
  sentAt?: string | null;
  updatedAt?: string | null;
  responseDeadline?: string | null;
}

export interface NegotiationDetail {
  id: string;
  firmUid?: string | null;
  pricingRequestUid?: string | null;
  scenarioUid?: string | null;
  clientProfileUid?: string | null;
  matterTitle?: string | null;
  clientName?: string | null;
  currency?: string | null;
  coverMessage?: string | null;
  scopeSummary?: string | null;
  responseDeadline?: string | null;
  currentRound?: number | null;
  status: NegotiationStatus | string;
  sentAt?: string | null;
  closedAt?: string | null;
  sentByEmail?: string | null;
  portalUserEmail?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  latestGrossFees?: number | null;
  latestMarginPct?: number | null;
  latestDiscountPct?: number | null;
  rounds: NegotiationRound[];
}

export interface NegotiationLineCommand {
  feeEarnerLevelUid?: string | null;
  feeEarnerLevelCode?: string | null;
  feeEarnerLevelName?: string | null;
  phaseName?: string | null;
  description?: string | null;
  hours?: number | null;
  hourlyRate?: number | null;
}

export interface NegotiationActionCommand {
  comment?: string | null;
  discountPct?: number | null;
  lines?: NegotiationLineCommand[];
}

export interface SendToClientCommand {
  clientProfileUid?: string | null;
  portalUserEmail?: string | null;
  coverMessage?: string | null;
  responseDeadline?: string | null;
  portalUserPassword?: string | null;
  portalUserName?: string | null;
}

export interface NegotiationAiSuggest {
  brief?: string | null;
  recommendation?: string | null;
  clearsGuardrail?: boolean;
  projectedMarginPct?: number | null;
  projectedGrossFees?: number | null;
  walkAwayGrossFees?: number | null;
  suggestedLines?: NegotiationLineCommand[];
  risks?: string[];
  learningPrompt?: string | null;
}

export interface RateLevelDraft {
  key: string;
  feeEarnerLevelUid?: string | null;
  feeEarnerLevelCode?: string | null;
  feeEarnerLevelName: string;
  hourlyRate: number;
  hours: number;
}

export type EngagementPackStatus = "DRAFT" | "SENT" | "ACKNOWLEDGED";

export interface EngagementPackLine {
  feeEarnerLevelCode?: string | null;
  feeEarnerLevelName?: string | null;
  description?: string | null;
  phaseName?: string | null;
  hours?: number | null;
  hourlyRate?: number | null;
  amount?: number | null;
}

export interface EngagementPack {
  id: string;
  firmUid?: string | null;
  negotiationUid: string;
  clientProfileUid?: string | null;
  status: EngagementPackStatus | string;
  matterTitle?: string | null;
  clientName?: string | null;
  firmName?: string | null;
  firmAddress?: string | null;
  governingLaw?: string | null;
  scopeSummary?: string | null;
  currency?: string | null;
  agreedGrossFees?: number | null;
  letterBodyHtml?: string | null;
  coverNote?: string | null;
  rateSchedule?: EngagementPackLine[];
  generatedAt?: string | null;
  generatedByEmail?: string | null;
  sentAt?: string | null;
  sentByEmail?: string | null;
  acknowledgedAt?: string | null;
  acknowledgedByEmail?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

