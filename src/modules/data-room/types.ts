export type DataCategory =
  | "PAST_MATTERS"
  | "TIME_ENTRIES"
  | "BILLING_HISTORY"
  | "RATE_CARD_HISTORY"
  | "MARKET_BENCHMARKS"
  | "CLIENT_OCG"
  | "MATTER_ASSUMPTIONS"
  | "OTHER";

export type FileType = "CSV" | "XLS" | "XLSX" | "PDF" | "DOC" | "DOCX" | "JSON" | "WORD" | "OTHER";

export type DatasetStatus = "PENDING" | "PROCESSING" | "COMPLETE" | "PARTIAL" | "FAILED";

export type DocumentStatus =
  | "UPLOADED"
  | "QUEUED"
  | "PROCESSING"
  | "PROCESSED"
  | "PROCESSING_FAILED"
  | "SKIPPED";

export type ColumnMappingStatus = "MAPPED" | "PARTIAL" | "UNMAPPED";

export type DataReadiness = "HIGH" | "MEDIUM" | "LOW";

// ABANDONED is written by the backend and branched on there alongside LOST; it was
// missing here, so those matters were invisible to the outcome filter.
export type MatterOutcome = "WON" | "LOST" | "SETTLED" | "ONGOING" | "ABANDONED";

export type DataComplexity = "LOW" | "MEDIUM" | "HIGH";

export interface DataRoomSummary {
  dataReadiness: DataReadiness;
  totalPastMatters: number;
  totalTimeEntries: number;
  processedDocumentsCount: number;
  totalDocumentsCount: number;
  coveredPracticeAreas: string[];
}

export interface Dataset {
  uid: string;
  name: string;
  category: DataCategory;
  description?: string;
  sourceSystem?: string;
  periodStart?: string; // ISO date string
  periodEnd?: string;   // ISO date string
  status: DatasetStatus;
  totalDocuments: number;
  processedDocuments: number;
  failedDocuments: number;
  skippedDocuments: number;
  totalRecords: number;
  createdAt: string;    // ISO date string
}

export interface DatasetStats {
  datasetUid: string;
  totalDocuments: number;
  processedDocuments: number;
  failedDocuments: number;
  totalRecordsExtracted: number;
}

export interface DataRoomDocument {
  uid: string;
  datasetUid: string;
  originalFilename: string;
  filePath: string;
  fileSizeBytes: number;
  fileType: FileType;
  status: DocumentStatus;
  recordsExtracted: number;
  rowsAttempted: number;
  rowsFailed: number;
  columnMappingStatus: ColumnMappingStatus;
  columnMapping: Record<string, string | null>;
  retryCount: number;
  createdAt?: string;
  processedAt?: string;
  errorMessage?: string;
}

export interface RowError {
  rowNumber: number;
  errorMessage: string;
}

export interface ProcessingLog {
  uid: string;
  documentUid: string;
  attemptNumber: number;
  status: DocumentStatus;
  startedAt: string;
  completedAt?: string;
  rowsRead: number;
  rowsProcessed: number;
  rowsFailed: number;
  columnMapping: Record<string, string | null>;
  errorMessage?: string;
  rowErrors: RowError[];
}

export interface PastMatterRecord {
  uid: string;
  documentUid: string;
  matterReference: string;
  title: string;
  practiceAreaCode: string;
  clientType: string;
  totalFee: number;
  pricingModel: string;
  outcome: MatterOutcome;
  matterEndDate?: string;
  complexity: DataComplexity;
}

export interface TimeEntryRecord {
  uid: string;
  documentUid: string;
  matterReference: string;
  feeEarnerName: string;
  feeEarnerLevelCode: string;
  hours: number;
  taskDescription?: string;
  entryDate: string;
  billedRate: number;
  billedAmount: number;
}

export interface BillingHistoryRecord {
  uid: string;
  documentUid: string;
  matterReference: string;
  clientName: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
}

export interface RateCardHistoryRecord {
  uid: string;
  documentUid: string;
  rateCardName: string;
  feeEarnerLevelCode: string;
  practiceAreaCode: string;
  hourlyRate: number;
  currency: string;
  effectiveYear: number;
}

export interface MarketBenchmarkRecord {
  uid: string;
  documentUid: string;
  source: string;
  practiceAreaCode: string;
  jurisdiction: string;
  feeEarnerLevelCode: string;
  lowRate: number;
  medianRate: number;
  highRate: number;
  currency: string;
  surveyYear: number;
}

export interface ColumnMappingTemplate {
  uid: string;
  firmUid: string;
  category: DataCategory;
  sourceSystem: string;
  mapping: Record<string, string>;
  isDefault: boolean;
}

// Commands
export interface CreateDatasetCommand {
  name: string;
  category: DataCategory;
  description?: string;
  sourceSystem?: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface UpdateColumnMappingCommand {
  columnMapping: Record<string, string | null>;
}

export interface SaveMappingTemplateCommand {
  category: DataCategory;
  sourceSystem: string;
  mapping: Record<string, string>;
}

export type FileStorageStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "SUSPENDED" | "DELETED";

export interface FileMetadata {
  uid: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  bucketName: string;
  uploadedBy?: string;
  status: FileStorageStatus;
  uploadedAt: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string;
  deleted: boolean;
}

export type PmsSystemType = "ADERANT" | "ELITE_3E" | "INTAPP" | "GENERIC_REST";

export interface PmsConnectorConfig {
  uid: string;
  firmUid: string;
  datasetUid: string;
  systemType: PmsSystemType;
  displayName: string;
  baseUrl: string;
  syncIntervalHours: number;
  active: boolean;
  lastSyncedAt?: string;
  lastSyncStatus?: string;
  lastSyncMessage?: string;
}

export interface CreatePmsConnectorCommand {
  datasetUid: string;
  systemType: PmsSystemType;
  displayName: string;
  baseUrl: string;
  apiKey?: string;
  syncIntervalHours?: number;
}
