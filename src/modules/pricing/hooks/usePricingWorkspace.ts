"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import toast from "react-hot-toast";
import * as pricingApi from "../api";
import type { GenerateToolStep } from "../components/GenerateProgress";
import {
  PricingProgressStepId,
  TOOL_TO_PRICING_STEP,
  pricingStepIndex,
  thinkingForTool,
} from "../constants/pricingProgress";
import type {
  GenerationProgressEvent,
  PricingGenerationJob,
  PricingScenario,
  UpdateScenarioCommand,
} from "../types";

function errMsg(err: unknown): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e.response?.data?.message || e.message || "Something went wrong";
}

function applyJobEvents(
  events: GenerationProgressEvent[],
  setToolSteps: (updater: (prev: GenerateToolStep[]) => GenerateToolStep[]) => void,
  advanceProgress: (toolName: string, humanLabel?: string) => void,
  seenRef: MutableRefObject<Set<string>>
) {
  for (const ev of events) {
    const key = `${ev.type}:${ev.toolName}:${ev.sequence ?? ""}:${ev.at ?? ""}`;
    if (seenRef.current.has(key)) continue;
    seenRef.current.add(key);

    const toolName = ev.toolName || "";
    if (!toolName) continue;

    if (ev.type === "tool_start") {
      advanceProgress(toolName, ev.label);
      const id = `tool-${toolName}-${ev.sequence ?? seenRef.current.size}`;
      setToolSteps((prev) => {
        if (prev.some((s) => s.id === id)) return prev;
        return [
          ...prev,
          {
            id,
            toolName,
            label: ev.label || thinkingForTool(toolName).running,
            status: "running",
            detail: thinkingForTool(toolName).detail,
          },
        ];
      });
    } else if (ev.type === "tool_result") {
      setToolSteps((prev) =>
        prev.map((s) =>
          s.toolName === toolName && s.status === "running"
            ? {
                ...s,
                status: ev.success === false ? "failed" : "success",
                label:
                  ev.success === false
                    ? s.label
                    : thinkingForTool(toolName).done,
                detail:
                  ev.success === false
                    ? ev.label || s.detail
                    : ev.label || thinkingForTool(toolName).detail,
              }
            : s
        )
      );
      if (ev.success !== false) {
        advanceProgress(toolName);
      }
    }
  }
}

export function usePricingWorkspace(requestUid: string) {
  const [scenarios, setScenarios] = useState<PricingScenario[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [detail, setDetail] = useState<PricingScenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingWhatIf, setIsSavingWhatIf] = useState(false);
  const [isPreferring, setIsPreferring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeciding, setIsDeciding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStep, setProgressStep] =
    useState<PricingProgressStepId>("prepare");
  const [progressLabel, setProgressLabel] = useState<string | undefined>();
  const [toolSteps, setToolSteps] = useState<GenerateToolStep[]>([]);
  const progressPeakRef = useRef(-1);
  const seenEventsRef = useRef<Set<string>>(new Set());
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedToastForJobRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const applyScenarioList = useCallback((list: PricingScenario[]) => {
    setScenarios(list);
    const preferred = list.find((s) => s.preferred);
    const nextUid = preferred?.id ?? list[0]?.id ?? null;
    setSelectedUid((prev) => {
      if (prev && list.some((s) => s.id === prev)) return prev;
      return nextUid;
    });
  }, []);

  const loadList = useCallback(
    async (opts?: { silent?: boolean; checkFallback?: boolean }) => {
      if (!opts?.silent) {
        setIsLoading(true);
        setError(null);
      }
      try {
        const list = await pricingApi.listScenarios(requestUid);
        applyScenarioList(list);
        if (opts?.checkFallback && list.some((s) => s.generationMode && s.generationMode !== "AGENT")) {
          toast("Generated without the AI agent — check provider settings.", { icon: "⚠️" });
        }
      } catch (err) {
        if (!opts?.silent) setError(errMsg(err));
      } finally {
        if (!opts?.silent) setIsLoading(false);
      }
    },
    [applyScenarioList, requestUid]
  );

  const advanceProgress = useCallback((toolName: string, humanLabel?: string) => {
    const step = TOOL_TO_PRICING_STEP[toolName];
    if (!step) return;
    const idx = pricingStepIndex(step);
    if (idx > progressPeakRef.current) {
      progressPeakRef.current = idx;
      setProgressStep(step);
    }
    setProgressLabel(humanLabel || thinkingForTool(toolName).running);
  }, []);

  const applyJobSnapshot = useCallback(
    (job: PricingGenerationJob, opts?: { toastOnComplete?: boolean }) => {
      if (job.currentLabel) {
        setProgressLabel(job.currentLabel);
      }
      applyJobEvents(job.events ?? [], setToolSteps, advanceProgress, seenEventsRef);

      if (job.active) {
        setIsGenerating(true);
        return;
      }

      if (job.status === "COMPLETED") {
        setProgressStep("ready");
        setProgressLabel("Scenarios ready");
        setIsGenerating(false);
        if (
          opts?.toastOnComplete &&
          job.id &&
          completedToastForJobRef.current !== job.id
        ) {
          completedToastForJobRef.current = job.id;
          const n = job.scenarioCount ?? 0;
          toast.success(
            n
              ? `${n} scenario${n === 1 ? "" : "s"} ready`
              : "Generation finished with no scenarios"
          );
        }
      } else if (job.status === "FAILED") {
        setIsGenerating(false);
        const msg = job.errorMessage || "Scenario generation failed";
        setError(msg);
        if (
          opts?.toastOnComplete &&
          job.id &&
          completedToastForJobRef.current !== job.id
        ) {
          completedToastForJobRef.current = job.id;
          toast.error(msg);
        }
      } else {
        setIsGenerating(false);
      }
    },
    [advanceProgress]
  );

  const startPolling = useCallback(() => {
    stopPolling();
    pollTimerRef.current = setInterval(async () => {
      try {
        const job = await pricingApi.getGenerationStatus(requestUid);
        applyJobSnapshot(job, { toastOnComplete: true });
        if (!job.active) {
          stopPolling();
          if (job.status === "COMPLETED") {
            await loadList({ silent: true, checkFallback: true });
          }
        }
      } catch {
        /* keep polling briefly through transient errors */
      }
    }, 1500);
  }, [applyJobSnapshot, loadList, requestUid, stopPolling]);

  // Bootstrap: wait for scenarios + generation status together so an in-flight
  // job never flashes the scenario workspace before progress UI.
  useEffect(() => {
    let cancelled = false;
    stopPolling();
    setIsLoading(true);
    setError(null);
    setIsGenerating(false);
    setToolSteps([]);
    seenEventsRef.current = new Set();
    progressPeakRef.current = 0;
    setProgressStep("prepare");
    setProgressLabel(undefined);

    (async () => {
      try {
        const [list, job] = await Promise.all([
          pricingApi.listScenarios(requestUid),
          pricingApi.getGenerationStatus(requestUid),
        ]);
        if (cancelled) return;

        if (job.active) {
          setScenarios([]);
          setSelectedUid(null);
          setDetail(null);
          applyJobSnapshot(job);
          startPolling();
        } else {
          applyScenarioList(list);
          if (job.status === "COMPLETED" || job.status === "FAILED") {
            applyJobSnapshot(job);
          } else {
            setIsGenerating(false);
          }
        }
      } catch (err) {
        if (!cancelled) setError(errMsg(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [
    applyJobSnapshot,
    applyScenarioList,
    requestUid,
    startPolling,
    stopPolling,
  ]);

  useEffect(() => {
    if (!selectedUid) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const d = await pricingApi.getScenario(requestUid, selectedUid);
        if (!cancelled) setDetail(d);
      } catch (err) {
        if (!cancelled) toast.error(errMsg(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestUid, selectedUid]);

  const generate = useCallback(async () => {
    setError(null);
    setToolSteps([]);
    seenEventsRef.current = new Set();
    progressPeakRef.current = 0;
    setProgressStep("prepare");
    setProgressLabel("Starting deep pricing research…");
    setIsGenerating(true);
    completedToastForJobRef.current = null;

    try {
      const job = await pricingApi.startAsyncGenerate(requestUid);
      applyJobSnapshot(job);
      toast("Generation continues in the background — you can leave this page.", {
        duration: 4000,
      });
      startPolling();
    } catch (err) {
      const msg = errMsg(err);
      setError(msg);
      setIsGenerating(false);
      toast.error(msg);
    }
  }, [applyJobSnapshot, requestUid, startPolling]);

  const selectScenario = useCallback((uid: string) => {
    setSelectedUid(uid);
  }, []);

  const applyWhatIf = useCallback(
    async (command: UpdateScenarioCommand) => {
      if (!selectedUid) return;
      setIsSavingWhatIf(true);
      try {
        const updated = await pricingApi.updateScenario(
          requestUid,
          selectedUid,
          command
        );
        setDetail(updated);
        setScenarios((prev) =>
          prev.map((s) =>
            s.id === updated.id
              ? {
                  ...s,
                  ...updated,
                  lines: updated.lines ?? s.lines,
                }
              : s
          )
        );
      } catch (err) {
        toast.error(errMsg(err));
        throw err;
      } finally {
        setIsSavingWhatIf(false);
      }
    },
    [requestUid, selectedUid]
  );

  const prefer = useCallback(async () => {
    if (!selectedUid) return;
    setIsPreferring(true);
    try {
      const updated = await pricingApi.preferScenario(requestUid, selectedUid);
      setDetail(updated);
      setScenarios((prev) =>
        prev.map((s) => ({
          ...s,
          preferred: s.id === updated.id,
        }))
      );
      toast.success("Preferred draft set");
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setIsPreferring(false);
    }
  }, [requestUid, selectedUid]);

  const submitPartner = useCallback(
    async (partnerUserUid?: string | null) => {
      const preferred = scenarios.find((s) => s.preferred);
      if (!preferred) {
        toast.error("Set a preferred draft first");
        return;
      }
      const isResubmit = preferred.status === "RETURNED_FOR_CORRECTION";
      if (!partnerUserUid && !isResubmit) {
        toast.error("Select a partner");
        return;
      }
      if (
        !partnerUserUid &&
        isResubmit &&
        !preferred.assignedPartnerUserUid &&
        !preferred.assignedPartnerEmail
      ) {
        toast.error("No assigned partner to resubmit to");
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await pricingApi.submitScenarioToPartner(
          requestUid,
          preferred.id,
          partnerUserUid || undefined
        );
        setScenarios((prev) =>
          prev.map((s) =>
            s.id === res.scenario.id
              ? {
                  ...s,
                  ...res.scenario,
                  preferred: true,
                }
              : s
          )
        );
        if (selectedUid === res.scenario.id) {
          setDetail((d) => (d ? { ...d, ...res.scenario } : d));
        }
        toast.success(res.message || "Submitted to partner");
      } catch (err) {
        toast.error(errMsg(err));
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [requestUid, scenarios, selectedUid]
  );

  const applyDecision = useCallback(
    async (
      action: "approve" | "reject" | "return",
      scenarioUid: string,
      comment?: string
    ) => {
      setIsDeciding(true);
      try {
        const updated =
          action === "approve"
            ? await pricingApi.approveScenario(requestUid, scenarioUid, comment)
            : action === "reject"
              ? await pricingApi.rejectScenario(requestUid, scenarioUid, comment)
              : await pricingApi.returnScenario(requestUid, scenarioUid, comment);
        setScenarios((prev) =>
          prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
        );
        if (selectedUid === updated.id) {
          setDetail((d) => (d ? { ...d, ...updated } : d));
        }
        toast.success(
          action === "approve"
            ? "Scenario approved"
            : action === "reject"
              ? "Scenario rejected"
              : "Returned for correction"
        );
      } catch (err) {
        toast.error(errMsg(err));
        throw err;
      } finally {
        setIsDeciding(false);
      }
    },
    [requestUid, selectedUid]
  );

  const preferredExists = scenarios.some((s) => s.preferred);
  const isEmpty = !isLoading && scenarios.length === 0 && !isGenerating;
  const preferredScenario = scenarios.find((s) => s.preferred) ?? null;

  return {
    scenarios,
    selectedUid,
    detail,
    isLoading,
    isGenerating,
    isSavingWhatIf,
    isPreferring,
    isSubmitting,
    isDeciding,
    error,
    isEmpty,
    preferredExists,
    preferredScenario,
    progressStep,
    progressLabel,
    toolSteps,
    generate,
    selectScenario,
    applyWhatIf,
    prefer,
    submitPartner,
    applyDecision,
    reload: loadList,
  };
}
