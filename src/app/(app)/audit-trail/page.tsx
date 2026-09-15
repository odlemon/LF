"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { useAuditTrail } from "@/modules/audit-trail/hooks/useAuditTrail";
import { AuditEvent, ACTION_LABEL_MAP } from "@/modules/audit-trail/types";
import { HiClipboardCopy, HiEye, HiClipboardList, HiOutlineFilter, HiOutlineDownload, HiX } from "react-icons/hi";
import { auditApi } from "@/lib/api/modules/audit.api";
import toast from "react-hot-toast";

// Static Resource options
const RESOURCE_OPTIONS = [
  { value: "ALL", label: "All Resources" },
  { value: "Firm", label: "Firm" },
  { value: "Practice Area", label: "Practice Area" },
  { value: "Fee Earner Level", label: "Fee Earner Level" },
  { value: "Rate Card", label: "Rate Card" },
  { value: "Rate Card Entry", label: "Rate Card Entry" },
  { value: "Client Profile", label: "Client Profile" },
  { value: "Client Portal User", label: "Client Portal User" },
  { value: "Firm Guardrails", label: "Firm Guardrails" },
  { value: "Pricing Request", label: "Pricing Request" },
  { value: "Pricing Scenario", label: "Pricing Scenario" },
  { value: "Negotiation", label: "Negotiation" },
  { value: "Discount Program", label: "Discount Program" },
  { value: "Matter Learning", label: "Matter Learning" },
];

// Static Action Type options
const ACTION_OPTIONS = [
  { value: "ALL", label: "All Actions" },
  ...Object.entries(ACTION_LABEL_MAP).map(([key, label]) => ({
    value: key,
    label,
  })),
];

function AuditTrailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Arriving from another page's "view full history" link (e.g. a client or rate card's
  // activity panel) pre-filters to that one record. There's no manual entity-ID box any more
  // (AT1) — this is read from the URL only, so the filter stays live but not hand-typeable.
  const filterEntityUid = searchParams.get("entityUid") || "";

  const [actionType, setActionType] = useState("ALL");
  const [resourceName, setResourceName] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // Detail Modal state
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hook query parameters
  const currentFilters = {
    entityUid: filterEntityUid || undefined,
    actionType: actionType !== "ALL" ? actionType : undefined,
    resourceName: resourceName !== "ALL" ? resourceName : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  };

  const { events, pagination, isLoading, refetch } = useAuditTrail(currentFilters, page);

  const handleClearFilters = () => {
    setActionType("ALL");
    setResourceName("ALL");
    setDateFrom("");
    setDateTo("");
    setPage(0);
    // Also drops a ?entityUid= from a deep link, if any.
    router.replace("/audit-trail");
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await auditApi.listEvents(currentFilters, 0, 2000);
      const rows = response.content || [];
      if (rows.length === 0) {
        toast.error("Nothing to export for the current filters.");
        return;
      }
      const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const header = ["When", "Who", "Action", "Resource", "Description", "Entity UID"];
      const lines = rows.map((e) =>
        [
          formatDate(e.createdAt, true),
          e.actorName,
          ACTION_LABEL_MAP[e.actionType] || e.actionType,
          e.resourceName,
          e.resourceDescription || "",
          e.entityUid || "",
        ]
          .map((v) => escape(String(v)))
          .join(",")
      );
      const csv = [header.map(escape).join(","), ...lines].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(
        rows.length >= 2000
          ? "Exported the first 2,000 matching records. Narrow the filters to export the rest."
          : `Exported ${rows.length} record${rows.length === 1 ? "" : "s"}.`
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard.`);
  };

  const formatDate = (dateStr: string, includeSeconds = false) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...(includeSeconds ? { second: "2-digit" } : {}),
    });
  };

  const openDetails = (event: AuditEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  return (
    <div className="px-5 py-8 sm:px-8 max-w-[1400px] w-full mx-auto flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
            <HiClipboardList className="w-7 h-7 text-primary shrink-0" />
            Audit Trail
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            A complete record of all actions taken in your firm.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleExport}
          disabled={isExporting}
          className="self-start text-xs lg:self-center"
        >
          <HiOutlineDownload className="w-4 h-4" />
          {isExporting ? "Exporting..." : "Export CSV"}
        </Button>
      </div>

      {filterEntityUid && (
        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-semibold text-ink/80 self-start">
          Filtered to one record
          <button
            type="button"
            onClick={handleClearFilters}
            aria-label="Clear entity filter"
            className="text-ink/60 hover:text-ink transition-colors"
          >
            <HiX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter bar card */}
      <div className="bg-surface rounded-[2rem] border border-border/60 p-5 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

            {/* Action Type */}
            <div className="flex flex-col gap-1.5 lg:col-span-1">
              <label className="text-[10px] font-extrabold text-ink/60 uppercase tracking-widest">
                Action Type
              </label>
              <Select
                value={actionType}
                onChange={(val) => {
                  setActionType(val);
                  setPage(0);
                }}
                options={ACTION_OPTIONS}
              />
            </div>

            {/* Resource */}
            <div className="flex flex-col gap-1.5 lg:col-span-1">
              <label className="text-[10px] font-extrabold text-ink/60 uppercase tracking-widest">
                Resource Name
              </label>
              <Select
                value={resourceName}
                onChange={(val) => {
                  setResourceName(val);
                  setPage(0);
                }}
                options={RESOURCE_OPTIONS}
              />
            </div>

            {/* Date From */}
            <div className="flex flex-col gap-1.5 lg:col-span-1">
              <label className="text-[10px] font-extrabold text-ink/60 uppercase tracking-widest">
                Date From
              </label>
              <DatePicker
                value={dateFrom}
                onChange={(val) => {
                  setDateFrom(val);
                  setPage(0);
                }}
                placeholder="Select date..."
              />
            </div>

            {/* Date To */}
            <div className="flex flex-col gap-1.5 lg:col-span-1">
              <label className="text-[10px] font-extrabold text-ink/60 uppercase tracking-widest">
                Date To
              </label>
              <DatePicker
                value={dateTo}
                onChange={(val) => {
                  setDateTo(val);
                  setPage(0);
                }}
                placeholder="Select date..."
              />
            </div>

          </div>

          {/* Filters above apply live; nothing left to gate behind a submit. */}
          <div className="flex items-center justify-end pt-3 border-t border-border/60 shrink-0">
            <button
              onClick={handleClearFilters}
              type="button"
              aria-label="Clear filters"
              title="Clear filters"
              className="p-2.5 rounded-full border border-border/50 bg-field hover:bg-canvas text-ink/60 hover:text-ink transition-all"
            >
              <HiOutlineFilter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-surface rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto rates-scrollable">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-field/60 text-xs font-bold text-ink/60 border-b border-border">
                <th className="px-6 py-4.5">When</th>
                <th className="px-6 py-4.5">Who</th>
                <th className="px-6 py-4.5">Action</th>
                <th className="px-6 py-4.5">Resource</th>
                <th className="px-6 py-4.5">Description</th>
                <th className="px-6 py-4.5 text-center w-14"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading && events.length === 0 ? (
                // Clean Table skeleton rows when initially loading
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5.5"><div className="h-3.5 bg-canvas rounded-lg w-20" /></td>
                    <td className="px-6 py-5.5"><div className="h-3.5 bg-canvas rounded-lg w-24" /></td>
                    <td className="px-6 py-5.5"><div className="h-5 bg-canvas rounded-lg w-16" /></td>
                    <td className="px-6 py-5.5"><div className="h-3.5 bg-canvas rounded-lg w-28" /></td>
                    <td className="px-6 py-5.5"><div className="h-3.5 bg-canvas rounded-lg w-44" /></td>
                    <td className="px-6 py-5.5"><div className="h-7 bg-canvas rounded-lg w-7 mx-auto" /></td>
                  </tr>
                ))
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <EmptyState message="No audit events found for the selected filters." />
                  </td>
                </tr>
              ) : (
                events.map((event) => {
                  const humanAction = ACTION_LABEL_MAP[event.actionType] || event.actionType;
                  return (
                    <tr
                      key={event.id}
                      className="hover:bg-field/20 text-ink/90 transition-colors"
                    >
                      <td className="px-6 py-4.5 font-medium whitespace-nowrap text-xs text-ink/60">
                        {formatDate(event.createdAt)}
                      </td>
                      <td className="px-6 py-4.5 font-bold text-ink whitespace-nowrap">
                        {event.actorName}
                      </td>
                      <td className="px-6 py-4.5">
                        <Badge
                          variant={
                            event.actionType === "CREATE" || event.actionType === "APPROVE" || event.actionType === "ACTIVATE"
                              ? "neutral"
                              : event.actionType === "DELETE" || event.actionType === "REJECT"
                              ? "error"
                              : event.actionType === "DEACTIVATE"
                              ? "warning"
                              : "info"
                          }
                        >
                          {humanAction}
                        </Badge>
                      </td>
                      <td className="px-6 py-4.5 font-semibold text-ink/90 whitespace-nowrap text-xs">
                        {event.resourceName}
                      </td>
                      <td className="px-6 py-4.5 text-xs text-ink/65 max-w-xs truncate leading-normal">
                        {event.resourceDescription}
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <button
                          type="button"
                          onClick={() => openDetails(event)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink/60 transition-all hover:bg-primary/5 hover:text-primary cursor-pointer"
                          title="View Log Details"
                          aria-label="View this audit entry in full"
                        >
                          <HiEye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paging Footer */}
        {pagination && (
          <div className="px-6 pb-2 shrink-0">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Full Event Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Audit Log Detail Sheet"
      >
        {selectedEvent && (
          <div className="flex flex-col gap-5">
            <div className="p-4 bg-field/50 rounded-xl border border-border/40 flex flex-col gap-2">
              <span className="text-[10px] font-extrabold text-ink/60 uppercase tracking-widest">
                Log Event Description
              </span>
              <p className="text-sm font-bold text-ink leading-normal">
                {selectedEvent.resourceDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs text-ink border-t border-border pt-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-extrabold text-ink/60 uppercase tracking-wide text-[10px]">Actor Name</span>
                <span className="font-semibold text-ink text-sm mt-0.5">{selectedEvent.actorName}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-extrabold text-ink/60 uppercase tracking-wide text-[10px]">Actor User UID</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-ink/70">{selectedEvent.actorUid}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedEvent.actorUid, "Actor UID")}
                    aria-label="Copy actor UID"
                    className="text-ink/60 hover:text-primary transition-colors"
                  >
                    <HiClipboardCopy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-0.5 border-t border-border/60 pt-3">
                <span className="font-extrabold text-ink/60 uppercase tracking-wide text-[10px]">Action Type</span>
                <Badge
                  variant={
                    selectedEvent.actionType === "CREATE" || selectedEvent.actionType === "APPROVE" || selectedEvent.actionType === "ACTIVATE"
                      ? "neutral"
                      : selectedEvent.actionType === "DELETE" || selectedEvent.actionType === "REJECT"
                      ? "error"
                      : selectedEvent.actionType === "DEACTIVATE"
                      ? "warning"
                      : "info"
                  }
                  className="self-start mt-1"
                >
                  {ACTION_LABEL_MAP[selectedEvent.actionType] || selectedEvent.actionType}
                </Badge>
              </div>
              <div className="flex flex-col gap-0.5 border-t border-border/60 pt-3">
                <span className="font-extrabold text-ink/60 uppercase tracking-wide text-[10px]">Resource Type</span>
                <span className="font-semibold text-ink text-sm mt-0.5">{selectedEvent.resourceName}</span>
              </div>

              <div className="flex flex-col gap-0.5 border-t border-border/60 pt-3 col-span-2">
                <span className="font-extrabold text-ink/60 uppercase tracking-wide text-[10px]">Entity UID</span>
                {selectedEvent.entityUid ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-ink/70">{selectedEvent.entityUid}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedEvent.entityUid!, "Entity UID")}
                      aria-label="Copy entity UID"
                      className="text-ink/60 hover:text-primary transition-colors"
                    >
                      <HiClipboardCopy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-ink/60 mt-0.5">-</span>
                )}
              </div>

              <div className="flex flex-col gap-0.5 border-t border-border/60 pt-3 col-span-2">
                <span className="font-extrabold text-ink/60 uppercase tracking-wide text-[10px]">Timestamp (Exact)</span>
                <span className="font-medium text-ink/80 mt-0.5">
                  {formatDate(selectedEvent.createdAt, true)}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-border shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function AuditTrailPage() {
  return (
    <PermissionGate
      permission="AUDIT_READ"
      fallback={
        <div className="px-5 py-8 sm:px-8 max-w-[1400px] w-full mx-auto">
          <div className="mx-auto w-full max-w-3xl">
            <Alert
              variant="error"
              message="You do not have permission to view the audit trail."
            />
          </div>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="px-5 py-8 sm:px-8 max-w-[1400px] w-full mx-auto flex flex-col gap-6 animate-pulse">
            <div className="h-8 bg-field w-1/4 rounded-lg" />
            <div className="h-32 bg-field rounded-[2rem]" />
            <div className="h-96 bg-field rounded-[2rem]" />
          </div>
        }
      >
        <AuditTrailContent />
      </Suspense>
    </PermissionGate>
  );
}
