"use client";

import { useId, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PracticePoint, StagePoint, TrendPoint } from "./demoData";

const INK = "#0a0a0a";
const MUTED = "rgba(10,10,10,0.35)";
const GRID = "rgba(10,10,10,0.06)";
const FIELD = "#f7f7f5";

type TipProps = {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  label?: string | number;
  formatter?: (entry: { name?: string; value?: number; dataKey?: string | number }) => string;
};

function ChartTooltip({ active, payload, label, formatter }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3.5 py-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60 mb-1.5">
        {label}
      </p>
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

export function FeesTrendChart({ data }: { data: TrendPoint[] }) {
  const gid = useId().replace(/:/g, "");
  const [focus, setFocus] = useState<"both" | "won" | "pipeline">("both");

  return (
    <div className="flex flex-col h-full min-h-[280px]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
            Commercial trend
          </p>
          <h3 className="mt-1 text-base font-semibold text-ink tracking-tight">
            Fees won vs active pipeline
          </h3>
        </div>
        <div className="flex rounded-full border border-border bg-field p-0.5 text-[11px] font-semibold">
          {(
            [
              ["both", "Both"],
              ["won", "Fees won"],
              ["pipeline", "Pipeline"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFocus(key)}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                focus === key
                  ? "bg-ink text-on-primary"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`won-${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={INK} stopOpacity={0.22} />
                <stop offset="100%" stopColor={INK} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={`pipe-${gid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={INK} stopOpacity={0.08} />
                <stop offset="100%" stopColor={INK} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
              width={42}
              tickFormatter={(v) => `£${v / 1000}k`}
            />
            <Tooltip
              content={(props) => (
                <ChartTooltip
                  {...props}
                  formatter={(e) => `£${Number(e.value ?? 0).toLocaleString()}k`}
                />
              )}
            />
            {(focus === "both" || focus === "pipeline") && (
              <Area
                type="monotone"
                dataKey="pipeline"
                name="Pipeline"
                stroke="rgba(10,10,10,0.28)"
                strokeWidth={2}
                fill={`url(#pipe-${gid})`}
                activeDot={{ r: 5, strokeWidth: 0, fill: INK }}
              />
            )}
            {(focus === "both" || focus === "won") && (
              <Area
                type="monotone"
                dataKey="feesWon"
                name="Fees won"
                stroke={INK}
                strokeWidth={2.5}
                fill={`url(#won-${gid})`}
                activeDot={{ r: 5, strokeWidth: 0, fill: INK }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-ink/60">Values in £000s · hover for detail</p>
    </div>
  );
}

export function MarginWinRateChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="flex flex-col h-full min-h-[280px]">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
          Quality
        </p>
        <h3 className="mt-1 text-base font-semibold text-ink tracking-tight">
          Margin & win rate
        </h3>
      </div>
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
              dy={8}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
              width={36}
              domain={[28, 40]}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
              width={36}
              domain={[60, 80]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={(props) => (
                <ChartTooltip
                  {...props}
                  formatter={(e) => `${Number(e.value ?? 0).toFixed(1)}%`}
                />
              )}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="marginPct"
              name="Avg margin"
              stroke={INK}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="winRate"
              name="Win rate"
              stroke="rgba(10,10,10,0.35)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: INK }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-4 text-[11px] text-ink/60 font-medium">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-ink rounded-full" /> Margin
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-ink/35 rounded-full border-t border-dashed" />{" "}
          Win rate
        </span>
      </div>
    </div>
  );
}

export function PipelineStagesChart({ data }: { data: StagePoint[] }) {
  return (
    <div className="flex flex-col h-full min-h-[260px]">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
          Firm workflow
        </p>
        <h3 className="mt-1 text-base font-semibold text-ink tracking-tight">
          Where matters sit now
        </h3>
      </div>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, left: 4, bottom: 0 }}
          >
            <CartesianGrid stroke={GRID} horizontal={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              type="category"
              dataKey="stage"
              axisLine={false}
              tickLine={false}
              width={88}
              tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(10,10,10,0.03)" }}
              content={(props) => (
                <ChartTooltip
                  {...props}
                  formatter={(e) =>
                    e.dataKey === "value"
                      ? `£${Number(e.value ?? 0).toLocaleString()}k`
                      : `${e.value} matters`
                  }
                />
              )}
            />
            <Bar
              dataKey="count"
              name="Matters"
              radius={[0, 6, 6, 0]}
              barSize={14}
              fill={INK}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === data.length - 1 ? INK : `rgba(10,10,10,${0.22 + i * 0.1})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PracticeMixChart({ data }: { data: PracticePoint[] }) {
  return (
    <div className="flex flex-col h-full min-h-[260px]">
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
          Practice mix
        </p>
        <h3 className="mt-1 text-base font-semibold text-ink tracking-tight">
          Won fees by practice
        </h3>
      </div>
      <div className="flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED, fontSize: 10, fontWeight: 600 }}
              interval={0}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: MUTED, fontSize: 11, fontWeight: 600 }}
              width={42}
              tickFormatter={(v) => `£${v / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: FIELD }}
              content={(props) => (
                <ChartTooltip
                  {...props}
                  formatter={(e) =>
                    e.dataKey === "fees"
                      ? `£${Number(e.value ?? 0).toLocaleString()}k`
                      : `${e.value} matters`
                  }
                />
              )}
            />
            <Bar
              dataKey="fees"
              name="Fees won"
              fill={INK}
              radius={[8, 8, 0, 0]}
              barSize={28}
              activeBar={{ fill: "rgba(10,10,10,0.75)" }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-ink/60">YTD accepted fees · hover a bar</p>
    </div>
  );
}
