"use client";

import React, { useEffect, useState } from "react";

/**
 * Says so when the API is briefly unreachable, instead of letting every panel on the page fail
 * silently at the same moment.
 *
 * The API client retries reads for about fifteen seconds before giving up, which covers a
 * restart or a blip. During that window the page looks frozen, and a frozen page with no
 * explanation reads as broken software. This is the explanation.
 */
export function ConnectionBanner() {
  const [down, setDown] = useState(false);

  useEffect(() => {
    const onDown = () => setDown(true);
    const onUp = () => setDown(false);
    window.addEventListener("api:unreachable", onDown);
    window.addEventListener("api:reachable", onUp);
    return () => {
      window.removeEventListener("api:unreachable", onDown);
      window.removeEventListener("api:reachable", onUp);
    };
  }, []);

  if (!down) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 bg-warning/10 px-4 py-2 text-center text-[12px] font-semibold text-warning"
    >
      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
      Reconnecting to Lysp — this usually clears in a few seconds.
    </div>
  );
}
