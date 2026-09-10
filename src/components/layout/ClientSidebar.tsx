"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineTrendingDown,
  HiOutlineArchive,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineCog,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
} from "react-icons/hi";
import { useClientAuth } from "@/hooks/useClientAuth";
import { PlatformLogo } from "./PlatformLogo";

const COLLAPSE_STORAGE_KEY = "lysp.clientSidebar.collapsed";

interface ClientNavItem {
  label: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ClientSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function ClientSidebar({ isMobileOpen = false, onMobileClose }: ClientSidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useClientAuth();
  // Read on mount rather than in the initial state so server and first client
  // render agree; seeding from storage directly would hydrate-mismatch.
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      setIsCollapsed(window.localStorage.getItem(COLLAPSE_STORAGE_KEY) === "1");
    } catch {
      /* storage unavailable (private mode) — stay expanded */
    }
  }, []);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* preference simply will not persist */
      }
      return next;
    });
  };

  const clientNavItems: ClientNavItem[] = [
    { label: "Dashboard", route: "/client-portal/dashboard", icon: HiOutlineHome },
    { label: "Proposals", route: "/client-portal/negotiations", icon: HiOutlineDocumentText },
    { label: "Discount Status", route: "/client-portal/discount", icon: HiOutlineTrendingDown },
    { label: "Matter History", route: "/client-portal/matters", icon: HiOutlineArchive },
    { label: "Account", route: "/client-portal/account", icon: HiOutlineUser },
    { label: "Settings", route: "/client-portal/settings", icon: HiOutlineCog },
  ];

  const initials = (user?.contactName || user?.email || "C")
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const handleLogout = async () => {
    await logout();
    router.push("/client-login");
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`bg-surface border-r border-border flex flex-col h-screen fixed inset-y-0 left-0 z-50 transition-all duration-200 ease-out md:sticky md:top-0 md:translate-x-0 ${
          isCollapsed ? "w-64 md:w-[76px]" : "w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex items-center gap-2.5 px-5 pt-5 pb-4 ${
            isCollapsed ? "md:flex-col md:gap-3 md:px-2" : ""
          }`}
        >
          <PlatformLogo size={30} />
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-ink tracking-tight leading-none">Lysp</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/60 leading-none">
                Client Portal
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="ml-auto hidden md:inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink/60 hover:text-ink hover:bg-hover transition-colors cursor-pointer md:ml-auto"
          >
            {isCollapsed ? (
              <HiChevronDoubleRight className="w-3.5 h-3.5" />
            ) : (
              <HiChevronDoubleLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {user && (
          <Link
            href="/client-portal/account"
            onClick={onMobileClose}
            title={isCollapsed ? user.contactName : undefined}
            className={`mb-3 flex items-center gap-3 rounded-2xl border border-border/60 bg-canvas/60 py-3 transition-colors hover:border-ink/20 hover:bg-hover/60 ${
              isCollapsed ? "mx-2 justify-center px-2" : "mx-3 px-3.5"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-on-primary">
              {initials || "C"}
            </span>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink leading-tight">
                  {user.contactName}
                </p>
                <p className="truncate text-[11px] text-ink/60 leading-tight">{user.clientName}</p>
              </div>
            )}
          </Link>
        )}

        <nav
          className={`flex-1 flex flex-col gap-0.5 overflow-y-auto rates-scrollable ${
            isCollapsed ? "px-2" : "px-3"
          }`}
        >
          {clientNavItems.map((item) => {
            const isActive = pathname === item.route || pathname.startsWith(item.route + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.route}
                href={item.route}
                onClick={onMobileClose}
                title={isCollapsed ? item.label : undefined}
                aria-label={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 py-2.5 text-sm font-semibold transition-all rounded-full ${
                  isCollapsed ? "justify-center px-0" : "px-4"
                } ${
                  isActive
                    ? "bg-primary text-on-primary shadow-sm shadow-black/10"
                    : "text-ink/65 hover:bg-hover hover:text-ink"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className={`border-t border-border/60 p-3 ${isCollapsed ? "px-2" : ""}`}>
          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Sign out" : undefined}
            aria-label={isCollapsed ? "Sign out" : undefined}
            className={`flex w-full items-center gap-3 rounded-full py-2.5 text-sm font-semibold text-ink/60 transition-colors hover:bg-hover hover:text-ink ${
              isCollapsed ? "justify-center px-0" : "px-4"
            }`}
          >
            <HiOutlineLogout className="w-5 h-5 shrink-0" />
            {!isCollapsed && "Sign out"}
          </button>
          {!isCollapsed && <p className="mt-2 px-4 text-[10px] text-ink/60">Secured by Lysp</p>}
        </div>
      </aside>
    </>
  );
}
