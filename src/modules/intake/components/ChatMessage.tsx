import React from "react";
import { HiStop } from "react-icons/hi";
import { ChatBubble } from "../types";
import { MarkdownContent } from "./MarkdownContent";

interface ChatMessageProps {
  message: ChatBubble;
  isStreaming?: boolean;
  onCancelStream?: () => void;
  onRemoveQueued?: (messageId: string) => void;
}

function ChatMessageComponent({
  message,
  isStreaming = false,
  onCancelStream,
  onRemoveQueued,
}: ChatMessageProps) {
  // Tool steps are rendered by ThinkingProcess — skip standalone pills
  if (message.type === "tool") {
    return null;
  }

  if (message.type === "user") {
    return (
      <div className="group flex justify-end mb-3.5">
        <div className="relative max-w-[85%]">
          <div
            className={`rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
              message.queued
                ? "bg-ink/80 text-on-primary/90 border border-dashed border-on-primary/20"
                : "bg-primary text-on-primary"
            }`}
          >
            {message.content}
            {message.queued && (
              <p className="mt-1.5 text-[10px] uppercase tracking-wider text-on-primary/55 font-semibold">
                Queued — sends when Lysp finishes
              </p>
            )}
          </div>
          {message.queued && onRemoveQueued && (
            <button
              type="button"
              onClick={() => onRemoveQueued(message.id)}
              className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-surface border border-border text-ink/55 hover:text-ink shadow-sm"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex justify-start mb-3.5 flex-col items-start gap-1 w-full">
      <div className="flex items-center gap-2 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/35">
          Lysp
        </span>
        {message.cancelled && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/35">
            · Stopped
          </span>
        )}
      </div>
      <div className="relative bg-surface border border-border rounded-2xl rounded-tl-md px-4 py-3 max-w-[95%] w-fit min-w-0 shadow-sm">
        {message.content?.trim() ? (
          <MarkdownContent content={message.content} />
        ) : isStreaming ? (
          <p className="text-sm text-ink/40 italic">Thinking…</p>
        ) : message.cancelled ? (
          <p className="text-sm text-ink/45 italic">Generation stopped.</p>
        ) : null}
        {isStreaming && message.content?.trim() && (
          <span
            className="inline-block w-1.5 h-3.5 ml-0.5 bg-ink/40 animate-pulse align-middle"
            aria-hidden
          />
        )}

        {isStreaming && onCancelStream && (
          <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={onCancelStream}
              className="flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-ink/70 shadow-md hover:text-ink hover:bg-hover"
              aria-label="Stop generating"
            >
              <HiStop className="h-3 w-3" />
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export const ChatMessage = React.memo(ChatMessageComponent);
