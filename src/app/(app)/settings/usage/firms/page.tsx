"use client";

import React, { useCallback, useEffect, useState } from "react";
import { meteringApi } from "@/lib/api/modules/metering.api";
import { PERMISSIONS, hasPermission } from "@/lib/utils/permissions";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { HiOutlineDocumentDownload, HiOutlineOfficeBuilding } from "react-icons/hi";
import type { FirmUsageRow, Statement } from "@/modules/billing/metering.types";
import { Select } from "@/components/ui/Select";

function recentPeriods(count = 6): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

/**
 * Lysp staff surface: consumption across every firm for a period, used to raise invoices.
 * Gated on USAGE_CROSS_FIRM_READ — no firm admin holds it, so this never leaks one client's
 * consumption to another.
 */
export default function CrossFirmUsagePage() {
  const { user } = useAuth();
  const periods = recentPeriods();
  const [period, setPeriod] = useState(periods[0]);
  const [rows, setRows] = useState<FirmUsageRow[]>([]);
  const [selected, setSelected] = useState<Statement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allowed = user?.permissions
    ? hasPermission(user.permissions, PERMISSIONS.USAGE_CROSS_FIRM_READ)
    : false;

  const load = useCallback(async () => {
    if (!allowed) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      setRows(await meteringApi.getAllFirms(period));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load firm usage");
    } finally {
      setIsLoading(false);
    }
  }, [period, allowed]);

  useEffect(() => {
    void load();
  }, [load]);

  const openStatement = async (firmUid: string) => {
    try {
      setSelected(await meteringApi.getFirmStatement(firmUid, period));
    } catch {
      setSelected(null);
    }
  };

  const downloadPdf = async (firmUid: string) => {
    try {
      const pdf = await meteringApi.getFirmStatementPdf(firmUid, period);
      const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `lysp-statement-${firmUid}-${period}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not render the statement");
    }
  };

  if (!allowed) {
    return (
      <div className="mx-auto w-full max-w-[900px] px-5 pt-16 sm:px-8">
        <EmptyState
          icon={<HiOutlineOfficeBuilding className="h-5.5 w-5.5" />}
          title="Not available"
          description="Cross-firm usage is restricted to Lysp staff."
        />
      </div>
    );
  }

  const totals = rows.reduce(
    (acc, r) => ({
      credits: acc.credits + (r.consumedCredits ?? 0),
      overage: acc.overage + (r.overageCredits ?? 0),
      calls: acc.calls + (r.aiCalls ?? 0),
      seats: acc.seats + (r.activeSeats ?? 0),
    }),
    { credits: 0, overage: 0, calls: 0, seats: 0 },
  );

  return (
    <div className="relative min-h-full pb-16">
      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-5 pt-8 sm:gap-7 sm:px-8 sm:pt-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">
              Lysp staff
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Firm consumption
            </h1>
            <p className="mt-2 max-w-lg text-sm text-ink/50">
              Every firm&apos;s consumption for the period, ordered by credits used. Pilot and
              trial firms are shown but marked non-billable.
            </p>
          </div>
          <Select
            className="w-44 shrink-0"
            value={period}
            onChange={setPeriod}
            options={periods.map((p) => ({ value: p, label: p }))}
            placeholder="Billing period"
          />
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="h-72 animate-pulse rounded-[1.5rem] bg-field/60" />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<HiOutlineOfficeBuilding className="h-5.5 w-5.5" />}
            title="No consumption this period"
            description="No firm recorded any metered activity for this period."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="Firms active" value={rows.length} />
              <StatCard
                label="Credits consumed"
                value={totals.credits.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              />
              <StatCard
                label="Overage credits"
                value={totals.overage.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              />
              <StatCard label="Active seats" value={totals.seats} />
            </div>

            <div className="rounded-[1.5rem] border border-border bg-surface p-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-ink/45">
                      <th className="pb-2 font-medium">Firm</th>
                      <th className="pb-2 font-medium">Contract</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 text-right font-medium">Consumed</th>
                      <th className="pb-2 text-right font-medium">Entitlement</th>
                      <th className="pb-2 text-right font-medium">Overage</th>
                      <th className="pb-2 text-right font-medium">Seats</th>
                      <th className="pb-2 text-right font-medium">Billable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.firmUid}
                        onClick={() => void openStatement(r.firmUid)}
                        className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-field/50"
                      >
                        <td className="py-2.5 text-ink">{r.firmUid}</td>
                        <td className="py-2.5 text-ink/70">{r.contractReference}</td>
                        <td className="py-2.5 text-ink/70">{r.contractType}</td>
                        <td className="py-2.5 text-right tabular-nums text-ink">
                          {r.consumedCredits.toLocaleString(undefined, {
                            maximumFractionDigits: 3,
                          })}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-ink/70">
                          {r.entitlement?.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          }) ?? "—"}
                        </td>
                        <td
                          className={`py-2.5 text-right tabular-nums ${
                            r.overageCredits > 0 ? "text-red-600" : "text-ink/40"
                          }`}
                        >
                          {r.overageCredits > 0
                            ? r.overageCredits.toLocaleString(undefined, {
                                maximumFractionDigits: 3,
                              })
                            : "—"}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-ink/70">
                          {r.seatEntitlement
                            ? `${r.activeSeats} / ${r.seatEntitlement}`
                            : r.activeSeats}
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              r.billable
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-field text-ink/50"
                            }`}
                          >
                            {r.billable ? "Billable" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selected && (
              <div className="rounded-[1.5rem] border border-border bg-surface p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">
                      Statement
                    </p>
                    <p className="mt-1 text-lg font-semibold text-ink">
                      {selected.firmUid} · {selected.period}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => void downloadPdf(selected.firmUid)}
                    >
                      <HiOutlineDocumentDownload className="h-4 w-4" />
                      Statement PDF
                    </Button>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-sm text-ink/50 hover:text-ink py-1.5 -my-1.5"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[440px] text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-ink/45">
                        <th className="pb-2 font-medium">Event type</th>
                        <th className="pb-2 font-medium">Unit</th>
                        <th className="pb-2 text-right font-medium">Events</th>
                        <th className="pb-2 text-right font-medium">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.lineItems ?? []).map((li, i) => (
                        <tr
                          key={`${li.eventType}-${li.unit}-${i}`}
                          className="border-b border-border/50 last:border-0"
                        >
                          <td className="py-2.5 text-ink">{li.eventType}</td>
                          <td className="py-2.5 text-ink/70">{li.unit}</td>
                          <td className="py-2.5 text-right tabular-nums text-ink/70">
                            {li.events.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right tabular-nums text-ink/70">
                            {Number(li.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-ink">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
