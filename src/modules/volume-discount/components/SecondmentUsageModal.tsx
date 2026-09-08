/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { fieldClassName } from "@/components/ui/Input";
import { HiX } from "react-icons/hi";
import { FormError } from "@/components/ui/FormError";

interface SecondmentUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hours: number, matterUid?: string) => Promise<any>;
  remainingHours: number;
}

export function SecondmentUsageModal({ isOpen, onClose, onSave, remainingHours }: SecondmentUsageModalProps) {
  const [hours, setHours] = useState("");
  const [matterUid, setMatterUid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    setHours("");
    setMatterUid("");
    setModalError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(hours);
    if (!hours || !Number.isFinite(parsed) || parsed <= 0) {
      setModalError("Enter a positive number of hours.");
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    try {
      await onSave(parsed, matterUid.trim() || undefined);
      onClose();
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message || "Failed to record usage.");
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

        <h3 className="text-lg font-bold text-ink mb-1 pr-8">Record Secondment Usage</h3>
        <p className="text-xs text-ink/55 mb-4">{remainingHours}h remaining of the annual allowance.</p>

        {modalError && (
          <FormError message={modalError} />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">Hours</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="e.g. 8"
              className={fieldClassName}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Matter (optional)
            </label>
            <input
              type="text"
              value={matterUid}
              onChange={(e) => setMatterUid(e.target.value)}
              placeholder="Matter reference"
              className={fieldClassName}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Record Usage
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
