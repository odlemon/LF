import React from "react";

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3 flex-col items-start">
      <span className="text-xs text-ink/40 mb-1">Lysp</span>
      <div className="bg-surface border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          <span
            className="w-2 h-2 bg-ink/35 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 bg-ink/35 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 bg-ink/35 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
