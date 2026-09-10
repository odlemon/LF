"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { BLOG_POSTS } from "./blogPosts";
import { MARKETING_SHELL, PageHeroHeader } from "@/components/landing/editorial";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

const FEATURED_IMAGE = "/images/practices/realestate-glass.jpg";

export function BlogPageContent() {
  const [featured, ...rest] = BLOG_POSTS;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const rise = reduceMotion ? "" : "animate-editorial-rise";

  return (
    <div className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      {/* One composition: brand + featured story */}
      <section className="relative min-h-[min(88vh,820px)] flex flex-col overflow-hidden bg-[#0a0f0d] text-[#fefefc]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FEATURED_IMAGE}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover opacity-[0.4] ${
            reduceMotion ? "" : "transition-transform duration-[8s] ease-out hover:scale-[1.02]"
          }`}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/70 to-[#0a0f0d]/45"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className={`relative flex flex-1 flex-col justify-between ${MARKETING_SHELL} pt-32 sm:pt-36 pb-14 sm:pb-16`}>
          <PageHeroHeader tone="dark" eyebrow="Resources" title="Journal" />

          <Link
            href={`/blog/${featured.slug}`}
            className={`group mt-16 sm:mt-20 max-w-3xl block text-left ${rise}`}
            style={reduceMotion ? undefined : { animationDelay: "0.2s" }}
          >
            <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-white/45">
              Featured · {featured.category}
            </p>
            <h2 className="mt-4 text-balance text-2xl sm:text-3xl lg:text-[2.65rem] font-semibold leading-[1.08] tracking-tight group-hover:opacity-90 transition-opacity">
              {featured.title}
            </h2>
            <p className="mt-4 max-w-xl text-[15px] text-white/50 leading-relaxed">
              {featured.excerpt}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
              <span className="inline-flex items-center gap-2 font-semibold text-white">
                Read article
                <HiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="text-white/45">
                {formatDate(featured.date)} · {featured.readMins} min
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Index */}
      <section className="relative">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#0a0a0a]/60">
              Archive
            </p>
            <p className="text-[12px] tabular-nums text-[#0a0a0a]/60">
              {String(BLOG_POSTS.length).padStart(2, "0")}
            </p>
          </div>

          <ul className="mt-6 border-t border-black/[0.08]">
            {rest.map((post, i) => (
              <li key={post.slug} className="border-b border-black/[0.08]">
                <Link
                  href={`/blog/${post.slug}`}
                  className="group grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-8 py-9 sm:py-11"
                >
                  <div className="lg:col-span-8">
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="font-semibold tabular-nums tracking-wider text-[#0a0a0a]/60">
                        {String(i + 2).padStart(2, "0")}
                      </span>
                      <span className="tracking-[0.18em] uppercase font-semibold text-[#0a0a0a]/60">
                        {post.category}
                      </span>
                    </div>
                    <h3 className="mt-3 text-[1.25rem] sm:text-[1.5rem] lg:text-[1.65rem] font-semibold tracking-tight text-balance leading-snug transition-opacity group-hover:opacity-65">
                      {post.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-[14px] sm:text-[15px] text-[#0a0a0a]/60 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="lg:col-span-4 flex lg:flex-col lg:items-end lg:justify-between gap-3 pt-1 lg:pt-0 lg:pb-1">
                    <span className="text-[13px] text-[#0a0a0a]/60 tabular-nums">
                      {formatDate(post.date)}
                      <span className="mx-2 text-[#0a0a0a]/20">·</span>
                      {post.readMins} min
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0a0a0a]/60 group-hover:text-[#0a0a0a] transition-colors">
                      Read
                      <HiArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Close */}
      <section className="relative border-t border-black/[0.06] bg-[#0a0a0a] text-[#fefefc]">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
          <div className="max-w-md">
            <p className="text-[13px] font-semibold tracking-[0.08em] text-white/55">Lysp</p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              Prefer a conversation to an article?
            </h2>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 self-start rounded-full bg-[#fefefc] px-6 py-3.5 text-[14px] font-semibold text-[#0a0a0a] hover:bg-white transition-colors"
          >
            Contact
            <HiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
