"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDatasets } from "@/modules/data-room/hooks/useDataRoom";
import { DatasetFormModal } from "@/modules/data-room/components/DatasetFormModal";
import { DatasetStatusBadge } from "@/modules/data-room/components/DocumentStatusBadge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import { HiPlus, HiDatabase, HiTrash, HiFolderOpen } from "react-icons/hi";
import { Select } from "@/components/ui/Select";

export default function DatasetsIndexPage() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    category: "ALL",
    status: "ALL",
  });

  const {
    datasets,
    totalPages,
    isLoading,
    createDataset,
    deleteDataset,
    refetch,
  } = useDatasets(filters, page);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmDeleteUid, setConfirmDeleteUid] = useState<string | null>(null);

  const handleCreate = async (cmd: any) => {
    await createDataset(cmd);
    toast.success("Dataset created successfully.");
    refetch();
  };

  const handleDelete = async (uid: string) => {
    try {
      await deleteDataset(uid);
      toast.success("Dataset deleted successfully.");
      setConfirmDeleteUid(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete dataset.");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderPeriod = (start?: string, end?: string) => {
    const formattedStart = formatDate(start);
    const formattedEnd = formatDate(end);
    if (formattedStart && formattedEnd) {
      return `${formattedStart} - ${formattedEnd}`;
    }
    if (formattedStart) {
      return `From ${formattedStart}`;
    }
    if (formattedEnd) {
      return `Until ${formattedEnd}`;
    }
    return "N/A";
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-6 text-ink/90">
      {/* Page Title */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
            <HiDatabase className="w-7 h-7 text-primary" /> Datasets Batches
          </h1>
          <p className="text-sm text-ink/55 mt-1">
            Group your uploaded files by named ingestion batches to isolate data and track processing states.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          <HiPlus className="w-4 h-4" /> New Dataset
        </Button>
      </div>

      {/* Filter Options Bar */}
      <div className="bg-field/50 border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <Select
            label="Category"
            value={filters.category}
            onChange={(value) => {
              setFilters((prev) => ({ ...prev, category: value }));
              setPage(0);
            }}
            options={[
              { value: "ALL", label: "All Categories" },
              { value: "PAST_MATTERS", label: "Past Matters" },
              { value: "TIME_ENTRIES", label: "Time Entries" },
              { value: "BILLING_HISTORY", label: "Billing History" },
              { value: "RATE_CARD_HISTORY", label: "Rate Card History" },
              { value: "MARKET_BENCHMARKS", label: "Market Benchmarks" },
              { value: "CLIENT_OCG", label: "Client OCG Guidelines" },
              { value: "MATTER_ASSUMPTIONS", label: "Matter Assumptions" },
              { value: "OTHER", label: "Other" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <Select
            label="Batch Ingestion Status"
            value={filters.status}
            onChange={(value) => {
              setFilters((prev) => ({ ...prev, status: value }));
              setPage(0);
            }}
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "PENDING", label: "Pending" },
              { value: "PROCESSING", label: "Processing" },
              { value: "COMPLETE", label: "Complete" },
              { value: "PARTIAL", label: "Partial" },
              { value: "FAILED", label: "Failed" },
            ]}
          />
        </div>
      </div>

      {/* Main Datasets Grid Table */}
      <div className="bg-surface border border-border/60 rounded-3xl overflow-hidden shadow-sm shrink-0">
        <div className="overflow-x-auto rates-scrollable">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-field">
              <tr>
                <th className="px-5 py-4 text-left font-bold text-ink/55 uppercase tracking-wider">Dataset Name</th>
                <th className="px-5 py-4 text-left font-bold text-ink/55 uppercase tracking-wider">Category</th>
                <th className="px-5 py-4 text-left font-bold text-ink/55 uppercase tracking-wider">Source System</th>
                <th className="px-5 py-4 text-left font-bold text-ink/55 uppercase tracking-wider">Files Count</th>
                <th className="px-5 py-4 text-left font-bold text-ink/55 uppercase tracking-wider">Period Range</th>
                <th className="px-5 py-4 text-left font-bold text-ink/55 uppercase tracking-wider">Status</th>
                <th className="px-5 py-4 text-left font-bold text-ink/55 uppercase tracking-wider">Extracted Records</th>
                <th className="px-5 py-4 text-right font-bold text-ink/55 uppercase tracking-wider w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-ink/80">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse bg-field/20">
                    <td colSpan={8} className="px-5 py-4 text-center">
                      <div className="h-4 bg-field rounded w-5/6 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : datasets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-ink/40">
                    No datasets batches matched this criteria. Click &quot;New Dataset&quot; to define a new one.
                  </td>
                </tr>
              ) : (
                datasets.map((dataset) => (
                  <tr key={dataset.uid} className="hover:bg-field/30 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        href={`/settings/data-room/datasets/${dataset.uid}`}
                        className="text-ink font-extrabold hover:text-primary hover:underline flex items-center gap-1.5 py-1.5 -my-1.5 rounded"
                      >
                        <HiFolderOpen className="w-4.5 h-4.5 text-ink/40" />
                        {dataset.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 border border-border/80 rounded bg-field text-ink/60 font-bold text-[10px] uppercase">
                        {dataset.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink/90">{dataset.sourceSystem || "Manual Upload"}</td>
                    <td className="px-5 py-4 text-ink">
                      {dataset.processedDocuments} / {dataset.totalDocuments}
                    </td>
                    <td className="px-5 py-4 text-ink/65">
                      {renderPeriod(dataset.periodStart, dataset.periodEnd)}
                    </td>
                    <td className="px-5 py-4">
                      <DatasetStatusBadge status={dataset.status} />
                    </td>
                    <td className="px-5 py-4 text-ink font-extrabold">{dataset.totalRecords}</td>
                    <td className="px-5 py-4 text-right">
                      {confirmDeleteUid === dataset.uid ? (
                        <div className="flex gap-2 justify-end items-center">
                          <button
                            onClick={() => handleDelete(dataset.uid)}
                            className="px-2 py-1 text-[10px] font-bold text-white bg-red-600 rounded-full hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteUid(null)}
                            className="px-2 py-1 text-[10px] font-bold text-ink/65 bg-canvas rounded-full hover:bg-hover"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteUid(dataset.uid)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-ink/40 hover:text-red-600 transition-colors"
                        >
                          <HiTrash className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-center shrink-0">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Dataset creation Modal */}
      <DatasetFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreate}
      />
    </div>
  );
}
