"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import type { NegotiationAiSuggest } from "../types";
import { Select } from "@/components/ui/Select";

interface AiSuggestPanelProps {
  /** Firm view shows margin / guardrail fields. Client view must stay clean. */
  variant: "firm" | "client";
  loading: boolean;
  suggestion: NegotiationAiSuggest | null;
  onSuggest: (intent: string) => Promise<void>;
  onApplyRates?: () => void;
  suggestLabel?: string;
  defaultIntent?: string;
}

export function AiSuggestPanel({
  variant,
  loading,
  suggestion,
  onSuggest,
  onApplyRates,
  suggestLabel = "Ask AI",
  defaultIntent = "opening",
}: AiSuggestPanelProps) {
  const [intent, setIntent] = useState(defaultIntent);

  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
            {variant === "firm" ? "Negotiation advisor" : "Rate coach"}
          </p>
          <h3 className="mt-1 text-base font-semibold text-ink tracking-tight">
            {variant === "firm"
              ? "AI recommendation"
              : "Suggested counter rates"}
          </h3>
          <p className="mt-1 text-xs text-ink/60 leading-relaxed max-w-md">
            {variant === "firm"
              ? "Advisory only — you decide what to send. Guardrails block recommendations below the margin floor."
              : "Optional guidance for your counter. Your proposal is never auto-sent."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {variant === "firm" && (
            <Select
              className="w-44"
              value={intent}
              onChange={setIntent}
              options={[
                { value: "opening", label: "Opening brief" },
                { value: "counter", label: "Analyse counter" },
              ]}
            />
          )}
          <Button
            variant="secondary"
            loading={loading}
            onClick={async () => {
              try {
                await onSuggest(intent);
              } catch (err: unknown) {
                const e = err as {
                  response?: { data?: { message?: string } };
                  message?: string;
                };
                toast.error(
                  e.response?.data?.message ||
                    e.message ||
                    "AI suggestion failed"
                );
              }
            }}
          >
            {suggestLabel}
          </Button>
        </div>
      </div>

      {suggestion && (
        <div className="mt-4 space-y-3 animate-fade-in">
          {suggestion.brief && (
            <p className="text-sm text-ink/65 leading-relaxed whitespace-pre-wrap">
              {suggestion.brief}
            </p>
          )}
          {suggestion.recommendation && (
            <div className="rounded-xl bg-field/80 border border-border/50 px-4 py-3">
              <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
                {suggestion.recommendation}
              </p>
            </div>
          )}
          {variant === "firm" && (
            <div className="flex flex-wrap gap-3 text-xs text-ink/60">
              {suggestion.projectedMarginPct != null && (
                <span>
                  Projected margin{" "}
                  <span className="font-semibold text-ink tabular-nums">
                    {Number(suggestion.projectedMarginPct).toFixed(1)}%
                  </span>
                </span>
              )}
              {suggestion.clearsGuardrail != null && (
                <span
                  className={
                    suggestion.clearsGuardrail
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-red-700 dark:text-red-300"
                  }
                >
                  {suggestion.clearsGuardrail
                    ? "Clears margin floor"
                    : "Below margin floor"}
                </span>
              )}
            </div>
          )}
          {suggestion.risks && suggestion.risks.length > 0 && (
            <ul className="text-xs text-ink/60 space-y-1 list-disc pl-4">
              {suggestion.risks.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}
          {onApplyRates &&
            suggestion.suggestedLines &&
            suggestion.suggestedLines.length > 0 && (
              <Button variant="secondary" onClick={onApplyRates}>
                Apply suggested rates
              </Button>
            )}
        </div>
      )}
    </div>
  );
}
