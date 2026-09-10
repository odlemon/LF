/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { HiX } from "react-icons/hi";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { ExchangeRate } from "@/modules/firm/types";
import { FormError } from "@/components/ui/FormError";

const CURRENCY_OPTIONS = [
  { value: "GBP", label: "GBP (£)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "ZAR", label: "ZAR (R)" },
  { value: "AUD", label: "AUD ($)" },
  { value: "CAD", label: "CAD ($)" },
  { value: "CHF", label: "CHF (Fr)" },
];

interface FxRateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRate: ExchangeRate | null;
  onSave: (data: { baseCurrency: string; quoteCurrency: string; rate: number; asOfDate: string }) => Promise<any>;
}

export function FxRateFormModal({ isOpen, onClose, editingRate, onSave }: FxRateFormModalProps) {
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [quoteCurrency, setQuoteCurrency] = useState("GBP");
  const [rate, setRate] = useState("");
  const [asOfDate, setAsOfDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (editingRate) {
      setBaseCurrency(editingRate.baseCurrency);
      setQuoteCurrency(editingRate.quoteCurrency);
      setRate(String(editingRate.rate));
      setAsOfDate(editingRate.asOfDate);
    } else {
      setBaseCurrency("USD");
      setQuoteCurrency("GBP");
      setRate("");
      setAsOfDate("");
    }
    setModalError(null);
  }, [isOpen, editingRate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateValue = Number(rate);
    if (!baseCurrency || !quoteCurrency || !rate.trim() || !asOfDate.trim()) {
      setModalError("All fields are required.");
      return;
    }
    if (baseCurrency === quoteCurrency) {
      setModalError("Base and quote currency must be different.");
      return;
    }
    if (!Number.isFinite(rateValue) || rateValue <= 0) {
      setModalError("Rate must be a positive number.");
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    try {
      await onSave({ baseCurrency, quoteCurrency, rate: rateValue, asOfDate });
      onClose();
    } catch (err: any) {
      setModalError(err.message || "Failed to save exchange rate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-fade-in-up z-50 border border-border">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-ink/60 hover:text-ink/65 p-1 rounded-lg hover:bg-field transition-colors"
        >
          <HiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-ink mb-4 pr-8">
          {editingRate ? "Edit Exchange Rate" : "Add Exchange Rate"}
        </h3>

        {modalError && (
          <FormError message={modalError} />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                From
              </label>
              <Select value={baseCurrency} onChange={setBaseCurrency} options={CURRENCY_OPTIONS} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                To (reporting)
              </label>
              <Select value={quoteCurrency} onChange={setQuoteCurrency} options={CURRENCY_OPTIONS} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Rate (1 {baseCurrency} = ? {quoteCurrency})
            </label>
            <input
              type="number"
              step="0.00000001"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="e.g. 0.79"
              className="px-5 py-2.5 bg-field border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-ink font-semibold"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              As of Date
            </label>
            <DatePicker value={asOfDate} onChange={setAsOfDate} />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {editingRate ? "Save" : "Add Rate"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
