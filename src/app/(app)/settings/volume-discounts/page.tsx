"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { volumeDiscountApi } from "@/lib/api/modules/volumeDiscount.api";
import { listClients } from "@/lib/api/modules/firm.api";
import type { ClientProfile } from "@/modules/firm/types";
import type {
  VolumeDiscountProgram,
  VolumeDiscountDashboard,
  CreateVolumeDiscountProgramCommand,
} from "@/modules/volume-discount/types";
import { ProgramFormModal } from "@/modules/volume-discount/components/ProgramFormModal";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { HiPlus, HiOutlineTrendingDown, HiOutlineClock, HiCheckCircle } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";

export default function VolumeDiscountsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<VolumeDiscountProgram[]>([]);
  const [dashboards, setDashboards] = useState<Record<string, VolumeDiscountDashboard>>({});
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await volumeDiscountApi.listPrograms();
      setPrograms(data);
      const dashboardMap: Record<string, VolumeDiscountDashboard> = {};
      for (const p of data) {
        try {
          dashboardMap[p.uid] = await volumeDiscountApi.getDashboard(p.uid);
        } catch {
          // dashboard may fail for draft programs
        }
      }
      setDashboards(dashboardMap);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load programs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function doLoad() {
      await load();
      try {
        const clientData = await listClients();
        if (isActive) setClients(clientData);
      } catch {
        // client names are best-effort for display
      }
    }

    void doLoad();
    return () => {
      isActive = false;
    };
  }, [load]);

  const clientName = (uid: string) =>
    clients.find((c) => c.uid === uid)?.name || uid;

  const handleCreate = async (command: CreateVolumeDiscountProgramCommand) => {
    await volumeDiscountApi.createProgram(command);
    toast.success("Volume discount program created.");
    await load();
  };

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

  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const activePrograms = programs.filter((p) => p.status === "ACTIVE");
  const draftPrograms = programs.filter((p) => p.status === "DRAFT");

  return (
    <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Volume Discounts</h1>
          <p className="text-sm text-ink/55 mt-1">Manage tiered discount programs and client spend tracking.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          className="self-start sm:self-center"
        >
          <HiPlus className="w-4 h-4" />
          New Program
        </Button>
      </div>

      {error && (
        <Alert variant="error" message={error} />
      )}

      {isLoading ? (
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="h-40 bg-field rounded-2xl" />
          <div className="h-32 bg-field rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-surface border border-border/70 rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">Active Programs</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{activePrograms.length}</p>
            </div>
            <div className="bg-surface border border-border/70 rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">Draft Programs</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{draftPrograms.length}</p>
            </div>
            <div className="bg-surface border border-border/70 rounded-2xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">Total Savings Issued</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
                {formatMoney(
                  Object.values(dashboards).reduce((sum, d) => sum + d.savingsToDate, 0),
                  "GBP"
                )}
              </p>
            </div>
          </div>

          {activePrograms.length === 0 && draftPrograms.length === 0 ? (
            <div className="text-center py-16 bg-surface border border-border/60 rounded-2xl p-6">
              <HiOutlineTrendingDown className="w-10 h-10 text-ink/25 mx-auto mb-3" />
              <p className="text-sm text-ink/55">No volume discount programs yet.</p>
              <Button
                variant="primary"
                onClick={() => setIsCreateOpen(true)}
                className="mt-4"
              >
                <HiPlus className="w-4 h-4" />
                Create Program
              </Button>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-sm">
              <div className="overflow-x-auto rates-scrollable">
                <table className="w-full text-left text-sm border-collapse">

                  <thead>
                    <tr className="bg-field/50 text-xs font-bold text-ink/55 border-b border-border">
                      <th className="px-6 py-4">Client</th>
                      <th className="px-6 py-4">Period</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Cumulative Spend</th>
                      <th className="px-6 py-4">Current Tier</th>
                      <th className="px-6 py-4">Savings</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60">
                    {programs.map((program) => {
                      const dashboard = dashboards[program.uid];
                      return (
                        <tr key={program.uid} className="hover:bg-field/40 text-ink transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 text-ink/70 flex items-center justify-center shrink-0">
                                <HiOutlineTrendingDown className="w-4 h-4" />
                              </div>
                              <span className="font-semibold">{clientName(program.clientProfileUid)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-ink/70">
                            {formatDate(program.periodStart)} — {formatDate(program.periodEnd)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${
                                program.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : program.status === "DRAFT"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-gray-50 text-gray-600 border-gray-200"
                              }`}
                            >
                              {program.status === "ACTIVE" && <HiCheckCircle className="w-3 h-3 mr-1" />}
                              {program.status === "DRAFT" && <HiOutlineClock className="w-3 h-3 mr-1" />}
                              {program.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 tabular-nums font-medium">
                            {dashboard
                              ? formatMoney(dashboard.cumulativeSpend, program.currency)
                              : "—"}
                          </td>
                          <td className="px-6 py-4 text-xs text-ink/70">
                            {dashboard?.currentTierName || "—"}
                          </td>
                          <td className="px-6 py-4 tabular-nums text-emerald-700 font-medium">
                            {dashboard ? formatMoney(dashboard.savingsToDate, program.currency) : "—"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="secondary"
                              onClick={() => router.push(`/settings/volume-discounts/${program.uid}`)}
                              className="text-xs py-1.5 px-3"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <ProgramFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreate}
        clients={clients}
      />
    </div>
  );
}
