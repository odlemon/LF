import React from "react";
import { MatterScope } from "../types";

interface ScopeConfidenceCardProps {
  scope: MatterScope;
}

export function ScopeConfidenceCard({ scope }: ScopeConfidenceCardProps) {
  const pct = Math.round(scope.aiConfidence);
  const colorClass =
    pct >= 80 ? "text-emerald-600 border-emerald-200" : pct >= 60 ? "text-amber-600 border-amber-200" : "text-rose-600 border-rose-200";
  const bgClass =
    pct >= 80 ? "bg-emerald-50" : pct >= 60 ? "bg-amber-50" : "bg-rose-50";

  return (
    <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-200/50 flex items-center gap-3 shrink-0">
      <div
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 ${colorClass} ${bgClass}`}
      >
        {pct}%
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-900">Scope Confidence: {pct}%</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{scope.aiReasoning}</p>
      </div>
    </div>
  );
}
