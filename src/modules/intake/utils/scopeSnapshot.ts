import { MatterScope } from "../types";

/** Snapshot shape accepted by POST /scope/restore (ScopeJsonPayload). */
export interface ScopeRestorePayload {
  confidence: number;
  reasoning: string;
  phases: Array<{
    name: string;
    description?: string;
    sequence: number;
    tasks: Array<{
      description: string;
      feeEarnerLevelCode?: string;
      estimatedHours: number;
    }>;
  }>;
  assumptions: Array<{
    description: string;
    type: string;
    sequence?: number;
  }>;
}

export function matterScopeToRestorePayload(scope: MatterScope): ScopeRestorePayload {
  const phases = [...scope.phases].sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    confidence: Math.round(scope.aiConfidence ?? 0),
    reasoning: scope.aiReasoning ?? "",
    phases: phases.map((phase, index) => ({
      name: phase.name,
      description: phase.description,
      sequence: phase.sortOrder ?? index + 1,
      tasks: phase.tasks.map((task) => ({
        description: task.description,
        feeEarnerLevelCode: task.feeEarnerLevelCode,
        estimatedHours: task.estimatedHours,
      })),
    })),
    assumptions: (scope.assumptions ?? []).map((a, index) => ({
      description: a.description,
      type: a.type,
      sequence: a.sortOrder ?? index + 1,
    })),
  };
}

export function cloneMatterScope(scope: MatterScope): MatterScope {
  return JSON.parse(JSON.stringify(scope)) as MatterScope;
}
