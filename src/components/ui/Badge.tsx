import React from "react";

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  neutral: "bg-hover text-ink/80 border-border",
  primary: "bg-primary/10 text-primary border-primary/10",
  success:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50",
  warning:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40",
  error:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50",
  info: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50",
};

/**
 * Canonical status/label pill, extracted from the dominant ad-hoc pattern already
 * repeated across pricing requests, negotiations, approvals, analytics and data-room:
 * rounded-lg (not the pill radius interactive controls use — a badge is a label, not
 * a control), text-[10px] font-bold uppercase tracking-wider, bordered.
 */
export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
