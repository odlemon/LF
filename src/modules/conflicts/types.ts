export type ConflictCheckStatus =
  | "NOT_STARTED"
  | "PENDING_REVIEW"
  | "CLEARED"
  | "WAIVED"
  | "FLAGGED";

export type ConflictPartyRole =
  | "CLIENT"
  | "OPPOSING_PARTY"
  | "RELATED_ENTITY"
  | "OTHER";

export type ConflictMatchSource = "EXISTING_CLIENT" | "PRIOR_MATTER_PARTY";

export type ConflictMatchResolution =
  | "UNRESOLVED"
  | "ACKNOWLEDGED_NOT_A_CONFLICT"
  | "CONFIRMED_CONFLICT";

export interface ConflictCheck {
  uid: string;
  firmUid: string;
  pricingRequestUid: string;
  clientProfileUid: string;
  status: ConflictCheckStatus;
  initiatedByUid?: string | null;
  initiatedAt?: string | null;
  clearedByUid?: string | null;
  clearedAt?: string | null;
  clearanceNote?: string | null;
}

export interface ConflictParty {
  uid: string;
  name: string;
  role: ConflictPartyRole;
}

export interface ConflictMatch {
  uid: string;
  conflictPartyUid: string;
  matchedSource: ConflictMatchSource;
  matchedName: string;
  matchedReferenceUid?: string | null;
  resolution: ConflictMatchResolution;
}

export interface ConflictCheckView {
  check: ConflictCheck;
  parties: ConflictParty[];
  matches: ConflictMatch[];
}

export interface PartySubmission {
  name: string;
  role: ConflictPartyRole;
}

export interface ClearConflictCheckCommand {
  decision: "CLEARED" | "WAIVED" | "FLAGGED";
  note?: string;
  matchResolutions?: Record<string, ConflictMatchResolution>;
}
