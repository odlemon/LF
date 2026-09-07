import React from "react";
import { HiCheckCircle, HiExclamationCircle, HiDotsCircleHorizontal, HiPlay, HiBan } from "react-icons/hi";
import { DocumentStatus } from "../types";

interface DocumentStatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export function DocumentStatusBadge({ status, className = "" }: DocumentStatusBadgeProps) {
  let styles = "";
  let label = "";
  let Icon = HiDotsCircleHorizontal;
  let showSpinner = false;

  switch (status) {
    case "UPLOADED":
      styles = "bg-slate-50 text-slate-700 border-slate-200/60";
      label = "Uploaded";
      Icon = HiDotsCircleHorizontal;
      break;
    case "QUEUED":
      styles = "bg-blue-50 text-blue-700 border-blue-250/50";
      label = "Queued";
      Icon = HiDotsCircleHorizontal;
      showSpinner = true;
      break;
    case "PROCESSING":
      styles = "bg-amber-50 text-amber-700 border-amber-250/50";
      label = "Processing";
      Icon = HiPlay;
      showSpinner = true;
      break;
    case "PROCESSED":
      styles = "bg-hover text-ink/80 border-border/50";
      label = "Processed";
      Icon = HiCheckCircle;
      break;
    case "PROCESSING_FAILED":
      styles = "bg-rose-50 text-rose-700 border-rose-250/50";
      label = "Failed";
      Icon = HiExclamationCircle;
      break;
    case "SKIPPED":
      styles = "bg-canvas text-ink/55 border-border";
      label = "Skipped";
      Icon = HiBan;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm transition-all select-none ${styles} ${className}`}
    >
      {showSpinner ? (
        <svg className="animate-spin h-3 w-3 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <Icon className="w-3.5 h-3.5" />
      )}
      {label}
    </span>
  );
}

interface MappingStatusBadgeProps {
  status: "MAPPED" | "PARTIAL" | "UNMAPPED";
}

export function MappingStatusBadge({ status }: MappingStatusBadgeProps) {
  let styles = "";
  let label = "";

  switch (status) {
    case "MAPPED":
      styles = "bg-hover text-ink/80 border-border";
      label = "Fully Mapped";
      break;
    case "PARTIAL":
      styles = "bg-amber-50 text-amber-700 border-amber-250/50";
      label = "Partially Mapped";
      break;
    case "UNMAPPED":
      styles = "bg-rose-50 text-rose-700 border-rose-250/50";
      label = "Not Mapped";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm ${styles}`}
    >
      {label}
    </span>
  );
}

interface DatasetStatusBadgeProps {
  status: "PENDING" | "PROCESSING" | "COMPLETE" | "PARTIAL" | "FAILED";
}

export function DatasetStatusBadge({ status }: DatasetStatusBadgeProps) {
  let styles = "";
  let label = "";

  switch (status) {
    case "PENDING":
      styles = "bg-slate-50 text-slate-700 border-slate-200/65";
      label = "Pending";
      break;
    case "PROCESSING":
      styles = "bg-amber-50 text-amber-700 border-amber-250/50 animate-pulse";
      label = "Processing";
      break;
    case "COMPLETE":
      styles = "bg-hover text-ink/80 border-border/50";
      label = "Complete";
      break;
    case "PARTIAL":
      styles = "bg-amber-50 text-amber-700 border-amber-250/50";
      label = "Partial";
      break;
    case "FAILED":
      styles = "bg-rose-50 text-rose-700 border-rose-250/50";
      label = "Failed";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm ${styles}`}
    >
      {label}
    </span>
  );
}
