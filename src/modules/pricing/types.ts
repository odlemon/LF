export type PricingModel =
  | "FIXED_FEE"
  | "HOURLY"
  | "HOURLY_WITH_CAP"
  | "HYBRID"
  | "RETAINER"
  | "BLENDED";

export type PricingScenarioStatus =
  | "GENERATING"
  | "GENERATION_FAILED"
  | "DRAFT"
  | "RETURNED_FOR_CORRECTION"
  | "PENDING_PARTNER"
  | "PENDING_FINANCE"
  | "APPROVED"
  | "REJECTED";

export interface PricingScenarioLine {
  id: string;
  scenarioUid: string;
  phaseUid?: string | null;
  phaseName?: string | null;
  feeEarnerLevelUid?: string | null;
  feeEarnerLevelCode?: string | null;
  feeEarnerLevelName?: string | null;
  description?: string | null;
  hours: number;
  hourlyRate: number;
  amount: number;
  sortOrder: number;
}

export interface ScenarioChangeEntry {
  label: string;
  before: number | null;
  after: number | null;
  direction: "up" | "down" | "same" | string;
  moneyLike?: boolean;
}

export interface ScenarioLineChange {
  label: string;
  kind: "updated" | "added" | "removed" | string;
  beforeAmount: number | null;
  afterAmount: number | null;
}

export interface ScenarioChangeSummary {
  computedAt?: string;
  hasChanges?: boolean;
  entries: ScenarioChangeEntry[];
  lineChanges: ScenarioLineChange[];
}

export interface PricingScenario {
  id: string;
  firmUid: string;
  pricingRequestUid: string;
  matterScopeUid: string;
  name: string;
  pricingModel: PricingModel;
  status: PricingScenarioStatus;
  currency: string;
  grossFees: number;
  estimatedCost: number;
  marginPct: number;
  capAmount?: number | null;
  hoursMultiplier: number;
  discountPct: number;
  aiConfidence?: number | null;
  aiReasoning?: string | null;
  preferred: boolean;
  assignedPartnerUserUid?: string | null;
  assignedPartnerEmail?: string | null;
  assignedPartnerName?: string | null;
  submittedByUserUid?: string | null;
  submittedByEmail?: string | null;
  submittedAt?: string | null;
  decisionComment?: string | null;
  decidedAt?: string | null;
  decidedByEmail?: string | null;
  returnComment?: string | null;
  returnSnapshotJson?: string | null;
  changeSummaryJson?: string | null;
  confidenceDrivers?: string | null;
  confidenceMethod?: "v1" | "deterministic-v1" | string | null;
  generationMode?: "AGENT" | "DETERMINISTIC_FALLBACK" | "PARTIAL_FALLBACK" | string | null;
  generationNote?: string | null;
  createdAt?: string;
  updatedAt?: string;
  lines?: PricingScenarioLine[];
}

export interface ConfidenceDrivers {
  method: string;
  sampleSize: number;
  sampleScore: number;
  feeVarianceStdDevPct: number | null;
  varianceScore: number;
  rateCardCoveragePct: number;
  coverageScore: number;
  marginHeadroomPts: number | null;
  headroomScore: number;
  weights: { sample: number; variance: number; coverage: number; headroom: number };
}

export interface ApprovalPackPhase {
  name: string;
  taskCount: number;
  hours: number;
  feePortion: number | null;
}

export interface ApprovalPackAssumption {
  type: string;
  text: string;
}

export interface ApprovalPack {
  scopeSummary: string;
  totalHours: number;
  phaseCount: number;
  phases: ApprovalPackPhase[];
  assumptions: ApprovalPackAssumption[];
  marginPct: number | null;
  firmMinMarginPct: number | null;
  marginHeadroomPts: number | null;
  guardrailStatus: "PASS" | "AT_FLOOR" | "BELOW_FLOOR" | string;
  discountPct: number | null;
  discountApprovalLevel: "AUTO" | "PARTNER" | "COMMITTEE" | string;
  clientName: string | null;
  clientTier: string | null;
  clientMatterCount: number;
  clientAvgMarginPct: number | null;
  comparableCount: number;
}

export interface ScenarioComparable {
  uid: string;
  matterReference?: string | null;
  matterTitle?: string | null;
  practiceAreaCode?: string | null;
  clientType?: string | null;
  jurisdiction?: string | null;
  complexity?: string | null;
  pricingModel?: string | null;
  currency?: string | null;
  totalFee: number | null;
  estimatedFee: number | null;
  feeVariancePct: number | null;
  actualHours: number | null;
  hoursVariancePct: number | null;
  marginPct: number | null;
  outcome?: string | null;
  matterClosedOn?: string | null;
  similarityScore: number;
  matchReasons: string[];
  rankPosition: number;
  excluded: boolean;
}

export interface PricingApprover {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName: string;
  roles: string[];
}

export interface ScenarioDecisionCommand {
  comment?: string;
}

export interface ScenarioLineEdit {
  id?: string | null;
  phaseUid?: string | null;
  phaseName?: string | null;
  feeEarnerLevelUid?: string | null;
  feeEarnerLevelCode?: string | null;
  feeEarnerLevelName?: string | null;
  description?: string | null;
  hours: number;
  hourlyRate: number;
  remove?: boolean;
}

export interface UpdateScenarioCommand {
  hoursMultiplier?: number;
  discountPct?: number;
  capAmount?: number | null;
  name?: string;
  pricingModel?: PricingModel;
  lines?: ScenarioLineEdit[];
}

export interface SubmitPartnerResponse {
  scenario: PricingScenario;
  message: string;
}

export type GenerationJobStatus =
  | "IDLE"
  | "QUEUED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED";

export interface GenerationProgressEvent {
  type: string;
  toolName?: string;
  label?: string;
  success?: boolean;
  sequence?: number;
  at?: string;
}

export interface PricingGenerationJob {
  id: string | null;
  pricingRequestUid: string;
  status: GenerationJobStatus | string;
  currentStage?: string | null;
  currentLabel?: string | null;
  events: GenerationProgressEvent[];
  scenarioCount?: number | null;
  errorMessage?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  active: boolean;
}

export const PRICING_MODEL_LABELS: Record<PricingModel, string> = {
  FIXED_FEE: "Fixed fee",
  HOURLY: "Hourly",
  HOURLY_WITH_CAP: "Hourly with cap",
  HYBRID: "Hybrid",
  RETAINER: "Retainer",
  BLENDED: "Blended",
};
