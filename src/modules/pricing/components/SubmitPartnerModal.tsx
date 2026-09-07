"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import * as pricingApi from "../api";
import type { PricingApprover } from "../types";

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
        setSelected((prev) => prev || list[0]?.id || "");
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
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
          Partner review
        </p>
        <h3 className="mt-2 text-lg font-semibold text-ink tracking-tight">
          Submit to partner
        </h3>
        <p className="mt-2 text-sm text-ink/50 leading-relaxed">
          Choose who should review and approve this preferred scenario. They
          will get an in-app notification.
        </p>

        <div className="mt-5">
          <label className="block text-[11px] font-semibold text-ink/55 mb-1.5">
            Partner
          </label>
          {loadingList ? (
            <div className="h-10 rounded-xl border border-border bg-field animate-pulse" />
          ) : loadError ? (
            <p className="text-xs text-red-600">{loadError}</p>
          ) : approvers.length === 0 ? (
            <p className="text-xs text-ink/50 leading-relaxed">
              No partners or admins found for this firm. Assign the PARTNER
              role to a user in Settings, or submit as an admin to yourself.
            </p>
          ) : (
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-field px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/15"
            >
              {approvers.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.displayName}
                  {a.roles?.length ? ` · ${a.roles.join(", ")}` : ""}
                </option>
              ))}
            </select>
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
