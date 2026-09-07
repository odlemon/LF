"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { streamMessage } from "@/lib/api/modules/intake.stream";
import { intakeApi } from "@/lib/api/modules/intake.api";
import {
  normalizeIntakeMessage,
  dedupeIntakeMessages,
} from "@/lib/api/normalize";
import {
  TOOL_LABELS,
} from "../constants/toolLabels";
import { thinkingCopyFor } from "../constants/toolThinking";
import {
  FRIENDLY_TOOL_LABELS,
  TOOL_PROGRESS_STEP,
  SCOPE_GENERATION_TOOLS,
  ScopeProgressStepId,
  stepIndex,
} from "../constants/scopeProgress";
import { detectChatIntent } from "../utils/chatIntents";
import {
  ChatBubble,
  ChatMode,
  IntakeMessage,
  MatterScope,
  StreamDoneEvent,
} from "../types";

const FLUSH_INTERVAL_MS = 30;

interface QueuedMessage {
  id: string;
  content: string;
}

export interface UseIntakeChatInitialState {
  scope?: MatterScope | null;
  scopeGenerated?: boolean;
  chatMode?: ChatMode;
}

export interface UseIntakeChatLocalActions {
  /** Clear scope and return to empty scoping state. */
  onResetScope?: () => Promise<void>;
  /** Restore previous scope snapshot. Returns false if nothing to undo. */
  onUndoScope?: () => Promise<boolean>;
}

function intakeMessageToBubble(msg: IntakeMessage): ChatBubble {
  return {
    id: msg.uid,
    type: msg.role === "USER" ? "user" : "ai",
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt,
  };
}

function bubblesToIntakeMessages(
  bubbles: ChatBubble[],
  pricingRequestUid: string
): IntakeMessage[] {
  return bubbles
    .filter((b) => b.type === "user" || b.type === "ai")
    .map((b) => ({
      uid: b.id,
      pricingRequestUid,
      role: b.role ?? (b.type === "user" ? "USER" : "AI"),
      content: b.content ?? "",
      createdAt: b.createdAt ?? new Date().toISOString(),
    }));
}

function dedupeChatBubbles(bubbles: ChatBubble[]): ChatBubble[] {
  const byId = new Map<string, ChatBubble>();
  for (const bubble of bubbles) {
    byId.set(bubble.id, bubble);
  }
  return Array.from(byId.values());
}

function initialBubblesFromMessages(messages: IntakeMessage[]): ChatBubble[] {
  return messages.map(intakeMessageToBubble);
}

/** Partner-facing tool errors — never dump SQL / stack fragments into chat. */
export function friendlyToolError(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const lower = raw.toLowerCase();
  if (lower.includes("duplicate key") || lower.includes("unique constraint")) {
    return "Couldn't replace the existing plan";
  }
  if (lower.includes("rollback-only")) {
    return "Couldn't save the plan — try again";
  }
  if (lower.includes("failed to generate scope:")) {
    const inner = raw.replace(/^Failed to generate scope:\s*/i, "");
    return friendlyToolError(inner) ?? "Couldn't draft the plan";
  }
  if (raw.length > 100) return `${raw.slice(0, 97)}…`;
  return raw;
}

function messagesFingerprint(messages: IntakeMessage[]): string {
  if (messages.length === 0) return "";
  return messages
    .map((m) => m.uid || `${m.role}-${m.createdAt}-${m.content.slice(0, 32)}`)
    .join("|");
}

export function useIntakeChat(
  uid: string,
  initialMessages: IntakeMessage[],
  onScopeGenerated?: (scope: MatterScope) => void,
  onMessagesUpdated?: (messages: IntakeMessage[]) => void,
  initialState?: UseIntakeChatInitialState,
  localActions?: UseIntakeChatLocalActions
) {
  const [messages, setMessages] = useState<ChatBubble[]>(() =>
    initialBubblesFromMessages(initialMessages)
  );
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [hasActiveToolCall, setHasActiveToolCall] = useState(false);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [scopeGenerated, setScopeGenerated] = useState(
    initialState?.scopeGenerated ?? false
  );
  const [scope, setScope] = useState<MatterScope | null>(
    initialState?.scope ?? null
  );
  const [chatMode, setChatMode] = useState<ChatMode>(
    initialState?.chatMode ?? "GENERAL"
  );
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );
  const [scopeProgressStep, setScopeProgressStep] =
    useState<ScopeProgressStepId | null>(null);
  const [scopeProgressLabel, setScopeProgressLabel] = useState<string | null>(
    null
  );
  /** True only while Lysp is building the *first* plan (not casual chat / later edits). */
  const [scopeBuildActive, setScopeBuildActive] = useState(false);
  const scopeGeneratedRef = useRef(initialState?.scopeGenerated ?? false);

  useEffect(() => {
    scopeGeneratedRef.current = scopeGenerated;
  }, [scopeGenerated]);
  const [queueCount, setQueueCount] = useState(0);

  const optimisticIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const tokenBufferRef = useRef("");
  const flushIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const aiMessagePlaceholderIdRef = useRef<string | null>(null);
  const currentAiTextRef = useRef("");
  const userOptimisticIdRef = useRef<string | null>(null);
  const firstTokenReceivedRef = useRef(false);
  const activeToolBubbles = useRef<Record<string, string>>({});
  const requestUidRef = useRef(uid);
  const hasLocalMessagesRef = useRef(false);
  const lastSyncedFingerprintRef = useRef("");
  const isBusyRef = useRef(false);
  const messageQueueRef = useRef<QueuedMessage[]>([]);
  const drainScheduledRef = useRef(false);
  const progressPeakRef = useRef(-1);

  const syncMessages = useCallback(
    (next: ChatBubble[] | ((prev: ChatBubble[]) => ChatBubble[])) => {
      setMessages((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        const deduped = dedupeChatBubbles(resolved);
        // Defer parent sync — calling setState on parent during this updater causes React warnings
        queueMicrotask(() => {
          onMessagesUpdated?.(bubblesToIntakeMessages(deduped, uid));
        });
        return deduped;
      });
    },
    [onMessagesUpdated, uid]
  );

  useEffect(() => {
    if (requestUidRef.current !== uid) {
      requestUidRef.current = uid;
      hasLocalMessagesRef.current = false;
      lastSyncedFingerprintRef.current = "";
    }

    if (hasLocalMessagesRef.current || isAiThinking) {
      return;
    }

    const fingerprint = messagesFingerprint(initialMessages);
    if (fingerprint === lastSyncedFingerprintRef.current) {
      return;
    }

    syncMessages(initialBubblesFromMessages(initialMessages));
    lastSyncedFingerprintRef.current = fingerprint;
  }, [uid, initialMessages, isAiThinking, syncMessages]);

  useEffect(() => {
    // Always allow clearing scope from parent (e.g. after reset), even mid-chat.
    if (initialState?.scope === null) {
      setScope(null);
    } else if (initialState?.scope !== undefined && !hasLocalMessagesRef.current) {
      setScope(initialState.scope);
    }

    if (initialState?.scopeGenerated === false) {
      setScopeGenerated(false);
    } else if (initialState?.scopeGenerated !== undefined && !hasLocalMessagesRef.current) {
      setScopeGenerated(initialState.scopeGenerated);
    }

    if (initialState?.chatMode && !hasLocalMessagesRef.current) {
      setChatMode(initialState.chatMode);
    } else if (
      initialState?.chatMode === "SCOPING" ||
      initialState?.chatMode === "GENERAL"
    ) {
      // Reset / start-over must move chat mode even with local messages
      setChatMode(initialState.chatMode);
    }
  }, [
    initialState?.scope,
    initialState?.scopeGenerated,
    initialState?.chatMode,
  ]);

  const refreshMessagesFromServer = useCallback(async () => {
    try {
      const serverMessages = await intakeApi.getMessages(uid);
      const persisted = dedupeIntakeMessages(serverMessages).map(
        intakeMessageToBubble
      );
      setMessages((prev) => {
        const toolBubbles = prev.filter((m) => m.type === "tool");
        const merged = dedupeChatBubbles([...persisted, ...toolBubbles]);
        queueMicrotask(() => {
          onMessagesUpdated?.(bubblesToIntakeMessages(merged, uid));
        });
        return merged;
      });
      lastSyncedFingerprintRef.current = messagesFingerprint(serverMessages);
      hasLocalMessagesRef.current = false;
      return serverMessages;
    } catch {
      return null;
    }
  }, [uid, onMessagesUpdated]);

  const clearFlushInterval = useCallback(() => {
    if (flushIntervalRef.current) {
      clearInterval(flushIntervalRef.current);
      flushIntervalRef.current = null;
    }
  }, []);

  const updateAiPlaceholderContent = useCallback(
    (content: string) => {
      const placeholderId = aiMessagePlaceholderIdRef.current;
      if (!placeholderId) return;

      syncMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId ? { ...m, content } : m
        )
      );
    },
    [syncMessages]
  );

  const flushTokenBuffer = useCallback(() => {
    const buffered = tokenBufferRef.current;
    if (!buffered) return;

    currentAiTextRef.current += buffered;
    tokenBufferRef.current = "";
    setShowTypingIndicator(false);
    updateAiPlaceholderContent(currentAiTextRef.current);
  }, [updateAiPlaceholderContent]);

  const appendTokenToStream = useCallback(
    (chunk: string) => {
      if (!chunk) return;

      if (!firstTokenReceivedRef.current) {
        firstTokenReceivedRef.current = true;
        setShowTypingIndicator(false);
      }

      currentAiTextRef.current += chunk;
      updateAiPlaceholderContent(currentAiTextRef.current);
    },
    [updateAiPlaceholderContent]
  );

  const startFlushInterval = useCallback(() => {
    clearFlushInterval();
    flushIntervalRef.current = setInterval(() => {
      if (tokenBufferRef.current) {
        flushTokenBuffer();
      }
    }, FLUSH_INTERVAL_MS);
  }, [clearFlushInterval, flushTokenBuffer]);

  const finalizeStream = useCallback(() => {
    flushTokenBuffer();
    clearFlushInterval();
    setIsAiThinking(false);
    setShowTypingIndicator(false);
    setHasActiveToolCall(false);
    setStreamingMessageId(null);
    setScopeProgressStep(null);
    setScopeProgressLabel(null);
    setScopeBuildActive(false);
    progressPeakRef.current = -1;
    aiMessagePlaceholderIdRef.current = null;
    userOptimisticIdRef.current = null;
    currentAiTextRef.current = "";
    firstTokenReceivedRef.current = false;
    activeToolBubbles.current = {};
    abortControllerRef.current = null;
    isBusyRef.current = false;
  }, [flushTokenBuffer, clearFlushInterval]);

  const advanceScopeProgress = useCallback((toolName: string) => {
    const step = TOOL_PROGRESS_STEP[toolName];
    if (!step) return;
    const idx = stepIndex(step);
    if (idx < progressPeakRef.current) return;
    progressPeakRef.current = idx;
    setScopeProgressStep(step);
    setScopeProgressLabel(
      FRIENDLY_TOOL_LABELS[toolName] || TOOL_LABELS[toolName] || null
    );
  }, []);

  const freezeAiPlaceholderAndStartNew = useCallback(() => {
    const placeholderId = aiMessagePlaceholderIdRef.current;
    if (!placeholderId || !currentAiTextRef.current.trim()) {
      return;
    }

    const frozenId = `ai-pre-tool-${Date.now()}`;
    syncMessages((prev) =>
      prev.map((m) => (m.id === placeholderId ? { ...m, id: frozenId } : m))
    );

    const newPlaceholderId = `ai-streaming-${Date.now()}`;
    aiMessagePlaceholderIdRef.current = newPlaceholderId;
    currentAiTextRef.current = "";
    setStreamingMessageId(newPlaceholderId);
    syncMessages((prev) => [
      ...prev,
      {
        id: newPlaceholderId,
        type: "ai",
        role: "AI",
        content: "",
      },
    ]);
  }, [syncMessages]);

  const applyLegacyDoneEvent = useCallback(
    (data: StreamDoneEvent, optimisticUserId: string) => {
      if (!data?.userMessage || !data?.aiMessage) {
        return false;
      }

      const finalUser = normalizeIntakeMessage(
        data.userMessage as unknown as Record<string, unknown>
      );
      const finalAi = normalizeIntakeMessage(
        data.aiMessage as unknown as Record<string, unknown>
      );

      if (!finalUser.uid || !finalAi.uid) {
        return false;
      }

      const placeholderId = aiMessagePlaceholderIdRef.current;
      const removeIds = new Set(
        [
          optimisticUserId,
          placeholderId,
          finalUser.uid,
          finalAi.uid,
        ].filter(Boolean) as string[]
      );

      syncMessages((prev) => {
        const without = prev.filter((m) => !removeIds.has(m.id));
        return [
          ...without,
          intakeMessageToBubble(finalUser),
          intakeMessageToBubble(finalAi),
        ];
      });

      return true;
    },
    [syncMessages]
  );

  const applyScopeUpdate = useCallback(
    (nextScope: MatterScope) => {
      setScope(nextScope);
      setScopeGenerated(true);
      setChatMode((prev) =>
        prev === "SCOPE_CONFIRMED" ? prev : "SCOPE_GENERATED"
      );
      onScopeGenerated?.(nextScope);
    },
    [onScopeGenerated]
  );

  const fallbackSendMessage = useCallback(
    async (content: string, optimisticUserId: string) => {
      try {
        const response = await intakeApi.sendMessage(uid, { content });
        hasLocalMessagesRef.current = true;
        syncMessages((prev) => {
          const withoutOptimistic = prev.filter(
            (m) =>
              m.id !== optimisticUserId &&
              !m.id.startsWith("ai-streaming-") &&
              !m.id.startsWith("temp-ai-")
          );
          return [
            ...withoutOptimistic,
            intakeMessageToBubble(response.userMessage),
            intakeMessageToBubble(response.aiMessage),
          ];
        });
        if (response.scopeGenerated && response.scope) {
          applyScopeUpdate(response.scope);
        }
        await refreshMessagesFromServer();
      } catch {
        syncMessages((prev) =>
          prev.filter(
            (m) =>
              m.id !== optimisticUserId &&
              !m.id.startsWith("ai-streaming-") &&
              !m.id.startsWith("temp-ai-")
          )
        );
        toast.error("Failed to send message");
      } finally {
        finalizeStream();
      }
    },
    [uid, applyScopeUpdate, finalizeStream, syncMessages, refreshMessagesFromServer]
  );

  const executeSend = useCallback(
    async (trimmed: string, existingUserBubbleId?: string) => {
      hasLocalMessagesRef.current = true;
      isBusyRef.current = true;

      const optimisticUserId =
        existingUserBubbleId ?? `temp-${Date.now()}-${++optimisticIdRef.current}`;
      const aiPlaceholderId = `ai-streaming-${Date.now()}`;

      userOptimisticIdRef.current = optimisticUserId;
      aiMessagePlaceholderIdRef.current = aiPlaceholderId;
      currentAiTextRef.current = "";
      firstTokenReceivedRef.current = false;
      tokenBufferRef.current = "";
      activeToolBubbles.current = {};
      progressPeakRef.current = -1;
      // Do not start BUILDING SCOPE on every message — only when generation tools run

      if (existingUserBubbleId) {
        syncMessages((prev) => [
          ...prev.map((m) =>
            m.id === existingUserBubbleId ? { ...m, queued: false } : m
          ),
          {
            id: aiPlaceholderId,
            type: "ai",
            role: "AI",
            content: "",
          },
        ]);
      } else {
        syncMessages((prev) => [
          ...prev,
          {
            id: optimisticUserId,
            type: "user",
            role: "USER",
            content: trimmed,
          },
          {
            id: aiPlaceholderId,
            type: "ai",
            role: "AI",
            content: "",
          },
        ]);
      }

      setStreamingMessageId(aiPlaceholderId);
      setShowTypingIndicator(true);
      setIsAiThinking(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;
      startFlushInterval();

      let streamSucceeded = false;
      let doneApplied = false;
      let wasAborted = false;
      let receivedStreamActivity = false;

      try {
        await streamMessage(
          uid,
          trimmed,
          {
            onStart: (data) => {
              receivedStreamActivity = true;
              const aiId = data.messageUid || aiPlaceholderId;
              aiMessagePlaceholderIdRef.current = aiId;
              setStreamingMessageId(aiId);

              if (data.userMessage) {
                const normalizedUser = normalizeIntakeMessage(
                  data.userMessage as unknown as Record<string, unknown>
                );
                syncMessages((prev) =>
                  prev.map((m) => {
                    if (m.id === aiPlaceholderId) {
                      return { ...m, id: aiId };
                    }
                    if (m.id === optimisticUserId) {
                      return intakeMessageToBubble(normalizedUser);
                    }
                    return m;
                  })
                );
              }
            },
            onUserMessage: (data) => {
              receivedStreamActivity = true;
              if (!data.id) return;
              syncMessages((prev) =>
                prev.map((m) =>
                  m.id === optimisticUserId
                    ? { ...m, id: data.id, sequence: data.sequence }
                    : m
                )
              );
            },
            onToken: (data) => {
              receivedStreamActivity = true;
              const chunk = data.content ?? "";
              if (!chunk) return;

              if (!firstTokenReceivedRef.current) {
                appendTokenToStream(chunk);
                return;
              }

              tokenBufferRef.current += chunk;
            },
            onToolStart: (data) => {
              receivedStreamActivity = true;
              flushTokenBuffer();

              // Full-panel BUILDING SCOPE only for first-plan generation tools
              if (
                !scopeGeneratedRef.current &&
                SCOPE_GENERATION_TOOLS.has(data.toolName)
              ) {
                setScopeBuildActive(true);
                if (progressPeakRef.current < 0) {
                  setScopeProgressStep("listening");
                  setScopeProgressLabel("Understanding the matter…");
                  progressPeakRef.current = 0;
                }
                advanceScopeProgress(data.toolName);
              }

              if (currentAiTextRef.current.trim()) {
                freezeAiPlaceholderAndStartNew();
              }

              const toolBubbleId = `tool-${data.toolName}-${Date.now()}`;
              syncMessages((prev) => [
                ...prev,
                {
                  id: toolBubbleId,
                  type: "tool",
                  toolName: data.toolName,
                  humanLabel:
                    data.humanLabel ||
                    thinkingCopyFor(data.toolName).running ||
                    FRIENDLY_TOOL_LABELS[data.toolName] ||
                    TOOL_LABELS[data.toolName] ||
                    "Working…",
                  toolStatus: "running",
                },
              ]);
              setHasActiveToolCall(true);
              activeToolBubbles.current[data.toolName] = toolBubbleId;
            },
            onToolResult: (data) => {
              const bubbleId = activeToolBubbles.current[data.toolName];
              if (bubbleId) {
                syncMessages((prev) =>
                  prev.map((m) =>
                    m.id === bubbleId
                      ? {
                          ...m,
                          toolStatus: data.success ? "success" : "failed",
                          humanLabel: data.success
                            ? thinkingCopyFor(data.toolName).done
                            : m.humanLabel,
                          toolError: data.success
                            ? undefined
                            : friendlyToolError(data.error),
                        }
                      : m
                  )
                );
              }
              setHasActiveToolCall(false);
            },
            onScopeGenerated: (data) => {
              receivedStreamActivity = true;
              flushTokenBuffer();
              setScopeProgressStep("ready");
              setScopeProgressLabel("Scope ready");
              applyScopeUpdate(data.scope);
            },
            onScopeUpdated: (data) => {
              receivedStreamActivity = true;
              flushTokenBuffer();
              applyScopeUpdate(data.scope);
              setChatMode((prev) =>
                prev === "SCOPE_CONFIRMED" ? prev : "SCOPE_GENERATED"
              );
            },
            onDone: (data) => {
              receivedStreamActivity = true;
              flushTokenBuffer();
              streamSucceeded = true;
              setShowTypingIndicator(false);

              const placeholderId = aiMessagePlaceholderIdRef.current;

              if (data.aiMessageId && placeholderId) {
                syncMessages((prev) =>
                  prev.map((m) =>
                    m.id === placeholderId ? { ...m, id: data.aiMessageId! } : m
                  )
                );
                doneApplied = true;
              } else {
                doneApplied = applyLegacyDoneEvent(data, optimisticUserId);
              }

              if (data.scopeGenerated && data.scope) {
                applyScopeUpdate(data.scope);
              }

              if (data.chatMode) {
                setChatMode(data.chatMode);
              } else if (data.scopeGenerated || data.scope) {
                setChatMode((prev) =>
                  prev === "SCOPE_CONFIRMED" ? prev : "SCOPE_GENERATED"
                );
              }
            },
            onError: (data) => {
              throw new Error(data.message || "Stream error");
            },
          },
          controller.signal
        );
        streamSucceeded = true;
      } catch (err: unknown) {
        const isAbort =
          err instanceof Error &&
          (err.name === "AbortError" || err.message.includes("aborted"));

        if (isAbort) {
          wasAborted = true;
          const placeholderId = aiMessagePlaceholderIdRef.current;
          if (placeholderId) {
            syncMessages((prev) =>
              prev.map((m) =>
                m.id === placeholderId ? { ...m, cancelled: true } : m
              )
            );
          }
          syncMessages((prev) =>
            prev.map((m) =>
              m.type === "tool" && m.toolStatus === "running"
                ? {
                    ...m,
                    toolStatus: "failed",
                    toolError: "Stopped",
                    humanLabel: "Stopped",
                  }
                : m
            )
          );
          finalizeStream();
          toast("Stopped — next queued message will send");
          return;
        }

        if (!streamSucceeded) {
          const message =
            err instanceof Error
              ? err.message
              : "Connection error. Please try again.";
          toast.error(message);

          // Mid-stream failure (tools / progress already ran): keep UI, refresh
          // from server, do NOT re-send — that would duplicate the agent run.
          if (receivedStreamActivity) {
            syncMessages((prev) =>
              prev.map((m) =>
                m.type === "tool" && m.toolStatus === "running"
                  ? {
                      ...m,
                      toolStatus: "failed",
                      toolError: friendlyToolError(message) || message,
                      humanLabel: "Interrupted",
                    }
                  : m
              )
            );
            finalizeStream();
            try {
              await refreshMessagesFromServer();
            } catch {
              // ignore refresh errors
            }
            return;
          }

          const placeholderId = aiMessagePlaceholderIdRef.current;
          syncMessages((prev) =>
            prev.filter(
              (m) => m.id !== optimisticUserId && m.id !== placeholderId
            )
          );
          await fallbackSendMessage(trimmed, optimisticUserId);
          return;
        }
      }

      finalizeStream();

      if (streamSucceeded && !wasAborted) {
        await refreshMessagesFromServer();
        if (!doneApplied) {
          hasLocalMessagesRef.current = true;
        }
      }
    },
    [
      uid,
      startFlushInterval,
      flushTokenBuffer,
      finalizeStream,
      fallbackSendMessage,
      appendTokenToStream,
      applyLegacyDoneEvent,
      syncMessages,
      refreshMessagesFromServer,
      freezeAiPlaceholderAndStartNew,
      applyScopeUpdate,
      advanceScopeProgress,
    ]
  );

  const drainQueue = useCallback(async () => {
    if (drainScheduledRef.current || isBusyRef.current) return;
    const next = messageQueueRef.current.shift();
    setQueueCount(messageQueueRef.current.length);
    if (!next) return;

    drainScheduledRef.current = true;
    try {
      await executeSend(next.content, next.id);
    } finally {
      drainScheduledRef.current = false;
      if (messageQueueRef.current.length > 0 && !isBusyRef.current) {
        void drainQueue();
      }
    }
  }, [executeSend]);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const intent = detectChatIntent(trimmed);

      // Queue follow-ups while Lysp is busy (except reset/undo which wait for idle)
      if (isBusyRef.current || isAiThinking) {
        if (intent === "reset" || intent === "undo") {
          toast("Wait for Lysp to finish, or press Stop first");
          return;
        }
        const queuedId = `queued-${Date.now()}-${++optimisticIdRef.current}`;
        messageQueueRef.current.push({ id: queuedId, content: trimmed });
        setQueueCount(messageQueueRef.current.length);
        hasLocalMessagesRef.current = true;
        syncMessages((prev) => [
          ...prev,
          {
            id: queuedId,
            type: "user",
            role: "USER",
            content: trimmed,
            queued: true,
            createdAt: new Date().toISOString(),
          },
        ]);
        return;
      }

      if (intent === "reset" || intent === "undo") {
        hasLocalMessagesRef.current = true;
        isBusyRef.current = true;
        const optimisticUserId = `temp-${Date.now()}-${++optimisticIdRef.current}`;
        const ackId = `local-ack-${Date.now()}`;

        syncMessages((prev) => [
          ...prev,
          {
            id: optimisticUserId,
            type: "user",
            role: "USER",
            content: trimmed,
            createdAt: new Date().toISOString(),
          },
        ]);

        setIsAiThinking(true);
        setShowTypingIndicator(true);
        try {
          if (intent === "reset") {
            if (!localActions?.onResetScope) {
              toast.error("Unable to reset scope right now");
              return;
            }
            await localActions.onResetScope();
            messageQueueRef.current = [];
            setQueueCount(0);
            syncMessages((prev) => [
              ...prev.filter((m) => !m.queued),
              {
                id: ackId,
                type: "ai",
                role: "AI",
                content:
                  "All clear — I've wiped the scope. Tell me about the matter again and I'll build a fresh plan.",
                createdAt: new Date().toISOString(),
              },
            ]);
            toast.success("Scope cleared");
          } else {
            if (!localActions?.onUndoScope) {
              toast.error("Unable to undo right now");
              return;
            }
            const ok = await localActions.onUndoScope();
            if (!ok) {
              syncMessages((prev) => [
                ...prev,
                {
                  id: ackId,
                  type: "ai",
                  role: "AI",
                  content:
                    "There's nothing left to undo. Make a change first, or ask me to adjust something in chat.",
                  createdAt: new Date().toISOString(),
                },
              ]);
            } else {
              syncMessages((prev) => [
                ...prev,
                {
                  id: ackId,
                  type: "ai",
                  role: "AI",
                  content:
                    "Undone — I restored the previous version of the scope. You can keep editing or ask for another change.",
                  createdAt: new Date().toISOString(),
                },
              ]);
              toast.success("Last scope change undone");
            }
          }
        } catch (err: unknown) {
          const e = err as { response?: { data?: { message?: string } }; message?: string };
          toast.error(e.response?.data?.message || e.message || "Action failed");
          syncMessages((prev) =>
            prev.filter((m) => m.id !== optimisticUserId)
          );
        } finally {
          setIsAiThinking(false);
          setShowTypingIndicator(false);
          isBusyRef.current = false;
          void drainQueue();
        }
        return;
      }

      await executeSend(trimmed);
      void drainQueue();
    },
    [
      isAiThinking,
      localActions,
      syncMessages,
      executeSend,
      drainQueue,
    ]
  );

  const removeQueuedMessage = useCallback(
    (messageId: string) => {
      messageQueueRef.current = messageQueueRef.current.filter(
        (m) => m.id !== messageId
      );
      setQueueCount(messageQueueRef.current.length);
      syncMessages((prev) => prev.filter((m) => m.id !== messageId));
    },
    [syncMessages]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    } else {
      flushTokenBuffer();
      finalizeStream();
      void drainQueue();
    }
  }, [flushTokenBuffer, finalizeStream, drainQueue]);

  useEffect(() => {
    return () => {
      clearFlushInterval();
      abortControllerRef.current?.abort();
    };
  }, [clearFlushInterval]);

  return {
    messages,
    isAiThinking,
    hasActiveToolCall,
    showTypingIndicator,
    streamingMessageId,
    sendMessage,
    stopStreaming,
    removeQueuedMessage,
    queueCount,
    scopeProgressStep,
    scopeProgressLabel,
    scopeBuildActive,
    scopeGenerated,
    scope,
    setScope,
    setScopeGenerated,
    chatMode,
    setChatMode,
    refreshMessagesFromServer,
  };
}
