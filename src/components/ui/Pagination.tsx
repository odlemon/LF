import React from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

interface PaginationProps {
  currentPage: number; // 0-based page number
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const displayPages = Math.max(1, totalPages);
  const displayCurrent = currentPage;

  // Generate numbered list
  const pages = Array.from({ length: displayPages }, (_, i) => i);

  return (
    <div className="flex items-center justify-between py-4 border-t border-gray-100 mt-4 gap-4 flex-wrap">
      <span className="text-xs font-semibold text-gray-500">
        Page {displayCurrent + 1} of {displayPages}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0 || displayPages <= 1}
          type="button"
          className="p-2 border border-gray-250/60 rounded-lg text-gray-500 hover:text-gray-950 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all shrink-0 cursor-pointer select-none"
        >
          <HiChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p) => {
          const isCurrent = p === currentPage;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              type="button"
              className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer select-none ${
                isCurrent
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "border border-gray-250/60 text-gray-650 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {p + 1}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(Math.min(displayPages - 1, currentPage + 1))}
          disabled={currentPage === displayPages - 1 || displayPages <= 1}
          type="button"
          className="p-2 border border-gray-250/60 rounded-lg text-gray-500 hover:text-gray-950 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all shrink-0 cursor-pointer select-none"
        >
          <HiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
