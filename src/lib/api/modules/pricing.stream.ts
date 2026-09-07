import { ENDPOINTS } from "../endpoints";
import { resolveApiUrl, getAuthHeaders } from "../streamClient";
import type { PricingScenario } from "@/modules/pricing/types";

export interface PricingStreamToolStart {
  toolName: string;
  humanLabel?: string;
  sequence?: number;
}

export interface PricingStreamToolResult {
  toolName: string;
  success: boolean;
  error?: string;
  message?: string;
  sequence?: number;
}

export interface PricingStreamDone {
  scenarios: PricingScenario[];
  count?: number;
}

export interface PricingStreamCallbacks {
  onStart?: () => void;
  onToolStart?: (data: PricingStreamToolStart) => void;
  onToolResult?: (data: PricingStreamToolResult) => void;
  onDone?: (data: PricingStreamDone) => void;
  onError?: (message: string) => void;
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
        // keep string
      }
    }
  }
  return parsed;
}

function extractErrorMessage(parsed: unknown): string {
  if (typeof parsed === "string" && parsed.trim()) return parsed;
  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message.trim()) return obj.message;
    if (typeof obj.error === "string" && obj.error.trim()) return obj.error;
  }
  return "Scenario generation failed";
}

function dispatchEvent(
  event: string,
  data: string,
  callbacks: PricingStreamCallbacks
): void {
  let parsed: unknown;
  try {
    parsed = parseEventPayload(data);
  } catch (err) {
    console.warn("[pricing.stream] Skipping unparseable SSE event", event, err);
    return;
  }

  const name = event.trim().toLowerCase();
  switch (name) {
    case "start":
      callbacks.onStart?.();
      break;
    case "tool_start": {
      if (!parsed || typeof parsed !== "object") break;
      const raw = parsed as Record<string, unknown>;
      callbacks.onToolStart?.({
        toolName: String(raw.toolName ?? ""),
        humanLabel:
          raw.humanLabel != null ? String(raw.humanLabel) : undefined,
        sequence:
          typeof raw.sequence === "number" ? raw.sequence : undefined,
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
            : undefined,
        message:
          raw.message != null ? String(raw.message) : undefined,
        sequence:
          typeof raw.sequence === "number" ? raw.sequence : undefined,
      });
      break;
    }
    case "done": {
      if (!parsed || typeof parsed !== "object") break;
      const raw = parsed as Record<string, unknown>;
      const scenarios = Array.isArray(raw.scenarios)
        ? (raw.scenarios as PricingScenario[])
        : [];
      callbacks.onDone?.({
        scenarios,
        count: typeof raw.count === "number" ? raw.count : scenarios.length,
      });
      break;
    }
    case "error":
      callbacks.onError?.(extractErrorMessage(parsed));
      break;
    default:
      break;
  }
}

export async function streamGenerateScenarios(
  requestUid: string,
  callbacks: PricingStreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const url = resolveApiUrl(
    ENDPOINTS.PRICING_REQUESTS.SCENARIOS_GENERATE_STREAM(requestUid)
  );

  const response = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: "{}",
    signal,
    credentials: "include",
  });

  if (!response.ok) {
    let message = `Generate stream failed (${response.status})`;
    try {
      const errBody = await response.json();
      if (errBody?.message) message = errBody.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error("No response body for generate stream");
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
        if (parsed) dispatchEvent(parsed.event, parsed.data, callbacks);
      }
    }

    if (buffer.trim()) {
      const parsed = parseSseBlock(buffer);
      if (parsed) dispatchEvent(parsed.event, parsed.data, callbacks);
    }
  } finally {
    reader.releaseLock();
  }
}
