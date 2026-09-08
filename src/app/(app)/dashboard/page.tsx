"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  FeesTrendChart,
  MarginWinRateChart,
  PipelineStagesChart,
  PracticeMixChart,
} from "@/modules/dashboard/charts";
import { useFirmDashboard } from "@/modules/dashboard/useFirmDashboard";
import { HiOutlineArrowRight, HiOutlineScale } from "react-icons/hi";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.firstName || "there";
  const greeting = greetingForHour(new Date().getHours());
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const roles = user?.roles || [];
  const isPartner =
    roles.includes("PARTNER") &&
    !roles.includes("ADMIN") &&
    !roles.includes("SUPER_ADMIN");

  const { data, loading, error } = useFirmDashboard();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink/15 border-t-ink/60" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-[1400px] flex-col items-center justify-center gap-2 px-5 text-center">
        <p className="text-sm font-semibold text-ink/70">Firm overview unavailable</p>
        <p className="max-w-sm text-sm text-ink/45">{error}</p>
      </div>
    );
  }

  const { kpis, trend, stages, practices, liveMatters, snapshot, firmName, currency } = data;
  // Says what the figures are, and when. It used to read "Live overview - demo data" on a
  // screen that was exactly that.
  const asOf = data.hasData
    ? `Live · ${currency} · year to date`
    : "No priced matters yet";

  return (
    <div className="relative min-h-full pb-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          background:
            "radial-gradient(ellipse 70% 40% at 15% 0%, rgba(10,10,10,0.05), transparent 55%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-5 pt-6 sm:gap-7 sm:px-8 sm:pt-8 animate-fade-in">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">
              {firmName} · {today}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {greeting}, {firstName}
            </h1>
            <p className="mt-1.5 text-sm text-ink/50">
              {isPartner
                ? "Your client relationships, approvals, and live rate negotiations."
                : "Firm overview — everything in motion across pricing and BD."}
            </p>
          </div>
          <p className="shrink-0 text-[11px] font-semibold text-ink/35">{asOf}</p>
        </header>

        {isPartner && (
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Link
              href="/negotiations"
              className="group flex items-start gap-4 rounded-[1.5rem] border border-border/70 bg-surface p-5 transition-colors hover:border-ink/20"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-canvas">
                <HiOutlineScale className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
                  Rate negotiations
                </p>
                <h2 className="mt-1 text-base font-semibold tracking-tight text-ink">
                  Advise, counter, and close with clients
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/50">
                  Open live proposals, use the negotiation advisor, and protect
                  margin while you keep the relationship warm.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ink transition-all group-hover:gap-2">
                  Open negotiations
                  <HiOutlineArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
            <Link
              href="/approvals"
              className="group flex items-start gap-4 rounded-[1.5rem] border border-border/70 bg-field/80 p-5 transition-colors hover:border-ink/20"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
                  Pricing approvals
                </p>
                <h2 className="mt-1 text-base font-semibold tracking-tight text-ink">
                  Scenarios waiting on your decision
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/50">
                  Review preferred scenarios before they go out as client fee
                  proposals.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-ink transition-all group-hover:gap-2">
                  Open approvals
                  <HiOutlineArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          </section>
        )}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {kpis.map((kpi, i) => (
            <article
              key={kpi.id}
              className="rounded-2xl border border-border/70 bg-surface p-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <p className="text-[10px] font-bold uppercase leading-tight tracking-[0.11em] text-ink/35">
                {kpi.label}
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-ink tabular-nums sm:text-2xl">
                {kpi.value}
              </p>
              <p
                className={`mt-1.5 text-[11px] font-semibold ${
                  kpi.delta === null
                    ? "text-ink/30"
                    : kpi.positive
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-amber-700 dark:text-amber-400"
                }`}
              >
                {kpi.delta ?? "no prior period"}
              </p>
              <p className="mt-1 text-[10px] leading-snug text-ink/35">{kpi.caption}</p>
            </article>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-12">
          <section className="rounded-[1.5rem] border border-border/70 bg-surface p-5 sm:p-6 xl:col-span-7">
            <FeesTrendChart data={trend} />
          </section>
          <section className="rounded-[1.5rem] border border-border/70 bg-surface p-5 sm:p-6 xl:col-span-5">
            <MarginWinRateChart data={trend} />
          </section>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-12">
          <section className="rounded-[1.5rem] border border-border/70 bg-surface p-5 sm:p-6 xl:col-span-5">
            <PipelineStagesChart data={stages} />
          </section>
          <section className="rounded-[1.5rem] border border-border/70 bg-surface p-5 sm:p-6 xl:col-span-7">
            <PracticeMixChart data={practices} />
          </section>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
          <section className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-surface lg:col-span-8">
            <div className="flex items-end justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                  Live book
                </p>
                <h2 className="mt-1 text-base font-semibold tracking-tight text-ink">
                  Matters moving across the firm
                </h2>
              </div>
              <span className="text-[11px] font-semibold tabular-nums text-ink/35">
                {liveMatters.length} highlighted
              </span>
            </div>
            <div className="overflow-x-auto rates-scrollable">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-border/50 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
                    <th className="px-5 py-3 font-bold sm:px-6">Matter</th>
                    <th className="px-3 py-3 font-bold">Stage</th>
                    <th className="px-3 py-3 font-bold">Value</th>
                    <th className="px-3 py-3 font-bold">Owner</th>
                    <th className="px-5 py-3 text-right font-bold sm:px-6">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {liveMatters.map((m) => (
                    <tr key={m.id} className="transition-colors hover:bg-hover/60">
                      <td className="px-5 py-3.5 sm:px-6">
                        <p className="text-sm font-semibold tracking-tight text-ink">
                          {m.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink/40">{m.client}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="inline-flex rounded-md bg-field px-2 py-1 text-[11px] font-semibold text-ink/65">
                          {m.stage}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-sm font-semibold tabular-nums text-ink">
                        {m.value}
                      </td>
                      <td className="px-3 py-3.5 text-xs text-ink/55">{m.owner}</td>
                      <td className="px-5 py-3.5 text-right text-[11px] text-ink/35 sm:px-6">
                        {m.updated}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-border/70 bg-field/70 p-5 sm:p-6 lg:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
              This week
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-ink">
              Operating snapshot
            </h2>
            <dl className="mt-5 space-y-3.5">
              {(
                [
                  ["Open pricing requests", String(snapshot.openRequests)],
                  ["Awaiting partner", String(snapshot.awaitingPartner)],
                  ["Scenarios generated", String(snapshot.scenariosThisWeek)],
                  ["Partner decisions", String(snapshot.approvalsThisWeek)],
                  ["First-pass accept", snapshot.firstPassAccept],
                  ["Comps used in pricing", String(snapshot.compsUsed)],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-3 last:border-0 last:pb-0"
                >
                  <dt className="text-xs font-medium text-ink/50">{label}</dt>
                  <dd className="text-sm font-semibold tabular-nums text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[11px] leading-relaxed text-ink/35">
              Deep cuts by matter, client, and discount land in Analytics — this
              page stays the firm-wide pulse.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
