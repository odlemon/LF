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
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import { HiPlus, HiOutlineTrendingDown, HiOutlineClock, HiCheckCircle } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";

const PAGE_SIZE = 10;

export default function VolumeDiscountsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<VolumeDiscountProgram[]>([]);
  const [dashboards, setDashboards] = useState<Record<string, VolumeDiscountDashboard>>({});
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [clientsLoaded, setClientsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [page, setPage] = useState(0);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await volumeDiscountApi.listPrograms();
      setPrograms(data);
      setError(null);

      // Wait for the dashboards and client names together, and only then show the table -
      // rows that render immediately with dashes and fill in a moment later read as a glitch,
      // not as fast loading.
      const [dashboardResults, clientData] = await Promise.all([
        Promise.allSettled(data.map((p) => volumeDiscountApi.getDashboard(p.uid))),
        listClients().catch(() => [] as ClientProfile[]),
      ]);

      const dashboardMap: Record<string, VolumeDiscountDashboard> = {};
      dashboardResults.forEach((result, i) => {
        // A dashboard can legitimately fail for a draft programme; the row still belongs here.
        if (result.status === "fulfilled") dashboardMap[data[i].uid] = result.value;
      });
      setDashboards(dashboardMap);
      setClients(clientData);
      setClientsLoaded(true);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load programs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // The table renders before the client list has arrived. Until it does, show nothing rather
  // than the raw uid — an identifier on screen reads as a bug to the person using this.
  const clientName = (uid: string) => {
    const match = clients.find((c) => c.uid === uid)?.name;
    if (match) return match;
    return clientsLoaded ? uid : "—";
  };

  const handleCreate = async (command: CreateVolumeDiscountProgramCommand) => {
    await volumeDiscountApi.createProgram(command);
    toast.success("Volume discount program created.");
    await load();
  };

  const formatMoney = (value: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(value);
    } catch {
      return `${currency} ${value.toFixed(2)}`;
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "—";
    // Tolerate both a plain date and a full timestamp; appending a time to a timestamp
    // renders "Invalid Date".
    const parsed = new Date(date.includes("T") ? date : date + "T00:00:00");
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const activePrograms = programs.filter((p) => p.status === "ACTIVE");
  const draftPrograms = programs.filter((p) => p.status === "DRAFT");
  const totalPages = Math.max(1, Math.ceil(programs.length / PAGE_SIZE));
  const pagePrograms = programs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="px-5 py-8 sm:px-8 max-w-[1400px] w-full mx-auto flex flex-col gap-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Volume Discounts</h1>
          <p className="text-sm text-ink/60 mt-1">Manage tiered discount programs and client spend tracking.</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <div className="h-24 bg-field rounded-[2rem] animate-pulse" />
            <div className="h-24 bg-field rounded-[2rem] animate-pulse" />
            <div className="h-24 bg-field rounded-[2rem] animate-pulse" />
          </>
        ) : (
          <>
            <div className="bg-surface border border-border/70 rounded-[2rem] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">Active Programs</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{activePrograms.length}</p>
            </div>
            <div className="bg-surface border border-border/70 rounded-[2rem] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">Draft Programs</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{draftPrograms.length}</p>
            </div>
            <div className="bg-surface border border-border/70 rounded-[2rem] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">Total Savings Issued</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
                {formatMoney(
                  Object.values(dashboards).reduce((sum, d) => sum + d.savingsToDate, 0),
                  "USD"
                )}
              </p>
            </div>
          </>
        )}
      </div>

      {!isLoading && programs.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border/60 rounded-[2rem] p-6">
          <HiOutlineTrendingDown className="w-10 h-10 text-ink/60 mx-auto mb-3" />
          <p className="text-sm text-ink/60">No volume discount programs yet.</p>
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
        <div className="bg-surface rounded-[2rem] border border-border/60 overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto rates-scrollable">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-field/60 text-xs font-bold text-ink/60 border-b border-border">
                  <th className="px-6 py-4.5">Client</th>
                  <th className="px-6 py-4.5">Period</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5">Cumulative Spend</th>
                  <th className="px-6 py-4.5">Current Tier</th>
                  <th className="px-6 py-4.5">Savings</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <TableSkeleton columnWidths={["w-28", "w-32", "w-16", "w-20", "w-20", "w-20", "w-16"]} />
                ) : (
                  pagePrograms.map((program) => {
                    const dashboard = dashboards[program.uid];
                    return (
                      <tr key={program.uid} className="hover:bg-field/20 text-ink/90 transition-colors">
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-ink/70 flex items-center justify-center shrink-0">
                              <HiOutlineTrendingDown className="w-4 h-4" />
                            </div>
                            <span className="font-semibold">{clientName(program.clientProfileUid)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-xs font-medium text-ink/70">
                          {formatDate(program.periodStart)} – {formatDate(program.periodEnd)}
                        </td>
                        <td className="px-6 py-4.5">
                          <Badge
                            variant={
                              program.status === "ACTIVE"
                                ? "success"
                                : program.status === "DRAFT"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {program.status === "ACTIVE" && <HiCheckCircle className="w-3 h-3 mr-1" />}
                            {program.status === "DRAFT" && <HiOutlineClock className="w-3 h-3 mr-1" />}
                            {program.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4.5 tabular-nums font-medium">
                          {dashboard
                            ? formatMoney(dashboard.cumulativeSpend, program.currency)
                            : "—"}
                        </td>
                        <td className="px-6 py-4.5 text-xs text-ink/70">
                          {dashboard?.currentTierName || "—"}
                        </td>
                        <td className="px-6 py-4.5 tabular-nums text-emerald-700 font-medium dark:text-emerald-400">
                          {dashboard ? formatMoney(dashboard.savingsToDate, program.currency) : "—"}
                        </td>
                        <td className="px-6 py-4.5 text-right">
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
                  })
                )}
              </tbody>
            </table>
          </div>
          {!isLoading && pagePrograms.length > 0 && (
            <div className="px-6 pb-2 shrink-0">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
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
