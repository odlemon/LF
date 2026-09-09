"use client";

import React, { useState } from "react";
import { HiChevronDown, HiPlus, HiTrash } from "react-icons/hi";
import {
  MatterPhase,
  CreateTaskCommand,
  UpdatePhaseCommand,
  UpdateTaskCommand,
} from "../types";
import { FeeEarnerLevel, PracticeArea } from "@/modules/firm/types";
import { InlineEditField } from "./InlineEditField";
import { TaskRow } from "./TaskRow";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

interface PhaseSectionProps {
  phase: MatterPhase;
  index: number;
  isLast: boolean;
  feeEarnerLevels: FeeEarnerLevel[];
  practiceAreas?: PracticeArea[];
  readOnly?: boolean;
  onUpdatePhase: (phaseUid: string, command: UpdatePhaseCommand) => Promise<unknown>;
  onDeletePhase: (phaseUid: string) => Promise<unknown>;
  onAddTask: (phaseUid: string, command: CreateTaskCommand) => Promise<unknown>;
  onUpdateTask: (phaseUid: string, taskUid: string, command: UpdateTaskCommand) => Promise<unknown>;
  onDeleteTask: (phaseUid: string, taskUid: string) => Promise<unknown>;
}

export function PhaseSection({
  phase,
  index,
  isLast,
  feeEarnerLevels,
  practiceAreas = [],
  readOnly = false,
  onUpdatePhase,
  onDeletePhase,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: PhaseSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingPracticeArea, setEditingPracticeArea] = useState(false);
  const [isSavingPracticeArea, setIsSavingPracticeArea] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskLevelUid, setTaskLevelUid] = useState(feeEarnerLevels[0]?.uid ?? "");
  const [taskHours, setTaskHours] = useState("4");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const phaseHours = phase.tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const phaseNum = String(index + 1).padStart(2, "0");
  const practiceAreaName = practiceAreas.find((pa) => pa.uid === phase.practiceAreaUid)?.name;

  const handleSavePracticeArea = async (value: string) => {
    setIsSavingPracticeArea(true);
    try {
      if (!value) {
        await onUpdatePhase(phase.uid, { clearPracticeAreaUid: true });
      } else {
        await onUpdatePhase(phase.uid, { practiceAreaUid: value });
      }
      setEditingPracticeArea(false);
    } finally {
      setIsSavingPracticeArea(false);
    }
  };

  const handleAddTask = async () => {
    if (!taskDesc.trim() || !taskLevelUid || !phase.uid) return;
    setIsAddingTask(true);
    try {
      await onAddTask(phase.uid, {
        description: taskDesc.trim(),
        feeEarnerLevelUid: taskLevelUid,
        estimatedHours: parseFloat(taskHours) || 0,
      });
      setTaskDesc("");
      setTaskHours("4");
      setShowAddTask(false);
    } finally {
      setIsAddingTask(false);
    }
  };

  return (
    <div
      className="relative grid grid-cols-[28px_1fr] gap-x-3"
      style={{ animation: `scopeFadeIn 0.45s ease-out ${index * 0.06}s both` }}
    >
      {/* Timeline rail */}
      <div className="relative flex flex-col items-center pt-1">
        <div className="z-10 flex h-7 w-7 items-center justify-center rounded-full border border-ink/15 bg-surface text-[10px] font-bold tabular-nums text-ink/70 shadow-sm">
          {phaseNum}
        </div>
        {!isLast && (
          <div className="absolute top-8 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent" />
        )}
      </div>

      <div className={`min-w-0 ${isLast ? "pb-1" : "pb-6"}`}>
        <div className="group/phase rounded-2xl border border-border bg-surface/90 shadow-[0_1px_0_rgba(10,10,10,0.03)] overflow-hidden transition-shadow hover:shadow-[0_8px_28px_rgba(10,10,10,0.05)]">
          <div
            className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none"
            onClick={() => setExpanded(!expanded)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
          >
            <div
              className="flex-1 min-w-0"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/30 mb-0.5">
                Phase {index + 1}
              </p>
              <InlineEditField
                value={phase.name}
                onSave={(name) => onUpdatePhase(phase.uid, { name })}
                className="text-[15px] font-semibold text-ink tracking-tight"
                readOnly={readOnly}
              />
              {phase.description && (
                <p className="mt-1 text-xs text-ink/45 line-clamp-2">{phase.description}</p>
              )}

              {practiceAreas.length > 0 && (readOnly ? Boolean(practiceAreaName) : true) && (
                <div className="mt-1.5" onClick={(e) => e.stopPropagation()}>
                  {readOnly ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border bg-primary/5 border-primary/20 text-primary">
                      {practiceAreaName}
                    </span>
                  ) : editingPracticeArea ? (
                    <div className="flex items-center gap-1.5">
                      <Select
                        className="min-w-44"
                        value={phase.practiceAreaUid || ""}
                        disabled={isSavingPracticeArea}
                        placeholder="No practice area"
                        onChange={(value) => {
                          handleSavePracticeArea(value);
                          setEditingPracticeArea(false);
                        }}
                        options={[
                          { value: "", label: "No practice area" },
                          ...practiceAreas.map((pa) => ({ value: pa.uid, label: pa.name })),
                        ]}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingPracticeArea(true)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                        practiceAreaName
                          ? "bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                          : "bg-field border-border/60 text-ink/35 hover:text-ink/55"
                      }`}
                    >
                      {practiceAreaName || "Tag practice area"}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-2 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {phaseHours > 0 && (
                <div className="text-right mr-1">
                  <p className="text-sm font-semibold tabular-nums text-ink leading-none">
                    {Math.round(phaseHours)}
                  </p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-ink/35 mt-0.5">
                    hours
                  </p>
                </div>
              )}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => onDeletePhase(phase.uid)}
                  className="p-1.5 text-ink/20 hover:text-red-500 rounded-lg opacity-0 group-hover/phase:opacity-100 transition-all"
                  aria-label="Delete phase"
                >
                  <HiTrash className="w-3.5 h-3.5" />
                </button>
              )}
              <HiChevronDown
                className={`w-4 h-4 text-ink/30 transition-transform duration-200 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>

          {expanded && (
            <div className="border-t border-border/80">
              {phase.tasks.length === 0 && !showAddTask && (
                <p className="px-4 py-4 text-xs text-ink/40 italic">No tasks yet</p>
              )}
              {phase.tasks.map((task, taskIndex) => (
                <TaskRow
                  key={task.uid || `task-${taskIndex}`}
                  task={task}
                  phaseUid={phase.uid}
                  feeEarnerLevels={feeEarnerLevels}
                  readOnly={readOnly}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                />
              ))}

              {!readOnly &&
                (showAddTask ? (
                  <div className="p-4 bg-field/40 flex flex-col gap-2.5 border-t border-border/60">
                    <input
                      type="text"
                      value={taskDesc}
                      onChange={(e) => setTaskDesc(e.target.value)}
                      placeholder="Task description"
                      className="px-4 py-2.5 text-sm border border-border rounded-full bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Select
                          value={taskLevelUid}
                          onChange={setTaskLevelUid}
                          options={feeEarnerLevels.map((l) => ({
                            value: l.uid,
                            label: `${l.code} — ${l.name}`,
                          }))}
                        />
                      </div>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={taskHours}
                        onChange={(e) => setTaskHours(e.target.value)}
                        className="w-20 px-3 py-2 text-sm border border-border rounded-full bg-surface tabular-nums"
                        aria-label="Estimated hours"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handleAddTask}
                        loading={isAddingTask}
                        className="!py-1.5 !px-4 text-xs"
                      >
                        Save Task
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowAddTask(false)}
                        className="!py-1.5 !px-4 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddTask(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/40 hover:text-ink hover:bg-field/50 transition-colors"
                  >
                    <HiPlus className="w-3.5 h-3.5" />
                    Add Task
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
