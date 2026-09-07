export type PricingRequestStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "SCOPE_GENERATED"
  | "SCOPE_CONFIRMED"
  | "CANCELLED";

export type ChatMode =
  | "GENERAL"
  | "SCOPING"
  | "SCOPE_GENERATED"
  | "SCOPE_CONFIRMED";

export type MessageRole = "USER" | "AI";

export type AttachmentType = "RFP" | "BRIEF" | "OCG" | "OTHER";

export type AssumptionType = "INCLUDED" | "EXCLUDED" | "RISK";

export interface PricingRequest {
  uid: string;
  firmUid: string;
  matterTitle: string;
  clientProfileUid: string;
  clientName?: string;
  practiceAreaUid?: string | null;
  practiceAreaName?: string | null;
  status: PricingRequestStatus;
  chatMode?: ChatMode;
  scopeGenerated: boolean;
  createdAt: string;
  updatedAt?: string;
  createdByUid?: string;
}

export interface IntakeMessage {
  uid: string;
  pricingRequestUid: string;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ChatBubble {
  id: string;
  type: "user" | "ai" | "tool";
  role?: MessageRole;
  content?: string;
  toolName?: string;
  humanLabel?: string;
  toolStatus?: "running" | "success" | "failed";
  toolError?: string;
  sequence?: number;
  createdAt?: string;
  /** Waiting for the current Lysp turn to finish */
  queued?: boolean;
  /** Stream was stopped by the user */
  cancelled?: boolean;
}

export interface IntakeAttachment {
  uid: string;
  pricingRequestUid: string;
  fileName: string;
  attachmentType: AttachmentType;
  fileSizeBytes?: number;
  createdAt: string;
}

export interface PhaseTask {
  uid: string;
  phaseUid: string;
  description: string;
  feeEarnerLevelUid: string;
  feeEarnerLevelCode?: string;
  feeEarnerLevelName?: string;
  estimatedHours: number;
  sortOrder?: number;
}

export interface MatterPhase {
  uid: string;
  scopeUid: string;
  name: string;
  description?: string;
  sortOrder: number;
  tasks: PhaseTask[];
  practiceAreaUid?: string | null;
}

export interface ScopeAssumption {
  uid: string;
  scopeUid: string;
  description: string;
  type: AssumptionType;
  sortOrder?: number;
}

export interface MatterScope {
  uid: string;
  pricingRequestUid: string;
  aiConfidence: number;
  aiReasoning: string;
  phases: MatterPhase[];
  assumptions: ScopeAssumption[];
  confirmedAt?: string | null;
}

export interface SendMessageResponse {
  userMessage: IntakeMessage;
  aiMessage: IntakeMessage;
  scopeGenerated: boolean;
  scope?: MatterScope | null;
}

export interface CreatePricingRequestCommand {
  clientProfileUid: string;
  /** Sent to API as `title` */
  title: string;
  practiceAreaUid?: string;
  officeCode?: string;
}

export interface SendMessageCommand {
  content: string;
}

export interface CreatePhaseCommand {
  name: string;
  description?: string;
}

export interface UpdatePhaseCommand {
  name?: string;
  description?: string;
  practiceAreaUid?: string;
  clearPracticeAreaUid?: boolean;
}

export interface CreateTaskCommand {
  description: string;
  feeEarnerLevelUid: string;
  estimatedHours: number;
}

export interface UpdateTaskCommand {
  description?: string;
  feeEarnerLevelUid?: string;
  estimatedHours?: number;
}

export interface CreateAssumptionCommand {
  description: string;
  type: AssumptionType;
}

export interface ListPricingRequestsParams {
  status?: PricingRequestStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export interface StreamStartEvent {
  messageUid: string;
  userMessage?: IntakeMessage;
}

export interface StreamTokenEvent {
  content: string;
}

export interface StreamUserMessageEvent {
  id: string;
  sequence?: number;
}

export interface StreamToolStartEvent {
  toolName: string;
  humanLabel?: string;
}

export interface StreamToolResultEvent {
  toolName: string;
  success: boolean;
  error?: string;
}

export interface StreamScopeUpdatedEvent {
  scope: MatterScope;
}

export interface StreamDoneEvent {
  scopeGenerated?: boolean;
  scope?: MatterScope | null;
  chatMode?: ChatMode;
  aiMessageId?: string;
  /** Legacy payload shape */
  userMessage?: IntakeMessage;
  aiMessage?: IntakeMessage;
}

export interface StreamScopeGeneratedEvent {
  scope: MatterScope;
}

export interface StreamErrorEvent {
  message: string;
}
