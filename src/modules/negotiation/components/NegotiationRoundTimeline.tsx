"use client";

import type { NegotiationRound } from "@/modules/negotiation/types";
import { formatMoney } from "@/modules/negotiation/utils";
import { formatDateTime } from "@/modules/client-portal/format";

function actionLabel(action?: string | null) {
  switch ((action || "").toUpperCase()) {
    case "OPENING_OFFER":
      return "Opening offer";
    case "COUNTER":
      return "Counter";
    case "ACCEPT":
      return "Accepted";
    case "REJECT":
      return "Declined";
    case "WITHDRAW":
      return "Withdrawn";
    default:
      return action || "Update";
  }
}

function actionTone(action?: string | null): {
  dot: string;
  badge: string;
  label: string;
} {
  switch ((action || "").toUpperCase()) {
    case "ACCEPT":
      return {
        dot: "bg-emerald-600 ring-emerald-600/20",
        badge: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
        label: "Accepted",
      };
    case "REJECT":
    case "WITHDRAW":
      return {
        dot: "bg-red-500 ring-red-500/20",
        badge: "bg-red-50 text-red-800 border-red-200/80",
        label: actionLabel(action),
      };
    case "COUNTER":
      return {
        dot: "bg-ink ring-ink/15",
        badge: "bg-ink/[0.06] text-ink border-ink/10",
        label: "Counter",
      };
    case "OPENING_OFFER":
      return {
        dot: "bg-ink/45 ring-ink/10",
        badge: "bg-field text-ink/70 border-border/80",
        label: "Opening",
      };
    default:
      return {
        dot: "bg-ink/30 ring-ink/10",
        badge: "bg-field text-ink/60 border-border/70",
        label: actionLabel(action),
      };
  }
}

export function NegotiationRoundTimeline({
  rounds,
  currency,
  partyLabels = { FIRM: "Firm", CLIENT: "You" },
  showMargin = false,
}: {
  rounds: NegotiationRound[];
  currency: string;
  partyLabels?: { FIRM: string; CLIENT: string };
  showMargin?: boolean;
}) {
  const sorted = [...(rounds || [])].sort(
    (a, b) => (b.roundNumber || 0) - (a.roundNumber || 0)
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-semibold text-ink">No rounds yet</p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink/60">
          Offers and counters will appear here as the negotiation unfolds.
        </p>
      </div>
    );
  }

  const chronological = [...sorted].reverse();

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
          Negotiation trail
        </p>
        <p className="mt-1 text-sm text-ink/60">
          {sorted.length} round{sorted.length === 1 ? "" : "s"} · newest first
        </p>
      </div>

      <ol className="relative space-y-0">
        {sorted.map((round, index) => {
          const tone = actionTone(round.action);
          const partyKey = (round.party || "FIRM").toUpperCase() as
            | "FIRM"
            | "CLIENT";
          const partyName = partyLabels[partyKey] || round.party;
          const isYou = partyKey === "CLIENT";
          const isLast = index === sorted.length - 1;

          const older = chronological.find(
            (r) => (r.roundNumber || 0) < (round.roundNumber || 0)
          );
          const delta =
            older?.grossFees != null && round.grossFees != null
              ? Number(round.grossFees) - Number(older.grossFees)
              : null;

          return (
            <li
              key={round.id}
              className="relative grid grid-cols-[1.25rem_1fr] gap-x-3 pb-7 last:pb-0"
              style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
            >
              <div className="relative flex justify-center">
                {!isLast && (
                  <span
                    aria-hidden
                    className="absolute top-3 bottom-[-1.75rem] w-px bg-gradient-to-b from-border to-border/30"
                  />
                )}
                <span
                  aria-hidden
                  className={`relative z-[1] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ${tone.dot}`}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/60">
                        Round {round.roundNumber}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${tone.badge}`}
                      >
                        {tone.label}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[15px] font-semibold tracking-tight text-ink">
                      <span className={isYou ? "text-ink" : "text-ink/80"}>
                        {partyName}
                      </span>
                      <span className="font-normal text-ink/35"> · </span>
                      <span className="font-medium text-ink/65">
                        {actionLabel(round.action)}
                      </span>
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-semibold tabular-nums tracking-tight text-ink">
                      {formatMoney(round.grossFees, currency)}
                    </p>
                    {delta != null && Math.abs(delta) >= 0.5 && (
                      <p
                        className={`mt-0.5 text-[11px] font-semibold tabular-nums ${
                          delta < 0 ? "text-emerald-700" : "text-ink/60"
                        }`}
                      >
                        {delta < 0 ? "↓" : "↑"}{" "}
                        {formatMoney(Math.abs(delta), currency)}
                      </p>
                    )}
                    {showMargin && round.marginPct != null && (
                      <p className="mt-0.5 text-[11px] tabular-nums text-ink/60">
                        {Number(round.marginPct).toFixed(1)}% margin
                      </p>
                    )}
                  </div>
                </div>

                {round.comment && (
                  <p className="mt-2 border-l-2 border-ink/10 pl-3 text-[13px] leading-relaxed text-ink/60">
                    {round.comment}
                  </p>
                )}

                <p className="mt-2 text-[11px] tracking-wide text-ink/60">
                  {round.createdAt ? formatDateTime(round.createdAt) : ""}
                  {round.createdByEmail ? ` · ${round.createdByEmail}` : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
