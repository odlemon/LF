"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { useResolveAnomaly } from "../hooks/useAnalytics";
import { SeverityBadge } from "./badges";
import { formatAnomalyType } from "../utils/format";
import type { AnomalyFlagResponse, AnomalyOutcome } from "../types";
import { FormError } from "@/components/ui/FormError";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ResolveAnomalyModalProps {
  anomaly: AnomalyFlagResponse | null;
  onClose: () => void;
  onResolved: () => void;
}

/** Inner form — remounted (fresh state) per anomaly via the `key` below. */
function ResolveAnomalyForm({
  anomaly,
  onClose,
  onResolved,
}: {
  anomaly: AnomalyFlagResponse;
  onClose: () => void;
  onResolved: () => void;
}) {
  const { resolve, isSubmitting } = useResolveAnomaly();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingOutcome, setPendingOutcome] = useState<AnomalyOutcome | null>(null);

  const handleSubmit = async (outcome: AnomalyOutcome) => {
    if (!note.trim()) {
      setError("A resolution note is required.");
      return;
    }
    setPendingOutcome(outcome);
    setError(null);
    try {
      await resolve(anomaly.uid, { note: note.trim(), outcome });
      onResolved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to resolve anomaly.");
    } finally {
      setPendingOutcome(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <SeverityBadge severity={anomaly.severity} />
        <span className="text-xs font-bold text-ink/70">
          {formatAnomalyType(anomaly.anomalyType)}
        </span>
        <span className="text-[11px] text-ink/60">· {anomaly.uid.slice(0, 8)}</span>
      </div>

      {anomaly.aiDescription && (
        <p className="text-xs text-ink/65 leading-relaxed bg-field/60 border border-border/60 rounded-xl p-3">
          {anomaly.aiDescription}
        </p>
      )}

      {error && <FormError message={error} className="mb-0" />}

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-ink/60 uppercase tracking-wider pl-1">
          Resolution note <span className="text-red-600 dark:text-red-400">*</span>
        </label>
        <Textarea
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Explain the outcome — what caused it and what was done..."
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          loading={isSubmitting && pendingOutcome === "VALID_EXCEPTION"}
          disabled={isSubmitting && pendingOutcome !== "VALID_EXCEPTION"}
          onClick={() => handleSubmit("VALID_EXCEPTION")}
        >
          Mark as Valid Exception
        </Button>
        <Button
          type="button"
          variant="primary"
          loading={isSubmitting && pendingOutcome === "RESOLVED"}
          disabled={isSubmitting && pendingOutcome !== "RESOLVED"}
          onClick={() => handleSubmit("RESOLVED")}
        >
          Resolve
        </Button>
      </div>
    </div>
  );
}

/**
 * Resolution flow is a modal (never a page): note + outcome choice between
 * "Resolve" and "Mark as Valid Exception".
 */
export function ResolveAnomalyModal({ anomaly, onClose, onResolved }: ResolveAnomalyModalProps) {
  return (
    <Modal isOpen={anomaly != null} onClose={onClose} title="Resolve anomaly" size="lg">
      {anomaly && (
        <ResolveAnomalyForm
          key={anomaly.uid}
          anomaly={anomaly}
          onClose={onClose}
          onResolved={onResolved}
        />
      )}
    </Modal>
  );
}
