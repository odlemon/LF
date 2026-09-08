"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

type PlatformLogoProps = {
  className?: string;
  size?: number;
};

/**
 * Icon-only Lysp mark (no "Lysp" wordmark in the chrome).
 * Monochrome in both themes: black mark on light, white mark on dark. The green
 * mark is deliberately not used in platform chrome — the app's palette is ink and
 * paper, and an accent-coloured logo was the only thing breaking that.
 * Light → black mark (multiply blends out the white lockup BG).
 * Dark → white mark (screen blends out the black lockup BG).
 */
export function PlatformLogo({ className = "", size = 40 }: PlatformLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const src = isDark
    ? "/images/logo/lysp-logo-bw-white.png"
    : "/images/logo/lysp-logo-bw.png";

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Lysp"
        width={1024}
        height={1024}
        className={`absolute left-1/2 top-0 h-[175%] w-[175%] max-w-none -translate-x-1/2 object-cover object-top ${
          isDark ? "mix-blend-screen" : "mix-blend-multiply"
        }`}
      />
    </span>
  );
}
