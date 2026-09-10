"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { volumeDiscountApi } from "@/lib/api/modules/volumeDiscount.api";
import { listClients } from "@/lib/api/modules/firm.api";
import type {
  VolumeDiscountProgram,
  ClientSpendRecord,
  VolumeDiscountDashboard,
  AddSpendRecordCommand,
} from "@/modules/volume-discount/types";
import { AddSpendModal } from "@/modules/volume-discount/components/AddSpendModal";
import { PanelAgreementFormModal } from "@/modules/volume-discount/components/PanelAgreementFormModal";
import { SecondmentUsageModal } from "@/modules/volume-discount/components/SecondmentUsageModal";
import type { PanelAgreement, CreatePanelAgreementCommand } from "@/modules/volume-discount/types";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { HiOutlinePlus, HiOutlineCheckCircle, HiOutlineShieldCheck, HiOutlineClock } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";

export default function VolumeDiscountDetailPage() {
  const params = useParams();
  const uid = params.uid as string;

  const [program, setProgram] = useState<VolumeDiscountProgram | null>(null);
  const [dashboard, setDashboard] = useState<VolumeDiscountDashboard | null>(null);
  const [spendRecords, setSpendRecords] = useState<ClientSpendRecord[]>([]);
  const [clientName, setClientName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isAddSpendOpen, setIsAddSpendOpen] = useState(false);
  const [panel, setPanel] = useState<PanelAgreement | null>(null);
  const [isPanelFormOpen, setIsPanelFormOpen] = useState(false);
  const [isSecondmentOpen, setIsSecondmentOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function doLoad() {
      if (!uid) return;
      try {
        const [prog, dash, records] = await Promise.all([
          volumeDiscountApi.getProgram(uid),
          volumeDiscountApi.getDashboard(uid),
          volumeDiscountApi.listSpendRecords(uid).catch(() => [] as ClientSpendRecord[]),
        ]);
        if (!isActive) return;
        setProgram(prog);
        setDashboard(dash);
        setSpendRecords(records);
        volumeDiscountApi.getPanelAgreement(uid).then(setPanel).catch(() => setPanel(null));
        try {
          const clients = await listClients();
          if (isActive) {
            setClientName(clients.find((c) => c.uid === prog.clientProfileUid)?.name || null);
          }
        } catch {
          // client name is best-effort for display
        }
      } catch (err: any) {
        if (isActive) {
          setError(err.response?.data?.message || err.message || "Failed to load program");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void doLoad();
    return () => {
      isActive = false;
    };
  }, [uid]);

  const reload = async () => {
    try {
      const [prog, dash, records] = await Promise.all([
        volumeDiscountApi.getProgram(uid),
        volumeDiscountApi.getDashboard(uid),
        volumeDiscountApi.listSpendRecords(uid).catch(() => [] as ClientSpendRecord[]),
      ]);
      setProgram(prog);
      setDashboard(dash);
      setSpendRecords(records);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to reload program");
    }
  };

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      await volumeDiscountApi.activateProgram(uid);
      toast.success("Program activated.");
      await reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to activate");
    } finally {
      setIsActivating(false);
    }
  };

  const handleAddSpend = async (command: AddSpendRecordCommand) => {
    await volumeDiscountApi.addSpendRecord(uid, command);
    toast.success("Spend record added.");
    await reload();
  };

  const handleCreatePanelAgreement = async (command: CreatePanelAgreementCommand) => {
    const created = await volumeDiscountApi.createPanelAgreement(uid, command);
    setPanel(created);
    toast.success("Panel agreement added.");
  };

  const handleRecordSecondmentUsage = async (hours: number, matterUid?: string) => {
    const updated = await volumeDiscountApi.recordSecondmentUsage(uid, hours, matterUid);
    setPanel(updated);
    toast.success("Secondment usage recorded.");
  };

  // Newest upgrade first, and the total the firm still has to pay out.
  const crossings = [...(dashboard?.tierCrossings ?? [])].sort((a, b) =>
    b.occurredAt.localeCompare(a.occurredAt),
  );
  const creditsOwed = crossings
    .filter((c) => c.adjustmentStatus === "PENDING")
    .reduce((sum, c) => sum + c.retroactiveAdjustmentAmount, 0);

  const formatMoney = (value: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency,
      }).format(value);
    } catch {
      return `${currency} ${value.toFixed(2)}`;
    }
  };

  // Spend dates arrive as a plain date and need a time before they parse consistently;
  // a tier crossing arrives as a full timestamp and must not have one appended.
  const formatDate = (date: string) => {
    if (!date) return "—";
    const parsed = new Date(date.includes("T") ? date : date + "T00:00:00");
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-6">
        <div className="h-8 bg-field rounded-xl w-64 animate-pulse" />
        <div className="h-40 bg-field rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !program || !dashboard) {
    return (
      <div className="p-8 max-w-5xl w-full mx-auto">
        <Alert variant="error" message={error || "Program not found"} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-ink tracking-tight">Volume Discount Program</h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${
                program.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : program.status === "DRAFT"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-gray-50 text-gray-600 border-gray-200"
              }`}
            >
              {program.status}
            </span>
          </div>
          <p className="text-sm text-ink/60 mt-1">
            Client: {clientName || program.clientProfileUid} • {program.currency}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {program.status === "DRAFT" && (
            <Button
              variant="primary"
              onClick={handleActivate}
              disabled={isActivating}
              className="self-start sm:self-center"
            >
              <HiOutlineCheckCircle className="w-4 h-4" />
              {isActivating ? "Activating..." : "Activate Program"}
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => setIsAddSpendOpen(true)}
            className="self-start sm:self-center"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Add Spend
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border/70 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">Cumulative Spend</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
            {formatMoney(dashboard.cumulativeSpend, program.currency)}
          </p>
        </div>
        <div className="bg-surface border border-border/70 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">Current Tier</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
            {dashboard.currentTierName || "—"}
          </p>
          <p className="text-xs text-ink/60 mt-1">{dashboard.currentDiscountPct}% discount</p>
        </div>
        <div className="bg-surface border border-border/70 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">Next Tier</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
            {dashboard.nextTierName || "—"}
          </p>
          <p className="text-xs text-ink/60 mt-1">
            {dashboard.nextThreshold
              ? `${formatMoney(dashboard.nextThreshold, program.currency)} at ${dashboard.nextDiscountPct}%`
              : "Max tier reached"}
          </p>
        </div>
        <div className="bg-surface border border-border/70 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">Savings to Date</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
            {formatMoney(dashboard.savingsToDate, program.currency)}
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border/60 rounded-2xl p-6">
        <h2 className="text-xs font-bold text-ink/80 uppercase tracking-wider mb-2">Program Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">Period</p>
            <p className="text-ink mt-1">
              {formatDate(program.periodStart)} — {formatDate(program.periodEnd)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">Client</p>
            <p className="text-ink mt-1">{clientName || program.clientProfileUid}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border/60 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-ink/80 uppercase tracking-wider">Panel Agreement</h2>
          {!panel && (
            <Button variant="secondary" onClick={() => setIsPanelFormOpen(true)}>
              <HiOutlinePlus className="w-4 h-4" />
              Add Panel Agreement
            </Button>
          )}
        </div>
        {!panel ? (
          <p className="text-sm text-ink/60">
            No panel agreement on this programme yet. Add one to track renewal dates, MFN
            terms, and secondment credits.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">Agreement Period</p>
                <p className="text-sm text-ink mt-1">
                  {formatDate(panel.agreementPeriodStart)} — {formatDate(panel.agreementPeriodEnd)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">Renewal Date</p>
                <p className="text-sm text-ink mt-1">
                  {panel.renewalDate ? formatDate(panel.renewalDate) : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">MFN Status</p>
                <span
                  className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${
                    panel.mfnEnabled
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                  {panel.mfnEnabled ? "Enabled" : "Not enabled"}
                </span>
              </div>
            </div>

            <div className="bg-field/40 rounded-2xl border border-border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <HiOutlineClock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">
                    Secondment Credit
                  </p>
                  <p className="text-sm font-semibold text-ink mt-0.5">
                    {panel.secondmentCreditHoursUsed}h used of {panel.secondmentCreditHours}h
                    <span className="text-ink/60 font-normal">
                      {" "}
                      ({(panel.secondmentCreditHours - panel.secondmentCreditHoursUsed).toFixed(1)}h remaining)
                    </span>
                  </p>
                  <div className="mt-2 h-1.5 w-48 rounded-full bg-canvas overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (panel.secondmentCreditHoursUsed / Math.max(1, panel.secondmentCreditHours)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <Button variant="secondary" onClick={() => setIsSecondmentOpen(true)}>
                Record Usage
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-surface border border-border/60 rounded-2xl p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
          <h2 className="text-xs font-bold text-ink/80 uppercase tracking-wider">Tier Credits</h2>
          {creditsOwed > 0 && (
            <p className="text-xs text-ink/60">
              <span className="font-semibold text-ink tabular-nums">
                {formatMoney(creditsOwed, program.currency)}
              </span>{" "}
              still to be issued
            </p>
          )}
        </div>
        <p className="text-xs text-ink/60 mb-4 max-w-2xl">
          Each upgrade credits the client the difference between their new rate and their old one,
          across everything they had already spent. Work billed after an upgrade carries the new
          rate on the invoice, so it is not credited here.
        </p>
        {crossings.length === 0 ? (
          <p className="text-sm text-ink/60">
            No tier has been crossed yet, so no credit is owed.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-field/50 text-xs font-bold text-ink/60 border-b border-border">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Upgrade</th>
                  <th className="px-4 py-3">Spend at Upgrade</th>
                  <th className="px-4 py-3">Credit</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                {crossings.map((crossing) => (
                  <tr key={crossing.eventUid} className="text-ink">
                    <td className="px-4 py-3">{formatDate(crossing.occurredAt)}</td>
                    <td className="px-4 py-3">
                      {crossing.fromTierName ? `${crossing.fromTierName} → ` : ""}
                      <span className="font-semibold">{crossing.toTierName}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink/70">
                      {formatMoney(crossing.cumulativeSpendAtChange, program.currency)}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-semibold">
                      {formatMoney(crossing.retroactiveAdjustmentAmount, program.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-field text-ink/70 border border-border uppercase tracking-wider">
                        {crossing.adjustmentStatus || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-surface border border-border/60 rounded-2xl p-6">
        <h2 className="text-xs font-bold text-ink/80 uppercase tracking-wider mb-4">Recent Spend</h2>
        {spendRecords.length === 0 ? (
          <p className="text-sm text-ink/60">No spend records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-field/50 text-xs font-bold text-ink/60 border-b border-border">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                {spendRecords.slice(0, 20).map((record) => (
                  <tr key={record.uid} className="text-ink">
                    <td className="px-4 py-3">{formatDate(record.spendDate)}</td>
                    <td className="px-4 py-3">{record.invoiceReference || "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{formatMoney(record.amount, record.currency)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-field text-ink/70 border border-border uppercase tracking-wider">
                        {record.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddSpendModal
        isOpen={isAddSpendOpen}
        onClose={() => setIsAddSpendOpen(false)}
        onSave={handleAddSpend}
        defaultCurrency={program.currency}
      />

      <PanelAgreementFormModal
        isOpen={isPanelFormOpen}
        onClose={() => setIsPanelFormOpen(false)}
        onSave={handleCreatePanelAgreement}
      />

      <SecondmentUsageModal
        isOpen={isSecondmentOpen}
        onClose={() => setIsSecondmentOpen(false)}
        onSave={handleRecordSecondmentUsage}
        remainingHours={panel ? panel.secondmentCreditHours - panel.secondmentCreditHoursUsed : 0}
      />
    </div>
  );
}
