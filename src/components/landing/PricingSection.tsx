"use client";

import React, { useState } from "react";
import { HiCheck, HiOutlineReceiptTax, HiShieldCheck, HiArrowRight, HiCurrencyDollar } from "react-icons/hi";

type ActiveView = "base" | "usage";
type BillingCycle = "monthly" | "annual";
type SnapshotView = "spend" | "roi";

export function PricingSection() {
  const [activeView, setActiveView] = useState<ActiveView>("base");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [snapshotView, setSnapshotView] = useState<SnapshotView>("spend");

  const baseInclusions = [
    "Unlimited pricing proposals",
    "Live Clio & billing integration",
    "Custom outside counsel guidelines",
    "Unlimited client viewer portals",
    "Weekly compliance audit digests",
  ];

  const baseUsageIncluded = [
    "5 concurrent client proposal briefs",
    "3 multi-scenario rate models",
    "2 custom client volume discounts",
    "1 global firm practice area card",
  ];

  const baseLimitations = [
    "Max 10 users in base plan",
    "API requests rate limited",
    "Support via standard email channels",
  ];

  const creditActions = [
    { name: "Approved proposal", cost: "3 credits" },
    { name: "Bulk scenarios model", cost: "5 credits" },
    { name: "Rate negotiation approval", cost: "10 credits" },
    { name: "Invoice audit processing", cost: "1 per 12 invoices" },
    { name: "Value optimization check", cost: "1 per $5K saved" },
  ];

  const snapshots = [
    {
      title: "Boutique firm",
      spend: "$2,990/mo",
      annualTotal: "$31,800/yr",
      breakdown: "10 seats, base features included.",
      roi: ["Turnaround down to 1.5 hours", "+4.2% blended realization increase", "$32k invoice write-offs blocked"],
    },
    {
      title: "Growing firm",
      spend: "$6,228/mo",
      annualTotal: "$65,736/yr",
      breakdown: "25 seats, Clio & Intapp API access.",
      roi: ["Queue backlog down 70%", "+9.4% blended realization increase", "$145k OCG leakages recovered"],
    },
    {
      title: "Large firm",
      spend: "$17,433/mo",
      annualTotal: "$182,784/yr",
      breakdown: "80 seats, full Monolith integration.",
      roi: ["Partners save 14 hours/week", "Auto volume tiers everywhere", "$650k write-off leakage blocked"],
    },
  ];

  const handleSeatMath = () => {
    const rate = billingCycle === "monthly" ? 299 : 265;
    const total = rate * 10;
    return { rate, total };
  };

  const { rate: baseRate, total: baseTotal } = handleSeatMath();

  return (
    <section id="pricing" className="bg-white py-24 sm:py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col gap-4">
          <h2 className="text-3xl font-bold sm:text-4xl text-gray-900 leading-tight">
            Let the platform scale with the matters you close
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            A predictable platform fee covers your pricing, finance, and client teams, with optional usage bundles.
          </p>

          <div className="flex bg-gray-100 p-1 rounded-full w-64 mx-auto mt-4 shrink-0 gap-1 border">
            <button
              onClick={() => setActiveView("base")}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-full capitalize transition-all duration-200 ${
                activeView === "base"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Base Plan
            </button>
            <button
              onClick={() => setActiveView("usage")}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-full capitalize transition-all duration-200 ${
                activeView === "usage"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Usage Credits
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 bg-gray-50/50 rounded-[28px] border border-gray-100 p-6 sm:p-8 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.1)] flex flex-col gap-6">
            {activeView === "base" ? (
              <>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200/60 pb-6 shrink-0">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Seat-Based Base Subscription</h3>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">Perfect for dedicated commercial and billing groups</p>
                  </div>

                  <div className="flex bg-gray-200/50 p-1 rounded-full shrink-0 gap-1 border border-gray-200">
                    <button
                      onClick={() => setBillingCycle("monthly")}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                        billingCycle === "monthly"
                          ? "bg-white text-gray-800 shadow-sm"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle("annual")}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${
                        billingCycle === "annual"
                          ? "bg-white text-gray-800 shadow-sm"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      Annual
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-baseline gap-2 justify-between border-b border-gray-200/50 pb-6">
                  <div>
                    <span className="text-4xl font-extrabold text-gray-900">${baseTotal}</span>
                    <span className="text-sm font-semibold text-gray-500"> / month</span>
                    <span className="text-[10px] text-gray-400 block mt-1 font-bold">
                      Calculated for 10 seat minimum
                    </span>
                  </div>
                  {billingCycle === "annual" && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-200">
                      Save 11% ($4,080 / year)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-3">
                      Features Included
                    </span>
                    <ul className="space-y-3">
                      {baseInclusions.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                          <HiCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-3">
                        Usage Allowances (Per Month)
                      </span>
                      <ul className="space-y-3">
                        {baseUsageIncluded.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                            <HiOutlineReceiptTax className="w-4 h-4 text-emerald-500 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-3">
                        Base Plan Constraints
                      </span>
                      <ul className="space-y-3">
                        {baseLimitations.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-xl font-bold text-gray-900">Usage-Based Credit Scenarios</h3>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">Only pay for high-value actions as you submit matters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-4">
                      Activity Credit Costs
                    </span>
                    <div className="flex flex-col gap-3">
                      {creditActions.map((action) => (
                        <div key={action.name} className="flex items-center justify-between text-xs sm:text-sm font-semibold border-b border-gray-200/50 pb-2 last:border-0">
                          <span className="text-gray-700">{action.name}</span>
                          <span className="text-emerald-600 font-bold whitespace-nowrap">{action.cost}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 justify-between h-64">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Platform Credit Value</span>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-extrabold text-gray-900">$28</span>
                        <span className="text-xs font-semibold text-gray-500"> / credit</span>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500">
                        <span>Mid-sized Bundle (120)</span>
                        <span className="text-gray-800">$3,360</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-gray-500">
                        <span>National Bundle (300)</span>
                        <span className="text-gray-800">$8,100</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-gray-500">
                        <span>Global Bundle (600)</span>
                        <span className="text-gray-800">$15,600</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-gray-100 p-1.5 rounded-full flex shrink-0 gap-1 border self-center">
              <button
                onClick={() => setSnapshotView("spend")}
                className={`px-5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  snapshotView === "spend"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Matters spend
              </button>
              <button
                onClick={() => setSnapshotView("roi")}
                className={`px-5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                  snapshotView === "roi"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Typical ROI
              </button>
            </div>

            <div className="flex flex-col gap-6">
              {snapshots.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-gray-100 bg-gradient-to-br from-white via-white to-gray-50 p-6 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.45)] flex flex-col gap-4 select-none"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.title}</span>
                    <span className="text-lg font-bold text-emerald-600">{item.spend}</span>
                  </div>

                  {snapshotView === "spend" ? (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 leading-normal">{item.breakdown}</p>
                      <span className="text-[10px] text-gray-400 block mt-1 font-bold">{item.annualTotal}</span>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {item.roi.map((roiItem) => (
                        <li key={roiItem} className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                          <HiShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          {roiItem}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
