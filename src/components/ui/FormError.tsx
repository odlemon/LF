import React from "react";

/**
 * Inline validation error inside a modal or slide-over form.
 *
 * Distinct from Alert on purpose: Alert is a left-aligned icon banner for page-level
 * state, this is the centered pill that eleven form modals had each hand-rolled
 * identically. Same red recipe as every other error surface in the app.
 */
export function FormError({ message, className = "" }: { message: string; className?: string }) {
  return (
    <div
      className={`mb-4 p-3.5 px-5 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-300 rounded-full text-xs font-medium animate-fade-in text-center ${className}`}
    >
      {message}
    </div>
  );
}
