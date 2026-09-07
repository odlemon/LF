"use client";

import React from "react";
import type { CreditAccount } from "@/modules/billing/types";
import { useCountUp } from "@/modules/billing/hooks/useCountUp";
import { HiTrendingUp, HiTrendingDown, HiOutlineReceiptRefund } from "react-icons/hi";

interface AccountOverviewProps {
  account: CreditAccount;
  onCreateAdjustment?: () => void;
  showAdjustButton?: boolean;
}

export function AccountOverview({ account, onCreateAdjustment, showAdjustButton }: AccountOverviewProps) {
  const formatCredits = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const animatedBalance = useCountUp({
    from: 0,
    to: account.balance,
    duration: 1400,
  });

  const usagePct = account.totalTopups > 0 ? Math.min((account.totalConsumed / account.totalTopups) * 100, 100) : 0;
  const remainingPct = 100 - usagePct;
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (remainingPct / 100) * circumference;

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
      {/* Hero balance card */}
      <div className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_40px_rgba(0,0,0,0.06)]">
        {/* Subtle gradient accent */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br from-ink/[0.04] to-transparent blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-tr from-ink/[0.02] to-transparent blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Balance */}
          <div className="flex items-center gap-6">
            {/* Donut chart */}
            <div className="relative hidden sm:block">
              <svg width="140" height="140" viewBox="0 0 140 140" className="transform -rotate-90">
                <circle
                  cx="70"
                  cy="70"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-field"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="text-ink transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/40">Remaining</span>
                <span className="text-lg font-semibold tabular-nums text-ink">{remainingPct.toFixed(0)}%</span>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink/35">Available credits</p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-5xl font-semibold tracking-tight text-ink tabular-nums sm:text-6xl">
                  {formatCredits(animatedBalance)}
                </span>
                <span className="text-sm font-medium text-ink/40">credits</span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-xs text-ink/45">
                <span>{formatCredits(account.totalConsumed)} consumed</span>
                <span className="h-1 w-1 rounded-full bg-ink/20" />
                <span>{formatCredits(account.totalTopups)} allocated</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {showAdjustButton && (
              <button
                onClick={onCreateAdjustment}
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-on-primary shadow-lg shadow-ink/10 transition-all hover:bg-primary-hover hover:shadow-xl hover:shadow-ink/15 cursor-pointer"
              >
                <HiOutlineReceiptRefund className="h-4 w-4 transition-transform group-hover:-rotate-12" />
                Adjust credits
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Secondary stat cards */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-ink/10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">Consumed</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
              <HiTrendingDown className="h-4 w-4" />
            </span>
          </div>
          <p className="relative mt-3 text-2xl font-semibold tracking-tight text-ink tabular-nums">
            {formatCredits(account.totalConsumed)}
          </p>
          <p className="relative mt-1 text-[11px] text-ink/40">credits used</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-ink/10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">Top-ups</p>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <HiTrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="relative mt-3 text-2xl font-semibold tracking-tight text-ink tabular-nums">
            {formatCredits(account.totalTopups)}
          </p>
          <p className="relative mt-1 text-[11px] text-ink/40">credits added</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-ink/10">
          <div className="absolute inset-0 bg-gradient-to-br from-ink/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">Unit price</p>
            <span className="text-[11px] font-semibold text-ink/35">per credit</span>
          </div>
          <p className="relative mt-3 text-2xl font-semibold tracking-tight text-ink tabular-nums">
            ${formatCredits(account.creditUnitPrice)}
          </p>
          <p className="relative mt-1 text-[11px] text-ink/40">USD rate</p>
        </div>
      </div>
    </div>
  );
}
