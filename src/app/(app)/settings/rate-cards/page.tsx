/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRateCards } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import { RateCardFormModal } from "@/modules/firm/components/RateCardFormModal";
import { RateCardEntriesSlideOver } from "@/modules/firm/components/RateCardEntriesSlideOver";
import { ActivateRateCardModal } from "@/modules/firm/components/ActivateRateCardModal";
import { RateCard } from "@/modules/firm/types";
import toast from "react-hot-toast";
import { HiPlus, HiOutlineDatabase, HiOutlineLightningBolt, HiCheckCircle, HiArrowRight, HiArchive } from "react-icons/hi";

export default function RateCardsPage() {
  const { cards, isLoading, error, createCard, activateCard } = useRateCards();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEntriesOpen, setIsEntriesOpen] = useState(false);
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<RateCard | null>(null);
  const [officeFilter, setOfficeFilter] = useState<string>("ALL");

  const offices = Array.from(
    new Set(cards.map((c) => c.officeCode).filter((o): o is string => !!o))
  ).sort();
  const filteredCards =
    officeFilter === "ALL" ? cards : cards.filter((c) => (c.officeCode || "") === officeFilter);

  const handleCreate = async (data: { name: string; currency: string; effectiveDate: string; expiryDate?: string; officeCode?: string }) => {
    try {
      await createCard(data);
      toast.success("Rate card draft created.");
      setIsFormModalOpen(false);
    } catch (err: any) {
      throw err;
    }
  };

  const handleOpenEntries = (card: RateCard) => {
    setSelectedCard(card);
    setIsEntriesOpen(true);
  };

  const handleOpenActivate = (card: RateCard) => {
    setSelectedCard(card);
    setIsActivateOpen(true);
  };

  const handleConfirmActivate = async () => {
    if (!selectedCard) return;
    try {
      await activateCard(selectedCard.uid);
      toast.success("Rate card activated successfully.");
      setIsActivateOpen(false);
    } catch (err: any) {
      throw err;
    }
  };

  const activeCards = filteredCards.filter((c) => c.status === "ACTIVE");
  const draftCards = filteredCards.filter((c) => c.status === "DRAFT");
  const archivedCards = filteredCards.filter((c) => c.status === "ARCHIVED");

  return (
    <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Rate Cards</h1>
          <p className="text-sm text-ink/55 mt-1">Manage corporate rate cards, billing currencies, and level multipliers.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsFormModalOpen(true)}
          className="self-start sm:self-center"
        >
          <HiPlus className="w-4 h-4" />
          Create Rate Card
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {!isLoading && offices.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setOfficeFilter("ALL")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
              officeFilter === "ALL" ? "bg-ink text-on-primary" : "bg-field text-ink/60 hover:bg-hover"
            }`}
          >
            All offices
          </button>
          <button
            onClick={() => setOfficeFilter("")}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
              officeFilter === "" ? "bg-ink text-on-primary" : "bg-field text-ink/60 hover:bg-hover"
            }`}
          >
            Firm default
          </button>
          {offices.map((office) => (
            <button
              key={office}
              onClick={() => setOfficeFilter(office)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                officeFilter === office ? "bg-ink text-on-primary" : "bg-field text-ink/60 hover:bg-hover"
              }`}
            >
              {office}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-40 bg-field rounded-2xl" />
          <div className="h-32 bg-field rounded-2xl" />
        </div>
      ) : (
        <>
          <div>
            <h2 className="text-xs font-bold text-ink/80 uppercase tracking-wider mb-3">
              Active Rate Card{activeCards.length !== 1 ? "s" : ""}
            </h2>
            {activeCards.length > 0 ? (
              <div className="flex flex-col gap-3">
                {activeCards.map((card) => (
                  <div
                    key={card.uid}
                    className="bg-gradient-to-r from-primary/10 to-black/[0.03] border border-ink/25 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 text-ink/70 flex items-center justify-center">
                        <HiCheckCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-ink">{card.name}</h3>
                        <p className="text-xs text-ink/55 mt-1">
                          Effective: {card.effectiveDate} {card.expiryDate ? `to ${card.expiryDate}` : "(No expiry)"}
                        </p>
                        <div className="flex items-center gap-2 mt-2.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ink/80 bg-hover/50 px-2 py-0.5 rounded uppercase tracking-wider border border-border">
                            Currency: {card.currency}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-ink/80 bg-hover/50 px-2 py-0.5 rounded uppercase tracking-wider border border-border">
                            Office: {card.officeCode || "Firm default"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="bg-surface border-border hover:bg-hover/20 text-ink/80 font-semibold text-xs py-2 px-4 shadow-sm"
                      onClick={() => handleOpenEntries(card)}
                    >
                      View Rates
                      <HiArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 text-center text-sm text-amber-800">
                No active rate card currently set{officeFilter !== "ALL" ? " for this office" : ""}. Activating a rate card is required before scoped matters can be computed.
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xs font-bold text-ink/80 uppercase tracking-wider mb-3">Draft Rate Cards</h2>
            {draftCards.length === 0 ? (
              <div className="text-center py-8 bg-surface border border-border/60 rounded-2xl p-6 text-sm text-ink/55">
                No drafts created. Click &apos;Create Rate Card&apos; to prepare one.
              </div>
            ) : (
              <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-field/50 text-xs font-bold text-ink/55 border-b border-border">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Office</th>
                      <th className="px-6 py-4">Currency</th>
                      <th className="px-6 py-4">Effective Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60">
                    {draftCards.map((card) => (
                      <tr key={card.uid} className="hover:bg-field/40 text-ink transition-colors">
                        <td className="px-6 py-4 font-semibold text-ink flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <HiOutlineDatabase className="w-4 h-4" />
                          </div>
                          <span>{card.name}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-ink/70">{card.officeCode || "Firm default"}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-primary/10 text-primary border border-primary/10 uppercase tracking-wider">
                            {card.currency}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-ink/70">{card.effectiveDate}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handleOpenEntries(card)}
                              className="px-3.5 py-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-full transition-all"
                            >
                              Add/Edit Rates
                            </button>
                            <button
                              onClick={() => handleOpenActivate(card)}
                              className="px-3.5 py-1.5 text-xs font-bold text-ink/80 bg-hover hover:bg-hover rounded-full transition-all"
                            >
                              Activate
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {archivedCards.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-ink/80 uppercase tracking-wider mb-3">Archived Cards</h2>
              <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-field/50 text-xs font-bold text-ink/55 border-b border-border">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Currency</th>
                      <th className="px-6 py-4">Effective Date</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60">
                    {archivedCards.map((card) => (
                      <tr key={card.uid} className="opacity-60 text-ink/90 bg-field/20 hover:bg-field/40 transition-colors">
                        <td className="px-6 py-4 font-semibold flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-canvas text-ink/55 flex items-center justify-center shrink-0">
                            <HiArchive className="w-4 h-4" />
                          </div>
                          <span>{card.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-canvas text-ink/60 border border-border/50 uppercase tracking-wider">
                            {card.currency}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">{card.effectiveDate}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenEntries(card)}
                            className="px-3.5 py-1.5 text-xs font-bold text-ink/65 bg-canvas hover:bg-field rounded-full transition-all"
                          >
                            View Rates
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <RateCardFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleCreate}
      />

      <RateCardEntriesSlideOver
        isOpen={isEntriesOpen}
        onClose={() => setIsEntriesOpen(false)}
        rateCard={selectedCard}
      />

      <ActivateRateCardModal
        isOpen={isActivateOpen}
        onClose={() => setIsActivateOpen(false)}
        onConfirm={handleConfirmActivate}
        rateCard={selectedCard}
      />
    </div>
  );
}
