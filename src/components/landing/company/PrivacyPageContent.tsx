"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HiChevronDown } from "react-icons/hi";
import { PageHeroHeader } from "@/components/landing/editorial";

const SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    body: [
      "Lysp (“Lysp,” “we,” “us,” or “our”) provides pricing intelligence software for law firms. This Privacy Policy explains how we collect, use, disclose, and protect personal information when you visit our websites, request a demo, or use the Lysp platform.",
      "If you are a firm using Lysp under a customer agreement, that agreement and our Security Addendum govern processing of Customer Data. This policy describes our general practices and how we handle personal information of website visitors, prospects, and users.",
    ],
  },
  {
    id: "collect",
    title: "Information we collect",
    body: [
      "Account and contact information: name, work email, firm name, role, and communications you send us (for example demo requests or support messages).",
      "Product usage data: logs and diagnostics needed to operate, secure, and improve the service - such as feature usage, device/browser type, IP address, and authentication events.",
      "Customer Data you or your firm upload or sync into Lysp (matter history, rate cards, OCGs, proposals, negotiation records, and related content) is processed to provide the service under your firm’s instructions.",
      "Website analytics: limited cookies or similar technologies may be used to understand site performance and marketing attribution, subject to your preferences where required.",
    ],
  },
  {
    id: "use",
    title: "How we use information",
    body: [
      "To provide, secure, and support the Lysp platform and related services.",
      "To respond to sales, support, and other inquiries you initiate.",
      "To improve product reliability, usability, and security - without training shared models on Customer Data.",
      "To comply with law, enforce agreements, and protect Lysp, our customers, and users.",
      "To send product or service communications. Marketing emails are sent only where permitted, and you can unsubscribe.",
    ],
  },
  {
    id: "training",
    title: "AI and model training",
    body: [
      "By default, Customer Data and customer content (inputs, outputs, uploaded files, rate cards, OCGs, and negotiation records) are not used to train underlying foundation models.",
      "Model providers process workloads under contractual zero data retention commitments for customer workloads, except where a firm expressly requests a bespoke model trained only on that firm’s corpus for its exclusive use.",
    ],
  },
  {
    id: "share",
    title: "How we share information",
    body: [
      "Service providers and subprocessors who help us host, secure, support, or operate Lysp, under confidentiality and data-protection obligations.",
      "Professional advisors, auditors, or authorities when required by law or to protect legal rights.",
      "In connection with a corporate transaction (for example a merger or financing), subject to appropriate safeguards.",
      "We do not sell personal information.",
    ],
  },
  {
    id: "retention",
    title: "Retention and deletion",
    body: [
      "We retain personal information as needed to provide the service, meet legal obligations, resolve disputes, and enforce agreements.",
      "Customer Data retention and deletion follow the customer agreement and firm-configured settings, including deletion workflows when an engagement ends.",
    ],
  },
  {
    id: "security",
    title: "Security",
    body: [
      "We use administrative, technical, and organizational measures designed to protect information, including encryption in transit and at rest, access controls, monitoring, and independent audits described on our Security page.",
      "No method of transmission or storage is perfectly secure. Please use strong credentials and firm-managed access policies.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    body: [
      "Depending on your location, you may have rights to access, correct, delete, or restrict certain personal information, or to object to certain processing and request portability.",
      "California residents may have additional rights under the CCPA/CPRA. EU/UK individuals may have rights under GDPR/UK GDPR.",
      "To exercise rights, contact us at the email below. We may need to verify your request. If you are a user of a firm customer, we may direct you to that firm as controller of Customer Data.",
    ],
  },
  {
    id: "international",
    title: "International transfers and residency",
    body: [
      "Lysp may process information in the United States and other regions where we or our subprocessors operate.",
      "Firms with localization requirements may process in supported regions (including US, EU / Switzerland, and Australia) as described in our security documentation and customer agreement.",
    ],
  },
  {
    id: "children",
    title: "Children",
    body: [
      "Lysp is built for business use by law firms and related professionals. We do not knowingly collect personal information from children.",
    ],
  },
  {
    id: "changes",
    title: "Changes",
    body: [
      "We may update this Privacy Policy from time to time. The “Last updated” date will change when we do. Material changes will be communicated as appropriate through the site or customer channels.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      "For privacy questions or requests: nyasha@lysp.io",
      "For security questionnaires and enterprise packs, visit our Security page or contact sales.",
    ],
  },
] as const;

/** Light, scannable privacy - accordion dossier, not a dark legal dump. */
export function PrivacyPageContent() {
  const [openId, setOpenId] = useState<string>("overview");

  return (
    <div className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(10,10,10,0.035),transparent_50%)]"
      />

      {/* Soft paper hero - brand first */}
      <section className="relative border-b border-black/[0.06]">
        <div className="relative mx-auto w-full max-w-[880px] px-5 sm:px-8 pt-20 sm:pt-28 pb-14 sm:pb-16">
          <PageHeroHeader
            eyebrow="Legal"
            title="Privacy"
            description="Clear terms for how we handle personal information - and what we never do with your firm’s data."
          >
            <p className="mt-8 text-[12px] text-[#0a0a0a]/35">
              Last updated August 4, 2026
              <span className="mx-2 text-[#0a0a0a]/20">·</span>
              <Link
                href="/security"
                className="font-semibold text-[#0a0a0a]/55 hover:text-[#0a0a0a] transition-colors"
              >
                Security controls
              </Link>
            </p>
          </PageHeroHeader>
        </div>
      </section>

      {/* One commitment strip - single purpose */}
      <section className="relative bg-[#0a0a0a] text-[#fefefc]">
        <div className="mx-auto max-w-[880px] px-5 sm:px-8 py-10 sm:py-12">
          <p className="text-[15px] sm:text-[17px] font-medium leading-relaxed text-white/75 text-balance">
            We do not sell personal information. Customer Data is not used to train shared models.
            Encryption, access control, and audit commitments are detailed on our{" "}
            <Link href="/security" className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white/70">
              Security
            </Link>{" "}
            page.
          </p>
        </div>
      </section>

      {/* Accordion body */}
      <section className="relative">
        <div className="mx-auto max-w-[880px] px-5 sm:px-8 py-10 sm:py-14">
          <ul className="border-t border-black/[0.08]">
            {SECTIONS.map((section, i) => {
              const open = openId === section.id;
              return (
                <li key={section.id} id={section.id} className="scroll-mt-28 border-b border-black/[0.08]">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? "" : section.id)}
                    className="flex w-full items-start justify-between gap-6 py-6 sm:py-7 text-left cursor-pointer group"
                    aria-expanded={open}
                  >
                    <span className="flex items-baseline gap-4 min-w-0">
                      <span className="text-[11px] font-semibold tabular-nums tracking-wider text-[#0a0a0a]/25 shrink-0 pt-1">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[1.05rem] sm:text-[1.2rem] font-semibold tracking-tight group-hover:opacity-70 transition-opacity">
                        {section.title}
                      </span>
                    </span>
                    <HiChevronDown
                      className={`mt-1 h-5 w-5 shrink-0 text-[#0a0a0a]/30 transition-transform duration-300 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-300 ease-out"
                    style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <div className="pb-7 sm:pb-8 pl-0 sm:pl-10 space-y-3 max-w-xl">
                        {section.body.map((para) => (
                          <p
                            key={para.slice(0, 40)}
                            className="text-[14px] sm:text-[15px] text-[#0a0a0a]/55 leading-relaxed"
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-14 sm:mt-16 pt-10 border-t border-black/[0.06]">
            <p className="text-[13px] font-semibold tracking-[0.08em] text-[#0a0a0a]">Lysp</p>
            <p className="mt-3 text-[15px] text-[#0a0a0a]/50 leading-relaxed max-w-sm">
              Privacy questions or data requests.
            </p>
            <a
              href="mailto:nyasha@lysp.io"
              className="mt-4 inline-flex text-[15px] font-semibold text-[#0a0a0a] underline underline-offset-4 decoration-black/15 hover:decoration-black/50"
            >
              nyasha@lysp.io
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
