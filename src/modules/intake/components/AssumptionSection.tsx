"use client";

import React, { useState } from "react";
import { HiTrash, HiPlus } from "react-icons/hi";
import { ScopeAssumption, AssumptionType, CreateAssumptionCommand } from "../types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

interface AssumptionSectionProps {
  assumptions: ScopeAssumption[];
  readOnly?: boolean;
  onAdd: (command: CreateAssumptionCommand) => Promise<unknown>;
  onDelete: (assumptionUid: string) => Promise<unknown>;
}

const GROUP_CONFIG: Record<
  AssumptionType,
  { label: string; headerClass: string }
> = {
  INCLUDED: { label: "Included", headerClass: "text-green-700 bg-green-50" },
  EXCLUDED: { label: "Excluded", headerClass: "text-gray-600 bg-gray-50" },
  RISK: { label: "Risk", headerClass: "text-yellow-700 bg-yellow-50" },
};

const TYPE_ORDER: AssumptionType[] = ["INCLUDED", "EXCLUDED", "RISK"];

export function AssumptionSection({
  assumptions,
  readOnly = false,
  onAdd,
  onDelete,
}: AssumptionSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [type, setType] = useState<AssumptionType>("INCLUDED");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!description.trim()) return;
    setIsSubmitting(true);
    try {
      await onAdd({ description: description.trim(), type });
      setDescription("");
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <h4 className="text-sm font-bold text-gray-900 mb-3">Assumptions & Exclusions</h4>

      {TYPE_ORDER.map((assumptionType) => {
        const items = assumptions.filter((a) => a.type === assumptionType);
        if (items.length === 0 && !showForm) return null;
        const config = GROUP_CONFIG[assumptionType];

        return (
          <div key={assumptionType} className="mb-4">
            <div
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg mb-2 ${config.headerClass}`}
            >
              {config.label}
            </div>
            <ul className="space-y-1">
              {items.map((item) => (
                <li
                  key={item.uid}
                  className="group flex items-start gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span className="flex-1">{item.description}</span>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => onDelete(item.uid)}
                      className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 shrink-0"
                    >
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {!readOnly &&
        (showForm ? (
        <div className="mt-3 p-3 border border-gray-200 rounded-xl bg-gray-50/50 flex flex-col gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Assumption description"
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
          />
          <Select
            value={type}
            onChange={(v) => setType(v as AssumptionType)}
            options={[
              { value: "INCLUDED", label: "Included" },
              { value: "EXCLUDED", label: "Excluded" },
              { value: "RISK", label: "Risk" },
            ]}
          />
          <div className="flex gap-2">
            <Button type="button" variant="primary" onClick={handleAdd} loading={isSubmitting} className="!py-1.5 !px-4 text-xs">
              Save
            </Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)} className="!py-1.5 !px-4 text-xs">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-2"
        >
          <HiPlus className="w-3.5 h-3.5" />
          Add Assumption
        </button>
      ))}
    </div>
  );
}
