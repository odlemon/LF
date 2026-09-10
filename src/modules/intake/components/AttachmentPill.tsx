import React from "react";
import { HiX } from "react-icons/hi";

interface AttachmentPillProps {
  fileName: string;
  state?: "idle" | "uploading" | "done" | "error";
  onRemove?: () => void;
  showRemove?: boolean;
}

export function AttachmentPill({
  fileName,
  state = "idle",
  onRemove,
  showRemove = true,
}: AttachmentPillProps) {
  const isUploading = state === "uploading";
  const isDone = state === "done" || state === "idle";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs ${
        state === "error"
          ? "bg-red-50 text-red-700"
          : isDone
          ? "bg-hover text-ink/80"
          : "bg-canvas text-ink/65"
      }`}
    >
      {isUploading && (
        <svg
          className="animate-spin h-3 w-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      <span className="max-w-[140px] truncate">
        {fileName}
        {isUploading && " uploading..."}
        {state === "done" && " ✓"}
      </span>
      {showRemove && onRemove && !isUploading && (
        <button
          type="button"
          onClick={onRemove}
          className="p-0.5 hover:bg-primary-hover/5 rounded-full"
          aria-label="Remove attachment"
        >
          <HiX className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
