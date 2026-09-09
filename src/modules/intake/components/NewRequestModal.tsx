"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { PERMISSIONS } from "@/lib/utils/permissions";
import { ClientSearchSelect } from "./ClientSearchSelect";
import { listClients, getPracticeAreas, getRateCards } from "@/lib/api/modules/firm.api";
import { PracticeArea } from "@/modules/firm/types";
import { CreatePricingRequestCommand } from "../types";
import { ClientProfile } from "@/modules/firm/types";

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (command: CreatePricingRequestCommand) => Promise<void>;
}

export function NewRequestModal({ isOpen, onClose, onCreate }: NewRequestModalProps) {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientProfileUid, setClientProfileUid] = useState("");
  const [title, setTitle] = useState("");
  const [practiceAreaUid, setPracticeAreaUid] = useState("");
  const [officeCode, setOfficeCode] = useState("");
  const [offices, setOffices] = useState<string[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setClientProfileUid("");
    setTitle("");
    setPracticeAreaUid("");
    setOfficeCode("");
    setClientError(null);
    setTitleError(null);
    setSubmitError(null);

    const load = async () => {
      setClientsLoading(true);
      try {
        const [clientList, areas, rateCards] = await Promise.all([
          listClients({ size: 100, sort: "name,asc" }),
          getPracticeAreas(),
          getRateCards(),
        ]);
        setClients(clientList);
        setPracticeAreas(areas.filter((a) => a.active));
        setOffices(
          Array.from(new Set(rateCards.map((c) => c.officeCode).filter((o): o is string => !!o))).sort()
        );
      } catch {
        setSubmitError("Failed to load form data. Please try again.");
      } finally {
        setClientsLoading(false);
      }
    };
    load();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!clientProfileUid) {
      setClientError("Please select a client");
      valid = false;
    } else {
      setClientError(null);
    }
    if (!title.trim()) {
      setTitleError("Title is required");
      valid = false;
    } else {
      setTitleError(null);
    }
    if (!valid) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const command: CreatePricingRequestCommand = {
        clientProfileUid,
        title: title.trim(),
        ...(practiceAreaUid ? { practiceAreaUid } : {}),
        ...(officeCode ? { officeCode } : {}),
      };
      await onCreate(command);
      onClose();
    } catch (err: unknown) {
      const e = err as { message?: string; response?: { data?: { message?: string } } };
      setSubmitError(e.response?.data?.message || e.message || "Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitDisabled =
    isSubmitting || clientsLoading || clients.length === 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Pricing Request" size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {submitError && <Alert variant="error" message={submitError} />}

        <PermissionGate
          permission={PERMISSIONS.CLIENT_READ}
          fallback={
            <Alert
              variant="warning"
              message="You do not have permission to view clients. Contact your administrator."
            />
          }
        >
          {clientsLoading ? (
            <div className="flex flex-col gap-2 animate-pulse">
              <div className="h-4 w-24 bg-field rounded" />
              <div className="h-10 bg-field rounded-full" />
            </div>
          ) : clients.length === 0 ? (
            <div className="p-4 bg-field border border-border rounded-xl text-center">
              <p className="text-sm font-semibold text-ink/65">No clients available</p>
              <p className="text-xs text-ink/55 mt-1">
                Contact your administrator or use seed data in development.
              </p>
            </div>
          ) : (
            <ClientSearchSelect
              clients={clients}
              value={clientProfileUid}
              onChange={setClientProfileUid}
              isLoading={clientsLoading}
              error={clientError ?? undefined}
              disabled={isSubmitting}
            />
          )}
        </PermissionGate>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
            Title <span className="text-red-600 dark:text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Acquisition of XYZ Limited"
            disabled={isSubmitting || clientsLoading}
            className={`px-5 py-2.5 bg-field border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all text-ink font-semibold ${
              titleError ? "border-red-300" : "border-border"
            }`}
          />
          {titleError && (
            <span className="text-[10px] font-bold text-red-500 pl-1">{titleError}</span>
          )}
        </div>

        <Select
          label="Practice Area"
          value={practiceAreaUid}
          onChange={setPracticeAreaUid}
          placeholder="Select practice area (optional)"
          disabled={isSubmitting || clientsLoading}
          options={[
            { value: "", label: "Select practice area" },
            ...practiceAreas.map((a) => ({ value: a.uid, label: a.name })),
          ]}
        />

        {offices.length > 0 && (
          <Select
            label="Office"
            value={officeCode}
            onChange={setOfficeCode}
            placeholder="Firm default"
            disabled={isSubmitting || clientsLoading}
            options={[
              { value: "", label: "Firm default" },
              ...offices.map((o) => ({ value: o, label: o })),
            ]}
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting} disabled={submitDisabled}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
