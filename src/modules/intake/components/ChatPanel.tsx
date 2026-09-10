"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { HiPaperAirplane, HiPlus, HiStop } from "react-icons/hi";
import { ChatBubble, ChatMode, IntakeAttachment } from "../types";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { AttachmentPill } from "./AttachmentPill";
import { ThinkingProcess, groupChatItems } from "./ThinkingProcess";

interface ChatPanelProps {
  messages: ChatBubble[];
  isAiThinking?: boolean;
  showTypingIndicator?: boolean;
  streamingMessageId?: string | null;
  onSendMessage: (content: string) => void;
  onStopStreaming?: () => void;
  onRemoveQueued?: (messageId: string) => void;
  queueCount?: number;
  attachments: IntakeAttachment[];
  uploadingFiles: Record<string, "uploading" | "done" | "error">;
  onAttach: (file: File) => void;
  onDeleteAttachment: (attachmentUid: string) => void;
  disabled?: boolean;
  isAttaching?: boolean;
  chatMode?: ChatMode;
  /** When scope is open: half width. When collapsed: centered ChatGPT-style column. */
  layout?: "split" | "centered";
}

const TEXTAREA_MAX_PX = 168;

export function ChatPanel({
  messages,
  isAiThinking = false,
  showTypingIndicator = false,
  streamingMessageId = null,
  onSendMessage,
  onStopStreaming,
  onRemoveQueued,
  queueCount = 0,
  attachments,
  uploadingFiles,
  onAttach,
  onDeleteAttachment,
  disabled = false,
  isAttaching = false,
  chatMode,
  layout = "split",
}: ChatPanelProps) {
  const streamingMessage = streamingMessageId
    ? messages.find((m) => m.id === streamingMessageId)
    : null;
  const hasStreamedText = Boolean(streamingMessage?.content?.trim());

  const typing = showTypingIndicator && !hasStreamedText;
  // Allow sending while Lysp works — messages queue instead of blocking
  const inputBlocked = disabled || isAttaching;

  const [input, setInput] = useState("");
  const [composerTall, setComposerTall] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const streamContent = streamingMessage?.content ?? "";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streamContent]);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, TEXTAREA_MAX_PX);
    el.style.height = `${next}px`;
    setComposerTall(next > 40);
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || inputBlocked) return;
    onSendMessage(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setComposerTall(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAttach(file);
    e.target.value = "";
  };

  const showWelcome = messages.length === 0 && !typing && !isAiThinking;
  const canEditScope = chatMode !== "SCOPE_CONFIRMED";
  const canSend = Boolean(input.trim()) && !inputBlocked;

  return (
    <div
      className={`flex flex-col min-h-0 h-full w-full transition-[max-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        layout === "split" ? "max-w-none" : "max-w-3xl"
      }`}
    >
      <div className="flex-1 overflow-y-auto rates-scrollable px-4 py-5 min-h-0">
        {showWelcome ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center text-lg font-bold shadow-sm">
              L
            </div>
            <div className="flex flex-col gap-2 max-w-sm">
              <h3 className="text-lg font-semibold text-ink tracking-tight">
                Hi, I&apos;m Lysp.
              </h3>
              <p className="text-sm text-ink/50 leading-relaxed">
                Describe the matter, attach an RFP or brief, or ask for comparable
                past scopes. When you&apos;re ready, ask me to generate the scope.
              </p>
            </div>
          </div>
        ) : (
          <>
            {groupChatItems(
              messages.filter(
                (msg) => !(typing && msg.type === "ai" && msg.content === "")
              )
            ).map((item, index) => {
              if (item.kind === "thinking") {
                const live =
                  isAiThinking &&
                  item.steps.some((s) => s.toolStatus === "running");
                return (
                  <ThinkingProcess
                    key={item.id || `thinking-${index}`}
                    steps={item.steps}
                    live={live}
                  />
                );
              }

              const msg = item.message;
              return (
                <ChatMessage
                  key={msg.id ? `${msg.id}-${index}` : `msg-${index}`}
                  message={msg}
                  isStreaming={
                    isAiThinking &&
                    msg.id === streamingMessageId &&
                    msg.type === "ai"
                  }
                  onCancelStream={
                    isAiThinking &&
                    msg.id === streamingMessageId &&
                    msg.type === "ai"
                      ? onStopStreaming
                      : undefined
                  }
                  onRemoveQueued={onRemoveQueued}
                />
              );
            })}
            {typing && !hasStreamedText && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="bg-surface px-4 pt-2 pb-4 shrink-0">
        {(attachments.length > 0 || Object.keys(uploadingFiles).length > 0) && (
          <div className="flex flex-wrap gap-2 mb-2.5 px-1">
            {attachments.map((att) => (
              <AttachmentPill
                key={att.uid}
                fileName={att.fileName}
                state="done"
                onRemove={() => onDeleteAttachment(att.uid)}
              />
            ))}
            {Object.entries(uploadingFiles).map(([name, state]) => {
              if (attachments.some((a) => a.fileName === name)) return null;
              return (
                <AttachmentPill
                  key={name}
                  fileName={name}
                  state={
                    state === "uploading"
                      ? "uploading"
                      : state === "done"
                        ? "done"
                        : "error"
                  }
                  showRemove={false}
                />
              );
            })}
          </div>
        )}

        {chatMode === "SCOPE_CONFIRMED" && (
          <p className="mb-2 text-center text-[11px] text-ink/40">
            Scope is locked — you can still ask questions.
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleFileChange}
        />

        <div
          className={`flex items-end gap-1 border border-border bg-surface shadow-[0_2px_12px_rgba(10,10,10,0.04)] transition-[border-radius] ${
            composerTall ? "rounded-[26px]" : "rounded-full"
          } ${inputBlocked ? "opacity-70" : ""}`}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={inputBlocked}
            className="mb-1.5 ml-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink/55 hover:bg-hover hover:text-ink transition-colors disabled:opacity-50"
            aria-label="Attach file"
          >
            <HiPlus className="h-5 w-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isAttaching
                ? "Uploading document..."
                : isAiThinking
                  ? "Send another message — it will wait in queue…"
                  : canEditScope
                    ? "Ask anything"
                    : "Ask a question..."
            }
            disabled={inputBlocked}
            rows={1}
            className="composer-textarea flex-1 min-w-0 max-h-[168px] resize-none bg-transparent py-3.5 pr-1 text-[15px] leading-6 text-ink placeholder:text-ink/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface disabled:cursor-not-allowed"
          />

          {isAiThinking && onStopStreaming ? (
            <button
              type="button"
              onClick={onStopStreaming}
              className="mb-1.5 mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary hover:bg-primary-hover transition-colors"
              aria-label="Stop generating"
            >
              <HiStop className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSend}
              className={`mb-1.5 mr-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                canSend
                  ? "bg-primary text-on-primary hover:bg-primary-hover"
                  : "bg-ink/10 text-ink/30 cursor-not-allowed"
              }`}
              aria-label="Send message"
            >
              <HiPaperAirplane className="h-4 w-4 translate-x-px -translate-y-px" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
