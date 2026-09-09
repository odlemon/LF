/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { usePracticeAreas } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import { PracticeAreaFormModal } from "@/modules/firm/components/PracticeAreaFormModal";
import { PracticeArea } from "@/modules/firm/types";
import toast from "react-hot-toast";
import { HiPlus, HiPencil, HiCheck, HiX, HiLockClosed } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";

export default function PracticeAreasPage() {
  const { areas, isLoading, error, createArea, updateArea, deactivateArea } = usePracticeAreas();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<PracticeArea | null>(null);
  const [confirmDeactivateUid, setConfirmDeactivateUid] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingArea(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (area: PracticeArea) => {
    setEditingArea(area);
    setIsModalOpen(true);
  };

  const handleSave = async (data: { name: string; code: string; description?: string }) => {
    try {
      if (editingArea) {
        await updateArea(editingArea.uid, { name: data.name, description: data.description });
        toast.success("Practice area updated successfully.");
      } else {
        await createArea(data);
        toast.success("Practice area created successfully.");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeactivate = async (uid: string) => {
    try {
      await deactivateArea(uid);
      toast.success("Practice area deactivated.");
      setConfirmDeactivateUid(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate practice area.");
    }
  };

  return (
    <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Practice Areas</h1>
          <p className="text-sm text-ink/55 mt-1">Define the types of legal work your firm handles.</p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenAdd}
          className="self-start sm:self-center"
        >
          <HiPlus className="w-4 h-4" />
          Add Practice Area
        </Button>
      </div>

      {error && (
        <Alert variant="error" message={error} />
      )}

      {isLoading && areas.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="h-32 bg-field rounded-2xl" />
          <div className="h-32 bg-field rounded-2xl" />
        </div>
      ) : areas.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-2xl border border-border/60 p-8 shadow-sm flex flex-col items-center justify-center gap-3">
          <span className="text-sm text-ink/55">No practice areas registered yet. Click &apos;Add Practice Area&apos; to define one.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {areas.map((area) => (
            <div
              key={area.uid}
              className={`bg-surface p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md ${
                area.active
                  ? "border-border/60"
                  : "border-border bg-field/50 opacity-60"
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-ink leading-tight">
                      {area.name}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-canvas text-ink/80 uppercase">
                      {area.code}
                    </span>
                  </div>
                  <span>
                    {area.active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-hover text-ink/80 border border-border uppercase tracking-wide">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-canvas text-ink/55 border border-border uppercase tracking-wide">
                        Inactive
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-ink/55 leading-relaxed line-clamp-2">
                  {area.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 pt-3 border-t border-border">
                <button
                  onClick={() => handleOpenEdit(area)}
                  className="text-xs font-semibold text-ink/65 hover:text-primary flex items-center gap-1.5 transition-colors"
                >
                  <HiPencil className="w-3.5 h-3.5" />
                  Edit
                </button>

                {area.active ? (
                  confirmDeactivateUid === area.uid ? (
                    <div className="flex items-center gap-2 animate-fade-in">
                      <span className="text-xs font-medium text-red-600">Are you sure?</span>
                      <button
                        onClick={() => handleDeactivate(area.uid)}
                        className="p-1 text-ink/70 hover:bg-hover rounded transition-colors"
                      >
                        <HiCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeactivateUid(null)}
                        className="p-1 text-ink/40 hover:bg-field rounded transition-colors"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeactivateUid(area.uid)}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
                    >
                      Deactivate
                    </button>
                  )
                ) : (
                  <span className="text-xs text-ink/40 flex items-center gap-1">
                    <HiLockClosed className="w-3 h-3" />
                    Locked
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <PracticeAreaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        practiceArea={editingArea}
      />
    </div>
  );
}
