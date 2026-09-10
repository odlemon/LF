"use client";

import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import {
  HiChevronDown,
  HiOutlineLogout,
  HiOutlineCog,
  HiOutlineUserCircle,
  HiOutlineMenu,
} from "react-icons/hi";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { NotificationBell } from "@/components/layout/NotificationBell";

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps = {}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(
    null
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isDropdownOpen || !triggerRef.current) {
      setMenuPos(null);
      return;
    }
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 10,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!isDropdownOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsDropdownOpen(false);
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setIsDropdownOpen(false);
    }

    function handleReposition() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 10,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [isDropdownOpen]);

  const navigate = (href: string) => {
    setIsDropdownOpen(false);
    router.push(href);
  };

  const handleLogout = async () => {
    setIsDropdownOpen(false);
    try {
      await logout();
    } catch (err) {
      console.error("Failed to log out:", err);
    } finally {
      // Signing out returns the user to the public site, not the app's own login —
      // the app and the marketing site are separate deployments.
      const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL;
      if (landingUrl) {
        window.location.href = landingUrl;
      } else {
        router.push("/login");
      }
    }
  };

  const getInitials = () => {
    if (!user) return "LY";
    const first = user.firstName ? user.firstName.charAt(0) : "";
    const last = user.lastName ? user.lastName.charAt(0) : "";
    return (first + last).toUpperCase() || user.email.charAt(0).toUpperCase();
  };

  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";

    const looksLikeUid = (value: string) =>
      /^[0-9A-Z]{10,}$/i.test(value) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(value) ||
      /^[0-9A-Z]{8,16}$/i.test(value);

    const ROUTE_TITLES: Record<string, string> = {
      "pricing-requests": "Pricing Requests",
      clients: "Clients",
      settings: "Settings",
      preferences: "Preferences",
      account: "Account",
      users: "Users",
      roles: "Roles",
      "rate-cards": "Rate Cards",
      "practice-areas": "Practice Areas",
      "fee-earner-levels": "Fee Earner Levels",
      dashboard: "Dashboard",
      pricing: "Pricing",
      approvals: "Approvals",
      negotiations: "Negotiations",
    };

    if (segments.length >= 2 && looksLikeUid(segments[segments.length - 1])) {
      const parent = segments[segments.length - 2];
      if (parent === "pricing-requests") return "Pricing Request";
      if (ROUTE_TITLES[parent]) {
        return ROUTE_TITLES[parent].replace(/s$/, "");
      }
      return ROUTE_TITLES[parent] ?? "Detail";
    }

    if (segments.length >= 3 && looksLikeUid(segments[segments.length - 2])) {
      const leaf = segments[segments.length - 1];
      return (
        ROUTE_TITLES[leaf] ??
        leaf.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      );
    }

    const lastSegment = segments[segments.length - 1];
    const isSettings = segments.includes("settings");

    if (ROUTE_TITLES[lastSegment]) {
      return isSettings && lastSegment !== "settings"
        ? `Settings · ${ROUTE_TITLES[lastSegment]}`
        : ROUTE_TITLES[lastSegment];
    }

    let title = lastSegment.replace(/-/g, " ");
    title = title.replace(/\b\w/g, (c) => c.toUpperCase());

    if (isSettings && lastSegment !== "settings") {
      return `Settings · ${title}`;
    }

    return title;
  };

  const roles = user?.roles || [];
  const primaryRole = roles.includes("SUPER_ADMIN")
    ? "Super Admin"
    : roles.includes("ADMIN")
      ? "Firm Admin"
      : roles.length > 0
        ? roles[0].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "Staff Member";

  const menu =
    isDropdownOpen &&
    menuPos &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        ref={menuRef}
        role="menu"
        style={{ top: menuPos.top, right: menuPos.right }}
        className="fixed z-[200] w-64 rounded-2xl border border-border bg-surface py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-fade-in"
      >
        <div className="flex flex-col gap-1 border-b border-border px-4 py-3">
          <span className="text-xs font-semibold leading-tight text-ink">
            {user ? `${user.firstName} ${user.lastName}` : "Lysp User"}
          </span>
          <span className="truncate text-[10px] font-medium text-ink/60">
            {user?.email}
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roles.map((role) => (
              <span
                key={role}
                className="inline-flex items-center rounded border border-border bg-hover px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-ink/70"
              >
                {role.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-0.5 p-1.5">
          <button
            type="button"
            role="menuitem"
            onClick={() => navigate("/account")}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold text-ink/70 transition-all hover:bg-hover hover:text-ink"
          >
            <HiOutlineUserCircle className="h-4 w-4 text-ink/60" />
            Profile
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => navigate("/settings/preferences")}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold text-ink/70 transition-all hover:bg-hover hover:text-ink"
          >
            <HiOutlineCog className="h-4 w-4 text-ink/60" />
            Settings
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleLogout()}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-semibold text-ink/70 transition-all hover:bg-hover hover:text-ink"
          >
            <HiOutlineLogout className="h-4 w-4 text-ink/60" />
            Sign out
          </button>
        </div>
      </div>,
      document.body
    );

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-surface/85 px-4 sm:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-hover hover:text-ink transition-colors md:hidden"
          aria-label="Open menu"
        >
          <HiOutlineMenu className="h-5 w-5" />
        </button>
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <NotificationBell />

        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsDropdownOpen((v) => !v)}
            className="flex cursor-pointer items-center gap-2.5 rounded-full p-1.5 transition-all duration-200 hover:bg-hover focus:outline-none focus:ring-2 focus:ring-primary/15"
            aria-expanded={isDropdownOpen}
            aria-haspopup="menu"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary">
              {getInitials()}
            </div>

            <div className="mr-1 hidden select-none flex-col text-left md:flex">
              <span className="text-xs font-semibold leading-tight text-ink">
                {user ? `${user.firstName} ${user.lastName}` : "Lysp User"}
              </span>
              <span className="mt-0.5 text-[9px] font-semibold uppercase leading-none tracking-wider text-ink/60">
                {primaryRole}
              </span>
            </div>

            <HiChevronDown
              className={`h-4 w-4 text-ink/60 transition-transform duration-300 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {menu}
        </div>
      </div>
    </header>
  );
}
