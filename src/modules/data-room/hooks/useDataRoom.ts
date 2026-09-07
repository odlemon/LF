/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { dataRoomApi } from "@/lib/api/modules/dataroom.api";
import {
  DataRoomSummary,
  Dataset,
  DataRoomDocument,
  ProcessingLog,
  CreateDatasetCommand,
  UpdateColumnMappingCommand,
  PmsConnectorConfig,
  CreatePmsConnectorCommand,
} from "../types";

export function useDataRoomSummary() {
  const [summary, setSummary] = useState<DataRoomSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dataRoomApi.getSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load summary stats");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, error, refetch: fetchSummary };
}

export function useDatasets(filters: { category?: string; status?: string } = {}, page: number = 0) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize filters to avoid unnecessary hook cycles
  const filterKey = JSON.stringify(filters);

  const fetchDatasets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dataRoomApi.listDatasets(filters, page);
      setDatasets(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load datasets");
    } finally {
      setIsLoading(false);
    }
  }, [filterKey, page]);

  const createDataset = useCallback(async (command: CreateDatasetCommand) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await dataRoomApi.createDataset(command);
      setDatasets((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create dataset";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDataset = useCallback(async (uid: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await dataRoomApi.deleteDataset(uid);
      setDatasets((prev) => prev.filter((d) => d.uid !== uid));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete dataset";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  return {
    datasets,
    totalPages,
    totalElements,
    isLoading,
    error,
    createDataset,
    deleteDataset,
    refetch: fetchDatasets,
  };
}

export function usePmsConnectors() {
  const [connectors, setConnectors] = useState<PmsConnectorConfig[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnectors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dataRoomApi.listPmsConnectors();
      setConnectors(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load PMS connectors");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createConnector = useCallback(async (command: CreatePmsConnectorCommand) => {
    setError(null);
    try {
      const created = await dataRoomApi.createPmsConnector(command);
      setConnectors((prev) => [created, ...prev]);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create PMS connector";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const syncNow = useCallback(async (uid: string) => {
    setError(null);
    try {
      const updated = await dataRoomApi.syncPmsConnectorNow(uid);
      setConnectors((prev) => prev.map((c) => (c.uid === uid ? updated : c)));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Sync failed";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const testConnection = useCallback(async (uid: string) => {
    return dataRoomApi.testPmsConnector(uid);
  }, []);

  useEffect(() => {
    fetchConnectors();
  }, [fetchConnectors]);

  return {
    connectors,
    isLoading,
    error,
    createConnector,
    syncNow,
    testConnection,
    refetch: fetchConnectors,
  };
}

export function useDatasetDetail(uid: string) {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!uid) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await dataRoomApi.getDatasetDetail(uid);
      setDataset(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load dataset details");
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { dataset, isLoading, error, refetch: fetchDetail };
}

export function useDocuments(datasetUid: string, page: number = 0) {
  const [documents, setDocuments] = useState<DataRoomDocument[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDocuments = useCallback(async (silent: boolean = false) => {
    if (!datasetUid) return;
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const data = await dataRoomApi.getDocuments(datasetUid, page);
      setDocuments(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load documents");
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [datasetUid, page]);

  const retryDocument = useCallback(async (documentUid: string) => {
    try {
      await dataRoomApi.retryDocument(documentUid);
      // Trigger silent refresh
      fetchDocuments(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to retry document processing";
      throw new Error(msg);
    }
  }, [fetchDocuments]);

  const deleteDocument = useCallback(async (documentUid: string) => {
    try {
      await dataRoomApi.deleteDocument(documentUid);
      setDocuments((prev) => prev.filter((d) => d.uid !== documentUid));
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete document";
      throw new Error(msg);
    }
  }, []);

  const updateColumnMapping = useCallback(async (
    documentUid: string,
    command: UpdateColumnMappingCommand
  ) => {
    try {
      await dataRoomApi.updateColumnMapping(documentUid, command);
      fetchDocuments(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update column mapping";
      throw new Error(msg);
    }
  }, [fetchDocuments]);

  // Handle active status polling (every 3 seconds when queued or processing)
  useEffect(() => {
    const hasTransientDocuments = documents.some(
      (doc) => doc.status === "PROCESSING" || doc.status === "QUEUED" || doc.status === "UPLOADED"
    );

    if (hasTransientDocuments) {
      setIsPolling(true);
      pollingTimerRef.current = setTimeout(() => {
        fetchDocuments(true);
      }, 3000);
    } else {
      setIsPolling(false);
    }

    return () => {
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
      }
    };
  }, [documents, fetchDocuments]);

  // Initial fetch on mount or page changes
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    totalPages,
    totalElements,
    isLoading,
    isPolling,
    error,
    retryDocument,
    deleteDocument,
    updateColumnMapping,
    refetch: fetchDocuments,
  };
}

export function useAllDocuments(filters: { status?: string; datasetUid?: string } = {}, page: number = 0) {
  const [documents, setDocuments] = useState<DataRoomDocument[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filters);

  const fetchAllDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dataRoomApi.getAllDocuments(filters, page);
      setDocuments(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load documents list");
    } finally {
      setIsLoading(false);
    }
  }, [filterKey, page]);

  useEffect(() => {
    fetchAllDocuments();
  }, [fetchAllDocuments]);

  return {
    documents,
    totalPages,
    totalElements,
    isLoading,
    error,
    refetch: fetchAllDocuments,
  };
}

export function useProcessingLog(documentUid: string) {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!documentUid) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await dataRoomApi.getProcessingLog(documentUid);
      setLogs(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load processing logs");
    } finally {
      setIsLoading(false);
    }
  }, [documentUid]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, isLoading, error, refetch: fetchLogs };
}

export function useRecords(
  recordType: "past-matters" | "time-entries" | "billing-history" | "rate-card-history" | "market-benchmarks",
  filters: Record<string, any> = {},
  page: number = 0
) {
  const [records, setRecords] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filters);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dataRoomApi.getRecords(recordType, filters, page);
      setRecords(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || `Failed to load ${recordType} records`);
    } finally {
      setIsLoading(false);
    }
  }, [recordType, filterKey, page]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return {
    records,
    totalPages,
    totalElements,
    isLoading,
    error,
    refetch: fetchRecords,
  };
}

export function useDocument(uid: string) {
  const [document, setDocument] = useState<DataRoomDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(async () => {
    if (!uid) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await dataRoomApi.getDocument(uid);
      setDocument(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load document");
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  return { document, isLoading, error, refetch: fetchDocument };
}

export function useUpload(datasetUid: string) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [batchProgress, setBatchProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const uploadSingle = useCallback(async (file: File) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    try {
      const doc = await dataRoomApi.uploadDocument(datasetUid, file, (p) => {
        setProgress(p);
      });
      return doc;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to upload file";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsUploading(false);
    }
  }, [datasetUid]);

  const uploadBatch = useCallback(async (files: File[]) => {
    setIsUploading(true);
    setError(null);
    try {
      const docs = await dataRoomApi.uploadBatchDocuments(datasetUid, files);
      return docs;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to batch upload files";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsUploading(false);
    }
  }, [datasetUid]);

  return {
    uploadSingle,
    uploadBatch,
    isUploading,
    progress,
    batchProgress,
    error,
  };
}
