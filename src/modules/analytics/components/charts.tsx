"use client";

import { useId } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyPoint, ModelShare, WinRateRow } from "../types";
import { formatMonth, formatPricingModel } from "../utils/format";

/** Monochrome ink palette — matches modules/dashboard/charts.tsx. */
const INK = "#0a0a0a";
const MUTED = "rgba(10,10,10,0.35)";
const GRID = "rgba(10,10,10,0.06)";
const FIELD = "#f7f7f5";

type TipProps = {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: string | number;
  formatter?: (entry: { name?: string; value?: number; dataKey?: string | number }) => string;
};

function ChartTooltip({ active, payload, label, formatter }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3.5 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
      {label != null && label !== "" && (
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60 mb-1.5">
          {label}
        </p>
      )}
      <ul className="space-y-1">
        {payload.map((entry, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-ink/80">
            <span
              className="h-1.5 w-1.5 rounded-full shrink-0"
              style={{ background: entry.color || INK }}
            />
            <span className="text-ink/60">{entry.name}</span>
            <span className="font-semibold tabular-nums ml-auto pl-3">
              {formatter
                ? formatter(entry)
                : typeof entry.value === "number"
                  ? entry.value.toLocaleString()
                  : entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">{eyebrow}</p>
      <h3 className="mt-1 text-base font-semibold text-ink tracking-tight">{title}</h3>
    </div>
  );
}

/** Monthly fees (bars) with average margin line overlaid. */
export function FeesMarginTrendChart({ data }: { data: MonthlyPoint[] }) {
  const gid = useId().replace(/:/g, "");
  const points = data.map((p) => ({
    ...p,
    label: formatMonth(p.month),
    feeTotalK: Number((p.feeTotal / 1000).toFixed(1)),
  }));

  return (
    <div className="flex flex-col h-full min-h-[280px]">
      <ChartHeader eyebrow="Monthly activity" title="Fees & margin trend" />
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`fees-${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={INK} stopOpacity={0.85} />
                <stop offset="100%" stopColor={INK} stopOpacity={0.55} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
              dy={8}
            />
            <YAxis
              yAxisId="fees"
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
              width={44}
              tickFormatter={(v) => `£${v}k`}
            />
            <YAxis
              yAxisId="margin"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
              width={36}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              cursor={{ fill: "rgba(10,10,10,0.03)" }}
              content={(props) => (
                <ChartTooltip
                  {...props}
                  payload={props.payload ? [...props.payload] : undefined}
                  formatter={(e) =>
                    e.dataKey === "feeTotalK"
                      ? `£${Number(e.value ?? 0).toLocaleString()}k`
                      : `${Number(e.value ?? 0).toFixed(1)}%`
                  }
                />
              )}
            />
            <Bar
              yAxisId="fees"
              dataKey="feeTotalK"
              name="Fees"
              fill={`url(#fees-${gid})`}
              radius={[6, 6, 0, 0]}
              barSize={22}
            />
            <Line
              yAxisId="margin"
              type="monotone"
              dataKey="avgMarginPct"
              name="Avg margin"
              stroke="rgba(10,10,10,0.45)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: INK }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-ink/60">Bars in £000s · dashed line = margin %</p>
    </div>
  );
}

/** Pricing-model distribution as horizontal bars. */
export function ModelDistributionChart({ data }: { data: ModelShare[] }) {
  const points = data
    .map((d) => ({ ...d, label: formatPricingModel(d.pricingModel), pctNum: Number(d.pct) }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col h-full min-h-[240px]">
      <ChartHeader eyebrow="Pricing mix" title="Pricing model distribution" />
      <div className="flex-1 w-full min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points} layout="vertical" margin={{ top: 0, right: 16, left: 4, bottom: 0 }}>
            <CartesianGrid stroke={GRID} horizontal={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              axisLine={false}
              tickLine={false}
              width={100}
              tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(10,10,10,0.03)" }}
              content={(props) => (
                <ChartTooltip
                  {...props}
                  payload={props.payload ? [...props.payload] : undefined}
                  formatter={(e) => `${e.value} matters`}
                />
              )}
            />
            <Bar dataKey="count" name="Matters" radius={[0, 6, 6, 0]} barSize={14} fill={INK}>
              {points.map((_, i) => (
                <Cell key={i} fill={`rgba(10,10,10,${Math.max(0.18, 0.9 - i * 0.18)})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Win rate by dimension value — horizontal bars with win/loss tooltip. */
export function WinRateBars({ data }: { data: WinRateRow[] }) {
  const points = data
    .map((d) => ({ ...d, winRateNum: Number(d.winRatePct) }))
    .sort((a, b) => b.winRateNum - a.winRateNum);

  return (
    <div className="w-full" style={{ minHeight: Math.max(140, points.length * 44) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={points} layout="vertical" margin={{ top: 0, right: 28, left: 4, bottom: 0 }}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="dimensionValue"
            axisLine={false}
            tickLine={false}
            width={120}
            tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(10,10,10,0.03)" }}
            content={(props) => {
              const { active, payload } = props;
              if (!active || !payload?.length) return null;
              const row = payload[0]?.payload as WinRateRow | undefined;
              return (
                <div className="rounded-xl border border-border bg-surface px-3.5 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60 mb-1.5">
                    {row?.dimensionValue}
                  </p>
                  <ul className="space-y-1 text-xs text-ink/80">
                    <li className="flex justify-between gap-6">
                      <span className="text-ink/60">Win rate</span>
                      <span className="font-semibold tabular-nums">{Number(row?.winRatePct ?? 0).toFixed(1)}%</span>
                    </li>
                    <li className="flex justify-between gap-6">
                      <span className="text-ink/60">Won / lost</span>
                      <span className="font-semibold tabular-nums">
                        {row?.wins ?? 0} / {row?.losses ?? 0}
                      </span>
                    </li>
                  </ul>
                </div>
              );
            }}
          />
          <Bar
            dataKey="winRateNum"
            name="Win rate"
            radius={[0, 6, 6, 0]}
            barSize={16}
            fill={INK}
            label={{ position: "right", fill: MUTED, fontSize: 11, fontWeight: 700, formatter: (v: unknown) => `${Number(v ?? 0).toFixed(0)}%` }}
          >
            {points.map((p, i) => (
              <Cell key={i} fill={p.winRateNum >= 50 ? INK : "rgba(10,10,10,0.35)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Small donut for a headline percentage (e.g. rate compliance). */
export function ComplianceDonut({ pct, size = 168 }: { pct: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, Number(pct) || 0));
  const data = [
    { name: "compliant", value: clamped },
    { name: "rest", value: 100 - clamped },
  ];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="72%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill={INK} />
            <Cell fill={FIELD} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums text-ink">{clamped.toFixed(0)}%</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink/60">compliant</span>
      </div>
    </div>
  );
}
