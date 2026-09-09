"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HiPlus } from "react-icons/hi";
import toast from "react-hot-toast";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tabs } from "@/components/ui/Tabs";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { PERMISSIONS } from "@/lib/utils/permissions";
import { usePricingRequests, ListFilterTab } from "@/modules/intake/hooks/useIntake";
import { PricingRequestCard } from "@/modules/intake/components/PricingRequestCard";
import { NewRequestModal } from "@/modules/intake/components/NewRequestModal";

const TABS: { id: ListFilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "in_progress", label: "In Progress" },
  { id: "scope_confirmed", label: "Scope Confirmed" },
  { id: "cancelled", label: "Cancelled" },
];

function PricingRequestCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border/60 p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="h-5 bg-field rounded-md w-2/3" />
        <div className="h-6 bg-field rounded-full w-24 shrink-0" />
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <div className="h-3.5 bg-field rounded w-1/2" />
        <div className="h-3.5 bg-field rounded w-2/5" />
      </div>
      <div className="h-3 bg-field rounded w-16 mt-4" />
    </div>
  );
}

export default function PricingRequestsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ListFilterTab>("all");
  const [page] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { requests, isLoading, error, createRequest } = usePricingRequests(activeTab, page);

  const handleCreate = async (command: Parameters<typeof createRequest>[0]) => {
    const created = await createRequest(command);
    toast.success("Pricing request created");
    router.push(`/pricing-requests/${created.uid}`);
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Pricing Requests</h1>
          <p className="text-sm text-ink/55 mt-1">
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

      <Tabs tabs={TABS} activeId={activeTab} onChange={setActiveTab} />

      {error && <Alert variant="error" message={error} />}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PricingRequestCardSkeleton key={i} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No pricing requests yet"
          description="Start a new request to begin scoping a matter with AI."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((req) => (
            <PricingRequestCard key={req.uid} request={req} />
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
