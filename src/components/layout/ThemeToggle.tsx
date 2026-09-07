"use client";

import React from "react";
import { HiMoon, HiSun } from "react-icons/hi";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme, ready } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!ready}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-ink/70 hover:text-ink hover:bg-hover transition-colors cursor-pointer disabled:opacity-50 ${className}`}
    >
      {isDark ? <HiSun className="h-4 w-4" /> : <HiMoon className="h-4 w-4" />}
    </button>
  );
}
