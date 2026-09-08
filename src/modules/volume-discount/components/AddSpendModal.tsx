/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { fieldClassName } from "@/components/ui/Input";
import { HiX } from "react-icons/hi";
import type { AddSpendRecordCommand } from "../types";
import { FormError } from "@/components/ui/FormError";

interface AddSpendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (command: AddSpendRecordCommand) => Promise<any>;
  defaultCurrency?: string;
}

export function AddSpendModal({ isOpen, onClose, onSave, defaultCurrency = "GBP" }: AddSpendModalProps) {
  const [invoiceReference, setInvoiceReference] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [spendDate, setSpendDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    setInvoiceReference("");
    setAmount("");
    setCurrency(defaultCurrency);
    setSpendDate(new Date().toISOString().split("T")[0]);
    setModalError(null);
  }, [isOpen, defaultCurrency]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setModalError("A positive spend amount is required.");
      return;
    }
    if (!spendDate) {
      setModalError("Spend date is required.");
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    try {
      await onSave({
        invoiceReference: invoiceReference.trim() || undefined,
        amount: parsed,
        currency,
        spendDate,
        source: "MANUAL",
      });
      onClose();
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || "Failed to add spend record.");
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
          className="absolute top-4 right-4 text-ink/40 hover:text-ink/65 p-1 rounded-lg hover:bg-field transition-colors"
        >
          <HiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-ink mb-4 pr-8">
          Add Spend Record
        </h3>

        {modalError && (
          <FormError message={modalError} />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Invoice Reference
            </label>
            <input
              type="text"
              value={invoiceReference}
              onChange={(e) => setInvoiceReference(e.target.value)}
              placeholder="e.g. INV-2026-042 (optional)"
              className={fieldClassName}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={fieldClassName}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Currency
              </label>
              <Select
                value={currency}
                onChange={setCurrency}
                options={[
                  { value: "GBP", label: "GBP (£)" },
                  { value: "USD", label: "USD ($)" },
                  { value: "EUR", label: "EUR (€)" },
                  { value: "ZAR", label: "ZAR (R)" },
                  { value: "AUD", label: "AUD ($)" },
                  { value: "CAD", label: "CAD ($)" },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Spend Date
            </label>
            <DatePicker value={spendDate} onChange={setSpendDate} />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              Add Spend
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
