"use client";

import React, { useState } from "react";
import { useBookDemo } from "@/components/landing/BookDemoModal";
import Link from "next/link";
import { HiCheck, HiLockClosed, HiArrowRight, HiPlay } from "react-icons/hi";

export function IntegrationsCTASection() {
  const { openBookDemo } = useBookDemo();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const integrations = [
    { name: "Clio", text: "CL", color: "bg-emerald-50 text-emerald-600 border-emerald-200/50", desc: "Matter history and phase plans" },
    { name: "QuickBooks", text: "QB", color: "bg-green-50 text-green-600 border-green-200/50", desc: "Billing actuals, budgeting, AR status" },
    { name: "Aderant", text: "A", color: "bg-blue-50 text-blue-600 border-blue-200/50", desc: "Financial performance, WIP, and rate tables" },
    { name: "Intapp", text: "I", color: "bg-indigo-50 text-indigo-600 border-indigo-200/50", desc: "Pricing approvals, rate requests, compliance events" },
    { name: "Salesforce", text: "SF", color: "bg-sky-50 text-sky-500 border-sky-200/50", desc: "Client intelligence and pipeline health" },
    { name: "Thomson Reuters", text: "TR", color: "bg-orange-50 text-orange-600 border-orange-200/50", desc: "Rate benchmarks and guidance" },
  ];

  return (
    <section id="integrations" className="bg-white py-20 sm:py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 leading-tight">
              Leave the integration workload with us and go live faster
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Lysp pulls historic matters, invoices, rate agreements, and client guidelines directly from your database, keeping all files in sync automatically.
            </p>

            <ul className="space-y-4 max-w-lg mx-auto lg:mx-0">
              {[
                "Direct API ingestion of matters and invoice history",
                "Synchronized rate sheet negotiation approvals",
                "Auto-push to client-ready templates and BI reports",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <HiCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6 sm:p-8 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.15)] flex flex-col justify-between gap-6 min-h-[420px] select-none">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-4">
                Supported Integrations (Hover for details)
              </span>
              
              <div className="grid grid-cols-3 gap-4 relative">
                {integrations.map((item) => (
                  <div
                    key={item.name}
                    onMouseEnter={() => setActiveTooltip(item.name)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    className="relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-gray-200/40 bg-white hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <div className={`h-12 w-12 rounded-full border-2 flex items-center justify-center font-extrabold text-sm ${item.color}`}>
                      {item.text}
                    </div>
                    <span className="text-[10px] text-gray-700 font-bold">{item.name}</span>

                    {activeTooltip === item.name && (
                      <div className="absolute z-20 bottom-full mb-2 bg-gray-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-lg w-40 text-center leading-normal animate-fade-in pointer-events-none">
                        {item.desc}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-3">
              <HiLockClosed className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-gray-900">You control your data</h4>
                <p className="text-[10px] text-gray-500 mt-1 leading-normal font-semibold">
                  Lysp never trains AI on your internal billing, rate negotiations, or OCG compliance guidelines.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => openBookDemo("integrations")}
                className="flex-1 bg-[#0a0a0a] hover:bg-black text-[#fefefc] rounded-xl py-3 text-center text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                Request a Demo
                <HiArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="#pricing"
                className="flex-1 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl py-3 text-center text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
              >
                Run a Live Trial
                <HiPlay className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
