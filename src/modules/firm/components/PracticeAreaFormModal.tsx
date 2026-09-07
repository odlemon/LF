/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { PracticeArea } from "../types";
import { HiX } from "react-icons/hi";

interface PracticeAreaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; code: string; description?: string }) => Promise<any>;
  practiceArea?: PracticeArea | null;
}

export function PracticeAreaFormModal({
  isOpen,
  onClose,
  onSave,
  practiceArea,
}: PracticeAreaFormModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (practiceArea) {
      setName(practiceArea.name);
      setCode(practiceArea.code);
      setDescription(practiceArea.description || "");
    } else {
      setName("");
      setCode("");
      setDescription("");
    }
    setModalError(null);
  }, [practiceArea, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setModalError("Name and Code are required.");
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    try {
      await onSave({ name, code, description });
      onClose();
    } catch (err: any) {
      setModalError(err.message || "Failed to save practice area.");
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
          {practiceArea ? "Edit Practice Area" : "Add Practice Area"}
        </h3>

        {modalError && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-full text-xs px-5 font-medium animate-fade-in text-center">
            {modalError}
          </div>
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
              placeholder="e.g. Mergers and Acquisitions"
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
              placeholder="e.g. MA"
              disabled={!!practiceArea}
              className="px-5 py-2.5 bg-field border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-ink disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-canvas"
              required
            />
            {!practiceArea && (
              <span className="text-xs text-ink/55 mt-0.5">
                Short code, e.g. MA for Mergers and Acquisitions. Cannot be changed after creation.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief summary of the practice area legal domain..."
              rows={3}
              className="px-5 py-2.5 bg-field border border-border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-ink"
            />
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
