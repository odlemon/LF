"use client";

import React, { useState, useEffect } from "react";
import { HiSparkles, HiPlus } from "react-icons/hi";
import {
  MatterScope,
  ChatMode,
  CreatePhaseCommand,
  CreateTaskCommand,
  UpdatePhaseCommand,
  UpdateTaskCommand,
  CreateAssumptionCommand,
} from "../types";
import { FeeEarnerLevel } from "@/modules/firm/types";
import { ScopeConfidenceCard } from "./ScopeConfidenceCard";
import { PhaseSection } from "./PhaseSection";
import { AssumptionSection } from "./AssumptionSection";
import { Button } from "@/components/ui/Button";

interface ScopePanelProps {
  scope: MatterScope | null;
  scopeGenerated: boolean;
  chatMode?: ChatMode;
  feeEarnerLevels: FeeEarnerLevel[];
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

  useEffect(() => {
    if (scope) {
      setJustUpdated(true);
      const timer = setTimeout(() => setJustUpdated(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [scope]);

  if (!scopeGenerated || !scope) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-0">
        <HiSparkles className="w-10 h-10 text-gray-300 mb-4" />
        <h3 className="text-base font-bold text-gray-700">Your scope will appear here</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-xs leading-relaxed">
          Chat with Lysp to scope this matter. You can describe the work, ask questions,
          or attach documents. When you&apos;re ready, ask Lysp to generate the scope.
        </p>
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

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden min-h-0 transition-all duration-300 ${
        justUpdated ? "ring-2 ring-primary/50" : ""
      }`}
    >
      <div className="flex-1 overflow-y-auto rates-scrollable p-4 min-h-0">
        <ScopeConfidenceCard scope={scope} />

        {sortedPhases.map((phase, index) => (
          <PhaseSection
            key={phase.uid}
            phase={phase}
            index={index}
            feeEarnerLevels={feeEarnerLevels}
            readOnly={readOnly}
            onUpdatePhase={onUpdatePhase}
            onDeletePhase={onDeletePhase}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        ))}

        {!readOnly &&
          (showAddPhase ? (
            <div className="p-3 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col gap-2 mb-4">
              <input
                type="text"
                value={phaseName}
                onChange={(e) => setPhaseName(e.target.value)}
                placeholder="Phase name"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
              />
              <input
                type="text"
                value={phaseDescription}
                onChange={(e) => setPhaseDescription(e.target.value)}
                placeholder="Description (optional)"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
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
              className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline mb-4"
            >
              <HiPlus className="w-4 h-4" />
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
