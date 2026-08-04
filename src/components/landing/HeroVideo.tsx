"use client";

import React, { useEffect, useRef, useState } from "react";

export const HERO_VIDEO = {
  poster: "/videos/golden-hour-poster.jpg",
  mobile: "/videos/golden-hour-mobile.webm",
  desktopWebm: "/videos/golden-hour-desktop.webm",
  desktopMp4: "/videos/golden-hour-desktop.mp4",
  retina: "/videos/golden-hour-retina.webm",
  /** Original upload - fallback while optimized assets encode */
  fallback: "/videos/golden-hour.webm",
} as const;

/** Start the standby player this many seconds before the active clip ends. */
const LOOP_LEAD_SEC = 0.15;
const LOOP_START_SEC = 0.001;

function VideoSources() {
  return (
    <>
      <source src={HERO_VIDEO.mobile} type="video/webm" media="(max-width: 768px)" />
      <source src={HERO_VIDEO.retina} type="video/webm" media="(min-resolution: 2dppx)" />
      <source src={HERO_VIDEO.desktopMp4} type="video/mp4" />
      <source src={HERO_VIDEO.desktopWebm} type="video/webm" />
      <source src={HERO_VIDEO.fallback} type="video/webm" />
    </>
  );
}

export function HeroVideo() {
  const primaryRef = useRef<HTMLVideoElement>(null);
  const secondaryRef = useRef<HTMLVideoElement>(null);
  const activeIsPrimary = useRef(true);
  const swapping = useRef(false);

  const [videoReady, setVideoReady] = useState(false);
  const [primaryOnTop, setPrimaryOnTop] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const primary = primaryRef.current;
    const secondary = secondaryRef.current;
    if (!primary || !secondary) return;

    const markReady = () => setVideoReady(true);

    const tryPlay = (video: HTMLVideoElement) => {
      void video.play().catch(() => {
        /* Autoplay blocked - poster remains visible until user interaction */
      });
    };

    const maybeSwap = (current: HTMLVideoElement, next: HTMLVideoElement) => {
      const { duration, currentTime } = current;
      if (!Number.isFinite(duration) || duration <= LOOP_LEAD_SEC) return;
      if (duration - currentTime > LOOP_LEAD_SEC || swapping.current) return;

      swapping.current = true;
      next.currentTime = LOOP_START_SEC;

      void next.play().then(() => {
        activeIsPrimary.current = !activeIsPrimary.current;
        setPrimaryOnTop(activeIsPrimary.current);
        swapping.current = false;
        current.pause();
      }).catch(() => {
        swapping.current = false;
        current.currentTime = LOOP_START_SEC;
        void current.play();
      });
    };

    const onPrimaryTimeUpdate = () => {
      if (activeIsPrimary.current) {
        maybeSwap(primary, secondary);
      }
    };

    const onSecondaryTimeUpdate = () => {
      if (!activeIsPrimary.current) {
        maybeSwap(secondary, primary);
      }
    };

    tryPlay(primary);

    if (primary.readyState >= 2) {
      setVideoReady(true);
    }

    primary.addEventListener("loadeddata", markReady);
    primary.addEventListener("playing", markReady);
    primary.addEventListener("timeupdate", onPrimaryTimeUpdate);
    secondary.addEventListener("timeupdate", onSecondaryTimeUpdate);

    return () => {
      primary.removeEventListener("loadeddata", markReady);
      primary.removeEventListener("playing", markReady);
      primary.removeEventListener("timeupdate", onPrimaryTimeUpdate);
      secondary.removeEventListener("timeupdate", onSecondaryTimeUpdate);
    };
  }, [reduceMotion]);

  const videoClass =
    "absolute inset-0 min-h-full min-w-full h-full w-full object-cover object-center [transform:translateZ(0)]";

  if (reduceMotion) {
    return (
      <div className="absolute inset-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_VIDEO.poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center [transform:translateZ(0)]"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/25" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#0a0f0d]" aria-hidden>
      {/* Poster - instant first paint while video buffers */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_VIDEO.poster}
        alt=""
        className={`absolute inset-0 h-full w-full object-cover object-center [transform:translateZ(0)] transition-opacity duration-200 ${
          videoReady ? "opacity-0" : "opacity-100"
        }`}
        fetchPriority="high"
        decoding="async"
      />

      {/* Dual-buffer: swap z-index before the end - no fade, no native loop flash */}
      <video
        ref={primaryRef}
        className={`${videoClass} ${videoReady ? "opacity-100" : "opacity-0"} ${
          primaryOnTop ? "z-[2]" : "z-[1]"
        }`}
        autoPlay
        muted
        playsInline
        preload="auto"
        {...({ fetchPriority: "high" } as React.VideoHTMLAttributes<HTMLVideoElement>)}
      >
        <VideoSources />
      </video>

      <video
        ref={secondaryRef}
        className={`${videoClass} ${videoReady ? "opacity-100" : "opacity-0"} ${
          primaryOnTop ? "z-[1]" : "z-[2]"
        }`}
        muted
        playsInline
        preload="auto"
      >
        <VideoSources />
      </video>

      <div className="absolute inset-0 z-[3] bg-gradient-to-t from-black/60 via-black/15 to-black/25 pointer-events-none" />
    </div>
  );
}
