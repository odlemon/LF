"use client";

import React from "react";
import { HiLightningBolt, HiTrendingUp, HiPresentationChartLine } from "react-icons/hi";

export function KnowledgeComplianceSection() {
  const cards = [
    {
      title: "Pricing turnaround",
      metric: "62% faster responses",
      description: "Matter teams generate partner-ready pricing scenarios without waiting for manual spreadsheet approvals.",
      icon: HiLightningBolt,
    },
    {
      title: "Matter profitability",
      metric: "+9.4% uplift",
      description: "Blended realization improves as compliance leaks are blocked and guardrails are applied during intake.",
      icon: HiTrendingUp,
    },
    {
      title: "Client profitability insight",
      metric: "15% clearer forecast",
      description: "Volume tiers, negotiated rate agreements, and FX factors are fully normalized in real-time.",
      icon: HiPresentationChartLine,
    },
  ];

  return (
    <section className="bg-gray-900 text-white py-20 sm:py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="max-w-3xl flex flex-col gap-4">
          <span className="inline-flex self-start bg-emerald-500/10 text-emerald-200 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/20">
            What firms report
          </span>
          <h2 className="text-3xl font-bold sm:text-4xl text-white leading-tight">
            Lysp turns pricing into a controllable, data-backed process
          </h2>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            Early adopters of Lysp achieve consistent realization rates, eliminate compliance leakage, and automate coordination with Clio, Intapp, Elite, and Aderant.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8 backdrop-blur-sm shadow-[0_30px_60px_-40px_rgba(15,23,42,0.65)] flex flex-col justify-between h-64 hover:border-emerald-500/30 transition-colors group"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-emerald-400 transition-colors">
                      {card.title}
                    </span>
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    {card.metric}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed font-semibold">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <span className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold">
            Outcomes measured across connected billing, practice management, and rate systems
          </span>
        </div>

      </div>
    </section>
  );
}
