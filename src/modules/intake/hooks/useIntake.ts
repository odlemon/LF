/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { intakeApi } from "@/lib/api/modules/intake.api";
import { getClient } from "@/lib/api/modules/firm.api";
import {
  PricingRequest,
  IntakeMessage,
  IntakeAttachment,
  MatterScope,
  CreatePricingRequestCommand,
  CreatePhaseCommand,
  UpdatePhaseCommand,
  CreateTaskCommand,
  UpdateTaskCommand,
  CreateAssumptionCommand,
  AttachmentType,
  PricingRequestStatus,
} from "../types";
import { PaginatedResponse } from "@/types/api";

export type ListFilterTab = "all" | "in_progress" | "scope_confirmed" | "cancelled";

function filterByTab(requests: PricingRequest[], tab: ListFilterTab): PricingRequest[] {
  if (tab === "all") return requests;
  if (tab === "in_progress") {
    return requests.filter(
      (r) => r.status === "DRAFT" || r.status === "IN_PROGRESS"
    );
  }
  if (tab === "scope_confirmed") {
    return requests.filter((r) => r.status === "SCOPE_CONFIRMED");
  }
  if (tab === "cancelled") {
    return requests.filter((r) => r.status === "CANCELLED");
  }
  return requests;
}

function tabToApiStatus(tab: ListFilterTab): PricingRequestStatus | undefined {
  if (tab === "scope_confirmed") return "SCOPE_CONFIRMED";
  if (tab === "cancelled") return "CANCELLED";
  if (tab === "in_progress") return undefined;
  return undefined;
}

export function usePricingRequests(tab: ListFilterTab = "all", page: number = 0) {
  const [requests, setRequests] = useState<PricingRequest[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedResponse<PricingRequest>, "content">>({
    totalElements: 0,
    totalPages: 0,
    size: 20,
    number: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiStatus = tabToApiStatus(tab);
      const data = await intakeApi.listRequests({
        status: apiStatus,
        page,
        size: tab === "in_progress" ? 50 : 20,
      });
      const filtered = filterByTab(data.content, tab);
      setRequests(filtered);
      setPagination({
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        size: data.size,
        number: data.number,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load pricing requests");
    } finally {
      setIsLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = useCallback(async (command: CreatePricingRequestCommand) => {
    const created = await intakeApi.createRequest(command);
    await fetchRequests();
    return created;
  }, [fetchRequests]);

  return {
    requests,
    pagination,
    isLoading,
    error,
    createRequest,
    refetch: fetchRequests,
  };
}

export function useRequestWorkspace(uid: string) {
  const [request, setRequest] = useState<PricingRequest | null>(null);
  const [clientName, setClientName] = useState<string>("");
  const [messages, setMessages] = useState<IntakeMessage[]>([]);
  const [attachments, setAttachments] = useState<IntakeAttachment[]>([]);
  const [scope, setScope] = useState<MatterScope | null>(null);
  const [scopeGenerated, setScopeGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!uid) return;
    setIsLoading(true);
    setError(null);
    try {
      const req = await intakeApi.getRequest(uid);
      setRequest(req);
      setScopeGenerated(req.scopeGenerated);

      const [msgs, atts] = await Promise.all([
        intakeApi.getMessages(uid),
        intakeApi.listAttachments(uid),
      ]);
      setMessages(msgs);
      setAttachments(atts);

      let resolvedClientName = req.clientName ?? "";
      if (!resolvedClientName && req.clientProfileUid) {
        try {
          const client = await getClient(req.clientProfileUid);
          resolvedClientName = client.name;
        } catch {
          resolvedClientName = "Unknown client";
        }
      }
      setClientName(resolvedClientName);

      if (req.scopeGenerated || req.status === "SCOPE_GENERATED" || req.status === "SCOPE_CONFIRMED") {
        try {
          const scopeData = await intakeApi.getScope(uid);
          setScope(scopeData);
          setScopeGenerated(true);
        } catch {
          setScope(null);
        }
      } else {
        setScope(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load request");
    } finally {
      setIsLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    request,
    clientName,
    messages,
    setMessages,
    attachments,
    setAttachments,
    scope,
    setScope,
    scopeGenerated,
    setScopeGenerated,
    isLoading,
    error,
    refetch: fetchAll,
    setRequest,
  };
}

export { useIntakeChat } from "./useIntakeChat";

export function useAttachments(
  uid: string,
  initialAttachments: IntakeAttachment[],
  onAttachmentsChange?: (attachments: IntakeAttachment[]) => void
) {
  const [attachments, setAttachments] = useState<IntakeAttachment[]>(initialAttachments);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, "uploading" | "done" | "error">>({});

  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  const syncAttachments = useCallback(
    (next: IntakeAttachment[]) => {
      setAttachments(next);
      onAttachmentsChange?.(next);
    },
    [onAttachmentsChange]
  );

  const attach = useCallback(
    async (file: File, attachmentType: AttachmentType = "OTHER") => {
      const key = file.name;
      setUploadingFiles((prev) => ({ ...prev, [key]: "uploading" }));
      try {
        const created = await intakeApi.attachFile(uid, file, attachmentType);
        syncAttachments([...attachments, created]);
        setUploadingFiles((prev) => ({ ...prev, [key]: "done" }));
      } catch {
        setUploadingFiles((prev) => ({ ...prev, [key]: "error" }));
        toast.error(`Failed to attach ${file.name}`);
        throw new Error("upload failed");
      }
    },
    [uid, attachments, syncAttachments]
  );

  const deleteAttachment = useCallback(
    async (attachmentUid: string) => {
      await intakeApi.deleteAttachment(uid, attachmentUid);
      syncAttachments(attachments.filter((a) => a.uid !== attachmentUid));
    },
    [uid, attachments, syncAttachments]
  );

  const isAttaching = Object.values(uploadingFiles).some((s) => s === "uploading");

  return {
    attachments,
    uploadingFiles,
    attach,
    deleteAttachment,
    isAttaching,
    setAttachments: syncAttachments,
  };
}

export function useScope(
  uid: string,
  initialScope: MatterScope | null,
  onScopeChange?: (scope: MatterScope | null) => void,
  onRequestUpdate?: (request: PricingRequest) => void
) {
  const [scope, setScope] = useState<MatterScope | null>(initialScope);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setScope(initialScope);
  }, [initialScope]);

  const updateScopeState = useCallback(
    (next: MatterScope | null) => {
      setScope(next);
      onScopeChange?.(next);
    },
    [onScopeChange]
  );

  const reloadScope = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await intakeApi.getScope(uid);
      updateScopeState(data);
      return data;
    } finally {
      setIsLoading(false);
    }
  }, [uid, updateScopeState]);

  const updatePhase = useCallback(
    async (phaseUid: string, command: UpdatePhaseCommand) => {
      const updated = await intakeApi.updatePhase(uid, phaseUid, command);
      setScope((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          phases: prev.phases.map((p) => (p.uid === phaseUid ? { ...p, ...updated, tasks: p.tasks } : p)),
        };
        onScopeChange?.(next);
        return next;
      });
      return updated;
    },
    [uid, onScopeChange]
  );

  const addPhase = useCallback(
    async (command: CreatePhaseCommand) => {
      const created = await intakeApi.addPhase(uid, command);
      setScope((prev) => {
        if (!prev) return prev;
        const next = { ...prev, phases: [...prev.phases, { ...created, tasks: created.tasks ?? [] }] };
        onScopeChange?.(next);
        return next;
      });
      return created;
    },
    [uid, onScopeChange]
  );

  const deletePhase = useCallback(
    async (phaseUid: string) => {
      await intakeApi.deletePhase(uid, phaseUid);
      setScope((prev) => {
        if (!prev) return prev;
        const next = { ...prev, phases: prev.phases.filter((p) => p.uid !== phaseUid) };
        onScopeChange?.(next);
        return next;
      });
    },
    [uid, onScopeChange]
  );

  const updateTask = useCallback(
    async (phaseUid: string, taskUid: string, command: UpdateTaskCommand) => {
      const updated = await intakeApi.updateTask(uid, phaseUid, taskUid, command);
      setScope((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          phases: prev.phases.map((p) =>
            p.uid === phaseUid
              ? { ...p, tasks: p.tasks.map((t) => (t.uid === taskUid ? { ...t, ...updated } : t)) }
              : p
          ),
        };
        onScopeChange?.(next);
        return next;
      });
      return updated;
    },
    [uid, onScopeChange]
  );

  const addTask = useCallback(
    async (phaseUid: string, command: CreateTaskCommand) => {
      const created = await intakeApi.addTask(uid, phaseUid, command);
      setScope((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          phases: prev.phases.map((p) =>
            p.uid === phaseUid ? { ...p, tasks: [...p.tasks, created] } : p
          ),
        };
        onScopeChange?.(next);
        return next;
      });
      return created;
    },
    [uid, onScopeChange]
  );

  const deleteTask = useCallback(
    async (phaseUid: string, taskUid: string) => {
      await intakeApi.deleteTask(uid, phaseUid, taskUid);
      setScope((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          phases: prev.phases.map((p) =>
            p.uid === phaseUid ? { ...p, tasks: p.tasks.filter((t) => t.uid !== taskUid) } : p
          ),
        };
        onScopeChange?.(next);
        return next;
      });
    },
    [uid, onScopeChange]
  );

  const addAssumption = useCallback(
    async (command: CreateAssumptionCommand) => {
      const created = await intakeApi.addAssumption(uid, command);
      setScope((prev) => {
        if (!prev) return prev;
        const next = { ...prev, assumptions: [...prev.assumptions, created] };
        onScopeChange?.(next);
        return next;
      });
      return created;
    },
    [uid, onScopeChange]
  );

  const deleteAssumption = useCallback(
    async (assumptionUid: string) => {
      await intakeApi.deleteAssumption(uid, assumptionUid);
      setScope((prev) => {
        if (!prev) return prev;
        const next = {
          ...prev,
          assumptions: prev.assumptions.filter((a) => a.uid !== assumptionUid),
        };
        onScopeChange?.(next);
        return next;
      });
    },
    [uid, onScopeChange]
  );

  const confirmScope = useCallback(async () => {
    setIsConfirming(true);
    try {
      const updated = await intakeApi.confirmScope(uid);
      onRequestUpdate?.(updated);
      return updated;
    } finally {
      setIsConfirming(false);
    }
  }, [uid, onRequestUpdate]);

  return {
    scope,
    isLoading,
    isConfirming,
    updatePhase,
    addPhase,
    deletePhase,
    updateTask,
    addTask,
    deleteTask,
    addAssumption,
    deleteAssumption,
    confirmScope,
    reloadScope,
    setScope: updateScopeState,
  };
}
