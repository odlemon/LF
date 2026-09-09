"use client";

import React, { useCallback, useEffect, useState } from "react";
import { meteringApi } from "@/lib/api/modules/metering.api";
import { PERMISSIONS, hasPermission } from "@/lib/utils/permissions";
import { useAuth } from "@/hooks/useAuth";
import { EntitlementBar } from "@/modules/billing/components/EntitlementBar";
import { UsageBreakdownTable } from "@/modules/billing/components/UsageBreakdownTable";
import { ContractFormModal } from "@/modules/billing/components/ContractFormModal";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import toast from "react-hot-toast";
import { Select } from "@/components/ui/Select";
import {
  HiOutlineChartBar,
  HiOutlineDocumentDownload,
  HiOutlineDownload,
  HiOutlinePencilAlt,
} from "react-icons/hi";
import type {
  AiDetailRow,
  BreakdownRow,
  ConsumptionSnapshot,
  FirmContract,
  LineItemRow,
} from "@/modules/billing/metering.types";

/** Last 6 months, newest first, as the yyyy-MM keys the backend groups by. */
function recentPeriods(count = 6): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export default function UsagePage() {
  const { user } = useAuth();
  const periods = recentPeriods();
  const [period, setPeriod] = useState(periods[0]);

  const [snapshot, setSnapshot] = useState<ConsumptionSnapshot | null>(null);
  const [byOffice, setByOffice] = useState<BreakdownRow[]>([]);
  const [byPractice, setByPractice] = useState<BreakdownRow[]>([]);
  const [byClient, setByClient] = useState<BreakdownRow[]>([]);
  const [byUser, setByUser] = useState<BreakdownRow[]>([]);
  const [aiDetail, setAiDetail] = useState<AiDetailRow[]>([]);
  const [lineItems, setLineItems] = useState<LineItemRow[]>([]);
  const [contract, setContract] = useState<FirmContract | null>(null);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canSeeUserDetail = user?.permissions
    ? hasPermission(user.permissions, PERMISSIONS.USAGE_USER_DETAIL_READ)
    : false;
  const canManageContract = user?.permissions
    ? hasPermission(user.permissions, PERMISSIONS.CONTRACT_MANAGE)
    : false;

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [snap, office, practice, client, ai, statement] = await Promise.all([
        meteringApi.getSummary(period),
        meteringApi.getByOffice(period),
        meteringApi.getByPracticeArea(period),
        meteringApi.getByClient(period),
        meteringApi.getAiDetail(period),
        meteringApi.getStatement(period),
      ]);
      setSnapshot(snap);
      setByOffice(office);
      setByPractice(practice);
      setByClient(client);
      setAiDetail(ai);
      setLineItems(statement.lineItems ?? []);
      // An uncontracted firm is a normal state, not an error — the API answers 204.
      try {
        setContract(await meteringApi.getContract());
      } catch {
        setContract(null);
      }

      // Per-person figures are separately permissioned; a 403 here must not blank the page.
      if (canSeeUserDetail) {
        try {
          setByUser(await meteringApi.getByUser(period));
        } catch {
          setByUser([]);
        }
      } else {
        setByUser([]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load usage data");
    } finally {
      setIsLoading(false);
    }
  }, [period, canSeeUserDetail]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = async () => {
    try {
      const csv = await meteringApi.getStatementCsv(period);
      save(new Blob([csv], { type: "text/csv;charset=utf-8" }), `lysp-usage-${period}.csv`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not export the statement");
    }
  };

  const downloadPdf = async () => {
    try {
      const pdf = await meteringApi.getStatementPdf(period);
      save(new Blob([pdf], { type: "application/pdf" }), `lysp-statement-${period}.pdf`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not render the statement");
    }
  };

  return (
    <div className="relative min-h-full pb-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(10,10,10,0.04), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-5 pt-8 sm:gap-7 sm:px-8 sm:pt-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-in-up">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">
              Consumption
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Usage &amp; Billing
            </h1>
            <p className="mt-2 max-w-lg text-sm text-ink/50">
              What your firm consumed this period, attributed to office, practice area and
              client. Figures come from recorded events, not estimates — AI token counts are
              the exact numbers the model provider returned.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Select
              className="w-44"
              value={period}
              onChange={setPeriod}
              options={periods.map((p) => ({ value: p, label: p }))}
              placeholder="Billing period"
            />
            <Button variant="secondary" onClick={downloadCsv}>
              <HiOutlineDownload className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="cta" onClick={downloadPdf}>
              <HiOutlineDocumentDownload className="h-4 w-4" />
              Statement PDF
            </Button>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-6">
            <div className="h-40 animate-pulse rounded-[1.5rem] bg-field/60" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-field/60" />
              ))}
            </div>
            <div className="h-72 animate-pulse rounded-[1.5rem] bg-field/60" />
          </div>
        ) : snapshot ? (
          <>
            <div className="rounded-[1.5rem] border border-border bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">
                    Contract
                  </p>
                  {contract ? (
                    <>
                      <p className="mt-2 text-lg font-semibold text-ink">
                        {contract.contractReference}
                      </p>
                      <p className="mt-1 text-sm text-ink/50">
                        {contract.contractType} · {contract.currency} ·{" "}
                        {contract.periodStart} to {contract.periodEnd}
                        {contract.renewalDate ? ` · renews ${contract.renewalDate}` : ""}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 max-w-md text-sm text-ink/50">
                      No contract recorded. Consumption is still metered in full — an
                      entitlement only changes what this page reports it against.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {contract && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        contract.billable
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-field text-ink/50"
                      }`}
                    >
                      {contract.billable ? "Billable" : "Not billable"}
                    </span>
                  )}
                  {canManageContract && (
                    <Button variant="secondary" onClick={() => setContractModalOpen(true)}>
                      <HiOutlinePencilAlt className="h-4 w-4" />
                      {contract ? "Update" : "Add contract"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <EntitlementBar
              consumed={snapshot.consumedCredits}
              entitlement={snapshot.creditEntitlement}
              usagePct={snapshot.usagePct}
              overage={snapshot.overageCredits}
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="AI calls" value={snapshot.aiCalls} />
              <StatCard
                label="Tokens in / out"
                value={`${snapshot.aiInputTokens.toLocaleString()} / ${snapshot.aiOutputTokens.toLocaleString()}`}
              />
              <StatCard
                label="Active seats"
                value={
                  snapshot.seatEntitlement
                    ? `${snapshot.activeSeats} / ${snapshot.seatEntitlement}`
                    : snapshot.activeSeats
                }
              />
              <StatCard label="Documents processed" value={snapshot.documentsProcessed} />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <UsageBreakdownTable
                title="By office"
                caption="Cost centre attribution for internal recharge."
                rows={byOffice}
              />
              <UsageBreakdownTable
                title="By practice area"
                caption="Which practices are actually using the platform."
                rows={byPractice}
              />
              <UsageBreakdownTable
                title="By client"
                caption="Consumption traceable to a client matter."
                rows={byClient}
              />
              {canSeeUserDetail ? (
                <UsageBreakdownTable
                  title="By user"
                  caption="Per-person figures. Restricted to admins holding USAGE_USER_DETAIL_READ."
                  rows={byUser}
                />
              ) : (
                <div className="rounded-[1.5rem] border border-border bg-surface p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">
                    By user
                  </p>
                  <p className="mt-4 text-sm text-ink/45">
                    Per-person usage is restricted. It needs the USAGE_USER_DETAIL_READ
                    permission, kept separate so firm-level reporting does not expose
                    individual lawyers&apos; activity by default.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-border bg-surface p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">
                AI detail
              </p>
              <p className="mt-1.5 text-xs text-ink/50">
                Exact provider-reported token counts per model and feature.
              </p>
              {aiDetail.length === 0 ? (
                <p className="mt-4 text-sm text-ink/45">No AI calls recorded this period.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs text-ink/45">
                        <th className="pb-2 font-medium">Provider</th>
                        <th className="pb-2 font-medium">Model</th>
                        <th className="pb-2 font-medium">Feature</th>
                        <th className="pb-2 text-right font-medium">Calls</th>
                        <th className="pb-2 text-right font-medium">In</th>
                        <th className="pb-2 text-right font-medium">Out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiDetail.map((row, i) => (
                        <tr
                          key={`${row.provider}-${row.model}-${row.feature}-${i}`}
                          className="border-b border-border/50 last:border-0"
                        >
                          <td className="py-2.5 text-ink">{row.provider}</td>
                          <td className="py-2.5 text-ink/70">{row.model}</td>
                          <td className="py-2.5 text-ink/70">{row.feature}</td>
                          <td className="py-2.5 text-right tabular-nums text-ink/70">
                            {row.calls.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right tabular-nums text-ink/70">
                            {row.inputTokens.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right tabular-nums text-ink/70">
                            {row.outputTokens.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-border bg-surface p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">
                Statement line items
              </p>
              <p className="mt-1.5 text-xs text-ink/50">
                Every metered event type for {period}. This is what the CSV export contains.
              </p>
              {lineItems.length === 0 ? (
                <p className="mt-4 text-sm text-ink/45">Nothing recorded this period.</p>
              ) : (
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
                      {lineItems.map((li, i) => (
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
              )}
            </div>
          </>
        ) : (
          <div className="mt-16">
            <EmptyState
              icon={<HiOutlineChartBar className="h-5.5 w-5.5" />}
              title="No usage recorded"
              description="Nothing has been metered for this period yet."
            />
          </div>
        )}
      </div>

      <ContractFormModal
        open={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        existing={contract}
        onSaved={(saved) => {
          setContract(saved);
          // Entitlement figures on this page derive from the contract, so reload them.
          void load();
        }}
      />
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
