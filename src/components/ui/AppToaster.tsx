"use client";

import React from "react";
import { Toaster, ToastBar, toast, type Toast } from "react-hot-toast";
import {
  HiCheck,
  HiExclamation,
  HiInformationCircle,
  HiX,
} from "react-icons/hi";
import { useTheme, type ThemeMode } from "@/context/ThemeContext";

const THEME = {
  light: {
    surface: "#fefefc",
    ink: "#0a0a0a",
    onPrimary: "#fefefc",
    field: "#f7f7f5",
    border: "rgba(10, 10, 10, 0.08)",
    hover: "rgba(10, 10, 10, 0.04)",
    muted: "rgba(10, 10, 10, 0.35)",
    shadow: "0 18px 40px -28px rgba(10, 10, 10, 0.45)",
  },
  dark: {
    surface: "#141816",
    ink: "#fefefc",
    onPrimary: "#0a0a0a",
    field: "#1c211f",
    border: "rgba(254, 254, 252, 0.12)",
    hover: "rgba(254, 254, 252, 0.08)",
    muted: "rgba(254, 254, 252, 0.4)",
    shadow: "0 18px 40px -24px rgba(0, 0, 0, 0.65)",
  },
} as const;

function toastKind(t: Toast): "success" | "error" | "loading" | "blank" {
  if (t.type === "success" || t.type === "error" || t.type === "loading") {
    return t.type;
  }
  return "blank";
}

function ToastIcon({
  kind,
  theme,
}: {
  kind: ReturnType<typeof toastKind>;
  theme: ThemeMode;
}) {
  const c = THEME[theme];

  if (kind === "success") {
    return (
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: c.ink, color: c.onPrimary }}
      >
        <HiCheck className="h-4 w-4" aria-hidden />
      </span>
    );
  }
  if (kind === "error") {
    return (
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{
          background: c.field,
          color: c.ink,
          border: `1px solid ${c.border}`,
        }}
      >
        <HiExclamation className="h-4 w-4" aria-hidden />
      </span>
    );
  }
  if (kind === "loading") {
    return (
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{ background: c.field, border: `1px solid ${c.border}` }}
      >
        <span
          className="h-3.5 w-3.5 animate-spin rounded-full border-2"
          style={{
            borderColor: `${c.ink}33`,
            borderTopColor: c.ink,
          }}
        />
      </span>
    );
  }
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
      style={{
        background: c.field,
        color: c.muted,
        border: `1px solid ${c.border}`,
      }}
    >
      <HiInformationCircle className="h-4 w-4" aria-hidden />
    </span>
  );
}

function ToastCard({
  t,
  message,
  theme,
}: {
  t: Toast;
  message: React.ReactNode;
  theme: ThemeMode;
}) {
  const kind = toastKind(t);
  const c = THEME[theme];

  return (
    <div
      className={`lysp-toast pointer-events-auto flex w-[min(100vw-2rem,22rem)] items-start gap-3 rounded-2xl px-3.5 py-3 ${
        t.visible ? "lysp-toast-enter" : "lysp-toast-leave"
      }`}
      style={{
        background: c.surface,
        color: c.ink,
        border: `1px solid ${c.border}`,
        boxShadow: c.shadow,
      }}
      role={kind === "error" ? "alert" : "status"}
    >
      <ToastIcon kind={kind} theme={theme} />
      <div className="min-w-0 flex-1 pt-0.5">
        <div
          className="text-[13px] font-semibold leading-snug tracking-tight [&_div]:!m-0 [&_div]:!justify-start"
          style={{ color: c.ink }}
        >
          {message}
        </div>
      </div>
      {t.type !== "loading" && (
        <button
          type="button"
          onClick={() => toast.dismiss(t.id)}
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
          style={{ color: c.muted }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = c.hover;
            e.currentTarget.style.color = c.ink;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = c.muted;
          }}
          aria-label="Dismiss"
        >
          <HiX className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

/** Paper/ink toaster — styles every react-hot-toast call site. */
export function AppToaster() {
  const { theme } = useTheme();

  return (
    <Toaster
      position="bottom-center"
      gutter={12}
      containerClassName="lysp-toaster"
      containerStyle={{
        bottom: 28,
        zIndex: 10000,
      }}
      toastOptions={{
        duration: 4000,
        success: { duration: 3500 },
        error: { duration: 5200 },
        blank: { duration: 4000 },
        style: {
          background: "transparent",
          boxShadow: "none",
          padding: 0,
          maxWidth: "none",
        },
      }}
    >
      {(t) => (
        <ToastBar
          toast={t}
          style={{
            background: "transparent",
            boxShadow: "none",
            padding: 0,
            maxWidth: "none",
          }}
        >
          {({ message }) => (
            <ToastCard t={t} message={message} theme={theme} />
          )}
        </ToastBar>
      )}
    </Toaster>
  );
}
