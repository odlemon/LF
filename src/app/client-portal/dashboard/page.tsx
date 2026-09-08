"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineSparkles,
} from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import { useClientAuth } from "@/hooks/useClientAuth";
import * as negotiationApi from "@/modules/negotiation/api";
import { NegotiationStatusBadge } from "@/modules/negotiation/components/NegotiationStatusBadge";
import type { NegotiationListItem } from "@/modules/negotiation/types";
import { formatMoney, isOpenStatus } from "@/modules/negotiation/utils";
import {
  daysUntil,
  formatDate,
  relativeTime,
} from "@/modules/client-portal/format";
import {
  PortalAtmosphere,
  PortalPageHeader,
} from "@/modules/client-portal/PortalChrome";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function ClientDashboardPage() {
  const { user } = useClientAuth();
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

  const currency = items[0]?.currency || "GBP";
  const open = useMemo(() => items.filter((i) => isOpenStatus(i.status)), [items]);
  const agreed = useMemo(
    () => items.filter((i) => i.status === "CLIENT_APPROVED"),
    [items]
  );
  const openValue = open.reduce((s, i) => s + (Number(i.latestGrossFees) || 0), 0);
  const agreedValue = agreed.reduce((s, i) => s + (Number(i.latestGrossFees) || 0), 0);
  const totalValue = items.reduce((s, i) => s + (Number(i.latestGrossFees) || 0), 0);

  const statusMix = useMemo(() => {
    const buckets = [
      { key: "open", label: "Open", count: open.length, color: "bg-amber-500" },
      { key: "agreed", label: "Agreed", count: agreed.length, color: "bg-emerald-500" },
      {
        key: "closed",
        label: "Closed",
        count: items.filter((i) =>
          ["CLIENT_REJECTED", "WITHDRAWN"].includes(i.status)
        ).length,
        color: "bg-ink/25",
      },
    ];
    const max = Math.max(1, ...buckets.map((b) => b.count));
    return buckets.map((b) => ({ ...b, pct: (b.count / max) * 100 }));
  }, [items, open.length, agreed.length]);

  const firstName =
    (user?.contactName || "").split(/[\s@]/)[0] ||
    (user?.email || "").split("@")[0] ||
    "there";
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const actionRequired = useMemo(
    () =>
      [...open].sort((a, b) => {
        const da = a.responseDeadline ? new Date(a.responseDeadline).getTime() : Infinity;
        const db = b.responseDeadline ? new Date(b.responseDeadline).getTime() : Infinity;
        return da - db;
      }),
    [open]
  );

  const recent = useMemo(
    () =>
      [...items]
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.sentAt || 0).getTime() -
            new Date(a.updatedAt || a.sentAt || 0).getTime()
        )
        .slice(0, 6),
    [items]
  );

  return (
    <PortalAtmosphere>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-7 px-5 py-6 sm:px-8 sm:py-8 animate-fade-in">
        <PortalPageHeader
          eyebrow={`${user?.clientName || "Client portal"} · ${today}`}
          title={`${greetingForHour(new Date().getHours())}, ${firstName}`}
          description="Your fee proposals, negotiations, and agreed rates — with Lysp coaching when you need a counter."
          action={
            <Button
              variant="cta"
              onClick={() => router.push("/client-portal/negotiations")}
            >
              Open proposals
              <HiOutlineArrowRight className="h-4 w-4" />
            </Button>
          }
        />

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {[
            {
              label: "Awaiting you",
              value: String(open.length),
              delta: open.length ? formatMoney(openValue, currency) : "Inbox clear",
              positive: open.length === 0,
            },
            {
              label: "Agreed value",
              value: formatMoney(agreedValue, currency),
              delta: `${agreed.length} matter${agreed.length === 1 ? "" : "s"}`,
              positive: true,
            },
            {
              label: "Book under review",
              value: formatMoney(totalValue, currency),
              delta: `${items.length} total proposals`,
              positive: true,
            },
            {
              label: "Avg. rounds",
              value:
                items.length === 0
                  ? "—"
                  : (
                      items.reduce((s, i) => s + (i.currentRound || 0), 0) /
                      items.length
                    ).toFixed(1),
              delta: "Negotiation depth",
              positive: true,
            },
          ].map((kpi, i) => (
            <article
              key={kpi.label}
              className="rounded-2xl border border-border/70 bg-surface p-4 sm:p-5 animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
                {kpi.label}
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-ink tabular-nums sm:text-2xl">
                {loading ? "…" : kpi.value}
              </p>
              <p
                className={`mt-1.5 text-[11px] font-semibold ${
                  kpi.positive
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {kpi.delta}
              </p>
            </article>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <section className="xl:col-span-7 rounded-[1.5rem] border border-border/70 bg-surface p-5 sm:p-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                  Action required
                </p>
                <h2 className="mt-1 text-base font-semibold tracking-tight text-ink">
                  Proposals that need your response
                </h2>
              </div>
              <HiOutlineClock className="h-5 w-5 text-amber-500/80" />
            </div>

            {loading ? (
              <div className="mt-5 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-field" />
                ))}
              </div>
            ) : actionRequired.length === 0 ? (
              <div className="mt-8 flex flex-col items-center py-6 text-center">
                <HiOutlineCheckCircle className="h-8 w-8 text-emerald-500" />
                <p className="mt-3 text-sm font-semibold text-ink/75">You&apos;re clear</p>
                <p className="mt-1 max-w-sm text-xs text-ink/45">
                  When the firm sends a new fee proposal, it appears here with a deadline and one-click path into the rate coach.
                </p>
              </div>
            ) : (
              <ul className="mt-5 space-y-3">
                {actionRequired.map((item) => {
                  const days = daysUntil(item.responseDeadline);
                  const overdue = days !== null && days < 0;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/client-portal/negotiations/${item.id}`)
                        }
                        className="group flex w-full flex-col gap-3 rounded-2xl border border-border/60 bg-canvas/50 p-4 text-left transition-all hover:border-ink/20 hover:bg-canvas sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-ink group-hover:underline">
                              {item.matterTitle || "Fee proposal"}
                            </p>
                            <NegotiationStatusBadge status={item.status} />
                          </div>
                          <p className="mt-1 text-xs text-ink/45">
                            Received {formatDate(item.sentAt)}
                            {item.responseDeadline
                              ? overdue
                                ? ` · overdue ${Math.abs(days!)}d`
                                : ` · due in ${days}d`
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                          <p className="text-base font-semibold tabular-nums text-ink">
                            {formatMoney(item.latestGrossFees, item.currency || currency)}
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                            Open workspace
                            <HiOutlineArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="xl:col-span-5 flex flex-col gap-5">
            <div className="rounded-[1.5rem] border border-border/70 bg-surface p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                Portfolio mix
              </p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-ink">
                Where matters stand
              </h2>
              <div className="mt-5 space-y-4">
                {statusMix.map((b) => (
                  <div key={b.key}>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="font-semibold text-ink/70">{b.label}</span>
                      <span className="tabular-nums text-ink/45">{b.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-field">
                      <div
                        className={`h-full rounded-full ${b.color} transition-all duration-700`}
                        style={{ width: `${loading ? 0 : b.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-surface p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <HiOutlineSparkles className="h-4 w-4 text-ink/45" />
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                  Rate coach
                </p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                Open any proposal to work with Lysp side-by-side — explain the card, shape a counter, and draft your reply without guessing.
              </p>
              <button
                type="button"
                onClick={() => router.push("/client-portal/negotiations")}
                className="mt-4 text-xs font-semibold text-primary hover:underline"
              >
                Browse proposals →
              </button>
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-surface">
          <div className="flex items-end justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                Recent activity
              </p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-ink">
                Latest proposals
              </h2>
            </div>
            <button
              type="button"
              onClick={() => router.push("/client-portal/matters")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Full history
            </button>
          </div>
          {loading ? (
            <div className="h-40 animate-pulse bg-field/40" />
          ) : recent.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-ink/45">
              No proposals yet.
            </p>
          ) : (
            <ul className="divide-y divide-border/50">
              {recent.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/client-portal/negotiations/${item.id}`)
                    }
                    className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-hover/50 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {item.matterTitle || "Fee proposal"}
                      </p>
                      <p className="mt-0.5 text-xs text-ink/40">
                        Updated {relativeTime(item.updatedAt || item.sentAt)}
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
