"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";
import { BLOG_POSTS, type BlogPost } from "./blogPosts";

const BODIES: Record<string, string[]> = {
  "from-rfp-to-accepted-fee": [
    "In many firms, the path from an RFP to an accepted fee still runs through three tools that were never designed to talk to each other: a scoping spreadsheet, a proposal deck, and an email thread.",
    "Each handoff loses context. Staffing assumptions drift. Margin floors get negotiated away without finance seeing the round. Realization reviews arrive months later - after the leakage is already booked.",
    "Pricing intelligence means collapsing that path into one continuous flow: scope from the matter as described, price from comparable firm history, propose in a branded artifact, and negotiate with an attributable log.",
    "The firms that win commercially are not the ones with the flashiest AI demos. They are the ones whose fee process is as disciplined as their legal work.",
  ],
  "volume-discounts-without-spreadsheets": [
    "Volume tiers only create value when they stay accurate. Rebuilding YTD spend in a spreadsheet every quarter is how discounts drift from the relationship you promised the client.",
    "Automatic tier tracking updates as matters close. Clients see savings and progress in the portal. Business development can talk about distance-to-next-tier with numbers that match the books.",
    "That is not a reporting feature. It is relationship pricing as a living system.",
  ],
  "pricing-data-is-privileged": [
    "Rate cards, OCGs, realization, and negotiation history reveal how a firm competes. Treating that data like ordinary SaaS telemetry is a category error.",
    "Enterprise buyers should insist on encryption, workspace isolation, regional residency where required, ethical wall enforcement, independent audits, and a contractual ban on training shared models on Customer Data.",
    "Lysp is built around those requirements - because privileged commercial data deserves the same seriousness as privileged legal content.",
  ],
  "usage-based-pricing-for-law-firms": [
    "Seat licenses tax collaboration. Pricing is inherently multi-role: partners, pricing, finance, BD, and clients all touch the process.",
    "Usage-based credits align cost with commercial intensity - matters priced, negotiations run, scenarios modeled, analytics pulled - without charging for every person who needs visibility.",
    "Firms can estimate spend from expected volume, then refine as patterns emerge. That is how software should meet law-firm economics.",
  ],
};

const HERO_IMAGES: Record<string, string> = {
  "from-rfp-to-accepted-fee": "/images/practices/ma-glass.jpg",
  "volume-discounts-without-spreadsheets": "/images/practices/banking-glass.jpg",
  "pricing-data-is-privileged": "/images/practices/litigation-glass.jpg",
  "usage-based-pricing-for-law-firms": "/images/practices/employment-glass.jpg",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function BlogArticleContent({ post }: { post: BlogPost }) {
  const paragraphs = BODIES[post.slug] ?? [post.excerpt];
  const hero = HERO_IMAGES[post.slug] ?? "/images/practices/ma-glass.jpg";
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
  }, []);

  const rise = reduceMotion ? "" : "animate-editorial-rise";

  return (
    <div className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      {/* Article hero */}
      <header className="relative overflow-hidden bg-[#0a0f0d] text-[#fefefc]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/75 to-[#0a0f0d]/50"
        />
        <div className="relative mx-auto max-w-[760px] px-5 sm:px-8 pt-24 sm:pt-32 pb-16 sm:pb-20">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-white/55 hover:text-white transition-colors py-1.5 -my-1.5"
          >
            <HiArrowLeft className="h-4 w-4" />
            Journal
          </Link>
          <div className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-white/45">
            <span className="tracking-[0.2em] uppercase font-semibold text-white/60">
              {post.category}
            </span>
            <span className="text-white/25">/</span>
            <span>{formatDate(post.date)}</span>
            <span className="text-white/25">/</span>
            <span>{post.readMins} min read</span>
          </div>
          <h1
            className={`mt-6 text-balance text-[2rem] sm:text-4xl lg:text-[2.85rem] font-semibold leading-[1.08] tracking-tight ${rise}`}
          >
            {post.title}
          </h1>
        </div>
      </header>

      {/* Body */}
      <article className="relative mx-auto max-w-[680px] px-5 sm:px-8 py-14 sm:py-20">
        <p className="text-[1.15rem] sm:text-[1.25rem] font-medium leading-relaxed text-[#0a0a0a]/70 text-balance">
          {post.excerpt}
        </p>
        <span className="my-10 block h-px w-16 bg-[#0a0a0a]/20" />
        <div className="space-y-6">
          {paragraphs.map((p, i) => (
            <p
              key={p.slice(0, 40)}
              className={`text-[16px] sm:text-[17px] text-[#0a0a0a]/65 leading-[1.75] ${
                i === 0 ? "first-letter:text-[3.25rem] first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.85] first-letter:text-[#0a0a0a]" : ""
              }`}
            >
              {p}
            </p>
          ))}
        </div>
      </article>

      {/* Continue */}
      <section className="border-t border-black/[0.06] bg-[#0a0a0a] text-[#fefefc]">
        <div className="mx-auto max-w-[680px] px-5 sm:px-8 py-14 sm:py-16">
          <p className="text-[13px] font-semibold tracking-[0.08em] text-white/55">Lysp</p>
          <p className="mt-4 text-xl sm:text-2xl font-semibold tracking-tight text-balance">
            Explore the product, or talk with us about your firm’s pricing workflow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/product"
              className="inline-flex items-center gap-2 rounded-full bg-[#fefefc] px-6 py-3 text-[13px] font-semibold text-[#0a0a0a]"
            >
              Product
              <HiArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-[13px] font-semibold text-white/80"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-black/[0.06]">
        <div className="mx-auto max-w-[680px] px-5 sm:px-8 py-14 sm:py-16">
          <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#0a0a0a]/60 mb-8">
            Continue reading
          </p>
          <ul className="space-y-0 divide-y divide-black/[0.08] border-y border-black/[0.08]">
            {BLOG_POSTS.filter((p) => p.slug !== post.slug)
              .slice(0, 3)
              .map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex items-baseline justify-between gap-6 py-5"
                  >
                    <span className="text-[15px] sm:text-base font-semibold tracking-tight group-hover:opacity-70 transition-opacity text-balance py-1.5 -my-1.5">
                      {p.title}
                    </span>
                    <HiArrowRight className="h-4 w-4 shrink-0 text-[#0a0a0a]/60 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
