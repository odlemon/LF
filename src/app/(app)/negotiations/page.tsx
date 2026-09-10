"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import * as negotiationApi from "@/modules/negotiation/api";
import { NegotiationStatusBadge } from "@/modules/negotiation/components/NegotiationStatusBadge";
import type { NegotiationListItem } from "@/modules/negotiation/types";
import {
  formatMoney,
  negotiationStatusLabel,
} from "@/modules/negotiation/utils";
import {
  PortalAtmosphere,
  PortalPageHeader,
} from "@/modules/client-portal/PortalChrome";

type Tab = "all" | "SENT" | "NEGOTIATING" | "CLIENT_APPROVED" | "CLIENT_REJECTED";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "SENT", label: "Sent" },
  { id: "NEGOTIATING", label: "Negotiating" },
  { id: "CLIENT_APPROVED", label: "Agreed" },
  { id: "CLIENT_REJECTED", label: "Rejected" },
];

export default function NegotiationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const [items, setItems] = useState<NegotiationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (status: Tab, opts?: { soft?: boolean }) => {
    if (!opts?.soft) setLoading(true);
    setError(null);
    try {
      const list = await negotiationApi.listNegotiations(
        status === "all" ? undefined : status
      );
      setItems(list);
    } catch {
      setError("Could not load negotiations");
      if (!opts?.soft) setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(tab, { soft: items.length > 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when tab changes
  }, [load, tab]);

  return (
    <PortalAtmosphere>
      <div className="mx-auto w-full max-w-5xl space-y-6 px-5 py-6 sm:px-8 sm:py-8 animate-fade-in">
        <PortalPageHeader
          eyebrow="Commercial"
          title="Negotiations"
          description="Live fee proposals with clients — advisor, counters, margin, and history in one workspace."
        />

        <Tabs tabs={TABS} activeId={tab} onChange={setTab} />

        {loading && items.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-border bg-surface"
              />
            ))}
          </div>
        ) : error && items.length === 0 ? (
          <div className="rounded-2xl border border-red-200/70 bg-red-50/50 px-5 py-8 text-center">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            <Button
              variant="secondary"
              className="mt-3"
              onClick={() => void load(tab)}
            >
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[1.5rem] border border-border/70 bg-surface px-5 py-14 text-center">
            <p className="text-sm font-semibold text-ink">No negotiations yet</p>
            <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-ink/45">
              After a partner approves a scenario, open Pricing and choose Send to
              client — then it lands here for relationship-led negotiation.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40 border-y border-border/50">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => router.push(`/negotiations/${item.id}`)}
                className="flex w-full items-start justify-between gap-4 py-4 text-left transition-colors hover:bg-hover/40"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[15px] font-semibold tracking-tight text-ink">
                      {item.matterTitle || "Untitled matter"}
                    </p>
                    <NegotiationStatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-xs text-ink/45">
                    {item.clientName || "Client"}
                    {item.currentRound != null
                      ? ` · Round ${item.currentRound}`
                      : ""}
                    <span className="mx-1.5 text-ink/20">·</span>
                    {negotiationStatusLabel(item.status)}
                  </p>
                </div>
                <p className="shrink-0 text-[15px] font-semibold tabular-nums tracking-tight text-ink">
                  {formatMoney(item.latestGrossFees, item.currency || "GBP")}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </PortalAtmosphere>
  );
}
