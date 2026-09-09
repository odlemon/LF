"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { DataCategory, CreateDatasetCommand } from "../types";

interface DatasetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (command: CreateDatasetCommand) => Promise<any>;
}

const CATEGORIES: { value: DataCategory; label: string }[] = [
  { value: "PAST_MATTERS", label: "Past Matters" },
  { value: "TIME_ENTRIES", label: "Time Entries" },
  { value: "BILLING_HISTORY", label: "Billing History" },
  { value: "RATE_CARD_HISTORY", label: "Rate Card History" },
  { value: "MARKET_BENCHMARKS", label: "Market Benchmarks" },
  { value: "CLIENT_OCG", label: "Client OCG Guidelines" },
  { value: "MATTER_ASSUMPTIONS", label: "Matter Assumptions" },
  { value: "OTHER", label: "Other" },
];

export function DatasetFormModal({ isOpen, onClose, onSave }: DatasetFormModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DataCategory>("PAST_MATTERS");
  const [description, setDescription] = useState("");
  const [sourceSystem, setSourceSystem] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Dataset name is required.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        name,
        category,
        description: description.trim() || undefined,
        sourceSystem: sourceSystem.trim() || undefined,
        periodStart: periodStart || undefined,
        periodEnd: periodEnd || undefined,
      });
      // Clear form
      setName("");
      setCategory("PAST_MATTERS");
      setDescription("");
      setSourceSystem("");
      setPeriodStart("");
      setPeriodEnd("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create dataset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Dataset Batch" size="xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200/50 text-red-700 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-ink/40 uppercase tracking-wider">Dataset Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Ingestion 2024 - Corporate Matters"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-3 bg-field border border-border rounded-full text-sm font-semibold text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all duration-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Select
            label="Data Category"
            required
            options={CATEGORIES}
            value={category}
            onChange={(val) => setCategory(val as DataCategory)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-ink/40 uppercase tracking-wider">Source System</label>
          <input
            type="text"
            placeholder="e.g. Aderant, Elite 3E, InTapp"
            value={sourceSystem}
            onChange={(e) => setSourceSystem(e.target.value)}
            className="w-full px-5 py-3 bg-field border border-border rounded-full text-sm font-semibold text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-ink/40 uppercase tracking-wider">Period Start</label>
            <DatePicker value={periodStart} onChange={setPeriodStart} placeholder="Start date..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-ink/40 uppercase tracking-wider">Period End</label>
            <DatePicker value={periodEnd} onChange={setPeriodEnd} placeholder="End date..." />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-ink/40 uppercase tracking-wider">Description</label>
          <textarea
            placeholder="Provide context or instructions for this historical billing batch..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-5 py-3.5 bg-field border border-border rounded-2xl text-sm font-semibold text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all duration-200 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border shrink-0">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Create Batch
          </Button>
        </div>
      </form>
    </Modal>
  );
}
