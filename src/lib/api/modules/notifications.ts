import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { resolveBackendUrl } from "@/lib/api/baseUrl";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  linkUrl?: string | null;
  resourceType?: string | null;
  resourceUid?: string | null;
  read: boolean;
  readAt?: string | null;
  createdAt?: string | null;
}

export async function listNotifications(
  unreadOnly = false
): Promise<AppNotification[]> {
  const res = await apiClient.get<AppNotification[]>(ENDPOINTS.NOTIFICATIONS.LIST, {
    params: { unreadOnly },
  });
  return res.data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const res = await apiClient.get<{ count: number }>(
    ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
  );
  return res.data.count ?? 0;
}

export async function markNotificationRead(
  uid: string
): Promise<AppNotification> {
  const res = await apiClient.post<AppNotification>(
    ENDPOINTS.NOTIFICATIONS.MARK_READ(uid)
  );
  return res.data;
}

export async function markAllNotificationsRead(): Promise<number> {
  const res = await apiClient.post<{ marked: number }>(
    ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
  );
  return res.data.marked ?? 0;
}

export function openNotificationStream(
  onNotification: (n: AppNotification) => void,
  onError?: () => void
): () => void {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token || token === "mock-client-token") {
    return () => undefined;
  }

  const url = resolveBackendUrl(ENDPOINTS.NOTIFICATIONS.STREAM);
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        onError?.();
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const block of parts) {
          const lines = block.replace(/\r\n/g, "\n").split("\n");
          let event = "message";
          const dataLines: string[] = [];
          for (const line of lines) {
            if (!line || line.startsWith(":")) continue;
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
          }
          if (event !== "notification" || dataLines.length === 0) continue;
          try {
            onNotification(JSON.parse(dataLines.join("\n")) as AppNotification);
          } catch {
            /* ignore malformed */
          }
        }
      }
    } catch (err) {
      if ((err as { name?: string })?.name !== "AbortError") {
        onError?.();
      }
    }
  })();

  return () => controller.abort();
}
