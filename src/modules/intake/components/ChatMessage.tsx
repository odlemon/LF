import React from "react";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { ChatBubble } from "../types";

interface ChatMessageProps {
  message: ChatBubble;
  isStreaming?: boolean;
}

function ChatMessageComponent({ message, isStreaming = false }: ChatMessageProps) {
  if (message.type === "tool") {
    return (
      <div className="flex justify-start mb-2 pl-2">
        <div className="bg-gray-50 border border-gray-200/50 rounded-xl px-3 py-2 inline-flex items-center gap-2">
          {message.toolStatus === "running" && (
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          )}
          {message.toolStatus === "success" && (
            <HiCheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
          )}
          {message.toolStatus === "failed" && (
            <HiXCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
          )}
          <span
            className={`text-xs ${
              message.toolStatus === "failed" ? "text-red-500" : "text-gray-500"
            }`}
          >
            {message.toolStatus === "failed" && message.toolError
              ? `Failed: ${message.toolError}`
              : message.humanLabel}
          </span>
        </div>
      </div>
    );
  }

  if (message.type === "user") {
    return (
      <div className="flex justify-end mb-3">
        <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%] text-sm whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  const showCursor = isStreaming;

  return (
    <div className="flex justify-start mb-3 flex-col items-start">
      <span className="text-xs text-gray-400 mb-1">Lysp</span>
      <div className="bg-white border border-gray-200/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] text-sm text-gray-800 shadow-sm whitespace-pre-wrap">
        {message.content}
        {showCursor && (
          <span
            className="inline-block w-2 h-4 ml-0.5 bg-gray-400 animate-pulse align-middle"
            aria-hidden
          >
            ▋
          </span>
        )}
      </div>
    </div>
  );
}

export const ChatMessage = React.memo(ChatMessageComponent);
