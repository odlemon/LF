"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  HiSparkles,
  HiPaperAirplane,
  HiStop,
  HiRefresh,
  HiCheckCircle,
  HiXCircle,
  HiCog,
} from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAdvisorChat, AdvisorBubble } from "@/modules/analytics/hooks/useAdvisorChat";
import { AnalyticsTabs } from "@/modules/analytics/components/AnalyticsTabs";
import { MarkdownContent } from "@/modules/intake/components/MarkdownContent";

const SUGGESTIONS = [
  "How did our margins trend this year?",
  "Which practice areas are underperforming vs target?",
  "Where are we losing proposals, and why?",
  "Summarise open margin anomalies",
];

function ToolBubble({ bubble }: { bubble: AdvisorBubble }) {
  const label = bubble.humanLabel || bubble.toolName || "Working";
  return (
    <div className="flex justify-start mb-2.5">
      <div className="flex items-center gap-2 rounded-full border border-border bg-field/60 px-4 py-1.5 shadow-sm">
        {bubble.toolStatus === "running" ? (
          <HiCog className="w-3.5 h-3.5 text-ink/50 animate-spin" />
        ) : bubble.toolStatus === "success" ? (
          <HiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <HiXCircle className="w-3.5 h-3.5 text-red-500" />
        )}
        <span
          className={`text-[11px] font-semibold ${
            bubble.toolStatus === "running" ? "text-ink/60" : "text-ink/50"
          }`}
        >
          {bubble.toolStatus === "running" ? `${label}…` : label}
        </span>
        {bubble.toolError && (
          <span className="text-[10px] text-red-500/90 italic truncate max-w-[220px]">
            {bubble.toolError}
          </span>
        )}
      </div>
    </div>
  );
}

function UserBubble({ bubble }: { bubble: AdvisorBubble }) {
  return (
    <div className="flex justify-end mb-3.5">
      <div className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm bg-primary text-on-primary">
        {bubble.content}
      </div>
    </div>
  );
}

function AiBubble({ bubble }: { bubble: AdvisorBubble }) {
  return (
    <div className="group flex justify-start mb-3.5 flex-col items-start gap-1 w-full">
      <div className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/35">
          Lysp Advisor
        </span>
      </div>
      <div className="relative bg-surface border border-border rounded-2xl rounded-tl-md px-4 py-3 max-w-[95%] w-fit min-w-0 shadow-sm">
        {bubble.content?.trim() ? (
          <MarkdownContent content={bubble.content} />
        ) : bubble.streaming ? (
          <p className="text-sm text-ink/40 italic">Thinking…</p>
        ) : null}
        {bubble.streaming && bubble.content?.trim() && (
          <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-ink/40 animate-pulse align-middle" aria-hidden />
        )}
      </div>
    </div>
  );
}

export default function AdvisorPage() {
  const { bubbles, isLoadingHistory, isStreaming, error, send, stop, resetSession } =
    useAdvisorChat();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the conversation pinned to the bottom while streaming.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [bubbles]);

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || isStreaming) return;
    setDraft("");
    void send(trimmed);
  };

  return (
    <div className="p-8 max-w-4xl w-full mx-auto flex flex-col gap-6 h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col gap-5 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Analytics Advisor</h1>
            <p className="text-sm text-ink/55 mt-1">
              Ask anything about your firm&apos;s pricing, margins, win rates and anomalies.
            </p>
          </div>
          {bubbles.length > 0 && (
            <Button variant="secondary" onClick={resetSession} disabled={isStreaming}>
              <HiRefresh className="w-3.5 h-3.5" />
              New session
            </Button>
          )}
        </div>
        <AnalyticsTabs />
      </div>

      {error && (
        <div className="shrink-0">
          <Alert variant="error" message={error} />
        </div>
      )}

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto rounded-2xl border border-border/60 bg-canvas p-6"
      >
        {isLoadingHistory ? (
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="h-16 bg-field rounded-2xl max-w-md" />
            <div className="h-24 bg-field rounded-2xl max-w-lg self-end" />
            <div className="h-20 bg-field rounded-2xl max-w-xl" />
          </div>
        ) : bubbles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-field border border-border flex items-center justify-center">
              <HiSparkles className="w-5 h-5 text-ink/45" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">How can I help with your analytics?</h3>
              <p className="mt-1 text-xs text-ink/50 max-w-sm">
                The advisor queries your firm&apos;s live metrics, anomalies and market data to answer.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-field text-ink/70 border border-border hover:bg-hover hover:text-ink transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {bubbles.map((bubble) =>
              bubble.type === "tool" ? (
                <ToolBubble key={bubble.id} bubble={bubble} />
              ) : bubble.type === "user" ? (
                <UserBubble key={bubble.id} bubble={bubble} />
              ) : (
                <AiBubble key={bubble.id} bubble={bubble} />
              )
            )}
            {isStreaming && !bubbles.some((b) => b.streaming) && (
              <div className="flex justify-start mb-3.5">
                <div className="bg-surface border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-2 h-2 bg-ink/35 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-ink/35 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-ink/35 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask about margins, win rates, anomalies…"
          disabled={isStreaming}
          aria-label="Message the analytics advisor"
        />
        {isStreaming ? (
          <Button variant="secondary" onClick={stop} aria-label="Stop generating">
            <HiStop className="w-4 h-4" />
            Stop
          </Button>
        ) : (
          <Button onClick={handleSend} disabled={!draft.trim()} aria-label="Send message">
            <HiPaperAirplane className="w-4 h-4" />
            Send
          </Button>
        )}
      </div>
    </div>
  );
}
