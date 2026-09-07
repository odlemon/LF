"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { billingApi } from "@/lib/api/modules/billing.api";
import { PERMISSIONS, hasPermission } from "@/lib/utils/permissions";
import { useAuth } from "@/hooks/useAuth";
import { AccountOverview } from "@/modules/billing/components/AccountOverview";
import { UsageChart } from "@/modules/billing/components/UsageChart";
import { RecentTransactions } from "@/modules/billing/components/RecentTransactions";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import toast from "react-hot-toast";
import { HiOutlineReceiptRefund } from "react-icons/hi";

export default function BillingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [usageSummary, setUsageSummary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canAdjust = user?.permissions ? hasPermission(user.permissions, PERMISSIONS.BILLING_ADJUSTMENT_CREATE) : false;

  const getDefaultDateRange = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    const formatDate = (d: Date) => d.toISOString().split("T")[0];
    return { from: formatDate(from), to: formatDate(to) };
  };

  const load = useCallback(async () => {
    try {
      const { from, to } = getDefaultDateRange();
      const [accountData, txData, usageData] = await Promise.all([
        billingApi.getAccount(),
        billingApi.getTransactions(0, 50),
        billingApi.getUsageSummary(from, to),
      ]);
      setAccount(accountData);
      setTransactions(txData.content || txData);
      setUsageSummary(usageData);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load billing data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">Credit account</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Billing</h1>
            <p className="mt-2 text-sm text-ink/50 max-w-md">
              Monitor your credit balance, track feature usage, and manage top-ups.
            </p>
          </div>
          {canAdjust && (
            <Button variant="cta" onClick={() => router.push("/settings/billing/adjust")} className="shrink-0">
              <HiOutlineReceiptRefund className="h-4 w-4" />
              Adjust credits
            </Button>
          )}
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm font-medium text-red-600 animate-fade-in backdrop-blur-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col gap-6">
            <div className="h-48 bg-field/60 rounded-[1.75rem] animate-pulse" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-field/60 rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="h-[340px] bg-field/60 rounded-[1.5rem] animate-pulse" />
            <div className="h-72 bg-field/60 rounded-[1.5rem] animate-pulse" />
          </div>
        ) : account ? (
          <>
            <AccountOverview account={account} showAdjustButton={canAdjust} />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <section className="xl:col-span-5">
                <UsageChart data={usageSummary} loading={isLoading} />
              </section>

              <section className="xl:col-span-7">
                <RecentTransactions limit={10} />
              </section>
            </div>
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
      </div>
    </div>
  );
}
