"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";

type PlatformLogoProps = {
  className?: string;
  size?: number;
};

/** Natural width:height ratio of the cropped lockup asset (370x568). */
const LOCKUP_ASPECT = 370 / 568;

/**
 * The full Lysp lockup — mark and "LYSP" wordmark together, exactly as designed, never
 * cropped. Monochrome in both themes: black lockup on light, white lockup on dark.
 * The green mark is deliberately not used in platform chrome — the app's palette is ink
 * and paper, and an accent-coloured logo was the only thing breaking that.
 *
 * `size` sets the rendered height; width follows the lockup's own aspect ratio so nothing
 * is stretched or letterboxed. Both source PNGs are already tightly cropped to the mark +
 * wordmark with transparent backgrounds, so this renders them directly with no crop trick.
 */
export function PlatformLogo({ className = "", size = 40 }: PlatformLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const src = isDark
    ? "/images/logo/lysp-lockup-white.png"
    : "/images/logo/lysp-lockup-black.png";

  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      style={{ width: size * LOCKUP_ASPECT, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Lysp" width={370} height={568} className="h-full w-full object-contain" />
    </span>
  );
}
