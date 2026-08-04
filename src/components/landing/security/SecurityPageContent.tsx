"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HiArrowRight, HiChevronDown } from "react-icons/hi";
import { SECURITY_CERTIFICATIONS } from "@/components/landing/security/certifications";

const PILLARS = [
  {
    title: "Purpose-built controls",
    body: "In-house security across infrastructure, product, and operations. Continuous monitoring, SAML SSO, audit logs, IP allow-listing, and full data lifecycle management.",
  },
  {
    title: "Data sovereignty",
    body: "You decide what enters Lysp, how long it stays, and when it is deleted. Keep processing in-region - US, EU / Switzerland, or Australia - including subprocessors where localization applies.",
  },
  {
    title: "No model training",
    body: "Contractually guaranteed: inputs, outputs, rate cards, OCGs, and uploaded matter files are never used to train underlying models. Providers operate under zero data retention for your workloads.",
  },
  {
    title: "Ethical walls",
    body: "Lysp syncs and enforces your firm’s existing ethical wall policies. Restricted users cannot see or share walled pricing content. We never create, modify, or delete walls - your walls provider stays system of record.",
  },
  {
    title: "Enforceable commitments",
    body: "Our Security Addendum binds data protection, access rules, and incident-response SLAs to SOC 2, ISO, GDPR, and related standards - auditable terms built to exceed generic vendor language.",
  },
  {
    title: "Independently tested",
    body: "Annual SOC 2 Type II and ISO audits, automated vulnerability scanning, third-party penetration tests, and continuous monitoring. External validation - not self-attestation alone.",
  },
];

const DISCLOSURES = [
  {
    q: "How does Lysp define customer data?",
    a: "Customer data includes documents and structured firm records you upload or sync into Lysp - matter history, invoices, rate sheets, OCGs, and related pricing artifacts. Customer content means prompts, pricing requests, and model responses generated in the product. We protect both under the same encryption, access, and no-training commitments.",
  },
  {
    q: "How is firm and client pricing data kept private?",
    a: "All data is encrypted at rest (AES-256) and in transit (TLS 1.2+). Access follows least privilege with role-based controls. Each firm’s workspace is logically separated so data never commingles. Security obligations are passed through to subprocessors and model providers.",
  },
  {
    q: "Where is data hosted and processed?",
    a: "Lysp runs on enterprise cloud infrastructure. Firms with localization requirements can process in the US, EU / Switzerland, or Australia. The same regional posture extends to applicable subprocessors.",
  },
  {
    q: "How do access controls work for sensitive pricing?",
    a: "Strict RBAC and workspace separation ensure only authorized roles - pricing, partners, finance, and others you configure - can see specific data. You control what is ingested, retention windows, and whether content is shared inside the firm or via client portals.",
  },
  {
    q: "Can anyone train models on our data?",
    a: "No, by default. Lysp contractually prohibits providers from training on your data and requires zero data retention. Your data is used only to process your requests. If you explicitly request a bespoke model trained only on your firm’s corpus, that model is exclusive to you and never used for other customers.",
  },
  {
    q: "How often are security audits performed?",
    a: "We run continuous security monitoring, automated vulnerability scans, and annual third-party penetration tests, alongside yearly SOC 2 Type II and ISO program audits.",
  },
];

export function SecurityPageContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(10,10,10,0.03),transparent_40%),radial-gradient(ellipse_at_100%_80%,rgba(10,10,10,0.025),transparent_45%)]"
      />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10 pt-16 sm:pt-24 pb-20 sm:pb-28">
        <div className="max-w-3xl">
          <p className="text-[12px] font-medium tracking-[0.22em] uppercase text-[#0a0a0a]/40">
            Enterprise security
          </p>
          <h1 className="mt-5 text-balance text-[2.25rem] sm:text-5xl lg:text-[3.25rem] font-semibold leading-[1.06] tracking-tight">
            Enterprise-grade security
            <span className="text-[#0a0a0a]/40"> for privileged pricing data.</span>
          </h1>
          <p className="mt-5 text-[15px] sm:text-lg text-[#0a0a0a]/55 leading-relaxed max-w-2xl">
            Rates, OCGs, realization, and negotiation history are among the most sensitive assets
            in a firm. Lysp is built so that information stays yours - encrypted, isolated,
            auditable, and never used to train models.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-3 text-[14px] font-semibold text-[#fefefc] hover:bg-black transition-colors cursor-pointer"
            >
              Request the security pack
              <HiArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/#security"
              className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-6 py-3 text-[14px] font-semibold text-[#0a0a0a] hover:bg-black/[0.03] transition-colors cursor-pointer"
            >
              Back to overview
            </Link>
          </div>
        </div>

        {/* Certifications with anchors */}
        <div id="certifications" className="mt-16 sm:mt-20 scroll-mt-28">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/35">
            Certifications & frameworks
          </p>
          <h2 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight">
            Independently attested assurances
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY_CERTIFICATIONS.map((cert) => (
              <a
                key={cert.id}
                id={cert.id}
                href={cert.externalHref}
                target="_blank"
                rel="noopener noreferrer"
                className="scroll-mt-28 rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-7 flex gap-5 transition-colors hover:bg-[#fafaf8] cursor-pointer"
              >
                <img
                  src={cert.badgeSrc}
                  alt={`${cert.fullLabel} badge`}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#0a0a0a]/30">
                    Framework
                  </p>
                  <h3 className="mt-1.5 text-[18px] font-semibold tracking-tight">{cert.fullLabel}</h3>
                  <p className="mt-2 text-[14px] text-[#0a0a0a]/55 leading-relaxed">{cert.summary}</p>
                  <p className="mt-3 text-[12px] font-semibold text-[#0a0a0a]/40 underline underline-offset-2">
                    Official site ↗
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Pillars */}
        <div className="mt-16 sm:mt-20 rounded-[1.5rem] border border-black/[0.08] bg-white overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-black/[0.06]">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/35">
              Enterprise-grade protection
            </p>
            <p className="mt-2 text-[15px] text-[#0a0a0a]/50">
              Controls at every layer - from auth to model providers
            </p>
          </div>
          <ul>
            {PILLARS.map((item, i) => (
              <li
                key={item.title}
                className={`grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-6 px-6 sm:px-8 py-6 sm:py-7 ${
                  i < PILLARS.length - 1 ? "border-b border-black/[0.06]" : ""
                }`}
              >
                <div className="sm:col-span-4 flex items-baseline gap-3">
                  <span className="text-[11px] font-semibold tabular-nums text-[#0a0a0a]/30 tracking-wider">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[16px] sm:text-[17px] font-semibold tracking-tight">
                    {item.title}
                  </h3>
                </div>
                <p className="sm:col-span-8 text-[14px] sm:text-[15px] text-[#0a0a0a]/55 leading-relaxed">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Disclosures */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/35">
              Disclosures
            </p>
            <h2 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight">
              Answers counsel and infosec ask first.
            </h2>
            <p className="mt-3 text-[14px] text-[#0a0a0a]/50 leading-relaxed">
              Encryption, residency, access, training bans, and audit cadence - in plain language.
            </p>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-2">
            {DISCLOSURES.map((item, idx) => {
              const open = openIndex === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-black/[0.07] bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : idx)}
                    className="w-full text-left px-5 sm:px-6 py-4 sm:py-5 flex items-start justify-between gap-4 cursor-pointer"
                    aria-expanded={open}
                  >
                    <span className="text-[14px] sm:text-[15px] font-semibold tracking-tight pr-2">
                      {item.q}
                    </span>
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3f3f1] text-[#0a0a0a]/50 transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                      }`}
                    >
                      <HiChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-[14px] text-[#0a0a0a]/55 leading-relaxed">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
