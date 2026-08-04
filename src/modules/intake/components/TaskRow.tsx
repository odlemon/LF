"use client";

import React, { useState } from "react";
import { HiPencil, HiTrash, HiCheck, HiX } from "react-icons/hi";
import { PhaseTask } from "../types";
import { FeeEarnerLevel } from "@/modules/firm/types";
import { Select } from "@/components/ui/Select";
import { UpdateTaskCommand } from "../types";

interface TaskRowProps {
  task: PhaseTask;
  phaseUid: string;
  feeEarnerLevels: FeeEarnerLevel[];
  readOnly?: boolean;
  onUpdate: (phaseUid: string, taskUid: string, command: UpdateTaskCommand) => Promise<unknown>;
  onDelete: (phaseUid: string, taskUid: string) => Promise<unknown>;
}

const LEVEL_COLORS = [
  "bg-purple-50 text-purple-700 border-purple-100",
  "bg-blue-50 text-blue-700 border-blue-100",
  "bg-teal-50 text-teal-700 border-teal-100",
  "bg-gray-100 text-gray-700 border-gray-200",
];

function getLevelBadgeClass(code: string, index: number) {
  return LEVEL_COLORS[index % LEVEL_COLORS.length];
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
  const levelIndex = feeEarnerLevels.findIndex((l) => l.uid === task.feeEarnerLevelUid);
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
      <div className="flex flex-col gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex gap-2 flex-wrap">
          <div className="flex-1 min-w-[120px]">
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
            className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <span className="text-xs text-gray-500 self-center">hours</span>
        </div>
        <div className="flex gap-1">
          <button type="button" onClick={save} disabled={isSaving} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded">
            <HiCheck className="w-4 h-4" />
          </button>
          <button type="button" onClick={cancel} disabled={isSaving} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded">
            <HiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-3 px-4 py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
      <span className="flex-1 text-sm text-gray-800">{task.description}</span>
      <span
        className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase ${getLevelBadgeClass(levelCode, levelIndex)}`}
      >
        {levelCode}
      </span>
      <span className="text-xs font-semibold text-gray-500 shrink-0">{task.estimatedHours}h</span>
      {!readOnly && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-primary rounded"
          >
            <HiPencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(phaseUid, task.uid)}
            className="p-1 text-gray-400 hover:text-rose-500 rounded"
          >
            <HiTrash className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
