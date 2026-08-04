"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { HiChevronDown, HiOutlineLogout, HiOutlineCog } from "react-icons/hi";

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth");
    } catch (err) {
      console.error("Failed to log out:", err);
    }
  };

  // Extract initials
  const getInitials = () => {
    if (!user) return "LY";
    const first = user.firstName ? user.firstName.charAt(0) : "";
    const last = user.lastName ? user.lastName.charAt(0) : "";
    return (first + last).toUpperCase() || user.email.charAt(0).toUpperCase();
  };

  // Determine Page Title based on route
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return "Dashboard";
    
    // Custom mapping for beautiful titles
    const lastSegment = segments[segments.length - 1];
    const isSettings = segments.includes("settings");
    
    let title = lastSegment.replace(/-/g, " ");
    
    // Capitalize words
    title = title.replace(/\b\w/g, (c) => c.toUpperCase());
    
    if (isSettings && lastSegment !== "settings") {
      return `Settings • {title}`.replace("{title}", title);
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

  return (
    <header className="h-16 bg-white/70 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-between px-8 sticky top-0 z-40 w-full">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold text-gray-900 tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Dropdown Container */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 hover:bg-gray-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {/* High contrast Avatar circle */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-500/10 transition-transform duration-200 hover:scale-105">
              {getInitials()}
            </div>
            
            {/* User name & role info for desktop */}
            <div className="hidden md:flex flex-col text-left mr-1 select-none">
              <span className="text-xs font-bold text-gray-800 leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : "Lysp User"}
              </span>
              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider leading-none mt-0.5">
                {primaryRole}
              </span>
            </div>

            <HiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Micro-animated menu dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-64 bg-white rounded-2xl border border-gray-150 shadow-[0_12px_40px_rgba(0,0,0,0.06)] py-2.5 animate-fade-in z-50 transform origin-top-right">
              {/* Header profile details */}
              <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-1">
                <span className="text-xs font-extrabold text-gray-900 leading-tight">
                  {user ? `${user.firstName} ${user.lastName}` : "Lysp User"}
                </span>
                <span className="text-[10px] text-gray-500 font-medium truncate">
                  {user?.email}
                </span>
                
                {/* Role badge */}
                <div className="flex gap-1.5 mt-2">
                  {roles.map((role) => (
                    <span
                      key={role}
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold border uppercase tracking-wider ${
                        role === "SUPER_ADMIN"
                          ? "bg-purple-50 text-purple-700 border-purple-100"
                          : role === "ADMIN"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-emerald-50 text-emerald-700 border-emerald-100"
                      }`}
                    >
                      {role.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>

              {/* Menu Actions */}
              <div className="p-1.5 flex flex-col gap-0.5">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push("/settings/firm");
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <HiOutlineCog className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  Firm Configuration
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-xl transition-all w-full text-left"
                >
                  <HiOutlineLogout className="w-4 h-4 text-red-400 group-hover:text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
