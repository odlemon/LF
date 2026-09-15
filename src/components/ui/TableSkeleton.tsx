import React from "react";

export interface TableSkeletonProps {
  /** One width class per column, left to right — controls how many <td>s render too. */
  columnWidths?: string[];
  rows?: number;
}

const DEFAULT_WIDTHS = ["w-20", "w-24", "w-16", "w-28", "w-44"];

/**
 * The row-skeleton pattern first established on /audit-trail: animate-pulse bars sized to
 * roughly match real column content, not a generic full-width shimmer block.
 */
export function TableSkeleton({ columnWidths = DEFAULT_WIDTHS, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {columnWidths.map((w, ci) => (
            <td key={ci} className="px-6 py-5.5">
              <div className={`h-3.5 bg-canvas rounded-lg ${w}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
