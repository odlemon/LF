"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { HiPaperAirplane, HiPaperClip, HiStop } from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import { ChatBubble, ChatMode, IntakeAttachment } from "../types";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { AttachmentPill } from "./AttachmentPill";

interface ChatPanelProps {
  messages: ChatBubble[];
  isAiThinking?: boolean;
  showTypingIndicator?: boolean;
  streamingMessageId?: string | null;
  onSendMessage: (content: string) => void;
  onStopStreaming?: () => void;
  attachments: IntakeAttachment[];
  uploadingFiles: Record<string, "uploading" | "done" | "error">;
  onAttach: (file: File) => void;
  onDeleteAttachment: (attachmentUid: string) => void;
  disabled?: boolean;
  chatMode?: ChatMode;
}

export function ChatPanel({
  messages,
  isAiThinking = false,
  showTypingIndicator = false,
  streamingMessageId = null,
  onSendMessage,
  onStopStreaming,
  attachments,
  uploadingFiles,
  onAttach,
  onDeleteAttachment,
  disabled = false,
  chatMode,
}: ChatPanelProps) {
  const streamingMessage = streamingMessageId
    ? messages.find((m) => m.id === streamingMessageId)
    : null;
  const hasStreamedText = Boolean(streamingMessage?.content?.trim());

  const typing = showTypingIndicator && !hasStreamedText;
  const inputBlocked = isAiThinking || disabled;

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
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

  return (
    <div className="w-[45%] flex flex-col border-r border-gray-200/50 bg-gray-50/30 min-h-0">
      <div className="flex-1 overflow-y-auto rates-scrollable p-4 min-h-0">
        {showWelcome ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-primary/25">
              L
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-bold text-gray-900">Hi, I&apos;m Lysp.</h3>
              <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
                Tell me about the matter you need to scope. You can start by describing
                what the client needs, or attach any RFP or brief documents.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages
              .filter(
                (msg) =>
                  !(typing && msg.type === "ai" && msg.content === "")
              )
              .map((msg, index) => (
                <ChatMessage
                  key={msg.id ? `${msg.id}-${index}` : `msg-${index}`}
                  message={msg}
                  isStreaming={
                    isAiThinking &&
                    msg.id === streamingMessageId &&
                    msg.type === "ai"
                  }
                />
              ))}
            {typing && !hasStreamedText && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200/50 bg-white/80 backdrop-blur-sm p-4 shrink-0">
        {(attachments.length > 0 || Object.keys(uploadingFiles).length > 0) && (
          <div className="flex flex-wrap gap-2 mb-3">
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
                  state={state === "uploading" ? "uploading" : state === "done" ? "done" : "error"}
                  showRemove={false}
                />
              );
            })}
          </div>
        )}

        {chatMode === "SCOPE_CONFIRMED" && (
          <div className="bg-blue-50 border border-blue-200/50 rounded-xl px-3 py-2 mb-2 text-xs text-blue-600">
            Scope is confirmed. You can still ask questions but the scope cannot be modified.
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the matter or ask a question..."
            disabled={inputBlocked}
            rows={1}
            className="flex-1 px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition-all max-h-[120px] overflow-y-auto rates-scrollable disabled:opacity-60"
          />
          {isAiThinking && onStopStreaming ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onStopStreaming}
              className="!px-3 !py-3 shrink-0"
              aria-label="Stop generating"
            >
              <HiStop className="w-5 h-5" />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={inputBlocked}
                className="!px-3 !py-3 shrink-0"
                aria-label="Attach file"
              >
                <HiPaperClip className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                disabled={!input.trim() || inputBlocked}
                className="!px-3 !py-3 shrink-0"
                aria-label="Send message"
              >
                <HiPaperAirplane className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
