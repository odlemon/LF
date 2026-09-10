"use client";

import React, { useEffect, useRef, useState } from "react";
import { HiOutlineSparkles, HiArrowUp, HiStop } from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import { MarkdownContent } from "@/modules/intake/components/MarkdownContent";
import { useNegotiationChat } from "@/modules/negotiation/hooks/useNegotiationChat";
import { formatMoney } from "@/modules/negotiation/utils";
import type { NegotiationLineCommand } from "@/modules/negotiation/types";

interface RateCoachWorkspaceProps {
  negotiationUid: string;
  currency: string;
  matterTitle?: string | null;
  open: boolean;
  onApplyRates?: (lines: NegotiationLineCommand[]) => void;
  onSubmitRates?: (lines: NegotiationLineCommand[]) => Promise<void>;
  onNegotiationUpdated?: (info?: { toolName?: string | null }) => void;
}

function extractLines(suggested: unknown): NegotiationLineCommand[] {
  if (!suggested || typeof suggested !== "object") return [];
  const raw = suggested as Record<string, unknown>;
  const lines = raw.suggestedLines;
  if (!Array.isArray(lines)) return [];
  return lines.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      feeEarnerLevelUid: r.feeEarnerLevelUid != null ? String(r.feeEarnerLevelUid) : null,
      feeEarnerLevelCode: r.feeEarnerLevelCode != null ? String(r.feeEarnerLevelCode) : null,
      feeEarnerLevelName: r.feeEarnerLevelName != null ? String(r.feeEarnerLevelName) : null,
      phaseName: r.phaseName != null ? String(r.phaseName) : null,
      hours: Number(r.hours) || 0,
      hourlyRate: Number(r.hourlyRate) || 0,
    };
  });
}

export function RateCoachWorkspace({
  negotiationUid,
  currency,
  matterTitle,
  open,
  onApplyRates,
  onSubmitRates,
  onNegotiationUpdated,
}: RateCoachWorkspaceProps) {
  const onUpdatedRef = useRef(onNegotiationUpdated);
  onUpdatedRef.current = onNegotiationUpdated;

  const {
    messages,
    loadingHistory,
    streaming,
    error,
    suggestedRates,
    setSuggestedRates,
    send,
    stop,
  } = useNegotiationChat(negotiationUid, "CLIENT", {
    onNegotiationUpdated: (info) => onUpdatedRef.current?.(info),
  });
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const lines = extractLines(suggestedRates);
  const projected =
    suggestedRates && typeof suggestedRates === "object"
      ? (suggestedRates as Record<string, unknown>).projectedGrossFees
      : null;

  const PROMPTS_OPEN = open
    ? [
        "Explain this proposal in plain English",
        "How do these rates compare to market?",
        "Suggest a measured counter and submit it",
        "Accept the firm's latest offer",
        "Where do we stand in this negotiation?",
      ]
    : [
        "Explain this proposal in plain English",
        "How do these rates compare to market?",
        "Where do we stand in this negotiation?",
      ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-canvas">
            L
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
              Rate coach
            </p>
            <p className="text-sm font-semibold tracking-tight text-ink">
              {matterTitle || "Fee proposal"}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink/45">
          Lysp helps both sides reach a defensible number faster.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rates-scrollable px-5 py-5">
        {loadingHistory ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-ink" />
          </div>
        ) : messages.length === 0 && !streaming ? (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center animate-fade-in">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/70 bg-surface shadow-sm">
              <HiOutlineSparkles className="h-6 w-6 text-ink/55" />
            </span>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink">
              Negotiate with confidence
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/50">
              Ask anything about the proposal. Lysp reasons from the live rate card, market context, and your history - not scripts.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {PROMPTS_OPEN.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => void send(p)}
                  className="rounded-full border border-border/70 bg-surface px-3.5 py-2 text-xs font-semibold text-ink/70 shadow-sm transition-all hover:border-ink/25 hover:text-ink"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl space-y-4">
            {messages.map((msg) => {
              if (msg.role === "tool") {
                return (
                  <p key={msg.id} className="text-[11px] font-semibold uppercase tracking-wide text-ink/35">
                    {msg.content}
                  </p>
                );
              }
              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "rounded-br-md bg-primary text-on-primary"
                        : "rounded-tl-md border border-border bg-surface text-ink"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      msg.content ? (
                        <div className="relative">
                          <MarkdownContent content={msg.content} />
                          {msg.streaming ? (
                            <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-ink/40 align-middle" />
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-ink/45">{msg.streaming ? "Thinking…" : ""}</p>
                      )
                    ) : (
                      <p className="whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {lines.length > 0 && open && (onSubmitRates || onApplyRates) && (
              <div className="rounded-2xl border border-border/70 bg-field/60 px-4 py-3">
                <p className="text-xs font-semibold text-ink/70">
                  Counter ready
                  {projected != null
                    ? ` · ${formatMoney(Number(projected), currency)}`
                    : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {onSubmitRates && (
                    <Button
                      variant="cta"
                      loading={submitting}
                      onClick={async () => {
                        setSubmitting(true);
                        try {
                          await onSubmitRates(lines);
                          setSuggestedRates(null);
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                    >
                      Submit counter
                    </Button>
                  )}
                  {onApplyRates && !onSubmitRates && (
                    <Button
                      variant="secondary"
                      onClick={() => onApplyRates(lines)}
                    >
                      Apply to editor
                    </Button>
                  )}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
        {error && (
          <p className="mt-3 text-center text-xs text-red-600">{error}</p>
        )}
      </div>

      <div className="shrink-0 border-t border-border/60 bg-surface/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-end gap-2 rounded-[26px] border border-border/70 bg-field px-3 py-2 shadow-[0_2px_12px_rgba(10,10,10,0.04)]">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
                setInput("");
              }
            }}
            rows={1}
            placeholder={
              open
                ? "Ask anything — or say submit / accept"
                : "Ask about this closed negotiation…"
            }
            className="composer-textarea max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
          />
          {streaming ? (
            <Button
              variant="secondary"
              className="!h-10 !w-10 !min-w-0 !rounded-full !p-0"
              onClick={stop}
              aria-label="Stop"
            >
              <HiStop className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="cta"
              className="!h-10 !w-10 !min-w-0 !rounded-full !p-0"
              disabled={!input.trim()}
              onClick={() => {
                void send(input);
                setInput("");
              }}
              aria-label="Send"
            >
              <HiArrowUp className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="mx-auto mt-2 max-w-2xl text-center text-[10px] text-ink/30">
          {open
            ? "Say submit to send a counter, or accept to take the firm’s offer."
            : "This negotiation is closed — chat is advisory only."}
        </p>
      </div>
    </div>
  );
}
