/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { HiX } from "react-icons/hi";

import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { FormError } from "@/components/ui/FormError";

interface RateCardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; currency: string; effectiveDate: string; expiryDate?: string; officeCode?: string }) => Promise<any>;
}

export function RateCardFormModal({
  isOpen,
  onClose,
  onSave,
}: RateCardFormModalProps) {
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [officeCode, setOfficeCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    setName("");
    setCurrency("GBP");
    setEffectiveDate("");
    setExpiryDate("");
    setOfficeCode("");
    setModalError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currency.trim() || !effectiveDate.trim()) {
      setModalError("Name, currency, and effective date are required.");
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    try {
      await onSave({
        name,
        currency,
        effectiveDate,
        expiryDate: expiryDate.trim() || undefined,
        officeCode: officeCode.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setModalError(err.message || "Failed to create rate card.");
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
          Create Rate Card
        </h3>

        {modalError && (
          <FormError message={modalError} />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard 2026 Rate Card"
              className="px-5 py-2.5 bg-field border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-ink font-semibold"
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

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Office
            </label>
            <input
              type="text"
              value={officeCode}
              onChange={(e) => setOfficeCode(e.target.value.toUpperCase())}
              placeholder="e.g. LON, NYC, FRA — leave blank for firm default"
              className="px-5 py-2.5 bg-field border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-ink font-semibold"
              maxLength={20}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Effective Date
              </label>
              <DatePicker
                value={effectiveDate}
                onChange={setEffectiveDate}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Expiry Date
              </label>
              <DatePicker
                value={expiryDate}
                onChange={setExpiryDate}
              />
            </div>
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
              Create
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
