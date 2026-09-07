"use client";

import React from "react";
import { HiCheck } from "react-icons/hi";
import {
  SCOPE_PROGRESS_STEPS,
  ScopeProgressStepId,
  stepIndex,
} from "../constants/scopeProgress";

interface ScopeBuildProgressProps {
  activeStep: ScopeProgressStepId;
  statusLabel?: string;
  onCollapse?: () => void;
}

export function ScopeBuildProgress({
  activeStep,
  statusLabel,
}: ScopeBuildProgressProps) {
  const activeIdx = stepIndex(activeStep);
  const stages = SCOPE_PROGRESS_STEPS.filter((s) => s.id !== "ready");

  return (
    <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(165deg, var(--color-surface) 0%, var(--color-field) 50%, var(--color-surface) 100%)",
        }}
      />

      <div className="relative flex-1 overflow-y-auto rates-scrollable px-6 py-8">
        <div className="max-w-md mx-auto">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ink animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
              Building scope
            </p>
          </div>
          <h2 className="text-xl font-semibold text-ink tracking-tight leading-tight">
            {statusLabel || SCOPE_PROGRESS_STEPS[Math.max(activeIdx, 0)]?.label}
          </h2>
          <p className="text-sm text-ink/45 leading-relaxed mb-8 mt-2">
            Assembling a partner-ready plan. You can keep chatting — new messages
            wait their turn.
          </p>

          <ol className="space-y-0">
            {stages.map((step, index) => {
              const done = index < activeIdx;
              const current =
                index === activeIdx || (activeIdx < 0 && index === 0);
              const upcoming = index > activeIdx && activeIdx >= 0;

              return (
                <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0">
                  {index < stages.length - 1 && (
                    <span
                      className={`absolute left-[13px] top-7 bottom-0 w-px ${
                        done ? "bg-ink/25" : "bg-border"
                      }`}
                      aria-hidden
                    />
                  )}
                  <span
                    className={`relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-colors ${
                      done
                        ? "border-ink bg-ink text-on-primary"
                        : current
                          ? "border-ink/40 bg-surface text-ink shadow-sm"
                          : "border-border bg-field text-ink/30"
                    }`}
                  >
                    {done ? (
                      <HiCheck className="h-3.5 w-3.5" />
                    ) : current ? (
                      <span className="h-2 w-2 rounded-full bg-ink animate-pulse" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p
                      className={`text-sm font-semibold tracking-tight ${
                        upcoming ? "text-ink/35" : "text-ink"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-xs mt-0.5 leading-relaxed ${
                        current ? "text-ink/55" : "text-ink/35"
                      }`}
                    >
                      {step.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
