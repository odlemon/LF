import type { ScenarioChangeSummary } from "./types";

export function parseChangeSummary(
  json: string | null | undefined
): ScenarioChangeSummary | null {
  if (!json || !json.trim()) return null;
  try {
    const raw = JSON.parse(json) as Partial<ScenarioChangeSummary>;
    return {
      computedAt: raw.computedAt,
      hasChanges: raw.hasChanges,
      entries: Array.isArray(raw.entries) ? raw.entries : [],
      lineChanges: Array.isArray(raw.lineChanges) ? raw.lineChanges : [],
    };
  } catch {
    return null;
  }
}

export function formatTrailValue(
  value: number | null | undefined,
  currency: string,
  moneyLike?: boolean
): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  const n = Number(value);
  if (moneyLike) {
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
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
