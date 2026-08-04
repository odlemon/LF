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
  TOOL_SUCCESS_LABELS,
} from "../constants/toolLabels";
import {
  ChatBubble,
  ChatMode,
  IntakeMessage,
  MatterScope,
  StreamDoneEvent,
} from "../types";

const FLUSH_INTERVAL_MS = 30;

export interface UseIntakeChatInitialState {
  scope?: MatterScope | null;
  scopeGenerated?: boolean;
  chatMode?: ChatMode;
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
  initialState?: UseIntakeChatInitialState
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

  const syncMessages = useCallback(
    (next: ChatBubble[] | ((prev: ChatBubble[]) => ChatBubble[])) => {
      setMessages((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        const deduped = dedupeChatBubbles(resolved);
        onMessagesUpdated?.(bubblesToIntakeMessages(deduped, uid));
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
    if (initialState?.scope !== undefined && !hasLocalMessagesRef.current) {
      setScope(initialState.scope);
    }
    if (initialState?.scopeGenerated !== undefined) {
      setScopeGenerated(initialState.scopeGenerated);
    }
    if (initialState?.chatMode) {
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
        onMessagesUpdated?.(bubblesToIntakeMessages(merged, uid));
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
    aiMessagePlaceholderIdRef.current = null;
    userOptimisticIdRef.current = null;
    currentAiTextRef.current = "";
    firstTokenReceivedRef.current = false;
    activeToolBubbles.current = {};
    abortControllerRef.current = null;
  }, [flushTokenBuffer, clearFlushInterval]);

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

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isAiThinking) return;

      hasLocalMessagesRef.current = true;

      const optimisticUserId = `temp-${Date.now()}-${++optimisticIdRef.current}`;
      const aiPlaceholderId = `ai-streaming-${Date.now()}`;

      userOptimisticIdRef.current = optimisticUserId;
      aiMessagePlaceholderIdRef.current = aiPlaceholderId;
      currentAiTextRef.current = "";
      firstTokenReceivedRef.current = false;
      tokenBufferRef.current = "";
      activeToolBubbles.current = {};

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

      setStreamingMessageId(aiPlaceholderId);
      setShowTypingIndicator(true);
      setIsAiThinking(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;
      startFlushInterval();

      let streamSucceeded = false;
      let doneApplied = false;

      try {
        await streamMessage(
          uid,
          trimmed,
          {
            onStart: (data) => {
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
              const chunk = data.content ?? "";
              if (!chunk) return;

              if (!firstTokenReceivedRef.current) {
                appendTokenToStream(chunk);
                return;
              }

              tokenBufferRef.current += chunk;
            },
            onToolStart: (data) => {
              flushTokenBuffer();

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
                    TOOL_LABELS[data.toolName] ||
                    "Working...",
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
                            ? TOOL_SUCCESS_LABELS[data.toolName] || "Done"
                            : m.humanLabel,
                          toolError: data.success ? undefined : data.error,
                        }
                      : m
                  )
                );
              }
              setHasActiveToolCall(false);
            },
            onScopeGenerated: (data) => {
              flushTokenBuffer();
              applyScopeUpdate(data.scope);
            },
            onScopeUpdated: (data) => {
              flushTokenBuffer();
              applyScopeUpdate(data.scope);
            },
            onDone: (data) => {
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
          finalizeStream();
          return;
        }

        if (!streamSucceeded) {
          const placeholderId = aiMessagePlaceholderIdRef.current;
          syncMessages((prev) =>
            prev.filter(
              (m) => m.id !== optimisticUserId && m.id !== placeholderId
            )
          );
          toast.error(
            err instanceof Error ? err.message : "Connection error. Please try again."
          );
          await fallbackSendMessage(trimmed, optimisticUserId);
          return;
        }
      }

      finalizeStream();

      if (streamSucceeded) {
        await refreshMessagesFromServer();
        if (!doneApplied) {
          hasLocalMessagesRef.current = true;
        }
      }
    },
    [
      uid,
      isAiThinking,
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
    ]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    flushTokenBuffer();
    finalizeStream();
  }, [flushTokenBuffer, finalizeStream]);

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
    scopeGenerated,
    scope,
    setScope,
    setScopeGenerated,
    chatMode,
    setChatMode,
    refreshMessagesFromServer,
  };
}
