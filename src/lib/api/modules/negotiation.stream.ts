import { ENDPOINTS } from "../endpoints";
import { resolveApiUrl, getAuthHeaders } from "../streamClient";

export type NegotiationChatSide = "FIRM" | "CLIENT";

export interface NegotiationChatMessageDto {
  id: string;
  negotiationUid?: string;
  side?: string;
  role: string;
  content: string;
  sequence?: number;
  createdAt?: string;
}

export interface NegotiationStreamCallbacks {
  onStart?: (data: { userMessage?: NegotiationChatMessageDto }) => void;
  onUserMessage?: (data: NegotiationChatMessageDto) => void;
  onToken?: (data: { content: string }) => void;
  onToolStart?: (data: { toolName: string; humanLabel?: string }) => void;
  onToolResult?: (data: {
    toolName: string;
    success: boolean;
    data?: unknown;
  }) => void;
  onSuggestedRates?: (data: unknown) => void;
  onNegotiationUpdated?: (data: { toolName?: string; data?: unknown }) => void;
  onDone?: (data: {
    userMessage?: NegotiationChatMessageDto;
    aiMessage?: NegotiationChatMessageDto;
    suggestedRates?: unknown;
  }) => void;
  onError?: (data: { message: string }) => void;
}

function parseSseBlock(block: string): { event: string; data: string } | null {
  const lines = block.replace(/\r\n/g, "\n").split("\n");
  let event = "message";
  const dataLines: string[] = [];
  for (const line of lines) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) {
      const raw = line.slice(5);
      dataLines.push(raw.startsWith(" ") ? raw.slice(1) : raw);
    }
  }
  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join("\n") };
}

function parseEventPayload(data: string): unknown {
  const trimmed = data.trim();
  if (!trimmed) throw new SyntaxError("Empty SSE data");
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
        /* keep string */
      }
    }
  }
  return parsed;
}

function extractToken(parsed: unknown): string {
  if (typeof parsed === "string") return parsed;
  if (!parsed || typeof parsed !== "object") return "";
  const obj = parsed as Record<string, unknown>;
  const value = obj.content ?? obj.text ?? obj.token ?? obj.delta;
  return typeof value === "string" ? value : "";
}

function asMessage(raw: unknown): NegotiationChatMessageDto | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = String(o.id ?? o.uid ?? "");
  const content = String(o.content ?? "");
  const role = String(o.role ?? "AI");
  if (!id && !content) return null;
  return {
    id: id || `tmp-${Date.now()}`,
    negotiationUid: o.negotiationUid != null ? String(o.negotiationUid) : undefined,
    side: o.side != null ? String(o.side) : undefined,
    role,
    content,
    sequence: typeof o.sequence === "number" ? o.sequence : undefined,
    createdAt: o.createdAt != null ? String(o.createdAt) : undefined,
  };
}

function dispatch(
  event: string,
  data: string,
  callbacks: NegotiationStreamCallbacks
) {
  let parsed: unknown;
  try {
    parsed = parseEventPayload(data);
  } catch {
    return;
  }
  const name = event.trim().toLowerCase();
  switch (name) {
    case "start": {
      if (parsed && typeof parsed === "object") {
        const raw = parsed as Record<string, unknown>;
        callbacks.onStart?.({
          userMessage: asMessage(raw.userMessage) ?? undefined,
        });
      }
      break;
    }
    case "user_message": {
      if (parsed && typeof parsed === "object") {
        const raw = parsed as Record<string, unknown>;
        const msg = asMessage(raw.userMessage ?? raw);
        if (msg) callbacks.onUserMessage?.(msg);
      }
      break;
    }
    case "token":
    case "chunk":
    case "delta":
    case "message":
      callbacks.onToken?.({ content: extractToken(parsed) });
      break;
    case "tool_start": {
      if (parsed && typeof parsed === "object") {
        const raw = parsed as Record<string, unknown>;
        callbacks.onToolStart?.({
          toolName: String(raw.toolName ?? ""),
          humanLabel: raw.humanLabel != null ? String(raw.humanLabel) : undefined,
        });
      }
      break;
    }
    case "tool_result": {
      if (parsed && typeof parsed === "object") {
        const raw = parsed as Record<string, unknown>;
        callbacks.onToolResult?.({
          toolName: String(raw.toolName ?? ""),
          success: Boolean(raw.success),
          data: raw.data,
        });
      }
      break;
    }
    case "suggested_rates":
      callbacks.onSuggestedRates?.(parsed);
      break;
    case "negotiation_updated": {
      if (parsed && typeof parsed === "object") {
        const raw = parsed as Record<string, unknown>;
        callbacks.onNegotiationUpdated?.({
          toolName: raw.toolName != null ? String(raw.toolName) : undefined,
          data: raw.data,
        });
      } else {
        callbacks.onNegotiationUpdated?.({});
      }
      break;
    }
    case "done": {
      if (parsed && typeof parsed === "object") {
        const raw = parsed as Record<string, unknown>;
        callbacks.onDone?.({
          userMessage: asMessage(raw.userMessage) ?? undefined,
          aiMessage: asMessage(raw.aiMessage) ?? undefined,
          suggestedRates: raw.suggestedRates,
        });
      }
      break;
    }
    case "error": {
      let message = "Stream error";
      if (typeof parsed === "string") message = parsed;
      else if (parsed && typeof parsed === "object") {
        const m = (parsed as Record<string, unknown>).message;
        if (typeof m === "string" && m.trim()) message = m;
      }
      callbacks.onError?.({ message });
      break;
    }
    default: {
      const t = extractToken(parsed);
      if (t) callbacks.onToken?.({ content: t });
    }
  }
}

export async function streamNegotiationChat(
  uid: string,
  side: NegotiationChatSide,
  content: string,
  callbacks: NegotiationStreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const path =
    side === "CLIENT"
      ? ENDPOINTS.NEGOTIATIONS.PORTAL_AI_MESSAGES_STREAM(uid)
      : ENDPOINTS.NEGOTIATIONS.AI_MESSAGES_STREAM(uid);
  const url = resolveApiUrl(path);

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
      /* ignore */
    }
    throw new Error(message);
  }
  if (!response.body) throw new Error("No response body for stream");

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
        if (parsed) dispatch(parsed.event, parsed.data, callbacks);
      }
    }
    if (buffer.trim()) {
      const parsed = parseSseBlock(buffer);
      if (parsed) dispatch(parsed.event, parsed.data, callbacks);
    }
  } finally {
    reader.releaseLock();
  }
}
