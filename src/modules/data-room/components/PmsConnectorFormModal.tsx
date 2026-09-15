"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Dataset, CreatePmsConnectorCommand } from "../types";

interface PmsConnectorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (command: CreatePmsConnectorCommand) => Promise<any>;
  datasets: Dataset[];
}

const AUTH_TYPES = [
  { value: "API_KEY", label: "API key (bearer token)" },
  { value: "NONE", label: "No authentication" },
];

export function PmsConnectorFormModal({ isOpen, onClose, onSave, datasets }: PmsConnectorFormModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [datasetUid, setDatasetUid] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [authType, setAuthType] = useState<"API_KEY" | "NONE">("API_KEY");
  const [apiKey, setApiKey] = useState("");
  const [syncIntervalHours, setSyncIntervalHours] = useState("24");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const datasetOptions = datasets.map((d) => ({ value: d.uid, label: d.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !datasetUid || !baseUrl.trim()) {
      setError("Display name, target dataset, and API endpoint URL are required.");
      return;
    }
    if (authType === "API_KEY" && !apiKey.trim()) {
      setError("Enter the API key, or switch to \"No authentication\" if this endpoint doesn't require one.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        displayName,
        systemType: "GENERIC_REST",
        datasetUid,
        baseUrl,
        apiKey: authType === "API_KEY" ? apiKey.trim() : undefined,
        syncIntervalHours: Number(syncIntervalHours) || 24,
      });
      setDisplayName("");
      setDatasetUid("");
      setBaseUrl("");
      setAuthType("API_KEY");
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
        <p className="text-xs text-ink/70 leading-relaxed -mt-1">
          Connects to your practice management system's REST API on a schedule and syncs
          matters and billing rows into the dataset you choose below.
        </p>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200/50 text-red-700 text-xs font-bold rounded-[2rem]">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wider">Display Name *</label>
          <input aria-label="Display Name"
            type="text"
            required
            placeholder="e.g. Aderant Sync — Corporate"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-5 py-3 bg-field border border-border rounded-full text-sm font-semibold text-ink placeholder:text-ink/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all duration-200"
          />
        </div>

        <Select
          label="Target Dataset"
          required
          options={datasetOptions}
          value={datasetUid}
          onChange={(val) => setDatasetUid(val)}
          placeholder={datasetOptions.length === 0 ? "No datasets yet — create one first" : "Select a dataset..."}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wider">API Endpoint URL *</label>
          <input aria-label="API Endpoint URL"
            type="text"
            required
            placeholder="e.g. https://api.yourpms.com/v1"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full px-5 py-3 bg-field border border-border rounded-full text-sm font-semibold text-ink placeholder:text-ink/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all duration-200"
          />
        </div>

        <Select
          label="Authentication"
          required
          options={AUTH_TYPES}
          value={authType}
          onChange={(val) => setAuthType(val as "API_KEY" | "NONE")}
        />

        {authType === "API_KEY" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wider">API Key *</label>
            <input aria-label="API Key"
              type="password"
              required
              placeholder="Stored encrypted — never echoed back"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-5 py-3 bg-field border border-border rounded-full text-sm font-semibold text-ink placeholder:text-ink/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all duration-200"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-ink/60 uppercase tracking-wider">Sync Interval (hours)</label>
          <input aria-label="Sync Interval (hours)"
            type="number"
            min="1"
            value={syncIntervalHours}
            onChange={(e) => setSyncIntervalHours(e.target.value)}
            className="w-full px-5 py-3 bg-field border border-border rounded-full text-sm font-semibold text-ink placeholder:text-ink/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/80 transition-all duration-200"
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
