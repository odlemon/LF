import React from "react";
import { MatterScope } from "../types";

interface ScopeConfidenceCardProps {
  scope: MatterScope;
  totalHours: number;
  phaseCount: number;
}

function ConfidenceRing({ pct }: { pct: number }) {
  const size = 56;
  const stroke = 3.5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  const tone =
    pct >= 80 ? "var(--color-ink)" : pct >= 60 ? "var(--color-warning)" : "var(--color-danger)";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold tabular-nums text-ink">
        {pct}
      </span>
    </div>
  );
}

export function ScopeConfidenceCard({
  scope,
  totalHours,
  phaseCount,
}: ScopeConfidenceCardProps) {
  const pct = Math.round(scope.aiConfidence ?? 0);

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-surface">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          background:
            "radial-gradient(120% 80% at 0% 0%, var(--color-hover), transparent 55%), radial-gradient(90% 70% at 100% 100%, var(--color-field), transparent 50%)",
        }}
      />
      <div className="relative p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
              Proposed engagement
            </p>
            <div className="mt-2 flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink tabular-nums">
                {totalHours > 0 ? Math.round(totalHours).toLocaleString() : "—"}
              </span>
              <span className="text-sm font-medium text-ink/40">hours</span>
            </div>
            <p className="mt-1.5 text-xs text-ink/45">
              {phaseCount} phase{phaseCount === 1 ? "" : "s"} structured across fee-earner levels
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ConfidenceRing pct={pct} />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/40">
              Confidence
            </span>
          </div>
        </div>

        {scope.aiReasoning && (
          <p className="mt-5 pt-4 border-t border-border/70 text-[13px] leading-relaxed text-ink/60">
            {scope.aiReasoning}
          </p>
        )}
      </div>
    </div>
  );
}
