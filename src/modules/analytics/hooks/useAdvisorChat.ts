"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { analyticsApi } from "@/lib/api/modules/analytics.api";
import { streamAdvisorMessage } from "@/lib/api/modules/analytics.stream";

/* eslint-disable @typescript-eslint/no-explicit-any */

const SESSION_STORAGE_KEY = "lysp.analytics.advisorSessionId";

export interface AdvisorBubble {
  id: string;
  type: "user" | "ai" | "tool";
  content?: string;
  toolName?: string;
  humanLabel?: string;
  toolStatus?: "running" | "success" | "failed";
  toolError?: string;
  createdAt?: string;
  streaming?: boolean;
}

function readStoredSession(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeSession(sessionId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionId) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // storage unavailable — session just won't persist
  }
}

/**
 * Analytics advisor chat state machine — mirrors the intake chat streaming UX
 * (user bubble → tool progress bubbles → streaming AI bubble).
 */
export function useAdvisorChat() {
  const [sessionId, setSessionId] = useState<string | null>(() => readStoredSession());
  const [bubbles, setBubbles] = useState<AdvisorBubble[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string | null>(sessionId);
  const streamingBubbleId = useRef<string | null>(null);
  const idCounter = useRef(0);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const nextId = useCallback(() => {
    idCounter.current += 1;
    return `advisor-${Date.now()}-${idCounter.current}`;
  }, []);

  // Load persisted history for the stored session.
  useEffect(() => {
    let isActive = true;
    analyticsApi
      .getAdvisorHistory(sessionId ?? undefined)
      .then((messages) => {
        if (!isActive) return;
        setBubbles(
          messages.map((m) => ({
            id: m.uid || nextId(),
            type: m.role === "USER" ? "user" : "ai",
            content: m.content,
            createdAt: m.createdAt,
          }))
        );
        // Adopt the server-side session if history returns one.
        const first = messages.find((m) => m.sessionUid);
        if (first?.sessionUid && !sessionIdRef.current) {
          setSessionId(first.sessionUid);
          storeSession(first.sessionUid);
        }
      })
      .catch((err) => {
        if (!isActive) return;
        setError(err?.response?.data?.message || err?.message || "Failed to load advisor history");
      })
      .finally(() => {
        if (isActive) setIsLoadingHistory(false);
      });
    return () => {
      isActive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Abort any in-flight stream on unmount.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const appendBubble = useCallback((bubble: AdvisorBubble) => {
    setBubbles((prev) => [...prev, bubble]);
  }, []);

  const send = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || isStreaming) return;

      setError(null);
      setIsStreaming(true);

      appendBubble({ id: nextId(), type: "user", content: trimmed });

      const aiBubbleId = nextId();
      streamingBubbleId.current = null;
      let receivedToken = false;

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamAdvisorMessage(
          trimmed,
          sessionIdRef.current,
          {
            onStart: (data) => {
              if (data.sessionId && data.sessionId !== sessionIdRef.current) {
                setSessionId(data.sessionId);
                storeSession(data.sessionId);
              }
            },
            onToken: (data) => {
              if (!data.content) return;
              if (!streamingBubbleId.current) {
                streamingBubbleId.current = aiBubbleId;
                appendBubble({
                  id: aiBubbleId,
                  type: "ai",
                  content: data.content,
                  streaming: true,
                });
              } else {
                setBubbles((prev) =>
                  prev.map((b) =>
                    b.id === aiBubbleId ? { ...b, content: (b.content ?? "") + data.content } : b
                  )
                );
              }
              receivedToken = true;
            },
            onToolStart: (data) => {
              appendBubble({
                id: nextId(),
                type: "tool",
                toolName: data.toolName,
                humanLabel: data.humanLabel,
                toolStatus: "running",
              });
            },
            onToolResult: (data) => {
              setBubbles((prev) => {
                // Mark the last running bubble for this tool as finished.
                for (let i = prev.length - 1; i >= 0; i--) {
                  const b = prev[i];
                  if (b.type === "tool" && b.toolName === data.toolName && b.toolStatus === "running") {
                    const updated = [...prev];
                    updated[i] = {
                      ...b,
                      toolStatus: data.success ? "success" : "failed",
                      toolError: data.error,
                    };
                    return updated;
                  }
                }
                return prev;
              });
            },
            onDone: (data) => {
              if (data.sessionId && data.sessionId !== sessionIdRef.current) {
                setSessionId(data.sessionId);
                storeSession(data.sessionId);
              }
            },
            onError: (data) => {
              setError(data.message || "Advisor stream error");
            },
          },
          controller.signal
        );

        if (!receivedToken && !streamingBubbleId.current) {
          appendBubble({
            id: aiBubbleId,
            type: "ai",
            content: "The advisor returned no response. Please try again.",
          });
        }
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Failed to reach the analytics advisor");
        }
      } finally {
        setBubbles((prev) => prev.map((b) => (b.id === aiBubbleId ? { ...b, streaming: false } : b)));
        streamingBubbleId.current = null;
        abortRef.current = null;
        setIsStreaming(false);
      }
    },
    [appendBubble, isStreaming, nextId]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const resetSession = useCallback(() => {
    abortRef.current?.abort();
    setSessionId(null);
    storeSession(null);
    setBubbles([]);
    setError(null);
  }, []);

  return {
    sessionId,
    bubbles,
    isLoadingHistory,
    isStreaming,
    error,
    send,
    stop,
    resetSession,
  };
}
