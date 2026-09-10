"use client";

import { useEffect, useRef, useState } from "react";
import { HiArrowUp, HiOutlineSparkles, HiStop } from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import { MarkdownContent } from "@/modules/intake/components/MarkdownContent";
import { useNegotiationChat } from "@/modules/negotiation/hooks/useNegotiationChat";
import type { NegotiationLineCommand } from "@/modules/negotiation/types";
import { formatMoney } from "@/modules/negotiation/utils";

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

export function FirmAdvisorWorkspace({
  negotiationUid,
  currency,
  matterTitle,
  open = true,
  onApplyRates,
  onSubmitRates,
  onNegotiationUpdated,
}: {
  negotiationUid: string;
  currency: string;
  matterTitle?: string | null;
  open?: boolean;
  onApplyRates?: (lines: NegotiationLineCommand[]) => void;
  onSubmitRates?: (lines: NegotiationLineCommand[]) => Promise<void>;
  onNegotiationUpdated?: (info?: { toolName?: string | null }) => void;
}) {
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
  } = useNegotiationChat(negotiationUid, "FIRM", {
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

  const prompts = open
    ? [
        "What rates should we go in with?",
        "Analyse the client's latest counter and submit a firm response",
        "Accept the client's latest counter",
        "How does this client usually negotiate?",
      ]
    : [
        "Summarise how this negotiation closed",
        "What should we learn for next time?",
      ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-surface">
      <div className="flex shrink-0 items-center gap-2 border-b border-border/60 px-5 py-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-canvas">
          L
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
            Negotiation advisor
          </p>
          <p className="text-sm font-semibold tracking-tight text-ink">
            {matterTitle || "Matter"}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rates-scrollable px-5 py-4">
        {loadingHistory ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-ink" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <HiOutlineSparkles className="h-6 w-6 text-ink/60" />
            <p className="mt-3 text-sm font-semibold text-ink">Strategy, not scripts</p>
            <p className="mt-1 max-w-md text-xs text-ink/60">
              Ask about margin impact, counters, or say submit to send rates to the client.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => void send(p)}
                  className="rounded-full border border-border/70 bg-canvas px-3 py-1.5 text-[11px] font-semibold text-ink/65 hover:border-ink/25"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              if (msg.role === "tool") {
                return (
                  <p key={msg.id} className="text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                    {msg.content}
                  </p>
                );
              }
              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-md bg-primary text-on-primary"
                        : "rounded-tl-md border border-border bg-surface text-ink"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      msg.content ? (
                        <MarkdownContent content={msg.content} />
                      ) : (
                        <p className="text-ink/60">{msg.streaming ? "Thinking…" : ""}</p>
                      )
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              );
            })}
            {lines.length > 0 && open && (onSubmitRates || onApplyRates) && (
              <div className="rounded-xl border border-border/60 bg-field/70 px-3 py-2.5">
                <p className="text-xs font-semibold text-ink/70">
                  Counter ready
                  {projected != null ? ` · ${formatMoney(Number(projected), currency)}` : ""}
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
                      Send to client
                    </Button>
                  )}
                  {onApplyRates && !onSubmitRates && (
                    <Button variant="secondary" onClick={() => onApplyRates(lines)}>
                      Apply to rate card
                    </Button>
                  )}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
        {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <div className="border-t border-border/60 px-3 py-3">
        <div className="flex items-end gap-2 rounded-[22px] border border-border/70 bg-field px-3 py-2">
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
              open ? "Ask — or say submit / accept" : "Ask about this closed negotiation…"
            }
            className="max-h-24 min-h-[36px] flex-1 resize-none bg-transparent px-1 py-1.5 text-sm text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface"
          />
          {streaming ? (
            <Button variant="secondary" className="!h-9 !w-9 !min-w-0 !rounded-full !p-0" onClick={stop}>
              <HiStop className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="cta"
              className="!h-9 !w-9 !min-w-0 !rounded-full !p-0"
              disabled={!input.trim()}
              onClick={() => {
                void send(input);
                setInput("");
              }}
            >
              <HiArrowUp className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-[10px] text-ink/60">
          {open
            ? "Say submit to send a counter to the client."
            : "This negotiation is closed."}
        </p>
      </div>
    </div>
  );
}
