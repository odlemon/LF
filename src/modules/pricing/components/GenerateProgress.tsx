"use client";

import { useEffect, useRef } from "react";
import { HiCheck } from "react-icons/hi";
import {
  PRICING_PROGRESS_STEPS,
  PricingProgressStepId,
  pricingStepIndex,
  thinkingForTool,
} from "../constants/pricingProgress";

export interface GenerateToolStep {
  id: string;
  toolName: string;
  label: string;
  status: "running" | "success" | "failed";
  detail?: string;
}

interface GenerateProgressProps {
  activeStep: PricingProgressStepId;
  statusLabel?: string;
  toolSteps: GenerateToolStep[];
}

export function GenerateProgress({
  activeStep,
  statusLabel,
  toolSteps,
}: GenerateProgressProps) {
  const activeIdx = pricingStepIndex(activeStep);
  const activityRef = useRef<HTMLUListElement>(null);
  const stages = PRICING_PROGRESS_STEPS.filter((s) => s.id !== "ready");
  const running = toolSteps.find((s) => s.status === "running");
  const doneCount = toolSteps.filter((s) => s.status === "success").length;
  const currentStage = stages[Math.max(activeIdx, 0)];
  const headline =
    running?.label ||
    statusLabel ||
    currentStage?.label ||
    "Working…";

  useEffect(() => {
    const el = activityRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [toolSteps.length, running?.id]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden bg-canvas">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(10,10,10,0.05), transparent 55%)",
        }}
      />

      <div className="relative flex-1 flex flex-col min-h-0 max-w-xl w-full mx-auto px-6 py-8 sm:py-10">
        <header className="shrink-0 mb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60 mb-3">
            Generating scenarios
          </p>
          <h2
            key={headline}
            className="pricing-live-title text-2xl sm:text-[1.75rem] font-semibold tracking-tight text-ink leading-tight"
          >
            {headline}
          </h2>
          <p className="mt-2 text-sm text-ink/60 leading-relaxed max-w-md">
            Grounding fee options in locked scope, rates, and firm history.
          </p>
        </header>

        {/* Stage track with active shimmer */}
        <ol className="shrink-0 grid grid-cols-5 gap-1.5 mb-7">
          {stages.map((step, index) => {
            const done = index < activeIdx;
            const current =
              index === activeIdx || (activeIdx < 0 && index === 0);
            return (
              <li key={step.id} className="min-w-0">
                <div className="relative h-1 rounded-full overflow-hidden bg-ink/10">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
                      done
                        ? "w-full bg-ink/70"
                        : current
                          ? "w-full bg-ink pricing-stage-shimmer"
                          : "w-0 bg-ink"
                    }`}
                  />
                </div>
                <p
                  className={`mt-2 text-[10px] font-semibold leading-tight truncate transition-colors ${
                    current ? "text-ink" : done ? "text-ink/60" : "text-ink/60"
                  }`}
                >
                  {step.label.split(" ")[0]}
                </p>
              </li>
            );
          })}
        </ol>

        {/* Live current execution card */}
        <div className="shrink-0 relative overflow-hidden rounded-2xl border border-border/70 bg-surface mb-4">
          <div className="pricing-exec-sheen pointer-events-none absolute inset-0" />
          <div className="relative px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">
                  Now executing
                </p>
                <p
                  key={running?.id || currentStage?.id}
                  className="pricing-live-title mt-1.5 text-[15px] font-semibold text-ink tracking-tight"
                >
                  {running
                    ? running.label || thinkingForTool(running.toolName).running
                    : currentStage?.label}
                </p>
                <p className="mt-1 text-xs text-ink/60 leading-relaxed line-clamp-2">
                  {running
                    ? thinkingForTool(running.toolName).detail
                    : currentStage?.detail}
                </p>
              </div>
              <span className="text-xs tabular-nums text-ink/60 shrink-0 pt-0.5">
                {Math.min(activeIdx + 1, stages.length)}/{stages.length}
              </span>
            </div>

            <div className="mt-4 h-1 rounded-full bg-ink/[0.06] overflow-hidden">
              <div className="pricing-exec-bar h-full w-1/3 rounded-full bg-ink/80" />
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-[11px] text-ink/60">
              <span className="pricing-exec-dots inline-flex gap-0.5" aria-hidden>
                <span className="h-1 w-1 rounded-full bg-ink/50" />
                <span className="h-1 w-1 rounded-full bg-ink/50" />
                <span className="h-1 w-1 rounded-full bg-ink/50" />
              </span>
              <span>Working</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col rounded-2xl border border-border/70 bg-surface overflow-hidden">
          <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/60">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
              Activity
            </p>
            <p className="text-[11px] tabular-nums text-ink/60">
              {doneCount} complete
              {running ? " · in progress" : ""}
            </p>
          </div>

          {toolSteps.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-4 py-8 text-sm text-ink/60">
              Starting…
            </div>
          ) : (
            <ul
              ref={activityRef}
              className="flex-1 min-h-0 overflow-y-auto rates-scrollable px-2 py-2 space-y-0.5"
            >
              {toolSteps.map((step) => {
                const copy = thinkingForTool(step.toolName);
                const title =
                  step.status === "running"
                    ? step.label || copy.running
                    : step.status === "failed"
                      ? step.label
                      : copy.done;
                const isRunning = step.status === "running";
                return (
                  <li
                    key={step.id}
                    className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300 ${
                      isRunning
                        ? "bg-field pricing-activity-live"
                        : "hover:bg-field/40"
                    }`}
                  >
                    <span
                      className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        step.status === "success"
                          ? "bg-ink text-on-primary"
                          : step.status === "failed"
                            ? "border border-ink/25 text-ink/60"
                            : "border border-ink/25"
                      }`}
                    >
                      {step.status === "success" ? (
                        <HiCheck className="h-3 w-3 pricing-check-pop" />
                      ) : isRunning ? (
                        <span className="pricing-spinner h-3 w-3 rounded-full border-[1.5px] border-ink/20 border-t-ink" />
                      ) : (
                        <span className="h-1 w-1 rounded-full bg-ink/35" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[13px] tracking-tight truncate ${
                          isRunning
                            ? "font-semibold text-ink"
                            : "font-medium text-ink/60"
                        }`}
                      >
                        {title}
                      </p>
                      {step.status !== "failed" && (
                        <p className="text-[11px] text-ink/60 mt-0.5 truncate">
                          {step.detail || copy.detail}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
