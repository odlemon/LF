/**
 * Analytics display formatting.
 * The firm platform renders money in GBP by default (matches dashboard charts'
 * £ axis labels and the volume-discount pages' en-GB currency formatting).
 */

export function formatMoney(value: number | null | undefined, compact = false): string {
  if (value == null) return "—";
  try {
    if (compact) {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(value);
    }
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `£${Number(value).toLocaleString()}`;
  }
}

/** Hourly rates keep 2 decimals. */
export function formatRate(value: number | null | undefined): string {
  if (value == null) return "—";
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `£${Number(value).toFixed(2)}`;
  }
}

/** Values are already percentages (e.g. 42.5 → "42.5%"). */
export function formatPct(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return "—";
  return `${Number(value).toFixed(digits)}%`;
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-GB").format(value);
}

export function formatDays(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const rounded = Number(value);
  return `${rounded % 1 === 0 ? rounded : rounded.toFixed(1)} days`;
}

export function formatRounds(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return Number(value).toFixed(1);
}

/** "2026-03" → "Mar 26" for chart axes. */
export function formatMonth(month: string): string {
  if (!month) return "";
  const parsed = new Date(`${month}-01T00:00:00`);
  if (isNaN(parsed.getTime())) return month;
  return parsed.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Signed delta display, e.g. +12.4% / −3.1 pts. */
export function formatDelta(
  value: number | null | undefined,
  unit: "pct" | "pts" | "days" | "count" = "pct"
): string {
  if (value == null || Number.isNaN(value)) return "—";
  const rounded = Math.abs(value) % 1 === 0 ? Math.abs(value) : Math.abs(Number(value.toFixed(1)));
  const sign = value > 0 ? "+" : value < 0 ? "−" : "±";
  switch (unit) {
    case "pts":
      return `${sign}${rounded} pts`;
    case "days":
      return `${sign}${rounded} days`;
    case "count":
      return `${sign}${rounded}%`;
    default:
      return `${sign}${rounded}%`;
  }
}

/** Human labels for pricing model enums used across the platform. */
export function formatPricingModel(model: string): string {
  const labels: Record<string, string> = {
    FIXED_FEE: "Fixed fee",
    HOURLY: "Hourly",
    CAPPED: "Capped",
    RETAINER: "Retainer",
    BLENDED: "Blended",
    CONTINGENCY: "Contingency",
    PHASED_FIXED: "Phased fixed",
  };
  if (labels[model]) return labels[model];
  return model
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

/** Human labels for anomaly types. */
export function formatAnomalyType(type: string): string {
  const labels: Record<string, string> = {
    MARGIN_BELOW_FLOOR: "Margin below floor",
    DISCOUNT_ABOVE_MAX: "Discount above max",
    RATE_ABOVE_CARD: "Rate above card",
    MARGIN_BELOW_PA_AVG: "Margin below practice avg",
    EXCESS_ROUNDS: "Excess negotiation rounds",
    SCOPE_OVERRUN: "Scope overrun",
    RATE_DEVIATION: "Rate deviation",
  };
  return labels[type] ?? type;
}
