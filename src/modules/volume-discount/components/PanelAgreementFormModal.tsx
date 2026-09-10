/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { fieldClassName } from "@/components/ui/Input";
import { HiX } from "react-icons/hi";
import type { CreatePanelAgreementCommand } from "../types";
import { FormError } from "@/components/ui/FormError";

interface PanelAgreementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (command: CreatePanelAgreementCommand) => Promise<any>;
}

export function PanelAgreementFormModal({ isOpen, onClose, onSave }: PanelAgreementFormModalProps) {
  const [agreementPeriodStart, setAgreementPeriodStart] = useState("");
  const [agreementPeriodEnd, setAgreementPeriodEnd] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [mfnEnabled, setMfnEnabled] = useState(false);
  const [secondmentCreditHours, setSecondmentCreditHours] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    setAgreementPeriodStart("");
    setAgreementPeriodEnd("");
    setRenewalDate("");
    setMfnEnabled(false);
    setSecondmentCreditHours("0");
    setModalError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreementPeriodStart || !agreementPeriodEnd) {
      setModalError("Agreement start and end dates are required.");
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    try {
      await onSave({
        agreementPeriodStart,
        agreementPeriodEnd,
        renewalDate: renewalDate || undefined,
        mfnEnabled,
        secondmentCreditHours: Number(secondmentCreditHours) || 0,
      });
      onClose();
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || "Failed to create panel agreement.");
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

        <h3 className="text-lg font-bold text-ink mb-4 pr-8">Add Panel Agreement</h3>

        {modalError && (
          <FormError message={modalError} />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Agreement Start
              </label>
              <DatePicker value={agreementPeriodStart} onChange={setAgreementPeriodStart} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Agreement End
              </label>
              <DatePicker value={agreementPeriodEnd} onChange={setAgreementPeriodEnd} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Renewal Date
            </label>
            <DatePicker value={renewalDate} onChange={setRenewalDate} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Secondment Credit Hours (annual allowance)
            </label>
            <input aria-label="Secondment Credit Hours (annual allowance)"
              type="number"
              min="0"
              step="0.5"
              value={secondmentCreditHours}
              onChange={(e) => setSecondmentCreditHours(e.target.value)}
              className={fieldClassName}
            />
          </div>

          <label className="flex items-center gap-2.5 px-1 py-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={mfnEnabled}
              onChange={(e) => setMfnEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30"
            />
            <span className="text-sm font-medium text-ink">
              MFN enabled — client gets the firm&apos;s best comparable rate
            </span>
          </label>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Add Agreement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
