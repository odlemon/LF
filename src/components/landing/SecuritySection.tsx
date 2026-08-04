"use client";

import React from "react";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { SECURITY_CERTIFICATIONS } from "@/components/landing/security/certifications";
import { SecurityBadge } from "@/components/landing/security/SecurityBadge";

/**
 * Brief landing security - Harvey-style enterprise strip:
 * headline + short copy + visible certification badge logos.
 */
export function SecuritySection() {
  return (
    <section id="security" className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(10,10,10,0.03),transparent_50%)]"
      />

      <div className="relative mx-auto max-w-[1100px] px-4 sm:px-8 lg:px-10 pt-20 sm:pt-28 pb-20 sm:pb-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] sm:text-[12px] font-semibold tracking-[0.28em] uppercase text-[#0a0a0a]/40">
            Enterprise security
          </p>
          <h2 className="mt-4 text-balance text-[1.85rem] sm:text-4xl lg:text-[2.85rem] font-semibold leading-[1.08] tracking-tight">
            Enterprise-grade security and controls
          </h2>
          <p className="mt-5 text-[15px] sm:text-lg text-[#0a0a0a]/55 leading-relaxed">
            Lysp is built on a non-negotiable principle: protecting the security and confidentiality
            of your firm’s pricing data. We’ve designed the platform from the ground up to safeguard
            the most sensitive information - rates, OCGs, realization, and negotiation history.
          </p>
        </div>

        <div className="mt-12 sm:mt-14 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-6 lg:gap-8 place-items-center">
          {SECURITY_CERTIFICATIONS.map((cert) => (
            <a
              key={cert.id}
              href={cert.externalHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
              aria-label={`${cert.fullLabel} - official site (opens in new tab)`}
            >
              <span className="relative flex h-[76px] w-[76px] sm:h-[92px] sm:w-[92px] items-center justify-center overflow-hidden rounded-full bg-white p-3 shadow-[0_12px_40px_-20px_rgba(10,10,10,0.35)] ring-1 ring-black/[0.06] transition-shadow group-hover:shadow-[0_18px_48px_-18px_rgba(10,10,10,0.4)]">
                <SecurityBadge id={cert.id} title={cert.fullLabel} />
              </span>
              <span className="text-[11px] sm:text-[13px] font-semibold tracking-tight text-center text-[#0a0a0a]/70 group-hover:text-[#0a0a0a] group-hover:underline underline-offset-4 decoration-black/20 max-w-[5.5rem] sm:max-w-none">
                {cert.shortLabel}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-12 sm:mt-14 flex flex-col items-center gap-4">
          <Link
            href="/security"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-7 py-3.5 text-[14px] font-semibold text-[#fefefc] hover:bg-black transition-colors cursor-pointer"
          >
            Explore enterprise security
            <HiArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-[12px] text-[#0a0a0a]/40 text-center max-w-md leading-relaxed">
            Full controls, data residency, ethical walls, and disclosure answers on our security page.
          </p>
        </div>
      </div>
    </section>
  );
}
