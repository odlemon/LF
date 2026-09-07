/** Shared skeleton for pricing-request workspace while detail loads. */
export function PricingRequestWorkspaceSkeleton() {
  return (
    <div
      className="h-[calc(100vh-64px)] flex flex-col bg-canvas"
      aria-busy="true"
      aria-label="Loading pricing request"
    >
      {/* Top bar — matches real workspace header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-ink/[0.06] animate-pulse shrink-0" />
          <div className="min-w-0 flex flex-col gap-1.5">
            <div className="h-4 w-48 max-w-[50vw] rounded-md bg-ink/[0.08] animate-pulse" />
            <div className="h-3 w-28 rounded-md bg-ink/[0.05] animate-pulse" />
          </div>
        </div>
        <div className="h-8 w-24 rounded-full bg-ink/[0.06] animate-pulse shrink-0" />
      </div>

      <div className="relative flex flex-1 overflow-hidden min-h-0">
        {/* Chat column */}
        <div className="w-1/2 flex flex-col border-r border-border bg-canvas p-5 gap-3 min-h-0">
          <div className="flex-1 flex flex-col gap-3.5 pt-2 overflow-hidden">
            <div className="h-14 w-[72%] rounded-2xl rounded-br-md bg-ink/[0.07] animate-pulse self-end" />
            <div className="h-20 w-[78%] rounded-2xl rounded-tl-md bg-ink/[0.05] animate-pulse border border-border/40" />
            <div className="h-10 w-[55%] rounded-2xl rounded-br-md bg-ink/[0.07] animate-pulse self-end" />
            <div className="h-16 w-[70%] rounded-2xl rounded-tl-md bg-ink/[0.05] animate-pulse border border-border/40" />
            <div className="h-12 w-[40%] rounded-2xl rounded-br-md bg-ink/[0.07] animate-pulse self-end" />
          </div>
          <div className="h-14 rounded-full bg-surface border border-border animate-pulse shrink-0" />
        </div>

        {/* Scope column */}
        <div className="w-1/2 flex flex-col bg-surface p-6 gap-4 min-h-0">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-ink/[0.06] animate-pulse" />
            <div className="h-8 w-14 rounded-full bg-ink/[0.05] animate-pulse" />
          </div>
          <div className="h-36 rounded-2xl bg-ink/[0.04] border border-border/50 animate-pulse" />
          <div className="h-28 rounded-2xl bg-ink/[0.04] border border-border/50 animate-pulse" />
          <div className="h-28 rounded-2xl bg-ink/[0.04] border border-border/50 animate-pulse" />
          <div className="h-20 rounded-2xl bg-ink/[0.04] border border-border/50 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
