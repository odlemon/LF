"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { UsageSummaryRow } from "@/modules/billing/types";

const INK = "#0a0a0a";
const MUTED = "rgba(10,10,10,0.35)";
const GRID = "rgba(10,10,10,0.06)";

interface UsageChartProps {
  data: UsageSummaryRow[];
  loading?: boolean;
}

const FEATURE_COLORS: Record<string, string> = {
  PRICING: "#0a0a0a",
  NEGOTIATION: "rgba(10,10,10,0.75)",
  ANALYTICS: "rgba(10,10,10,0.55)",
  VOLUME_DISCOUNT: "rgba(10,10,10,0.4)",
  DATA_ROOM: "rgba(10,10,10,0.3)",
  INTAKE: "rgba(10,10,10,0.25)",
  OTHER: "rgba(10,10,10,0.2)",
};

export function UsageChart({ data, loading }: UsageChartProps) {
  const formatCredits = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="rounded-[1.5rem] border border-border/60 bg-surface p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="h-4 w-32 bg-field/80 rounded animate-pulse mb-1" />
        <div className="h-3 w-48 bg-field/80 rounded animate-pulse mb-6" />
        <div className="h-[260px] bg-field/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  const totalCredits = data.reduce((sum, row) => sum + row.totalCredits, 0);
  const maxVal = Math.max(...data.map((d) => d.totalCredits), 1);

  const chartData = data.map((row) => ({
    feature: row.feature.replace(/_/g, " "),
    credits: row.totalCredits,
    amount: row.totalAmount,
    pct: totalCredits > 0 ? (row.totalCredits / totalCredits) * 100 : 0,
  }));

  return (
    <div className="animate-fade-in-up rounded-[1.5rem] border border-border/60 bg-surface shadow-[0_1px_3px_rgba(0,0,0,0.03)]" style={{ animationDelay: "240ms" }}>
      <div className="p-5 sm:p-6 pb-0">
        <div className="mb-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">Consumption</p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-ink">Usage by feature</h3>
        </div>
        <p className="text-xs text-ink/50">
          {data.length === 0
            ? "No usage recorded in this period."
            : `${formatCredits(totalCredits)} credits consumed across ${data.length} feature${data.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center p-6">
          <p className="text-sm text-ink/35">Activity will appear here as features are used.</p>
        </div>
      ) : (
        <div className="p-5 sm:p-6 pt-2">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 12, left: 4, bottom: 0 }}>
                <CartesianGrid stroke={GRID} horizontal={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
                  tickFormatter={(v) => formatCredits(v as number)}
                />
                <YAxis
                  type="category"
                  dataKey="feature"
                  axisLine={false}
                  tickLine={false}
                  width={110}
                  tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(10,10,10,0.03)" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const entry = payload[0];
                    const row = chartData.find((d) => d.feature === label);
                    return (
                      <div className="rounded-xl border border-border bg-surface/95 backdrop-blur-sm px-3.5 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/40 mb-1.5">{label}</p>
                        <ul className="space-y-1">
                          <li className="flex items-center justify-between gap-4 text-xs text-ink/80">
                            <span className="text-ink/45">Credits</span>
                            <span className="font-semibold tabular-nums">{formatCredits(entry.value as number)}</span>
                          </li>
                          <li className="flex items-center justify-between gap-4 text-xs text-ink/80">
                            <span className="text-ink/45">Share</span>
                            <span className="font-semibold tabular-nums">{(row?.pct ?? 0).toFixed(1)}%</span>
                          </li>
                        </ul>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="credits" name="Credits" radius={[0, 6, 6, 0]} barSize={18}>
                  {chartData.map((entry, index) => {
                    const opacity = 0.35 + (entry.credits / maxVal) * 0.65;
                    return <Cell key={index} fill={FEATURE_COLORS[entry.feature] || `rgba(10,10,10,${opacity})`} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
