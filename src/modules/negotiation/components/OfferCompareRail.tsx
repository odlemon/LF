"use client";

import { useEffect, useMemo, useRef } from "react";
import type { NegotiationRound } from "../types";
import {
  commercialOffers,
  formatMoney,
  offerActionLabel,
  offerDelta,
  openingOffer,
} from "../utils";

export type OfferViewer = "FIRM" | "CLIENT";

interface OfferCompareRailProps {
  rounds: NegotiationRound[];
  currency: string;
  viewer: OfferViewer;
  selectedRoundId: string | null;
  onSelect: (roundId: string) => void;
  showMargin?: boolean;
  partyLabels?: { FIRM: string; CLIENT: string };
}

function partyKey(party?: string | null): "FIRM" | "CLIENT" {
  return String(party || "").toUpperCase() === "CLIENT" ? "CLIENT" : "FIRM";
}

function deltaCopy(
  absolute: number,
  pct: number | null,
  currency: string,
  vs: string
): string {
  const absLabel = formatMoney(Math.abs(absolute), currency);
  const dir = absolute < 0 ? "below" : absolute > 0 ? "above" : "in line with";
  if (absolute === 0) return `In line with ${vs}`;
  const pctPart =
    pct != null && Number.isFinite(pct)
      ? ` · ${Math.abs(pct).toFixed(1)}%`
      : "";
  return `${absLabel}${pctPart} ${dir} ${vs}`;
}

export function OfferCompareRail({
  rounds,
  currency,
  viewer,
  selectedRoundId,
  onSelect,
  showMargin = false,
  partyLabels = { FIRM: "Firm", CLIENT: "Client" },
}: OfferCompareRailProps) {
  const offers = useMemo(() => commercialOffers(rounds), [rounds]);
  const original = useMemo(() => openingOffer(rounds), [rounds]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const selected =
    offers.find((o) => o.id === selectedRoundId) ||
    offers[offers.length - 1] ||
    null;
  const selectedIdx = selected
    ? offers.findIndex((o) => o.id === selected.id)
    : -1;
  const prior = selectedIdx > 0 ? offers[selectedIdx - 1] : null;

  const vsOriginal = offerDelta(selected, original);
  const vsPrior =
    prior && selected && prior.id !== selected.id
      ? offerDelta(selected, prior)
      : null;

  useEffect(() => {
    if (!selectedRoundId || !scrollerRef.current) return;
    const el = scrollerRef.current.querySelector<HTMLElement>(
      `[data-offer-id="${selectedRoundId}"]`
    );
    el?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [selectedRoundId]);

  if (offers.length === 0) return null;

  const labels = {
    FIRM: partyLabels.FIRM,
    CLIENT:
      viewer === "CLIENT" && partyLabels.CLIENT === "Client"
        ? "You"
        : partyLabels.CLIENT,
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
            Offers
          </p>
          <p className="mt-1 text-[12px] text-ink/45">
            Original versus each counter — select to inspect the rate mix
          </p>
        </div>
        {offers.length > 2 && (
          <p className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/30">
            Scroll
          </p>
        )}
      </div>

      <div
        ref={scrollerRef}
        role="listbox"
        aria-label="Negotiation offers"
        tabIndex={0}
        onKeyDown={(e) => {
          if (selectedIdx < 0) return;
          if (e.key === "ArrowRight" && selectedIdx < offers.length - 1) {
            e.preventDefault();
            onSelect(offers[selectedIdx + 1].id);
          }
          if (e.key === "ArrowLeft" && selectedIdx > 0) {
            e.preventDefault();
            onSelect(offers[selectedIdx - 1].id);
          }
        }}
        className="rates-scrollable -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-2 scroll-smooth snap-x snap-mandatory focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
      >
        {offers.map((offer, idx) => {
          const isOriginal =
            original?.id === offer.id ||
            (idx === 0 &&
              String(offer.action || "").toUpperCase() === "OPENING_OFFER");
          const selectedCard = offer.id === selected?.id;
          const pk = partyKey(offer.party);
          const action = offerActionLabel(offer.action, isOriginal);
          const title = isOriginal
            ? "Original offer"
            : pk === "FIRM"
              ? viewer === "CLIENT"
                ? "Firm counter"
                : "Firm counter"
              : viewer === "CLIENT"
                ? "Your counter"
                : "Client counter";

          return (
            <button
              key={offer.id}
              type="button"
              role="option"
              aria-selected={selectedCard}
              data-offer-id={offer.id}
              onClick={() => onSelect(offer.id)}
              className={`snap-start shrink-0 w-[11.5rem] rounded-2xl border px-3.5 py-3 text-left transition-all ${
                selectedCard
                  ? "border-ink bg-ink text-canvas shadow-[0_8px_24px_rgba(10,10,10,0.12)]"
                  : "border-border/70 bg-surface text-ink hover:border-ink/25 hover:bg-field/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-[9px] font-bold uppercase tracking-[0.14em] ${
                    selectedCard ? "text-canvas/50" : "text-ink/35"
                  }`}
                >
                  {action}
                </p>
                <p
                  className={`text-[9px] font-semibold tabular-nums ${
                    selectedCard ? "text-canvas/45" : "text-ink/30"
                  }`}
                >
                  R{offer.roundNumber}
                </p>
              </div>
              <p
                className={`mt-1.5 text-[11px] font-semibold tracking-tight truncate ${
                  selectedCard ? "text-canvas/80" : "text-ink/55"
                }`}
              >
                {title}
              </p>
              <p
                className={`mt-0.5 text-[10px] truncate ${
                  selectedCard ? "text-canvas/45" : "text-ink/35"
                }`}
              >
                {labels[pk]}
              </p>
              <p
                className={`mt-3 text-lg font-semibold tabular-nums tracking-tight ${
                  selectedCard ? "text-canvas" : "text-ink"
                }`}
              >
                {formatMoney(offer.grossFees, currency)}
              </p>
              {showMargin &&
                pk === "FIRM" &&
                offer.marginPct != null &&
                Number.isFinite(Number(offer.marginPct)) && (
                  <p
                    className={`mt-1 text-[10px] tabular-nums ${
                      selectedCard ? "text-canvas/50" : "text-ink/40"
                    }`}
                  >
                    {Number(offer.marginPct).toFixed(1)}% margin
                  </p>
                )}
              {offer.comment && (
                <p
                  className={`mt-2 line-clamp-2 text-[10px] leading-snug ${
                    selectedCard ? "text-canvas/40" : "text-ink/35"
                  }`}
                >
                  {offer.comment}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4 border-t border-border/50 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
            {selected.id === original?.id
              ? "Original offer"
              : partyKey(selected.party) === "CLIENT"
                ? viewer === "CLIENT"
                  ? "Your counter"
                  : "Client counter"
                : "Firm counter"}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-ink">
            {formatMoney(selected.grossFees, currency)}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {vsOriginal &&
              original &&
              selected.id !== original.id &&
              vsOriginal.absolute !== 0 && (
                <p className="text-[12px] text-ink/50">
                  {deltaCopy(
                    vsOriginal.absolute,
                    vsOriginal.pct,
                    currency,
                    "opening"
                  )}
                </p>
              )}
            {vsPrior &&
              prior &&
              selected.id !== prior.id &&
              vsPrior.absolute !== 0 && (
                <p className="text-[12px] text-ink/40">
                  {deltaCopy(
                    vsPrior.absolute,
                    vsPrior.pct,
                    currency,
                    "prior offer"
                  )}
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
