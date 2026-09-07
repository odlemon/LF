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
  { label: string; accent: string; dot: string }
> = {
  INCLUDED: {
    label: "Included",
    accent: "text-ink/70",
    dot: "bg-ink/50",
  },
  EXCLUDED: {
    label: "Excluded",
    accent: "text-ink/55",
    dot: "bg-ink/25",
  },
  RISK: {
    label: "Risk",
    accent: "text-amber-800 dark:text-amber-200",
    dot: "bg-amber-500",
  },
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

  const hasAny = assumptions.length > 0;

  return (
    <section className="mt-2 pt-8 border-t border-border">
      <div className="flex items-end justify-between gap-3 mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
            Boundaries
          </p>
          <h4 className="text-base font-semibold text-ink tracking-tight mt-1">
            Assumptions & exclusions
          </h4>
        </div>
      </div>

      {!hasAny && !showForm && (
        <p className="text-sm text-ink/40 mb-4">
          No assumptions recorded yet. Add inclusions, exclusions, or risks.
        </p>
      )}

      <div className="space-y-5">
        {TYPE_ORDER.map((assumptionType) => {
          const items = assumptions.filter((a) => a.type === assumptionType);
          if (items.length === 0) return null;
          const config = GROUP_CONFIG[assumptionType];

          return (
            <div key={assumptionType}>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.12em] mb-2.5 ${config.accent}`}
              >
                {config.label}
              </p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.uid}
                    className="group flex items-start gap-3 rounded-xl px-3 py-2 -mx-1 hover:bg-field/60 transition-colors"
                  >
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${config.dot}`}
                    />
                    <span className="flex-1 text-[13px] leading-relaxed text-ink/75">
                      {item.description}
                    </span>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => onDelete(item.uid)}
                        className="p-1 opacity-0 group-hover:opacity-100 text-ink/30 hover:text-rose-500 shrink-0 transition-opacity"
                        aria-label="Delete assumption"
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
      </div>

      {!readOnly &&
        (showForm ? (
          <div className="mt-5 p-4 border border-border rounded-2xl bg-field/30 flex flex-col gap-2.5">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Assumption description"
              className="px-4 py-2.5 text-sm border border-border rounded-full bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
              autoFocus
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
              <Button
                type="button"
                variant="primary"
                onClick={handleAdd}
                loading={isSubmitting}
                className="!py-1.5 !px-4 text-xs"
              >
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
                className="!py-1.5 !px-4 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/45 hover:text-ink transition-colors"
          >
            <HiPlus className="w-3.5 h-3.5" />
            Add Assumption
          </button>
        ))}
    </section>
  );
}
