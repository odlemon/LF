/** Transparent ROI math for Lysp pricing-intelligence impact estimates. */

export const CREDIT_USD = 32;

export const ACTION_COST = {
  matter: 3,
  negotiation: 5,
  scenario: 2,
  analytics: 1,
} as const;

export type Pace = "light" | "typical" | "busy";

export const PACE: Record<
  Pace,
  { label: string; hint: string; negotiate: number; scenarios: number; analytics: number }
> = {
  light: {
    label: "Light",
    hint: "Fewer counters, steady proposals",
    negotiate: 0.15,
    scenarios: 0.5,
    analytics: 6,
  },
  typical: {
    label: "Typical",
    hint: "Normal commercial volume",
    negotiate: 0.3,
    scenarios: 0.8,
    analytics: 12,
  },
  busy: {
    label: "Busy",
    hint: "Heavy negotiation & modeling",
    negotiate: 0.5,
    scenarios: 1.2,
    analytics: 24,
  },
};

/** Fraction of saved quote-cycle days that converts to economic value. */
export const QUOTE_VALUE_FACTOR = 0.15;

export const REALIZATION_CAP = 95;

export type RoiInputs = {
  matters: number;
  avgFee: number;
  leakagePct: number;
  recoverableShare: number;
  realizationPct: number;
  realizationLiftPts: number;
  daysToQuoteToday: number;
  daysToQuoteWithLysp: number;
  partnerDayValue: number;
  negotiateShare: number;
  marginProtectedPct: number;
  pace: Pace;
};

export type RoiBreakdown = {
  grossFeeVolume: number;
  leakageAtRisk: number;
  leakageRecovered: number;
  realizationGain: number;
  realizationPostLysp: number;
  quoteDaysSaved: number;
  quoteCapacityValue: number;
  negotiationValue: number;
  grossAnnualImpact: number;
  lyspCredits: number;
  lyspAnnualCost: number;
  netAnnualImpact: number;
  roiMultiple: number;
};

export const DEFAULT_ROI_INPUTS: RoiInputs = {
  matters: 40,
  avgFee: 2_400_000,
  leakagePct: 0.07,
  recoverableShare: 0.55,
  realizationPct: 78,
  realizationLiftPts: 6,
  daysToQuoteToday: 4,
  daysToQuoteWithLysp: 1,
  partnerDayValue: 8_000,
  negotiateShare: 0.3,
  marginProtectedPct: 0.02,
  pace: "typical",
};

/** User-facing firm posture - maps to hidden levers. */
export type FirmProfile = "focused" | "balanced" | "intensive";

export const FIRM_PROFILES: Record<
  FirmProfile,
  {
    label: string;
    line: string;
    recoverableShare: number;
    realizationLiftPts: number;
    negotiateShare: number;
    marginProtectedPct: number;
    pace: Pace;
    daysToQuoteWithLysp: number;
  }
> = {
  focused: {
    label: "Light",
    line: "Fewer counters. Partners usually hold the first fee.",
    recoverableShare: 0.45,
    realizationLiftPts: 4,
    negotiateShare: 0.2,
    marginProtectedPct: 0.015,
    pace: "light",
    daysToQuoteWithLysp: 1,
  },
  balanced: {
    label: "Typical",
    line: "Normal elite commercial pushback on a share of matters.",
    recoverableShare: 0.55,
    realizationLiftPts: 6,
    negotiateShare: 0.3,
    marginProtectedPct: 0.02,
    pace: "typical",
    daysToQuoteWithLysp: 1,
  },
  intensive: {
    label: "Heavy",
    line: "Frequent counters, panels, and hard negotiation rounds.",
    recoverableShare: 0.65,
    realizationLiftPts: 8,
    negotiateShare: 0.45,
    marginProtectedPct: 0.025,
    pace: "busy",
    daysToQuoteWithLysp: 0,
  },
};

/** Build full ROI inputs from the three public controls. */
export function inputsFromSimple(opts: {
  matters: number;
  avgFee: number;
  profile: FirmProfile;
}): RoiInputs {
  const p = FIRM_PROFILES[opts.profile];
  return {
    ...DEFAULT_ROI_INPUTS,
    matters: opts.matters,
    avgFee: opts.avgFee,
    recoverableShare: p.recoverableShare,
    realizationLiftPts: p.realizationLiftPts,
    negotiateShare: p.negotiateShare,
    marginProtectedPct: p.marginProtectedPct,
    pace: p.pace,
    daysToQuoteWithLysp: p.daysToQuoteWithLysp,
  };
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatMultiple(n: number) {
  if (!Number.isFinite(n) || n > 999) return "999x+";
  return `${n.toFixed(n >= 10 ? 0 : 1)}x`;
}

export function computeRoi(raw: RoiInputs): RoiBreakdown {
  const matters = clamp(Math.round(raw.matters), 1, 500);
  const avgFee = clamp(raw.avgFee, 10_000, 50_000_000);
  const leakagePct = clamp(raw.leakagePct, 0, 0.4);
  const recoverableShare = clamp(raw.recoverableShare, 0, 1);
  const realizationPct = clamp(raw.realizationPct, 40, REALIZATION_CAP);
  const maxLift = Math.max(0, REALIZATION_CAP - realizationPct);
  const realizationLiftPts = clamp(raw.realizationLiftPts, 0, maxLift);
  const daysToQuoteToday = clamp(raw.daysToQuoteToday, 1, 30);
  const daysToQuoteWithLysp = clamp(raw.daysToQuoteWithLysp, 0, daysToQuoteToday);
  const partnerDayValue = clamp(raw.partnerDayValue, 500, 50_000);
  const negotiateShare = clamp(raw.negotiateShare, 0, 1);
  const marginProtectedPct = clamp(raw.marginProtectedPct, 0, 0.15);
  const profile = PACE[raw.pace] ?? PACE.typical;

  const grossFeeVolume = matters * avgFee;
  const leakageAtRisk = grossFeeVolume * leakagePct;
  const leakageRecovered = leakageAtRisk * recoverableShare;
  const realizationGain = grossFeeVolume * (realizationLiftPts / 100);
  const realizationPostLysp = clamp(realizationPct + realizationLiftPts, 0, REALIZATION_CAP);

  const quoteDaysSaved = Math.max(0, daysToQuoteToday - daysToQuoteWithLysp);
  const quoteCapacityValue =
    matters * quoteDaysSaved * partnerDayValue * QUOTE_VALUE_FACTOR;

  const negotiationValue = matters * negotiateShare * avgFee * marginProtectedPct;

  const grossAnnualImpact =
    leakageRecovered + realizationGain + quoteCapacityValue + negotiationValue;

  const negotiations = matters * profile.negotiate;
  const scenarios = matters * profile.scenarios;
  const analytics = profile.analytics;
  const lyspCredits =
    matters * ACTION_COST.matter +
    negotiations * ACTION_COST.negotiation +
    scenarios * ACTION_COST.scenario +
    analytics * ACTION_COST.analytics;

  const lyspAnnualCost = lyspCredits * CREDIT_USD;
  const netAnnualImpact = grossAnnualImpact - lyspAnnualCost;
  const roiMultiple = netAnnualImpact / Math.max(lyspAnnualCost, 1);

  return {
    grossFeeVolume,
    leakageAtRisk,
    leakageRecovered,
    realizationGain,
    realizationPostLysp,
    quoteDaysSaved,
    quoteCapacityValue,
    negotiationValue,
    grossAnnualImpact,
    lyspCredits: Math.round(lyspCredits),
    lyspAnnualCost: Math.round(lyspAnnualCost),
    netAnnualImpact: Math.round(netAnnualImpact),
    roiMultiple,
  };
}
