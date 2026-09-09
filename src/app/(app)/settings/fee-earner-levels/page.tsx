/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useFeeEarnerLevels } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import { FeeEarnerLevelFormModal } from "@/modules/firm/components/FeeEarnerLevelFormModal";
import type { FeeEarnerLevel } from "@/modules/firm/types";
import toast from "react-hot-toast";
import { HiPlus, HiScale } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";

export default function FeeEarnerLevelsPage() {
  const { levels, isLoading, error, createLevel, updateLevel } = useFeeEarnerLevels();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<FeeEarnerLevel | null>(null);

  const handleSave = async (data: { name: string; code: string; sortOrder: number; costRate: number | null }) => {
    try {
      if (editing) {
        await updateLevel(editing.uid, data);
        toast.success("Seniority level updated.");
      } else {
        await createLevel(data);
        toast.success("Seniority level added successfully.");
      }
      setIsModalOpen(false);
      setEditing(null);
    } catch (err: any) {
      throw err;
    }
  };

  const openEdit = (level: FeeEarnerLevel) => {
    setEditing(level);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 max-w-4xl w-full mx-auto flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Fee Earner Levels</h1>
          <p className="text-sm text-ink/55 mt-1">Configure seniority rankings and billing levels for lawyers in the firm.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="self-start sm:self-center"
        >
          <HiPlus className="w-4 h-4" />
          Add Level
        </Button>
      </div>

      {error && (
        <Alert variant="error" message={error} />
      )}

      {isLoading && levels.length === 0 ? (
        <div className="flex flex-col gap-3 animate-pulse">
          <div className="h-16 bg-field rounded-xl" />
          <div className="h-16 bg-field rounded-xl" />
          <div className="h-16 bg-field rounded-xl" />
        </div>
      ) : levels.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-2xl border border-border/60 p-8 shadow-sm flex flex-col items-center justify-center gap-3">
          <span className="text-sm text-ink/55">No levels registered yet. Click &apos;Add Level&apos; to define one.</span>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-border/60 overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100">
            {levels.map((level, idx) => (
              <div
                key={level.uid}
                className="p-5 flex items-center justify-between hover:bg-field/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {level.sortOrder}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink leading-tight">
                      {level.name}
                    </h3>
                    <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block mt-1">
                      Code: {level.code}
                      {level.costRate != null && (
                        <span className="ml-2 text-ink/45">· cost {level.costRate}/h</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Existing levels predate cost rates, so they need a way to acquire one -
                      otherwise margin stays an estimate on every firm already using Lysp. */}
                  <button
                    type="button"
                    onClick={() => openEdit(level)}
                    className="text-xs font-semibold text-ink/55 hover:text-ink transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <span className="text-xs text-ink/55 font-medium flex items-center gap-1.5 bg-field px-3 py-1.5 rounded-lg border border-border">
                    <HiScale className="w-3.5 h-3.5 text-ink/40" />
                    Rank #{idx + 1}
                  </span>
                  
                  {idx === 0 && (
                    <span className="text-[10px] font-bold text-ink/80 bg-hover px-2 py-0.5 rounded uppercase tracking-wide border border-border">
                      Highest Seniority
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <FeeEarnerLevelFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        feeEarnerLevel={editing}
      />
    </div>
  );
}
