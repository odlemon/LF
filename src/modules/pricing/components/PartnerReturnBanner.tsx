"use client";

interface PartnerReturnBannerProps {
  comment: string;
  partnerName?: string | null;
  decidedAt?: string | null;
  /** Owner correcting vs partner reviewing resubmission */
  tone?: "correction" | "review";
  className?: string;
}

export function PartnerReturnBanner({
  comment,
  partnerName,
  decidedAt,
  tone = "correction",
  className = "",
}: PartnerReturnBannerProps) {
  const isCorrection = tone === "correction";

  return (
    <aside
      className={`relative overflow-hidden rounded-2xl border ${
        isCorrection
          ? "border-amber-200/90 bg-gradient-to-br from-amber-50 via-amber-50/40 to-surface dark:border-amber-800/50 dark:from-amber-950/50 dark:via-amber-950/20 dark:to-surface"
          : "border-border/80 bg-gradient-to-br from-field/80 via-surface to-surface"
      } ${className}`}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full opacity-30"
        style={{
          background: isCorrection
            ? "radial-gradient(circle, rgba(217,119,6,0.35), transparent 70%)"
            : "radial-gradient(circle, rgba(10,10,10,0.08), transparent 70%)",
        }}
      />
      <div className="relative px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
              isCorrection
                ? "border-amber-300/80 bg-amber-100/80 text-amber-950 dark:border-amber-700/60 dark:bg-amber-900/40 dark:text-amber-100"
                : "border-border bg-field text-ink/70"
            }`}
          >
            {isCorrection ? "Action required" : "Partner request"}
          </span>
          {partnerName && (
            <span className="text-[11px] text-ink/45">
              from {partnerName}
              {decidedAt
                ? ` · ${new Date(decidedAt).toLocaleString()}`
                : ""}
            </span>
          )}
        </div>
        <h3 className="mt-2.5 text-base font-semibold tracking-tight text-ink">
          {isCorrection
            ? "Returned for correction"
            : "What the partner asked to change"}
        </h3>
        <blockquote className="mt-3 border-l-2 border-amber-500/50 pl-3 text-sm leading-relaxed text-ink/75 whitespace-pre-wrap">
          {comment}
        </blockquote>
        {isCorrection && (
          <p className="mt-3 text-[11px] text-ink/45 leading-relaxed">
            Update the economics below, then resubmit — it goes straight back to
            the same partner.
          </p>
        )}
      </div>
    </aside>
  );
}
