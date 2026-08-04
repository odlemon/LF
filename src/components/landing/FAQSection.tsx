"use client";

import React, { useState } from "react";
import { HiChevronDown } from "react-icons/hi";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does Lysp pull historic pricing data?",
      a: "Lysp syncs with Clio, QuickBooks, Aderant, and Intapp APIs to ingest closed matters, invoice line items, and past rate sheets without manual exports.",
    },
    {
      q: "What activities are included in the base seat plan?",
      a: "Our base plan includes unlimited proposal generation, client portal accesses, template adjustments, and OCG guardrail evaluations for up to 10 users.",
    },
    {
      q: "How do usage credits work?",
      a: "Credits cover resource-intensive events such as scenario models, volume discount updates, or foreign currency normalizations, starting at $28/credit.",
    },
    {
      q: "How quickly can Lysp be deployed?",
      a: "For standard integrations like Clio and QuickBooks, live synchronization takes under 48 hours. Custom legacy systems complete in 14 days.",
    },
    {
      q: "What safeguards protect client and firm pricing data?",
      a: "We run on secure enterprise-grade cloud environments. Your OCG definitions and margins are isolated, and we never train AI models on your data.",
    },
    {
      q: "Can partners review and edit proposals?",
      a: "Yes, partners have full editing rights to adjust rates, override guidelines with explanations, or configure specific client portals.",
    },
  ];

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-24 sm:py-28 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
            Answers for pricing teams
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 leading-tight">
            Frequently asked questions
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Everything legal finance, pricing, and partner teams ask when getting started with Lysp.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-[26px] border border-white/70 bg-white/80 backdrop-blur shadow-[0_26px_70px_-45px_rgba(15,23,42,0.35)] overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => handleToggle(idx)}
                  className="w-full text-left px-6 py-5 sm:py-6 flex items-center justify-between gap-4 font-bold text-gray-900 text-sm sm:text-base hover:text-emerald-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <div
                    className={`h-9 w-9 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 bg-emerald-50 text-emerald-600" : "text-gray-500"
                    }`}
                  >
                    <HiChevronDown className="w-5 h-5" />
                  </div>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? "200px" : "0px",
                  }}
                  className="transition-all duration-500 ease-in-out overflow-hidden"
                >
                  <div className="px-6 pb-6 text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
