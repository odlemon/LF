/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { usePracticeAreas } from "@/modules/firm/hooks/useFirm";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { PracticeAreaFormModal } from "@/modules/firm/components/PracticeAreaFormModal";
import { PracticeArea } from "@/modules/firm/types";
import toast from "react-hot-toast";
import { HiPlus, HiPencil, HiCheck, HiX, HiLockClosed, HiOutlineBriefcase } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";

const PAGE_SIZE = 10;

export default function PracticeAreasPage() {
  const { areas, isLoading, error, createArea, updateArea, deactivateArea } = usePracticeAreas();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<PracticeArea | null>(null);
  const [confirmDeactivateUid, setConfirmDeactivateUid] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(areas.length / PAGE_SIZE));
  const pageAreas = useMemo(
    () => areas.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [areas, page]
  );

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
          <p className="text-sm text-ink/60 mt-1">Define the types of legal work your firm handles.</p>
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

      {error && <Alert variant="error" message={error} />}

      <div className="bg-surface rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto rates-scrollable">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-field/60 text-xs font-bold text-ink/60 border-b border-border">
                <th className="px-6 py-4.5">Name</th>
                <th className="px-6 py-4.5">Code</th>
                <th className="px-6 py-4.5">Description</th>
                <th className="px-6 py-4.5">Status</th>
                <th className="px-6 py-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading && areas.length === 0 ? (
                <TableSkeleton columnWidths={["w-32", "w-16", "w-48", "w-16", "w-24"]} />
              ) : pageAreas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10">
                    <EmptyState
                      title="No practice areas registered"
                      description="Click 'Add Practice Area' to define the first type of legal work your firm handles."
                      icon={<HiOutlineBriefcase className="w-5 h-5" />}
                    />
                  </td>
                </tr>
              ) : (
                pageAreas.map((area) => (
                  <tr
                    key={area.uid}
                    className={`hover:bg-field/20 text-ink/90 transition-colors ${!area.active ? "opacity-60" : ""}`}
                  >
                    <td className="px-6 py-4.5 font-semibold text-ink">{area.name}</td>
                    <td className="px-6 py-4.5">
                      <Badge>{area.code}</Badge>
                    </td>
                    <td className="px-6 py-4.5 text-ink/60 text-xs max-w-xs">
                      <span className="line-clamp-2">{area.description || "No description provided."}</span>
                    </td>
                    <td className="px-6 py-4.5">
                      {area.active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="neutral">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleOpenEdit(area)}
                          className="p-2 text-ink/60 hover:text-ink hover:bg-hover rounded-full transition-all"
                          aria-label="Edit"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        {area.active ? (
                          confirmDeactivateUid === area.uid ? (
                            <div className="flex items-center gap-1 animate-fade-in">
                              <button
                                onClick={() => handleDeactivate(area.uid)}
                                aria-label="Confirm deactivation"
                                className="p-2 text-ink/70 hover:bg-hover rounded-full transition-colors"
                              >
                                <HiCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setConfirmDeactivateUid(null)}
                                aria-label="Cancel deactivation"
                                className="p-2 text-ink/60 hover:bg-field rounded-full transition-colors"
                              >
                                <HiX className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeactivateUid(area.uid)}
                              aria-label="Deactivate"
                              className="p-2 text-ink/60 hover:text-danger hover:bg-danger/10 rounded-full transition-all"
                            >
                              <HiX className="w-4 h-4" />
                            </button>
                          )
                        ) : (
                          <span className="p-2 text-ink/40" title="Locked">
                            <HiLockClosed className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && pageAreas.length > 0 && (
          <div className="px-6 pb-2 shrink-0">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <PracticeAreaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        practiceArea={editingArea}
      />
    </div>
  );
}
