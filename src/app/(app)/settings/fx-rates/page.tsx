"use client";

import React, { useState } from "react";
import { useFxRates } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import { FxRateFormModal } from "@/modules/firm/components/FxRateFormModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExchangeRate } from "@/modules/firm/types";
import toast from "react-hot-toast";
import { HiPlus, HiOutlineSwitchHorizontal, HiPencil, HiTrash } from "react-icons/hi";

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">FX Rates</h1>
          <p className="text-sm text-ink/55 mt-1">
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

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-40 bg-field rounded-2xl" />
        </div>
      ) : rates.length === 0 ? (
        <EmptyState
          title="No exchange rates configured"
          description="Add a rate to normalize revenue from a second-currency office into the firm's reporting currency."
          icon={<HiOutlineSwitchHorizontal className="w-5 h-5" />}
        />
      ) : (
        <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-field/50 text-xs font-bold text-ink/55 border-b border-border">
                <th className="px-6 py-4">Pair</th>
                <th className="px-6 py-4">Rate</th>
                <th className="px-6 py-4">As of</th>
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
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => handleEdit(rate)}
                        className="p-2 text-ink/50 hover:text-ink hover:bg-hover rounded-full transition-all"
                        aria-label="Edit"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rate)}
                        className="p-2 text-ink/50 hover:text-rose-600 hover:bg-hover rounded-full transition-all"
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
