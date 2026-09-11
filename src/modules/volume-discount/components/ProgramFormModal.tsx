/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { fieldClassName } from "@/components/ui/Input";
import { HiX, HiPlus, HiTrash } from "react-icons/hi";
import type { ClientProfile } from "@/modules/firm/types";
import type { CreateVolumeDiscountProgramCommand, TierCommand } from "../types";
import { FormError } from "@/components/ui/FormError";

interface ProgramFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (command: CreateVolumeDiscountProgramCommand) => Promise<any>;
  clients: ClientProfile[];
}

const emptyTier = (sortOrder: number): TierCommand => ({
  tierName: "",
  spendThreshold: 0,
  discountPct: 0,
  sortOrder,
});

export function ProgramFormModal({ isOpen, onClose, onSave, clients }: ProgramFormModalProps) {
  const [clientProfileUid, setClientProfileUid] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [tiers, setTiers] = useState<TierCommand[]>([emptyTier(0)]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    setClientProfileUid("");
    setCurrency("GBP");
    setPeriodStart("");
    setPeriodEnd("");
    setTiers([emptyTier(0)]);
    setModalError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const addTier = () => setTiers([...tiers, emptyTier(tiers.length)]);

  const removeTier = (index: number) =>
    setTiers(tiers.filter((_, i) => i !== index));

  const updateTier = (index: number, field: keyof TierCommand, value: string | number) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value } as TierCommand;
    setTiers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientProfileUid) {
      setModalError("Please select a client.");
      return;
    }
    if (!periodStart || !periodEnd) {
      setModalError("Period start and end dates are required.");
      return;
    }
    if (tiers.length === 0 || tiers.some((t) => !t.tierName.trim())) {
      setModalError("At least one tier with a name is required.");
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    try {
      await onSave({
        clientProfileUid,
        currency,
        periodStart,
        periodEnd,
        tiers: tiers.map((t, i) => ({ ...t, sortOrder: i })),
      });
      onClose();
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || "Failed to create program.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface rounded-xl max-w-2xl w-full shadow-2xl p-6 relative animate-fade-in-up z-50 border border-border max-h-[85vh] overflow-y-auto rates-scrollable">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-ink/60 hover:text-ink/65 p-1 rounded-lg hover:bg-field transition-colors"
        >
          <HiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-ink mb-4 pr-8">
          New Volume Discount Program
        </h3>

        {modalError && (
          <FormError message={modalError} />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Client
            </label>
            <Select
              value={clientProfileUid}
              onChange={setClientProfileUid}
              placeholder="Select client..."
              options={clients.map((c) => ({
                value: c.uid,
                label: c.name,
                description: c.contactEmail,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                Period Start
              </label>
              <DatePicker value={periodStart} onChange={setPeriodStart} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Period End
              </label>
              <DatePicker value={periodEnd} onChange={setPeriodEnd} />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Discount Tiers
              </label>
              <button
                type="button"
                onClick={addTier}
                className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors py-1.5 -my-1.5"
              >
                <HiPlus className="w-3.5 h-3.5" />
                Add Tier
              </button>
            </div>

            {tiers.map((tier, index) => (
              <div key={index} className="grid grid-cols-[1.2fr_1fr_0.8fr_auto] gap-3 items-center">
                <input aria-label="Discount Tiers"
                  type="text"
                  value={tier.tierName}
                  onChange={(e) => updateTier(index, "tierName", e.target.value)}
                  placeholder={`Tier ${index + 1} name (e.g. Bronze)`}
                  className={fieldClassName}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tier.spendThreshold || ""}
                  onChange={(e) => updateTier(index, "spendThreshold", parseFloat(e.target.value) || 0)}
                  placeholder="Spend threshold"
                  className={fieldClassName}
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={tier.discountPct || ""}
                  onChange={(e) => updateTier(index, "discountPct", parseFloat(e.target.value) || 0)}
                  placeholder="Discount %"
                  className={fieldClassName}
                />
                <button
                  type="button"
                  onClick={() => removeTier(index)}
                  aria-label="Remove tier"
                  disabled={tiers.length === 1}
                  className="p-2.5 rounded-full text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
            ))}
            <p className="text-[11px] text-ink/60">
              Tiers are ordered top to bottom. When cumulative spend crosses a threshold, the discount applies retroactively.
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-border">
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
              Create Program
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
