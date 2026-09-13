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
    <div className="relative flex items-center gap-4 py-4 pl-4 animate-pulse">
      <div className="absolute inset-y-2.5 left-0 w-[3px] rounded-full bg-field" />
      <div className="h-9 w-9 shrink-0 rounded-full bg-field" />
      <div className="min-w-0 flex-1 flex flex-col gap-2">
        <div className="h-4 w-2/5 rounded bg-field" />
        <div className="h-3 w-1/3 rounded bg-field" />
      </div>
      <div className="h-5 w-20 shrink-0 rounded-lg bg-field" />
    </div>
  );
}

/**
 * Today / Yesterday / This week / Earlier — Linear-style recency grouping.
 * Mirrors formatRelativeTime's own elapsed-hours day count exactly (not a calendar-
 * day-boundary calculation) so a row's own "Yesterday"/"3 days ago" text can never
 * land in a section header that says something else.
 */
function recencyBucket(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffMs < 0 || diffDays < 1) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return "This week";
  return "Earlier";
}

const BUCKET_ORDER = ["Today", "Yesterday", "This week", "Earlier"];

export default function PricingRequestsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ListFilterTab>("all");
  const [page] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { requests, isLoading, error, createRequest } = usePricingRequests(activeTab, page);

  const groups = BUCKET_ORDER.map((label) => ({
    label,
    items: requests.filter((r) => recencyBucket(r.createdAt) === label),
  })).filter((g) => g.items.length > 0);
  let rowIndex = 0;

  const handleCreate = async (command: Parameters<typeof createRequest>[0]) => {
    const created = await createRequest(command);
    toast.success("Pricing request created");
    router.push(`/pricing-requests/${created.uid}`);
  };

  return (
    <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/60">Intake</p>
          <h1 className="mt-1 text-2xl font-bold text-ink tracking-tight">Pricing Requests</h1>
          <p className="text-sm text-ink/60 mt-1">
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
        <div className="divide-y divide-border/40 border-y border-border/50">
          {Array.from({ length: 5 }).map((_, i) => (
            <PricingRequestCardSkeleton key={i} />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No pricing requests yet"
          description="Start a new request to begin scoping a matter with AI."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink/40">
                {group.label}
              </p>
              <div className="divide-y divide-border/40 border-y border-border/50">
                {group.items.map((req) => {
                  const delay = Math.min(rowIndex++, 10) * 30;
                  return (
                    <PricingRequestCard
                      key={req.uid}
                      request={req}
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  );
                })}
              </div>
            </div>
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
