/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { HiX } from "react-icons/hi";
import { RateCard } from "../types";
import { FormError } from "@/components/ui/FormError";

interface ActivateRateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<any>;
  rateCard: RateCard | null;
}

export function ActivateRateCardModal({
  isOpen,
  onClose,
  onConfirm,
  rateCard,
}: ActivateRateCardModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  if (!isOpen || !rateCard) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setModalError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setModalError(err.message || "Failed to activate rate card.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-surface rounded-xl max-w-sm w-full shadow-2xl p-6 relative animate-fade-in-up z-50 border border-red-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink/40 hover:text-ink/65 transition-colors"
        >
          <HiX size={20} />
        </button>
        <h3 className="text-lg font-bold text-ink mb-2">
          Activate Rate Card?
        </h3>
        
        <p className="text-sm text-ink/65 mb-4">
          Are you sure you want to activate <span className="font-semibold text-ink">&quot;{rateCard.name}&quot;</span>? 
          Any currently active rate card will be automatically archived.
        </p>

          {modalError && (
            <FormError message={modalError} />
          )}

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleConfirm} loading={isSubmitting}>
              Confirm Activation
            </Button>
          </div>
      </div>
    </div>
  );
}
