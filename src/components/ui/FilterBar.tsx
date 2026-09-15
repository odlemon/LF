"use client";

import React, { useEffect, useRef, useState } from "react";
import { HiSearch, HiOutlineFilter } from "react-icons/hi";
import { Select } from "./Select";
import { DatePicker } from "./DatePicker";

export interface FilterBarOption {
  value: string;
  label: string;
}

export interface FilterBarProps {
  /** Debounced live search. Fires onChange ~300ms after typing stops, not on submit. */
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  status?: {
    value: string;
    onChange: (value: string) => void;
    options: FilterBarOption[];
    placeholder?: string;
  };
  dateFrom?: { value: string; onChange: (value: string) => void };
  dateTo?: { value: string; onChange: (value: string) => void };
  /** Extra page-specific filter controls (e.g. a second Select) slotted in after status. */
  extra?: React.ReactNode;
  onClear?: () => void;
  className?: string;
}

/**
 * The filter-card shell first established on /audit-trail, extracted so every list page uses
 * the same card, spacing and controls instead of a bespoke status-tab bar per page. Unlike
 * audit-trail's original search (submit-button-gated), search here is live: typing debounces
 * into the caller's onChange, no separate "Apply" step.
 */
export function FilterBar({ search, status, dateFrom, dateTo, extra, onClear, className = "" }: FilterBarProps) {
  const [searchDraft, setSearchDraft] = useState(search?.value ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchOnChangeRef = useRef(search?.onChange);
  searchOnChangeRef.current = search?.onChange;

  // Keep the draft in sync if the caller resets the underlying value (e.g. "Clear filters").
  useEffect(() => {
    setSearchDraft(search?.value ?? "");
  }, [search?.value]);

  const handleSearchInput = (val: string) => {
    setSearchDraft(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchOnChangeRef.current?.(val);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fieldCount = [search, status, dateFrom, dateTo].filter(Boolean).length + (extra ? 1 : 0);
  const gridCols =
    fieldCount >= 5 ? "lg:grid-cols-5" : fieldCount === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <div className={`bg-surface rounded-[2rem] border border-border/60 p-5 shadow-sm ${className}`}>
      <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-4 items-end`}>
        {search && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-ink/60 uppercase tracking-widest pl-1">
              Search
            </label>
            <div className="relative">
              <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40 pointer-events-none" />
              <input
                type="text"
                value={searchDraft}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder={search.placeholder ?? "Search..."}
                className="w-full pl-10 pr-5 py-2.5 bg-field border border-border rounded-full text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface transition-all"
              />
            </div>
          </div>
        )}

        {status && (
          <Select
            label="Status"
            value={status.value}
            onChange={status.onChange}
            options={status.options}
            placeholder={status.placeholder ?? "All statuses"}
          />
        )}

        {dateFrom && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-ink/60 uppercase tracking-widest pl-1">
              Date from
            </label>
            <DatePicker value={dateFrom.value} onChange={dateFrom.onChange} placeholder="Select date..." />
          </div>
        )}

        {dateTo && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-extrabold text-ink/60 uppercase tracking-widest pl-1">
              Date to
            </label>
            <DatePicker value={dateTo.value} onChange={dateTo.onChange} placeholder="Select date..." />
          </div>
        )}

        {extra}
      </div>

      {onClear && (
        <div className="flex items-center justify-end pt-3 mt-4 border-t border-border/60">
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear filters"
            title="Clear filters"
            className="p-2.5 rounded-full border border-border/50 bg-field hover:bg-canvas text-ink/60 hover:text-ink transition-all"
          >
            <HiOutlineFilter className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
