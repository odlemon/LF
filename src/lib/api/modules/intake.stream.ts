import { ENDPOINTS } from "../endpoints";
import { resolveApiUrl, getAuthHeaders } from "../streamClient";
import {
  StreamStartEvent,
  StreamTokenEvent,
  StreamDoneEvent,
  StreamScopeGeneratedEvent,
  StreamScopeUpdatedEvent,
  StreamErrorEvent,
  StreamUserMessageEvent,
  StreamToolStartEvent,
  StreamToolResultEvent,
  MatterScope,
} from "@/modules/intake/types";

export interface StreamMessageCallbacks {
  onStart?: (data: StreamStartEvent) => void;
  onUserMessage?: (data: StreamUserMessageEvent) => void;
  onToken?: (data: StreamTokenEvent) => void;
  onToolStart?: (data: StreamToolStartEvent) => void;
  onToolResult?: (data: StreamToolResultEvent) => void;
  onScopeGenerated?: (data: StreamScopeGeneratedEvent) => void;
  onScopeUpdated?: (data: StreamScopeUpdatedEvent) => void;
  onDone?: (data: StreamDoneEvent) => void;
  onError?: (data: StreamErrorEvent) => void;
}

function parseSseBlock(block: string): { event: string; data: string } | null {
  const lines = block.split("\n").filter((line) => line.trim() !== "");
  let event = "message";
  let data = "";

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      data += (data ? "\n" : "") + line.slice(5).trim();
    }
  }

  if (!data) return null;
  return { event, data };
}

function extractTokenContent(parsed: unknown): string {
  if (typeof parsed === "string") return parsed;
  if (!parsed || typeof parsed !== "object") return "";
  const obj = parsed as Record<string, unknown>;
  const value = obj.content ?? obj.text ?? obj.token ?? obj.delta;
  return typeof value === "string" ? value : "";
}

function dispatchEvent(
  event: string,
  data: string,
  callbacks: StreamMessageCallbacks
): void {
  try {
    const parsed = JSON.parse(data) as unknown;
    const normalizedEvent = event.trim().toLowerCase();

    switch (normalizedEvent) {
      case "start":
        callbacks.onStart?.(parsed as StreamStartEvent);
        break;
      case "user_message": {
        const raw = parsed as StreamUserMessageEvent & Record<string, unknown>;
        callbacks.onUserMessage?.({
          id: String(raw.id ?? raw.uid ?? ""),
          sequence: raw.sequence as number | undefined,
        });
        break;
      }
      case "token":
      case "message":
      case "chunk":
      case "delta":
        callbacks.onToken?.({ content: extractTokenContent(parsed) });
        break;
      case "tool_start": {
        const raw = parsed as StreamToolStartEvent & Record<string, unknown>;
        callbacks.onToolStart?.({
          toolName: String(raw.toolName ?? ""),
          humanLabel: raw.humanLabel != null ? String(raw.humanLabel) : undefined,
        });
        break;
      }
      case "tool_result": {
        const raw = parsed as StreamToolResultEvent & Record<string, unknown>;
        callbacks.onToolResult?.({
          toolName: String(raw.toolName ?? ""),
          success: Boolean(raw.success),
          error: raw.error != null ? String(raw.error) : undefined,
        });
        break;
      }
      case "scope_generated":
      case "scope_updated": {
        const raw = parsed as StreamScopeGeneratedEvent & StreamScopeUpdatedEvent & MatterScope;
        const scope = raw.scope ?? (raw.uid && raw.phases ? raw : null);
        if (scope) {
          if (normalizedEvent === "scope_updated") {
            callbacks.onScopeUpdated?.({ scope: scope as MatterScope });
          } else {
            callbacks.onScopeGenerated?.({ scope: scope as MatterScope });
          }
        }
        break;
      }
      case "done":
        callbacks.onDone?.(parsed as StreamDoneEvent);
        break;
      case "error":
        callbacks.onError?.(parsed as StreamErrorEvent);
        break;
      default: {
        // Some backends emit unnamed events with token payloads
        const tokenContent = extractTokenContent(parsed);
        if (tokenContent) {
          callbacks.onToken?.({ content: tokenContent });
        }
        break;
      }
    }
  } catch {
    callbacks.onError?.({ message: "Failed to parse stream event" });
  }
}

export async function streamMessage(
  uid: string,
  content: string,
  callbacks: StreamMessageCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const url = resolveApiUrl(ENDPOINTS.PRICING_REQUESTS.MESSAGES_STREAM(uid));

  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    let message = `Stream request failed (${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody?.message) message = errBody.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error("No response body for stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() ?? "";

      for (const block of blocks) {
        const parsed = parseSseBlock(block);
        if (parsed) {
          dispatchEvent(parsed.event, parsed.data, callbacks);
        }
      }
    }

    if (buffer.trim()) {
      const parsed = parseSseBlock(buffer);
      if (parsed) {
        dispatchEvent(parsed.event, parsed.data, callbacks);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
