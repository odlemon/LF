"use client";

import React, { useState, useEffect } from "react";
import { HiPlus, HiChevronDoubleRight } from "react-icons/hi";
import {
  MatterScope,
  ChatMode,
  CreatePhaseCommand,
  CreateTaskCommand,
  UpdatePhaseCommand,
  UpdateTaskCommand,
  CreateAssumptionCommand,
} from "../types";
import { FeeEarnerLevel, PracticeArea } from "@/modules/firm/types";
import { ScopeConfidenceCard } from "./ScopeConfidenceCard";
import { PhaseSection } from "./PhaseSection";
import { AssumptionSection } from "./AssumptionSection";
import { ScopeBuildProgress } from "./ScopeBuildProgress";
import { Button } from "@/components/ui/Button";
import { ScopeProgressStepId } from "../constants/scopeProgress";

interface ScopePanelProps {
  scope: MatterScope | null;
  scopeGenerated: boolean;
  chatMode?: ChatMode;
  feeEarnerLevels: FeeEarnerLevel[];
  practiceAreas?: PracticeArea[];
  onCollapse?: () => void;
  /** Live build progress while Lysp is generating / editing scope */
  buildProgressStep?: ScopeProgressStepId | null;
  buildProgressLabel?: string | null;
  isBuilding?: boolean;
  onUpdatePhase: (phaseUid: string, command: UpdatePhaseCommand) => Promise<unknown>;
  onAddPhase: (command: CreatePhaseCommand) => Promise<unknown>;
  onDeletePhase: (phaseUid: string) => Promise<unknown>;
  onAddTask: (phaseUid: string, command: CreateTaskCommand) => Promise<unknown>;
  onUpdateTask: (phaseUid: string, taskUid: string, command: UpdateTaskCommand) => Promise<unknown>;
  onDeleteTask: (phaseUid: string, taskUid: string) => Promise<unknown>;
  onAddAssumption: (command: CreateAssumptionCommand) => Promise<unknown>;
  onDeleteAssumption: (assumptionUid: string) => Promise<unknown>;
}

export function ScopePanel({
  scope,
  scopeGenerated,
  chatMode,
  feeEarnerLevels,
  practiceAreas = [],
  onCollapse,
  buildProgressStep = null,
  buildProgressLabel = null,
  isBuilding = false,
  onUpdatePhase,
  onAddPhase,
  onDeletePhase,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddAssumption,
  onDeleteAssumption,
}: ScopePanelProps) {
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [phaseName, setPhaseName] = useState("");
  const [phaseDescription, setPhaseDescription] = useState("");
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);

  const readOnly = chatMode === "SCOPE_CONFIRMED";
  const hasPhases = Boolean(scope?.phases?.length);
  const showBuildProgress = isBuilding && !hasPhases;

  useEffect(() => {
    if (scope && hasPhases) {
      setJustUpdated(true);
      const timer = setTimeout(() => setJustUpdated(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [scope, hasPhases]);

  if (showBuildProgress) {
    return (
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        <div className="relative px-6 py-4 border-b border-border/60 shrink-0 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
              Matter scope
            </p>
            <p className="text-sm text-ink/50 mt-0.5">Building your plan…</p>
          </div>
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-ink/45 hover:text-ink hover:bg-hover border border-transparent hover:border-border transition-colors"
              aria-label="Collapse scope panel"
              title="Collapse scope"
            >
              <HiChevronDoubleRight className="w-4 h-4" />
              Hide
            </button>
          )}
        </div>
        <ScopeBuildProgress
          activeStep={buildProgressStep ?? "listening"}
          statusLabel={buildProgressLabel ?? undefined}
        />
      </div>
    );
  }

  if (!scopeGenerated || !scope || !hasPhases) {
    return (
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, var(--color-surface) 0%, var(--color-field) 50%, var(--color-surface) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply dark:opacity-[0.08] dark:mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative px-6 py-4 border-b border-border/60 shrink-0 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
              Matter scope
            </p>
            <p className="text-sm text-ink/50 mt-0.5">Waiting for a plan</p>
          </div>
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-ink/45 hover:text-ink hover:bg-hover border border-transparent hover:border-border transition-colors"
              aria-label="Collapse scope panel"
              title="Collapse scope"
            >
              <HiChevronDoubleRight className="w-4 h-4" />
              Hide
            </button>
          )}
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-full max-w-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35 mb-3">
              Matter scope
            </p>
            <h3 className="text-xl font-semibold text-ink tracking-tight">
              Your engagement plan
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink/45">
              Chat with Lysp about the matter. When you&apos;re ready, ask it to
              generate the scope — phases, hours, and assumptions will appear here.
            </p>

            <div className="mt-8 space-y-2.5 text-left">
              {[
                "Describe the deal or attach an RFP",
                "Ask for comparable past matters",
                "Say “generate the scope” when ready",
              ].map((step, i) => (
                <div
                  key={step}
                  className="flex items-center gap-3 rounded-2xl border border-border/80 bg-surface/80 px-4 py-3"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-on-primary tabular-nums">
                    {i + 1}
                  </span>
                  <span className="text-[13px] text-ink/70">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddPhase = async () => {
    if (!phaseName.trim()) return;
    setIsAddingPhase(true);
    try {
      await onAddPhase({
        name: phaseName.trim(),
        description: phaseDescription.trim() || undefined,
      });
      setPhaseName("");
      setPhaseDescription("");
      setShowAddPhase(false);
    } finally {
      setIsAddingPhase(false);
    }
  };

  const sortedPhases = [...scope.phases].sort((a, b) => a.sortOrder - b.sortOrder);
  const totalHours = sortedPhases.reduce(
    (sum, phase) =>
      sum +
      phase.tasks.reduce((taskSum, task) => taskSum + (task.estimatedHours || 0), 0),
    0
  );

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden min-h-0 relative transition-[box-shadow] duration-500 ${
        justUpdated ? "ring-1 ring-inset ring-ink/10" : ""
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "linear-gradient(165deg, var(--color-surface) 0%, var(--color-field) 48%, var(--color-surface) 100%)",
        }}
      />
      {/* subtle paper grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply dark:mix-blend-soft-light dark:opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative px-6 py-4 border-b border-border/60 shrink-0 flex items-center justify-between gap-3 backdrop-blur-[2px]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
            Matter scope
          </p>
          <p className="text-sm text-ink/55 mt-0.5">
            Review, refine, then confirm
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {readOnly && (
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/50 bg-surface/80 px-3 py-1.5 rounded-full border border-border">
              Locked
            </span>
          )}
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-ink/45 hover:text-ink hover:bg-hover border border-transparent hover:border-border transition-colors"
              aria-label="Collapse scope panel"
              title="Collapse scope"
            >
              <HiChevronDoubleRight className="w-4 h-4" />
              Hide
            </button>
          )}
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto rates-scrollable px-5 sm:px-6 py-6 min-h-0">
        <ScopeConfidenceCard
          scope={scope}
          totalHours={totalHours}
          phaseCount={sortedPhases.length}
        />

        <div className="mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35 mb-4">
            Work plan
          </p>
          {sortedPhases.map((phase, index) => (
            <PhaseSection
              key={phase.uid || `phase-${index}`}
              phase={phase}
              index={index}
              isLast={index === sortedPhases.length - 1}
              feeEarnerLevels={feeEarnerLevels}
              practiceAreas={practiceAreas}
              readOnly={readOnly}
              onUpdatePhase={onUpdatePhase}
              onDeletePhase={onDeletePhase}
              onAddTask={onAddTask}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>

        {!readOnly &&
          (showAddPhase ? (
            <div className="ml-10 mb-6 p-4 border border-border rounded-2xl bg-surface/90 flex flex-col gap-2.5 shadow-sm">
              <input
                type="text"
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                placeholder="Phase name"
                className="px-4 py-2.5 text-sm border border-border rounded-full bg-field focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              <input
                type="text"
                value={phaseDescription}
                onChange={(e) => setPhaseDescription(e.target.value)}
                placeholder="Description (optional)"
                className="px-4 py-2.5 text-sm border border-border rounded-full bg-field focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleAddPhase}
                  loading={isAddingPhase}
                  className="!py-1.5 !px-4 text-xs"
                >
                  Save Phase
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddPhase(false)}
                  className="!py-1.5 !px-4 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddPhase(true)}
              className="ml-10 mb-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/40 hover:text-ink transition-colors py-1.5"
            >
              <HiPlus className="w-3.5 h-3.5" />
              Add Phase
            </button>
          ))}

        <AssumptionSection
          assumptions={scope.assumptions}
          readOnly={readOnly}
          onAdd={onAddAssumption}
          onDelete={onDeleteAssumption}
        />
      </div>
    </div>
  );
}
