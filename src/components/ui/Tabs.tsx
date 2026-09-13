"use client";

import React, { useEffect, useRef, useState } from "react";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  className?: string;
  /** For a long/dynamic tab set that should scroll horizontally instead of wrapping. */
  scrollable?: boolean;
}

interface IndicatorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Canonical filter/segment tab bar. A single indicator pill slides between tabs
 * (measured off the active button's offsetLeft/Top so it tracks wrapped rows too)
 * rather than each tab independently flipping its own background — that read as a
 * row of buttons, not a connected tab control.
 */
export function Tabs<T extends string>({
  tabs,
  activeId,
  onChange,
  className = "",
  scrollable = false,
}: TabsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);

  const measure = () => {
    const el = tabRefs.current.get(activeId);
    if (!el) return;
    setIndicator({
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [activeId, tabs]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      role="tablist"
      className={`relative inline-flex gap-1 rounded-full border border-border bg-field p-1 ${
        scrollable ? "flex-nowrap overflow-x-auto rates-scrollable" : "flex-wrap"
      } ${className}`}
    >
      {indicator && (
        <span
          aria-hidden="true"
          className="absolute rounded-full bg-ink shadow-sm transition-[left,top,width,height] duration-300 ease-out"
          style={{ left: indicator.left, top: indicator.top, width: indicator.width, height: indicator.height }}
        />
      )}
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              if (node) tabRefs.current.set(tab.id, node);
              else tabRefs.current.delete(tab.id);
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
              isActive ? "text-on-primary" : "text-ink/60 hover:text-ink"
            }`}
          >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={`ml-1.5 text-[11px] tabular-nums ${isActive ? "text-on-primary/70" : "text-ink/60"}`}
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
