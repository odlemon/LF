/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { useFirmDetails } from "@/modules/firm/hooks/useFirm";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { Select } from "@/components/ui/Select";
import { HiLockClosed, HiLockOpen } from "react-icons/hi";

const COUNTRIES = [
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ZA", name: "South Africa" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
];

const TIMEZONES = [
  "Europe/London",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Europe/Paris",
  "Europe/Berlin",
  "Africa/Johannesburg",
  "Australia/Sydney",
];

export default function FirmDetailsPage() {
  const { firm, isLoading, error, updateFirm } = useFirmDetails();
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("GB");
  const [timezone, setTimezone] = useState("Europe/London");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (firm) {
      setName(firm.name);
      setCountry(firm.country);
      setTimezone(firm.timezone);
      setRegistrationNumber(firm.registrationNumber || "");
      setTaxId(firm.taxId || "");
      setAddress(firm.address || "");
      setPhoneNumber(firm.phoneNumber || "");
      setEmail(firm.email || "");
    }
  }, [firm]);

  if (isLoading && !firm) {
    return (
      <div className="p-8 max-w-3xl w-full mx-auto flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-field rounded-lg w-1/4" />
        <div className="bg-surface rounded-2xl shadow-sm p-6 border border-border flex flex-col gap-4">
          <div className="h-6 bg-field rounded-lg w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-canvas rounded-lg" />
            <div className="h-10 bg-canvas rounded-lg" />
          </div>
          <div className="h-20 bg-canvas rounded-lg" />
        </div>
      </div>
    );
  }

  if (error && !firm) {
    return (
      <div className="p-8 max-w-3xl w-full mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Firm Name is required.");
      return;
    }
    setIsSaving(true);
    try {
      await updateFirm({
        name,
        country,
        timezone,
        registrationNumber: registrationNumber.trim() || undefined,
        taxId: taxId.trim() || undefined,
        address: address.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        email: email.trim() || undefined,
      });
      toast.success("Firm details updated successfully.");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update firm details.");
    } finally {
      setIsSaving(false);
    }
  };

  const getCountryName = (code: string) => {
    return COUNTRIES.find((c) => c.code === code)?.name || code;
  };

  const inputStyles = (active: boolean) =>
    `w-full px-5 py-2.5 border rounded-full text-sm font-semibold transition-all duration-200 ${
      active
        ? "bg-surface border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink cursor-text"
        : "bg-field/60 border-border/50 text-ink/70 cursor-not-allowed select-none"
    }`;

  const textareaStyles = (active: boolean) =>
    `w-full px-5 py-2.5 border rounded-2xl text-sm font-semibold transition-all duration-200 resize-none ${
      active
        ? "bg-surface border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary text-ink cursor-text"
        : "bg-field/60 border-border/50 text-ink/70 cursor-not-allowed select-none"
    }`;

  return (
    <div className="p-8 max-w-3xl w-full mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Firm Settings</h1>
        <p className="text-sm text-ink/55 mt-1">Configure your enterprise firm profile, registration details, and localization parameters.</p>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-border/60 overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-ink">Firm Profile</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-hover text-ink/80 border border-border/20 uppercase tracking-wide">
              {firm?.status}
            </span>
          </div>
          
          {/* Master Lock/Unlock Toggles */}
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-ink/70 bg-field hover:bg-canvas border border-border/60 transition-all cursor-pointer select-none"
            >
              <HiLockClosed className="w-3.5 h-3.5 text-ink/55" />
              <span>Locked (Read-Only)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                if (firm) {
                  setName(firm.name);
                  setCountry(firm.country);
                  setTimezone(firm.timezone);
                  setRegistrationNumber(firm.registrationNumber || "");
                  setTaxId(firm.taxId || "");
                  setAddress(firm.address || "");
                  setPhoneNumber(firm.phoneNumber || "");
                  setEmail(firm.email || "");
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-250/20 transition-all cursor-pointer select-none"
            >
              <HiLockOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Settings Unlocked</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Firm Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isEditing}
                className={inputStyles(isEditing)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Country
              </label>
              <Select
                value={country}
                onChange={setCountry}
                disabled={!isEditing}
                options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Timezone
              </label>
              <Select
                value={timezone}
                onChange={setTimezone}
                disabled={!isEditing}
                options={TIMEZONES.map((tz) => ({ value: tz, label: tz }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Registration Number
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                disabled={!isEditing}
                className={inputStyles(isEditing)}
                placeholder="e.g. REG-12345"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Tax ID
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                disabled={!isEditing}
                className={inputStyles(isEditing)}
                placeholder="e.g. TAX-98765"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={!isEditing}
                className={inputStyles(isEditing)}
                placeholder="+44 20 7946 0958"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing}
                className={inputStyles(isEditing)}
                placeholder="info@firm.com"
              />
            </div>

            <div className="flex flex-col gap-1.5 col-span-2">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isEditing}
                className={textareaStyles(isEditing)}
                placeholder="100 Fleet St, London, EC4Y 1DE"
                rows={2}
              />
            </div>
          </div>

          {/* Form Actions with smooth height unlock */}
          <div
            className={`flex justify-end gap-3 mt-4 pt-4 border-t border-border transition-all duration-300 ${
              isEditing ? "opacity-100 max-h-20" : "opacity-0 max-h-0 overflow-hidden"
            }`}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditing(false);
                if (firm) {
                  setName(firm.name);
                  setCountry(firm.country);
                  setTimezone(firm.timezone);
                  setRegistrationNumber(firm.registrationNumber || "");
                  setTaxId(firm.taxId || "");
                  setAddress(firm.address || "");
                  setPhoneNumber(firm.phoneNumber || "");
                  setEmail(firm.email || "");
                }
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isSaving}>
              Save Details
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
