"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { USE_CASES } from "./platform/useCases";
import { FeaturePreview } from "./platform/FeaturePreview";

const STEP_VH = 90;
const SETTLE_MS = 140;
const LERP = 0.18;
const SNAP_EPSILON = 0.03;
const SWIPE_THRESHOLD = 42;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function getSectionProgress(section: HTMLElement) {
  const scrollable = section.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return clamp(-section.getBoundingClientRect().top / scrollable, 0, 1);
}

function isSectionPinned(section: HTMLElement) {
  const rect = section.getBoundingClientRect();
  return rect.top <= 2 && rect.bottom >= window.innerHeight - 2;
}

function scrollToIndex(section: HTMLElement, index: number, count: number) {
  const scrollable = section.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return;
  const sectionTop = section.getBoundingClientRect().top + window.scrollY;
  const top = sectionTop + (index / Math.max(1, count - 1)) * scrollable;
  window.scrollTo({ top, behavior: "smooth" });
}

function UseCaseCopy({
  index,
  label,
  brief,
  id,
  active,
}: {
  index: number;
  label: string;
  brief: string;
  id: string;
  active: boolean;
}) {
  return (
    <div className="relative flex flex-col justify-center min-w-0">
      <p className="text-[12px] sm:text-[13px] font-semibold tracking-[0.2em] uppercase text-[#0a0a0a]/40">
        {String(index + 1).padStart(2, "0")}
      </p>
      <h3 className="mt-2 sm:mt-3 lg:mt-4 text-balance text-[1.45rem] sm:text-3xl lg:text-[2.35rem] xl:text-[2.6rem] font-semibold tracking-tight text-[#0a0a0a] leading-[1.1]">
        {label}
      </h3>
      <p className="mt-2 sm:mt-3 lg:mt-4 max-w-sm text-[14px] sm:text-[15px] text-[#0a0a0a]/60 leading-relaxed">
        {brief}
      </p>
      <Link
        href={`/product#${id}`}
        className="mt-4 sm:mt-5 lg:mt-6 inline-flex items-center gap-1.5 self-start text-[13px] sm:text-[14px] font-semibold text-[#0a0a0a] hover:opacity-70 transition-opacity py-1.5"
        tabIndex={active ? 0 : -1}
        onClick={(e) => e.stopPropagation()}
      >
        See how it works
        <HiArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function StepDots({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2" role="tablist" aria-label="Product steps">
      {USE_CASES.map((uc, i) => (
        <button
          key={uc.id}
          type="button"
          role="tab"
          aria-selected={i === activeIndex}
          aria-label={uc.label}
          onClick={() => onSelect(i)}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === activeIndex
              ? "w-8 bg-[#0a0a0a]"
              : "w-1.5 bg-[#0a0a0a]/20 hover:bg-[#0a0a0a]/40"
          }`}
        />
      ))}
    </div>
  );
}

function ExploreCta() {
  return (
    <Link
      href="/product"
      className="inline-flex items-center justify-center gap-2 self-start sm:self-auto rounded-full bg-[#0a0a0a] px-7 py-3.5 text-[14px] font-semibold text-[#fefefc] transition-colors hover:bg-black"
    >
      Explore Product
      <HiArrowRight className="h-4 w-4" />
    </Link>
  );
}

/** Editorial opener - matches Journal / About brand language. */
function PlatformIntro({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden bg-[#0a0f0d] text-[#fefefc] ${
        compact ? "shrink-0" : ""
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(254,254,252,0.07),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div
        className={`relative mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10 ${
          compact ? "pt-10 pb-7 lg:pt-12 lg:pb-8" : "pt-14 sm:pt-16 pb-10 sm:pb-12"
        }`}
      >
        <div className="max-w-3xl text-left">
          <h2
            className={`text-balance font-semibold tracking-tight leading-[1.06] ${
              compact
                ? "text-[1.85rem] lg:text-[2.5rem] xl:text-[3rem]"
                : "text-[1.85rem] sm:text-4xl"
            }`}
          >
            How elite firms use Lysp
            <span className="block text-white/40 mt-1.5 sm:mt-2">
              from RFP to accepted fee.
            </span>
          </h2>
        </div>
      </div>
    </div>
  );
}

/** Mobile: compact swipe carousel - no sticky scroll-jack whitespace. */
function MobilePlatform() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lockAxis = useRef<"x" | "y" | null>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const goTo = useCallback((i: number) => {
    setActiveIndex(clamp(i, 0, USE_CASES.length - 1));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("a, button, input, textarea, select, [role='tab']")) return;
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
    lockAxis.current = null;
    dragging.current = true;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.clientX - touchStartX.current;
    const dy = e.clientY - touchStartY.current;
    if (!lockAxis.current && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      lockAxis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current || touchStartX.current === null) {
      dragging.current = false;
      return;
    }
    const dx = e.clientX - touchStartX.current;
    const axis = lockAxis.current;
    dragging.current = false;
    touchStartX.current = null;
    touchStartY.current = null;
    lockAxis.current = null;

    if (axis === "y") return;
    if (dx <= -SWIPE_THRESHOLD) goTo(activeIndex + 1);
    else if (dx >= SWIPE_THRESHOLD) goTo(activeIndex - 1);
  };

  const active = USE_CASES[activeIndex];

  return (
    <section id="platform-mobile" className="relative w-full bg-[#fefefc] lg:hidden">
      <PlatformIntro />

      <div
        className="touch-pan-y select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="region"
        aria-roledescription="carousel"
        aria-label="Product capabilities"
      >
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 pt-6">
          <div
            className={`h-[380px] sm:h-[460px] ${reduceMotion ? "" : "transition-opacity duration-200"}`}
            key={active.id}
          >
            <FeaturePreview id={active.id} />
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 pt-5 pb-2">
          <UseCaseCopy
            index={activeIndex}
            label={active.label}
            brief={active.brief}
            id={active.id}
            active
          />
          <p className="mt-4 text-[12px] text-[#0a0a0a]/35">Swipe left or right to explore</p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8 pb-10 pt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <StepDots activeIndex={activeIndex} onSelect={goTo} />
        <ExploreCta />
      </div>
    </section>
  );
}

/** Desktop: sticky scroll-jack stack. */
function DesktopPlatform() {
  const sectionRef = useRef<HTMLElement>(null);
  const targetProgressRef = useRef(0);
  const displayProgressRef = useRef(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const snappingRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let raf = 0;
    let lerpRaf = 0;

    const readTarget = () => {
      targetProgressRef.current = getSectionProgress(section);
    };

    const tickLerp = () => {
      lerpRaf = 0;
      const target = targetProgressRef.current;
      const current = displayProgressRef.current;
      const next = reduceMotion ? target : current + (target - current) * LERP;

      if (Math.abs(target - next) < 0.0004) {
        displayProgressRef.current = target;
        setDisplayProgress(target);
        return;
      }

      displayProgressRef.current = next;
      setDisplayProgress(next);
      lerpRaf = requestAnimationFrame(tickLerp);
    };

    const kickLerp = () => {
      if (!lerpRaf) lerpRaf = requestAnimationFrame(tickLerp);
    };

    const snapToNearest = () => {
      if (reduceMotion || snappingRef.current) return;
      if (!isSectionPinned(section)) return;

      const count = USE_CASES.length;
      const float = getSectionProgress(section) * (count - 1);
      const nearest = clamp(Math.round(float), 0, count - 1);

      if (Math.abs(float - nearest) < SNAP_EPSILON) return;

      snappingRef.current = true;
      scrollToIndex(section, nearest, count);

      if (snapClearTimerRef.current) clearTimeout(snapClearTimerRef.current);
      snapClearTimerRef.current = setTimeout(() => {
        snappingRef.current = false;
        readTarget();
        kickLerp();
      }, 450);
    };

    const scheduleSettle = () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(snapToNearest, SETTLE_MS);
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        readTarget();
        kickLerp();
        if (!snappingRef.current) scheduleSettle();
      });
    };

    readTarget();
    displayProgressRef.current = targetProgressRef.current;
    setDisplayProgress(targetProgressRef.current);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
      if (lerpRaf) cancelAnimationFrame(lerpRaf);
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      if (snapClearTimerRef.current) clearTimeout(snapClearTimerRef.current);
    };
  }, [reduceMotion]);

  const count = USE_CASES.length;
  const activeFloat = displayProgress * (count - 1);
  const activeIndex = clamp(Math.round(activeFloat), 0, count - 1);

  const goToIndex = (i: number) => {
    const section = sectionRef.current;
    if (!section) return;
    snappingRef.current = true;
    scrollToIndex(section, i, count);
    if (snapClearTimerRef.current) clearTimeout(snapClearTimerRef.current);
    snapClearTimerRef.current = setTimeout(() => {
      snappingRef.current = false;
    }, 450);
  };

  return (
    <section
      id="platform-desktop"
      ref={sectionRef}
      className="relative hidden w-full bg-[#fefefc] lg:block"
      style={{ height: `${count * STEP_VH}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <PlatformIntro compact />

        <div className="relative flex min-h-0 flex-1 items-center overflow-hidden bg-[#fefefc] px-5 sm:px-8 lg:px-10 py-2">
          <div
            className="relative mx-auto w-full max-w-[1200px] h-full max-h-[min(62vh,580px)] overflow-hidden"
            aria-live="polite"
            aria-atomic="true"
          >
            {USE_CASES.map((uc, i) => {
              const offset = i - activeFloat;
              const abs = Math.abs(offset);
              const visible = abs < 2.15;
              const isFocused = abs < 0.35;
              const isActive = Math.round(offset) === 0;

              const translateY = reduceMotion ? 0 : offset * 160;
              const scale = isFocused ? 1 : 1 - Math.min(0.1, abs * 0.04);
              const blur = isFocused ? 0 : Math.min(14, 4 + Math.pow(abs, 1.1) * 5);
              const opacity = isFocused ? 1 : Math.max(0, 0.42 - (abs - 1) * 0.18);
              const zIndex = isFocused ? 50 : Math.round(20 - abs * 8);

              return (
                <article
                  key={uc.id}
                  aria-hidden={!visible || !isActive}
                  className="absolute inset-0 will-change-transform"
                  style={{
                    transform: `translate3d(0, ${translateY}px, 0) scale(${Math.max(0.9, scale)})`,
                    filter: blur > 0.2 ? `blur(${blur}px)` : "none",
                    opacity: visible ? opacity : 0,
                    zIndex,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  <div className="relative grid h-full grid-cols-[minmax(0,0.85fr)_minmax(0,1.2fr)] gap-10 xl:gap-14 items-center">
                    {isFocused ? (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-y-[6%] left-0 right-[48%] rounded-3xl bg-[#fefefc]"
                      />
                    ) : null}

                    <div className={`relative order-1 min-w-0 ${isFocused ? "z-10" : ""}`}>
                      <UseCaseCopy
                        index={i}
                        label={uc.label}
                        brief={uc.brief}
                        id={uc.id}
                        active={isActive}
                      />
                    </div>

                    <div
                      className={`relative order-2 min-w-0 h-full overflow-hidden ${
                        isFocused ? "z-10" : ""
                      }`}
                    >
                      <div className="relative h-full">
                        {abs < 1.75 ? <FeaturePreview id={uc.id} /> : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="relative z-20 mx-auto w-full max-w-[1200px] shrink-0 bg-[#fefefc] px-5 sm:px-8 lg:px-10 pb-8 sm:pb-10 pt-5 sm:pt-6">
          <div className="flex flex-row items-center justify-between gap-4">
            <StepDots activeIndex={activeIndex} onSelect={goToIndex} />
            <ExploreCta />
          </div>
        </div>
      </div>
    </section>
  );
}

export function PlatformSection() {
  return (
    <div id="platform">
      <MobilePlatform />
      <DesktopPlatform />
    </div>
  );
}
