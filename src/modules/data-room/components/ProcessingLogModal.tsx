"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useProcessingLog } from "../hooks/useDataRoom";
import { DocumentStatusBadge } from "./DocumentStatusBadge";
import { HiExclamation, HiCalendar, HiDatabase } from "react-icons/hi";

interface ProcessingLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUid: string;
  fileName: string;
}

export function ProcessingLogModal({ isOpen, onClose, documentUid, fileName }: ProcessingLogModalProps) {
  const { logs, isLoading, error } = useProcessingLog(documentUid);
  const [selectedAttemptIdx, setSelectedAttemptIdx] = useState<number>(0);
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
    <Modal isOpen={isOpen} onClose={onClose} title={`${fileName} - Ingestion Log`}>
      <div className="flex flex-col gap-6 w-full text-gray-800">
        {isLoading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-6 bg-gray-150 rounded-lg w-1/3" />
            <div className="h-20 bg-gray-150 rounded-2xl" />
            <div className="h-40 bg-gray-150 rounded-2xl" />
          </div>
        ) : error ? (
          <div className="p-3.5 bg-rose-50 border border-rose-200/50 text-rose-700 text-xs font-bold rounded-2xl">
            {error}
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 font-semibold flex flex-col items-center gap-2">
            <HiExclamation className="w-8 h-8 text-gray-300" />
            No processing attempts logged for this file yet.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Multi-Attempt Timeline Header */}
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
                {/* Stats row card */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Status</span>
                    <DocumentStatusBadge status={activeAttempt.status} />
                  </div>
                  <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Rows Parsed</span>
                    <span className="text-base font-extrabold text-gray-900">
                      {activeAttempt.rowsProcessed} / {activeAttempt.rowsRead}
                    </span>
                  </div>
                  <div className="bg-gray-50/50 border border-gray-150 rounded-2xl p-4 text-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Rows Failed</span>
                    <span className={`text-base font-extrabold ${activeAttempt.rowsFailed > 0 ? "text-rose-600" : "text-gray-900"}`}>
                      {activeAttempt.rowsFailed}
                    </span>
                  </div>
                </div>

                {/* Date & Error Summary */}
                <div className="flex flex-col gap-2.5 p-4 bg-gray-50 border border-gray-200/50 rounded-2xl">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
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

                {/* Column Mapping Review */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <HiDatabase className="w-4 h-4 text-gray-400" /> Column Mapping Matches
                  </span>
                  <div className="border border-gray-200/80 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-100 text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-bold text-gray-500 uppercase tracking-wider">System Field</th>
                          <th className="px-4 py-2.5 text-left font-bold text-gray-500 uppercase tracking-wider">File Column</th>
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

                {/* Row Errors Breakdown (limit to 20 errors initially) */}
                {activeAttempt.rowErrors && activeAttempt.rowErrors.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-rose-700">
                      Row Error Logs ({activeAttempt.rowErrors.length} errors)
                    </span>
                    <div className="border border-red-100 rounded-2xl overflow-hidden bg-white shadow-sm max-h-56 overflow-y-auto rates-scrollable pr-1">
                      <table className="min-w-full divide-y divide-red-50 text-[11px]">
                        <thead className="bg-red-50/30">
                          <tr>
                            <th className="px-4 py-2 text-left font-bold text-rose-800 uppercase tracking-wider w-16">Row</th>
                            <th className="px-4 py-2 text-left font-bold text-rose-800 uppercase tracking-wider">Diagnostic Reason</th>
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
    </Modal>
  );
}
