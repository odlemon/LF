"use client";

import React, { useState } from "react";
import { HiCheck, HiOutlineChatAlt, HiCheckCircle, HiArrowRight, HiOutlineDocumentReport, HiScale, HiTrendingUp, HiShieldCheck } from "react-icons/hi";

type PricingTab = "fixed" | "hourly" | "contingency" | "cap";

export function WorkflowSection() {
  const [pricingTab, setPricingTab] = useState<PricingTab>("fixed");
  const [pricingFadeKey, setPricingFadeKey] = useState(0);

  const handleTabChange = (tab: PricingTab) => {
    setPricingTab(tab);
    setPricingFadeKey((prev) => prev + 1);
  };

  const steps = [
    {
      kicker: "Step 1",
      title: "Capture matter context",
      bullets: [
        "Structured prompts gather matter scope, deal size, risk, and client expectations...",
        "Lysp preloads similar matters and firm policy guidance...",
        "Pricing directors see the same briefing draft inside Lysp...",
      ],
      mockType: "chat",
    },
    {
      kicker: "Step 2",
      title: "Compare pricing structures",
      bullets: [
        "Compare multiple options based on firm realization historic targets.",
        "Assess margins under different client discount or success scenario models.",
        "Select the recommended fee playbook that aligns with firm realization goals.",
      ],
      mockType: "tabs",
    },
    {
      kicker: "Step 3",
      title: "Generate client-ready proposals",
      bullets: [
        "Lysp produces proposals with approved structures...",
        "Partners see discount logic, FX guardrails, and margin alerts side by side...",
        "Clients receive proposals with optional client portal login...",
      ],
      mockType: "proposal",
    },
  ];

  return (
    <section id="workflow" className="bg-white py-20 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
            How lysp fits your workflow
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 leading-tight">
            How legal teams use Lysp
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            No more back-and-forth tickets. Lysp guides lawyers through the firm-approved playbook while giving pricing teams full visibility and control.
          </p>
        </div>

        <div className="space-y-28">
          {steps.map((step, idx) => {
            const isOdd = idx % 2 === 0;
            return (
              <div key={step.title} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className={`flex flex-col gap-4 ${isOdd ? "md:order-2" : "md:order-1"}`}>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
                    {step.kicker}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <ul className="space-y-3.5 mt-2">
                    {step.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        <span className="text-sm sm:text-base text-gray-600 leading-relaxed">
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`w-full flex justify-center ${isOdd ? "md:order-1" : "md:order-2"}`}>
                  <div className="w-full max-w-lg rounded-2xl shadow-xl border border-gray-200/80 bg-white/90 backdrop-blur-sm p-4 flex flex-col gap-4 h-[340px] overflow-hidden select-none">
                    
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 shrink-0">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                        <span className="w-2 h-2 rounded-full bg-[#FEBB2E]" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {step.mockType === "chat" && "Matter Intake Chat"}
                        {step.mockType === "tabs" && "Pricing Advisor Engine"}
                        {step.mockType === "proposal" && "Proposal Generator"}
                      </span>
                      <div className="w-10" />
                    </div>

                    {step.mockType === "chat" && (
                      <div className="flex-1 flex flex-col gap-3 py-2 overflow-y-auto rates-scrollable justify-end">
                        <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3.5 max-w-[85%] self-start">
                          <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                            Tell me about the matter scope and expected transaction size.
                          </p>
                        </div>
                        <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-none p-3.5 max-w-[85%] self-end">
                          <p className="text-xs leading-relaxed font-semibold">
                            We are planning a $45M corporate acquisition. It involves complex cross-border due diligence and some minor FX hedging risks.
                          </p>
                        </div>
                        <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3.5 max-w-[85%] self-start flex gap-2.5 items-start">
                          <HiOutlineChatAlt className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                              Analyzing criteria... Found 4 similar corporate matters. Based on guidelines: Fixed Fee or Hourly with a cap are recommended.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {step.mockType === "tabs" && (
                      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                        <div className="flex bg-gray-100 p-1 rounded-xl shrink-0 gap-1 overflow-x-auto scrollbar-none">
                          {(["fixed", "hourly", "contingency", "cap"] as PricingTab[]).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => handleTabChange(tab)}
                              className={`flex-1 text-center py-2 text-[10px] sm:text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-all duration-200 border ${
                                pricingTab === tab
                                  ? "bg-white text-emerald-600 border-emerald-200/50 shadow-sm"
                                  : "text-gray-500 border-transparent hover:text-gray-800"
                              }`}
                            >
                              {tab === "cap" ? "Cap & Collar" : `${tab} fee`}
                            </button>
                          ))}
                        </div>

                        <div key={pricingFadeKey} className="flex-1 overflow-y-auto rates-scrollable animate-fade-in py-1">
                          {pricingTab === "fixed" && (
                            <div className="bg-emerald-50/50 border border-emerald-200/50 rounded-xl p-4 flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-800">Fixed Fee Structure</span>
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                                  87% Confidence
                                </span>
                              </div>
                              <span className="text-2xl font-extrabold text-gray-900">$450,000</span>
                              <div className="grid grid-cols-2 gap-3 text-[10px] mt-1 border-t border-emerald-100 pt-3">
                                <div>
                                  <span className="text-gray-400 font-bold block">WHY IT WORKS</span>
                                  <span className="text-gray-600 block mt-0.5 font-semibold">Low matter variation</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 font-bold block">WATCH OUTS</span>
                                  <span className="text-gray-600 block mt-0.5 font-semibold">Scope creep terms needed</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {pricingTab === "hourly" && (
                            <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                              <span className="text-xs font-bold text-gray-800">Standard Blended Hourly</span>
                              <span className="text-2xl font-extrabold text-gray-900">$425 / Hour</span>
                              <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
                                Recommended for open-ended regulatory matters where litigation actual duration is unpredictable.
                              </p>
                            </div>
                          )}

                          {pricingTab === "contingency" && (
                            <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                              <span className="text-xs font-bold text-gray-800">Success-Based Contingency</span>
                              <span className="text-2xl font-extrabold text-gray-900">$75k + 20% Success</span>
                              <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
                                Best suited for plaintiff-side commercial actions. High revenue potential with aligned partner interests.
                              </p>
                            </div>
                          )}

                          {pricingTab === "cap" && (
                            <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                              <span className="text-xs font-bold text-gray-800">Capped Hourly with Collar</span>
                              <span className="text-2xl font-extrabold text-gray-900">$520,000 Max Cap</span>
                              <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
                                Provides risk sharing for clients who want budget predictability with standard billing.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {step.mockType === "proposal" && (
                      <div className="flex-1 flex flex-col justify-between p-2">
                        <div className="border border-emerald-100 bg-emerald-50/30 rounded-xl p-3.5 flex items-center justify-between shrink-0">
                          <div>
                            <h4 className="text-[11px] font-bold text-emerald-800">FutureLink Acquisition Proposal</h4>
                            <span className="text-[9px] text-emerald-600 block mt-0.5">Fixed Fee Plan • Approved</span>
                          </div>
                          <span className="bg-emerald-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                            Ready to Send
                          </span>
                        </div>

                        <div className="border border-gray-200/60 rounded-xl p-3 flex flex-col gap-2.5 mt-2 flex-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-400 font-bold uppercase">Estimated Value</span>
                            <span className="font-extrabold text-gray-900">$450,000</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-400 font-bold uppercase">Estimated Duration</span>
                            <span className="font-semibold text-gray-600">6 - 12 Months</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-400 font-bold uppercase">Margin Risk Profile</span>
                            <span className="font-bold text-amber-600 uppercase">Medium Risk</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-24 pt-12 border-t border-gray-200/60">
          <div className="max-w-3xl mx-auto text-center flex flex-col gap-4 mb-16">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">
              After the proposal
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Client intelligence & rate control
            </h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
              Consolidate rate agreements and active workflows into a live control panel. Ingest invoices, track active matter status, and apply correct volume tier rules automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4 flex flex-col gap-6 text-left">
              <div className="border-l-4 border-amber-500 pl-4 py-1 bg-amber-50/40 rounded-r-xl pr-2">
                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-semibold">
                  The platform ingests invoices, normalizes FX currencies, and auto-applies volume discounts to historical invoices.
                </p>
              </div>

              <ul className="space-y-4">
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

            <div className="lg:col-span-8 w-full flex justify-center">
              <div className="w-full rounded-3xl border border-gray-200/80 bg-gray-50/50 p-4 sm:p-6 shadow-xl flex flex-col gap-4 h-[350px] overflow-hidden select-none">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 shrink-0">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Acme Corp Portal Intelligence</span>
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="w-2 h-2 rounded-full bg-gray-300" />
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto rates-scrollable pb-2">
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Volume Discounts</span>
                      <h4 className="text-xs font-bold text-gray-800 mt-1">Atlas Ventures Accounts</h4>
                      <p className="text-[9px] text-gray-400 mt-0.5">Tier 2 Milestone: 7.5% Discount</p>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-bold text-gray-700 mb-1">
                        <span>Current Spend: $720k</span>
                        <span>Goal: $1M</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: "72%" }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col gap-3 justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Rate Management</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                          GBP Anchor
                        </span>
                        <span className="text-[10px] text-amber-600 font-bold">3 Notifications</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500 font-semibold">Active Uplift Request</span>
                        <span className="font-bold text-gray-900">+3.5%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500 font-semibold">FX Currency Normalization</span>
                        <span className="text-emerald-600 font-bold uppercase">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
