"use client";

import React, { useState } from "react";
import {
  useDatasetDetail,
  useDocuments,
  useUpload,
} from "@/modules/data-room/hooks/useDataRoom";
import {
  DocumentStatusBadge,
  MappingStatusBadge,
} from "@/modules/data-room/components/DocumentStatusBadge";
import { UploadZone } from "@/modules/data-room/components/UploadZone";
import { BatchUploadModal } from "@/modules/data-room/components/BatchUploadModal";
import { FixMappingModal } from "@/modules/data-room/components/FixMappingModal";
import { ProcessingLogModal } from "@/modules/data-room/components/ProcessingLogModal";
import { DataRoomDocument } from "@/modules/data-room/types";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import {
  HiClipboardCopy,
  HiTrash,
  HiCog,
  HiLightningBolt,
  HiRefresh,
} from "react-icons/hi";

interface DatasetDetailDrawerContentProps {
  datasetUid: string;
}

export function DatasetDetailDrawerContent({ datasetUid }: DatasetDetailDrawerContentProps) {
  const [page, setPage] = useState(0);

  const { dataset, isLoading: isDatasetLoading, refetch: refetchDetail } = useDatasetDetail(datasetUid);
  const {
    documents,
    totalPages,
    isLoading: isDocsLoading,
    isPolling,
    retryDocument,
    deleteDocument,
    refetch: refetchDocs,
  } = useDocuments(datasetUid, page);

  const { uploadSingle, uploadBatch, isUploading, progress } = useUpload(datasetUid);

  // Modals state
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [activeMappingDoc, setActiveMappingDoc] = useState<DataRoomDocument | null>(null);
  const [activeLogDoc, setActiveLogDoc] = useState<DataRoomDocument | null>(null);
  const [confirmDeleteUid, setConfirmDeleteUid] = useState<string | null>(null);

  const handleSingleUpload = async (file: File) => {
    await uploadSingle(file);
    refetchDocs();
    refetchDetail();
  };

  const handleBatchUploadSubmit = async (files: File[]) => {
    await uploadBatch(files);
    toast.success(`${files.length} files successfully queued for ingestion.`);
    refetchDocs();
    refetchDetail();
  };

  const handleRetry = async (docUid: string) => {
    try {
      await retryDocument(docUid);
      toast.success("Ingestion re-queued successfully.");
      refetchDocs();
      refetchDetail();
    } catch (err: any) {
      toast.error(err.message || "Failed to retry document.");
    }
  };

  const handleDeleteDoc = async (uid: string) => {
    try {
      await deleteDocument(uid);
      toast.success("Document deleted.");
      setConfirmDeleteUid(null);
      refetchDocs();
      refetchDetail();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete document.");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
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
      {/* Dataset Summary Stats Header Card */}
      {isDatasetLoading ? (
        <div className="h-44 bg-canvas rounded-3xl animate-pulse" />
      ) : !dataset ? (
        <div className="p-5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl font-semibold">
          Dataset not found.
        </div>
      ) : (
        <div className="bg-surface border border-border/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-ink tracking-tight">{dataset.name}</h1>
              <span className="px-2.5 py-0.5 border border-border rounded-full bg-field text-ink/60 font-bold text-[10px] uppercase">
                {dataset.category}
              </span>
            </div>
            
            {dataset.description && (
              <p className="text-xs text-ink/55 font-medium leading-relaxed max-w-2xl">
                {dataset.description}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-xs font-semibold text-ink/55">
              <div>
                <span className="block text-[9px] font-bold text-ink/40 uppercase tracking-wider mb-0.5">Source System</span>
                <span className="text-ink/90">{dataset.sourceSystem || "Manual Upload"}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-ink/40 uppercase tracking-wider mb-0.5">Covered Period</span>
                <span className="text-ink/90">{renderPeriod(dataset.periodStart, dataset.periodEnd)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-ink/40 uppercase tracking-wider mb-0.5">Extracted Records</span>
                <span className="text-ink font-extrabold text-[13px]">{dataset.totalRecords} records</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-ink/40 uppercase tracking-wider mb-0.5">Files Ingested</span>
                <span className="text-ink/90">{dataset.processedDocuments} / {dataset.totalDocuments} files</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 shrink-0 self-end md:self-start">
            <Button variant="secondary" onClick={() => setIsBatchOpen(true)}>
              <HiClipboardCopy className="w-4.5 h-4.5" /> Batch Upload
            </Button>
          </div>
        </div>
      )}

      {/* Grid: UploadBoundary (left 1/3) & Documents Table (right 2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="bg-surface border border-border/60 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-extrabold text-ink px-1">Upload New Document</h2>
          <UploadZone onUpload={handleSingleUpload} isUploading={isUploading} progress={progress} />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-ink">Ingested Files Queue</h2>
              {isPolling && (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/5 px-2.5 py-0.5 rounded-full border border-primary/20 animate-pulse">
                  <HiRefresh className="w-3.5 h-3.5 animate-spin" /> Live Refreshing...
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-gray-450">({documents.length} files)</span>
          </div>

          <div className="bg-surface border border-border/60 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto rates-scrollable">
              <table className="min-w-full divide-y divide-gray-100 text-xs">
                <thead className="bg-field">
                  <tr>
                    <th className="px-5 py-4 text-left font-bold text-ink/55 uppercase tracking-wider">File Name</th>
                    <th className="px-5 py-4 text-left font-bold text-ink/55 uppercase tracking-wider">Size</th>
                    <th className="px-5 py-4 text-left font-bold text-ink/55 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-4 text-left font-bold text-ink/55 uppercase tracking-wider">Extracted</th>
                    <th className="px-5 py-4 text-left font-bold text-ink/55 uppercase tracking-wider">Mapping</th>
                    <th className="px-5 py-4 text-right font-bold text-ink/55 uppercase tracking-wider w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-ink/80">
                  {isDocsLoading && documents.length === 0 ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <tr key={idx} className="animate-pulse bg-field/20">
                        <td colSpan={6} className="px-5 py-4 text-center">
                          <div className="h-4 bg-field rounded w-5/6 mx-auto" />
                        </td>
                      </tr>
                    ))
                  ) : documents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-ink/40">
                        No documents registered inside this dataset yet. Drag-and-drop a file to begin ingestion.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => {
                      const isFailed = doc.status === "PROCESSING_FAILED";

                      return (
                        <tr key={doc.uid} className="hover:bg-field/30 transition-colors">
                          <td className="px-5 py-4">
                            <span className="text-ink font-extrabold block truncate max-w-[150px]" title={doc.originalFilename}>
                              {doc.originalFilename}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-ink/65">{formatFileSize(doc.fileSizeBytes)}</td>
                          <td className="px-5 py-4">
                            <DocumentStatusBadge status={doc.status} />
                          </td>
                          <td className="px-5 py-4 text-ink font-bold">{doc.recordsExtracted}</td>
                          <td className="px-5 py-4">
                            <MappingStatusBadge status={doc.columnMappingStatus} />
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex gap-1.5 justify-end items-center">
                              {confirmDeleteUid === doc.uid ? (
                                <div className="flex gap-1 items-center shrink-0">
                                  <button
                                    onClick={() => handleDeleteDoc(doc.uid)}
                                    className="px-1.5 py-0.5 text-[9px] font-bold text-white bg-rose-600 rounded"
                                  >
                                    OK
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteUid(null)}
                                    className="px-1.5 py-0.5 text-[9px] font-bold text-ink/65 bg-canvas rounded"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {isFailed && (
                                    <>
                                      <button
                                        onClick={() => setActiveMappingDoc(doc)}
                                        title="Fix column mapping"
                                        className="p-1 hover:bg-canvas text-ink/40 hover:text-primary rounded-lg cursor-pointer"
                                      >
                                        <HiCog className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleRetry(doc.uid)}
                                        title="Retry processing"
                                        className="p-1 hover:bg-canvas text-ink/40 hover:text-primary rounded-lg cursor-pointer"
                                      >
                                        <HiLightningBolt className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => setActiveLogDoc(doc)}
                                    className="px-2 py-0.5 hover:bg-canvas rounded text-[10px] font-bold text-ink/55 hover:text-ink transition-colors cursor-pointer"
                                  >
                                    Log
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteUid(doc.uid)}
                                    className="p-1 hover:bg-rose-50 text-ink/40 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <HiTrash className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
      </div>

      {/* Batch Upload Modal Overlay */}
      <BatchUploadModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        onUpload={handleBatchUploadSubmit}
      />

      {activeMappingDoc && (
        <FixMappingModal
          isOpen={true}
          onClose={() => setActiveMappingDoc(null)}
          document={activeMappingDoc}
          onSuccess={() => {
            refetchDocs();
            refetchDetail();
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
