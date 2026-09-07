import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import { getPublicApiBase } from "../baseUrl";
import {
  DataRoomSummary,
  Dataset,
  DataRoomDocument,
  FileMetadata,
  ProcessingLog,
  CreateDatasetCommand,
  UpdateColumnMappingCommand,
  PmsConnectorConfig,
  CreatePmsConnectorCommand,
} from "@/modules/data-room/types";
import { PaginatedResponse } from "./audit.api";

export const dataRoomApi = {
  getSummary: async (): Promise<DataRoomSummary> => {
    const response = await apiClient.get<DataRoomSummary>(ENDPOINTS.DATA_ROOM.SUMMARY);
    return response.data;
  },

  listDatasets: async (
    filters: { category?: string; status?: string },
    page: number,
    size: number = 20,
    sort: string = "createdAt,desc"
  ): Promise<PaginatedResponse<Dataset>> => {
    const params: Record<string, any> = { page, size, sort };
    if (filters.category && filters.category !== "ALL") {
      params.category = filters.category;
    }
    if (filters.status && filters.status !== "ALL") {
      params.status = filters.status;
    }
    const response = await apiClient.get<PaginatedResponse<Dataset>>(
      ENDPOINTS.DATA_ROOM.DATASETS,
      { params }
    );
    return response.data;
  },

  createDataset: async (command: CreateDatasetCommand): Promise<Dataset> => {
    const response = await apiClient.post<Dataset>(
      ENDPOINTS.DATA_ROOM.DATASETS,
      command
    );
    return response.data;
  },

  deleteDataset: async (uid: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.DATA_ROOM.DATASET_BY_UID(uid));
  },

  getDatasetDetail: async (uid: string): Promise<Dataset> => {
    const response = await apiClient.get<Dataset>(ENDPOINTS.DATA_ROOM.DATASET_BY_UID(uid));
    return response.data;
  },

  getDocument: async (uid: string): Promise<DataRoomDocument> => {
    const response = await apiClient.get<DataRoomDocument>(ENDPOINTS.DATA_ROOM.DOCUMENT_BY_UID(uid));
    return response.data;
  },

  getDocuments: async (
    datasetUid: string,
    page: number,
    size: number = 20
  ): Promise<PaginatedResponse<DataRoomDocument>> => {
    const response = await apiClient.get<PaginatedResponse<DataRoomDocument>>(
      ENDPOINTS.DATA_ROOM.DATASET_DOCUMENTS(datasetUid),
      { params: { page, size } }
    );
    return response.data;
  },

  getAllDocuments: async (
    filters: { status?: string; datasetUid?: string },
    page: number,
    size: number = 20
  ): Promise<PaginatedResponse<DataRoomDocument>> => {
    const params: Record<string, any> = { page, size };
    if (filters.status) params.status = filters.status;
    if (filters.datasetUid) params.datasetUid = filters.datasetUid;
    
    const response = await apiClient.get<PaginatedResponse<DataRoomDocument>>(
      ENDPOINTS.DATA_ROOM.DOCUMENTS,
      { params }
    );
    return response.data;
  },

  uploadDocument: async (
    datasetUid: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<DataRoomDocument> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<DataRoomDocument>(
      ENDPOINTS.DATA_ROOM.DATASET_DOCUMENTS(datasetUid),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      }
    );
    return response.data;
  },

  uploadBatchDocuments: async (
    datasetUid: string,
    files: File[],
    onProgress?: (index: number, progress: number) => void
  ): Promise<DataRoomDocument[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiClient.post<DataRoomDocument[]>(
      ENDPOINTS.DATA_ROOM.DATASET_DOCUMENTS_BATCH(datasetUid),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  deleteDocument: async (uid: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.DATA_ROOM.DOCUMENT_BY_UID(uid));
  },

  getProcessingLog: async (documentUid: string): Promise<ProcessingLog[]> => {
    const response = await apiClient.get<ProcessingLog[]>(
      ENDPOINTS.DATA_ROOM.DOCUMENT_LOG(documentUid)
    );
    return response.data;
  },

  retryDocument: async (documentUid: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.DATA_ROOM.DOCUMENT_RETRY(documentUid));
  },

  updateColumnMapping: async (
    documentUid: string,
    command: UpdateColumnMappingCommand
  ): Promise<void> => {
    await apiClient.put(
      ENDPOINTS.DATA_ROOM.DOCUMENT_MAPPING(documentUid),
      command
    );
  },

  getRecords: async (
    recordType: "past-matters" | "time-entries" | "billing-history" | "rate-card-history" | "market-benchmarks",
    filters: Record<string, any>,
    page: number,
    size: number = 20
  ): Promise<PaginatedResponse<any>> => {
    let endpoint = "";
    switch (recordType) {
      case "past-matters":
        endpoint = ENDPOINTS.DATA_ROOM.RECORDS_PAST_MATTERS;
        break;
      case "time-entries":
        endpoint = ENDPOINTS.DATA_ROOM.RECORDS_TIME_ENTRIES;
        break;
      case "billing-history":
        endpoint = ENDPOINTS.DATA_ROOM.RECORDS_BILLING;
        break;
      case "rate-card-history":
        endpoint = ENDPOINTS.DATA_ROOM.RECORDS_RATE_HISTORY;
        break;
      case "market-benchmarks":
        endpoint = ENDPOINTS.DATA_ROOM.RECORDS_BENCHMARKS;
        break;
    }

    const params: Record<string, any> = { page, size, ...filters };
    
    // Map dates to ISO format
    if (params.dateFrom) params.dateFrom = `${params.dateFrom}T00:00:00`;
    if (params.dateTo) params.dateTo = `${params.dateTo}T23:59:59`;

    const response = await apiClient.get<PaginatedResponse<any>>(endpoint, { params });
    return response.data;
  },

  saveMappingTemplate: async (payload: {
    category: string;
    sourceSystem: string;
    mapping: Record<string, string>;
  }): Promise<any> => {
    const response = await apiClient.post(ENDPOINTS.DATA_ROOM.MAPPING_TEMPLATES, payload);
    return response.data;
  },

  // File Storage
  listFiles: async (): Promise<FileMetadata[]> => {
    const response = await apiClient.get<FileMetadata[]>(ENDPOINTS.DATA_ROOM.FILE_STORAGE);
    return response.data;
  },

  getFile: async (uid: string): Promise<FileMetadata> => {
    const response = await apiClient.get<FileMetadata>(ENDPOINTS.DATA_ROOM.FILE_STORAGE_BY_UID(uid));
    return response.data;
  },

  uploadFile: async (
    file: File,
    uploadedBy?: string,
    onProgress?: (progress: number) => void
  ): Promise<FileMetadata> => {
    const formData = new FormData();
    formData.append("file", file);
    if (uploadedBy) formData.append("uploadedBy", uploadedBy);

    const response = await apiClient.post<FileMetadata>(
      ENDPOINTS.DATA_ROOM.FILE_STORAGE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      }
    );
    return response.data;
  },

  deleteFile: async (uid: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.DATA_ROOM.FILE_STORAGE_BY_UID(uid));
  },

  getDownloadUrl: (uid: string): string => {
    return `${getPublicApiBase()}/api/v1/file-storage/${uid}/download`;
  },

  listPmsConnectors: async (): Promise<PmsConnectorConfig[]> => {
    const response = await apiClient.get<PmsConnectorConfig[]>(ENDPOINTS.DATA_ROOM.PMS_CONNECTORS);
    return response.data;
  },

  createPmsConnector: async (command: CreatePmsConnectorCommand): Promise<PmsConnectorConfig> => {
    const response = await apiClient.post<PmsConnectorConfig>(
      ENDPOINTS.DATA_ROOM.PMS_CONNECTORS,
      command
    );
    return response.data;
  },

  syncPmsConnectorNow: async (uid: string): Promise<PmsConnectorConfig> => {
    const response = await apiClient.post<PmsConnectorConfig>(
      ENDPOINTS.DATA_ROOM.PMS_CONNECTOR_SYNC_NOW(uid)
    );
    return response.data;
  },

  testPmsConnector: async (uid: string): Promise<{ reachable: boolean }> => {
    const response = await apiClient.post<{ reachable: boolean }>(
      ENDPOINTS.DATA_ROOM.PMS_CONNECTOR_TEST(uid)
    );
    return response.data;
  },
};
