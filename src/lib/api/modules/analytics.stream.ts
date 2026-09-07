import { ENDPOINTS } from "../endpoints";
import { resolveApiUrl, getAuthHeaders } from "../streamClient";
import type {
  AdvisorStartEvent,
  AdvisorTokenEvent,
  AdvisorToolStartEvent,
  AdvisorToolResultEvent,
  AdvisorDoneEvent,
  AdvisorErrorEvent,
} from "@/modules/analytics/types";

/**
 * SSE client for the analytics advisor chat.
 *
 * Mirrors intake.stream.ts exactly (same SSE block parsing, same tolerant
 * payload handling, same event names) because the advisor backend mirrors the
 * intake/negotiation chat streaming contract. If the advisor team ships
 * different event names, the `default` branch below still extracts token
 * content so streaming keeps working.
 */

export interface AdvisorStreamCallbacks {
  onStart?: (data: AdvisorStartEvent) => void;
  onToken?: (data: AdvisorTokenEvent) => void;
  onToolStart?: (data: AdvisorToolStartEvent) => void;
  onToolResult?: (data: AdvisorToolResultEvent) => void;
  onDone?: (data: AdvisorDoneEvent) => void;
  onError?: (data: AdvisorErrorEvent) => void;
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
      const raw = line.slice(5);
      dataLines.push(raw.startsWith(" ") ? raw.slice(1) : raw);
    }
  }

  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join("\n") };
}

/** Parse SSE JSON; unwrap one level if Spring double-encoded a string. */
function parseEventPayload(data: string): unknown {
  const trimmed = data.trim();
  if (!trimmed) {
    throw new SyntaxError("Empty SSE data");
  }

  let parsed: unknown = JSON.parse(trimmed);

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

function extractSessionId(parsed: unknown): string | undefined {
  if (!parsed || typeof parsed !== "object") return undefined;
  const obj = parsed as Record<string, unknown>;
  const value = obj.sessionId ?? obj.sessionUid;
  return value != null ? String(value) : undefined;
}

function dispatchEvent(
  event: string,
  data: string,
  callbacks: AdvisorStreamCallbacks
): void {
  let parsed: unknown;
  try {
    parsed = parseEventPayload(data);
  } catch (err) {
    console.warn(
      "[analytics.stream] Skipping unparseable SSE event",
      event,
      data.slice(0, 240),
      err
    );
    return;
  }

  const normalizedEvent = event.trim().toLowerCase();

  switch (normalizedEvent) {
    case "start":
      callbacks.onStart?.({
        sessionId: extractSessionId(parsed),
        messageUid:
          parsed && typeof parsed === "object"
            ? (parsed as Record<string, unknown>).messageUid != null
              ? String((parsed as Record<string, unknown>).messageUid)
              : undefined
            : undefined,
      });
      break;
    case "token":
    case "message":
    case "chunk":
    case "delta":
      callbacks.onToken?.({ content: extractTokenContent(parsed) });
      break;
    case "tool_start": {
      if (!parsed || typeof parsed !== "object") break;
      const raw = parsed as Record<string, unknown>;
      callbacks.onToolStart?.({
        toolName: String(raw.toolName ?? ""),
        humanLabel: raw.humanLabel != null ? String(raw.humanLabel) : undefined,
      });
      break;
    }
    case "tool_result": {
      if (!parsed || typeof parsed !== "object") break;
      const raw = parsed as Record<string, unknown>;
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
    case "done":
      callbacks.onDone?.({
        sessionId: extractSessionId(parsed),
      });
      break;
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

/**
 * Send a message to the analytics advisor and consume the SSE response.
 * Body contract: `{ sessionId?, message }`.
 */
export async function streamAdvisorMessage(
  message: string,
  sessionId: string | null,
  callbacks: AdvisorStreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const url = resolveApiUrl(ENDPOINTS.ANALYTICS.ADVISOR_MESSAGES);

  const body: Record<string, string> = { message };
  if (sessionId) body.sessionId = sessionId;

  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    let errorMessage = `Advisor request failed (${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody?.message) errorMessage = errBody.message;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error("No response body for advisor stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
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
