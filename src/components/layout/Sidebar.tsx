/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { PERMISSIONS, Permission } from "@/lib/utils/permissions";
import {
  HiHome,
  HiClipboardList,
  HiDocumentText,
  HiCheckCircle,
  HiScale,
  HiChartBar,
  HiUserGroup,
  HiViewList,
  HiUsers,
  HiLockClosed,
  HiDatabase,
  HiFolder,
  HiShieldCheck,
  HiChevronDown,
  HiChevronUp,
  HiChip,
} from "react-icons/hi";

interface NavItem {
  label: string;
  route: string;
  permission?: Permission | string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  const mainNavItems: NavItem[] = [
    { label: "Dashboard", route: "/dashboard", icon: HiHome },
    { label: "Pricing Requests", route: "/pricing-requests", permission: PERMISSIONS.REQUEST_READ, icon: HiDocumentText },
    { label: "Approvals", route: "/approvals", permission: PERMISSIONS.APPROVAL_READ, icon: HiCheckCircle },
    { label: "Negotiations", route: "/negotiations", permission: PERMISSIONS.NEGOTIATION_READ, icon: HiScale },
    { label: "Analytics", route: "/analytics", permission: PERMISSIONS.ANALYTICS_READ, icon: HiChartBar },
    { label: "Knowledge Base", route: "/knowledge", permission: PERMISSIONS.KNOWLEDGE_READ, icon: HiDocumentText },
    { label: "Clients", route: "/clients", permission: PERMISSIONS.CLIENT_READ, icon: HiUserGroup },
  ];

  const settingsNavItems: NavItem[] = [
    { label: "Practice Areas", route: "/settings/practice-areas", permission: PERMISSIONS.PRACTICE_AREA_READ, icon: HiFolder },
    { label: "Fee Earner Levels", route: "/settings/fee-earner-levels", permission: "FEE_EARNER_READ", icon: HiScale },
    { label: "Rate Cards", route: "/settings/rate-cards", permission: PERMISSIONS.RATE_CARD_READ, icon: HiDatabase },
    { label: "Guardrails", route: "/settings/guardrails", permission: PERMISSIONS.FIRM_READ, icon: HiShieldCheck },
    { label: "Data Room", route: "/settings/data-room", permission: "DATA_ROOM_READ", icon: HiDatabase },
    { label: "Users", route: "/settings/users", permission: PERMISSIONS.USER_READ, icon: HiUsers },
    { label: "Roles", route: "/settings/roles", permission: PERMISSIONS.ROLE_READ, icon: HiLockClosed },
    { label: "AI Configuration", route: "/settings/ai-config", permission: "AI_CONFIG_READ", icon: HiChip },
  ];

  const renderItem = (item: NavItem) => {
    const isActive = pathname === item.route;
    const Icon = item.icon;

    return (
      <Link
        key={item.route}
        href={item.route}
        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
          isActive
            ? "bg-primary text-white shadow-md shadow-primary/30 rounded-xl"
            : "text-gray-700 hover:bg-gray-100/80 rounded-lg"
        }`}
      >
        <Icon className="w-5 h-5" />
        {item.label}
      </Link>
    );
  };

  const checkPermission = (permission?: Permission | string) => {
    if (!permission) return true;
    if (!user) return false;
    const roles = user.roles || [];
    if (roles.includes("SUPER_ADMIN") || roles.includes("ADMIN")) {
      return true;
    }
    return user.permissions.includes(permission as any);
  };

  const visibleSettingsItems = settingsNavItems.filter((i) => checkPermission(i.permission));

  return (
    <aside className="w-64 bg-white border-r border-gray-200/50 flex flex-col h-screen sticky top-0 p-4 shadow-2xl shadow-black/5">
      <div className="mb-8 px-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo/lysp-logo.png"
            alt="Lysp"
            width={36}
            height={36}
            className="h-9 w-9 object-contain shrink-0"
          />
          <span className="text-xl font-bold text-gray-900 tracking-tight">Lysp</span>
        </Link>
        <Link href="/settings/firm" className="text-xs font-semibold text-primary hover:underline shrink-0">
          Firm Settings
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-6 overflow-y-auto rates-scrollable">
        <div className="flex flex-col gap-1">
          {mainNavItems.filter((i) => checkPermission(i.permission)).map(renderItem)}
        </div>

        {visibleSettingsItems.length > 0 && (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-900 transition-colors w-full text-left"
            >
              <span>Settings</span>
              {isSettingsOpen ? <HiChevronUp className="w-3.5 h-3.5" /> : <HiChevronDown className="w-3.5 h-3.5" />}
            </button>
            
            {isSettingsOpen && (
              <div className="flex flex-col gap-1 pl-1 transition-all duration-300 animate-fade-in">
                {visibleSettingsItems.map(renderItem)}
              </div>
            )}
          </div>
        )}

        {checkPermission(PERMISSIONS.AUDIT_READ) && (
          <div className="flex flex-col gap-1 border-t border-gray-100 pt-4 mt-2">
            <span className="px-4 py-2 text-xs font-semibold text-gray-550 uppercase tracking-wider block">
              Audit Logs
            </span>
            <Link
              href="/audit-trail"
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all ${
                pathname === "/audit-trail"
                  ? "bg-primary text-white shadow-md shadow-primary/30 rounded-xl"
                  : "text-gray-700 hover:bg-gray-100/80 rounded-lg"
              }`}
            >
              <HiClipboardList className="w-5 h-5" />
              Audit Trail
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
