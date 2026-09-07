"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Dataset, PmsSystemType, CreatePmsConnectorCommand } from "../types";

interface PmsConnectorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (command: CreatePmsConnectorCommand) => Promise<any>;
  datasets: Dataset[];
}

const SYSTEM_TYPES: { value: PmsSystemType; label: string }[] = [
  { value: "GENERIC_REST", label: "Generic REST (available)" },
  { value: "ADERANT", label: "Aderant (coming soon)" },
  { value: "ELITE_3E", label: "Elite 3E (coming soon)" },
  { value: "INTAPP", label: "Intapp (coming soon)" },
];

export function PmsConnectorFormModal({ isOpen, onClose, onSave, datasets }: PmsConnectorFormModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [systemType, setSystemType] = useState<PmsSystemType>("GENERIC_REST");
  const [datasetUid, setDatasetUid] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [syncIntervalHours, setSyncIntervalHours] = useState("24");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const datasetOptions = datasets.map((d) => ({ value: d.uid, label: d.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !datasetUid || !baseUrl.trim()) {
      setError("Display name, target dataset, and base URL are required.");
      return;
    }
    if (systemType !== "GENERIC_REST") {
      setError("Only the Generic REST connector is implemented today — the named vendors are reserved slots for future credentials.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        displayName,
        systemType,
        datasetUid,
        baseUrl,
        apiKey: apiKey.trim() || undefined,
        syncIntervalHours: Number(syncIntervalHours) || 24,
      });
      setDisplayName("");
      setSystemType("GENERIC_REST");
      setDatasetUid("");
      setBaseUrl("");
      setApiKey("");
      setSyncIntervalHours("24");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create connector.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New PMS Connector" size="xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200/50 text-rose-700 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-ink/40 uppercase tracking-wider">Display Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Aderant Sync — Corporate"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-5 py-3 bg-field border border-border rounded-full text-sm font-semibold text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all duration-200"
          />
        </div>

        <Select
          label="System Type"
          required
          options={SYSTEM_TYPES}
          value={systemType}
          onChange={(val) => setSystemType(val as PmsSystemType)}
        />

        <Select
          label="Target Dataset"
          required
          options={datasetOptions}
          value={datasetUid}
          onChange={(val) => setDatasetUid(val)}
          placeholder={datasetOptions.length === 0 ? "No datasets yet — create one first" : "Select a dataset..."}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-ink/40 uppercase tracking-wider">Base URL *</label>
          <input
            type="text"
            required
            placeholder="e.g. http://localhost:8080/mock-pms"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full px-5 py-3 bg-field border border-border rounded-full text-sm font-semibold text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all duration-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-ink/40 uppercase tracking-wider">API Key (optional)</label>
          <input
            type="password"
            placeholder="Stored encrypted — never echoed back"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-5 py-3 bg-field border border-border rounded-full text-sm font-semibold text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all duration-200"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-ink/40 uppercase tracking-wider">Sync Interval (hours)</label>
          <input
            type="number"
            min="1"
            value={syncIntervalHours}
            onChange={(e) => setSyncIntervalHours(e.target.value)}
            className="w-full px-5 py-3 bg-field border border-border rounded-full text-sm font-semibold text-ink placeholder:text-ink/30 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all duration-200"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border shrink-0">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            Create Connector
          </Button>
        </div>
      </form>
    </Modal>
  );
}
