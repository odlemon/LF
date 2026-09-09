export function formatCurrency(value: number, currencyCode: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(value);
}

/**
 * Turn whatever the API sent into a Date, or null.
 *
 * A bare `YYYY-MM-DD` is a calendar date, and `new Date()` reads it as UTC midnight — which
 * renders as the previous day for anyone west of Greenwich. Pinning it to local midnight keeps
 * the date the backend meant. Anything carrying a time is already unambiguous and is parsed
 * as-is; the two shapes are handled here precisely so callers do not have to know which one a
 * given field is, which is the mistake that produced "Invalid Date" in the transactions table.
 */
function toDate(value: string | Date | null | undefined): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? `${trimmed}T00:00:00` : trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** An em dash, not "Invalid Date" — a missing timestamp should read as absent, not as broken. */
export const NO_DATE = "—";

export function formatDate(dateString: string | Date | null | undefined): string {
  const date = toDate(dateString);
  if (!date) return NO_DATE;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  const date = toDate(dateString);
  if (!date) return NO_DATE;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export function formatRelativeTime(dateString: string | Date | null | undefined): string {
  const d = toDate(dateString);
  if (!d) return NO_DATE;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMs < 0) return "Just now";
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;

  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
