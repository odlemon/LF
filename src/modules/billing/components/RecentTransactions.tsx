"use client";

import React, { useState, useEffect } from "react";
import { billingApi } from "@/lib/api/modules/billing.api";
import { TransactionTable } from "@/modules/billing/components/TransactionTable";
import { Pagination } from "@/components/ui/Pagination";
import type { CreditTransaction } from "@/modules/billing/types";

interface RecentTransactionsProps {
  pageSize?: number;
  title?: string;
  subtitle?: string;
}

export function RecentTransactions({
  pageSize = 10,
  title = "Recent transactions",
  subtitle = "Ledger",
}: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (targetPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await billingApi.getTransactions(targetPage, pageSize);
      setTransactions(data.content);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load recent transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  return (
    <div className="animate-fade-in-up">
      <div className="mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">{subtitle}</p>
        <h3 className="mt-1 text-base font-semibold tracking-tight text-ink">{title}</h3>
      </div>
      {error ? (
        <div className="rounded-[2rem] border border-border/60 bg-surface p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => void load(page)}
            className="mt-3 text-xs font-semibold text-ink/60 underline underline-offset-4 hover:text-ink py-1.5"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <TransactionTable
            transactions={transactions}
            loading={loading}
            onRefresh={() => void load(page)}
          />
          {!loading && transactions.length > 0 && (
            <div className="mt-2">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
