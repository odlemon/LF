"use client";

import React, { useState } from "react";
import { HiPencil, HiTrash, HiCheck, HiX } from "react-icons/hi";
import { PhaseTask, UpdateTaskCommand } from "../types";
import { FeeEarnerLevel } from "@/modules/firm/types";
import { Select } from "@/components/ui/Select";

interface TaskRowProps {
  task: PhaseTask;
  phaseUid: string;
  feeEarnerLevels: FeeEarnerLevel[];
  readOnly?: boolean;
  onUpdate: (phaseUid: string, taskUid: string, command: UpdateTaskCommand) => Promise<unknown>;
  onDelete: (phaseUid: string, taskUid: string) => Promise<unknown>;
}

function levelTone(code: string): string {
  const c = code.toUpperCase();
  if (c.includes("PARTNER") || c.includes("EQ_")) {
    return "bg-ink text-on-primary border-ink";
  }
  if (c.includes("SR_") || c.includes("SENIOR")) {
    return "bg-ink/80 text-on-primary border-ink/80";
  }
  if (c.includes("ASSOC")) {
    return "bg-field text-ink/70 border-border";
  }
  return "bg-canvas text-ink/60 border-border";
}

export function TaskRow({
  task,
  phaseUid,
  feeEarnerLevels,
  readOnly = false,
  onUpdate,
  onDelete,
}: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(task.description);
  const [feeEarnerLevelUid, setFeeEarnerLevelUid] = useState(task.feeEarnerLevelUid);
  const [estimatedHours, setEstimatedHours] = useState(String(task.estimatedHours));
  const [isSaving, setIsSaving] = useState(false);

  const level = feeEarnerLevels.find((l) => l.uid === task.feeEarnerLevelUid);
  const levelCode = task.feeEarnerLevelCode ?? level?.code ?? "—";

  const save = async () => {
    setIsSaving(true);
    try {
      await onUpdate(phaseUid, task.uid, {
        description: description.trim(),
        feeEarnerLevelUid,
        estimatedHours: parseFloat(estimatedHours) || 0,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = () => {
    setDescription(task.description);
    setFeeEarnerLevelUid(task.feeEarnerLevelUid);
    setEstimatedHours(String(task.estimatedHours));
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2.5 px-4 py-3.5 border-b border-border/70 bg-field/35">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-2.5 text-sm border border-border rounded-2xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex gap-2 flex-wrap items-center">
          <div className="flex-1 min-w-[140px]">
            <Select
              value={feeEarnerLevelUid}
              onChange={setFeeEarnerLevelUid}
              options={feeEarnerLevels.map((l) => ({ value: l.uid, label: l.name }))}
            />
          </div>
          <input
            type="number"
            min={0}
            step={0.5}
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            className="w-20 px-3 py-2 text-sm border border-border rounded-full bg-surface tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-xs text-ink/45">hrs</span>
          <button
            type="button"
            onClick={save}
            disabled={isSaving}
            className="p-1.5 text-ink hover:bg-hover rounded-lg"
            aria-label="Save"
          >
            <HiCheck className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={isSaving}
            className="p-1.5 text-ink/40 hover:bg-canvas rounded-lg"
            aria-label="Cancel"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1.5 items-start px-4 py-3.5 hover:bg-field/40 transition-colors border-b border-border/60 last:border-b-0">
      <p className="text-[13px] leading-snug text-ink/85 pr-2">{task.description}</p>

      <div className="flex items-center gap-2 justify-end sm:contents">
        <span
          className={`inline-flex self-center px-2 py-0.5 text-[9px] font-bold tracking-wide rounded-md border uppercase ${levelTone(
            levelCode
          )}`}
        >
          {levelCode.replace(/_/g, " ")}
        </span>

        <div className="flex items-center gap-1.5 self-center justify-end min-w-[4.5rem]">
          <span className="text-[13px] font-semibold tabular-nums text-ink/70">
            {task.estimatedHours}
            <span className="text-[10px] font-medium text-ink/35 ml-0.5">h</span>
          </span>
          {!readOnly && (
            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 text-ink/30 hover:text-ink rounded"
                aria-label="Edit task"
              >
                <HiPencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(phaseUid, task.uid)}
                className="p-1 text-ink/30 hover:text-rose-500 rounded"
                aria-label="Delete task"
              >
                <HiTrash className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
