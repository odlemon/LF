"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "lysp-platform-theme";

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* ignore */
  }
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = readStoredTheme();
    setThemeState(initial);
    setReady(true);
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, ready }),
    [theme, setTheme, toggleTheme, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

export const PLATFORM_THEME_VARS: Record<ThemeMode, React.CSSProperties> = {
  light: {
    ["--color-primary" as string]: "#0a0a0a",
    ["--color-primary-hover" as string]: "#000000",
    ["--color-on-primary" as string]: "#fefefc",
    ["--color-paper" as string]: "#fefefc",
    ["--color-ink" as string]: "#0a0a0a",
    ["--color-field" as string]: "#f7f7f5",
    ["--color-band" as string]: "#0a0f0d",
    ["--color-canvas" as string]: "#f7f7f5",
    ["--color-surface" as string]: "#fefefc",
    ["--color-border" as string]: "rgba(10, 10, 10, 0.08)",
    ["--color-hover" as string]: "rgba(10, 10, 10, 0.04)",
    ["--color-warning" as string]: "#b45309",
    ["--color-danger" as string]: "#e11d48",
  },
  dark: {
    ["--color-primary" as string]: "#fefefc",
    ["--color-primary-hover" as string]: "#ffffff",
    ["--color-on-primary" as string]: "#0a0a0a",
    ["--color-paper" as string]: "#141816",
    ["--color-ink" as string]: "#fefefc",
    ["--color-field" as string]: "#1c211f",
    ["--color-band" as string]: "#060807",
    ["--color-canvas" as string]: "#0a0f0d",
    ["--color-surface" as string]: "#141816",
    ["--color-border" as string]: "rgba(254, 254, 252, 0.12)",
    ["--color-hover" as string]: "rgba(254, 254, 252, 0.08)",
    ["--color-warning" as string]: "#f59e0b",
    ["--color-danger" as string]: "#f43f5e",
  },
};

export function platformRootClass(theme: ThemeMode, extra = "") {
  return `platform-root ${theme === "dark" ? "dark" : ""} ${extra}`.trim();
}
