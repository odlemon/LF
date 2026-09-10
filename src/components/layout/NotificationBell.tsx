"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { HiOutlineBell } from "react-icons/hi2";
import {
  type AppNotification,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  openNotificationStream,
} from "@/lib/api/modules/notifications";

function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 60) return "Just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export function NotificationBell({
  emptyTitle = "No notifications yet",
  emptyBody = "When deep pricing research finishes, you will see it here.",
  toastFilter,
}: {
  emptyTitle?: string;
  emptyBody?: string;
  toastFilter?: (n: AppNotification) => boolean;
} = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const primedRef = useRef(false);

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const [list, count] = await Promise.all([
        listNotifications(false),
        getUnreadNotificationCount(),
      ]);
      setItems(list);
      setUnread(count);
      for (const n of list) {
        knownIdsRef.current.add(n.id);
      }
      primedRef.current = true;
    } catch {
      /* ignore while offline */
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  const ingestNotification = useCallback(
    (n: AppNotification) => {
      const isNew = !knownIdsRef.current.has(n.id);
      knownIdsRef.current.add(n.id);
      setItems((prev) => {
        if (prev.some((x) => x.id === n.id)) return prev;
        return [n, ...prev].slice(0, 50);
      });
      if (!n.read) {
        setUnread((c) => c + (isNew ? 1 : 0));
      }
      if (isNew && primedRef.current && !n.read) {
        if (toastFilter && !toastFilter(n)) {
          return;
        }
        toast.success(n.title, {
          duration: 5000,
        });
      }
    },
    [toastFilter]
  );

  useEffect(() => {
    void refresh({ silent: true });
    const poll = setInterval(() => {
      void refresh({ silent: true });
    }, 20000);
    const closeStream = openNotificationStream(ingestNotification, () => {
      /* SSE failed — poll covers it */
    });
    return () => {
      clearInterval(poll);
      closeStream();
    };
  }, [ingestNotification, refresh]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setPos(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 10,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      const t = event.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onRepos() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 10,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", onRepos);
    window.addEventListener("scroll", onRepos, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", onRepos);
      window.removeEventListener("scroll", onRepos, true);
    };
  }, [open]);

  const onOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await refresh();
    }
  };

  const onClickItem = async (n: AppNotification) => {
    try {
      if (!n.read) {
        await markNotificationRead(n.id);
        setItems((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
        );
        setUnread((c) => Math.max(0, c - 1));
      }
    } catch {
      /* navigate anyway */
    }
    setOpen(false);
    if (n.linkUrl) {
      router.push(n.linkUrl);
    }
  };

  const onMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnread(0);
    } catch {
      toast.error("Could not mark notifications read");
    }
  };

  const panel =
    open &&
    pos &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={panelRef}
        style={{ top: pos.top, right: pos.right }}
        className="fixed z-[200] w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-fade-in"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <p className="text-xs font-semibold text-ink">Notifications</p>
            <p className="mt-0.5 text-[10px] font-medium text-ink/60">
              {unread > 0 ? `${unread} unread` : "You are up to date"}
            </p>
          </div>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => void onMarkAll()}
              className="cursor-pointer text-[10px] font-semibold text-ink/60 hover:text-ink py-1.5 -my-1.5"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto rates-scrollable">
          {loading && items.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs text-ink/60">Loading…</div>
          ) : items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-xs font-semibold text-ink/70">{emptyTitle}</p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-ink/60">{emptyBody}</p>
            </div>
          ) : (
            <ul className="py-1.5">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => void onClickItem(n)}
                    className={`w-full cursor-pointer border-b border-border/60 px-4 py-3 text-left transition-colors last:border-0 hover:bg-hover ${
                      !n.read ? "bg-primary/[0.04]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                          n.read ? "bg-transparent" : "bg-primary"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold leading-snug text-ink">
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-ink/60">
                            {n.body}
                          </p>
                        )}
                        <p className="mt-1.5 text-[10px] font-medium text-ink/60">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>,
      document.body
    );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => void onOpen()}
        aria-label="Notifications"
        title="Notifications"
        className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-ink/70 transition-colors hover:bg-hover hover:text-ink"
      >
        <HiOutlineBell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 h-4 min-w-[16px] rounded-full bg-primary px-1 text-center text-[9px] font-bold leading-4 text-on-primary">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {panel}
    </div>
  );
}
