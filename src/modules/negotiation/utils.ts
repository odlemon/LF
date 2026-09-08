import type {
  NegotiationDetail,
  NegotiationLineCommand,
  NegotiationRateLine,
  NegotiationRound,
  RateLevelDraft,
} from "./types";

export function formatMoney(amount: number | null | undefined, currency = "GBP") {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${Math.round(n).toLocaleString()}`;
  }
}

export function formatRate(amount: number | null | undefined, currency = "GBP") {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${Math.round(n).toLocaleString()}`;
  }
}

export function negotiationStatusLabel(status: string) {
  switch (status) {
    case "SENT":
      return "Awaiting client";
    case "NEGOTIATING":
      return "In negotiation";
    case "CLIENT_APPROVED":
      return "Agreed";
    case "CLIENT_REJECTED":
      return "Rejected";
    case "WITHDRAWN":
      return "Withdrawn";
    case "DRAFT":
      return "Draft";
    default:
      return status.replace(/_/g, " ");
  }
}

export function latestRound(detail: NegotiationDetail | null): NegotiationRound | null {
  if (!detail?.rounds?.length) return null;
  return [...detail.rounds].sort((a, b) => b.roundNumber - a.roundNumber)[0] ?? null;
}

export function latestClientRound(
  detail: NegotiationDetail | null
): NegotiationRound | null {
  if (!detail?.rounds?.length) return null;
  return (
    [...detail.rounds]
      .filter((r) => r.party === "CLIENT")
      .sort((a, b) => b.roundNumber - a.roundNumber)[0] ?? null
  );
}

export function isOpenStatus(status: string | null | undefined) {
  return status === "SENT" || status === "NEGOTIATING";
}

const COMMERCIAL_ACTIONS = new Set([
  "OPENING_OFFER",
  "COUNTER",
  "ACCEPT",
]);

/** Fee offers for the comparison rail (opening + counters + accept). */
export function commercialOffers(
  rounds: NegotiationRound[] | null | undefined
): NegotiationRound[] {
  return [...(rounds || [])]
    .filter((r) => COMMERCIAL_ACTIONS.has(String(r.action || "").toUpperCase()))
    .sort((a, b) => (a.roundNumber || 0) - (b.roundNumber || 0));
}

export function openingOffer(
  rounds: NegotiationRound[] | null | undefined
): NegotiationRound | null {
  const offers = commercialOffers(rounds);
  return (
    offers.find(
      (r) =>
        String(r.action || "").toUpperCase() === "OPENING_OFFER" &&
        String(r.party || "").toUpperCase() === "FIRM"
    ) ||
    offers[0] ||
    null
  );
}

export function latestCommercialOffer(
  rounds: NegotiationRound[] | null | undefined
): NegotiationRound | null {
  const offers = commercialOffers(rounds);
  return offers.length ? offers[offers.length - 1] : null;
}

export type OfferDelta = {
  absolute: number;
  pct: number | null;
};

export function offerDelta(
  selected: NegotiationRound | null | undefined,
  baseline: NegotiationRound | null | undefined
): OfferDelta | null {
  const a = Number(selected?.grossFees);
  const b = Number(baseline?.grossFees);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) {
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    return { absolute: a - b, pct: null };
  }
  return {
    absolute: a - b,
    pct: ((a - b) / Math.abs(b)) * 100,
  };
}

export function offerActionLabel(
  action?: string | null,
  isOpening?: boolean
): string {
  if (isOpening || String(action || "").toUpperCase() === "OPENING_OFFER") {
    return "Opening";
  }
  switch (String(action || "").toUpperCase()) {
    case "COUNTER":
      return "Counter";
    case "ACCEPT":
      return "Accepted";
    default:
      return action || "Offer";
  }
}

/** Collapse phase lines into one editable row per fee-earner level. */
export function aggregateRateLevels(
  lines: NegotiationRateLine[] | null | undefined
): RateLevelDraft[] {
  const map = new Map<string, RateLevelDraft>();
  for (const line of lines || []) {
    const key =
      line.feeEarnerLevelUid ||
      line.feeEarnerLevelCode ||
      line.feeEarnerLevelName ||
      line.id;
    const existing = map.get(key);
    const hours = Number(line.hours) || 0;
    const rate = Number(line.hourlyRate) || 0;
    if (!existing) {
      map.set(key, {
        key,
        feeEarnerLevelUid: line.feeEarnerLevelUid,
        feeEarnerLevelCode: line.feeEarnerLevelCode,
        feeEarnerLevelName:
          line.feeEarnerLevelName ||
          line.feeEarnerLevelCode ||
          "Fee earner",
        hourlyRate: rate,
        hours,
      });
    } else {
      existing.hours += hours;
      if (rate > 0) existing.hourlyRate = rate;
    }
  }
  return Array.from(map.values());
}

/** Apply level rate edits back onto the full line set for the API. */
export function linesFromRateDrafts(
  baseLines: NegotiationRateLine[],
  drafts: RateLevelDraft[]
): NegotiationLineCommand[] {
  const rateByKey = new Map(drafts.map((d) => [d.key, d.hourlyRate]));
  return baseLines.map((line) => {
    const key =
      line.feeEarnerLevelUid ||
      line.feeEarnerLevelCode ||
      line.feeEarnerLevelName ||
      line.id;
    const hourlyRate = rateByKey.has(key)
      ? rateByKey.get(key)!
      : Number(line.hourlyRate) || 0;
    return {
      feeEarnerLevelUid: line.feeEarnerLevelUid,
      feeEarnerLevelCode: line.feeEarnerLevelCode,
      feeEarnerLevelName: line.feeEarnerLevelName,
      phaseName: line.phaseName,
      description: line.description,
      hours: Number(line.hours) || 0,
      hourlyRate,
    };
  });
}
