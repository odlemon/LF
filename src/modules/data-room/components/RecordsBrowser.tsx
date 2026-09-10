"use client";

import React, { useState } from "react";
import { useRecords } from "../hooks/useDataRoom";
import { usePracticeAreas, useFeeEarnerLevels } from "@/modules/firm/hooks/useFirm";
import { Pagination } from "@/components/ui/Pagination";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { HiScale, HiClock, HiCurrencyDollar, HiPresentationChartLine, HiChartBar } from "react-icons/hi";

type RecordType = "past-matters" | "time-entries" | "billing-history" | "rate-card-history" | "market-benchmarks";

export function RecordsBrowser() {
  const [activeTab, setActiveTab] = useState<RecordType>("past-matters");
  const [page, setPage] = useState(0);

  // Filters State
  const [pastMattersFilters, setPastMattersFilters] = useState({
    practiceAreaCode: "",
    clientType: "",
    outcome: "",
    dateFrom: "",
    dateTo: "",
  });

  const [timeEntriesFilters, setTimeEntriesFilters] = useState({
    matterReference: "",
    feeEarnerLevelCode: "",
    dateFrom: "",
    dateTo: "",
  });

  const [billingFilters, setBillingFilters] = useState({
    practiceAreaCode: "",
    dateFrom: "",
    dateTo: "",
  });

  const [rateHistoryFilters, setRateHistoryFilters] = useState({
    feeEarnerLevelCode: "",
    effectiveYear: "",
  });

  const [benchmarksFilters, setBenchmarksFilters] = useState({
    practiceAreaCode: "",
    jurisdiction: "",
    surveyYear: "",
  });

  // Resolve filters based on active tab
  const getActiveFilters = () => {
    switch (activeTab) {
      case "past-matters":
        return pastMattersFilters;
      case "time-entries":
        return timeEntriesFilters;
      case "billing-history":
        return billingFilters;
      case "rate-card-history":
        return rateHistoryFilters;
      case "market-benchmarks":
        return benchmarksFilters;
    }
  };

  const { records, totalPages, totalElements, isLoading, error } = useRecords(
    activeTab,
    getActiveFilters(),
    page
  );

  // Load select options
  const { areas } = usePracticeAreas();
  const { levels } = useFeeEarnerLevels();

  const handleTabChange = (tab: RecordType) => {
    setActiveTab(tab);
    setPage(0);
  };

  const formatCurrency = (val: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-ink/90">
      {/* 5-Tab Bar Header */}
      <div className="bg-surface p-1 rounded-full border border-border/50 flex overflow-x-auto shrink-0 shadow-sm rates-scrollable gap-1">
        {(
          [
            { id: "past-matters", label: "Past Matters", icon: HiScale },
            { id: "time-entries", label: "Time Entries", icon: HiClock },
            { id: "billing-history", label: "Billing History", icon: HiCurrencyDollar },
            { id: "rate-card-history", label: "Rate Card History", icon: HiPresentationChartLine },
            { id: "market-benchmarks", label: "Market Benchmarks", icon: HiChartBar },
          ] as const
        ).map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-full transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                  : "text-ink/65 hover:bg-canvas hover:text-ink"
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Bars Section */}
      <div className="bg-field/50 border border-border/40 rounded-3xl p-5 shadow-sm">
        {activeTab === "past-matters" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex flex-col gap-1">
              <Select
                label="Practice Area"
                placeholder="All Areas"
                options={[{ value: "", label: "All Areas" }, ...areas.map((a) => ({ value: a.code, label: a.name }))]}
                value={pastMattersFilters.practiceAreaCode}
                onChange={(val) => {
                  setPastMattersFilters((prev) => ({ ...prev, practiceAreaCode: val }));
                  setPage(0);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Select
                label="Client Type"
                placeholder="All Clients"
                options={[
                  { value: "", label: "All Clients" },
                  { value: "CORPORATE", label: "Corporate" },
                  { value: "INDIVIDUAL", label: "Individual" },
                  { value: "GOVERNMENT", label: "Government" },
                  { value: "FINANCIAL_INSTITUTION", label: "Financial Institution" },
                ]}
                value={pastMattersFilters.clientType}
                onChange={(val) => {
                  setPastMattersFilters((prev) => ({ ...prev, clientType: val }));
                  setPage(0);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Select
                label="Outcome"
                placeholder="All Outcomes"
                options={[
                  { value: "", label: "All Outcomes" },
                  { value: "WON", label: "Won" },
                  { value: "LOST", label: "Lost" },
                  { value: "SETTLED", label: "Settled" },
                  { value: "ONGOING", label: "Ongoing" },
                  { value: "ABANDONED", label: "Abandoned" },
                ]}
                value={pastMattersFilters.outcome}
                onChange={(val) => {
                  setPastMattersFilters((prev) => ({ ...prev, outcome: val }));
                  setPage(0);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink/60 uppercase tracking-wider pl-1">Date From</label>
              <DatePicker
                value={pastMattersFilters.dateFrom}
                onChange={(val) => {
                  setPastMattersFilters((prev) => ({ ...prev, dateFrom: val }));
                  setPage(0);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink/60 uppercase tracking-wider pl-1">Date To</label>
              <DatePicker
                value={pastMattersFilters.dateTo}
                onChange={(val) => {
                  setPastMattersFilters((prev) => ({ ...prev, dateTo: val }));
                  setPage(0);
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "time-entries" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink/60 uppercase tracking-wider pl-1">Matter Reference</label>
              <input aria-label="Matter Reference"
                type="text"
                placeholder="Search matter ref..."
                value={timeEntriesFilters.matterReference}
                onChange={(e) => {
                  setTimeEntriesFilters((prev) => ({ ...prev, matterReference: e.target.value }));
                  setPage(0);
                }}
                className="px-5 py-2.5 bg-surface border border-border rounded-full text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Select
                label="Lawyer Level"
                placeholder="All Levels"
                options={[{ value: "", label: "All Levels" }, ...levels.map((l) => ({ value: l.code, label: l.name }))]}
                value={timeEntriesFilters.feeEarnerLevelCode}
                onChange={(val) => {
                  setTimeEntriesFilters((prev) => ({ ...prev, feeEarnerLevelCode: val }));
                  setPage(0);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink/60 uppercase tracking-wider pl-1">Date From</label>
              <DatePicker
                value={timeEntriesFilters.dateFrom}
                onChange={(val) => {
                  setTimeEntriesFilters((prev) => ({ ...prev, dateFrom: val }));
                  setPage(0);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink/60 uppercase tracking-wider pl-1">Date To</label>
              <DatePicker
                value={timeEntriesFilters.dateTo}
                onChange={(val) => {
                  setTimeEntriesFilters((prev) => ({ ...prev, dateTo: val }));
                  setPage(0);
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "billing-history" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <Select
                label="Practice Area"
                placeholder="All Areas"
                options={[{ value: "", label: "All Areas" }, ...areas.map((a) => ({ value: a.code, label: a.name }))]}
                value={billingFilters.practiceAreaCode}
                onChange={(val) => {
                  setBillingFilters((prev) => ({ ...prev, practiceAreaCode: val }));
                  setPage(0);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink/60 uppercase tracking-wider pl-1">Date From</label>
              <DatePicker
                value={billingFilters.dateFrom}
                onChange={(val) => {
                  setBillingFilters((prev) => ({ ...prev, dateFrom: val }));
                  setPage(0);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink/60 uppercase tracking-wider pl-1">Date To</label>
              <DatePicker
                value={billingFilters.dateTo}
                onChange={(val) => {
                  setBillingFilters((prev) => ({ ...prev, dateTo: val }));
                  setPage(0);
                }}
              />
            </div>
          </div>
        )}

        {activeTab === "rate-card-history" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Select
                label="Fee Earner Level"
                placeholder="All Levels"
                options={[{ value: "", label: "All Levels" }, ...levels.map((l) => ({ value: l.code, label: l.name }))]}
                value={rateHistoryFilters.feeEarnerLevelCode}
                onChange={(val) => {
                  setRateHistoryFilters((prev) => ({ ...prev, feeEarnerLevelCode: val }));
                  setPage(0);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink/60 uppercase tracking-wider pl-1">Effective Year</label>
              <input aria-label="Effective Year"
                type="number"
                placeholder="e.g. 2024"
                value={rateHistoryFilters.effectiveYear}
                onChange={(e) => {
                  setRateHistoryFilters((prev) => ({ ...prev, effectiveYear: e.target.value }));
                  setPage(0);
                }}
                className="px-5 py-2.5 bg-surface border border-border rounded-full text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>
        )}

        {activeTab === "market-benchmarks" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <Select
                label="Practice Area"
                placeholder="All Areas"
                options={[{ value: "", label: "All Areas" }, ...areas.map((a) => ({ value: a.code, label: a.name }))]}
                value={benchmarksFilters.practiceAreaCode}
                onChange={(val) => {
                  setBenchmarksFilters((prev) => ({ ...prev, practiceAreaCode: val }));
                  setPage(0);
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink/60 uppercase tracking-wider pl-1">Jurisdiction</label>
              <input aria-label="Jurisdiction"
                type="text"
                placeholder="e.g. New York, UK"
                value={benchmarksFilters.jurisdiction}
                onChange={(e) => {
                  setBenchmarksFilters((prev) => ({ ...prev, jurisdiction: e.target.value }));
                  setPage(0);
                }}
                className="px-5 py-2.5 bg-surface border border-border rounded-full text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-ink/60 uppercase tracking-wider pl-1">Survey Year</label>
              <input aria-label="Survey Year"
                type="number"
                placeholder="e.g. 2023"
                value={benchmarksFilters.surveyYear}
                onChange={(e) => {
                  setBenchmarksFilters((prev) => ({ ...prev, surveyYear: e.target.value }));
                  setPage(0);
                }}
                className="px-5 py-2.5 bg-surface border border-border rounded-full text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Records Table Grid */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200/50 text-red-700 text-xs font-bold rounded-2xl">
          {error}
        </div>
      )}

      <div className="bg-surface border border-border/60 rounded-3xl overflow-hidden shadow-sm shrink-0">
        <div className="overflow-x-auto rates-scrollable">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-field">
              {activeTab === "past-matters" && (
                <tr>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Matter Ref</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Title</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Practice Area</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Client Type</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Total Fee</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Pricing Model</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Outcome</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">EndDate</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Complexity</th>
                </tr>
              )}

              {activeTab === "time-entries" && (
                <tr>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Matter Ref</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Fee Earner</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Level</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Hours</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Task Description</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Entry Date</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Billed Rate</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Billed Amount</th>
                </tr>
              )}

              {activeTab === "billing-history" && (
                <tr>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Matter Ref</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Client</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Invoice Number</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Invoice Date</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Total Amount</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Paid Amount</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Outstanding</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Status</th>
                </tr>
              )}

              {activeTab === "rate-card-history" && (
                <tr>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Rate Card Name</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Fee Earner Level</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Practice Area</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Hourly Rate</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Currency</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Effective Year</th>
                </tr>
              )}

              {activeTab === "market-benchmarks" && (
                <tr>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Source</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Practice Area</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Jurisdiction</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Level</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Low Rate</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Median Rate</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">High Rate</th>
                  <th className="px-5 py-4 text-left font-bold text-ink/60 uppercase tracking-wider">Survey Year</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-gray-100 font-semibold text-ink/80">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse bg-field/20">
                    <td colSpan={10} className="px-5 py-4 text-center">
                      <div className="h-4 bg-field rounded w-5/6 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-ink/60">
                    No extracted historical records detected for this search query.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.uid} className="hover:bg-field/30 transition-colors">
                    {/* Past Matters Columns */}
                    {activeTab === "past-matters" && (
                      <>
                        <td className="px-5 py-4 text-ink font-extrabold">{rec.matterReference}</td>
                        <td className="px-5 py-4 max-w-[200px] truncate">{rec.title}</td>
                        <td className="px-5 py-4">{rec.practiceAreaCode}</td>
                        <td className="px-5 py-4">{rec.clientType}</td>
                        <td className="px-5 py-4 text-ink">{formatCurrency(rec.totalFee)}</td>
                        <td className="px-5 py-4">{rec.pricingModel}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                              rec.outcome === "WON"
                                ? "bg-hover text-ink/80 border-border"
                                : rec.outcome === "LOST"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {rec.outcome}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {rec.matterEndDate ? new Date(rec.matterEndDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded border text-[10px] font-bold ${
                              rec.complexity === "HIGH"
                                ? "bg-red-50 border-red-100 text-red-700"
                                : rec.complexity === "MEDIUM"
                                ? "bg-amber-50 border-amber-100 text-amber-700"
                                : "bg-slate-50 border-slate-100 text-slate-700"
                            }`}
                          >
                            {rec.complexity}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Time Entries Columns */}
                    {activeTab === "time-entries" && (
                      <>
                        <td className="px-5 py-4 text-ink font-extrabold">{rec.matterReference}</td>
                        <td className="px-5 py-4">{rec.feeEarnerName}</td>
                        <td className="px-5 py-4">{rec.feeEarnerLevelCode}</td>
                        <td className="px-5 py-4 text-ink">{rec.hours} hrs</td>
                        <td className="px-5 py-4 max-w-[220px] truncate" title={rec.taskDescription}>
                          {rec.taskDescription || "N/A"}
                        </td>
                        <td className="px-5 py-4">{new Date(rec.entryDate).toLocaleDateString()}</td>
                        <td className="px-5 py-4">{formatCurrency(rec.billedRate)}</td>
                        <td className="px-5 py-4 text-ink font-extrabold">{formatCurrency(rec.billedAmount)}</td>
                      </>
                    )}

                    {/* Billing History Columns */}
                    {activeTab === "billing-history" && (
                      <>
                        <td className="px-5 py-4 text-ink font-extrabold">{rec.matterReference}</td>
                        <td className="px-5 py-4">{rec.clientName}</td>
                        <td className="px-5 py-4 text-ink">{rec.invoiceNumber}</td>
                        <td className="px-5 py-4">{new Date(rec.invoiceDate).toLocaleDateString()}</td>
                        <td className="px-5 py-4 text-ink">{formatCurrency(rec.totalAmount)}</td>
                        <td className="px-5 py-4 text-ink/70">{formatCurrency(rec.paidAmount)}</td>
                        <td className="px-5 py-4 text-red-600 dark:text-red-400">{formatCurrency(rec.outstandingAmount)}</td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                              rec.status === "PAID"
                                ? "bg-hover text-ink/80 border-border/40"
                                : "bg-amber-50 text-amber-700 border-amber-200/60"
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                      </>
                    )}

                    {/* Rate Card History Columns */}
                    {activeTab === "rate-card-history" && (
                      <>
                        <td className="px-5 py-4 text-ink font-extrabold">{rec.rateCardName}</td>
                        <td className="px-5 py-4">{rec.feeEarnerLevelCode}</td>
                        <td className="px-5 py-4">{rec.practiceAreaCode}</td>
                        <td className="px-5 py-4 text-ink font-extrabold">
                          {formatCurrency(rec.hourlyRate, rec.currency)}
                        </td>
                        <td className="px-5 py-4">{rec.currency}</td>
                        <td className="px-5 py-4 text-ink">{rec.effectiveYear}</td>
                      </>
                    )}

                    {/* Market Benchmarks Columns */}
                    {activeTab === "market-benchmarks" && (
                      <>
                        <td className="px-5 py-4 text-ink font-extrabold">{rec.source}</td>
                        <td className="px-5 py-4">{rec.practiceAreaCode}</td>
                        <td className="px-5 py-4">{rec.jurisdiction}</td>
                        <td className="px-5 py-4">{rec.feeEarnerLevelCode}</td>
                        <td className="px-5 py-4 text-ink/60">{formatCurrency(rec.lowRate, rec.currency)}</td>
                        <td className="px-5 py-4 text-ink font-extrabold">{formatCurrency(rec.medianRate, rec.currency)}</td>
                        <td className="px-5 py-4 text-ink/60">{formatCurrency(rec.highRate, rec.currency)}</td>
                        <td className="px-5 py-4 text-ink">{rec.surveyYear}</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controller */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-center shrink-0">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
