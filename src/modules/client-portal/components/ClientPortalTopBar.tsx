"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineUserCircle,
} from "react-icons/hi";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { useClientAuth } from "@/hooks/useClientAuth";
import { loadNotificationPrefs } from "@/modules/client-portal/api";
import type { AppNotification } from "@/lib/api/modules/notifications";

function initialsFrom(name?: string | null, email?: string | null) {
  const base = name || email || "C";
  return base
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function portalToastAllowed(n: AppNotification): boolean {
  const prefs = loadNotificationPrefs();
  const type = (n.type || "").toUpperCase();
  if (type.startsWith("NEGOTIATION_")) {
    return prefs.proposalAlerts;
  }
  return prefs.proposalAlerts;
}

export function ClientPortalTopBar({ onMenuClick }: { onMenuClick?: () => void } = {}) {
  const { user, logout } = useClientAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(
    null
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!menuOpen || !triggerRef.current) {
      setMenuPos(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setMenuOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    function onRepos() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onRepos);
    window.addEventListener("scroll", onRepos, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onRepos);
      window.removeEventListener("scroll", onRepos, true);
    };
  }, [menuOpen]);

  const navigate = (href: string) => {
    setMenuOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logout();
    } finally {
      router.push("/client-login");
    }
  };

  const menu =
    menuOpen &&
    menuPos &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={menuRef}
        role="menu"
        style={{ top: menuPos.top, right: menuPos.right }}
        className="fixed z-[200] w-56 overflow-hidden rounded-2xl border border-border/70 bg-surface py-1.5 shadow-lg animate-fade-in"
      >
        <div className="border-b border-border/60 px-3.5 py-2.5 sm:hidden">
          <p className="truncate text-sm font-semibold text-ink">{user?.contactName}</p>
          <p className="truncate text-[11px] text-ink/60">{user?.email}</p>
        </div>
        <button
          type="button"
          role="menuitem"
          onClick={() => navigate("/client-portal/account")}
          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold text-ink/75 hover:bg-hover hover:text-ink"
        >
          <HiOutlineUserCircle className="h-4 w-4" />
          Profile
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => navigate("/client-portal/settings")}
          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold text-ink/75 hover:bg-hover hover:text-ink"
        >
          <HiOutlineCog className="h-4 w-4" />
          Settings
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-semibold text-ink/75 hover:bg-hover hover:text-ink"
        >
          <HiOutlineLogout className="h-4 w-4" />
          Sign out
        </button>
      </div>,
      document.body
    );

  return (
    <header className="relative z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-surface/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="md:hidden inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-ink/60 hover:bg-hover hover:text-ink transition-colors cursor-pointer"
      >
        <HiOutlineMenu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold tracking-wide text-ink/60">
          {user?.clientName || "Secure client workspace"}
        </p>
        <p className="truncate text-xs font-semibold text-ink/70 sm:hidden">
          {user?.contactName}
        </p>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <NotificationBell
          emptyTitle="No proposals updates yet"
          emptyBody="When the firm sends a proposal or counters your rates, it appears here in real time."
          toastFilter={portalToastAllowed}
        />

        <ThemeToggle />

        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1 pl-1 pr-2.5 transition-colors hover:bg-hover sm:pr-3"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary">
              {initialsFrom(user?.contactName, user?.email) || "C"}
            </span>
            <span className="hidden max-w-[9rem] truncate text-left sm:block">
              <span className="block text-[12px] font-semibold leading-tight text-ink">
                {user?.contactName || "Account"}
              </span>
              <span className="block truncate text-[10px] leading-tight text-ink/60">
                {user?.email}
              </span>
            </span>
          </button>
          {menu}
        </div>
      </div>
    </header>
  );
}
