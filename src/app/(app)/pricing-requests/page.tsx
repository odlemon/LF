"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HiPlus, HiOutlineDocumentText } from "react-icons/hi";
import toast from "react-hot-toast";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterBar } from "@/components/ui/FilterBar";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { PERMISSIONS } from "@/lib/utils/permissions";
import { usePricingRequests } from "@/modules/intake/hooks/useIntake";
import { IntakeStatusBadge } from "@/modules/intake/components/IntakeStatusBadge";
import { NewRequestModal } from "@/modules/intake/components/NewRequestModal";
import { PricingRequestStatus } from "@/modules/intake/types";
import { formatRelativeTime } from "@/lib/utils/format";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "SCOPE_GENERATED", label: "Scope Ready" },
  { value: "SCOPE_CONFIRMED", label: "Scope Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function PricingRequestsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<PricingRequestStatus | "">("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { requests, pagination, isLoading, error, createRequest } = usePricingRequests(
    status || undefined,
    page,
    search
  );

  const handleCreate = async (command: Parameters<typeof createRequest>[0]) => {
    const created = await createRequest(command);
    toast.success("Pricing request created");
    router.push(`/pricing-requests/${created.uid}`);
  };

  const handleClear = () => {
    setStatus("");
    setSearch("");
    setPage(0);
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
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

      <FilterBar
        search={{ value: search, onChange: (v) => { setSearch(v); setPage(0); }, placeholder: "Search title or client..." }}
        status={{
          value: status,
          onChange: (v) => { setStatus(v as PricingRequestStatus | ""); setPage(0); },
          options: STATUS_OPTIONS,
          placeholder: "All statuses",
        }}
        onClear={handleClear}
      />

      {error && <Alert variant="error" message={error} />}

      <div className="bg-surface rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto rates-scrollable">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-field/60 text-xs font-bold text-ink/60 border-b border-border">
                <th className="px-6 py-4.5">Title</th>
                <th className="px-6 py-4.5">Client</th>
                <th className="px-6 py-4.5">Practice area</th>
                <th className="px-6 py-4.5">Status</th>
                <th className="px-6 py-4.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <TableSkeleton columnWidths={["w-40", "w-28", "w-28", "w-20", "w-16"]} />
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10">
                    <EmptyState
                      title="No pricing requests found"
                      description="Start a new request to begin scoping a matter with AI, or clear your filters."
                      icon={<HiOutlineDocumentText className="w-5 h-5" />}
                    />
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req.uid}
                    onClick={() => router.push(`/pricing-requests/${req.uid}`)}
                    className="hover:bg-field/20 text-ink/90 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4.5 font-semibold text-ink">{req.matterTitle}</td>
                    <td className="px-6 py-4.5 text-ink/70">{req.clientName || "—"}</td>
                    <td className="px-6 py-4.5 text-ink/70">{req.practiceAreaName || "—"}</td>
                    <td className="px-6 py-4.5"><IntakeStatusBadge status={req.status} /></td>
                    <td className="px-6 py-4.5 text-ink/60 text-xs">{formatRelativeTime(req.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && requests.length > 0 && (
          <div className="px-6 pb-2 shrink-0">
            <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
