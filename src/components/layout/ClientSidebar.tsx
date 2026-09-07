"use client";

import React from "react";
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
} from "react-icons/hi";
import { useClientAuth } from "@/hooks/useClientAuth";
import { PlatformLogo } from "./PlatformLogo";

interface ClientNavItem {
  label: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useClientAuth();

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
    router.push("/auth");
  };

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <PlatformLogo size={30} />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-ink tracking-tight leading-none">Lysp</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/40 leading-none">
            Client Portal
          </p>
        </div>
      </div>

      {user && (
        <Link
          href="/client-portal/account"
          className="mx-3 mb-3 flex items-center gap-3 rounded-2xl border border-border/60 bg-canvas/60 px-3.5 py-3 transition-colors hover:border-ink/20 hover:bg-hover/60"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-on-primary">
            {initials || "C"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink leading-tight">
              {user.contactName}
            </p>
            <p className="truncate text-[11px] text-ink/45 leading-tight">{user.clientName}</p>
          </div>
        </Link>
      )}

      <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto rates-scrollable px-3">
        {clientNavItems.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(item.route + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.route}
              href={item.route}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-primary text-on-primary rounded-full shadow-sm shadow-black/10"
                  : "text-ink/65 hover:bg-hover hover:text-ink rounded-full"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold text-ink/60 transition-colors hover:bg-hover hover:text-ink"
        >
          <HiOutlineLogout className="w-5 h-5" />
          Sign out
        </button>
        <p className="mt-2 px-4 text-[10px] text-ink/30">Secured by Lysp</p>
      </div>
    </aside>
  );
}
