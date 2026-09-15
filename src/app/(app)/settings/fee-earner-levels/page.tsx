/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { useFeeEarnerLevels } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeeEarnerLevelFormModal } from "@/modules/firm/components/FeeEarnerLevelFormModal";
import type { FeeEarnerLevel } from "@/modules/firm/types";
import toast from "react-hot-toast";
import { HiPlus, HiPencil, HiOutlineScale } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";

const PAGE_SIZE = 10;

export default function FeeEarnerLevelsPage() {
  const { levels, isLoading, error, createLevel, updateLevel } = useFeeEarnerLevels();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<FeeEarnerLevel | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(levels.length / PAGE_SIZE));
  const pageLevels = useMemo(
    () => levels.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [levels, page]
  );

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
          <p className="text-sm text-ink/60 mt-1">Configure seniority rankings and billing levels for lawyers in the firm.</p>
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

      {error && <Alert variant="error" message={error} />}

      <div className="bg-surface rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto rates-scrollable">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-field/60 text-xs font-bold text-ink/60 border-b border-border">
                <th className="px-6 py-4.5">Rank</th>
                <th className="px-6 py-4.5">Name</th>
                <th className="px-6 py-4.5">Code</th>
                <th className="px-6 py-4.5">Cost rate</th>
                <th className="px-6 py-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading && levels.length === 0 ? (
                <TableSkeleton columnWidths={["w-10", "w-32", "w-16", "w-20", "w-16"]} />
              ) : pageLevels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10">
                    <EmptyState
                      title="No levels registered"
                      description="Click 'Add Level' to define the first seniority ranking for lawyers in the firm."
                      icon={<HiOutlineScale className="w-5 h-5" />}
                    />
                  </td>
                </tr>
              ) : (
                pageLevels.map((level, idx) => {
                  const globalRank = page * PAGE_SIZE + idx;
                  return (
                    <tr key={level.uid} className="hover:bg-field/20 text-ink/90 transition-colors">
                      <td className="px-6 py-4.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {level.sortOrder}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 font-semibold text-ink">
                        <div className="flex items-center gap-2">
                          {level.name}
                          {globalRank === 0 && <Badge variant="primary">Highest seniority</Badge>}
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <Badge>{level.code}</Badge>
                      </td>
                      <td className="px-6 py-4.5 text-ink/70 tabular-nums">
                        {level.costRate != null ? `${level.costRate}/h` : "—"}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(level)}
                          className="p-2 text-ink/60 hover:text-ink hover:bg-hover rounded-full transition-all"
                          aria-label="Edit"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && pageLevels.length > 0 && (
          <div className="px-6 pb-2 shrink-0">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

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
