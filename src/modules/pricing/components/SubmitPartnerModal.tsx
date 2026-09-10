"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import * as pricingApi from "../api";
import type { PricingApprover } from "../types";
import { Select } from "@/components/ui/Select";

interface SubmitPartnerModalProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (partnerUserUid: string) => void;
}

export function SubmitPartnerModal({
  open,
  loading,
  onClose,
  onSubmit,
}: SubmitPartnerModalProps) {
  const [approvers, setApprovers] = useState<PricingApprover[]>([]);
  const [selected, setSelected] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingList(true);
    setLoadError(null);
    (async () => {
      try {
        const list = await pricingApi.listPricingApprovers();
        if (cancelled) return;
        setApprovers(list);
        // Deliberately no default. Pre-selecting the first approver meant the submitter was
        // usually offered themselves, making self-approval the path of least resistance.
        setSelected((prev) => prev || "");
      } catch {
        if (!cancelled) setLoadError("Could not load partners");
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_40px_rgba(0,0,0,0.14)] w-full max-w-md p-6 animate-fade-in-up">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
          Partner review
        </p>
        <h3 className="mt-2 text-lg font-semibold text-ink tracking-tight">
          Submit to partner
        </h3>
        <p className="mt-2 text-sm text-ink/60 leading-relaxed">
          Choose who should review and approve this preferred scenario. They
          will get an in-app notification.
        </p>

        <div className="mt-5">
          <label className="block text-[11px] font-semibold text-ink/60 mb-1.5">
            Partner
          </label>
          {loadingList ? (
            <div className="h-10 rounded-xl border border-border bg-field animate-pulse" />
          ) : loadError ? (
            <p className="text-xs text-red-600 dark:text-red-400">{loadError}</p>
          ) : approvers.length === 0 ? (
            <p className="text-xs text-ink/60 leading-relaxed">
              No partners or admins found for this firm. Assign the PARTNER
              role to a user in Settings, or submit as an admin to yourself.
            </p>
          ) : (
            <Select
              value={selected}
              onChange={setSelected}
              options={approvers.map((a) => ({
                value: a.id,
                label: a.displayName + (a.roles?.length ? ` · ${a.roles.join(", ")}` : ""),
              }))}
            />
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="cta"
            loading={loading}
            disabled={!selected || loadingList}
            onClick={() => onSubmit(selected)}
          >
            Submit for review
          </Button>
        </div>
      </div>
    </div>
  );
}
