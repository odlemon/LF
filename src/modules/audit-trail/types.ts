export type ActionType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "SUBMIT"
  | "SEND"
  | "ACTIVATE"
  | "DEACTIVATE"
  | "LOGIN"
  | "LOGOUT"
  | "EXPORT"
  | "INVITE";

export interface AuditEvent {
  id: string;
  firmUid: string;
  actorUid: string;
  actorName: string;
  actionType: ActionType;
  resourceName: string;
  resourceDescription: string;
  entityUid: string | null;
  entityType: string | null;
  createdAt: string;
}

export interface AuditTrailFilter {
  entityUid?: string;
  actorUid?: string;
  actionType?: string;
  resourceName?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Action labels map for tables and pages
export const ACTION_LABEL_MAP: Record<ActionType, string> = {
  CREATE: "Created",
  UPDATE: "Updated",
  DELETE: "Deleted",
  APPROVE: "Approved",
  REJECT: "Rejected",
  SUBMIT: "Submitted",
  SEND: "Sent",
  ACTIVATE: "Activated",
  DEACTIVATE: "Deactivated",
  LOGIN: "Logged in",
  LOGOUT: "Logged out",
  EXPORT: "Exported",
  INVITE: "Invited",
};

// Timeline sentence templates
export const ACTION_SENTENCE_MAP: Record<ActionType, (resource: string) => string> = {
  CREATE: (res) => `created this ${res.toLowerCase()}`,
  UPDATE: (res) => `updated this ${res.toLowerCase()}`,
  DELETE: (res) => `deleted this ${res.toLowerCase()}`,
  APPROVE: (res) => `approved this ${res.toLowerCase()}`,
  REJECT: (res) => `rejected this ${res.toLowerCase()}`,
  SUBMIT: (res) => `submitted this ${res.toLowerCase()} for approval`,
  SEND: (res) => `sent this ${res.toLowerCase()}`,
  ACTIVATE: (res) => `activated this ${res.toLowerCase()}`,
  DEACTIVATE: (res) => `deactivated this ${res.toLowerCase()}`,
  LOGIN: () => "logged in",
  LOGOUT: () => "logged out",
  EXPORT: (res) => `exported this ${res.toLowerCase()}`,
  INVITE: () => "sent an invitation",
};

// Action colors map for timeline icons
export const ACTION_COLOR_MAP: Record<ActionType, string> = {
  CREATE: "bg-emerald-500",
  ACTIVATE: "bg-emerald-500",
  APPROVE: "bg-emerald-500",
  UPDATE: "bg-primary",
  SUBMIT: "bg-primary",
  SEND: "bg-primary",
  INVITE: "bg-primary",
  EXPORT: "bg-gray-400",
  LOGIN: "bg-gray-400",
  LOGOUT: "bg-gray-400",
  DEACTIVATE: "bg-yellow-500",
  REJECT: "bg-red-500",
  DELETE: "bg-red-500",
};
