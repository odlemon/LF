/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { FeeEarnerLevel } from "../types";
import { HiX } from "react-icons/hi";

interface FeeEarnerLevelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; code: string; sortOrder: number }) => Promise<any>;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (feeEarnerLevel) {
      setName(feeEarnerLevel.name);
      setCode(feeEarnerLevel.code);
      setSortOrder(feeEarnerLevel.sortOrder);
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
      await onSave({ name, code, sortOrder: Number(sortOrder) });
      onClose();
    } catch (err: any) {
      setModalError(err.message || "Failed to save fee earner level.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-fade-in-up z-50 border border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <HiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-gray-900 mb-4 pr-8">
          {feeEarnerLevel ? "Edit Fee Earner Level" : "Add Fee Earner Level"}
        </h3>

        {modalError && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-full text-xs px-5 font-medium animate-fade-in text-center">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Partner"
              className="px-5 py-2.5 bg-gray-55 border border-gray-250 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-gray-900"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. PARTNER"
              disabled={!!feeEarnerLevel}
              className="px-5 py-2.5 bg-gray-55 border border-gray-250 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-gray-950 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Sort Order
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              placeholder="e.g. 1"
              min={1}
              className="px-5 py-2.5 bg-gray-55 border border-gray-250 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all text-gray-900"
              required
            />
            <span className="text-xs text-gray-500 mt-0.5">
              Lower number = more senior. Partner might be 1, Associate might be 3.
            </span>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
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
