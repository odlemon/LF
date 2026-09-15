"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { billingApi } from "@/lib/api/modules/billing.api";
import { meteringApi } from "@/lib/api/modules/metering.api";
import { PERMISSIONS, hasPermission } from "@/lib/utils/permissions";
import { useAuth } from "@/hooks/useAuth";
import { AccountOverview } from "@/modules/billing/components/AccountOverview";
import { UsageChart } from "@/modules/billing/components/UsageChart";
import { RecentTransactions } from "@/modules/billing/components/RecentTransactions";
import { EntitlementBar } from "@/modules/billing/components/EntitlementBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import toast from "react-hot-toast";
import {
  HiOutlineReceiptRefund,
  HiOutlineDocumentText,
  HiOutlineDocumentDownload,
  HiOutlineDownload,
} from "react-icons/hi";
import type { ConsumptionSnapshot, FirmContract } from "@/modules/billing/metering.types";

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

type Tab = "overview" | "contract";

export default function BillingPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const canSeeBillingTab = user?.permissions
    ? hasPermission(user.permissions, PERMISSIONS.BILLING_ACCOUNT_READ)
    : false;
  const canSeeContractTab = user?.permissions
    ? hasPermission(user.permissions, PERMISSIONS.USAGE_READ)
    : false;

  const [activeTab, setActiveTab] = useState<Tab>(
    searchParams.get("tab") === "contract" ? "contract" : "overview"
  );

  // Once permissions resolve, if the current tab turns out not to be visible
  // to this user but the other one is, land on the one they can actually see.
  useEffect(() => {
    if (activeTab === "overview" && !canSeeBillingTab && canSeeContractTab) {
      setActiveTab("contract");
    } else if (activeTab === "contract" && !canSeeContractTab && canSeeBillingTab) {
      setActiveTab("overview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSeeBillingTab, canSeeContractTab]);

  // --- Overview (credit account) state ---
  const [account, setAccount] = useState<any>(null);
  const [chartUsageSummary, setChartUsageSummary] = useState<any[]>([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billingError, setBillingError] = useState<string | null>(null);

  const getDefaultDateRange = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    const formatDate = (d: Date) => d.toISOString().split("T")[0];
    return { from: formatDate(from), to: formatDate(to) };
  };

  const loadBilling = useCallback(async () => {
    try {
      const { from, to } = getDefaultDateRange();
      const [accountData, usageData] = await Promise.all([
        billingApi.getAccount(),
        billingApi.getUsageSummary(from, to),
      ]);
      setAccount(accountData);
      setChartUsageSummary(usageData);
      setBillingError(null);
    } catch (err: any) {
      setBillingError(err.response?.data?.message || err.message || "Failed to load billing data");
    } finally {
      setBillingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canSeeBillingTab) void loadBilling();
    else setBillingLoading(false);
  }, [loadBilling, canSeeBillingTab]);

  // --- Contract + current-period entitlement state ---
  const periods = recentPeriods();
  const [period, setPeriod] = useState(periods[0]);

  const [snapshot, setSnapshot] = useState<ConsumptionSnapshot | null>(null);
  const [contract, setContract] = useState<FirmContract | null>(null);
  const [contractLoading, setContractLoading] = useState(true);
  const [contractError, setContractError] = useState<string | null>(null);

  const loadContract = useCallback(async () => {
    setContractLoading(true);
    try {
      const snap = await meteringApi.getSummary(period);
      setSnapshot(snap);
      // An uncontracted firm is a normal state, not an error — the API answers 204.
      try {
        setContract(await meteringApi.getContract());
      } catch {
        setContract(null);
      }
      setContractError(null);
    } catch (err: any) {
      setContractError(err.response?.data?.message || err.message || "Failed to load contract data");
    } finally {
      setContractLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (canSeeContractTab) void loadContract();
    else setContractLoading(false);
  }, [loadContract, canSeeContractTab]);

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

  const showTabs = canSeeBillingTab && canSeeContractTab;
  const heading = "Billing";
  const eyebrow = showTabs || activeTab === "overview" ? "Credit account" : "Contract";
  const subtitle =
    activeTab === "overview"
      ? "Monitor your credit balance and track transaction history."
      : "Your commercial terms with Lysp, and the statement of consumption they're measured against.";

  return (
    <div className="relative min-h-full pb-16">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(10,10,10,0.04), transparent 60%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-5 pt-8 sm:gap-7 sm:px-8 sm:pt-10">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-in-up">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/60">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{heading}</h1>
            <p className="mt-2 max-w-lg text-sm text-ink/60">{subtitle}</p>
          </div>
          {activeTab === "contract" && canSeeContractTab && (
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
          )}
        </header>

        {showTabs && (
          <Tabs
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "contract", label: "Contract" },
            ]}
            activeId={activeTab}
            onChange={setActiveTab}
          />
        )}

        {!canSeeBillingTab && !canSeeContractTab && user && (
          <div className="mt-16">
            <EmptyState
              icon={<HiOutlineReceiptRefund className="w-5.5 h-5.5" />}
              title="No billing access"
              description="You don't hold a permission that grants billing or contract visibility."
            />
          </div>
        )}

        {activeTab === "overview" && canSeeBillingTab && (
          <>
            {billingError && (
              <div className="rounded-[2rem] border border-red-200 bg-red-50/80 p-4 text-sm font-medium text-red-700 animate-fade-in backdrop-blur-sm">
                {billingError}
              </div>
            )}

            {billingLoading ? (
              <div className="flex flex-col gap-6">
                <div className="h-48 bg-field/60 rounded-[2rem] animate-pulse" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-28 bg-field/60 rounded-[2rem] animate-pulse" />
                  ))}
                </div>
                <div className="h-[340px] bg-field/60 rounded-[2rem] animate-pulse" />
                <div className="h-72 bg-field/60 rounded-[2rem] animate-pulse" />
              </div>
            ) : account ? (
              <>
                <AccountOverview account={account} />

                <UsageChart data={chartUsageSummary} loading={billingLoading} />

                <RecentTransactions pageSize={10} />
              </>
            ) : (
              <div className="mt-16">
                <EmptyState
                  icon={<HiOutlineReceiptRefund className="w-5.5 h-5.5" />}
                  title="No billing data available"
                  description="Your firm credit account has not been activated yet."
                />
              </div>
            )}
          </>
        )}

        {activeTab === "contract" && canSeeContractTab && (
          <>
            {contractError && (
              <div className="rounded-[2rem] border border-red-200 bg-red-50/80 p-4 text-sm font-medium text-red-700">
                {contractError}
              </div>
            )}

            {contractLoading ? (
              <div className="flex flex-col gap-6">
                <div className="h-52 animate-pulse rounded-[2rem] bg-field/60" />
                <div className="h-40 animate-pulse rounded-[2rem] bg-field/60" />
              </div>
            ) : contract ? (
              <>
                <div className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4 p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-canvas">
                        <HiOutlineDocumentText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/60">
                          Contract reference
                        </p>
                        <p className="mt-1 text-xl font-semibold tracking-tight text-ink">
                          {contract.contractReference}
                        </p>
                      </div>
                    </div>
                    <Badge variant={contract.billable ? "success" : "neutral"}>
                      {contract.billable ? "Billable" : "Not billable"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border/60 p-6 sm:grid-cols-4">
                    <ContractField label="Type" value={contract.contractType} />
                    <ContractField label="Currency" value={contract.currency} />
                    <ContractField
                      label="Period"
                      value={`${contract.periodStart} – ${contract.periodEnd}`}
                    />
                    <ContractField
                      label="Renewal"
                      value={contract.renewalDate ?? "Not set"}
                    />
                    <ContractField
                      label="Seat entitlement"
                      value={contract.seatEntitlement != null ? contract.seatEntitlement.toLocaleString() : "Not set"}
                    />
                    <ContractField
                      label="AI credit entitlement"
                      value={
                        contract.aiCreditEntitlement != null
                          ? contract.aiCreditEntitlement.toLocaleString()
                          : "Not set"
                      }
                    />
                    <ContractField
                      label="Storage entitlement"
                      value={contract.storageEntitlementGb != null ? `${contract.storageEntitlementGb} GB` : "Not set"}
                    />
                    <ContractField
                      label="Soft ceiling"
                      value={contract.hardCeilingMultiplier != null ? `${contract.hardCeilingMultiplier}×` : "Not set"}
                    />
                  </div>
                </div>

                {snapshot && (
                  <EntitlementBar
                    consumed={snapshot.consumedCredits}
                    entitlement={snapshot.creditEntitlement}
                    usagePct={snapshot.usagePct}
                    overage={snapshot.overageCredits}
                  />
                )}
              </>
            ) : (
              <EmptyState
                icon={<HiOutlineDocumentText className="w-5.5 h-5.5" />}
                title="No contract recorded"
                description="Consumption is still metered in full — an entitlement only changes what this page reports it against. Contact Lysp to have a contract added."
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ContractField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">{label}</p>
      <p className="text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
