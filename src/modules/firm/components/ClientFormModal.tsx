/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ClientProfile } from "../types";
import { HiX } from "react-icons/hi";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/ui/FormError";

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<any>;
  client?: ClientProfile | null;
}

export function ClientFormModal({
  isOpen,
  onClose,
  onSave,
  client,
}: ClientFormModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"CORPORATE" | "INDIVIDUAL" | "GOVERNMENT" | "FINANCIAL_INSTITUTION">("CORPORATE");
  const [tier, setTier] = useState<"STANDARD" | "PREFERRED" | "STRATEGIC">("STANDARD");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [country, setCountry] = useState("GB");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setType(client.type);
      setTier(client.tier);
      setContactName(client.contactName);
      setContactEmail(client.contactEmail);
      setCountry(client.country);
    } else {
      setName("");
      setType("CORPORATE");
      setTier("STANDARD");
      setContactName("");
      setContactEmail("");
      setCountry("GB");
    }
    setModalError(null);
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactName.trim() || !contactEmail.trim() || !country.trim()) {
      setModalError("Name, contact name, email, and country are required.");
      return;
    }
    setIsSubmitting(true);
    setModalError(null);
    try {
      await onSave({
        name,
        type,
        tier,
        contactName,
        contactEmail,
        country,
      });
      onClose();
    } catch (err: any) {
      setModalError(err.message || "Failed to save client profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-fade-in-up z-50 border border-border">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-ink/40 hover:text-ink/65 p-1 rounded-lg hover:bg-field transition-colors"
        >
          <HiX className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-ink mb-4 pr-8">
          {client ? "Edit Client Profile" : "Add Client"}
        </h3>

        {modalError && (
          <FormError message={modalError} />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Client Name
            </label>
            <input aria-label="Client Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. AstraZeneca Plc"
              className="px-5 py-2.5 bg-field border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-ink"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Type
              </label>
              <Select
                value={type}
                onChange={(val) => setType(val as any)}
                options={[
                  { value: "CORPORATE", label: "Corporate" },
                  { value: "INDIVIDUAL", label: "Individual" },
                  { value: "GOVERNMENT", label: "Government" },
                  { value: "FINANCIAL_INSTITUTION", label: "Financial Institution" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Tier
              </label>
              <Select
                value={tier}
                onChange={(val) => setTier(val as any)}
                options={[
                  { value: "STANDARD", label: "Standard" },
                  { value: "PREFERRED", label: "Preferred" },
                  { value: "STRATEGIC", label: "Strategic" },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Contact Name
              </label>
              <input aria-label="Contact Name"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="px-5 py-2.5 bg-field border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-ink"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
                Country (ISO)
              </label>
              <Select
                value={country}
                onChange={setCountry}
                options={[
                  { value: "GB", label: "United Kingdom (GB)" },
                  { value: "US", label: "United States (US)" },
                  { value: "DE", label: "Germany (DE)" },
                  { value: "FR", label: "France (FR)" },
                  { value: "ZA", label: "South Africa (ZA)" },
                  { value: "AU", label: "Australia (AU)" },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
              Contact Email
            </label>
            <input aria-label="Contact Email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="e.g. contact@client.com"
              className="px-5 py-2.5 bg-field border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all text-ink"
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
