/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
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
  HiOutlineChartBar,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";

interface NavItem {
  label: string;
  route: string;
  permission?: Permission | string;
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

  const mainNavItems: NavItem[] = [
    { label: "Dashboard", route: "/dashboard", icon: HiHome },
    { label: "Pricing Requests", route: "/pricing-requests", permission: PERMISSIONS.REQUEST_READ, icon: HiDocumentText },
    { label: "Approvals", route: "/approvals", permission: PERMISSIONS.SCENARIO_APPROVE, icon: HiCheckCircle },
    { label: "Negotiations", route: "/negotiations", permission: PERMISSIONS.NEGOTIATION_READ, icon: HiScale },
    { label: "Analytics", route: "/analytics", permission: PERMISSIONS.ANALYTICS_READ, icon: HiChartBar },
    // Knowledge Base: the backend module exists (/v1/knowledge-articles) but no
    // frontend page was ever built, so this link 404'd for every user. Hidden
    // until the page exists rather than shipping a dead nav item.
    // { label: "Knowledge Base", route: "/knowledge", permission: PERMISSIONS.KNOWLEDGE_READ, icon: HiDocumentText },
    { label: "Clients", route: "/clients", permission: PERMISSIONS.CLIENT_READ, icon: HiUserGroup },
  ];

  const settingsNavItems: NavItem[] = [
    { label: "Practice Areas", route: "/settings/practice-areas", permission: PERMISSIONS.PRACTICE_AREA_READ, icon: HiFolder },
    { label: "Fee Earner Levels", route: "/settings/fee-earner-levels", permission: "FEE_EARNER_READ", icon: HiScale },
    { label: "Rate Cards", route: "/settings/rate-cards", permission: PERMISSIONS.RATE_CARD_READ, icon: HiDatabase },
    { label: "FX Rates", route: "/settings/fx-rates", permission: PERMISSIONS.FIRM_READ, icon: HiOutlineSwitchHorizontal },
    { label: "Approval Matrix", route: "/settings/approval-matrix", permission: PERMISSIONS.FIRM_READ, icon: HiOutlineClipboardCheck },
    { label: "Volume Discounts", route: "/settings/volume-discounts", permission: "VOLUME_DISCOUNT_PROGRAM_READ", icon: HiOutlineTrendingDown },
    { label: "Billing", route: "/settings/billing", permission: PERMISSIONS.BILLING_ACCOUNT_READ, icon: HiReceiptRefund },
    { label: "Usage & Billing", route: "/settings/usage", permission: PERMISSIONS.USAGE_READ, icon: HiOutlineChartBar },
    { label: "Firm Consumption", route: "/settings/usage/firms", permission: PERMISSIONS.USAGE_CROSS_FIRM_READ, icon: HiOutlineOfficeBuilding },
    { label: "Guardrails", route: "/settings/guardrails", permission: PERMISSIONS.FIRM_READ, icon: HiShieldCheck },
    { label: "Data Room", route: "/settings/data-room", permission: "DATAROOM_READ", icon: HiDatabase },
    { label: "PMS Connectors", route: "/settings/data-room/pms-connectors", permission: "DATAROOM_READ", icon: HiOutlineCloudUpload },
    { label: "Users", route: "/settings/users", permission: PERMISSIONS.USER_READ, icon: HiUsers },
    { label: "Roles", route: "/settings/roles", permission: PERMISSIONS.ROLE_READ, icon: HiLockClosed },
    { label: "AI Configuration", route: "/settings/ai-config", permission: "AI_CONFIG_READ", icon: HiChip },
    { label: "SSO Admin", route: "/settings/sso", permission: PERMISSIONS.FIRM_READ, icon: HiOutlineKey },
  ];

  const renderItem = (item: NavItem) => {
    const isActive = pathname === item.route || pathname.startsWith(item.route + "/");
    const Icon = item.icon;

    return (
      <Link
        key={item.route}
        href={item.route}
        onClick={onMobileClose}
        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all ${
          isActive
            ? "bg-primary text-on-primary rounded-full"
            : "text-ink/65 hover:bg-hover hover:text-ink rounded-full"
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

  const visibleMainItems = mainNavItems.filter((i) => {
    if (isPartnerOnly) {
      return partnerRoutes.has(i.route);
    }
    return checkPermission(i.permission);
  });
  const visibleSettingsItems = isPartnerOnly
    ? []
    : settingsNavItems.filter((i) => checkPermission(i.permission));

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
        className={`w-64 bg-surface border-r border-border flex flex-col h-screen p-4 fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out md:sticky md:top-0 md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="mb-8 px-3 flex items-center justify-between gap-2">
        <Link href="/dashboard" className="inline-flex items-center shrink-0" aria-label="Lysp home" onClick={onMobileClose}>
          <PlatformLogo size={40} />
        </Link>
        {!isPartnerOnly && (
          <Link
            href="/settings/firm"
            onClick={onMobileClose}
            className="text-[11px] font-semibold text-ink/45 hover:text-ink shrink-0"
          >
            Firm
          </Link>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-6 overflow-y-auto rates-scrollable">
        <div className="flex flex-col gap-0.5">
          {visibleMainItems.map(renderItem)}
        </div>

        {visibleSettingsItems.length > 0 && (
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center justify-between px-4 py-2 text-[11px] font-semibold text-ink/35 uppercase tracking-[0.18em] hover:text-ink/70 transition-colors w-full text-left cursor-pointer"
            >
              <span>Settings</span>
              {isSettingsOpen ? (
                <HiChevronUp className="w-3.5 h-3.5" />
              ) : (
                <HiChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {isSettingsOpen && (
              <div className="flex flex-col gap-0.5 pl-1 transition-all duration-300 animate-fade-in">
                {visibleSettingsItems.map(renderItem)}
              </div>
            )}
          </div>
        )}

        {!isPartnerOnly && checkPermission(PERMISSIONS.AUDIT_READ) && (
          <div className="flex flex-col gap-0.5 border-t border-border pt-4 mt-2">
            <span className="px-4 py-2 text-[11px] font-semibold text-ink/35 uppercase tracking-[0.18em] block">
              Audit
            </span>
            <Link
              href="/audit-trail"
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all ${
                pathname === "/audit-trail"
                  ? "bg-primary text-on-primary rounded-full"
                  : "text-ink/65 hover:bg-hover hover:text-ink rounded-full"
              }`}
            >
              <HiClipboardList className="w-5 h-5" />
              Audit Trail
            </Link>
          </div>
        )}
      </nav>
      </aside>
    </>
  );
}
