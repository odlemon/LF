import type { PricingScenarioStatus } from "../types";

type BadgeVariant = "neutral" | "info" | "warning" | "success" | "error" | "accent";

const STATUS_CONFIG: Record<
  PricingScenarioStatus,
  { variant: BadgeVariant; label: string; hint: string }
> = {
  GENERATING: {
    variant: "info",
    label: "Generating",
    hint: "Deep research in progress",
  },
  GENERATION_FAILED: {
    variant: "error",
    label: "Generation failed",
    hint: "Retry generation",
  },
  DRAFT: {
    variant: "neutral",
    label: "Draft",
    hint: "Editable · not submitted",
  },
  RETURNED_FOR_CORRECTION: {
    variant: "warning",
    label: "Returned for correction",
    hint: "Partner asked for changes — edit and resubmit",
  },
  PENDING_PARTNER: {
    variant: "warning",
    label: "Pending partner review",
    hint: "Awaiting partner decision",
  },
  PENDING_FINANCE: {
    variant: "accent",
    label: "Pending finance",
    hint: "Awaiting finance sign-off",
  },
  APPROVED: {
    variant: "success",
    label: "Approved",
    hint: "Ready to send to the client for negotiation",
  },
  REJECTED: {
    variant: "error",
    label: "Rejected",
    hint: "Partner declined this scenario",
  },
};

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  neutral: "bg-field text-ink/70 border-border/70",
  info: "bg-sky-50 text-sky-800 border-sky-200/70 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800/50",
  warning:
    "bg-amber-50 text-amber-900 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-800/50",
  success:
    "bg-emerald-50 text-emerald-900 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-800/50",
  error:
    "bg-rose-50 text-rose-800 border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800/50",
  accent:
    "bg-indigo-50 text-indigo-900 border-indigo-200/70 dark:bg-indigo-950/40 dark:text-indigo-100 dark:border-indigo-800/50",
};

const DOT_STYLES: Record<BadgeVariant, string> = {
  neutral: "bg-ink/35",
  info: "bg-sky-500",
  warning: "bg-amber-500",
  success: "bg-emerald-600",
  error: "bg-rose-500",
  accent: "bg-indigo-500",
};

export function scenarioStatusMeta(status: PricingScenarioStatus | string) {
  return (
    STATUS_CONFIG[status as PricingScenarioStatus] ?? {
      variant: "neutral" as BadgeVariant,
      label: String(status).replace(/_/g, " "),
      hint: "",
    }
  );
}

interface ScenarioStatusBadgeProps {
  status: PricingScenarioStatus | string;
  className?: string;
  showDot?: boolean;
  size?: "sm" | "md";
}

export function ScenarioStatusBadge({
  status,
  className = "",
  showDot = true,
  size = "md",
}: ScenarioStatusBadgeProps) {
  const config = scenarioStatusMeta(status);
  const sizeClass =
    size === "sm"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-1 text-[11px]";

  return (
    <span
      title={config.hint}
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-tight ${VARIANT_STYLES[config.variant]} ${sizeClass} ${className}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${DOT_STYLES[config.variant]}`}
          aria-hidden
        />
      )}
      {config.label}
    </span>
  );
}

/** Compact stage rail for the preferred / selected scenario. */
const STAGE_ORDER: PricingScenarioStatus[] = [
  "DRAFT",
  "PENDING_PARTNER",
  "PENDING_FINANCE",
  "APPROVED",
];

export function ScenarioStageRail({
  status,
  className = "",
}: {
  status: PricingScenarioStatus | string;
  className?: string;
}) {
  const current = status as PricingScenarioStatus;
  const rejected = current === "REJECTED";
  const returned = current === "RETURNED_FOR_CORRECTION";
  const generating =
    current === "GENERATING" || current === "GENERATION_FAILED";

  let activeIdx = STAGE_ORDER.indexOf(current);
  if (current === "APPROVED") activeIdx = 3;
  if (returned) activeIdx = 0;
  if (rejected) activeIdx = -1;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
          Pricing stage
        </p>
        <ScenarioStatusBadge status={status} size="sm" />
      </div>
      {generating ? (
        <p className="text-xs text-ink/50">
          {scenarioStatusMeta(status).hint}
        </p>
      ) : rejected ? (
        <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
          Rejected — returned to the team as closed without approval.
        </p>
      ) : returned ? (
        <div className="space-y-2">
          <ol className="flex items-center gap-1 sm:gap-1.5">
            {STAGE_ORDER.map((stage, i) => {
              const label =
                stage === "DRAFT"
                  ? "Correction"
                  : stage === "PENDING_PARTNER"
                    ? "Partner"
                    : stage === "PENDING_FINANCE"
                      ? "Finance"
                      : scenarioStatusMeta(stage).label;
              const active = i === 0;
              return (
                <li key={stage} className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div
                    className={`h-1 rounded-full transition-colors ${
                      active ? "bg-amber-500" : "bg-field"
                    } ${active ? "ring-2 ring-amber-500/25 ring-offset-1 ring-offset-canvas" : ""}`}
                  />
                  <span
                    className={`text-[9px] sm:text-[10px] font-semibold truncate ${
                      active ? "text-amber-900 dark:text-amber-200" : "text-ink/30"
                    }`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
            Partner returned this scenario — address their comments, then send it
            back.
          </p>
        </div>
      ) : (
        <ol className="flex items-center gap-1 sm:gap-1.5">
          {STAGE_ORDER.map((stage, i) => {
            const done = activeIdx > i;
            const active = activeIdx === i;
            const label =
              stage === "PENDING_PARTNER"
                ? "Partner"
                : stage === "PENDING_FINANCE"
                  ? "Finance"
                  : scenarioStatusMeta(stage).label;
            return (
              <li key={stage} className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div
                  className={`h-1 rounded-full transition-colors ${
                    done || active ? "bg-ink" : "bg-field"
                  } ${active ? "ring-2 ring-ink/15 ring-offset-1 ring-offset-canvas" : ""}`}
                />
                <span
                  className={`text-[9px] sm:text-[10px] font-semibold truncate ${
                    active ? "text-ink" : done ? "text-ink/55" : "text-ink/30"
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
