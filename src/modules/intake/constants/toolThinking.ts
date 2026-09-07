/** Rich copy for the collapsible thought-process UI (title + what Lysp actually did). */

export interface ToolThinkingCopy {
  /** Short active label while running */
  running: string;
  /** Headline when done */
  done: string;
  /** One-line explanation of what this step means for the matter */
  detail: string;
}

export const TOOL_THINKING: Record<string, ToolThinkingCopy> = {
  get_current_scope: {
    running: "Reading the current engagement plan…",
    done: "Reviewed the current plan",
    detail:
      "Loaded phases, tasks, hours, and assumptions already on this matter so changes stay consistent.",
  },
  query_past_matters: {
    running: "Searching comparable past matters…",
    done: "Looked up similar past matters",
    detail:
      "Pulled firm history for deals with a similar shape — practice area, size, and how work was scoped before.",
  },
  get_time_benchmarks: {
    running: "Checking typical hour ranges…",
    done: "Checked hour benchmarks",
    detail:
      "Compared estimated effort against how long similar phases and tasks usually take at this firm.",
  },
  get_market_benchmarks: {
    running: "Reviewing market context…",
    done: "Reviewed market context",
    detail:
      "Looked at external pricing / effort signals so the plan isn’t only based on this conversation.",
  },
  generate_scope: {
    running: "Drafting the full engagement plan…",
    done: "Drafted the engagement plan",
    detail:
      "Built phases, tasks, fee-earner mix, hour estimates, and assumptions into a partner-ready scope.",
  },
  add_phase: {
    running: "Adding a phase to the plan…",
    done: "Added a phase",
    detail: "Inserted a new stage of work into the engagement timeline.",
  },
  update_phase: {
    running: "Updating a phase…",
    done: "Updated a phase",
    detail: "Adjusted phase name, sequence, or description to match the matter.",
  },
  delete_phase: {
    running: "Removing a phase…",
    done: "Removed a phase",
    detail: "Dropped a stage that no longer belongs in this engagement.",
  },
  add_task: {
    running: "Adding a task…",
    done: "Added a task",
    detail: "Broke work into a concrete task with fee earner and hour estimate.",
  },
  update_task: {
    running: "Updating task hours or staffing…",
    done: "Updated a task",
    detail: "Changed description, fee-earner level, or estimated hours on a task.",
  },
  delete_task: {
    running: "Removing a task…",
    done: "Removed a task",
    detail: "Took a task out of the plan that shouldn’t be included.",
  },
  add_assumption: {
    running: "Recording an assumption…",
    done: "Added an assumption",
    detail:
      "Captured what’s included, excluded, or a risk boundary so pricing stays clear.",
  },
  delete_assumption: {
    running: "Removing an assumption…",
    done: "Removed an assumption",
    detail: "Cleared a boundary that no longer applies to this matter.",
  },
};

export function thinkingCopyFor(toolName?: string): ToolThinkingCopy {
  if (toolName && TOOL_THINKING[toolName]) return TOOL_THINKING[toolName];
  return {
    running: "Working…",
    done: "Completed a step",
    detail: "Finished an internal step while preparing your reply.",
  };
}
