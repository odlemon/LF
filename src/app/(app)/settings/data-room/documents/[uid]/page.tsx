"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDocument, useProcessingLog } from "@/modules/data-room/hooks/useDataRoom";
import { dataRoomApi } from "@/lib/api/modules/dataroom.api";
import {
  DocumentStatusBadge,
  MappingStatusBadge,
} from "@/modules/data-room/components/DocumentStatusBadge";
import { FixMappingModal } from "@/modules/data-room/components/FixMappingModal";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import {
  HiArrowSmLeft,
  HiDocumentText,
  HiDatabase,
  HiCalendar,
  HiRefresh,
  HiTrash,
  HiExclamation,
  HiCog,
  HiLightningBolt,
  HiCheckCircle,
  HiXCircle,
} from "react-icons/hi";

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;

  const { document, isLoading, error, refetch } = useDocument(uid);
  const { logs, isLoading: isLogsLoading } = useProcessingLog(uid);

  const [activeTab, setActiveTab] = useState<"mapping" | "logs">("mapping");
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await dataRoomApi.retryDocument(uid);
      toast.success("Document re-queued for processing.");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to retry document.");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dataRoomApi.deleteDocument(uid);
      toast.success("Document deleted.");
      router.push("/settings/data-room");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete document.");
    }
  };

  const isFailed = document?.status === "PROCESSING_FAILED";
  const isTransient =
    document?.status === "QUEUED" ||
    document?.status === "PROCESSING" ||
    document?.status === "UPLOADED";

  // Processing logs state
  const [selectedAttemptIdx, setSelectedAttemptIdx] = useState(0);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const activeAttempt = logs && logs.length > 0 ? logs[selectedAttemptIdx] : null;

  const formatTimestamp = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-6 text-gray-800">
      {/* Back navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/settings/data-room"
          className="text-xs font-bold text-gray-400 hover:text-primary flex items-center gap-1 w-fit transition-colors"
        >
          <HiArrowSmLeft className="w-4 h-4" /> Data Room
        </Link>
        {document && (
          <>
            <span className="text-gray-300 text-xs">/</span>
            <Link
              href={`/settings/data-room/datasets/${document.datasetUid}`}
              className="text-xs font-bold text-gray-400 hover:text-primary flex items-center gap-1 transition-colors"
            >
              <HiDatabase className="w-3.5 h-3.5" /> Dataset
            </Link>
            <span className="text-gray-300 text-xs">/</span>
            <span className="text-xs font-bold text-gray-600 truncate max-w-[200px]">
              {document.originalFilename}
            </span>
          </>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl font-semibold flex items-start gap-3">
          <HiExclamation className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Failed to load document</p>
            <p className="text-xs font-medium mt-1 text-rose-500">{error}</p>
          </div>
        </div>
      ) : !document ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl font-semibold">
          Document not found.
        </div>
      ) : (
        <>
          {/* Document Metadata Header Card */}
          <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <HiDocumentText className="w-5 h-5 text-primary shrink-0" />
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight truncate">
                    {document.originalFilename}
                  </h1>
                  <DocumentStatusBadge status={document.status} />
                </div>

                {isTransient && (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/20 w-fit animate-pulse">
                    <HiRefresh className="w-3.5 h-3.5 animate-spin" /> Auto-refreshing...
                  </div>
                )}
              </div>

              <div className="flex gap-2 shrink-0 flex-wrap">
                {isFailed && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => setIsMappingModalOpen(true)}
                    >
                      <HiCog className="w-4 h-4" /> Fix Mapping
                    </Button>
                    <Button
                      variant="primary"
                      loading={isRetrying}
                      onClick={handleRetry}
                    >
                      <HiLightningBolt className="w-4 h-4" /> Retry
                    </Button>
                  </>
                )}
                {confirmDelete ? (
                  <div className="flex gap-1.5 items-center">
                    <button
                      onClick={handleDelete}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 rounded-full hover:bg-rose-700 cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <Button
                    variant="danger"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <HiTrash className="w-4 h-4" /> Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6 text-xs font-semibold text-gray-500">
              <div>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  File Type
                </span>
                <span className="text-gray-800 font-bold">{document.fileType}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  File Size
                </span>
                <span className="text-gray-800 font-bold">{formatFileSize(document.fileSizeBytes)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Records Extracted
                </span>
                <span className="text-gray-900 font-extrabold text-[13px]">{document.recordsExtracted}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Rows Attempted
                </span>
                <span className="text-gray-800 font-bold">{document.rowsAttempted}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Rows Failed
                </span>
                <span className={`font-bold ${document.rowsFailed > 0 ? "text-rose-600" : "text-gray-800"}`}>
                  {document.rowsFailed}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Retry Count
                </span>
                <span className="text-gray-800 font-bold">{document.retryCount} / 3</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Column Mapping
                </span>
                <MappingStatusBadge status={document.columnMappingStatus} />
              </div>
              <div>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Dataset
                </span>
                <Link
                  href={`/settings/data-room/datasets/${document.datasetUid}`}
                  className="text-primary hover:underline font-bold"
                >
                  View Dataset
                </Link>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Uploaded
                </span>
                <span className="text-gray-800 font-bold">{formatDate(document.createdAt)}</span>
              </div>
              {document.processedAt && (
                <div>
                  <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                    Processed
                  </span>
                  <span className="text-gray-800 font-bold">{formatDate(document.processedAt)}</span>
                </div>
              )}
            </div>

            {/* Error message for failed documents */}
            {document.errorMessage && (
              <div className="mt-4 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-xl font-bold flex items-start gap-2">
                <HiExclamation className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{document.errorMessage}</span>
              </div>
            )}
          </div>

          {/* Tabs: Column Mapping | Processing Logs */}
          <div className="flex gap-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("mapping")}
              className={`px-5 py-3 text-xs font-bold rounded-t-lg transition-all cursor-pointer ${
                activeTab === "mapping"
                  ? "text-primary bg-white border border-gray-200 border-b-white -mb-px shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <HiDatabase className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Column Mapping
            </button>
            <button
              onClick={() => {
                setActiveTab("logs");
                setSelectedAttemptIdx(0);
                setShowAllErrors(false);
              }}
              className={`px-5 py-3 text-xs font-bold rounded-t-lg transition-all cursor-pointer ${
                activeTab === "logs"
                  ? "text-primary bg-white border border-gray-200 border-b-white -mb-px shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <HiCalendar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Processing Logs
              {logs && logs.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-600 rounded-full">
                  {logs.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "mapping" ? (
            /* Column Mapping Section */
            <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900">Column Mapping</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Maps CSV/Excel headers to system fields. {isFailed && "Fix mismatches and re-process."}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setIsMappingModalOpen(true)}>
                  <HiCog className="w-4 h-4" /> Edit Mapping
                </Button>
              </div>

              {document.columnMapping && Object.keys(document.columnMapping).length > 0 ? (
                <div className="border border-gray-200/80 rounded-2xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-100 text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider">
                          System Field
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider">
                          File Column Header
                        </th>
                        <th className="px-4 py-3 text-left font-bold text-gray-500 uppercase tracking-wider w-24">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold">
                      {Object.entries(document.columnMapping).map(([sysField, fileColumn]) => (
                        <tr key={sysField} className="hover:bg-gray-50/30">
                          <td className="px-4 py-3 text-gray-700 font-bold">{sysField}</td>
                          <td className="px-4 py-3">
                            {fileColumn ? (
                              <span className="text-gray-900">{fileColumn}</span>
                            ) : (
                              <span className="text-rose-600 font-extrabold bg-rose-50/50 px-2 py-0.5 rounded border border-rose-100 text-[10px]">
                                Not mapped
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {fileColumn ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <HiCheckCircle className="w-3 h-3" /> Mapped
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <HiXCircle className="w-3 h-3" /> Unmapped
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 font-semibold flex flex-col items-center gap-2 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <HiDatabase className="w-8 h-8 text-gray-300" />
                  No column mapping data available.
                </div>
              )}
            </div>
          ) : (
            /* Processing Logs Section */
            <div className="bg-white border border-gray-200/60 rounded-3xl p-6 shadow-sm">
              <h2 className="text-sm font-extrabold text-gray-900 mb-4">Processing Attempts</h2>

              {isLogsLoading ? (
                <div className="flex flex-col gap-4 animate-pulse">
                  <div className="flex gap-2">
                    <div className="h-8 w-24 bg-gray-100 rounded-full" />
                    <div className="h-8 w-24 bg-gray-100 rounded-full" />
                  </div>
                  <div className="h-32 bg-gray-100 rounded-2xl" />
                </div>
              ) : !logs || logs.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-semibold flex flex-col items-center gap-2 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <HiExclamation className="w-8 h-8 text-gray-300" />
                  No processing attempts logged for this file yet.
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {/* Attempt Timeline */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 border-b border-gray-100">
                    {logs.map((log, idx) => (
                      <button
                        key={log.uid || idx}
                        onClick={() => {
                          setSelectedAttemptIdx(idx);
                          setShowAllErrors(false);
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-full border transition-all shrink-0 cursor-pointer ${
                          selectedAttemptIdx === idx
                            ? "bg-primary border-primary text-white shadow-sm"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        Attempt {log.attemptNumber}
                      </button>
                    ))}
                  </div>

                  {activeAttempt && (
                    <div className="flex flex-col gap-5">
                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-4 text-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Status
                          </span>
                          <DocumentStatusBadge status={activeAttempt.status} />
                        </div>
                        <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-4 text-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Rows Parsed
                          </span>
                          <span className="text-base font-extrabold text-gray-900">
                            {activeAttempt.rowsProcessed} / {activeAttempt.rowsRead}
                          </span>
                        </div>
                        <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-4 text-center">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Rows Failed
                          </span>
                          <span className={`text-base font-extrabold ${activeAttempt.rowsFailed > 0 ? "text-rose-600" : "text-gray-900"}`}>
                            {activeAttempt.rowsFailed}
                          </span>
                        </div>
                      </div>

                      {/* Dates & Error Summary */}
                      <div className="flex flex-col gap-2.5 p-4 bg-gray-50 border border-gray-200/50 rounded-2xl">
                        <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                          <HiCalendar className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold">
                            Started: {formatTimestamp(activeAttempt.startedAt)}
                          </span>
                          {activeAttempt.completedAt && (
                            <span className="font-semibold ml-auto">
                              Ended: {formatTimestamp(activeAttempt.completedAt)}
                            </span>
                          )}
                        </div>

                        {activeAttempt.errorMessage && (
                          <div className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-100 p-3 rounded-xl font-bold flex items-start gap-2">
                            <HiExclamation className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{activeAttempt.errorMessage}</span>
                          </div>
                        )}
                      </div>

                      {/* Column Mapping Used */}
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                          <HiDatabase className="w-4 h-4 text-gray-400" /> Column Mapping Used
                        </span>
                        <div className="border border-gray-200/80 rounded-2xl overflow-hidden bg-white shadow-sm">
                          <table className="min-w-full divide-y divide-gray-100 text-xs">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2.5 text-left font-bold text-gray-500 uppercase tracking-wider">
                                  System Field
                                </th>
                                <th className="px-4 py-2.5 text-left font-bold text-gray-500 uppercase tracking-wider">
                                  File Column
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-semibold">
                              {activeAttempt.columnMapping && Object.keys(activeAttempt.columnMapping).length > 0 ? (
                                Object.entries(activeAttempt.columnMapping).map(([sysField, matchedVal]) => (
                                  <tr key={sysField}>
                                    <td className="px-4 py-2.5 text-gray-700">{sysField}</td>
                                    <td className="px-4 py-2.5">
                                      {matchedVal ? (
                                        <span className="text-gray-900">{matchedVal}</span>
                                      ) : (
                                        <span className="text-rose-600 font-extrabold bg-rose-50/50 px-2 py-0.5 rounded border border-rose-100">
                                          Not found
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={2} className="px-4 py-3 text-center text-gray-400">
                                    No mapping template detected.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Row Errors */}
                      {activeAttempt.rowErrors && activeAttempt.rowErrors.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-rose-700">
                            Row Error Logs ({activeAttempt.rowErrors.length} errors)
                          </span>
                          <div className="border border-red-100 rounded-2xl overflow-hidden bg-white shadow-sm max-h-56 overflow-y-auto rates-scrollable pr-1">
                            <table className="min-w-full divide-y divide-red-50 text-[11px]">
                              <thead className="bg-red-50/30">
                                <tr>
                                  <th className="px-4 py-2 text-left font-bold text-rose-800 uppercase tracking-wider w-16">
                                    Row
                                  </th>
                                  <th className="px-4 py-2 text-left font-bold text-rose-800 uppercase tracking-wider">
                                    Diagnostic Reason
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-red-50 font-semibold text-gray-750">
                                {(showAllErrors
                                  ? activeAttempt.rowErrors
                                  : activeAttempt.rowErrors.slice(0, 20)
                                ).map((err, i) => (
                                  <tr key={i}>
                                    <td className="px-4 py-2 text-rose-700 font-bold">#{err.rowNumber}</td>
                                    <td className="px-4 py-2 break-all">{err.errorMessage}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {activeAttempt.rowErrors.length > 20 && !showAllErrors && (
                            <button
                              onClick={() => setShowAllErrors(true)}
                              className="text-xs font-bold text-primary hover:underline text-center w-full mt-1 cursor-pointer"
                            >
                              View all {activeAttempt.rowErrors.length} errors
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Fix Mapping Modal */}
          {isMappingModalOpen && document && (
            <FixMappingModal
              isOpen={true}
              onClose={() => setIsMappingModalOpen(false)}
              document={document}
              onSuccess={() => {
                refetch();
                setIsMappingModalOpen(false);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
