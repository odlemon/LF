"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api/client";
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

type FilterTab =
  | "all"
  | "PENDING_PARTNER"
  | "APPROVED"
  | "REJECTED"
  | "RETURNED_FOR_CORRECTION";

const TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "PENDING_PARTNER", label: "Pending" },
  { id: "RETURNED_FOR_CORRECTION", label: "Returned" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
];

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency || "GBP",
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
  const [tab, setTab] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (status: FilterTab) => {
    setLoading(true);
    setError(null);
    try {
      const params =
        status === "all" ? {} : { status };
      const res = await apiClient.get<ApprovalItem[]>(
        "/api/v1/pricing-approvals",
        { params }
      );
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Could not load approvals");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(tab);
  }, [load, tab]);

  const isPartner =
    (user?.roles || []).includes("PARTNER") &&
    !(user?.roles || []).includes("SUPER_ADMIN") &&
    !(user?.roles || []).includes("ADMIN");

  const counts = useMemo(() => {
    // Soft counts only meaningful on "all" load; otherwise show list length for active tab
    if (tab !== "all") {
      return { [tab]: items.length } as Record<string, number>;
    }
    const map: Record<string, number> = { all: items.length };
    for (const item of items) {
      map[item.status] = (map[item.status] || 0) + 1;
    }
    return map;
  }, [items, tab]);

  const emptyCopy =
    tab === "PENDING_PARTNER"
      ? {
          title: "Nothing waiting",
          body: "When a preferred scenario is submitted to you, it lands here.",
        }
      : tab === "APPROVED"
        ? {
            title: "No approvals yet",
            body: "Scenarios you approve will show up in this list.",
          }
        : tab === "REJECTED"
          ? {
              title: "No rejections",
              body: "Rejected scenarios assigned to you will appear here.",
            }
          : tab === "RETURNED_FOR_CORRECTION"
            ? {
                title: "Nothing returned",
                body: "Items you sent back for correction show here until resubmitted.",
              }
            : {
                title: "No approval history",
                body: "Assigned scenarios — pending, returned, approved, or rejected — will appear here.",
              };

  return (
    <div className="relative min-h-full">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 20% 0%, rgba(10,10,10,0.04), transparent 55%)",
        }}
      />
      <div className="relative p-5 sm:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 animate-fade-in">
        <header>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
            {isPartner ? "Your desk" : "Firm queue"}
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            Approvals
          </h1>
          <p className="mt-2 text-sm text-ink/50 max-w-xl leading-relaxed">
            {isPartner
              ? "Everything assigned to you — pending review, returned for correction, approved, and rejected."
              : "Firm-wide partner reviews across every status."}
          </p>
        </header>

        <div className="flex flex-wrap gap-1.5 border-b border-border/60 pb-1">
          {TABS.map((t) => {
            const count =
              t.id === "all"
                ? tab === "all"
                  ? items.length
                  : counts.all
                : tab === "all"
                  ? counts[t.id] || 0
                  : tab === t.id
                    ? items.length
                    : undefined;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-3.5 py-2 text-sm font-semibold rounded-t-lg transition-colors ${
                  tab === t.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-ink/55 hover:text-ink/90"
                }`}
              >
                {t.label}
                {typeof count === "number" && tab === "all" && (
                  <span className="ml-1.5 text-[11px] tabular-nums text-ink/35">
                    {count}
                  </span>
                )}
                {tab === t.id && t.id !== "all" && (
                  <span className="ml-1.5 text-[11px] tabular-nums text-ink/35">
                    {items.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl border border-border bg-surface animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border/70 bg-surface px-6 py-14 text-center">
            <p className="text-sm font-semibold text-ink/70">{emptyCopy.title}</p>
            <p className="mt-2 text-xs text-ink/40 max-w-sm mx-auto leading-relaxed">
              {emptyCopy.body}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => {
              const note =
                item.status === "RETURNED_FOR_CORRECTION"
                  ? item.returnComment || item.decisionComment
                  : item.decisionComment;
              return (
                <li key={item.scenarioUid}>
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/pricing-requests/${item.pricingRequestUid}/pricing?review=${item.scenarioUid}`
                      )
                    }
                    className="w-full text-left rounded-2xl border border-border/70 bg-surface p-5 hover:bg-hover/50 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <ScenarioStatusBadge status={item.status} size="sm" />
                          {!isPartner && item.assignedPartnerName && (
                            <span className="text-[11px] text-ink/40">
                              → {item.assignedPartnerName}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-ink tracking-tight">
                          {item.matterTitle}
                        </p>
                        <p className="mt-1 text-xs text-ink/45">
                          {item.scenarioName} ·{" "}
                          {item.pricingModel?.replace(/_/g, " ")}
                        </p>
                        <p className="mt-2 text-[11px] text-ink/35">
                          From {item.submittedByEmail || "team"}
                          {item.submittedAt
                            ? ` · submitted ${new Date(item.submittedAt).toLocaleString()}`
                            : ""}
                          {item.decidedAt
                            ? ` · decided ${new Date(item.decidedAt).toLocaleString()}`
                            : ""}
                        </p>
                        {note && (
                          <p className="mt-2 text-[12px] text-ink/55 line-clamp-2 leading-relaxed border-l-2 border-ink/15 pl-2.5">
                            {note}
                          </p>
                        )}
                      </div>
                      <div className="sm:text-right shrink-0">
                        <p className="text-base font-semibold text-ink tabular-nums">
                          {formatMoney(Number(item.grossFees), item.currency)}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-ink/40 tabular-nums">
                          {Number(item.marginPct).toFixed(1)}% margin
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
