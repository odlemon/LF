"use client";

import React, { useState } from "react";
import {
  useDataRoomSummary,
  useDatasets,
  useAllDocuments,
} from "@/modules/data-room/hooks/useDataRoom";
import { DataReadinessCard } from "@/modules/data-room/components/DataReadinessCard";
import { DocumentStatusBadge, DatasetStatusBadge } from "@/modules/data-room/components/DocumentStatusBadge";
import { DatasetFormModal } from "@/modules/data-room/components/DatasetFormModal";
import { FixMappingModal } from "@/modules/data-room/components/FixMappingModal";
import { ProcessingLogModal } from "@/modules/data-room/components/ProcessingLogModal";
import { DataRoomDocument } from "@/modules/data-room/types";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { RecordsBrowser } from "@/modules/data-room/components/RecordsBrowser";
import { DatasetsListDrawerContent } from "@/modules/data-room/components/DatasetsListDrawerContent";
import { DatasetDetailDrawerContent } from "@/modules/data-room/components/DatasetDetailDrawerContent";
import toast from "react-hot-toast";
import {
  HiPlus,
  HiChevronRight,
  HiDatabase,
  HiExclamationCircle,
  HiClipboardList,
  HiLightningBolt,
  HiCog,
} from "react-icons/hi";

export default function DataRoomOverviewPage() {
  const { summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useDataRoomSummary();
  const { datasets, createDataset, refetch: refetchDatasets } = useDatasets({}, 0);
  const {
    documents: attentionDocs,
    isLoading: isDocsLoading,
    refetch: refetchDocs,
  } = useAllDocuments({ status: "PROCESSING_FAILED" }, 0);

  // Modals & Drawers state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeLogDoc, setActiveLogDoc] = useState<DataRoomDocument | null>(null);
  const [activeMappingDoc, setActiveMappingDoc] = useState<DataRoomDocument | null>(null);

  // SPA Slide-over drawers state
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);
  const [isDatasetsOpen, setIsDatasetsOpen] = useState(false);
  const [activeDatasetUid, setActiveDatasetUid] = useState<string | null>(null);

  const handleCreateDataset = async (cmd: any) => {
    await createDataset(cmd);
    toast.success("Dataset batch created successfully.");
    refetchSummary();
    refetchDatasets();
  };

  const handleRetryProcessing = async (docUid: string) => {
    try {
      const { dataRoomApi } = await import("@/lib/api/modules/dataroom.api");
      await dataRoomApi.retryDocument(docUid);
      toast.success("Ingestion re-queued successfully.");
      refetchDocs();
      refetchSummary();
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger retry.");
    }
  };

  const activeDatasetsLimit = datasets.slice(0, 5);

  return (
    <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-6 text-ink/90">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
            <HiDatabase className="w-7 h-7 text-primary animate-pulse" /> Data Room
          </h1>
          <p className="text-sm text-ink/55 mt-1">
            Manage your firm&apos;s historical intelligence hub. Ingest billing, past matters, and market benchmarks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsRecordsOpen(true)}>
            <HiClipboardList className="w-4.5 h-4.5" /> Explorer Records
          </Button>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <HiPlus className="w-4.5 h-4.5" /> New Dataset
          </Button>
        </div>
      </div>

      {/* Ingestion Gauges top-banner */}
      {isSummaryLoading ? (
        <div className="h-28 bg-canvas rounded-3xl animate-pulse" />
      ) : (
        <DataReadinessCard summary={summary} />
      )}

      {/* Grid of Key stats metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from([
          { label: "Total Past Matters", val: summary?.totalPastMatters },
          { label: "Extracted Time Entries", val: summary?.totalTimeEntries },
          {
            label: "Processed Files",
            val: summary ? `${summary.processedDocumentsCount || 0} / ${summary.totalDocumentsCount || 0}` : null,
          },
          { label: "Practice Areas Covered", val: summary?.coveredPracticeAreas?.length },
        ]).map((item, idx) => (
          <div key={idx} className="bg-surface border border-border/60 rounded-2xl p-5 shadow-sm">
            <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block mb-1">
              {item.label}
            </span>
            <span className="text-2xl font-extrabold text-ink">
              {isSummaryLoading ? "..." : item.val ?? 0}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datasets panel (left 2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-base font-extrabold text-ink">Datasets Batches</h2>
            <button
              onClick={() => setIsDatasetsOpen(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer focus:outline-none"
            >
              View all datasets <HiChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-surface border border-border/60 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto rates-scrollable">
              <table className="min-w-full divide-y divide-gray-100 text-xs">
                <thead className="bg-field">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-bold text-ink/55 uppercase tracking-wider">
                      Batch Name
                    </th>
                    <th className="px-5 py-3.5 text-left font-bold text-ink/55 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-5 py-3.5 text-left font-bold text-ink/55 uppercase tracking-wider">
                      Files
                    </th>
                    <th className="px-5 py-3.5 text-left font-bold text-ink/55 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-left font-bold text-ink/55 uppercase tracking-wider">
                      Records
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-ink/80">
                  {isSummaryLoading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse bg-field/20">
                        <td colSpan={5} className="px-5 py-4">
                          <div className="h-4 bg-field rounded w-5/6" />
                        </td>
                      </tr>
                    ))
                  ) : activeDatasetsLimit.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-ink/40">
                        No datasets uploaded yet. Click &apos;New Dataset&apos; to register one.
                      </td>
                    </tr>
                  ) : (
                    activeDatasetsLimit.map((dataset) => (
                      <tr key={dataset.uid} className="hover:bg-field/30 transition-colors">
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setActiveDatasetUid(dataset.uid)}
                            className="text-ink font-extrabold hover:text-primary hover:underline text-left cursor-pointer focus:outline-none"
                          >
                            {dataset.name}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 border border-border/80 rounded bg-field text-ink/60 font-bold text-[10px] uppercase">
                            {dataset.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-ink">
                          {dataset.processedDocuments} / {dataset.totalDocuments}
                        </td>
                        <td className="px-5 py-4">
                          <DatasetStatusBadge status={dataset.status} />
                        </td>
                        <td className="px-5 py-4 text-ink">{dataset.totalRecords}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Needs attention files (right 1 col) */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-base font-extrabold text-ink flex items-center gap-1.5 text-rose-700">
              <HiExclamationCircle className="w-5 h-5 text-rose-500" /> Review Queue
            </h2>
            <span className="text-xs font-bold text-ink/40">
              ({attentionDocs.length} failed files)
            </span>
          </div>

          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto rates-scrollable pr-1">
            {isDocsLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-24 bg-canvas rounded-2xl animate-pulse" />
              ))
            ) : attentionDocs.length === 0 ? (
              <div className="bg-surface border border-border/60 rounded-3xl p-8 text-center text-ink/40 font-semibold shadow-sm flex flex-col items-center justify-center gap-2">
                <div className="w-9 h-9 rounded-full bg-hover text-ink/55 flex items-center justify-center">
                  ✓
                </div>
                All clear! Zero failed document mappings inside the workspace.
              </div>
            ) : (
              attentionDocs.map((doc) => (
                <div
                  key={doc.uid}
                  className="bg-surface border border-rose-100 rounded-3xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3.5"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-ink line-clamp-1 break-all">
                        {doc.originalFilename}
                      </span>
                      <span className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100/50 px-2 py-0.5 rounded-full w-fit mt-1">
                        Failed
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveMappingDoc(doc)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-field border border-border hover:bg-canvas rounded-full text-[11px] font-bold text-ink/80 transition-all cursor-pointer"
                    >
                      <HiCog className="w-3.5 h-3.5" /> Fix Mapping
                    </button>
                    <button
                      onClick={() => handleRetryProcessing(doc.uid)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-primary/5 border border-primary/20 hover:bg-primary/10 rounded-full text-[11px] font-bold text-primary transition-all cursor-pointer"
                    >
                      <HiLightningBolt className="w-3.5 h-3.5" /> Retry
                    </button>
                    <button
                      onClick={() => setActiveLogDoc(doc)}
                      className="px-2.5 py-1.5 hover:bg-canvas rounded-lg text-ink/40 hover:text-ink/70 transition-colors cursor-pointer text-[11px] font-bold"
                    >
                      Log
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Slide-over Drawers */}
      {/* 1. Records Browser Drawer */}
      <Drawer
        isOpen={isRecordsOpen}
        onClose={() => setIsRecordsOpen(false)}
        title="Historical Pricing Records Explorer"
        size="3xl"
      >
        <RecordsBrowser />
      </Drawer>

      {/* 2. Datasets Index batches Drawer */}
      <Drawer
        isOpen={isDatasetsOpen}
        onClose={() => setIsDatasetsOpen(false)}
        title="Datasets Ingestion Batches"
        size="3xl"
      >
        <DatasetsListDrawerContent
          onSelectDataset={(uid) => {
            setActiveDatasetUid(uid);
          }}
          onOpenCreateModal={() => {
            setIsCreateModalOpen(true);
          }}
        />
      </Drawer>

      {/* 3. Dataset detail Drawer */}
      {activeDatasetUid && (
        <Drawer
          isOpen={true}
          onClose={() => setActiveDatasetUid(null)}
          title="Dataset Batches Details"
          size="3xl"
        >
          <DatasetDetailDrawerContent datasetUid={activeDatasetUid} />
        </Drawer>
      )}

      {/* Modal Elements */}
      <DatasetFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateDataset}
      />

      {activeMappingDoc && (
        <FixMappingModal
          isOpen={true}
          onClose={() => setActiveMappingDoc(null)}
          document={activeMappingDoc}
          onSuccess={() => {
            refetchDocs();
            refetchSummary();
            refetchDatasets();
          }}
        />
      )}

      {activeLogDoc && (
        <ProcessingLogModal
          isOpen={true}
          onClose={() => setActiveLogDoc(null)}
          documentUid={activeLogDoc.uid}
          fileName={activeLogDoc.originalFilename}
        />
      )}
    </div>
  );
}
