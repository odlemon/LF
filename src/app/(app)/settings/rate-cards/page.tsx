/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { useRateCards } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { FilterBar } from "@/components/ui/FilterBar";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { RateCardFormModal } from "@/modules/firm/components/RateCardFormModal";
import { RateCardEntriesSlideOver } from "@/modules/firm/components/RateCardEntriesSlideOver";
import { ActivateRateCardModal } from "@/modules/firm/components/ActivateRateCardModal";
import { RateCard } from "@/modules/firm/types";
import toast from "react-hot-toast";
import { HiPlus, HiOutlineDatabase } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "ARCHIVED", label: "Archived" },
];

const PAGE_SIZE = 10;

export default function RateCardsPage() {
  const { cards, isLoading, error, createCard, activateCard } = useRateCards();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEntriesOpen, setIsEntriesOpen] = useState(false);
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<RateCard | null>(null);
  const [officeFilter, setOfficeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const offices = Array.from(
    new Set(cards.map((c) => c.officeCode).filter((o): o is string => !!o))
  ).sort();
  const officeOptions = [
    { value: "ALL", label: "All offices" },
    { value: "", label: "Firm default" },
    ...offices.map((o) => ({ value: o, label: o })),
  ];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return cards.filter((card) => {
      if (officeFilter !== "ALL" && (card.officeCode || "") !== officeFilter) return false;
      if (statusFilter && card.status !== statusFilter) return false;
      if (term && !card.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [cards, officeFilter, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageCards = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  // Independent of the status filter above the table - a firm should see this warning
  // regardless of which status they're currently browsing.
  const hasActiveForOffice = cards.some(
    (c) => c.status === "ACTIVE" && (officeFilter === "ALL" || (c.officeCode || "") === officeFilter)
  );

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

  const handleClear = () => {
    setOfficeFilter("ALL");
    setStatusFilter("");
    setSearch("");
    setPage(0);
  };

  return (
    <div className="px-5 py-8 sm:px-8 max-w-[1400px] w-full mx-auto flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Rate Cards</h1>
          <p className="text-sm text-ink/60 mt-1">Manage corporate rate cards, billing currencies, and level multipliers.</p>
        </div>
        <Button variant="primary" onClick={() => setIsFormModalOpen(true)} className="self-start sm:self-center">
          <HiPlus className="w-4 h-4" />
          Create Rate Card
        </Button>
      </div>

      {error && <Alert variant="error" message={error} />}

      {!hasActiveForOffice && !isLoading && (
        <div className="bg-amber-50/50 border border-amber-200 rounded-[2rem] p-6 text-center text-sm text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300">
          No active rate card currently set{officeFilter !== "ALL" ? " for this office" : ""}. Activating a rate card is required before scoped matters can be computed.
        </div>
      )}

      <FilterBar
        search={{ value: search, onChange: (v) => { setSearch(v); setPage(0); }, placeholder: "Search by name..." }}
        status={{
          value: statusFilter,
          onChange: (v) => { setStatusFilter(v); setPage(0); },
          options: STATUS_OPTIONS,
          placeholder: "All statuses",
        }}
        extra={
          offices.length > 0 ? (
            <Select
              label="Office"
              value={officeFilter}
              onChange={(v) => { setOfficeFilter(v); setPage(0); }}
              options={officeOptions}
            />
          ) : undefined
        }
        onClear={handleClear}
      />

      <div className="bg-surface rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto rates-scrollable">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-field/60 text-xs font-bold text-ink/60 border-b border-border">
                <th className="px-6 py-4.5">Name</th>
                <th className="px-6 py-4.5">Office</th>
                <th className="px-6 py-4.5">Currency</th>
                <th className="px-6 py-4.5">Status</th>
                <th className="px-6 py-4.5">Effective</th>
                <th className="px-6 py-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <TableSkeleton columnWidths={["w-32", "w-20", "w-16", "w-16", "w-24", "w-28"]} />
              ) : pageCards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10">
                    <EmptyState
                      title="No rate cards found"
                      description="Create a rate card to start setting billing rates, or clear your filters."
                      icon={<HiOutlineDatabase className="w-5 h-5" />}
                    />
                  </td>
                </tr>
              ) : (
                pageCards.map((card) => (
                  <tr key={card.uid} className="hover:bg-field/20 text-ink/90 transition-colors">
                    <td className="px-6 py-4.5 font-semibold text-ink">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <HiOutlineDatabase className="w-4 h-4" />
                        </div>
                        <span>{card.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-ink/70 text-xs">{card.officeCode || "Firm default"}</td>
                    <td className="px-6 py-4.5">
                      <Badge variant="primary">{card.currency}</Badge>
                    </td>
                    <td className="px-6 py-4.5">
                      <Badge
                        variant={card.status === "ACTIVE" ? "success" : card.status === "ARCHIVED" ? "neutral" : "warning"}
                      >
                        {card.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4.5 text-ink/70 text-xs">
                      {card.effectiveDate}
                      {card.expiryDate ? ` – ${card.expiryDate}` : ""}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleOpenEntries(card)}
                          className="px-3.5 py-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-full transition-all"
                        >
                          {card.status === "DRAFT" ? "Add/Edit Rates" : "View Rates"}
                        </button>
                        {card.status === "DRAFT" && (
                          <button
                            onClick={() => handleOpenActivate(card)}
                            className="px-3.5 py-1.5 text-xs font-bold text-ink/80 bg-hover hover:bg-hover rounded-full transition-all"
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && pageCards.length > 0 && (
          <div className="px-6 pb-2 shrink-0">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

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
