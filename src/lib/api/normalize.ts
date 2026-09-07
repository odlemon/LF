import { ClientProfile } from "@/modules/firm/types";
import {
  AssumptionType,
  ChatMode,
  IntakeAttachment,
  IntakeMessage,
  MatterPhase,
  MatterScope,
  PhaseTask,
  PricingRequest,
  ScopeAssumption,
} from "@/modules/intake/types";

/** Backend exposes public `id`; frontend uses `uid` consistently. */
export function normalizeClient(raw: Record<string, unknown>): ClientProfile {
  return {
    uid: String(raw.id ?? raw.uid ?? ""),
    firmUid: String(raw.firmUid ?? ""),
    name: String(raw.name ?? ""),
    type: raw.type as ClientProfile["type"],
    tier: raw.tier as ClientProfile["tier"],
    contactEmail: String(raw.contactEmail ?? ""),
    contactName: String(raw.contactName ?? ""),
    country: String(raw.country ?? ""),
  };
}

export function normalizePhaseTask(
  raw: Record<string, unknown>,
  phaseUid = ""
): PhaseTask {
  const hours = raw.estimatedHours;
  return {
    uid: String(raw.id ?? raw.uid ?? ""),
    phaseUid: String(raw.phaseUid ?? phaseUid),
    description: String(raw.description ?? ""),
    feeEarnerLevelUid: String(raw.feeEarnerLevelUid ?? ""),
    feeEarnerLevelCode:
      raw.feeEarnerLevelCode != null ? String(raw.feeEarnerLevelCode) : undefined,
    feeEarnerLevelName:
      raw.feeEarnerLevelName != null ? String(raw.feeEarnerLevelName) : undefined,
    estimatedHours:
      typeof hours === "number"
        ? hours
        : hours != null
          ? Number(hours)
          : 0,
    sortOrder:
      raw.sortOrder != null
        ? Number(raw.sortOrder)
        : raw.sequence != null
          ? Number(raw.sequence)
          : undefined,
  };
}

export function normalizeMatterPhase(
  raw: Record<string, unknown>,
  scopeUid = ""
): MatterPhase {
  const phaseUid = String(raw.id ?? raw.uid ?? "");
  const tasksRaw = Array.isArray(raw.tasks) ? raw.tasks : [];
  return {
    uid: phaseUid,
    scopeUid: String(raw.scopeUid ?? scopeUid),
    name: String(raw.name ?? ""),
    description: raw.description != null ? String(raw.description) : undefined,
    sortOrder:
      raw.sortOrder != null
        ? Number(raw.sortOrder)
        : raw.sequence != null
          ? Number(raw.sequence)
          : 0,
    tasks: tasksRaw.map((task) =>
      normalizePhaseTask(task as Record<string, unknown>, phaseUid)
    ),
    practiceAreaUid: raw.practiceAreaUid != null ? String(raw.practiceAreaUid) : null,
  };
}

export function normalizeScopeAssumption(
  raw: Record<string, unknown>,
  scopeUid = ""
): ScopeAssumption {
  const typeRaw = raw.type ?? raw.assumptionType ?? "INCLUDED";
  return {
    uid: String(raw.id ?? raw.uid ?? ""),
    scopeUid: String(raw.scopeUid ?? scopeUid),
    description: String(raw.description ?? ""),
    type: typeRaw as AssumptionType,
    sortOrder:
      raw.sortOrder != null
        ? Number(raw.sortOrder)
        : raw.sequence != null
          ? Number(raw.sequence)
          : undefined,
  };
}

/** Backend scope/phase/task use `id` + `sequence`; frontend uses `uid` + `sortOrder`. */
export function normalizeMatterScope(raw: Record<string, unknown>): MatterScope {
  const scopeUid = String(raw.id ?? raw.uid ?? "");
  const phasesRaw = Array.isArray(raw.phases) ? raw.phases : [];
  const assumptionsRaw = Array.isArray(raw.assumptions) ? raw.assumptions : [];
  const confidence = raw.aiConfidence;
  return {
    uid: scopeUid,
    pricingRequestUid: String(raw.pricingRequestUid ?? ""),
    aiConfidence:
      typeof confidence === "number"
        ? confidence
        : confidence != null
          ? Number(confidence)
          : 0,
    aiReasoning: String(raw.aiReasoning ?? ""),
    phases: phasesRaw.map((phase) =>
      normalizeMatterPhase(phase as Record<string, unknown>, scopeUid)
    ),
    assumptions: assumptionsRaw.map((assumption) =>
      normalizeScopeAssumption(assumption as Record<string, unknown>, scopeUid)
    ),
    confirmedAt:
      raw.confirmedAt != null ? String(raw.confirmedAt) : null,
  };
}

export function normalizeAttachment(raw: Record<string, unknown>): IntakeAttachment {
  return {
    uid: String(raw.id ?? raw.uid ?? ""),
    pricingRequestUid: String(
      raw.pricingRequestUid ?? raw.pricingRequestId ?? ""
    ),
    fileName: String(
      raw.originalFilename ?? raw.fileName ?? raw.filename ?? "Attachment"
    ),
    attachmentType: (raw.attachmentType as IntakeAttachment["attachmentType"]) ?? "OTHER",
    fileSizeBytes:
      raw.fileSizeBytes != null ? Number(raw.fileSizeBytes) : undefined,
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

/** Backend messages expose `id`; frontend uses `uid`. */
export function normalizeIntakeMessage(raw: Record<string, unknown>): IntakeMessage {
  const messageUid = String(raw.id ?? raw.uid ?? "");
  return {
    uid: messageUid,
    pricingRequestUid: String(
      raw.pricingRequestUid ?? raw.pricingRequestId ?? ""
    ),
    role: raw.role as IntakeMessage["role"],
    content: String(raw.content ?? ""),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  };
}

/** Deduplicate by uid, keeping the last occurrence. */
export function dedupeIntakeMessages(messages: IntakeMessage[]): IntakeMessage[] {
  const byUid = new Map<string, IntakeMessage>();
  for (const msg of messages) {
    const key = msg.uid || `fallback-${msg.role}-${msg.createdAt}-${byUid.size}`;
    byUid.set(key, msg);
  }
  return Array.from(byUid.values());
}

/** Backend pricing request uses `id` + `title`; frontend uses `uid` + `matterTitle`. */
export function normalizePricingRequest(raw: Record<string, unknown>): PricingRequest {
  return {
    uid: String(raw.id ?? raw.uid ?? ""),
    firmUid: String(raw.firmUid ?? ""),
    matterTitle: String(raw.title ?? raw.matterTitle ?? ""),
    clientProfileUid: String(raw.clientProfileUid ?? ""),
    clientName: raw.clientName != null ? String(raw.clientName) : undefined,
    practiceAreaUid:
      raw.practiceAreaUid != null ? String(raw.practiceAreaUid) : null,
    practiceAreaName:
      raw.practiceAreaName != null ? String(raw.practiceAreaName) : null,
    status: raw.status as PricingRequest["status"],
    chatMode: (raw.chatMode as ChatMode | undefined) ?? "GENERAL",
    scopeGenerated: Boolean(raw.scopeGenerated ?? false),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    updatedAt: raw.updatedAt != null ? String(raw.updatedAt) : undefined,
    createdByUid:
      raw.requestedByUid != null
        ? String(raw.requestedByUid)
        : raw.createdByUid != null
        ? String(raw.createdByUid)
        : undefined,
  };
}
