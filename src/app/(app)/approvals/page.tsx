"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api/client";
import { FilterBar } from "@/components/ui/FilterBar";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { ScenarioStatusBadge } from "@/modules/pricing/components/ScenarioStatusBadge";

type ApprovalItem = {
  scenarioUid: string;
  pricingRequestUid: string;
  matterTitle: string;
  scenarioName: string;
  pricingModel: string;
  currency: string;
  grossFees: number;
  marginPct: number;
  submittedByEmail?: string | null;
  assignedPartnerName?: string | null;
  submittedAt?: string | null;
  status: string;
  decisionComment?: string | null;
  returnComment?: string | null;
  decidedAt?: string | null;
  decidedByEmail?: string | null;
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending (any stage)" },
  { value: "PENDING_PARTNER", label: "Pending partner" },
  { value: "PENDING_FINANCE", label: "Pending finance" },
  { value: "RETURNED_FOR_CORRECTION", label: "Returned for correction" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const PAGE_SIZE = 10;

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`;
  }
}

export default function ApprovalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (statusFilter: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await apiClient.get<ApprovalItem[]>("/api/v1/pricing-approvals", { params });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Could not load approvals");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(status);
  }, [load, status]);

  const isPartner =
    (user?.roles || []).includes("PARTNER") &&
    !(user?.roles || []).includes("SUPER_ADMIN") &&
    !(user?.roles || []).includes("ADMIN");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      if (term && !item.matterTitle?.toLowerCase().includes(term) && !item.scenarioName?.toLowerCase().includes(term)) {
        return false;
      }
      if (dateFrom && (!item.submittedAt || item.submittedAt < dateFrom)) return false;
      if (dateTo && (!item.submittedAt || item.submittedAt > `${dateTo}T23:59:59`)) return false;
      return true;
    });
  }, [items, search, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const handleClear = () => {
    setStatus("");
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
          {isPartner ? "Your desk" : "Firm queue"}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-ink tracking-tight">Approvals</h1>
        <p className="text-sm text-ink/60 mt-1 max-w-xl">
          {isPartner
            ? "Everything assigned to you — pending review, returned for correction, approved, and rejected."
            : "Firm-wide partner reviews across every status."}
        </p>
      </div>

      <FilterBar
        search={{ value: search, onChange: (v) => { setSearch(v); setPage(0); }, placeholder: "Search matter or scenario..." }}
        status={{
          value: status,
          onChange: (v) => { setStatus(v); setPage(0); },
          options: STATUS_OPTIONS,
          placeholder: "All statuses",
        }}
        dateFrom={{ value: dateFrom, onChange: (v) => { setDateFrom(v); setPage(0); } }}
        dateTo={{ value: dateTo, onChange: (v) => { setDateTo(v); setPage(0); } }}
        onClear={handleClear}
      />

      {error && <Alert variant="error" message={error} />}

      <div className="bg-surface rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto rates-scrollable">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-field/60 text-xs font-bold text-ink/60 border-b border-border">
                <th className="px-6 py-4.5">Matter</th>
                <th className="px-6 py-4.5">Scenario</th>
                <th className="px-6 py-4.5">Status</th>
                {!isPartner && <th className="px-6 py-4.5">Partner</th>}
                <th className="px-6 py-4.5">Submitted</th>
                <th className="px-6 py-4.5 text-right">Fees</th>
                <th className="px-6 py-4.5 text-right">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <TableSkeleton columnWidths={isPartner ? ["w-40", "w-28", "w-20", "w-24", "w-16", "w-16"] : ["w-40", "w-28", "w-20", "w-24", "w-24", "w-16", "w-16"]} />
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={isPartner ? 6 : 7} className="px-6 py-10">
                    <EmptyState
                      title="Nothing here"
                      description="Assigned scenarios — pending, returned, approved, or rejected — will appear here."
                      icon={<HiOutlineClipboardCheck className="w-5 h-5" />}
                    />
                  </td>
                </tr>
              ) : (
                pageItems.map((item) => {
                  const note =
                    item.status === "RETURNED_FOR_CORRECTION"
                      ? item.returnComment || item.decisionComment
                      : item.decisionComment;
                  return (
                    <tr
                      key={item.scenarioUid}
                      onClick={() =>
                        router.push(`/pricing-requests/${item.pricingRequestUid}/pricing?review=${item.scenarioUid}`)
                      }
                      className="hover:bg-field/20 text-ink/90 transition-colors cursor-pointer align-top"
                    >
                      <td className="px-6 py-4.5">
                        <p className="font-semibold text-ink">{item.matterTitle}</p>
                        {note && (
                          <p className="mt-1 text-[11px] text-ink/60 line-clamp-1 max-w-xs">{note}</p>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-ink/70 text-xs">
                        {item.scenarioName}
                        <br />
                        <span className="text-ink/50">{item.pricingModel?.replace(/_/g, " ")}</span>
                      </td>
                      <td className="px-6 py-4.5"><ScenarioStatusBadge status={item.status} size="sm" /></td>
                      {!isPartner && (
                        <td className="px-6 py-4.5 text-ink/70 text-xs">{item.assignedPartnerName || "—"}</td>
                      )}
                      <td className="px-6 py-4.5 text-ink/60 text-xs">
                        {item.submittedByEmail || "team"}
                        {item.submittedAt && (
                          <>
                            <br />
                            {new Date(item.submittedAt).toLocaleDateString()}
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-right font-semibold tabular-nums">
                        {formatMoney(Number(item.grossFees), item.currency)}
                      </td>
                      <td className="px-6 py-4.5 text-right text-ink/70 tabular-nums">
                        {Number(item.marginPct).toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && pageItems.length > 0 && (
          <div className="px-6 pb-2 shrink-0">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
