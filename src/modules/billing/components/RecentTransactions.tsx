"use client";

import React, { useState, useEffect } from "react";
import { billingApi } from "@/lib/api/modules/billing.api";
import { TransactionTable } from "@/modules/billing/components/TransactionTable";
import type { CreditTransaction } from "@/modules/billing/types";

interface RecentTransactionsProps {
  limit?: number;
  title?: string;
  subtitle?: string;
}

export function RecentTransactions({
  limit = 10,
  title = "Recent transactions",
  subtitle = "Ledger",
}: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await billingApi.getRecentTransactions(limit);
      setTransactions(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load recent transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [limit]);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">{subtitle}</p>
        <h3 className="mt-1 text-base font-semibold tracking-tight text-ink">{title}</h3>
      </div>
      {error ? (
        <div className="rounded-[1.5rem] border border-border/60 bg-surface p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={load}
            className="mt-3 text-xs font-semibold text-ink/60 underline underline-offset-4 hover:text-ink py-1.5"
          >
            Retry
          </button>
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          loading={loading}
          onRefresh={load}
        />
      )}
    </div>
  );
}
