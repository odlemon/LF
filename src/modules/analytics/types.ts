/**
 * Analytics (pricing intelligence) types.
 *
 * Field names mirror the backend DTOs in lysp-backend/analytics exactly
 * (FirmSummaryDto, PracticeAreaMetricsDto, WinRateRow, ProposalPerformanceDto,
 * RateComplianceDto, ClientMetricsDto, MatterDetailDto, AnomalyFlagResponse,
 * RateRecommendationResponse). Do NOT rename — the REST contract is final.
 *
 * Monetary / percentage values arrive from the backend as BigDecimal and are
 * normalised to `number` by the API layer (see analytics.api.ts).
 */

/** ISO date "YYYY-MM-DD" used for ?from / ?to query params. */
export type IsoDate = string;

export interface PeriodParams {
  from?: IsoDate;
  to?: IsoDate;
}

/* ------------------------------------------------------------------ */
/* Firm summary                                                        */
/* ------------------------------------------------------------------ */

export interface PriorPeriod {
  periodFrom: IsoDate;
  periodTo: IsoDate;
  revenueBilled: number;
  avgMarginPct: number | null;
  winRatePct: number;
  avgProposalDays: number | null;
  mattersPriced: number;
  revenueDeltaPct: number | null;
  marginDeltaPts: number | null;
  winRateDeltaPts: number | null;
  proposalDaysDelta: number | null;
  mattersPricedDeltaPct: number | null;
}

export interface FirmSummaryDto {
  periodFrom: IsoDate;
  periodTo: IsoDate;
  revenueBilled: number;
  avgMarginPct: number | null;
  winRatePct: number;
  avgProposalDays: number | null;
  mattersPriced: number;
  proposalsSent: number;
  proposalsWon: number;
  proposalsLost: number;
  priorPeriod: PriorPeriod | null;
  hasData: boolean;
}

/* ------------------------------------------------------------------ */
/* Practice area                                                       */
/* ------------------------------------------------------------------ */

export interface MonthlyPoint {
  /** ISO "yyyy-MM" */
  month: string;
  feeTotal: number;
  avgMarginPct: number;
  count: number;
}

export interface ModelShare {
  pricingModel: string;
  count: number;
  pct: number;
}

export interface TopMatter {
  uid: string;
  title: string;
  source: string;
  grossFees: number;
  marginPct: number;
  closedAt: string | null;
}

/** Relationship-health rollup for one client of a practice area. */
export interface PaClientRollup {
  clientProfileUid: string;
  clientName: string | null;
  revenue: number;
  avgMarginPct: number;
  winRatePct: number;
  mattersCount: number;
}

export interface PracticeAreaMetricsDto {
  practiceAreaUid: string;
  practiceAreaName: string;
  revenueBilled: number;
  avgMarginPct: number;
  winRatePct: number;
  mattersPriced: number;
  proposalsSent: number;
  proposalsWon: number;
  proposalsLost: number;
  targetMarginPct: number | null;
  marginVsTargetPts: number | null;
  marketMedianRate: number | null;
  marketMedianSource: string | null;
  monthlyTrend: MonthlyPoint[];
  pricingModelDistribution: ModelShare[];
  topMatters: TopMatter[];
  clients: PaClientRollup[];
}

/* ------------------------------------------------------------------ */
/* Win rate                                                            */
/* ------------------------------------------------------------------ */

export type WinRateDimension = "PRICING_MODEL" | "PRACTICE_AREA" | "CLIENT_TYPE";

export interface WinRateRow {
  dimensionValue: string;
  wins: number;
  losses: number;
  winRatePct: number;
  avgRoundsToClose: number | null;
  avgDaysToClose: number | null;
}

/* ------------------------------------------------------------------ */
/* Proposal performance                                                */
/* ------------------------------------------------------------------ */

export interface ProposalPerformanceDto {
  sent: number;
  won: number;
  lost: number;
  pending: number;
  withdrawn: number;
  winRatePct: number;
  avgRoundsToClose: number | null;
  avgDaysToClose: number | null;
  byPricingModel: WinRateRow[];
  byPracticeArea: WinRateRow[];
}

/* ------------------------------------------------------------------ */
/* Rate compliance                                                     */
/* ------------------------------------------------------------------ */

export interface LevelCompliance {
  feeEarnerLevelCode: string;
  /** Display name; may be null — fall back to the code. */
  feeEarnerLevelName: string | null;
  lineCount: number;
  compliantCount: number;
  belowCardCount: number;
  aboveCardCount: number;
  avgDeltaPct: number | null;
}

export interface RateComplianceDto {
  activeRateCardPresent: boolean;
  rateCardUid: string | null;
  rateCardName: string | null;
  linesEvaluated: number;
  compliantCount: number;
  nonCompliantCount: number;
  unmatchedCount: number;
  compliantPct: number;
  byLevel: LevelCompliance[];
}

/* ------------------------------------------------------------------ */
/* Client metrics                                                      */
/* ------------------------------------------------------------------ */

export interface RecentMatter {
  uid: string;
  title: string;
  status: string;
  grossFees: number;
  currentRound: number | null;
  closedAt: string | null;
}

export interface ClientMetricsDto {
  clientProfileUid: string;
  clientName: string;
  clientType: string | null;
  revenueBilled: number;
  avgMarginPct: number;
  winRatePct: number;
  negotiationsSent: number;
  negotiationsWon: number;
  negotiationsLost: number;
  negotiationsPending: number;
  avgDiscountPct: number | null;
  discountCost: number | null;
  avgRoundsToClose: number | null;
  avgDaysToClose: number | null;
  recentMatters: RecentMatter[];
}

/* ------------------------------------------------------------------ */
/* Matter detail                                                       */
/* ------------------------------------------------------------------ */

export interface MatterRoundRow {
  roundNumber: number;
  party: string;
  action: string;
  grossFees: number;
  estimatedCost: number | null;
  marginPct: number | null;
  discountPct: number | null;
  createdAt: string;
}

export interface MatterLineRow {
  phaseName: string;
  feeEarnerLevelCode: string;
  feeEarnerLevelName: string;
  hours: number;
  hourlyRate: number;
  amount: number;
}

export interface MatterDetailDto {
  uid: string;
  /** "SCENARIO" | "NEGOTIATION" */
  entityType: string;
  title: string;
  clientName: string;
  clientProfileUid: string | null;
  practiceAreaUid: string | null;
  practiceAreaName: string | null;
  pricingModel: string | null;
  status: string;
  currency: string | null;
  grossFees: number;
  estimatedCost: number | null;
  marginPct: number | null;
  discountPct: number | null;
  targetMarginPct: number | null;
  marginVsTargetPts: number | null;
  createdAt: string;
  decidedAt: string | null;
  sentAt: string | null;
  closedAt: string | null;
  currentRound: number | null;
  rounds: MatterRoundRow[];
  lines: MatterLineRow[];
}

/* ------------------------------------------------------------------ */
/* Anomalies                                                           */
/* ------------------------------------------------------------------ */

export type AnomalySeverity = "LOW" | "MEDIUM" | "HIGH";
export type AnomalyStatus = "OPEN" | "RESOLVED" | "VALID_EXCEPTION";
export type AnomalyType =
  | "MARGIN_BELOW_FLOOR"
  | "DISCOUNT_ABOVE_MAX"
  | "RATE_ABOVE_CARD"
  | "MARGIN_BELOW_PA_AVG"
  | "EXCESS_ROUNDS"
  | "SCOPE_OVERRUN"
  | "RATE_DEVIATION";

export interface AnomalyFlagResponse {
  uid: string;
  firmUid: string;
  sourceType: string | null;
  sourceUid: string | null;
  severity: AnomalySeverity;
  anomalyType: AnomalyType;
  practiceAreaUid: string | null;
  clientProfileUid: string | null;
  metricValue: number | null;
  thresholdValue: number | null;
  context: string | null;
  aiDescription: string | null;
  aiRootCause: string | null;
  status: AnomalyStatus;
  resolutionNote: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface AnomalyListParams extends PeriodParams {
  severity?: AnomalySeverity;
  status?: AnomalyStatus;
  anomalyType?: AnomalyType;
  practiceAreaUid?: string;
}

export type AnomalyOutcome = "RESOLVED" | "VALID_EXCEPTION";

export interface ResolveAnomalyCommand {
  note: string;
  outcome: AnomalyOutcome;
}

/* ------------------------------------------------------------------ */
/* Rate recommendations                                                */
/* ------------------------------------------------------------------ */

export interface RateRecommendationResponse {
  uid: string;
  firmUid: string;
  practiceAreaUid: string;
  jurisdiction: string | null;
  feeEarnerLevelCode: string;
  currentRate: number | null;
  recommendedRate: number;
  marketMedian: number | null;
  marketLow: number | null;
  marketHigh: number | null;
  confidence: string | null;
  pricingPower: boolean | null;
  sampleSize: number | null;
  dataSufficient: boolean;
  reasoning: string | null;
  generatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Advisor (SSE chat)                                                  */
/* ------------------------------------------------------------------ */

export interface AdvisorMessage {
  uid: string;
  sessionUid: string;
  role: "USER" | "AI";
  content: string;
  createdAt: string;
}

export interface AdvisorStartEvent {
  sessionId?: string;
  messageUid?: string;
}

export interface AdvisorTokenEvent {
  content: string;
}

export interface AdvisorToolStartEvent {
  toolName: string;
  humanLabel?: string;
}

export interface AdvisorToolResultEvent {
  toolName: string;
  success: boolean;
  error?: string;
}

export interface AdvisorDoneEvent {
  sessionId?: string;
  messageUid?: string;
}

export interface AdvisorErrorEvent {
  message: string;
}

/* ------------------------------------------------------------------ */
/* Leaderboards — one call per screen, not one call per row            */
/* ------------------------------------------------------------------ */

export interface PracticeAreaLeaderboardRow {
  practiceAreaUid: string;
  practiceAreaName: string;
  revenueBilled: number;
  avgMarginPct: number;
  winRatePct: number;
  targetMarginPct: number | null;
  marginVsTargetPts: number | null;
  mattersPriced: number;
  wins: number;
  losses: number;
}

export interface ClientLeaderboardRow {
  clientProfileUid: string;
  clientName: string;
  clientType: string | null;
  revenueBilled: number;
  avgMarginPct: number;
  winRatePct: number;
  avgDiscountPct: number;
  mattersPriced: number;
  wins: number;
  losses: number;
}

/* ------------------------------------------------------------------ */
/* Rate intelligence, surfaced inline in the negotiation workspace     */
/* ------------------------------------------------------------------ */

export interface RateLevelIntelligence {
  feeEarnerLevelCode: string;
  feeEarnerLevelName: string;
  rateCardRate: number | null;
  recommendedRate: number | null;
  marketMedian: number | null;
  marketLow: number | null;
  marketHigh: number | null;
  confidence: string | null;
  dataSufficient: boolean;
  sampleSize: number;
  /** Average rate this client has actually agreed on settled matters, excluding the current one. */
  clientAgreedAvgRate: number | null;
  clientAgreedSampleSize: number;
  practiceAgreedAvgRate: number | null;
  practiceAgreedSampleSize: number;
}

export interface NegotiationRateIntelligence {
  negotiationUid: string;
  practiceAreaUid: string | null;
  currency: string;
  levels: RateLevelIntelligence[];
  clientMatterCount: number | null;
  practiceAreaMatterCount: number | null;
  note: string;
}

/* ------------------------------------------------------------------ */
/* Client relationship intelligence, shown on the client profile       */
/* ------------------------------------------------------------------ */

export interface ClientSignal {
  tone: "RISK" | "WATCH" | "OPPORTUNITY" | "POSITIVE" | "NEUTRAL" | string;
  title: string;
  detail: string;
}

export interface ClientIntelligence {
  clientProfileUid: string;
  clientName: string;
  clientType: string | null;
  clientTier: string | null;
  periodFrom: string;
  periodTo: string;
  revenueBilled: number | null;
  priorRevenueBilled: number | null;
  revenueChangePct: number | null;
  avgMarginPct: number | null;
  priorAvgMarginPct: number | null;
  marginChangePts: number | null;
  avgDiscountPct: number | null;
  priorAvgDiscountPct: number | null;
  discountChangePts: number | null;
  winRatePct: number | null;
  priorWinRatePct: number | null;
  winRateChangePts: number | null;
  avgRoundsToClose: number | null;
  priorAvgRoundsToClose: number | null;
  avgDaysToClose: number | null;
  priorAvgDaysToClose: number | null;
  proposalsSent: number;
  proposalsWon: number;
  proposalsLost: number;
  proposalsPending: number;
  discountCost: number | null;
  practiceAreasUsed: number;
  practiceAreasAvailable: number;
  practiceAreasUsedNames: string[];
  practiceAreasUnusedNames: string[];
  /** False when either period has too few settled matters to read a trend from. */
  trendReliable: boolean;
  signals: ClientSignal[];
}

/* ------------------------------------------------------------------ */
/* Partner consistency (permission-gated) and detector effectiveness   */
/* ------------------------------------------------------------------ */

export interface PartnerConsistencyRow {
  partnerKey: string;
  partnerName: string;
  matters: number;
  avgDiscountPct: number | null;
  avgMarginPct: number | null;
  /** Null when no comparison was drawn for the practice area. */
  discountVsMedianPts: number | null;
  marginVsMedianPts: number | null;
  outlier: boolean;
}

export interface PracticeAreaConsistency {
  practiceAreaUid: string;
  practiceAreaName: string;
  partners: PartnerConsistencyRow[];
  /** Partners with too few matters to compare, surfaced so exclusions are visible. */
  excludedPartners: PartnerConsistencyRow[];
  medianDiscountPct: number | null;
  medianMarginPct: number | null;
  discountSpreadPts: number | null;
  comparisonDrawn: boolean;
  note: string;
}

export interface AnomalyDetectorRow {
  anomalyType: string;
  enabled: boolean;
  totalFlags: number;
  open: number;
  actioned: number;
  dismissedAsValid: number;
  /** Null until the detector has been judged enough times to mean anything. */
  falsePositiveRatePct: number | null;
  verdict: string;
}

export interface AnomalyEffectiveness {
  detectors: AnomalyDetectorRow[];
  totalFlags: number;
  totalReviewed: number;
  overallFalsePositiveRatePct: number | null;
  minReviewedForRate: number;
}

export interface AnomalyThresholds {
  scopeOverrunRatio: number;
  excessRoundsRatio: number;
  paMarginMediumRelPct: number;
  paMarginLowRelPct: number;
  rateDeviationTolerancePct: number;
  rateRecoMediumRelPct: number;
  rateRecoLowRelPct: number;
  scopeOverrunEnabled: boolean;
  excessRoundsEnabled: boolean;
  marginBelowPaAvgEnabled: boolean;
  rateDeviationEnabled: boolean;
  marginBelowFloorEnabled: boolean;
  discountAboveMaxEnabled: boolean;
  rateAboveCardEnabled: boolean;
}
