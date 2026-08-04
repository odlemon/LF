"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HiArrowRight, HiCheck, HiChevronDown, HiLockClosed, HiShieldCheck } from "react-icons/hi";
import { SECURITY_CERTIFICATIONS } from "@/components/landing/security/certifications";
import { SecurityBadge } from "@/components/landing/security/SecurityBadge";

const TRUST_STRIP = [
  { label: "Encryption", value: "AES-256 · TLS 1.2+" },
  { label: "Training", value: "Never on your data" },
  { label: "Residency", value: "US · EU/CH · AU" },
  { label: "Assurance", value: "SOC 2 · ISO suite" },
] as const;

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

const CONTROL_DOMAINS = [
  {
    id: "encryption",
    title: "Encryption & transport",
    summary: "Privileged commercial data protected in motion and at rest.",
    points: [
      "AES-256 encryption at rest for firm workspaces",
      "TLS 1.2+ for all client and service traffic",
      "Key management with least-privilege access",
      "Encrypted backups with retention you control",
    ],
  },
  {
    id: "access",
    title: "Identity & access",
    summary: "Only the roles you authorize see rates, OCGs, and negotiations.",
    points: [
      "SAML SSO and enterprise identity federation",
      "Strict RBAC for pricing, partners, finance, and clients",
      "Workspace isolation across firms - no data commingling",
      "Optional IP allow-listing and session controls",
    ],
  },
  {
    id: "lifecycle",
    title: "Data lifecycle",
    summary: "You decide what is ingested, how long it lives, and when it leaves.",
    points: [
      "Configurable retention windows per data class",
      "Deletion workflows with audit evidence",
      "Clear separation of customer data vs. content",
      "Subprocessor obligations passed through contractually",
    ],
  },
  {
    id: "ai",
    title: "AI & model use",
    summary: "Pricing intelligence without training on your corpus by default.",
    points: [
      "No training on inputs, outputs, or uploaded files",
      "Zero data retention with model providers",
      "ISO 42001-aligned AI management controls",
      "Optional firm-exclusive models only when you request them",
    ],
  },
] as const;

const REGIONS = [
  {
    code: "US",
    title: "United States",
    body: "Primary enterprise cloud region for North American firms and US-localized workloads.",
  },
  {
    code: "EU / CH",
    title: "Europe & Switzerland",
    body: "In-region processing for firms with European residency and transfer requirements.",
  },
  {
    code: "AU",
    title: "Australia",
    body: "Localized processing for APAC firms that require Australian data residency.",
  },
] as const;

const ARCHITECTURE = [
  {
    step: "01",
    title: "Your systems",
    body: "Matter history, rate cards, OCGs, PMS, and ethical walls stay under firm control.",
  },
  {
    step: "02",
    title: "Lysp workspace",
    body: "Logically isolated tenant with encryption, RBAC, and full audit logging.",
  },
  {
    step: "03",
    title: "Model providers",
    body: "Zero retention, no training. Used only to process your pricing requests.",
  },
  {
    step: "04",
    title: "Assurance",
    body: "SOC 2, ISO, continuous monitoring, and third-party penetration tests.",
  },
] as const;

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
  const [activeDomain, setActiveDomain] = useState<(typeof CONTROL_DOMAINS)[number]["id"]>(
    "encryption",
  );
  const domain = CONTROL_DOMAINS.find((d) => d.id === activeDomain)!;

  return (
    <div className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(10,10,10,0.03),transparent_40%),radial-gradient(ellipse_at_100%_80%,rgba(10,10,10,0.025),transparent_45%)]"
      />

      {/* Hero */}
      <section className="relative border-b border-black/[0.06]">
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10 pt-16 sm:pt-24 pb-12 sm:pb-16">
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
              <a
                href="#certifications"
                className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-6 py-3 text-[14px] font-semibold text-[#0a0a0a] hover:bg-black/[0.03] transition-colors cursor-pointer"
              >
                View certifications
              </a>
            </div>
          </div>

          <div className="mt-12 sm:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {TRUST_STRIP.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-black/[0.07] bg-white/80 px-4 py-4 sm:px-5 sm:py-5"
              >
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/35">
                  {item.label}
                </p>
                <p className="mt-2 text-[14px] sm:text-[16px] font-semibold tracking-tight">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="relative scroll-mt-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/35">
              Architecture
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              How privileged pricing data moves - and where it stops.
            </h2>
            <p className="mt-3 text-[15px] text-[#0a0a0a]/55 leading-relaxed">
              Firm systems remain the source of truth. Lysp isolates each workspace, encrypts every
              layer, and never feeds your corpus into shared model training.
            </p>
          </div>

          <div className="mt-10 rounded-[1.75rem] border border-black/[0.08] bg-white overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-black/[0.06]">
              {ARCHITECTURE.map((item, i) => (
                <div key={item.step} className="relative p-6 sm:p-7">
                  {i < ARCHITECTURE.length - 1 ? (
                    <span
                      aria-hidden
                      className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-[#0a0a0a]/20 text-lg"
                    >
                      →
                    </span>
                  ) : null}
                  <p className="text-[11px] font-semibold tabular-nums tracking-wider text-[#0a0a0a]/30">
                    {item.step}
                  </p>
                  <h3 className="mt-3 text-[16px] font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-[13px] sm:text-[14px] text-[#0a0a0a]/55 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual trust panel */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-[1.5rem] bg-[#0a0f0d] text-[#fefefc] p-6 sm:p-8 overflow-hidden relative">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(254,254,252,0.08),transparent_45%)]"
              />
              <div className="relative">
                <div className="flex items-center gap-2 text-white/40">
                  <HiLockClosed className="h-4 w-4" />
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase">
                    Workspace isolation
                  </p>
                </div>
                <h3 className="mt-4 text-xl sm:text-2xl font-semibold tracking-tight max-w-md">
                  Each firm’s rates, OCGs, and negotiations live in a logically separated tenant.
                </h3>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["Matter history", "Rate cards", "Negotiation log"].map((label) => (
                    <div
                      key={label}
                      className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-4"
                    >
                      <div className="flex items-center gap-2">
                        <HiShieldCheck className="h-4 w-4 text-white/50" />
                        <p className="text-[13px] font-semibold">{label}</p>
                      </div>
                      <p className="mt-2 text-[11px] text-white/35">Encrypted · RBAC · Audited</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-[1.5rem] border border-black/[0.08] bg-white p-6 sm:p-8 flex flex-col">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0a0a0a]/35">
                Ethical walls
              </p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">
                Your walls provider stays system of record.
              </h3>
              <p className="mt-3 text-[14px] text-[#0a0a0a]/55 leading-relaxed">
                Lysp syncs and enforces existing ethical wall policies. Restricted users cannot see
                or share walled pricing content. We never create, modify, or delete walls.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Sync from your walls system of record",
                  "Enforce on pricing artifacts and portals",
                  "No Lysp-side wall inventing or edits",
                ].map((line) => (
                  <li key={line} className="flex gap-2.5 items-start">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-[#fefefc]">
                      <HiCheck className="h-3 w-3" />
                    </span>
                    <span className="text-[14px] text-[#0a0a0a]/70 leading-snug">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Control domains */}
      <section id="controls" className="relative scroll-mt-28 bg-[#f7f7f4] border-y border-black/[0.05]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/35">
              Controls
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              Security domains counsel and infosec review first.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div
              className="lg:col-span-4 flex flex-col gap-2"
              role="tablist"
              aria-label="Security control domains"
            >
              {CONTROL_DOMAINS.map((item) => {
                const selected = activeDomain === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveDomain(item.id)}
                    className={`text-left rounded-2xl border px-5 py-4 transition-colors cursor-pointer ${
                      selected
                        ? "border-[#0a0a0a] bg-[#0a0a0a] text-[#fefefc]"
                        : "border-black/[0.08] bg-white text-[#0a0a0a] hover:bg-white/80"
                    }`}
                  >
                    <p className="text-[15px] font-semibold tracking-tight">{item.title}</p>
                    <p
                      className={`mt-1 text-[13px] leading-snug ${
                        selected ? "text-white/55" : "text-[#0a0a0a]/50"
                      }`}
                    >
                      {item.summary}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-8 rounded-[1.5rem] border border-black/[0.08] bg-white p-6 sm:p-8">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0a0a0a]/35">
                Detail
              </p>
              <h3 className="mt-3 text-xl sm:text-2xl font-semibold tracking-tight">{domain.title}</h3>
              <p className="mt-2 text-[15px] text-[#0a0a0a]/55 leading-relaxed">{domain.summary}</p>
              <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {domain.points.map((point) => (
                  <li
                    key={point}
                    className="rounded-xl border border-black/[0.06] bg-[#fafaf8] px-4 py-4 flex gap-3"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-[#fefefc]">
                      <HiCheck className="h-3 w-3" />
                    </span>
                    <span className="text-[14px] text-[#0a0a0a]/75 leading-snug">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Regions */}
      <section id="residency" className="relative scroll-mt-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/35">
              Data residency
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              Process where your firm requires.
            </h2>
            <p className="mt-3 text-[15px] text-[#0a0a0a]/55 leading-relaxed">
              Localization extends to applicable subprocessors so residency commitments hold across
              the stack - not only the application tier.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {REGIONS.map((region) => (
              <div
                key={region.code}
                className="rounded-[1.35rem] border border-black/[0.08] bg-white p-6 sm:p-7"
              >
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0a0a0a]/35">
                  Region
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight">{region.code}</h3>
                <p className="mt-1 text-[14px] font-medium text-[#0a0a0a]/70">{region.title}</p>
                <p className="mt-3 text-[14px] text-[#0a0a0a]/55 leading-relaxed">{region.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section id="certifications" className="relative scroll-mt-28 border-t border-black/[0.06]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/35">
              Certifications & frameworks
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Independently attested assurances
            </h2>
            <p className="mt-3 text-[15px] text-[#0a0a0a]/55 leading-relaxed">
              External frameworks for security, privacy, and responsible AI - with links to the
              official standards bodies.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY_CERTIFICATIONS.map((cert) => (
              <a
                key={cert.id}
                id={cert.id}
                href={cert.externalHref}
                target="_blank"
                rel="noopener noreferrer"
                className="scroll-mt-28 rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-7 flex gap-5 transition-all hover:bg-[#fafaf8] hover:-translate-y-0.5 cursor-pointer"
              >
                <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center">
                  <SecurityBadge id={cert.id} title={cert.fullLabel} />
                </span>
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
      </section>

      {/* Pillars */}
      <section id="commitments" className="relative scroll-mt-28">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10 pb-16 sm:pb-20">
          <div className="rounded-[1.5rem] border border-black/[0.08] bg-white overflow-hidden">
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
        </div>
      </section>

      {/* Disclosures */}
      <section id="disclosures" className="relative scroll-mt-28 border-t border-black/[0.06]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
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
      </section>

      {/* Closing CTA */}
      <section className="relative bg-[#0a0a0a] text-[#fefefc]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(254,254,252,0.07),transparent_45%)]"
        />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-10 py-16 sm:py-20 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-white/35">
              Security pack
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-balance">
              Get the questionnaire answers, architecture overview, and cert evidence.
            </h2>
            <p className="mt-4 text-[15px] text-white/45 leading-relaxed">
              For procurement, infosec, and risk - packaged for enterprise review.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fefefc] px-6 py-3.5 text-[14px] font-semibold text-[#0a0a0a] hover:bg-white transition-colors"
            >
              Request the security pack
              <HiArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:nyasha@lysp.io"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-[14px] font-semibold text-white/80 hover:text-white hover:border-white/30 transition-colors"
            >
              nyasha@lysp.io
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
