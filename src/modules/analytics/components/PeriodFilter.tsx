"use client";

import React from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import type { PeriodParams } from "../types";

/** Convert Date to "YYYY-MM-DD". */
function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function presetRange(preset: string): PeriodParams {
  const now = new Date();
  const to = toIsoDate(now);
  switch (preset) {
    case "LAST_90_DAYS": {
      const from = new Date(now);
      from.setDate(from.getDate() - 90);
      return { from: toIsoDate(from), to };
    }
    case "LAST_12_MONTHS": {
      const from = new Date(now);
      from.setFullYear(from.getFullYear() - 1);
      return { from: toIsoDate(from), to };
    }
    case "YTD": {
      return { from: `${now.getFullYear()}-01-01`, to };
    }
    case "PRIOR_YEAR": {
      const y = now.getFullYear() - 1;
      return { from: `${y}-01-01`, to: `${y}-12-31` };
    }
    default:
      return {};
  }
}

const PRESET_OPTIONS = [
  { value: "LAST_90_DAYS", label: "Last 90 days" },
  { value: "LAST_12_MONTHS", label: "Last 12 months" },
  { value: "YTD", label: "Year to date" },
  { value: "PRIOR_YEAR", label: "Prior calendar year" },
  { value: "CUSTOM", label: "Custom range" },
];

interface PeriodFilterProps {
  period: PeriodParams;
  onChange: (period: PeriodParams) => void;
  className?: string;
}

/**
 * Period control shared by all analytics pages: quick presets plus explicit
 * from/to DatePickers (custom range).
 */
export function PeriodFilter({ period, onChange, className = "" }: PeriodFilterProps) {
  const activePreset = PRESET_OPTIONS.find(
    (opt) =>
      opt.value !== "CUSTOM" &&
      JSON.stringify(presetRange(opt.value)) === JSON.stringify(period)
  );
  const presetValue = activePreset?.value ?? (period.from || period.to ? "CUSTOM" : "LAST_12_MONTHS");

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="w-40">
        <Select
          options={PRESET_OPTIONS}
          value={presetValue}
          onChange={(value) => {
            if (value === "CUSTOM") {
              onChange({});
            } else {
              onChange(presetRange(value));
            }
          }}
        />
      </div>
      <div className="w-36">
        <DatePicker
          value={period.from}
          onChange={(value) => onChange({ ...period, from: value || undefined })}
          placeholder="From"
        />
      </div>
      <span className="text-ink/40 text-xs">–</span>
      <div className="w-36">
        <DatePicker
          value={period.to}
          onChange={(value) => onChange({ ...period, to: value || undefined })}
          placeholder="To"
        />
      </div>
    </div>
  );
}

/** Default analytics period: last 12 months. */
export function defaultPeriod(): PeriodParams {
  return presetRange("LAST_12_MONTHS");
}
