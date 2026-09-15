/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useApprovalMatrix } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ApprovalStageDefinition } from "@/modules/firm/types";
import toast from "react-hot-toast";
import {
  HiPlus,
  HiTrash,
  HiArrowUp,
  HiArrowDown,
  HiOutlineClipboardCheck,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";

// The only two permissions the backend actually gates a pricing-scenario approval stage on
// (see PricingPermissionRegistrar) — approverPermission is stored as this raw string.
const APPROVER_PERMISSION_OPTIONS = [
  {
    value: "SCENARIO_APPROVE",
    label: "Partner approval",
    description: "Held by Partners and Admins — clears a standard approval stage.",
  },
  {
    value: "SCENARIO_APPROVE_FINANCE",
    label: "Finance approval",
    description: "A separate grant — clears a dedicated finance review stage.",
  },
];

function permissionLabel(value: string) {
  return APPROVER_PERMISSION_OPTIONS.find((o) => o.value === value)?.label || value;
}

export default function ApprovalMatrixPage() {
  const { stages, isLoading, error, saveStages } = useApprovalMatrix();
  const [draft, setDraft] = useState<ApprovalStageDefinition[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (stages.length > 0) {
      setDraft(stages.map((s) => ({ ...s })));
    }
  }, [stages]);

  const updateStage = (index: number, patch: Partial<ApprovalStageDefinition>) => {
    setDraft((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addStage = () => {
    setDraft((prev) => [
      ...prev,
      {
        sequenceNo: prev.length + 1,
        stageName: "",
        approverPermission: "SCENARIO_APPROVE",
        triggerMinDiscountPct: null,
        triggerMinAmount: null,
      },
    ]);
  };

  const removeStage = (index: number) => {
    if (draft.length <= 1) {
      toast.error("At least one approval stage is required.");
      return;
    }
    setDraft((prev) => prev.filter((_, i) => i !== index));
  };

  const moveStage = (index: number, direction: -1 | 1) => {
    setDraft((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSave = async () => {
    if (draft.some((s) => !s.stageName.trim())) {
      toast.error("Every stage needs a name.");
      return;
    }
    setIsSaving(true);
    try {
      const reordered = draft.map((s, i) => ({ ...s, sequenceNo: i + 1 }));
      await saveStages(reordered);
      toast.success("Approval matrix saved.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save approval matrix.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-5 py-8 sm:px-8 max-w-[1400px] w-full mx-auto">
    <div className="mx-auto w-full max-w-6xl flex flex-col gap-8">
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-canvas">
          <HiOutlineShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Approval Matrix</h1>
          <p className="mt-1 max-w-xl text-sm text-ink/60">
            Configure the ordered stages a pricing scenario must clear before it is fully
            approved. A stage with a discount or amount trigger only engages when the scenario
            meets or exceeds it — otherwise every scenario passes through it.
          </p>
        </div>
      </div>

      {error && <Alert variant="error" message={error} />}

      {isLoading && draft.length === 0 ? (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-36 bg-field rounded-[2rem]" />
          <div className="h-36 bg-field rounded-[2rem]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              {draft.map((stage, index) => (
                <div key={index} className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-canvas shadow-sm">
                      {index + 1}
                    </div>
                    {index < draft.length - 1 && <div className="my-1 w-px flex-1 bg-border" />}
                  </div>

                  <div className="flex-1 pb-6">
                    <div className="rounded-[2rem] border border-border/60 bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-ink/60">
                            Stage name
                          </label>
                          <input
                            aria-label="Stage name"
                            type="text"
                            value={stage.stageName}
                            onChange={(e) => updateStage(index, { stageName: e.target.value })}
                            placeholder="e.g. Partner, Finance, Committee"
                            className="mt-1 w-full bg-transparent text-lg font-bold tracking-tight text-ink placeholder:text-ink/30 placeholder:font-semibold focus:outline-none"
                          />
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveStage(index, -1)}
                            disabled={index === 0}
                            className="p-2 text-ink/60 hover:text-ink hover:bg-hover rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Move up"
                          >
                            <HiArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStage(index, 1)}
                            disabled={index === draft.length - 1}
                            className="p-2 text-ink/60 hover:text-ink hover:bg-hover rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            aria-label="Move down"
                          >
                            <HiArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeStage(index)}
                            className="p-2 text-ink/60 hover:text-red-600 hover:bg-hover rounded-full transition-all dark:text-red-400"
                            aria-label="Remove stage"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-border/50 pt-5 sm:grid-cols-3">
                        <Select
                          label="Approver permission"
                          options={APPROVER_PERMISSION_OPTIONS}
                          value={stage.approverPermission}
                          onChange={(value) => updateStage(index, { approverPermission: value })}
                        />
                        <div className="flex flex-col gap-1.5">
                          <label className="pl-1 text-[10px] font-bold uppercase tracking-wider text-ink/60">
                            Trigger: min discount
                          </label>
                          <div className="relative">
                            <input
                              aria-label="Trigger: min discount %"
                              type="number"
                              value={stage.triggerMinDiscountPct ?? ""}
                              onChange={(e) =>
                                updateStage(index, {
                                  triggerMinDiscountPct:
                                    e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                              placeholder="Always applies"
                              className="w-full rounded-full border border-border bg-field px-4 py-2.5 pr-9 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-ink/50">
                              %
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="pl-1 text-[10px] font-bold uppercase tracking-wider text-ink/60">
                            Trigger: min amount
                          </label>
                          <div className="relative">
                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-ink/50">
                              $
                            </span>
                            <input
                              aria-label="Trigger: min amount"
                              type="number"
                              value={stage.triggerMinAmount ?? ""}
                              onChange={(e) =>
                                updateStage(index, {
                                  triggerMinAmount:
                                    e.target.value === "" ? null : Number(e.target.value),
                                })
                              }
                              placeholder="Always applies"
                              className="w-full rounded-full border border-border bg-field px-4 py-2.5 pl-7 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={addStage}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-ink/70 bg-field hover:bg-hover rounded-full border border-border/60 transition-all"
              >
                <HiPlus className="w-4 h-4" />
                Add Stage
              </button>
              <Button variant="primary" onClick={handleSave} loading={isSaving}>
                Save Matrix
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:sticky lg:top-6">
            <div className="rounded-[2rem] border border-border/60 bg-surface p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
                Preview
              </p>
              <h3 className="mt-1 text-base font-semibold text-ink tracking-tight">
                Approval flow
              </h3>
              <div className="mt-4 flex flex-col items-stretch gap-1.5">
                {draft.map((stage, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center gap-2.5 rounded-full border border-border/60 bg-field/60 px-3.5 py-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-canvas">
                        {index + 1}
                      </span>
                      <span className="truncate text-xs font-bold text-ink">
                        {stage.stageName || "Untitled stage"}
                      </span>
                      <span className="ml-auto shrink-0 text-[10px] font-semibold text-ink/50">
                        {permissionLabel(stage.approverPermission)}
                      </span>
                    </div>
                    {index < draft.length - 1 && (
                      <HiArrowDown className="mx-auto h-3.5 w-3.5 text-ink/30" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[2rem] border border-border bg-field/40 p-5">
              <HiOutlineClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-ink/50" />
              <p className="text-xs leading-relaxed text-ink/80">
                Every firm starts with a default two-stage matrix (Partner, then Finance) that
                matches the approval flow already shown on the pricing workspace. Reconfiguring
                is additive: existing scenarios already mid-approval are unaffected.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
