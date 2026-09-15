"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineScale } from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/ui/FilterBar";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";
import * as negotiationApi from "@/modules/negotiation/api";
import { NegotiationStatusBadge } from "@/modules/negotiation/components/NegotiationStatusBadge";
import type { NegotiationListItem } from "@/modules/negotiation/types";
import { formatMoney } from "@/modules/negotiation/utils";
import {
  PortalAtmosphere,
  PortalPageHeader,
} from "@/modules/client-portal/PortalChrome";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "NEGOTIATING", label: "Negotiating" },
  { value: "CLIENT_APPROVED", label: "Agreed" },
  { value: "CLIENT_REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

const PAGE_SIZE = 10;

export default function NegotiationsPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<NegotiationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (statusFilter: string, opts?: { soft?: boolean }) => {
    if (!opts?.soft) setLoading(true);
    setError(null);
    try {
      const list = await negotiationApi.listNegotiations(statusFilter || undefined);
      setItems(list);
    } catch {
      setError("Could not load negotiations");
      if (!opts?.soft) setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(status, { soft: items.length > 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when status changes
  }, [load, status]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((item) => {
      if (
        term &&
        !item.matterTitle?.toLowerCase().includes(term) &&
        !item.clientName?.toLowerCase().includes(term)
      ) {
        return false;
      }
      if (dateFrom && (!item.sentAt || item.sentAt < dateFrom)) return false;
      if (dateTo && (!item.sentAt || item.sentAt > `${dateTo}T23:59:59`)) return false;
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
    <PortalAtmosphere>
      <div className="mx-auto w-full max-w-[1400px] space-y-6 px-5 py-6 sm:px-8 sm:py-8 animate-fade-in">
        <PortalPageHeader
          eyebrow="Commercial"
          title="Negotiations"
          description="Live fee proposals with clients — advisor, counters, margin, and history in one workspace."
        />

        <FilterBar
          search={{ value: search, onChange: (v) => { setSearch(v); setPage(0); }, placeholder: "Search matter or client..." }}
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

        {error && items.length === 0 && (
          <div className="rounded-[2rem] border border-red-200/70 bg-red-50/50 px-5 py-8 text-center">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            <Button variant="secondary" className="mt-3" onClick={() => void load(status)}>
              Retry
            </Button>
          </div>
        )}

        <div className="bg-surface rounded-[2rem] border border-border/60 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto rates-scrollable">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-field/60 text-xs font-bold text-ink/60 border-b border-border">
                  <th className="px-6 py-4.5">Matter</th>
                  <th className="px-6 py-4.5">Client</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5">Round</th>
                  <th className="px-6 py-4.5 text-right">Latest fees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading && items.length === 0 ? (
                  <TableSkeleton columnWidths={["w-40", "w-28", "w-20", "w-12", "w-20"]} />
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10">
                      <EmptyState
                        title="No negotiations yet"
                        description="After a partner approves a scenario, open Pricing and choose Send to client — then it lands here."
                        icon={<HiOutlineScale className="w-5 h-5" />}
                      />
                    </td>
                  </tr>
                ) : (
                  pageItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => router.push(`/negotiations/${item.id}`)}
                      className="hover:bg-field/20 text-ink/90 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4.5 font-semibold text-ink">
                        {item.matterTitle || "Untitled matter"}
                      </td>
                      <td className="px-6 py-4.5 text-ink/70">{item.clientName || "Client"}</td>
                      <td className="px-6 py-4.5">
                        <NegotiationStatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-4.5 text-ink/70 tabular-nums">
                        {item.currentRound != null ? item.currentRound : "—"}
                      </td>
                      <td className="px-6 py-4.5 text-right font-semibold tabular-nums">
                        {formatMoney(item.latestGrossFees, item.currency || "USD")}
                      </td>
                    </tr>
                  ))
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
    </PortalAtmosphere>
  );
}
