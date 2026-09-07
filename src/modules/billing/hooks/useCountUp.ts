"use client";

import React, { useEffect, useRef } from "react";

interface UseCountUpOptions {
  from: number;
  to: number;
  duration?: number;
  start?: boolean;
  onComplete?: () => void;
}

export function useCountUp({ from, to, duration = 1200, start = true, onComplete }: UseCountUpOptions) {
  const [value, setValue] = React.useState(from);
  const previousFrom = useRef(from);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!start) return;
    previousFrom.current = from;
    const startTime = performance.now();
    const startVal = from;
    const endVal = to;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * eased;
      setValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        onComplete?.();
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [from, to, duration, start, onComplete]);

  return value;
}
