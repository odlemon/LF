"use client";

import React, { useMemo, useState } from "react";
import { useFxRates } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import { FxRateFormModal } from "@/modules/firm/components/FxRateFormModal";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { ExchangeRate } from "@/modules/firm/types";
import toast from "react-hot-toast";
import { HiPlus, HiOutlineSwitchHorizontal, HiPencil, HiTrash, HiInformationCircle } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";

const PAGE_SIZE = 10;

export default function FxRatesPage() {
  const { rates, isLoading, error, createRate, updateRate, deleteRate } = useFxRates();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(rates.length / PAGE_SIZE));
  const pageRates = useMemo(
    () => rates.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [rates, page]
  );

  const handleSave = async (data: {
    baseCurrency: string;
    quoteCurrency: string;
    rate: number;
    asOfDate: string;
  }) => {
    try {
      if (editingRate) {
        await updateRate(editingRate.uid, data);
        toast.success("Exchange rate updated.");
      } else {
        await createRate(data);
        toast.success("Exchange rate added.");
      }
      setIsFormOpen(false);
      setEditingRate(null);
    } catch (err) {
      throw err;
    }
  };

  const handleEdit = (rate: ExchangeRate) => {
    setEditingRate(rate);
    setIsFormOpen(true);
  };

  const handleDelete = async (rate: ExchangeRate) => {
    try {
      await deleteRate(rate.uid);
      toast.success("Exchange rate removed.");
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e.message || "Failed to remove exchange rate");
    }
  };

  return (
    <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">FX Rates</h1>
          <p className="text-sm text-ink/60 mt-1">
            Exchange rates used to normalize revenue across offices and currencies into the
            firm&apos;s reporting currency.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setEditingRate(null);
            setIsFormOpen(true);
          }}
          className="self-start sm:self-center"
        >
          <HiPlus className="w-4 h-4" />
          Add Rate
        </Button>
      </div>

      <div className="flex items-start gap-2.5 rounded-[2rem] border border-border/60 bg-field/40 px-5 py-4 text-xs font-medium text-ink/80">
        <HiInformationCircle className="w-4 h-4 text-ink/50 shrink-0 mt-0.5" />
        <span>
          Rates marked <Badge variant="info" className="mx-0.5 align-middle">ECB</Badge> are fetched
          automatically every day from the European Central Bank&apos;s reference rates. Add a rate for
          a given day to override the automatic value for that day, or for a currency pair not covered
          above.
        </span>
      </div>

      {error && <Alert variant="error" message={error} />}

      <div className="bg-surface rounded-[2rem] border border-border/60 overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto rates-scrollable">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-field/60 text-xs font-bold text-ink/60 border-b border-border">
                <th className="px-6 py-4.5">Pair</th>
                <th className="px-6 py-4.5">Rate</th>
                <th className="px-6 py-4.5">As of</th>
                <th className="px-6 py-4.5">Source</th>
                <th className="px-6 py-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading && rates.length === 0 ? (
                <TableSkeleton columnWidths={["w-24", "w-32", "w-20", "w-16", "w-16"]} />
              ) : pageRates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10">
                    <EmptyState
                      title="No exchange rates configured"
                      description="Add a rate to normalize revenue from a second-currency office into the firm's reporting currency."
                      icon={<HiOutlineSwitchHorizontal className="w-5 h-5" />}
                    />
                  </td>
                </tr>
              ) : (
                pageRates.map((rate) => (
                  <tr key={rate.uid} className="hover:bg-field/20 text-ink/90 transition-colors">
                    <td className="px-6 py-4.5 font-semibold text-ink">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <HiOutlineSwitchHorizontal className="w-4 h-4" />
                        </div>
                        <span>
                          {rate.baseCurrency} → {rate.quoteCurrency}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 text-xs font-bold text-ink/80 tabular-nums">
                      1 {rate.baseCurrency} = {rate.rate} {rate.quoteCurrency}
                    </td>
                    <td className="px-6 py-4.5 text-xs font-medium text-ink/70">{rate.asOfDate}</td>
                    <td className="px-6 py-4.5">
                      <Badge variant={rate.source === "ECB" ? "info" : "neutral"}>
                        {rate.source === "ECB" ? "ECB" : "Manual"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleEdit(rate)}
                          className="p-2 text-ink/60 hover:text-ink hover:bg-hover rounded-full transition-all"
                          aria-label="Edit"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rate)}
                          className="p-2 text-ink/60 hover:text-danger hover:bg-danger/10 rounded-full transition-all"
                          aria-label="Delete"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && pageRates.length > 0 && (
          <div className="px-6 pb-2 shrink-0">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <FxRateFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRate(null);
        }}
        editingRate={editingRate}
        onSave={handleSave}
      />
    </div>
  );
}
