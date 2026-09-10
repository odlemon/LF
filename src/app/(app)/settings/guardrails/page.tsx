/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { useGuardrails } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { HiLockClosed, HiLockOpen, HiShieldCheck, HiXCircle, HiExclamation, HiCheckCircle } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";

export default function GuardrailsPage() {
  const { guardrails, isLoading, error, updateGuardrails } = useGuardrails();

  const [minMarginPct, setMinMarginPct] = useState(35);
  const [discountAutoMaxPct, setDiscountAutoMaxPct] = useState(8);
  const [discountPartnerMaxPct, setDiscountPartnerMaxPct] = useState(18);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (guardrails) {
      setMinMarginPct(guardrails.minMarginPct);
      setDiscountAutoMaxPct(guardrails.discountAutoMaxPct);
      setDiscountPartnerMaxPct(guardrails.discountPartnerMaxPct);
    }
  }, [guardrails]);

  if (isLoading && !guardrails) {
    return (
      <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-6 animate-pulse">
        <div className="h-6 bg-field w-1/4 rounded-lg" />
        <div className="h-48 bg-field rounded-2xl" />
        <div className="h-32 bg-field rounded-2xl" />
      </div>
    );
  }

  if (error && !guardrails) {
    return (
      <div className="p-8 max-w-5xl w-full mx-auto">
        <Alert variant="error" message={error} />
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (discountAutoMaxPct > discountPartnerMaxPct) {
      toast.error("Auto-approval discount cannot exceed partner-approval maximum discount.");
      return;
    }
    setIsSaving(true);
    try {
      await updateGuardrails({
        minMarginPct,
        discountAutoMaxPct,
        discountPartnerMaxPct,
      });
      toast.success("Firm pricing guardrails saved.");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update guardrails.");
    } finally {
      setIsSaving(false);
    }
  };

  const rejectLimit = minMarginPct;
  const warningLimit = minMarginPct + 10;

  const inputStyles = (active: boolean) =>
    `w-full px-5 py-2.5 border rounded-full text-sm font-semibold transition-all duration-200 ${
      active
        ? "bg-surface border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink cursor-text"
        : "bg-field/60 border-border/50 text-ink/70 cursor-not-allowed select-none"
    }`;

  return (
    <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Pricing Guardrails</h1>
        <p className="text-sm text-ink/60 mt-1">
          Configure safety parameters, automatic bid validation thresholds, and discount controls.
        </p>
      </div>

      {/* Concept Explanation Banner */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/[0.02] to-transparent border border-primary/10 rounded-2xl p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <HiShieldCheck className="w-5.5 h-5.5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink">What are Pricing Guardrails?</h2>
          <p className="text-xs text-ink/60 mt-1.5 leading-relaxed">
            Guardrails are firm-wide safety limits rather than a user-defined list. When budgeting a new matter, the system automatically checks your proposed profit margins and discounts against these policy thresholds to determine the required approval level (Auto-Approved, Partner Review, or Pricing Committee).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Policy Configuration Form */}
        <form onSubmit={handleSave} className="bg-surface rounded-2xl border border-border/60 shadow-sm p-6 lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="text-sm font-bold text-ink flex items-center gap-1.5">
              <HiShieldCheck className="w-5 h-5 text-primary" />
              Pricing Policy Thresholds
            </h2>
            
            {/* Master Lock/Unlock Toggles */}
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-ink/70 bg-field hover:bg-canvas border border-border/60 transition-all cursor-pointer select-none"
              >
                <HiLockClosed className="w-3.5 h-3.5 text-ink/60" />
                <span>Locked (Read-Only)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (guardrails) {
                    setMinMarginPct(guardrails.minMarginPct);
                    setDiscountAutoMaxPct(guardrails.discountAutoMaxPct);
                    setDiscountPartnerMaxPct(guardrails.discountPartnerMaxPct);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/40 transition-all cursor-pointer select-none"
              >
                <HiLockOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Settings Unlocked</span>
              </button>
            )}
          </div>

          {/* Margin Protection Card */}
          <div className="p-5 bg-field/40 rounded-2xl border border-border flex flex-col gap-4">
            <h3 className="text-xs font-bold text-ink/90 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Margin Guardrails</span>
              <span className="text-[9px] font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded-lg normal-case">
                Protects Profitability
              </span>
            </h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80">
                Minimum Target Profit Margin (%)
              </label>
              <div className="relative">
                <input aria-label="Minimum Target Profit Margin (%)"
                  type="number"
                  value={minMarginPct}
                  onChange={(e) => setMinMarginPct(Number(e.target.value))}
                  min={0}
                  max={100}
                  disabled={!isEditing}
                  className={inputStyles(isEditing)}
                  required
                />
                <span className="absolute right-4 top-2.5 text-ink/60 font-medium">%</span>
              </div>
              <span className="text-[10px] text-ink/60 leading-normal">
                Bids falling below this margin threshold are unprofitable and trigger automatic rejection tags.
              </span>
            </div>
          </div>

          {/* Discount Authority Protection Card */}
          <div className="p-5 bg-field/40 rounded-2xl border border-border flex flex-col gap-4">
            <h3 className="text-xs font-bold text-ink/90 uppercase tracking-wider flex items-center gap-1.5">
              <span>2. Discount Authority Guardrails</span>
              <span className="text-[9px] font-extrabold text-primary bg-primary/5 px-2 py-0.5 rounded-lg normal-case">
                Determines Approvals
              </span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink/80">
                  Auto-Approval Max Discount (%)
                </label>
                <div className="relative">
                  <input aria-label="Auto-Approval Max Discount (%)"
                    type="number"
                    value={discountAutoMaxPct}
                    onChange={(e) => setDiscountAutoMaxPct(Number(e.target.value))}
                    min={0}
                    max={100}
                    disabled={!isEditing}
                    className={inputStyles(isEditing)}
                    required
                  />
                  <span className="absolute right-4 top-2.5 text-ink/60 font-medium">%</span>
                </div>
                <span className="text-[10px] text-ink/60 leading-normal">
                  Maximum discount allowed without oversight.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-ink/80">
                  Partner-Approval Max Discount (%)
                </label>
                <div className="relative">
                  <input aria-label="Partner-Approval Max Discount (%)"
                    type="number"
                    value={discountPartnerMaxPct}
                    onChange={(e) => setDiscountPartnerMaxPct(Number(e.target.value))}
                    min={0}
                    max={100}
                    disabled={!isEditing}
                    className={inputStyles(isEditing)}
                    required
                  />
                  <span className="absolute right-4 top-2.5 text-ink/60 font-medium">%</span>
                </div>
                <span className="text-[10px] text-ink/60 leading-normal">
                  Maximum discount a partner can authorize.
                </span>
              </div>
            </div>

            {/* Live Interactive Escalation Path Preview */}
            <div className="bg-surface rounded-xl border border-border p-4 mt-2">
              <span className="text-[10px] font-extrabold text-ink/60 uppercase tracking-widest block mb-3">
                Live Escalation Path Simulation
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 bg-hover/20 border border-border rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-ink/80 bg-hover self-start px-2 py-0.5 rounded-lg uppercase tracking-wider">
                    Auto-Approve
                  </span>
                  <span className="text-[13px] font-extrabold text-ink mt-1">0% to {discountAutoMaxPct}%</span>
                  <span className="text-[10px] text-ink/60 leading-normal mt-0.5">Cleared instantly without additional oversight.</span>
                </div>
                
                <div className="p-3.5 bg-amber-50/20 border border-amber-100 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 self-start px-2 py-0.5 rounded-lg uppercase tracking-wider">
                    Partner Sign-Off
                  </span>
                  <span className="text-[13px] font-extrabold text-ink mt-1">{discountAutoMaxPct}% to {discountPartnerMaxPct}%</span>
                  <span className="text-[10px] text-ink/60 leading-normal mt-0.5">Requires partner authorization to onboard.</span>
                </div>

                <div className="p-3.5 bg-purple-50/20 border border-purple-100 rounded-2xl flex flex-col gap-1">
                  <span className="text-[9px] font-extrabold text-purple-700 bg-purple-50 self-start px-2 py-0.5 rounded-lg uppercase tracking-wider">
                    Committee Review
                  </span>
                  <span className="text-[13px] font-extrabold text-ink mt-1">Above {discountPartnerMaxPct}%</span>
                  <span className="text-[10px] text-ink/60 leading-normal mt-0.5">Requires global Pricing Committee review.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Committee Review Approver
            </label>
            <div className="relative">
              <input aria-label="Committee Review Approver"
                type="text"
                value="COMMITTEE"
                disabled
                className="w-full pl-5 pr-10 py-2.5 bg-canvas border border-border rounded-full text-sm text-ink/60 font-bold tracking-wider cursor-not-allowed select-none"
              />
              <HiLockClosed className="absolute right-4 top-3.5 text-ink/60 w-4 h-4" />
            </div>
            <span className="text-[10px] text-ink/60">
              Discounts exceeding partner limits require global Pricing Committee approval (system-locked).
            </span>
          </div>

          {/* Form Actions with smooth height unlock */}
          <div
            className={`flex justify-end gap-3 pt-4 border-t border-border transition-all duration-300 ${
              isEditing ? "opacity-100 max-h-20" : "opacity-0 max-h-0 overflow-hidden"
            }`}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditing(false);
                if (guardrails) {
                  setMinMarginPct(guardrails.minMarginPct);
                  setDiscountAutoMaxPct(guardrails.discountAutoMaxPct);
                  setDiscountPartnerMaxPct(guardrails.discountPartnerMaxPct);
                }
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSaving}>
              Save Guardrails
            </Button>
          </div>
        </form>

        {/* Real-time Simulator Panel */}
        <div className="bg-surface rounded-2xl border border-border/60 shadow-sm p-6 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-ink/80 uppercase tracking-wider">
            Real-time Policy Simulator
          </h3>
          
          <div className="flex flex-col gap-6 mt-1">
            {/* Visual Gauge Bar */}
            <div className="h-4 w-full rounded-full bg-canvas overflow-hidden flex shadow-inner border border-border/30">
              <div
                style={{ width: `${rejectLimit}%` }}
                className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300"
              />
              <div
                style={{ width: `${warningLimit - rejectLimit}%` }}
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-300"
              />
              <div
                style={{ width: `${100 - warningLimit}%` }}
                className="h-full bg-gradient-to-r from-primary/50 to-primary transition-all duration-300"
              />
            </div>

            <div className="flex flex-col gap-3">
              {/* Reject card */}
              <div className="p-4 bg-red-50/40 border border-red-100/60 rounded-2xl flex gap-3">
                <HiXCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold text-red-800 uppercase tracking-wide dark:text-red-400">Auto-Reject Zone</span>
                  <span className="text-xs font-bold text-ink mt-0.5">Margins 0% to {rejectLimit}%</span>
                  <span className="text-[10px] text-ink/60 mt-0.5 leading-normal">
                    Matter proposals falling below this minimum are automatically flagged as unprofitable and blocked.
                  </span>
                </div>
              </div>

              {/* Warning card */}
              <div className="p-4 bg-amber-50/40 border border-amber-100/60 rounded-2xl flex gap-3">
                <HiExclamation className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wide dark:text-amber-400">Partner Oversight Zone</span>
                  <span className="text-xs font-bold text-ink mt-0.5">Margins {rejectLimit}% to {warningLimit}%</span>
                  <span className="text-[10px] text-ink/60 mt-0.5 leading-normal">
                    Bids trigger partner-level margin validation and review warnings before matter onboarding.
                  </span>
                </div>
              </div>

              {/* Safe card */}
              <div className="p-4 bg-hover/40 border border-border/60 rounded-2xl flex gap-3">
                <HiCheckCircle className="w-5 h-5 text-ink/60 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold text-ink uppercase tracking-wide">Safe Approval Zone</span>
                  <span className="text-xs font-bold text-ink mt-0.5">Margins above {warningLimit}%</span>
                  <span className="text-[10px] text-ink/60 mt-0.5 leading-normal">
                    Matter qualifies for standard profit margins. Approved instantly without additional margin review.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
