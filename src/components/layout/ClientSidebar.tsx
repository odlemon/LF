"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiHome,
  HiScale,
  HiTrendingDown,
  HiArchive,
} from "react-icons/hi";

interface ClientNavItem {
  label: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ClientSidebar() {
  const pathname = usePathname();

  const clientNavItems: ClientNavItem[] = [
    { label: "Dashboard", route: "/client-portal/dashboard", icon: HiHome },
    { label: "Proposals", route: "/client-portal/negotiations", icon: HiScale },
    { label: "Discount Status", route: "/client-portal/discount", icon: HiTrendingDown },
    { label: "Matter History", route: "/client-portal/matters", icon: HiArchive },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200/50 flex flex-col h-screen sticky top-0 p-4 shadow-2xl shadow-black/5">
      <div className="mb-8 px-4">
        <span className="text-xl font-bold text-gray-900 tracking-tight">Lysp Client</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto rates-scrollable">
        {clientNavItems.map((item) => {
          const isActive = pathname === item.route;
          const Icon = item.icon;

          return (
            <Link
              key={item.route}
              href={item.route}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                isActive
                  ? "bg-green-50 text-green-700 font-semibold shadow-sm rounded-xl"
                  : "text-gray-700 hover:bg-gray-100/80 rounded-lg"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
