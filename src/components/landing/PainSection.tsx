"use client";

import React from "react";
import { HiExclamation, HiClock, HiShieldCheck, HiArrowRight } from "react-icons/hi";

export function PainSection() {
  const cards = [
    {
      title: "Non-compliant pricing slips through",
      description: "Lawyers improvise fee structures when pricing teams are overloaded, creating margin risk and downstream write offs.",
      chartType: "compliance_flow",
      metrics: [
        { label: "Bypass Pricing", value: "68%", bad: true },
        { label: "Avg Write-off Exposure", value: "$58k", bad: true },
      ],
      impactLabel: "Typical impact",
      impacts: [
        { label: "Margin Leakage", value: "-4.2%" },
        { label: "Write-off Reduction", value: "-12%" },
      ],
    },
    {
      title: "Pricing requests stall in queues",
      description: "Commercial teams can't respond fast enough, leading to delayed deals and lower partner satisfaction.",
      chartType: "bar",
      metrics: [
        { label: "Avg Queue Time", value: "8.2 Days", bad: true },
        { label: "Cost of Delay", value: "$125k", bad: true },
      ],
      impactLabel: "Typical impact",
      impacts: [
        { label: "Win Rate Loss", value: "-18%" },
        { label: "Review Backlog", value: "+30%" },
      ],
    },
    {
      title: "No guardrails at the point of need",
      description: "Outside counsel guidelines and rate rules live in documents, meaning compliance is checked manually and late in the billing cycle.",
      chartType: "compliance",
      metrics: [
        { label: "OCG Compliance Gaps", value: "34%", bad: true },
        { label: "Manual Reviews Needed", value: "41%", bad: true },
      ],
      impactLabel: "Typical impact",
      impacts: [
        { label: "Billing Rejections", value: "+22%" },
        { label: "Cycle Delay", value: "+14 Days" },
      ],
    },
  ];

  const teamMembers = [
    { name: "Jessica Morris", status: "available", color: "bg-emerald-500", label: "Available" },
    { name: "Rachel Park", status: "overloaded", color: "bg-red-500", label: "Overloaded" },
    { name: "Kevin Chen", status: "overloaded", color: "bg-red-500", label: "Overloaded" },
    { name: "Mark Brenner", status: "unavailable", color: "bg-gray-400", label: "Unavailable" },
  ];

  const complianceRows = [
    { client: "Morris & Associates", status: "Non-Compliant", isRed: true },
    { client: "Chen & Patterson LLP", status: "Non-Compliant", isRed: true },
    { client: "Westbrook Legal Group", status: "Non-Compliant", isRed: true },
    { client: "Harrison & Clarke", status: "Compliant", isRed: false },
  ];

  return (
    <section className="bg-white py-20 sm:py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] lg:items-center gap-10">
          <div className="text-center lg:text-left flex flex-col gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
              The bottleneck we solve
            </span>
            <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 leading-tight">
              Pricing teams are stretched while demand for creative fee models keeps rising
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Lysp gives lawyers a guided path to compliant fee structures in minutes so commercial teams stop being the chokepoint and margins stay protected.
            </p>
          </div>

          <div className="relative rounded-3xl border border-emerald-200/50 shadow-[0_60px_110px_-60px_rgba(15,23,42,0.65)] overflow-hidden bg-gray-50 aspect-[5/3] flex flex-col p-4 sm:p-6 justify-between select-none">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent hidden lg:block z-10 pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-gray-200/50 pb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Intake Pipeline</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                4 Requests Delayed
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3 py-4 overflow-y-auto rates-scrollable justify-center">
              <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shrink-0">
                    <HiExclamation className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">Acquisition Proposal</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Aderant Partners • Partners ready to send</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-red-600 block">$45M deal risk</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Bypassed review</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 shrink-0">
                    <HiClock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">Fixed Fee Validation</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Clio Integration • Queue position #8</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-amber-700 block">Stalled 4.2 days</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Waiting on BDM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cards.map((card, idx) => {
            const isLast = idx === cards.length - 1;
            return (
              <div
                key={card.title}
                className={`rounded-[28px] border border-gray-100 bg-gray-50/40 p-6 sm:p-8 shadow-[0_32px_80px_-60px_rgba(15,23,42,0.35)] flex flex-col gap-6 justify-between ${
                  isLast ? "lg:col-span-2" : ""
                }`}
              >
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{card.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      {card.metrics.map((metric) => (
                        <div key={metric.label}>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            {metric.label}
                          </span>
                          <span
                            className={`text-2xl font-extrabold block mt-0.5 ${
                              metric.bad ? "text-red-600" : "text-gray-900"
                            }`}
                          >
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200/50 pt-4">
                      <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-bold block mb-2">
                        {card.impactLabel}
                      </span>
                      <div className="grid grid-cols-2 gap-4">
                        {card.impacts.map((impact) => (
                          <div key={impact.label}>
                            <span className="text-[10px] font-medium text-gray-500 block">{impact.label}</span>
                            <span className="text-lg font-bold text-gray-900 block mt-0.5">{impact.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm h-48 flex flex-col justify-between select-none">
                    {card.chartType === "compliance_flow" && (
                      <>
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-400" />
                          <span className="w-2 h-2 rounded-full bg-yellow-400" />
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-1.5 mt-2">
                          {complianceRows.map((row) => (
                            <div key={row.client} className="flex items-center justify-between text-[10px] py-1 border-b border-gray-100 last:border-0">
                              <span className="font-semibold text-gray-700 truncate max-w-[120px]">{row.client}</span>
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[8px] ${
                                row.isRed ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              }`}>
                                {row.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {card.chartType === "bar" && (
                      <>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-gray-400 block mb-2">Queue Load Matrix</span>
                        <div className="flex-1 flex flex-col gap-2 justify-center">
                          {teamMembers.map((member) => (
                            <div key={member.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {member.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <span className="text-[10px] text-gray-700 font-semibold">{member.name}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold text-white ${member.color}`}>
                                {member.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {card.chartType === "compliance" && (
                      <div className="flex-1 flex flex-col justify-center items-center text-center gap-2 p-2">
                        <HiShieldCheck className="w-10 h-10 text-red-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-red-600">Manual Guardrail Checked Late</span>
                        <p className="text-[9px] text-gray-400 leading-normal max-w-[180px]">
                          OCG guidelines are verified at billing invoice time instead of intake proposal creation.
                        </p>
                      </div>
                    )}
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
