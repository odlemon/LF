"use client";

import React, { useState } from "react";
import { useFxRates } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import { FxRateFormModal } from "@/modules/firm/components/FxRateFormModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { ExchangeRate } from "@/modules/firm/types";
import toast from "react-hot-toast";
import { HiPlus, HiOutlineSwitchHorizontal, HiPencil, HiTrash, HiInformationCircle } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";

export default function FxRatesPage() {
  const { rates, isLoading, error, createRate, updateRate, deleteRate } = useFxRates();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ExchangeRate | null>(null);

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

      <div className="flex items-start gap-2.5 rounded-[2rem] border border-border/60 bg-field/40 px-5 py-4 text-xs font-medium text-ink/70">
        <HiInformationCircle className="w-4 h-4 text-ink/40 shrink-0 mt-0.5" />
        <span>
          Rates marked <Badge variant="info" className="mx-0.5 align-middle">ECB</Badge> are fetched
          automatically every day from the European Central Bank&apos;s reference rates. Add a rate for
          a given day to override the automatic value for that day, or for a currency pair not covered
          above.
        </span>
      </div>

      {error && (
        <Alert variant="error" message={error} />
      )}

      {isLoading ? (
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-40 bg-field rounded-[2rem]" />
        </div>
      ) : rates.length === 0 ? (
        <EmptyState
          title="No exchange rates configured"
          description="Add a rate to normalize revenue from a second-currency office into the firm's reporting currency."
          icon={<HiOutlineSwitchHorizontal className="w-5 h-5" />}
        />
      ) : (
        <div className="bg-surface rounded-[2rem] border border-border/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto rates-scrollable">
            <table className="w-full text-left text-sm border-collapse">

              <thead>
                <tr className="bg-field/50 text-xs font-bold text-ink/60 border-b border-border">
                  <th className="px-6 py-4">Pair</th>
                  <th className="px-6 py-4">Rate</th>
                  <th className="px-6 py-4">As of</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                {rates.map((rate) => (
                  <tr key={rate.uid} className="hover:bg-field/40 text-ink transition-colors">
                    <td className="px-6 py-4 font-semibold text-ink flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <HiOutlineSwitchHorizontal className="w-4 h-4" />
                      </div>
                      <span>
                        {rate.baseCurrency} → {rate.quoteCurrency}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-ink/80 tabular-nums">
                      1 {rate.baseCurrency} = {rate.rate} {rate.quoteCurrency}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-ink/70">{rate.asOfDate}</td>
                    <td className="px-6 py-4">
                      <Badge variant={rate.source === "ECB" ? "info" : "neutral"}>
                        {rate.source === "ECB" ? "ECB" : "Manual"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
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
                          className="p-2 text-ink/60 hover:text-red-600 hover:bg-hover rounded-full transition-all dark:text-red-400"
                          aria-label="Delete"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
