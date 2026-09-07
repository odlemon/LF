/** Friendly, non-technical progress for the scope panel while Lysp works. */
export type ScopeProgressStepId =
  | "listening"
  | "research"
  | "comparables"
  | "drafting"
  | "refining"
  | "ready";

export interface ScopeProgressStep {
  id: ScopeProgressStepId;
  label: string;
  detail: string;
}

export const SCOPE_PROGRESS_STEPS: ScopeProgressStep[] = [
  {
    id: "listening",
    label: "Understanding the matter",
    detail: "Reading what you’ve described and any attached documents",
  },
  {
    id: "research",
    label: "Gathering firm context",
    detail: "Checking practice setup and fee-earner levels",
  },
  {
    id: "comparables",
    label: "Finding comparable matters",
    detail: "Looking at similar past work, hours, and outcomes",
  },
  {
    id: "drafting",
    label: "Building the work plan",
    detail: "Drafting phases, tasks, and hour estimates",
  },
  {
    id: "refining",
    label: "Refining the plan",
    detail: "Adjusting allocations and assumptions",
  },
  {
    id: "ready",
    label: "Scope ready",
    detail: "Review on the right, or ask for changes in chat",
  },
];

/** Map intake tools → the progress step a partner would care about.
 *  Only used for the *initial* scope build (empty panel → first plan).
 *  Post-scope edits stay in the chat thinking process, not this panel. */
export const TOOL_PROGRESS_STEP: Record<string, ScopeProgressStepId> = {
  get_current_scope: "research",
  query_past_matters: "comparables",
  get_time_benchmarks: "comparables",
  get_market_benchmarks: "comparables",
  generate_scope: "drafting",
  // Incremental first-build (some models add pieces instead of generate_scope)
  add_phase: "drafting",
  add_task: "drafting",
  add_assumption: "drafting",
};

/** Tools that mean Lysp is building the first plan — show BUILDING SCOPE panel. */
export const SCOPE_GENERATION_TOOLS = new Set(Object.keys(TOOL_PROGRESS_STEP));

export const FRIENDLY_TOOL_LABELS: Record<string, string> = {
  get_current_scope: "Checking the current plan…",
  query_past_matters: "Reviewing comparable matters…",
  get_time_benchmarks: "Checking typical hours…",
  get_market_benchmarks: "Looking at market benchmarks…",
  generate_scope: "Drafting your engagement plan…",
  add_phase: "Adding a phase…",
  add_task: "Adding a task…",
  update_phase: "Updating a phase…",
  update_task: "Updating hours…",
  delete_phase: "Removing a phase…",
  delete_task: "Removing a task…",
  add_assumption: "Updating assumptions…",
  delete_assumption: "Updating assumptions…",
};

export function stepIndex(id: ScopeProgressStepId): number {
  return SCOPE_PROGRESS_STEPS.findIndex((s) => s.id === id);
}
