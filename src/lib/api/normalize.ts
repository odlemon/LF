import { ClientProfile } from "@/modules/firm/types";
import { ChatMode, IntakeMessage, PricingRequest } from "@/modules/intake/types";

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
