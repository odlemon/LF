"use client";

import React from "react";
import type { CreditTransaction } from "@/modules/billing/types";
import { Button } from "@/components/ui/Button";
import { HiReceiptRefund, HiArrowUp, HiArrowDown } from "react-icons/hi";

interface TransactionTableProps {
  transactions: CreditTransaction[];
  loading?: boolean;
  onRefresh?: () => void;
}

export function TransactionTable({ transactions, loading, onRefresh }: TransactionTableProps) {
  if (loading) {
    return (
      <div className="rounded-[1.5rem] border border-border/60 bg-surface overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="border-b border-border/60 px-5 py-4 sm:px-6">
          <div className="h-4 w-32 bg-field/80 rounded animate-pulse" />
        </div>
        <div className="animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-field/50 border-b border-border/50 last:border-0" />
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-border/60 bg-surface p-10 text-center shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-field text-ink/20">
          <HiReceiptRefund className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-ink/50">No transactions yet</p>
        <p className="mt-1 text-xs text-ink/35">Activity will appear here as credits are used.</p>
      </div>
    );
  }

  const typeConfig = (type: string) => {
    switch (type) {
      case "TOPUP":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          ring: "ring-emerald-100",
          icon: HiArrowUp,
        };
      case "USAGE":
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          ring: "ring-amber-100",
          icon: HiArrowDown,
        };
      default:
        return {
          bg: "bg-field",
          text: "text-ink/70",
          ring: "ring-border",
          icon: HiReceiptRefund,
        };
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="animate-fade-in-up rounded-[1.5rem] border border-border/60 bg-surface overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]" style={{ animationDelay: "300ms" }}>
      {/* Table header */}
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
        <div>
          <h3 className="text-sm font-semibold text-ink">Transactions</h3>
          <p className="text-[11px] text-ink/40 mt-0.5">{transactions.length} record{transactions.length === 1 ? "" : "s"}</p>
        </div>
        {onRefresh && (
          <Button variant="secondary" onClick={onRefresh} className="text-xs py-1.5 px-3">
            Refresh
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-border/60 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
              <th className="px-5 py-3 font-medium sm:px-6">Date</th>
              <th className="px-3 py-3 font-medium sm:px-6">Type</th>
              <th className="px-3 py-3 font-medium sm:px-6">Description</th>
              <th className="px-3 py-3 font-medium text-right sm:px-6">Amount</th>
              <th className="px-3 py-3 font-medium text-right sm:px-6">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {transactions.map((tx, i) => {
              const config = typeConfig(tx.type);
              const Icon = config.icon;
              const isEven = i % 2 === 0;
              
              return (
                <tr
                  key={tx.uid}
                  className={`group transition-all duration-200 hover:bg-hover/60 ${
                    isEven ? "bg-surface" : "bg-field/30"
                  }`}
                >
                  <td className="px-5 py-3.5 text-xs font-medium text-ink/60 whitespace-nowrap sm:px-6">
                    {formatDate(tx.createdAt)}
                  </td>
                  <td className="px-3 py-3.5 sm:px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ring-1 ${config.bg} ${config.text} ${config.ring}`}
                    >
                      <Icon className="h-3 w-3" />
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-xs text-ink/70 max-w-[260px] truncate sm:px-6" title={tx.description}>
                    {tx.description}
                  </td>
                  <td className={`px-3 py-3.5 text-xs font-semibold tabular-nums text-right sm:px-6 ${
                    tx.type === "TOPUP" ? "text-emerald-700" : tx.type === "USAGE" ? "text-ink/80" : "text-ink/60"
                  }`}>
                    {tx.type === "TOPUP" ? "+" : tx.type === "USAGE" ? "−" : ""}
                    {Math.abs(tx.amount).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="ml-1 text-[10px] font-medium text-ink/30">cr</span>
                  </td>
                  <td className="px-3 py-3.5 text-xs font-semibold tabular-nums text-right text-ink/60 sm:px-6">
                    {tx.balanceAfter.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="ml-1 text-[10px] font-medium text-ink/30">cr</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
