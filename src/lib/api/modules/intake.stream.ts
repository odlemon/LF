import { ENDPOINTS } from "../endpoints";
import { resolveApiUrl, getAuthHeaders } from "../streamClient";
import { normalizeMatterScope } from "../normalize";
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
  ChatMode,
} from "@/modules/intake/types";

function coerceScope(raw: unknown): MatterScope | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.phases) && !record.id && !record.uid) return null;
  return normalizeMatterScope(record);
}

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
  const lines = block.replace(/\r\n/g, "\n").split("\n");
  let event = "message";
  const dataLines: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      // SSE: keep payload as-is after the optional single space
      const raw = line.slice(5);
      dataLines.push(raw.startsWith(" ") ? raw.slice(1) : raw);
    }
  }

  if (dataLines.length === 0) return null;
  // Spec: multiple data lines are joined with \n
  return { event, data: dataLines.join("\n") };
}

/** Parse SSE JSON; unwrap one level if Spring double-encoded a string. */
function parseEventPayload(data: string): unknown {
  const trimmed = data.trim();
  if (!trimmed) {
    throw new SyntaxError("Empty SSE data");
  }

  let parsed: unknown = JSON.parse(trimmed);

  // Backend sometimes sends objectMapper.writeValueAsString(...) into
  // SseEmitter.data(String), which Jackson then quotes again.
  if (typeof parsed === "string") {
    const inner = parsed.trim();
    if (
      (inner.startsWith("{") && inner.endsWith("}")) ||
      (inner.startsWith("[") && inner.endsWith("]"))
    ) {
      try {
        parsed = JSON.parse(inner);
      } catch {
        // Keep string (e.g. plain token text)
      }
    }
  }

  return parsed;
}

function extractTokenContent(parsed: unknown): string {
  if (typeof parsed === "string") return parsed;
  if (!parsed || typeof parsed !== "object") return "";
  const obj = parsed as Record<string, unknown>;
  const value = obj.content ?? obj.text ?? obj.token ?? obj.delta;
  return typeof value === "string" ? value : "";
}

function extractErrorMessage(parsed: unknown): string {
  if (typeof parsed === "string" && parsed.trim()) return parsed;
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message.trim()) {
      return obj.message;
    }
    if (typeof obj.error === "string" && obj.error.trim()) {
      return obj.error;
    }
  }
  return "Stream error";
}

function dispatchEvent(
  event: string,
  data: string,
  callbacks: StreamMessageCallbacks
): void {
  let parsed: unknown;
  try {
    parsed = parseEventPayload(data);
  } catch (err) {
    // Never kill the whole stream for one bad frame — progress / scope
    // events may already have landed.
    console.warn(
      "[intake.stream] Skipping unparseable SSE event",
      event,
      data.slice(0, 240),
      err
    );
    return;
  }

  const normalizedEvent = event.trim().toLowerCase();

  switch (normalizedEvent) {
    case "start":
      callbacks.onStart?.(parsed as StreamStartEvent);
      break;
    case "user_message": {
      if (!parsed || typeof parsed !== "object") break;
      const raw = parsed as StreamUserMessageEvent & Record<string, unknown>;
      const userMessage = (raw.userMessage ?? raw) as Record<string, unknown>;
      callbacks.onUserMessage?.({
        id: String(userMessage.id ?? userMessage.uid ?? raw.id ?? raw.uid ?? ""),
        sequence:
          (userMessage.sequence as number | undefined) ??
          (raw.sequence as number | undefined),
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
      if (!parsed || typeof parsed !== "object") break;
      const raw = parsed as StreamToolStartEvent & Record<string, unknown>;
      callbacks.onToolStart?.({
        toolName: String(raw.toolName ?? ""),
        humanLabel:
          raw.humanLabel != null ? String(raw.humanLabel) : undefined,
      });
      break;
    }
    case "tool_result": {
      if (!parsed || typeof parsed !== "object") break;
      const raw = parsed as StreamToolResultEvent & Record<string, unknown>;
      callbacks.onToolResult?.({
        toolName: String(raw.toolName ?? ""),
        success: Boolean(raw.success),
        error:
          raw.error != null
            ? String(raw.error)
            : raw.message != null
              ? String(raw.message)
              : undefined,
      });
      break;
    }
    case "scope_generated":
    case "scope_updated": {
      if (!parsed || typeof parsed !== "object") break;
      const raw = parsed as StreamScopeGeneratedEvent &
        StreamScopeUpdatedEvent &
        MatterScope &
        Record<string, unknown>;
      const scope = coerceScope(raw.scope ?? raw);
      if (scope) {
        if (normalizedEvent === "scope_updated") {
          callbacks.onScopeUpdated?.({ scope });
        } else {
          callbacks.onScopeGenerated?.({ scope });
        }
      }
      break;
    }
    case "done": {
      if (!parsed || typeof parsed !== "object") break;
      const raw = parsed as StreamDoneEvent & Record<string, unknown>;
      const scope = coerceScope(raw.scope);
      callbacks.onDone?.({
        ...(raw as StreamDoneEvent),
        scope,
        chatMode: raw.chatMode as ChatMode | undefined,
        scopeGenerated: Boolean(raw.scopeGenerated ?? scope),
      });
      break;
    }
    case "error":
      callbacks.onError?.({ message: extractErrorMessage(parsed) });
      break;
    default: {
      const tokenContent = extractTokenContent(parsed);
      if (tokenContent) {
        callbacks.onToken?.({ content: tokenContent });
      }
      break;
    }
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
      // Normalize CRLF so block splits stay reliable on all platforms
      buffer = buffer.replace(/\r\n/g, "\n");
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
