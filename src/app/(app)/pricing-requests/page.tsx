"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HiPlus } from "react-icons/hi";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { PERMISSIONS } from "@/lib/utils/permissions";
import { usePricingRequests, ListFilterTab } from "@/modules/intake/hooks/useIntake";
import { PricingRequestCard } from "@/modules/intake/components/PricingRequestCard";
import { NewRequestModal } from "@/modules/intake/components/NewRequestModal";
import { getClient } from "@/lib/api/modules/firm.api";

const TABS: { id: ListFilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "in_progress", label: "In Progress" },
  { id: "scope_confirmed", label: "Scope Confirmed" },
  { id: "cancelled", label: "Cancelled" },
];

export default function PricingRequestsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ListFilterTab>("all");
  const [page] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientNames, setClientNames] = useState<Record<string, string>>({});

  const { requests, isLoading, error, createRequest } = usePricingRequests(activeTab, page);

  useEffect(() => {
    const loadNames = async () => {
      const map: Record<string, string> = {};
      await Promise.all(
        requests.map(async (req) => {
          if (req.clientName) {
            map[req.uid] = req.clientName;
            return;
          }
          try {
            const client = await getClient(req.clientProfileUid);
            map[req.uid] = client.name;
          } catch {
            map[req.uid] = "—";
          }
        })
      );
      setClientNames(map);
    };
    if (requests.length > 0) loadNames();
  }, [requests]);

  const handleCreate = async (command: Parameters<typeof createRequest>[0]) => {
    const created = await createRequest(command);
    toast.success("Pricing request created");
    router.push(`/pricing-requests/${created.uid}`);
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pricing Requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            Scope matters with AI-assisted conversational intake.
          </p>
        </div>
        <PermissionGate permission={PERMISSIONS.REQUEST_CREATE}>
          <Button variant="primary" onClick={() => setIsModalOpen(true)} className="self-start sm:self-center">
            <HiPlus className="w-4 h-4" />
            New Request
          </Button>
        </PermissionGate>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200/60 pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col gap-3 animate-pulse">
          <div className="h-28 bg-gray-200 rounded-2xl" />
          <div className="h-28 bg-gray-200 rounded-2xl" />
          <div className="h-28 bg-gray-200 rounded-2xl" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No pricing requests yet"
          description="Start a new request to begin scoping a matter with AI."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <PricingRequestCard
              key={req.uid}
              request={req}
              clientName={clientNames[req.uid]}
            />
          ))}
        </div>
      )}

      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
