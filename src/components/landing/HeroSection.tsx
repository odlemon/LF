"use client";

import React from "react";
import Link from "next/link";
import { HeroNavbar } from "./HeroNavbar";
import { HeroVideo } from "./HeroVideo";

export function HeroSection() {
  return (
    <section id="home" className="relative min-h-[100svh] w-full overflow-hidden bg-[#0a0f0d]">
      {/* Full-bleed media - z-0, extends behind transparent navbar */}
      <div className="absolute inset-0 z-0">
        <HeroVideo />
      </div>

      <HeroNavbar variant="overMedia" />

      {/* Legora-style lower-third copy stack */}
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 sm:px-8 lg:px-12 pb-[max(4rem,env(safe-area-inset-bottom))] pt-[max(7rem,calc(env(safe-area-inset-top)+4rem))]">
        <div className="mx-auto w-full max-w-4xl text-center flex flex-col items-center gap-5 sm:gap-6">
          <h1 className="text-balance text-[2.25rem] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold leading-[1.05] tracking-tight text-[#fefefc]">
            Pricing intelligence
            <span className="block mt-1 sm:mt-2">for elite law firms</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed font-medium">
            The firms that win the most work price it better than anyone else. Lysp is how they do it.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-2">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-full bg-[#fefefc] text-[#0a0a0a] px-7 py-3.5 text-sm font-semibold hover:bg-white transition-colors min-w-[160px]"
            >
              Book a demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
