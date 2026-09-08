"use client";

import React from "react";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
}

/**
 * Canonical filter/segment tab bar, extracted from the pattern AnalyticsTabs already
 * established across seven routes: rounded-full pills, bg-ink for the active pill.
 * Negotiations, pricing requests, and approvals each hand-rolled a close variant of
 * this (a pill bar, or an underline bar) before consolidating onto this component.
 */
export function Tabs<T extends string>({ tabs, activeId, onChange, className = "" }: TabsProps<T>) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? "bg-ink text-on-primary shadow-sm"
                : "bg-field text-ink/60 hover:text-ink hover:bg-hover border border-border"
            }`}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={`ml-1.5 text-[11px] tabular-nums ${
                  isActive ? "text-on-primary/70" : "text-ink/35"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
