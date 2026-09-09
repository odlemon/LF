"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { fieldClassName } from "@/components/ui/Input";
import { meteringApi } from "@/lib/api/modules/metering.api";
import toast from "react-hot-toast";
import type { FirmContract } from "@/modules/billing/metering.types";
import { Select } from "@/components/ui/Select";

interface Props {
  open: boolean;
  onClose: () => void;
  existing: FirmContract | null;
  onSaved: (contract: FirmContract) => void;
}

const CONTRACT_TYPES = ["COMMERCIAL", "PILOT", "TRIAL"] as const;
type ContractType = (typeof CONTRACT_TYPES)[number];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-ink/80">{label}</label>
      {children}
    </div>
  );
}

/**
 * Commercial terms only. There is deliberately no payment instrument here — Lysp raises
 * invoices outside the product, and this form exists so the entitlement a statement reports
 * against is the one actually agreed.
 */
export function ContractFormModal({ open, onClose, existing, onSaved }: Props) {
  const [form, setForm] = useState({
    contractReference: "",
    contractType: "COMMERCIAL" as ContractType,
    billable: true,
    currency: "GBP",
    periodStart: "",
    periodEnd: "",
    renewalDate: "",
    seatEntitlement: "",
    aiCreditEntitlement: "",
    storageEntitlementGb: "",
    hardCeilingMultiplier: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const year = new Date().getFullYear();
    setForm({
      contractReference: existing?.contractReference ?? "",
      contractType: (existing?.contractType as ContractType) ?? "COMMERCIAL",
      billable: existing?.billable ?? true,
      currency: existing?.currency ?? "GBP",
      periodStart: existing?.periodStart ?? `${year}-01-01`,
      periodEnd: existing?.periodEnd ?? `${year}-12-31`,
      renewalDate: existing?.renewalDate ?? "",
      seatEntitlement: existing?.seatEntitlement?.toString() ?? "",
      aiCreditEntitlement: existing?.aiCreditEntitlement?.toString() ?? "",
      storageEntitlementGb: existing?.storageEntitlementGb?.toString() ?? "",
      hardCeilingMultiplier: existing?.hardCeilingMultiplier?.toString() ?? "",
    });
  }, [open, existing]);

  const num = (v: string) => (v.trim() === "" ? null : Number(v));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contractReference.trim()) {
      toast.error("A contract reference is required");
      return;
    }
    if (form.periodEnd < form.periodStart) {
      toast.error("The contract period cannot end before it starts");
      return;
    }
    setSaving(true);
    try {
      const saved = await meteringApi.saveContract({
        contractReference: form.contractReference.trim(),
        contractType: form.contractType,
        billable: form.billable,
        currency: form.currency.trim() || "GBP",
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        renewalDate: form.renewalDate || null,
        seatEntitlement: num(form.seatEntitlement),
        aiCreditEntitlement: num(form.aiCreditEntitlement),
        storageEntitlementGb: num(form.storageEntitlementGb),
        hardCeilingMultiplier: num(form.hardCeilingMultiplier),
      });
      toast.success("Contract saved");
      onSaved(saved);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not save the contract");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={existing ? "Update contract" : "Add contract"} size="xl">
      <form onSubmit={submit} className="flex flex-col gap-4">
        {existing && (
          <p className="rounded-2xl border border-border bg-field/60 p-3 text-xs text-ink/60">
            Saving supersedes contract{" "}
            <span className="font-semibold">{existing.contractReference}</span> rather than
            editing it, so a period already invoiced keeps the terms it was billed on.
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Contract Reference">
            <input
              type="text"
              value={form.contractReference}
              onChange={(e) => setForm({ ...form, contractReference: e.target.value })}
              placeholder="e.g. LYSP-2026-ACME-001"
              className={fieldClassName}
              required
            />
          </Field>

          <Field label="Contract Type">
            <Select
              value={form.contractType}
              onChange={(value) =>
                setForm({
                  ...form,
                  contractType: value as ContractType,
                  // Pilots and trials are not invoiced; keep the flag honest by default.
                  billable: value === "COMMERCIAL",
                })
              }
              options={CONTRACT_TYPES.map((t) => ({ value: t, label: t }))}
            />
          </Field>

          <Field label="Period Start">
            <input
              type="date"
              value={form.periodStart}
              onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
              className={fieldClassName}
              required
            />
          </Field>

          <Field label="Period End">
            <input
              type="date"
              value={form.periodEnd}
              onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
              className={fieldClassName}
              required
            />
          </Field>

          <Field label="Renewal Date">
            <input
              type="date"
              value={form.renewalDate}
              onChange={(e) => setForm({ ...form, renewalDate: e.target.value })}
              className={fieldClassName}
            />
          </Field>

          <Field label="Currency">
            <input
              type="text"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
              placeholder="GBP"
              className={fieldClassName}
            />
          </Field>

          <Field label="Seat Entitlement">
            <input
              type="number"
              min={0}
              value={form.seatEntitlement}
              onChange={(e) => setForm({ ...form, seatEntitlement: e.target.value })}
              placeholder="e.g. 5000"
              className={fieldClassName}
            />
          </Field>

          <Field label="AI Credit Entitlement">
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.aiCreditEntitlement}
              onChange={(e) => setForm({ ...form, aiCreditEntitlement: e.target.value })}
              placeholder="e.g. 50000"
              className={fieldClassName}
            />
          </Field>

          <Field label="Storage Entitlement (GB)">
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.storageEntitlementGb}
              onChange={(e) => setForm({ ...form, storageEntitlementGb: e.target.value })}
              placeholder="optional"
              className={fieldClassName}
            />
          </Field>

          <Field label="Soft Ceiling Multiplier">
            <input
              type="number"
              min={1}
              step="0.1"
              value={form.hardCeilingMultiplier}
              onChange={(e) => setForm({ ...form, hardCeilingMultiplier: e.target.value })}
              placeholder="e.g. 1.5"
              className={fieldClassName}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.billable}
            onChange={(e) => setForm({ ...form, billable: e.target.checked })}
            className="h-4 w-4 rounded border-border"
          />
          Billable — include this firm when raising invoices
        </label>

        <p className="text-xs text-ink/45">
          Entitlements are reporting thresholds. Exceeding one is shown on the statement and
          never blocks anyone from working.
        </p>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="cta" disabled={saving}>
            {saving ? "Saving…" : "Save contract"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
