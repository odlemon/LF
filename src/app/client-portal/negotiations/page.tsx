"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineSearch, HiOutlineSparkles } from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import * as negotiationApi from "@/modules/negotiation/api";
import { NegotiationStatusBadge } from "@/modules/negotiation/components/NegotiationStatusBadge";
import type { NegotiationListItem } from "@/modules/negotiation/types";
import { formatMoney, isOpenStatus } from "@/modules/negotiation/utils";
import { daysUntil, formatDate } from "@/modules/client-portal/format";
import {
  PortalAtmosphere,
  PortalPageHeader,
} from "@/modules/client-portal/PortalChrome";

type FilterKey = "all" | "awaiting" | "agreed" | "closed";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "awaiting", label: "Awaiting" },
  { key: "agreed", label: "Agreed" },
  { key: "closed", label: "Closed" },
];

function matchesFilter(item: NegotiationListItem, filter: FilterKey) {
  if (filter === "awaiting") return isOpenStatus(item.status);
  if (filter === "agreed") return item.status === "CLIENT_APPROVED";
  if (filter === "closed")
    return ["CLIENT_REJECTED", "WITHDRAWN"].includes(item.status);
  return true;
}

export default function PortalNegotiationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NegotiationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await negotiationApi.listPortalNegotiations());
    } catch {
      setError("Could not load proposals");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const c = { all: items.length, awaiting: 0, agreed: 0, closed: 0 };
    for (const item of items) {
      if (isOpenStatus(item.status)) c.awaiting += 1;
      else if (item.status === "CLIENT_APPROVED") c.agreed += 1;
      else if (["CLIENT_REJECTED", "WITHDRAWN"].includes(item.status)) c.closed += 1;
    }
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((i) => matchesFilter(i, filter))
      .filter(
        (i) =>
          !q ||
          (i.matterTitle || "").toLowerCase().includes(q) ||
          (i.id || "").toLowerCase().includes(q)
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.sentAt || 0).getTime() -
          new Date(a.updatedAt || a.sentAt || 0).getTime()
      );
  }, [items, filter, query]);

  return (
    <PortalAtmosphere>
      <div className="mx-auto w-full max-w-5xl space-y-6 px-5 py-6 sm:px-8 sm:py-8 animate-fade-in">
        <PortalPageHeader
          eyebrow="Proposals"
          title="Fee proposals"
          description="Open a proposal to work with the rate coach — explain the card, shape a counter, and reply with confidence."
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-ink text-canvas shadow-sm"
                      : "bg-surface text-ink/60 ring-1 ring-border/70 hover:text-ink"
                  }`}
                >
                  {f.label}
                  <span className="tabular-nums opacity-70">{counts[f.key]}</span>
                </button>
              );
            })}
          </div>
          <div className="relative ml-auto">
            <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search proposals"
              placeholder="Search…"
              className="w-52 rounded-full border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-[1.25rem] border border-border bg-surface" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-[1.25rem] border border-red-200/70 bg-red-50/40 px-5 py-10 text-center">
            <p className="text-sm text-red-800">{error}</p>
            <Button variant="secondary" className="mt-3" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[1.25rem] border border-border/70 bg-surface px-5 py-16 text-center">
            <p className="text-sm font-semibold text-ink/75">
              {items.length === 0 ? "No proposals yet" : "Nothing matches"}
            </p>
            <p className="mt-1.5 text-xs text-ink/45">
              {items.length === 0
                ? "When the firm sends a fee proposal, it lands here."
                : "Try another filter or search."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, idx) => {
              const days = daysUntil(item.responseDeadline);
              const overdue = isOpenStatus(item.status) && days !== null && days < 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => router.push(`/client-portal/negotiations/${item.id}`)}
                  className="group w-full rounded-[1.25rem] border border-border/70 bg-surface p-5 text-left shadow-sm transition-all hover:border-ink/20 hover:shadow-md animate-fade-in-up"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-semibold text-ink group-hover:underline">
                          {item.matterTitle || "Fee proposal"}
                        </p>
                        <NegotiationStatusBadge status={item.status} />
                      </div>
                      <p className="mt-1.5 text-xs text-ink/45">
                        Received {formatDate(item.sentAt)}
                        {item.responseDeadline && isOpenStatus(item.status)
                          ? overdue
                            ? ` · overdue since ${formatDate(item.responseDeadline)}`
                            : ` · respond by ${formatDate(item.responseDeadline)}`
                          : ""}
                        {(item.currentRound ?? 0) > 1
                          ? ` · round ${item.currentRound}`
                          : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold tabular-nums text-ink">
                        {formatMoney(item.latestGrossFees, item.currency || "GBP")}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                        <HiOutlineSparkles className="h-3.5 w-3.5" />
                        Open workspace
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </PortalAtmosphere>
  );
}
