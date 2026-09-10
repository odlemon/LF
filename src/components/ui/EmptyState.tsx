import React from "react";
import { HiClipboardList } from "react-icons/hi";

interface EmptyStateProps {
  message?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ message, title, description, icon }: EmptyStateProps) {
  const displayTitle = title ?? message;
  const displayDescription = description;

  return (
    <div className="flex flex-col items-center justify-center py-14 px-6 bg-field/20 border border-dashed border-border/80 rounded-2xl text-center">
      <div className="w-12 h-12 rounded-xl bg-field border border-border text-ink/60 flex items-center justify-center mb-3">
        {icon ?? <HiClipboardList className="w-5.5 h-5.5" />}
      </div>
      {displayTitle && (
        <p className="text-sm font-bold text-ink/80 max-w-sm leading-relaxed">
          {displayTitle}
        </p>
      )}
      {displayDescription && (
        <p className="text-sm font-medium text-ink/60 max-w-sm leading-relaxed mt-1.5">
          {displayDescription}
        </p>
      )}
    </div>
  );
}
