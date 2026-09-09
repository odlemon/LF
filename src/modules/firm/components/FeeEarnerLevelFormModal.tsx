/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { FeeEarnerLevel } from "../types";
import { HiX } from "react-icons/hi";
import { FormError } from "@/components/ui/FormError";

interface FeeEarnerLevelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; code: string; sortOrder: number; costRate: number | null }) => Promise<any>;
  feeEarnerLevel?: FeeEarnerLevel | null;
}

export function FeeEarnerLevelFormModal({
  isOpen,
  onClose,
  onSave,
  feeEarnerLevel,
}: FeeEarnerLevelFormModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [costRate, setCostRate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (feeEarnerLevel) {
      setName(feeEarnerLevel.name);
      setCode(feeEarnerLevel.code);
      setSortOrder(feeEarnerLevel.sortOrder);
      setCostRate(feeEarnerLevel.costRate != null ? String(feeEarnerLevel.costRate) : "");
    } else {
      setName("");
      setCode("");
      setSortOrder(1);
    }
    setModalError(null);
  }, [feeEarnerLevel, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || sortOrder === undefined) {
      setModalError("All fields are required.");
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    try {
      await onSave({
        name,
        code,
        sortOrder: Number(sortOrder),
        costRate: costRate.trim() === "" ? null : Number(costRate),
      });
      onClose();
    } catch (err: any) {
      setModalError(err.message || "Failed to save fee earner level.");
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
          {feeEarnerLevel ? "Edit Fee Earner Level" : "Add Fee Earner Level"}
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
              placeholder="e.g. Partner"
              className="px-5 py-2.5 bg-field border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-ink"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. PARTNER"
              disabled={!!feeEarnerLevel}
              className="px-5 py-2.5 bg-field border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-ink disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-canvas"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Sort Order
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              placeholder="e.g. 1"
              min={1}
              className="px-5 py-2.5 bg-field border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-ink"
              required
            />
            <span className="text-xs text-ink/55 mt-0.5">
              Lower number = more senior. Partner might be 1, Associate might be 3.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Cost Rate (per hour)
            </label>
            <input
              type="number"
              value={costRate}
              onChange={(e) => setCostRate(e.target.value)}
              placeholder="e.g. 395"
              min={0}
              step="1"
              className="px-5 py-2.5 bg-field border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-ink"
            />
            <span className="text-xs text-ink/55 mt-0.5">
              What this level costs the firm per hour — salary, on-costs and overhead. Not the
              billing rate. Margin is estimated rather than costed until every level has one.
            </span>
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
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
