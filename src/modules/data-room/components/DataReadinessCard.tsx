import React from "react";
import { HiShieldCheck, HiShieldExclamation, HiExclamation } from "react-icons/hi";
import { DataRoomSummary } from "../types";

interface DataReadinessCardProps {
  summary: DataRoomSummary | null;
}

export function DataReadinessCard({ summary }: DataReadinessCardProps) {
  if (!summary) return null;

  const level = summary.dataReadiness || "LOW";
  const matters = summary.totalPastMatters || 0;

  let badgeColor = "";
  let iconColor = "";
  let title = "";
  let description = "";
  let Icon = HiExclamation;
  let progressPct = 0;

  switch (level) {
    case "LOW":
      badgeColor = "bg-red-50 border-red-200 text-red-800";
      iconColor = "text-red-500";
      title = "Limited Data";
      description = "Less than 10 historical matters ingested. Pricing recommendations will be generic. Upload past matter data to improve accuracy.";
      Icon = HiShieldExclamation;
      progressPct = Math.min((matters / 10) * 100 * 0.2, 20); // Low tier takes first 20%
      break;
    case "MEDIUM":
      badgeColor = "bg-amber-50 border-amber-200 text-amber-800";
      iconColor = "text-amber-500";
      title = "Partially Ready";
      description = "10-50 historical matters ingested. Pricing recommendations are partially data-driven.";
      Icon = HiShieldExclamation;
      progressPct = 20 + Math.min(((matters - 10) / 40) * 100 * 0.5, 50); // Medium tier takes next 50%
      break;
    case "HIGH":
      badgeColor = "bg-hover border-border text-ink";
      iconColor = "text-ink/55";
      title = "Data Ready";
      description = "More than 50 historical matters ingested. Pricing recommendations are fully data-driven.";
      Icon = HiShieldCheck;
      progressPct = 70 + Math.min(((matters - 50) / 100) * 100 * 0.3, 30); // High tier fills up to 100%
      break;
  }

  return (
    <div className="bg-surface border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
      <div className="flex gap-4 items-start flex-1">
        <div className={`p-4 rounded-2xl ${badgeColor} border shrink-0`}>
          <Icon className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-ink leading-tight">Data Intelligence Status</span>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${badgeColor}`}>
              {title}
            </span>
          </div>
          <p className="text-[14px] text-ink/65 font-medium leading-relaxed max-w-xl">
            {description}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full md:w-64 shrink-0">
        <div className="flex items-center justify-between text-xs font-bold text-ink/40 uppercase tracking-wider">
          <span>Ingestion Goal</span>
          <span className="text-ink">{matters} / 50+ Matters</span>
        </div>
        
        {/* Modern Gauge bar */}
        <div className="h-3 w-full bg-canvas rounded-full overflow-hidden border border-border/50 p-[2px]">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
              level === "HIGH"
                ? "bg-gradient-to-r from-primary to-primary/70 shadow-black/5"
                : level === "MEDIUM"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 shadow-amber-500/25"
                : "bg-gradient-to-r from-red-400 to-red-500 shadow-red-500/25"
            }`}
            style={{ width: `${Math.max(progressPct, 4)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold text-ink/40 uppercase">
          <span>0 (Low)</span>
          <span>10 (Mid)</span>
          <span>50 (High)</span>
        </div>
      </div>
    </div>
  );
}
