/** Friendly progress steps for pricing scenario generation. */
export type PricingProgressStepId =
  | "prepare"
  | "context"
  | "rates"
  | "comparables"
  | "drafting"
  | "ready";

export interface PricingProgressStep {
  id: PricingProgressStepId;
  label: string;
  detail: string;
}

export const PRICING_PROGRESS_STEPS: PricingProgressStep[] = [
  {
    id: "prepare",
    label: "Preparing workspace",
    detail: "Confirming locked scope and clearing prior drafts",
  },
  {
    id: "context",
    label: "Gathering firm context",
    detail: "Loading rate card, guardrails, and historical signals",
  },
  {
    id: "comparables",
    label: "Finding comparable matters",
    detail: "Reviewing past matters and time benchmarks",
  },
  {
    id: "rates",
    label: "Applying commercial rates",
    detail: "Mapping fee-earner hours to the active rate ladder",
  },
  {
    id: "drafting",
    label: "Drafting fee scenarios",
    detail: "Building fixed, capped hourly, and hybrid options",
  },
  {
    id: "ready",
    label: "Scenarios ready",
    detail: "Compare drafts, tune levers, and pick a preferred option",
  },
];

export const TOOL_TO_PRICING_STEP: Record<string, PricingProgressStepId> = {
  prepare_workspace: "prepare",
  build_rag_context: "context",
  get_locked_scope: "context",
  get_rate_card: "rates",
  get_guardrails: "rates",
  query_past_matters: "comparables",
  get_time_benchmarks: "comparables",
  create_pricing_scenario: "drafting",
  update_scenario_totals: "drafting",
  finalize_scenarios: "ready",
};

export const PRICING_TOOL_THINKING: Record<
  string,
  { running: string; done: string; detail: string }
> = {
  prepare_workspace: {
    running: "Preparing the pricing workspace…",
    done: "Workspace prepared",
    detail: "Locked scope confirmed and prior draft scenarios cleared.",
  },
  build_rag_context: {
    running: "Gathering firm pricing context…",
    done: "Firm context assembled",
    detail: "Pulled past matters, benchmarks, and rate history for this practice.",
  },
  get_locked_scope: {
    running: "Reading the locked scope…",
    done: "Locked scope loaded",
    detail: "Loaded confirmed phases, tasks, and hour estimates.",
  },
  get_rate_card: {
    running: "Loading the active rate card…",
    done: "Rate card loaded",
    detail: "Mapped fee-earner levels to current firm hourly rates.",
  },
  get_guardrails: {
    running: "Checking firm guardrails…",
    done: "Guardrails checked",
    detail: "Applied minimum margin and discount caps for this firm.",
  },
  query_past_matters: {
    running: "Searching comparable matters…",
    done: "Comparables reviewed",
    detail: "Looked at similar past matters for fee and model guidance.",
  },
  get_time_benchmarks: {
    running: "Loading time benchmarks…",
    done: "Time benchmarks loaded",
    detail: "Compared estimated effort to historical hour patterns.",
  },
  create_pricing_scenario: {
    running: "Drafting a fee scenario…",
    done: "Scenario drafted",
    detail: "Created a comparable fee model with totals and rationale.",
  },
  update_scenario_totals: {
    running: "Recalculating totals…",
    done: "Totals updated",
    detail: "Recomputed fees, cost, and margin against guardrails.",
  },
  finalize_scenarios: {
    running: "Finalising scenarios…",
    done: "Scenarios ready",
    detail: "Packaged drafts for comparison in the pricing workspace.",
  },
};

export function pricingStepIndex(id: PricingProgressStepId): number {
  return PRICING_PROGRESS_STEPS.findIndex((s) => s.id === id);
}

export function thinkingForTool(toolName?: string) {
  if (toolName && PRICING_TOOL_THINKING[toolName]) {
    return PRICING_TOOL_THINKING[toolName];
  }
  return {
    running: "Working…",
    done: "Step completed",
    detail: "Finished an internal pricing step.",
  };
}
