export function PricingWorkspaceSkeleton() {
  return (
    <div
      className="h-[calc(100vh-64px)] flex flex-col bg-canvas"
      aria-busy="true"
      aria-label="Loading pricing workspace"
    >
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-ink/[0.06] animate-pulse shrink-0" />
          <div className="min-w-0 flex flex-col gap-1.5">
            <div className="h-4 w-52 max-w-[50vw] rounded-md bg-ink/[0.08] animate-pulse" />
            <div className="h-3 w-28 rounded-md bg-ink/[0.05] animate-pulse" />
          </div>
        </div>
        <div className="h-8 w-28 rounded-full bg-ink/[0.06] animate-pulse shrink-0" />
      </div>
      <div className="flex-1 flex min-h-0">
        <div className="w-full lg:w-[55%] p-6 space-y-4 border-r border-border/60">
          <div className="h-28 rounded-2xl bg-ink/[0.05] animate-pulse" />
          <div className="h-28 rounded-2xl bg-ink/[0.05] animate-pulse" />
          <div className="h-28 rounded-2xl bg-ink/[0.05] animate-pulse" />
        </div>
        <div className="hidden lg:flex flex-1 flex-col p-6 gap-4">
          <div className="h-8 w-40 rounded-md bg-ink/[0.06] animate-pulse" />
          <div className="h-12 w-48 rounded-md bg-ink/[0.08] animate-pulse" />
          <div className="h-40 rounded-2xl bg-ink/[0.04] animate-pulse" />
          <div className="h-56 rounded-2xl bg-ink/[0.04] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
