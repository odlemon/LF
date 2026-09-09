import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import type {
  PeriodParams,
  FirmSummaryDto,
  PriorPeriod,
  PracticeAreaMetricsDto,
  WinRateRow,
  WinRateDimension,
  ProposalPerformanceDto,
  RateComplianceDto,
  ClientMetricsDto,
  MatterDetailDto,
  AnomalyFlagResponse,
  AnomalyListParams,
  ResolveAnomalyCommand,
  RateRecommendationResponse,
  AdvisorMessage,
  PracticeAreaLeaderboardRow,
  ClientLeaderboardRow,
  NegotiationRateIntelligence,
  ClientIntelligence,
  PracticeAreaConsistency,
  PartnerConsistencyRow,
  AnomalyEffectiveness,
  AnomalyThresholds,
} from "@/modules/analytics/types";

/* ------------------------------------------------------------------ */
/* BigDecimal -> number coercion                                       */
/* ------------------------------------------------------------------ */

/** BigDecimal arrives as a JSON number (occasionally a string). */
function num(value: unknown): number {
  if (value == null) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** BigDecimal that must stay nullable (targets, market rates, deltas). */
function numOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapPartnerRow(p: any): PartnerConsistencyRow {
  return {
    partnerKey: p.partnerKey,
    partnerName: p.partnerName || p.partnerKey,
    matters: num(p.matters),
    avgDiscountPct: numOrNull(p.avgDiscountPct),
    avgMarginPct: numOrNull(p.avgMarginPct),
    discountVsMedianPts: numOrNull(p.discountVsMedianPts),
    marginVsMedianPts: numOrNull(p.marginVsMedianPts),
    outlier: !!p.outlier,
  };
}

function buildPeriodQuery(params: PeriodParams = {}): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.from) query.from = params.from;
  if (params.to) query.to = params.to;
  return query;
}

/* ------------------------------------------------------------------ */
/* Normalizers                                                         */
/* ------------------------------------------------------------------ */

function normalizePriorPeriod(raw: unknown): PriorPeriod | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    periodFrom: String(r.periodFrom ?? ""),
    periodTo: String(r.periodTo ?? ""),
    revenueBilled: num(r.revenueBilled),
    avgMarginPct: numOrNull(r.avgMarginPct),
    winRatePct: num(r.winRatePct),
    avgProposalDays: numOrNull(r.avgProposalDays),
    mattersPriced: num(r.mattersPriced),
    revenueDeltaPct: numOrNull(r.revenueDeltaPct),
    marginDeltaPts: numOrNull(r.marginDeltaPts),
    winRateDeltaPts: numOrNull(r.winRateDeltaPts),
    proposalDaysDelta: numOrNull(r.proposalDaysDelta),
    mattersPricedDeltaPct: numOrNull(r.mattersPricedDeltaPct),
  };
}

function normalizeFirmSummary(raw: unknown): FirmSummaryDto {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    periodFrom: String(r.periodFrom ?? ""),
    periodTo: String(r.periodTo ?? ""),
    revenueBilled: num(r.revenueBilled),
    avgMarginPct: numOrNull(r.avgMarginPct),
    winRatePct: num(r.winRatePct),
    avgProposalDays: numOrNull(r.avgProposalDays),
    mattersPriced: num(r.mattersPriced),
    proposalsSent: num(r.proposalsSent),
    proposalsDecided: num(r.proposalsDecided),
    proposalsWon: num(r.proposalsWon),
    proposalsLost: num(r.proposalsLost),
    priorPeriod: normalizePriorPeriod(r.priorPeriod),
    hasData: Boolean(r.hasData),
  };
}

function normalizePracticeAreaMetrics(raw: unknown): PracticeAreaMetricsDto {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    practiceAreaUid: String(r.practiceAreaUid ?? ""),
    practiceAreaName: String(r.practiceAreaName ?? ""),
    revenueBilled: num(r.revenueBilled),
    avgMarginPct: num(r.avgMarginPct),
    winRatePct: num(r.winRatePct),
    mattersPriced: num(r.mattersPriced),
    proposalsSent: num(r.proposalsSent),
    proposalsWon: num(r.proposalsWon),
    proposalsLost: num(r.proposalsLost),
    targetMarginPct: numOrNull(r.targetMarginPct),
    marginVsTargetPts: numOrNull(r.marginVsTargetPts),
    marketMedianRate: numOrNull(r.marketMedianRate),
    marketMedianSource: r.marketMedianSource != null ? String(r.marketMedianSource) : null,
    monthlyTrend: Array.isArray(r.monthlyTrend)
      ? r.monthlyTrend.map((m) => {
          const p = (m ?? {}) as Record<string, unknown>;
          return {
            month: String(p.month ?? ""),
            feeTotal: num(p.feeTotal),
            avgMarginPct: num(p.avgMarginPct),
            count: num(p.count),
          };
        })
      : [],
    pricingModelDistribution: Array.isArray(r.pricingModelDistribution)
      ? r.pricingModelDistribution.map((m) => {
          const p = (m ?? {}) as Record<string, unknown>;
          return {
            pricingModel: String(p.pricingModel ?? ""),
            count: num(p.count),
            pct: num(p.pct),
          };
        })
      : [],
    topMatters: Array.isArray(r.topMatters)
      ? r.topMatters.map((m) => {
          const p = (m ?? {}) as Record<string, unknown>;
          return {
            uid: String(p.uid ?? ""),
            title: String(p.title ?? ""),
            source: String(p.source ?? ""),
            grossFees: num(p.grossFees),
            marginPct: num(p.marginPct),
            closedAt: p.closedAt != null ? String(p.closedAt) : null,
          };
        })
      : [],
    clients: Array.isArray(r.clients)
      ? r.clients.map((c) => {
          const p = (c ?? {}) as Record<string, unknown>;
          return {
            clientProfileUid: String(p.clientProfileUid ?? ""),
            clientName: p.clientName != null ? String(p.clientName) : null,
            revenue: num(p.revenue),
            avgMarginPct: num(p.avgMarginPct),
            winRatePct: num(p.winRatePct),
            mattersCount: num(p.mattersCount),
          };
        })
      : [],
  };
}

function normalizeWinRateRow(raw: unknown): WinRateRow {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    dimensionValue: String(r.dimensionValue ?? ""),
    wins: num(r.wins),
    losses: num(r.losses),
    winRatePct: num(r.winRatePct),
    avgRoundsToClose: numOrNull(r.avgRoundsToClose),
    avgDaysToClose: numOrNull(r.avgDaysToClose),
  };
}

function normalizeWinRateRows(raw: unknown): WinRateRow[] {
  return Array.isArray(raw) ? raw.map(normalizeWinRateRow) : [];
}

function normalizeProposalPerformance(raw: unknown): ProposalPerformanceDto {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    sent: num(r.sent),
    won: num(r.won),
    lost: num(r.lost),
    pending: num(r.pending),
    withdrawn: num(r.withdrawn),
    winRatePct: num(r.winRatePct),
    avgRoundsToClose: numOrNull(r.avgRoundsToClose),
    avgDaysToClose: numOrNull(r.avgDaysToClose),
    byPricingModel: normalizeWinRateRows(r.byPricingModel),
    byPracticeArea: normalizeWinRateRows(r.byPracticeArea),
  };
}

function normalizeRateCompliance(raw: unknown): RateComplianceDto {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    activeRateCardPresent: Boolean(r.activeRateCardPresent),
    rateCardUid: r.rateCardUid != null ? String(r.rateCardUid) : null,
    rateCardName: r.rateCardName != null ? String(r.rateCardName) : null,
    linesEvaluated: num(r.linesEvaluated),
    compliantCount: num(r.compliantCount),
    nonCompliantCount: num(r.nonCompliantCount),
    unmatchedCount: num(r.unmatchedCount),
    compliantPct: num(r.compliantPct),
    byLevel: Array.isArray(r.byLevel)
      ? r.byLevel.map((l) => {
          const p = (l ?? {}) as Record<string, unknown>;
          return {
            feeEarnerLevelCode: String(p.feeEarnerLevelCode ?? ""),
            feeEarnerLevelName: p.feeEarnerLevelName != null ? String(p.feeEarnerLevelName) : null,
            lineCount: num(p.lineCount),
            compliantCount: num(p.compliantCount),
            belowCardCount: num(p.belowCardCount),
            aboveCardCount: num(p.aboveCardCount),
            avgDeltaPct: numOrNull(p.avgDeltaPct),
          };
        })
      : [],
  };
}

function normalizeClientMetrics(raw: unknown): ClientMetricsDto {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    clientProfileUid: String(r.clientProfileUid ?? ""),
    clientName: String(r.clientName ?? ""),
    clientType: r.clientType != null ? String(r.clientType) : null,
    revenueBilled: num(r.revenueBilled),
    avgMarginPct: num(r.avgMarginPct),
    winRatePct: num(r.winRatePct),
    negotiationsSent: num(r.negotiationsSent),
    negotiationsWon: num(r.negotiationsWon),
    negotiationsLost: num(r.negotiationsLost),
    negotiationsPending: num(r.negotiationsPending),
    avgDiscountPct: numOrNull(r.avgDiscountPct),
    discountCost: numOrNull(r.discountCost),
    avgRoundsToClose: numOrNull(r.avgRoundsToClose),
    avgDaysToClose: numOrNull(r.avgDaysToClose),
    recentMatters: Array.isArray(r.recentMatters)
      ? r.recentMatters.map((m) => {
          const p = (m ?? {}) as Record<string, unknown>;
          return {
            uid: String(p.uid ?? ""),
            title: String(p.title ?? ""),
            status: String(p.status ?? ""),
            grossFees: num(p.grossFees),
            currentRound: numOrNull(p.currentRound),
            closedAt: p.closedAt != null ? String(p.closedAt) : null,
          };
        })
      : [],
  };
}

function normalizeMatterDetail(raw: unknown): MatterDetailDto {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    uid: String(r.uid ?? ""),
    entityType: String(r.entityType ?? ""),
    title: String(r.title ?? ""),
    clientName: String(r.clientName ?? ""),
    clientProfileUid: r.clientProfileUid != null ? String(r.clientProfileUid) : null,
    practiceAreaUid: r.practiceAreaUid != null ? String(r.practiceAreaUid) : null,
    practiceAreaName: r.practiceAreaName != null ? String(r.practiceAreaName) : null,
    pricingModel: r.pricingModel != null ? String(r.pricingModel) : null,
    status: String(r.status ?? ""),
    currency: r.currency != null ? String(r.currency) : null,
    grossFees: num(r.grossFees),
    estimatedCost: numOrNull(r.estimatedCost),
    marginPct: numOrNull(r.marginPct),
    discountPct: numOrNull(r.discountPct),
    targetMarginPct: numOrNull(r.targetMarginPct),
    marginVsTargetPts: numOrNull(r.marginVsTargetPts),
    createdAt: String(r.createdAt ?? ""),
    decidedAt: r.decidedAt != null ? String(r.decidedAt) : null,
    sentAt: r.sentAt != null ? String(r.sentAt) : null,
    closedAt: r.closedAt != null ? String(r.closedAt) : null,
    currentRound: numOrNull(r.currentRound),
    rounds: Array.isArray(r.rounds)
      ? r.rounds.map((x) => {
          const p = (x ?? {}) as Record<string, unknown>;
          return {
            roundNumber: num(p.roundNumber),
            party: String(p.party ?? ""),
            action: String(p.action ?? ""),
            grossFees: num(p.grossFees),
            estimatedCost: numOrNull(p.estimatedCost),
            marginPct: numOrNull(p.marginPct),
            discountPct: numOrNull(p.discountPct),
            createdAt: String(p.createdAt ?? ""),
          };
        })
      : [],
    lines: Array.isArray(r.lines)
      ? r.lines.map((x) => {
          const p = (x ?? {}) as Record<string, unknown>;
          return {
            phaseName: String(p.phaseName ?? ""),
            feeEarnerLevelCode: String(p.feeEarnerLevelCode ?? ""),
            feeEarnerLevelName: String(p.feeEarnerLevelName ?? ""),
            hours: num(p.hours),
            hourlyRate: num(p.hourlyRate),
            amount: num(p.amount),
          };
        })
      : [],
  };
}

function normalizeAnomaly(raw: unknown): AnomalyFlagResponse {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    uid: String(r.uid ?? ""),
    firmUid: String(r.firmUid ?? ""),
    sourceType: r.sourceType != null ? String(r.sourceType) : null,
    sourceUid: r.sourceUid != null ? String(r.sourceUid) : null,
    severity: (r.severity ?? "LOW") as AnomalyFlagResponse["severity"],
    anomalyType: (r.anomalyType ?? "RATE_DEVIATION") as AnomalyFlagResponse["anomalyType"],
    practiceAreaUid: r.practiceAreaUid != null ? String(r.practiceAreaUid) : null,
    clientProfileUid: r.clientProfileUid != null ? String(r.clientProfileUid) : null,
    metricValue: numOrNull(r.metricValue),
    thresholdValue: numOrNull(r.thresholdValue),
    context: r.context != null ? String(r.context) : null,
    aiDescription: r.aiDescription != null ? String(r.aiDescription) : null,
    aiRootCause: r.aiRootCause != null ? String(r.aiRootCause) : null,
    status: (r.status ?? "OPEN") as AnomalyFlagResponse["status"],
    resolutionNote: r.resolutionNote != null ? String(r.resolutionNote) : null,
    resolvedBy: r.resolvedBy != null ? String(r.resolvedBy) : null,
    resolvedAt: r.resolvedAt != null ? String(r.resolvedAt) : null,
    createdAt: String(r.createdAt ?? ""),
  };
}

function normalizeRecommendation(raw: unknown): RateRecommendationResponse {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    uid: String(r.uid ?? ""),
    firmUid: String(r.firmUid ?? ""),
    practiceAreaUid: String(r.practiceAreaUid ?? ""),
    jurisdiction: r.jurisdiction != null ? String(r.jurisdiction) : null,
    feeEarnerLevelCode: String(r.feeEarnerLevelCode ?? ""),
    currentRate: numOrNull(r.currentRate),
    recommendedRate: num(r.recommendedRate),
    marketMedian: numOrNull(r.marketMedian),
    marketLow: numOrNull(r.marketLow),
    marketHigh: numOrNull(r.marketHigh),
    confidence: r.confidence != null ? String(r.confidence) : null,
    pricingPower: r.pricingPower == null ? null : Boolean(r.pricingPower),
    sampleSize: numOrNull(r.sampleSize),
    dataSufficient: Boolean(r.dataSufficient),
    reasoning: r.reasoning != null ? String(r.reasoning) : null,
    generatedAt: String(r.generatedAt ?? ""),
  };
}

function normalizeAdvisorMessage(raw: unknown): AdvisorMessage {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    uid: String(r.uid ?? r.id ?? ""),
    sessionUid: String(r.sessionUid ?? r.sessionId ?? ""),
    role: (String(r.role ?? "AI").toUpperCase() === "USER" ? "USER" : "AI") as AdvisorMessage["role"],
    content: String(r.content ?? r.text ?? ""),
    createdAt: String(r.createdAt ?? ""),
  };
}

function asList<T>(data: unknown, map: (raw: unknown) => T): T[] {
  if (Array.isArray(data)) return data.map(map);
  if (data && typeof data === "object" && Array.isArray((data as { content?: unknown[] }).content)) {
    return (data as { content: unknown[] }).content.map(map);
  }
  return [];
}

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* ------------------------------------------------------------------ */

export const analyticsApi = {
  getFirmSummary: async (params: PeriodParams = {}): Promise<FirmSummaryDto> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.FIRM_SUMMARY, {
      params: buildPeriodQuery(params),
    });
    return normalizeFirmSummary(res.data);
  },

  getPracticeAreaMetrics: async (
    practiceAreaUid: string,
    params: PeriodParams = {}
  ): Promise<PracticeAreaMetricsDto> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.PRACTICE_AREA(practiceAreaUid), {
      params: buildPeriodQuery(params),
    });
    return normalizePracticeAreaMetrics(res.data);
  },

  /**
   * Every practice area in one call. Replaces a per-area fan-out that re-read the firm's
   * whole scenario and negotiation set once per area.
   */
  getPracticeAreaLeaderboard: async (
    params: PeriodParams = {}
  ): Promise<PracticeAreaLeaderboardRow[]> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.PRACTICE_AREA_LEADERBOARD, {
      params: buildPeriodQuery(params),
    });
    return (res.data as any[]).map((r) => ({
      practiceAreaUid: r.practiceAreaUid,
      practiceAreaName: r.practiceAreaName,
      revenueBilled: num(r.revenueBilled),
      avgMarginPct: num(r.avgMarginPct),
      winRatePct: num(r.winRatePct),
      targetMarginPct: r.targetMarginPct === null ? null : num(r.targetMarginPct),
      marginVsTargetPts: r.marginVsTargetPts === null ? null : num(r.marginVsTargetPts),
      mattersPriced: num(r.mattersPriced),
      wins: num(r.wins),
      losses: num(r.losses),
    }));
  },

  getClientLeaderboard: async (
    params: PeriodParams = {},
    limit = 25
  ): Promise<ClientLeaderboardRow[]> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.CLIENT_LEADERBOARD, {
      params: { ...buildPeriodQuery(params), limit },
    });
    return (res.data as any[]).map((r) => ({
      clientProfileUid: r.clientProfileUid,
      clientName: r.clientName,
      clientType: r.clientType ?? null,
      revenueBilled: num(r.revenueBilled),
      avgMarginPct: num(r.avgMarginPct),
      winRatePct: num(r.winRatePct),
      avgDiscountPct: num(r.avgDiscountPct),
      mattersPriced: num(r.mattersPriced),
      wins: num(r.wins),
      losses: num(r.losses),
    }));
  },

  /** Rate intelligence for one live negotiation, for the inline workspace panel. */
  getNegotiationRateIntelligence: async (
    negotiationUid: string
  ): Promise<NegotiationRateIntelligence> => {
    const res = await apiClient.get(
      ENDPOINTS.ANALYTICS.NEGOTIATION_RATE_INTELLIGENCE(negotiationUid)
    );
    const d = res.data as any;
    return {
      negotiationUid: d.negotiationUid,
      practiceAreaUid: d.practiceAreaUid ?? null,
      currency: d.currency || "GBP",
      clientMatterCount: d.clientMatterCount ?? null,
      practiceAreaMatterCount: d.practiceAreaMatterCount ?? null,
      note: d.note || "",
      levels: (d.levels || []).map((l: any) => ({
        feeEarnerLevelCode: l.feeEarnerLevelCode,
        feeEarnerLevelName: l.feeEarnerLevelName || l.feeEarnerLevelCode,
        rateCardRate: numOrNull(l.rateCardRate),
        recommendedRate: numOrNull(l.recommendedRate),
        marketMedian: numOrNull(l.marketMedian),
        marketLow: numOrNull(l.marketLow),
        marketHigh: numOrNull(l.marketHigh),
        confidence: l.confidence ?? null,
        dataSufficient: !!l.dataSufficient,
        sampleSize: num(l.sampleSize),
        clientAgreedAvgRate: numOrNull(l.clientAgreedAvgRate),
        clientAgreedSampleSize: num(l.clientAgreedSampleSize),
        practiceAgreedAvgRate: numOrNull(l.practiceAgreedAvgRate),
        practiceAgreedSampleSize: num(l.practiceAgreedSampleSize),
      })),
    };
  },

  /** Relationship intelligence for the client profile page. */
  getClientIntelligence: async (
    clientProfileUid: string,
    params: PeriodParams = {}
  ): Promise<ClientIntelligence> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.CLIENT_INTELLIGENCE(clientProfileUid), {
      params: buildPeriodQuery(params),
    });
    const d = res.data as any;
    return {
      clientProfileUid: d.clientProfileUid,
      clientName: d.clientName,
      clientType: d.clientType ?? null,
      clientTier: d.clientTier ?? null,
      periodFrom: d.periodFrom,
      periodTo: d.periodTo,
      revenueBilled: numOrNull(d.revenueBilled),
      priorRevenueBilled: numOrNull(d.priorRevenueBilled),
      revenueChangePct: numOrNull(d.revenueChangePct),
      avgMarginPct: numOrNull(d.avgMarginPct),
      priorAvgMarginPct: numOrNull(d.priorAvgMarginPct),
      marginChangePts: numOrNull(d.marginChangePts),
      avgDiscountPct: numOrNull(d.avgDiscountPct),
      priorAvgDiscountPct: numOrNull(d.priorAvgDiscountPct),
      discountChangePts: numOrNull(d.discountChangePts),
      winRatePct: numOrNull(d.winRatePct),
      priorWinRatePct: numOrNull(d.priorWinRatePct),
      winRateChangePts: numOrNull(d.winRateChangePts),
      avgRoundsToClose: numOrNull(d.avgRoundsToClose),
      priorAvgRoundsToClose: numOrNull(d.priorAvgRoundsToClose),
      avgDaysToClose: numOrNull(d.avgDaysToClose),
      priorAvgDaysToClose: numOrNull(d.priorAvgDaysToClose),
      proposalsSent: num(d.proposalsSent),
      proposalsWon: num(d.proposalsWon),
      proposalsLost: num(d.proposalsLost),
      proposalsPending: num(d.proposalsPending),
      discountCost: numOrNull(d.discountCost),
      practiceAreasUsed: num(d.practiceAreasUsed),
      practiceAreasAvailable: num(d.practiceAreasAvailable),
      practiceAreasUsedNames: d.practiceAreasUsedNames || [],
      practiceAreasUnusedNames: d.practiceAreasUnusedNames || [],
      trendReliable: !!d.trendReliable,
      signals: d.signals || [],
    };
  },

  /** Binary — must be an ArrayBuffer or the bytes are mangled as text. */
  exportWorkbook: async (params: PeriodParams = {}): Promise<ArrayBuffer> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.EXPORT_XLSX, {
      params: buildPeriodQuery(params),
      responseType: "arraybuffer",
    });
    return res.data as ArrayBuffer;
  },

  exportBoardPack: async (params: PeriodParams = {}): Promise<ArrayBuffer> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.BOARD_PACK_PDF, {
      params: buildPeriodQuery(params),
      responseType: "arraybuffer",
    });
    return res.data as ArrayBuffer;
  },

  /** Permission-gated: comparing named partners is a separate grant from ANALYTICS_READ. */
  getPartnerConsistency: async (
    params: PeriodParams = {}
  ): Promise<PracticeAreaConsistency[]> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.PARTNER_CONSISTENCY, {
      params: buildPeriodQuery(params),
    });
    return (res.data as any[]).map((a) => ({
      practiceAreaUid: a.practiceAreaUid,
      practiceAreaName: a.practiceAreaName,
      partners: (a.partners || []).map(mapPartnerRow),
      excludedPartners: (a.excludedPartners || []).map(mapPartnerRow),
      medianDiscountPct: numOrNull(a.medianDiscountPct),
      medianMarginPct: numOrNull(a.medianMarginPct),
      discountSpreadPts: numOrNull(a.discountSpreadPts),
      comparisonDrawn: !!a.comparisonDrawn,
      note: a.note || "",
    }));
  },

  getAnomalyEffectiveness: async (): Promise<AnomalyEffectiveness> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.ANOMALY_EFFECTIVENESS);
    const d = res.data as any;
    return {
      detectors: (d.detectors || []).map((r: any) => ({
        anomalyType: r.anomalyType,
        enabled: !!r.enabled,
        totalFlags: num(r.totalFlags),
        open: num(r.open),
        actioned: num(r.actioned),
        dismissedAsValid: num(r.dismissedAsValid),
        falsePositiveRatePct: numOrNull(r.falsePositiveRatePct),
        verdict: r.verdict || "",
      })),
      totalFlags: num(d.totalFlags),
      totalReviewed: num(d.totalReviewed),
      overallFalsePositiveRatePct: numOrNull(d.overallFalsePositiveRatePct),
      minReviewedForRate: num(d.minReviewedForRate),
    };
  },

  getAnomalyThresholds: async (): Promise<AnomalyThresholds> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.ANOMALY_THRESHOLDS);
    return res.data as AnomalyThresholds;
  },

  saveAnomalyThresholds: async (body: AnomalyThresholds): Promise<AnomalyThresholds> => {
    const res = await apiClient.put(ENDPOINTS.ANALYTICS.ANOMALY_THRESHOLDS, body);
    return res.data as AnomalyThresholds;
  },

  resetAnomalyThresholds: async (): Promise<AnomalyThresholds> => {
    const res = await apiClient.delete(ENDPOINTS.ANALYTICS.ANOMALY_THRESHOLDS);
    return res.data as AnomalyThresholds;
  },

  getWinRate: async (
    dimension: WinRateDimension,
    params: PeriodParams = {}
  ): Promise<WinRateRow[]> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.WIN_RATE, {
      params: { dimension, ...buildPeriodQuery(params) },
    });
    return normalizeWinRateRows(res.data);
  },

  getProposalPerformance: async (
    params: PeriodParams = {}
  ): Promise<ProposalPerformanceDto> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.PROPOSAL_PERFORMANCE, {
      params: buildPeriodQuery(params),
    });
    return normalizeProposalPerformance(res.data);
  },

  getClientMetrics: async (
    clientProfileUid: string,
    params: PeriodParams = {}
  ): Promise<ClientMetricsDto> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.CLIENT(clientProfileUid), {
      params: buildPeriodQuery(params),
    });
    return normalizeClientMetrics(res.data);
  },

  getMatterDetail: async (uid: string): Promise<MatterDetailDto> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.MATTER(uid));
    return normalizeMatterDetail(res.data);
  },

  getRateCompliance: async (
    params: PeriodParams = {},
    practiceAreaUid?: string
  ): Promise<RateComplianceDto> => {
    const query: Record<string, string> = { ...buildPeriodQuery(params) };
    if (practiceAreaUid) query.practiceAreaUid = practiceAreaUid;
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.RATE_COMPLIANCE, {
      params: query,
    });
    return normalizeRateCompliance(res.data);
  },

  getRateRecommendations: async (
    practiceAreaUid?: string
  ): Promise<RateRecommendationResponse[]> => {
    const query: Record<string, string> = {};
    if (practiceAreaUid) query.practiceAreaUid = practiceAreaUid;
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.RATE_RECOMMENDATIONS, { params: query });
    return asList(res.data, normalizeRecommendation);
  },

  listAnomalies: async (params: AnomalyListParams = {}): Promise<AnomalyFlagResponse[]> => {
    const query: Record<string, string> = { ...buildPeriodQuery(params) };
    if (params.severity) query.severity = params.severity;
    if (params.status) query.status = params.status;
    if (params.anomalyType) query.anomalyType = params.anomalyType;
    if (params.practiceAreaUid) query.practiceAreaUid = params.practiceAreaUid;
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.ANOMALIES, { params: query });
    return asList(res.data, normalizeAnomaly);
  },

  getAnomaly: async (uid: string): Promise<AnomalyFlagResponse> => {
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.ANOMALY(uid));
    return normalizeAnomaly(res.data);
  },

  resolveAnomaly: async (
    uid: string,
    command: ResolveAnomalyCommand
  ): Promise<AnomalyFlagResponse> => {
    const res = await apiClient.post(ENDPOINTS.ANALYTICS.ANOMALY_RESOLVE(uid), command);
    return normalizeAnomaly(res.data);
  },

  getAdvisorHistory: async (sessionId?: string): Promise<AdvisorMessage[]> => {
    const query: Record<string, string> = {};
    if (sessionId) query.sessionId = sessionId;
    const res = await apiClient.get(ENDPOINTS.ANALYTICS.ADVISOR_HISTORY, { params: query });
    return asList(res.data, normalizeAdvisorMessage);
  },
};
