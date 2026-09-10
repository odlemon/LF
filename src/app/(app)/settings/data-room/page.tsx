"use client";

import React, { useState } from "react";
import {
  useDataRoomSummary,
  useDatasets,
  useAllDocuments,
} from "@/modules/data-room/hooks/useDataRoom";
import { DataRoomHero } from "@/modules/data-room/components/DataRoomHero";
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Data Room</h1>
          <p className="text-sm text-ink/55 mt-1 max-w-2xl leading-relaxed">
            Your firm&apos;s own history — past matters, time, billing and benchmarks. Everything
            ingested here is what the pricing agent reasons from.
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

      <DataRoomHero summary={summary} loading={isSummaryLoading} />

      <div className="flex flex-col gap-8">
        {/* Datasets are the substance of this page, so they get the full width. */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-base font-bold text-ink">Ingested datasets</h2>
            <button
              onClick={() => setIsDatasetsOpen(true)}
              className="text-xs font-semibold text-ink/55 hover:text-ink flex items-center py-1.5 -my-1.5 rounded gap-0.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface transition-colors"
            >
              View all datasets <HiChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto rates-scrollable">
              <table className="min-w-full text-sm">
                <thead className="bg-field/60 border-b border-border">
                  <tr>
                    <th className="px-5 py-3.5 text-left font-bold text-ink/45 uppercase tracking-wider text-[10px]">
                      Batch Name
                    </th>
                    <th className="px-5 py-3.5 text-left font-bold text-ink/45 uppercase tracking-wider text-[10px]">
                      Category
                    </th>
                    <th className="px-5 py-3.5 text-left font-bold text-ink/45 uppercase tracking-wider text-[10px]">
                      Files
                    </th>
                    <th className="px-5 py-3.5 text-left font-bold text-ink/45 uppercase tracking-wider text-[10px]">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-right font-bold text-ink/45 uppercase tracking-wider text-[10px]">
                      Records
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-ink/75">
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
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <p className="text-sm font-semibold text-ink/60">Nothing ingested yet.</p>
                        <p className="mt-1 text-[13px] text-ink/40">
                          Create a dataset, then upload a matter, time or billing export into it.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    activeDatasetsLimit.map((dataset) => (
                      <tr key={dataset.uid} className="hover:bg-field/30 transition-colors">
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setActiveDatasetUid(dataset.uid)}
                            className="text-ink font-semibold hover:underline text-left cursor-pointer py-1.5 -my-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
                          >
                            {dataset.name}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <span className="px-2 py-0.5 border border-border rounded-lg bg-field text-ink/55 font-bold text-[10px] uppercase tracking-wider">
                            {String(dataset.category).replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-5 py-4 tabular-nums text-ink/70">
                          {dataset.processedDocuments} / {dataset.totalDocuments}
                        </td>
                        <td className="px-5 py-4">
                          <DatasetStatusBadge status={dataset.status} />
                        </td>
                        <td className="px-5 py-4 text-right tabular-nums font-semibold text-ink">
                          {Number(dataset.totalRecords || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Files that need a human. Kept below the datasets and in the platform's own colours:
            a wall of red down the side made a working data room look broken, when the normal
            state is a handful of exports with an unfamiliar column. */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <HiExclamationCircle className="w-4.5 h-4.5 text-ink/35" />
              Needs review
            </h2>
            <span className="text-xs font-semibold text-ink/40">
              {attentionDocs.length === 0
                ? "Nothing waiting"
                : `${attentionDocs.length} ${attentionDocs.length === 1 ? "file" : "files"}`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {isDocsLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-24 bg-canvas rounded-2xl animate-pulse" />
              ))
            ) : attentionDocs.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3 bg-surface border border-border rounded-2xl px-6 py-8 text-center">
                <p className="text-sm font-semibold text-ink/70">Every file has been read.</p>
                <p className="mt-1 text-[13px] text-ink/45">
                  Nothing is waiting on a mapping decision.
                </p>
              </div>
            ) : (
              attentionDocs.map((doc) => (
                <div
                  key={doc.uid}
                  className="bg-surface border border-border rounded-2xl p-4 hover:border-ink/25 transition-colors flex flex-col gap-3.5"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-ink line-clamp-1 break-all">
                        {doc.originalFilename}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-warning bg-warning/10 border border-warning/25 px-2 py-0.5 rounded-lg w-fit mt-1.5">
                        Could not read
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
