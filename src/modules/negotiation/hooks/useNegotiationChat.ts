"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as negotiationApi from "@/modules/negotiation/api";
import {
  streamNegotiationChat,
  type NegotiationChatMessageDto,
  type NegotiationChatSide,
} from "@/lib/api/modules/negotiation.stream";

export type ChatBubble = {
  id: string;
  role: "user" | "assistant" | "tool";
  content: string;
  streaming?: boolean;
  toolName?: string;
};

export function useNegotiationChat(
  uid: string,
  side: NegotiationChatSide,
  options?: {
    onNegotiationUpdated?: (info: { toolName?: string }) => void;
  }
) {
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedRates, setSuggestedRates] = useState<unknown>(null);
  const abortRef = useRef<AbortController | null>(null);
  const aiTempIdRef = useRef<string | null>(null);
  const onUpdatedRef = useRef(options?.onNegotiationUpdated);
  onUpdatedRef.current = options?.onNegotiationUpdated;
  const mutationNotifiedRef = useRef(false);

  const refresh = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const rows =
        side === "CLIENT"
          ? await negotiationApi.listPortalAiMessages(uid)
          : await negotiationApi.listFirmAiMessages(uid);
      setMessages(
        rows.map((m: NegotiationChatMessageDto) => ({
          id: m.id,
          role: m.role?.toUpperCase() === "USER" ? "user" : "assistant",
          content: m.content || "",
        }))
      );
    } catch {
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [uid, side]);

  useEffect(() => {
    void refresh();
    return () => {
      abortRef.current?.abort();
    };
  }, [refresh]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  }, []);

  const send = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || streaming) return;
      setError(null);
      setSuggestedRates(null);
      setStreaming(true);
      mutationNotifiedRef.current = false;

      const tempUserId = `tmp-u-${Date.now()}`;
      const tempAiId = `tmp-a-${Date.now()}`;
      aiTempIdRef.current = tempAiId;
      setMessages((prev) => [
        ...prev,
        { id: tempUserId, role: "user", content: text },
        { id: tempAiId, role: "assistant", content: "", streaming: true },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamNegotiationChat(
          uid,
          side,
          text,
          {
            onUserMessage: (msg) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempUserId
                    ? { ...m, id: msg.id, content: msg.content || text }
                    : m
                )
              );
            },
            onToken: ({ content: token }) => {
              if (!token) return;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === (aiTempIdRef.current || tempAiId)
                    ? { ...m, content: (m.content || "") + token, streaming: true }
                    : m
                )
              );
            },
            onToolStart: ({ humanLabel, toolName }) => {
              setMessages((prev) => [
                ...prev.filter((m) => m.role !== "tool" || m.toolName !== toolName),
                {
                  id: `tool-${toolName}-${Date.now()}`,
                  role: "tool",
                  content: humanLabel || toolName,
                  toolName,
                },
              ]);
            },
            onSuggestedRates: (data) => setSuggestedRates(data),
            onNegotiationUpdated: ({ toolName }) => {
              setSuggestedRates(null);
              // One toast/reload per chat turn even if multiple mutation events fire
              if (mutationNotifiedRef.current) return;
              mutationNotifiedRef.current = true;
              onUpdatedRef.current?.({ toolName });
            },
            onDone: (data) => {
              const ai = data.aiMessage;
              setMessages((prev) => {
                const withoutTools = prev.filter((m) => m.role !== "tool");
                return withoutTools.map((m) => {
                  if (m.id === tempUserId && data.userMessage) {
                    return {
                      ...m,
                      id: data.userMessage.id,
                      content: data.userMessage.content || m.content,
                    };
                  }
                  if (m.id === tempAiId || m.id === aiTempIdRef.current) {
                    return {
                      id: ai?.id || m.id,
                      role: "assistant" as const,
                      content: ai?.content || m.content,
                      streaming: false,
                    };
                  }
                  return m;
                });
              });
              if (data.suggestedRates) setSuggestedRates(data.suggestedRates);
              setStreaming(false);
            },
            onError: ({ message }) => {
              setError(message);
              setStreaming(false);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempAiId
                    ? {
                        ...m,
                        streaming: false,
                        content: m.content || "Something went wrong. Please try again.",
                      }
                    : m
                )
              );
            },
          },
          controller.signal
        );
      } catch (err: unknown) {
        if ((err as { name?: string })?.name === "AbortError") {
          setStreaming(false);
          return;
        }
        const message =
          err instanceof Error ? err.message : "Could not reach the advisor";
        setError(message);
        setStreaming(false);
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    },
    [uid, side, streaming]
  );

  return {
    messages,
    loadingHistory,
    streaming,
    error,
    suggestedRates,
    setSuggestedRates,
    send,
    stop,
    refresh,
  };
}
