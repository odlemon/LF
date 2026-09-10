"use client";

import React, { useState } from "react";
import { useDatasets } from "@/modules/data-room/hooks/useDataRoom";
import { DatasetStatusBadge } from "@/modules/data-room/components/DocumentStatusBadge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import toast from "react-hot-toast";
import { HiPlus, HiTrash, HiFolderOpen } from "react-icons/hi";

interface DatasetsListDrawerContentProps {
  onSelectDataset: (uid: string) => void;
  onOpenCreateModal: () => void;
}

export function DatasetsListDrawerContent({
  onSelectDataset,
  onOpenCreateModal,
}: DatasetsListDrawerContentProps) {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    category: "ALL",
    status: "ALL",
  });

  const {
    datasets,
    totalPages,
    isLoading,
    deleteDataset,
    refetch,
  } = useDatasets(filters, page);

  const [confirmDeleteUid, setConfirmDeleteUid] = useState<string | null>(null);

  const handleDelete = async (uid: string) => {
    try {
      await deleteDataset(uid);
      toast.success("Dataset deleted successfully.");
      setConfirmDeleteUid(null);
      refetch();
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
    <div className="flex flex-col gap-6 text-ink/90">
      {/* Header bar within drawer context */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-xs text-ink/55 font-medium">
            Group your uploaded files by named ingestion batches to isolate data and track processing states.
          </p>
        </div>
        <Button variant="primary" onClick={onOpenCreateModal}>
          <HiPlus className="w-4 h-4" /> New Dataset
        </Button>
      </div>

      {/* Filter Options Bar (Custom selectors!) */}
      <div className="bg-field/50 border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Select
            label="Category"
            placeholder="All Categories"
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
            value={filters.category}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, category: val }));
              setPage(0);
            }}
          />
        </div>

        <div className="flex-1">
          <Select
            label="Batch Ingestion Status"
            placeholder="All Statuses"
            options={[
              { value: "ALL", label: "All Statuses" },
              { value: "PENDING", label: "Pending" },
              { value: "PROCESSING", label: "Processing" },
              { value: "COMPLETE", label: "Complete" },
              { value: "PARTIAL", label: "Partial" },
              { value: "FAILED", label: "Failed" },
            ]}
            value={filters.status}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, status: val }));
              setPage(0);
            }}
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
                      <button
                        onClick={() => onSelectDataset(dataset.uid)}
                        className="text-ink font-extrabold hover:text-primary hover:underline flex items-center py-1.5 -my-1.5 rounded gap-1.5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
                      >
                        <HiFolderOpen className="w-4.5 h-4.5 text-ink/40 shrink-0" />
                        <span>{dataset.name}</span>
                      </button>
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
                            className="px-2 py-1 text-[10px] font-bold text-white bg-red-600 rounded-full hover:bg-red-700 cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteUid(null)}
                            className="px-2 py-1 text-[10px] font-bold text-ink/65 bg-canvas rounded-full hover:bg-hover cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteUid(dataset.uid)}
                          className="p-1.5 hover:bg-red-50 rounded-lg text-ink/40 hover:text-red-600 transition-colors cursor-pointer"
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
      </div>

      {/* Pagination bar */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-center shrink-0">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
