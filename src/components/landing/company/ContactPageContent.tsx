"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HiArrowRight } from "react-icons/hi";
import { MARKETING_SHELL, PageHeroHeader } from "@/components/landing/editorial";

type Intent = "sales" | "support" | "general";

const CHANNELS = [
  {
    id: "sales" as const,
    title: "Sales",
    body: "Demos, rollout, usage pricing, and security review for your firm.",
    cta: "Book a demo",
    href: "/auth",
    external: false,
  },
  {
    id: "support" as const,
    title: "Support",
    body: "Workspace, portals, integrations, and day-to-day product help.",
    cta: "support@lysp.ai",
    href: "mailto:support@lysp.ai",
    external: true,
  },
  {
    id: "general" as const,
    title: "General",
    body: "Press, partnerships, or anything that does not fit the above.",
    cta: "nyasha@lysp.ai",
    href: "mailto:nyasha@lysp.ai",
    external: true,
  },
];

export function ContactPageContent() {
  const [intent, setIntent] = useState<Intent>("sales");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [firm, setFirm] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject =
      intent === "sales"
        ? "Lysp sales inquiry"
        : intent === "support"
          ? "Lysp support request"
          : "Lysp inquiry";
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      firm ? `Firm: ${firm}` : null,
      `Intent: ${intent}`,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");
    const to = intent === "support" ? "support@lysp.ai" : "nyasha@lysp.ai";
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#fefefc] text-[#0a0a0a]">
      {/* Hero */}
      <section className="relative min-h-[min(78vh,720px)] flex flex-col justify-end overflow-hidden bg-[#0a0f0d] text-[#fefefc]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/practices/employment-glass.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-[0.32]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#0a0f0d] via-[#0a0f0d]/78 to-[#0a0f0d]/40"
        />
        <div className={`relative ${MARKETING_SHELL} pb-16 sm:pb-20 pt-32 sm:pt-36`}>
          <PageHeroHeader
            tone="dark"
            eyebrow="Contact"
            title="Let’s talk."
            description="Sales, support, or a note about your firm’s pricing workflow."
          />
        </div>
      </section>

      {/* Channels - editorial rows */}
      <section className="relative border-b border-black/[0.06]">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 py-6 sm:py-8">
          <ul>
            {CHANNELS.map((channel, i) => {
              const className =
                "group grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-8 items-center py-8 sm:py-10 border-b border-black/[0.06] last:border-0";
              const inner = (
                <>
                  <span className="sm:col-span-1 text-[12px] font-semibold tabular-nums tracking-wider text-[#0a0a0a]/25">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="sm:col-span-3 text-[1.35rem] sm:text-xl font-semibold tracking-tight">
                    {channel.title}
                  </h2>
                  <p className="sm:col-span-5 text-[14px] sm:text-[15px] text-[#0a0a0a]/50 leading-relaxed">
                    {channel.body}
                  </p>
                  <span className="sm:col-span-3 sm:justify-self-end inline-flex items-center gap-2 text-[14px] font-semibold text-[#0a0a0a] group-hover:gap-3 transition-all">
                    {channel.cta}
                    <HiArrowRight className="h-4 w-4" />
                  </span>
                </>
              );
              return (
                <li key={channel.id}>
                  {channel.external ? (
                    <a href={channel.href} className={className}>
                      {inner}
                    </a>
                  ) : (
                    <Link href={channel.href} className={className}>
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Message form */}
      <section className="relative">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <span className="block h-px w-12 bg-[#0a0a0a]/25 mb-5" />
              <p className="text-[11px] font-semibold tracking-[0.28em] uppercase text-[#0a0a0a]/35">
                Write us
              </p>
              <h2 className="mt-4 text-2xl sm:text-3xl font-semibold tracking-tight text-balance leading-[1.1]">
                Prefer a message?
              </h2>
              <p className="mt-4 text-[15px] text-[#0a0a0a]/50 leading-relaxed">
                We’ll open a draft in your mail app - nothing is stored on this page.
              </p>
            </div>

            <form onSubmit={onSubmit} className="lg:col-span-8 space-y-8">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#0a0a0a]/35 mb-4">
                  Regarding
                </p>
                <div className="flex flex-wrap gap-x-1 gap-y-2 border-b border-black/[0.08]">
                  {(
                    [
                      { id: "sales", label: "Sales" },
                      { id: "support", label: "Support" },
                      { id: "general", label: "General" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setIntent(opt.id)}
                      className={`relative px-4 pb-3 text-[14px] font-semibold transition-colors ${
                        intent === opt.id
                          ? "text-[#0a0a0a]"
                          : "text-[#0a0a0a]/35 hover:text-[#0a0a0a]/60"
                      }`}
                    >
                      {opt.label}
                      {intent === opt.id ? (
                        <span className="absolute inset-x-4 bottom-0 h-[2px] bg-[#0a0a0a]" />
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <label className="block">
                  <span className="text-[12px] font-semibold tracking-wide text-[#0a0a0a]/40">
                    Name
                  </span>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full border-0 border-b border-black/15 bg-transparent px-0 py-3 text-[15px] outline-none focus:border-[#0a0a0a] transition-colors placeholder:text-[#0a0a0a]/25"
                    placeholder="Your name"
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold tracking-wide text-[#0a0a0a]/40">
                    Work email
                  </span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full border-0 border-b border-black/15 bg-transparent px-0 py-3 text-[15px] outline-none focus:border-[#0a0a0a] transition-colors placeholder:text-[#0a0a0a]/25"
                    placeholder="you@firm.com"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[12px] font-semibold tracking-wide text-[#0a0a0a]/40">
                  Firm
                </span>
                <input
                  value={firm}
                  onChange={(e) => setFirm(e.target.value)}
                  className="mt-2 w-full border-0 border-b border-black/15 bg-transparent px-0 py-3 text-[15px] outline-none focus:border-[#0a0a0a] transition-colors placeholder:text-[#0a0a0a]/25"
                  placeholder="Optional"
                />
              </label>

              <label className="block">
                <span className="text-[12px] font-semibold tracking-wide text-[#0a0a0a]/40">
                  Message
                </span>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-2 w-full resize-y border-0 border-b border-black/15 bg-transparent px-0 py-3 text-[15px] outline-none focus:border-[#0a0a0a] transition-colors placeholder:text-[#0a0a0a]/25"
                  placeholder="What should we know?"
                />
              </label>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#0a0a0a] px-7 py-3.5 text-[14px] font-semibold text-[#fefefc] hover:bg-black transition-colors cursor-pointer"
                >
                  Open email draft
                  <HiArrowRight className="h-4 w-4" />
                </button>
                {sent ? (
                  <p className="text-[13px] text-[#0a0a0a]/45">
                    If mail did not open, write{" "}
                    <a href="mailto:nyasha@lysp.ai" className="underline underline-offset-2">
                      nyasha@lysp.ai
                    </a>
                    .
                  </p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
