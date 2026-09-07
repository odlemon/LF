"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as negotiationApi from "@/modules/negotiation/api";
import type { NegotiationListItem } from "@/modules/negotiation/types";
import { NegotiationStatusBadge } from "@/modules/negotiation/components/NegotiationStatusBadge";
import { formatMoney } from "@/modules/negotiation/utils";
import { formatDate, relativeTime } from "@/modules/client-portal/format";
import {
  PortalAtmosphere,
  PortalPageHeader,
} from "@/modules/client-portal/PortalChrome";

export default function ClientMatterHistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<NegotiationListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await negotiationApi.listPortalNegotiations());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.updatedAt || b.sentAt || 0).getTime() -
          new Date(a.updatedAt || a.sentAt || 0).getTime()
      ),
    [items]
  );

  const agreed = items.filter((i) => i.status === "CLIENT_APPROVED");
  const agreedValue = agreed.reduce((s, i) => s + (Number(i.latestGrossFees) || 0), 0);
  const currency = items[0]?.currency || "GBP";

  return (
    <PortalAtmosphere>
      <div className="mx-auto w-full max-w-5xl space-y-6 px-5 py-6 sm:px-8 sm:py-8 animate-fade-in">
        <PortalPageHeader
          eyebrow="Matter history"
          title="Proposals & outcomes"
          description="Full audit trail of fee conversations with the firm — every round, every decision."
        />

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Total matters", value: String(items.length) },
            { label: "Agreed", value: String(agreed.length) },
            { label: "Agreed value", value: formatMoney(agreedValue, currency) },
          ].map((k, i) => (
            <article
              key={k.label}
              className="rounded-2xl border border-border/70 bg-surface p-5 animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
                {k.label}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">
                {loading ? "…" : k.value}
              </p>
            </article>
          ))}
        </section>

        <section className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-surface shadow-sm">
          {loading ? (
            <div className="space-y-px">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 animate-pulse bg-field/40" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <p className="px-5 py-14 text-center text-sm text-ink/45">
              No history yet. Fee conversations will appear as they happen.
            </p>
          ) : (
            <ul className="divide-y divide-border/50">
              {sorted.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/client-portal/negotiations/${item.id}`)
                    }
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-hover/50 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {item.matterTitle || "Fee proposal"}
                      </p>
                      <p className="mt-0.5 text-xs text-ink/45">
                        Received {formatDate(item.sentAt)} · Updated{" "}
                        {relativeTime(item.updatedAt || item.sentAt)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                      {formatMoney(item.latestGrossFees, item.currency || currency)}
                    </span>
                    <NegotiationStatusBadge status={item.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PortalAtmosphere>
  );
}
