"use client";

import React from "react";
import type { BreakdownRow } from "@/modules/billing/metering.types";

interface Props {
  title: string;
  caption?: string;
  rows: BreakdownRow[];
  emptyMessage?: string;
}

export function UsageBreakdownTable({ title, caption, rows, emptyMessage }: Props) {
  const totalTokens = rows.reduce((sum, r) => sum + r.tokens, 0);

  return (
    <div className="rounded-[1.5rem] border border-border bg-surface p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">{title}</p>
      {caption && <p className="mt-1.5 text-xs text-ink/50">{caption}</p>}

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-ink/45">
          {emptyMessage ?? "Nothing recorded for this period yet."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[380px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-ink/45">
                <th className="pb-2 font-medium">Bucket</th>
                <th className="pb-2 text-right font-medium">Events</th>
                <th className="pb-2 text-right font-medium">AI tokens</th>
                <th className="pb-2 text-right font-medium">Share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const share = totalTokens > 0 ? (row.tokens / totalTokens) * 100 : 0;
                return (
                  <tr key={row.bucket} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 text-ink">{row.bucket}</td>
                    <td className="py-2.5 text-right tabular-nums text-ink/70">
                      {row.events.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-ink/70">
                      {row.tokens.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-ink/50">
                      {totalTokens > 0 ? `${share.toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
