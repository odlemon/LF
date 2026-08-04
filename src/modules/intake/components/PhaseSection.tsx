"use client";

import React, { useState } from "react";
import { HiChevronDown, HiChevronUp, HiPencil, HiTrash, HiPlus } from "react-icons/hi";
import { MatterPhase, CreatePhaseCommand, CreateTaskCommand, UpdatePhaseCommand, UpdateTaskCommand } from "../types";
import { FeeEarnerLevel } from "@/modules/firm/types";
import { InlineEditField } from "./InlineEditField";
import { TaskRow } from "./TaskRow";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

interface PhaseSectionProps {
  phase: MatterPhase;
  index: number;
  feeEarnerLevels: FeeEarnerLevel[];
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
  feeEarnerLevels,
  readOnly = false,
  onUpdatePhase,
  onDeletePhase,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: PhaseSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskDesc, setTaskDesc] = useState("");
  const [taskLevelUid, setTaskLevelUid] = useState(feeEarnerLevels[0]?.uid ?? "");
  const [taskHours, setTaskHours] = useState("4");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const handleAddTask = async () => {
    if (!taskDesc.trim() || !taskLevelUid) return;
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
    <div className="mb-2">
      <div
        className="flex items-center justify-between p-3 bg-white border border-gray-200/50 rounded-xl cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
          <span className="text-xs font-bold text-gray-400 shrink-0">Phase {index + 1}</span>
          <InlineEditField
            value={phase.name}
            onSave={(name) => onUpdatePhase(phase.uid, { name })}
            className="text-sm font-bold text-gray-900 truncate"
            readOnly={readOnly}
          />
        </div>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {!readOnly && (
            <button
              type="button"
              onClick={() => onDeletePhase(phase.uid)}
              className="p-1.5 text-gray-400 hover:text-rose-500 rounded opacity-0 group-hover:opacity-100"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          )}
          {expanded ? (
            <HiChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <HiChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-1 border border-gray-100 rounded-xl overflow-hidden bg-white">
          {phase.tasks.map((task) => (
            <TaskRow
              key={task.uid}
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
            <div className="p-3 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-2">
              <input
                type="text"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Task description"
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    value={taskLevelUid}
                    onChange={setTaskLevelUid}
                    options={feeEarnerLevels.map((l) => ({ value: l.uid, label: `${l.code} — ${l.name}` }))}
                  />
                </div>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={taskHours}
                  onChange={(e) => setTaskHours(e.target.value)}
                  className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-full"
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="primary" onClick={handleAddTask} loading={isAddingTask} className="!py-1.5 !px-4 text-xs">
                  Save Task
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowAddTask(false)} className="!py-1.5 !px-4 text-xs">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddTask(true)}
              className="w-full flex items-center justify-center gap-1 py-2 text-xs font-bold text-primary hover:bg-primary/5 border-t border-gray-100"
            >
              <HiPlus className="w-3.5 h-3.5" />
              Add Task
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
