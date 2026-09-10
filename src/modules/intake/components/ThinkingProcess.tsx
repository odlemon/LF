"use client";

import React, { useEffect, useState } from "react";
import { HiCheck, HiChevronRight, HiX } from "react-icons/hi";
import { ChatBubble } from "../types";
import { thinkingCopyFor } from "../constants/toolThinking";

interface ThinkingProcessProps {
  steps: ChatBubble[];
  /** While Lysp is still working on this turn */
  live?: boolean;
}

function friendlyError(raw?: string): string {
  if (!raw) return "Something went wrong on this step.";
  const lower = raw.toLowerCase();
  if (lower.includes("duplicate key") || lower.includes("unique constraint")) {
    return "Couldn't replace the existing plan — the previous draft was still locked.";
  }
  if (lower.includes("rollback-only")) {
    return "Couldn't save this change. A retry usually clears it.";
  }
  if (raw.length > 110) return `${raw.slice(0, 107)}…`;
  return raw;
}

function stepTitle(step: ChatBubble): string {
  const copy = thinkingCopyFor(step.toolName);
  if (step.toolStatus === "failed") return "This step didn't complete";
  if (step.toolStatus === "running") {
    return step.humanLabel || copy.running;
  }
  return copy.done;
}

function stepDetail(step: ChatBubble): string {
  if (step.toolStatus === "failed") {
    return friendlyError(step.toolError);
  }
  return thinkingCopyFor(step.toolName).detail;
}

export function ThinkingProcess({ steps, live = false }: ThinkingProcessProps) {
  const hasFailure = steps.some((s) => s.toolStatus === "failed");
  const allSettled = steps.every(
    (s) => s.toolStatus === "success" || s.toolStatus === "failed"
  );
  const running = live || steps.some((s) => s.toolStatus === "running");

  const [expanded, setExpanded] = useState(true);
  const [userToggled, setUserToggled] = useState(false);

  useEffect(() => {
    if (userToggled) return;
    if (running) {
      setExpanded(true);
    } else if (allSettled) {
      // Brief beat so the user sees the finished trail, then collapse
      const t = window.setTimeout(() => setExpanded(false), 900);
      return () => window.clearTimeout(t);
    }
  }, [running, allSettled, userToggled]);

  const successCount = steps.filter((s) => s.toolStatus === "success").length;
  const active = steps.find((s) => s.toolStatus === "running");
  const summary = running
    ? active
      ? stepTitle(active)
      : "Working through the matter…"
    : hasFailure
      ? `Thought process · issue on ${steps.length} step${steps.length === 1 ? "" : "s"}`
      : `Thought process · ${successCount} step${successCount === 1 ? "" : "s"}`;

  return (
    <div className="mb-4 max-w-xl">
      <button
        type="button"
        onClick={() => {
          setUserToggled(true);
          setExpanded((v) => !v);
        }}
        className="group flex items-center gap-2 text-left text-[13px] text-ink/60 hover:text-ink/75 transition-colors py-1"
        aria-expanded={expanded}
      >
        <HiChevronRight
          className={`w-3.5 h-3.5 shrink-0 text-ink/60 transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        />
        {running ? (
          <span className="w-3 h-3 border-2 border-ink/20 border-t-ink/65 rounded-full animate-spin shrink-0" />
        ) : (
          <span
            className={`flex h-3.5 w-3.5 items-center justify-center rounded-full shrink-0 ${
              hasFailure ? "bg-red-500/15 text-red-700" : "bg-ink/8 text-ink/60"
            }`}
          >
            {hasFailure ? (
              <HiX className="w-2.5 h-2.5" />
            ) : (
              <HiCheck className="w-2.5 h-2.5" />
            )}
          </span>
        )}
        <span className="font-medium tracking-tight">{summary}</span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <ol className="mt-2.5 space-y-3 pl-1">
            {steps.map((step, i) => {
              const failed = step.toolStatus === "failed";
              const isRunning = step.toolStatus === "running";
              return (
                <li key={step.id} className="flex gap-3 min-w-0">
                  <div className="flex flex-col items-center pt-0.5 shrink-0 w-5">
                    {isRunning ? (
                      <span className="w-3.5 h-3.5 border-2 border-ink/20 border-t-ink/60 rounded-full animate-spin" />
                    ) : (
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                          failed
                            ? "bg-red-500/12 text-red-700"
                            : "bg-ink/[0.06] text-ink/60"
                        }`}
                      >
                        {failed ? (
                          <HiX className="w-3 h-3" />
                        ) : (
                          <HiCheck className="w-3 h-3" />
                        )}
                      </span>
                    )}
                    {i < steps.length - 1 && (
                      <span className="mt-1 w-px flex-1 min-h-[8px] bg-transparent" />
                    )}
                  </div>
                  <div className="min-w-0 pb-0.5">
                    <p
                      className={`text-[13px] font-medium leading-snug tracking-tight ${
                        failed
                          ? "text-red-700"
                          : isRunning
                            ? "text-ink/75"
                            : "text-ink/60"
                      }`}
                    >
                      {stepTitle(step)}
                    </p>
                    <p
                      className={`mt-0.5 text-[12px] leading-relaxed ${
                        failed ? "text-red-600/80" : "text-ink/60"
                      }`}
                    >
                      {stepDetail(step)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

/** Group consecutive tool bubbles for Cursor-style thought process rendering. */
export type ChatRenderItem =
  | { kind: "message"; message: ChatBubble }
  | { kind: "thinking"; id: string; steps: ChatBubble[] };

export function groupChatItems(messages: ChatBubble[]): ChatRenderItem[] {
  const items: ChatRenderItem[] = [];
  let toolBuffer: ChatBubble[] = [];

  const flushTools = () => {
    if (toolBuffer.length === 0) return;
    items.push({
      kind: "thinking",
      id: `thinking-${toolBuffer[0].id}`,
      steps: toolBuffer,
    });
    toolBuffer = [];
  };

  for (const msg of messages) {
    if (msg.type === "tool") {
      toolBuffer.push(msg);
    } else {
      flushTools();
      items.push({ kind: "message", message: msg });
    }
  }
  flushTools();
  return items;
}
