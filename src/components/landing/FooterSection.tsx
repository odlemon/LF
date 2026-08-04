"use client";

import React from "react";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/#platform" },
      { label: "Scope → Price → Propose", href: "/product#flow" },
      { label: "Rate Negotiation", href: "/product#negotiation" },
      { label: "Volume Discounts", href: "/product#discounts" },
      { label: "Pricing Analytics", href: "/product#analytics" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Practice areas", href: "/#practices" },
      { label: "Firm outcomes", href: "/#outcomes" },
      { label: "Usage pricing", href: "/#pricing" },
      { label: "Customers", href: "/#customers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Security", href: "/security" },
      { label: "Certifications", href: "/security#certifications" },
      { label: "Data residency", href: "/security#residency" },
      { label: "Contact", href: "/#contact" },
      { label: "Book a demo", href: "/auth" },
    ],
  },
  {
    title: "Follow",
    links: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/lyspio",
        external: true,
      },
    ],
  },
] as const;

/**
 * Closing footer - multi-column sitemap inspired by Harvey / August,
 * executed in Lysp’s dossier language (dark close, hairlines, quiet type).
 */
export function FooterSection() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative w-full overflow-hidden bg-[#0a0a0a] text-[#fefefc]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(254,254,252,0.06),transparent_45%),radial-gradient(ellipse_at_100%_100%,rgba(254,254,252,0.04),transparent_40%)]"
      />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10">
        {/* Top CTA band */}
        <div className="pt-16 sm:pt-20 pb-12 sm:pb-14 border-b border-white/[0.08] flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo/lysp-logo-bw-white.png"
              alt="Lysp"
              width={160}
              height={160}
              className="h-14 w-14 object-contain"
            />
            <h2 className="mt-5 text-balance text-2xl sm:text-3xl lg:text-[2.35rem] font-semibold leading-[1.12] tracking-tight">
              Pricing intelligence for elite law firms.
            </h2>
            <p className="mt-4 text-[15px] text-white/45 leading-relaxed max-w-md">
              Scope, price, propose, negotiate, and measure realization - on one usage-based
              platform built for privileged commercial data.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fefefc] px-6 py-3.5 text-[14px] font-semibold text-[#0a0a0a] hover:bg-white transition-all hover:gap-3 cursor-pointer"
            >
              Book a demo
              <HiArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:nyasha@lysp.io"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-[14px] font-semibold text-white/80 hover:text-white hover:border-white/30 transition-colors cursor-pointer"
            >
              nyasha@lysp.io
            </a>
          </div>
        </div>

        {/* Link columns */}
        <div className="py-12 sm:py-14 grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/35">
                {col.title}
              </p>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((link) => {
                  const className =
                    "text-[14px] text-white/55 hover:text-white transition-colors cursor-pointer";
                  if ("external" in link && link.external) {
                    return (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={className}
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  }
                  return (
                    <li key={link.label}>
                      <Link href={link.href} className={className}>
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-8 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-[12px] text-white/35">
            © {year} Lysp. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link
              href="/#privacy"
              className="text-[12px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              Privacy Policy
            </Link>
            <Link
              href="/#terms"
              className="text-[12px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              Terms of Service
            </Link>
            <Link
              href="/security"
              className="text-[12px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
