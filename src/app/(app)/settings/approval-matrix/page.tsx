/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useApprovalMatrix } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import { ApprovalStageDefinition } from "@/modules/firm/types";
import toast from "react-hot-toast";
import { HiPlus, HiTrash, HiArrowUp, HiArrowDown, HiOutlineClipboardCheck } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";

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
    <div className="p-8 max-w-4xl w-full mx-auto flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Approval Matrix</h1>
          <p className="text-sm text-ink/55 mt-1">
            Configure the ordered stages a pricing scenario must clear before it is fully
            approved. A stage with a discount or amount trigger only engages when the
            scenario meets or exceeds it — otherwise every scenario passes through it.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="error" message={error} />
      )}

      {isLoading && draft.length === 0 ? (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-24 bg-field rounded-2xl" />
          <div className="h-24 bg-field rounded-2xl" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {draft.map((stage, index) => (
              <div
                key={index}
                className="bg-surface rounded-2xl border border-border/60 shadow-sm p-5 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-ink/50 uppercase tracking-wider">
                        Stage name
                      </label>
                      <input
                        type="text"
                        value={stage.stageName}
                        onChange={(e) => updateStage(index, { stageName: e.target.value })}
                        placeholder="e.g. Partner, Finance, Committee"
                        className="px-4 py-1.5 bg-field border border-border rounded-full text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => moveStage(index, -1)}
                      disabled={index === 0}
                      className="p-2 text-ink/40 hover:text-ink hover:bg-hover rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label="Move up"
                    >
                      <HiArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStage(index, 1)}
                      disabled={index === draft.length - 1}
                      className="p-2 text-ink/40 hover:text-ink hover:bg-hover rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      aria-label="Move down"
                    >
                      <HiArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStage(index)}
                      className="p-2 text-ink/40 hover:text-red-600 hover:bg-hover rounded-full transition-all"
                      aria-label="Remove stage"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-ink/50 uppercase tracking-wider">
                      Approver permission
                    </label>
                    <input
                      type="text"
                      value={stage.approverPermission}
                      onChange={(e) => updateStage(index, { approverPermission: e.target.value })}
                      className="px-4 py-1.5 bg-field border border-border rounded-full text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-ink/50 uppercase tracking-wider">
                      Trigger: min discount %
                    </label>
                    <input
                      type="number"
                      value={stage.triggerMinDiscountPct ?? ""}
                      onChange={(e) =>
                        updateStage(index, {
                          triggerMinDiscountPct: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      placeholder="Always applies"
                      className="px-4 py-1.5 bg-field border border-border rounded-full text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-ink/50 uppercase tracking-wider">
                      Trigger: min amount
                    </label>
                    <input
                      type="number"
                      value={stage.triggerMinAmount ?? ""}
                      onChange={(e) =>
                        updateStage(index, {
                          triggerMinAmount: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      placeholder="Always applies"
                      className="px-4 py-1.5 bg-field border border-border rounded-full text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-primary"
                    />
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

          <div className="bg-field/40 border border-border rounded-2xl p-5 flex items-start gap-3">
            <HiOutlineClipboardCheck className="w-5 h-5 text-ink/40 shrink-0 mt-0.5" />
            <p className="text-xs text-ink/55 leading-relaxed">
              Every firm starts with a default two-stage matrix (Partner, then Finance) that
              matches the approval flow already shown on the pricing workspace. Reconfiguring
              is additive — existing scenarios already mid-approval are unaffected.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
