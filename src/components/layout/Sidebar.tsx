/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { PERMISSIONS, Permission } from "@/lib/utils/permissions";
import { PlatformLogo } from "@/components/layout/PlatformLogo";
import {
  HiHome,
  HiClipboardList,
  HiDocumentText,
  HiCheckCircle,
  HiScale,
  HiChartBar,
  HiUserGroup,
  HiUsers,
  HiLockClosed,
  HiDatabase,
  HiFolder,
  HiShieldCheck,
  HiChevronDown,
  HiChevronUp,
  HiChip,
  HiOutlineTrendingDown,
  HiReceiptRefund,
  HiOutlineSwitchHorizontal,
  HiOutlineClipboardCheck,
  HiOutlineCloudUpload,
  HiOutlineKey,
  HiOutlineOfficeBuilding,
  HiOutlineIdentification,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
} from "react-icons/hi";

const COLLAPSE_STORAGE_KEY = "lysp.sidebar.collapsed";

interface NavItem {
  label: string;
  route: string;
  permission?: Permission | string | (Permission | string)[];
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps = {}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  // Read on mount rather than in the initial state so the server and first client
  // render agree; flipping straight to the stored value would hydrate-mismatch.
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

  const mainNavItems: NavItem[] = [
    { label: "Dashboard", route: "/dashboard", icon: HiHome },
    { label: "Pricing Requests", route: "/pricing-requests", permission: PERMISSIONS.REQUEST_READ, icon: HiDocumentText },
    { label: "Approvals", route: "/approvals", permission: PERMISSIONS.SCENARIO_APPROVE, icon: HiCheckCircle },
    { label: "Negotiations", route: "/negotiations", permission: PERMISSIONS.NEGOTIATION_READ, icon: HiScale },
    { label: "Analytics", route: "/analytics", permission: PERMISSIONS.ANALYTICS_READ, icon: HiChartBar },
    { label: "Clients", route: "/clients", permission: PERMISSIONS.CLIENT_READ, icon: HiUserGroup },
  ];

  const settingsNavGroups: { heading: string; items: NavItem[] }[] = [
    {
      heading: "Firm Setup",
      items: [
        { label: "Firm Profile", route: "/settings/firm", permission: PERMISSIONS.FIRM_READ, icon: HiOutlineIdentification },
        { label: "Practice Areas", route: "/settings/practice-areas", permission: PERMISSIONS.PRACTICE_AREA_READ, icon: HiFolder },
        { label: "Fee Earner Levels", route: "/settings/fee-earner-levels", permission: "FEE_EARNER_READ", icon: HiScale },
        { label: "Rate Cards", route: "/settings/rate-cards", permission: PERMISSIONS.RATE_CARD_READ, icon: HiDatabase },
        { label: "FX Rates", route: "/settings/fx-rates", permission: PERMISSIONS.FIRM_READ, icon: HiOutlineSwitchHorizontal },
        { label: "Approval Matrix", route: "/settings/approval-matrix", permission: PERMISSIONS.FIRM_READ, icon: HiOutlineClipboardCheck },
        { label: "Guardrails", route: "/settings/guardrails", permission: PERMISSIONS.FIRM_READ, icon: HiShieldCheck },
      ],
    },
    {
      heading: "Billing & Usage",
      items: [
        { label: "Billing & Usage", route: "/settings/billing", permission: [PERMISSIONS.BILLING_ACCOUNT_READ, PERMISSIONS.USAGE_READ], icon: HiReceiptRefund },
        { label: "Volume Discounts", route: "/settings/volume-discounts", permission: "VOLUME_DISCOUNT_PROGRAM_READ", icon: HiOutlineTrendingDown },
        { label: "Firm Consumption", route: "/settings/usage/firms", permission: PERMISSIONS.USAGE_CROSS_FIRM_READ, icon: HiOutlineOfficeBuilding },
      ],
    },
    {
      heading: "Data & AI",
      items: [
        { label: "Data Room", route: "/settings/data-room", permission: "DATAROOM_READ", icon: HiDatabase },
        { label: "PMS Connectors", route: "/settings/data-room/pms-connectors", permission: "DATAROOM_READ", icon: HiOutlineCloudUpload },
        { label: "AI Configuration", route: "/settings/ai-config", permission: "AI_CONFIG_READ", icon: HiChip },
      ],
    },
    {
      heading: "Access & Security",
      items: [
        { label: "Users", route: "/settings/users", permission: PERMISSIONS.USER_READ, icon: HiUsers },
        { label: "Roles", route: "/settings/roles", permission: PERMISSIONS.ROLE_READ, icon: HiLockClosed },
        { label: "SSO Admin", route: "/settings/sso", permission: PERMISSIONS.FIRM_READ, icon: HiOutlineKey },
      ],
    },
  ];

  const renderItem = (item: NavItem) => {
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
            ? "bg-primary text-on-primary"
            : "text-ink/65 hover:bg-hover hover:text-ink"
        }`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        {!isCollapsed && item.label}
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
    // Partners own client relationships, approvals, and rate negotiation.
    if (roles.includes("PARTNER")) {
      if (
        permission === PERMISSIONS.SCENARIO_APPROVE ||
        permission === PERMISSIONS.NEGOTIATION_READ ||
        permission === PERMISSIONS.NEGOTIATION_UPDATE ||
        permission === PERMISSIONS.NEGOTIATION_WRITE ||
        permission === PERMISSIONS.CLIENT_READ ||
        permission === PERMISSIONS.REQUEST_READ ||
        permission === PERMISSIONS.SCENARIO_READ
      ) {
        return true;
      }
    }
    return user.permissions.includes(permission as any);
  };

  const isPartnerOnly =
    (user?.roles || []).includes("PARTNER") &&
    !(user?.roles || []).includes("SUPER_ADMIN") &&
    !(user?.roles || []).includes("ADMIN");

  const partnerRoutes = new Set([
    "/dashboard",
    "/approvals",
    "/negotiations",
    "/clients",
  ]);

  const checkNavPermission = (permission?: Permission | string | (Permission | string)[]) =>
    Array.isArray(permission) ? permission.some(checkPermission) : checkPermission(permission);

  const visibleMainItems = mainNavItems.filter((i) => {
    if (isPartnerOnly) {
      return partnerRoutes.has(i.route);
    }
    return checkNavPermission(i.permission);
  });
  const visibleSettingsGroups = isPartnerOnly
    ? []
    : settingsNavGroups
        .map((group) => ({
          heading: group.heading,
          items: group.items.filter((i) => checkNavPermission(i.permission)),
        }))
        .filter((group) => group.items.length > 0);

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
        className={`bg-surface border-r border-border flex flex-col h-screen p-4 fixed inset-y-0 left-0 z-50 transition-all duration-200 ease-out md:sticky md:top-0 md:translate-x-0 ${
          isCollapsed ? "w-64 md:w-[76px]" : "w-64"
        } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
      <div
        className={`mb-8 px-3 flex items-center gap-2 ${
          isCollapsed ? "md:flex-col md:px-0 md:gap-3" : "justify-between"
        }`}
      >
        <Link href="/dashboard" className="inline-flex items-center shrink-0" aria-label="Lysp home" onClick={onMobileClose}>
          <PlatformLogo size={40} />
        </Link>
        <button
          type="button"
          onClick={toggleCollapsed}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-ink/60 hover:text-ink hover:bg-hover transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <HiChevronDoubleRight className="w-3.5 h-3.5" />
          ) : (
            <HiChevronDoubleLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-6 overflow-y-auto rates-scrollable">
        <div className="flex flex-col gap-0.5">
          {visibleMainItems.map(renderItem)}
        </div>

        {visibleSettingsGroups.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {isCollapsed ? (
              <div className="my-2 border-t border-border" aria-hidden />
            ) : (
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="flex items-center justify-between px-4 py-2 text-[11px] font-semibold text-ink/60 uppercase tracking-[0.18em] hover:text-ink/70 transition-colors w-full text-left cursor-pointer"
              >
                <span>Settings</span>
                {isSettingsOpen ? (
                  <HiChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <HiChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {/* Collapsed to icons there is no group header to re-open it with, so the
                group always shows; the toggle only applies to the expanded rail. */}
            {(isSettingsOpen || isCollapsed) && (
              <div
                className={`flex flex-col gap-3 transition-all duration-300 animate-fade-in ${
                  isCollapsed ? "" : "pl-1"
                }`}
              >
                {visibleSettingsGroups.map((group) => (
                  <div key={group.heading} className="flex flex-col gap-0.5">
                    {!isCollapsed && (
                      <div className="px-4 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40">
                        {group.heading}
                      </div>
                    )}
                    {group.items.map(renderItem)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isPartnerOnly && checkPermission(PERMISSIONS.AUDIT_READ) && (
          <div className="flex flex-col gap-0.5 border-t border-border pt-4 mt-2">
            {!isCollapsed && (
              <span className="px-4 py-2 text-[11px] font-semibold text-ink/60 uppercase tracking-[0.18em] block">
                Audit
              </span>
            )}
            {renderItem({ label: "Audit Trail", route: "/audit-trail", icon: HiClipboardList })}
          </div>
        )}
      </nav>
      </aside>
    </>
  );
}
