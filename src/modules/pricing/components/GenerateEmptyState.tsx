"use client";

import { Button } from "@/components/ui/Button";

interface GenerateEmptyStateProps {
  generating: boolean;
  onGenerate: () => void;
  matterTitle?: string;
}

export function GenerateEmptyState({
  generating,
  onGenerate,
  matterTitle,
}: GenerateEmptyStateProps) {
  if (generating) {
    return null;
  }

  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 30%, rgba(10,10,10,0.05), transparent 60%)",
        }}
      />
      <div className="relative max-w-lg mx-auto px-6 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/60">
          Pricing workspace
        </p>
        <h2 className="mt-3 text-3xl sm:text-[2.5rem] font-semibold tracking-tight text-ink leading-[1.12]">
          {matterTitle || "This matter"}
        </h2>
        <p className="mt-4 text-sm sm:text-[15px] text-ink/60 leading-relaxed max-w-md mx-auto">
          Start deep pricing research from the locked scope and firm rates.
          You can leave this page — work continues in the background and you will
          be notified when scenarios are ready.
        </p>
        <div className="mt-9 flex justify-center">
          <Button variant="cta" onClick={onGenerate} className="min-w-[11rem]">
            Start deep research
          </Button>
        </div>
      </div>
    </div>
  );
}
