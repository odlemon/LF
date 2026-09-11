/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useRateCardEntries, usePracticeAreas, useFeeEarnerLevels } from "../hooks/useFirm";
import { RateCard } from "../types";
import { HiTrash, HiX, HiPlus } from "react-icons/hi";
import { Select } from "@/components/ui/Select";
import { AuditTrailPanel } from "@/components/shared/AuditTrailPanel";
import { FormError } from "@/components/ui/FormError";

interface RateCardEntriesSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  rateCard: RateCard | null;
}

export function RateCardEntriesSlideOver({
  isOpen,
  onClose,
  rateCard,
}: RateCardEntriesSlideOverProps) {
  const { entries, isLoading, addEntry, deleteEntry } = useRateCardEntries(rateCard?.uid || "");
  const { areas } = usePracticeAreas();
  const { levels } = useFeeEarnerLevels();

  const [feeEarnerLevelUid, setFeeEarnerLevelUid] = useState("");
  const [practiceAreaUid, setPracticeAreaUid] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (levels.length > 0) {
      setFeeEarnerLevelUid(levels[0].uid);
    } else {
      setFeeEarnerLevelUid("");
    }
    setPracticeAreaUid("");
    setHourlyRate("");
    setFormError(null);
  }, [isOpen, levels]);

  if (!isOpen || !rateCard) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeEarnerLevelUid || !hourlyRate) {
      setFormError("Fee earner level and hourly rate are required.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      await addEntry({
        feeEarnerLevelUid,
        practiceAreaUid: practiceAreaUid || null,
        hourlyRate: Number(hourlyRate),
        currency: rateCard.currency,
      });
      setHourlyRate("");
    } catch (err: any) {
      setFormError(err.message || "Failed to add rate entry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLevelName = (uid: string) => {
    return levels.find((l) => l.uid === uid)?.name || uid;
  };

  const getAreaName = (uid?: string | null) => {
    if (!uid) return "All practice areas";
    return areas.find((a) => a.uid === uid)?.name || uid;
  };

  const isCardReadOnly = rateCard.status === "ARCHIVED";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity animate-fade-in flex justify-end">
      <div className="w-full max-w-lg bg-surface h-full shadow-2xl flex flex-col transition-transform duration-300 translate-x-0">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-ink/60 uppercase tracking-wider block mb-1">
              Rate Card Entries ({rateCard.currency})
            </span>
            <h3 className="text-lg font-bold text-ink leading-tight">
              {rateCard.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-ink/60 hover:text-ink/65 rounded-lg hover:bg-field transition-colors"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 rates-scrollable flex flex-col gap-6">
          <div>
            <h4 className="text-xs font-bold text-ink/80 uppercase tracking-wider mb-3">
              Existing Rates
            </h4>
            {isLoading ? (
              <div className="flex flex-col gap-3">
                <div className="h-10 bg-field rounded-xl animate-pulse" />
                <div className="h-10 bg-field rounded-xl animate-pulse" />
                <div className="h-10 bg-field rounded-xl animate-pulse" />
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8 bg-field rounded-xl border border-dashed border-border text-sm text-ink/60">
                No rates added to this card yet.
              </div>
            ) : (
              <div className="bg-surface border border-border/60 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto rates-scrollable">
                  <table className="w-full text-left text-sm border-collapse">

                    <thead>
                      <tr className="bg-field text-xs font-bold text-ink/65 border-b border-border/60">
                        <th className="px-4 py-3">Level</th>
                        <th className="px-4 py-3">Practice Area</th>
                        <th className="px-4 py-3 text-right">Rate</th>
                        {!isCardReadOnly && <th className="px-4 py-3 text-center w-12"></th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {entries.map((entry) => (
                        <tr key={entry.uid} className="hover:bg-field/50 text-ink transition-colors">
                          <td className="px-4 py-3 font-medium">{getLevelName(entry.feeEarnerLevelUid)}</td>
                          <td className="px-4 py-3 text-ink/65 text-xs">{getAreaName(entry.practiceAreaUid)}</td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {rateCard.currency === "GBP" ? "£" : rateCard.currency === "USD" ? "$" : rateCard.currency === "EUR" ? "€" : `${rateCard.currency} `}
                            {entry.hourlyRate}
                          </td>
                          {!isCardReadOnly && (
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => deleteEntry(entry.uid)}
                                aria-label="Delete rate card entry"
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                              >
                                <HiTrash className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {!isCardReadOnly && (
            <div className="border-t border-border pt-6">
              <h4 className="text-xs font-bold text-ink/80 uppercase tracking-wider mb-4">
                Add New Rate Entry
              </h4>

              {formError && (
                <FormError message={formError} />
              )}

              <form onSubmit={handleAdd} className="flex flex-col gap-4 bg-field/50 border border-border p-4 rounded-2xl">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                    Seniority Level
                  </label>
                  <Select
                    value={feeEarnerLevelUid}
                    onChange={setFeeEarnerLevelUid}
                    options={levels.map((l) => ({ value: l.uid, label: l.name }))}
                    placeholder="Select seniority level..."
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                    Practice Area
                  </label>
                  <Select
                    value={practiceAreaUid}
                    onChange={setPracticeAreaUid}
                    options={[
                      { value: "", label: "All practice areas" },
                      ...areas.filter((a) => a.active).map((a) => ({ value: a.uid, label: a.name })),
                    ]}
                    placeholder="All practice areas"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                    Hourly Rate ({rateCard.currency})
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-ink/60 text-sm font-medium">
                      {rateCard.currency === "GBP" ? "£" : rateCard.currency === "USD" ? "$" : rateCard.currency === "EUR" ? "€" : rateCard.currency}
                    </span>
                    <input
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="e.g. 450"
                      min={0}
                      className="w-full pl-8 pr-5 py-2.5 bg-surface border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all text-ink font-semibold"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="mt-2"
                  disabled={levels.length === 0}
                  loading={isSubmitting}
                >
                  <HiPlus className="w-4 h-4" />
                  Add Rate
                </Button>
              </form>
            </div>
          )}

          {/* Activity History panel for this specific rate card */}
          <div className="border-t border-border pt-6">
            <AuditTrailPanel entityUid={rateCard.uid} title="Rate Card Activity History" />
          </div>
        </div>

        <div className="p-6 border-t border-border bg-field flex justify-end">
          <Button variant="secondary" className="px-6" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
