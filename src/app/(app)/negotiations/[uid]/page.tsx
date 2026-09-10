"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  HiArrowLeft,
  HiOutlineChatAlt2,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import { AuditTrailPanel } from "@/components/shared/AuditTrailPanel";
import * as negotiationApi from "@/modules/negotiation/api";
import { FirmAdvisorWorkspace } from "@/modules/negotiation/components/FirmAdvisorWorkspace";
import { EngagementPackWorkspace } from "@/modules/negotiation/components/EngagementPackWorkspace";
import { NegotiationRoundTimeline } from "@/modules/negotiation/components/NegotiationRoundTimeline";
import { NegotiationStatusBadge } from "@/modules/negotiation/components/NegotiationStatusBadge";
import { OfferCompareRail } from "@/modules/negotiation/components/OfferCompareRail";
import { RateCardEditor } from "@/modules/negotiation/components/RateCardEditor";
import { RateIntelligencePanel } from "@/modules/negotiation/components/RateIntelligencePanel";
import { analyticsApi } from "@/lib/api/modules/analytics.api";
import type { NegotiationRateIntelligence } from "@/modules/analytics/types";
import type {
  EngagementPack,
  NegotiationDetail,
  RateLevelDraft,
} from "@/modules/negotiation/types";
import {
  aggregateRateLevels,
  commercialOffers,
  formatMoney,
  isOpenStatus,
  latestClientRound,
  latestCommercialOffer,
  latestRound,
  linesFromRateDrafts,
  openingOffer,
} from "@/modules/negotiation/utils";

type RailTab = "rates" | "history";

export default function NegotiationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;

  const [detail, setDetail] = useState<NegotiationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [comment, setComment] = useState("");
  const [drafts, setDrafts] = useState<RateLevelDraft[]>([]);
  const [mode, setMode] = useState<"view" | "counter">("view");
  const [rail, setRail] = useState<RailTab>("rates");
  const [mobilePane, setMobilePane] = useState<"advisor" | "rates">("advisor");
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [packOpen, setPackOpen] = useState(false);
  const [pack, setPack] = useState<EngagementPack | null>(null);
  const [rateIntelligence, setRateIntelligence] =
    useState<NegotiationRateIntelligence | null>(null);
  const [rateIntelligenceLoading, setRateIntelligenceLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    setRateIntelligenceLoading(true);
    analyticsApi
      .getNegotiationRateIntelligence(uid)
      .then((data) => {
        if (!cancelled) setRateIntelligence(data);
      })
      .catch(() => {
        // Analytics is supporting context, never a blocker: a user without ANALYTICS_READ,
        // or a firm with no history, simply sees the workspace without the panel.
        if (!cancelled) setRateIntelligence(null);
      })
      .finally(() => {
        if (!cancelled) setRateIntelligenceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const n = await negotiationApi.getNegotiation(uid);
      setDetail(n);
      const latest = latestCommercialOffer(n.rounds) || latestRound(n);
      setSelectedRoundId(latest?.id ?? null);
      setDrafts(aggregateRateLevels(latest?.lines || []));
      setMode("view");
      if (n.status === "CLIENT_APPROVED") {
        try {
          const p = await negotiationApi.getEngagementPack(uid);
          setPack(p);
        } catch {
          setPack(null);
        }
      } else {
        setPack(null);
      }
    } catch {
      if (!opts?.silent) setDetail(null);
      toast.error("Could not load negotiation");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void load();
  }, [load]);

  const last = useMemo(() => latestRound(detail), [detail]);
  const lastClient = useMemo(() => latestClientRound(detail), [detail]);
  const offers = useMemo(
    () => commercialOffers(detail?.rounds),
    [detail?.rounds]
  );
  const original = useMemo(
    () => openingOffer(detail?.rounds),
    [detail?.rounds]
  );
  const selectedOffer = useMemo(() => {
    if (!offers.length) return null;
    return offers.find((o) => o.id === selectedRoundId) || offers[offers.length - 1];
  }, [offers, selectedRoundId]);
  const open = isOpenStatus(detail?.status);
  const agreed = detail?.status === "CLIENT_APPROVED";
  const canAcceptClient =
    open && lastClient != null && last?.party === "CLIENT";
  const currency = detail?.currency || "GBP";

  const selectOffer = (roundId: string) => {
    if (mode === "counter") return;
    setSelectedRoundId(roundId);
    const offer = offers.find((o) => o.id === roundId);
    if (offer) setDrafts(aggregateRateLevels(offer.lines || []));
  };

  const compareAgainst = useMemo(() => {
    if (mode === "counter") {
      return aggregateRateLevels(selectedOffer?.lines || last?.lines || []);
    }
    if (!selectedOffer || !original || selectedOffer.id === original.id) {
      return null;
    }
    return aggregateRateLevels(original.lines || []);
  }, [mode, selectedOffer, original, last]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-ink" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-3">
        <p className="text-sm text-ink/60">Negotiation not found</p>
        <Button variant="secondary" onClick={() => router.push("/negotiations")}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col bg-canvas">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-surface/90 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-start gap-2.5">
          <button
            type="button"
            onClick={() => router.push("/negotiations")}
            className="mt-0.5 rounded-lg p-2 text-ink/60 hover:bg-hover hover:text-ink"
            aria-label="Back"
          >
            <HiArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-base font-semibold tracking-tight text-ink sm:text-lg">
                {detail.matterTitle || "Negotiation"}
              </h1>
              <NegotiationStatusBadge status={detail.status} />
            </div>
            <p className="mt-0.5 truncate text-xs text-ink/60">
              {detail.clientName}
              {detail.portalUserEmail ? ` · ${detail.portalUserEmail}` : ""}
              <span className="mx-1.5 text-ink/20">·</span>
              <span className="tabular-nums font-semibold text-ink/65">
                {formatMoney(detail.latestGrossFees, currency)}
              </span>
              {detail.latestMarginPct != null && (
                <span className="ml-1.5 tabular-nums text-ink/60">
                  {Number(detail.latestMarginPct).toFixed(1)}% margin
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-1 rounded-full border border-border/70 bg-field p-1 lg:hidden">
          {(
            [
              { id: "advisor" as const, label: "Advisor" },
              { id: "rates" as const, label: "Rates" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setMobilePane(t.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                mobilePane === t.id
                  ? "bg-ink text-canvas"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {agreed && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-ink px-4 py-3 text-canvas sm:px-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">
              Rates agreed — issue engagement pack
            </p>
            <p className="mt-0.5 text-xs text-canvas/55">
              {pack
                ? pack.status === "ACKNOWLEDGED"
                  ? "Client has acknowledged the engagement letter."
                  : pack.status === "SENT"
                    ? "Pack sent — awaiting client acknowledgment."
                    : "Draft ready to review and send."
                : "Generate a letter and annexed fee schedule from the locked rates."}
            </p>
          </div>
          <Button
            variant="cta"
            className="!bg-canvas !text-ink hover:!bg-canvas/90"
            onClick={() => setPackOpen(true)}
          >
            {pack ? "Open engagement pack" : "Generate engagement pack"}
          </Button>
        </div>
      )}

      <div className="grid min-h-0 flex-1 lg:grid-cols-12">
        <section
          className={`min-h-0 min-w-0 flex-col border-r border-border/60 bg-canvas lg:col-span-7 ${
            mobilePane === "advisor" ? "flex" : "hidden lg:flex"
          }`}
        >
          <FirmAdvisorWorkspace
            negotiationUid={uid}
            currency={currency}
            matterTitle={detail.matterTitle}
            open={open}
            onApplyRates={(lines) => {
              if (!last || !lines.length) return;
              const baseline = latestCommercialOffer(detail.rounds) || last;
              setSelectedRoundId(baseline?.id ?? null);
              setDrafts(
                aggregateRateLevels(
                  (baseline?.lines || last.lines).map((line) => {
                    const match = lines.find(
                      (x) =>
                        (x.feeEarnerLevelUid &&
                          x.feeEarnerLevelUid === line.feeEarnerLevelUid) ||
                        (x.feeEarnerLevelCode &&
                          x.feeEarnerLevelCode === line.feeEarnerLevelCode) ||
                        (x.feeEarnerLevelName &&
                          x.feeEarnerLevelName === line.feeEarnerLevelName)
                    );
                    return match
                      ? { ...line, hourlyRate: Number(match.hourlyRate) }
                      : line;
                  })
                )
              );
              setMode("counter");
              setRail("rates");
              setMobilePane("rates");
              toast.success("Rates applied to editor");
            }}
            onSubmitRates={async (lines) => {
              if (!last) return;
              setActing(true);
              try {
                const baseline = latestCommercialOffer(detail.rounds) || last;
                const baseLines = baseline?.lines || last.lines;
                const edited = aggregateRateLevels(
                  baseLines.map((line) => {
                    const match = lines.find(
                      (x) =>
                        (x.feeEarnerLevelUid &&
                          x.feeEarnerLevelUid === line.feeEarnerLevelUid) ||
                        (x.feeEarnerLevelCode &&
                          x.feeEarnerLevelCode === line.feeEarnerLevelCode) ||
                        (x.feeEarnerLevelName &&
                          x.feeEarnerLevelName === line.feeEarnerLevelName)
                    );
                    return match
                      ? { ...line, hourlyRate: Number(match.hourlyRate) }
                      : line;
                  })
                );
                await negotiationApi.firmCounter(uid, {
                  comment: comment || undefined,
                  lines: linesFromRateDrafts(baseLines, edited),
                });
                toast.success("Counter sent to client");
                setComment("");
                await load({ silent: true });
              } catch (err: unknown) {
                const e = err as {
                  response?: { data?: { message?: string } };
                  message?: string;
                };
                toast.error(
                  e.response?.data?.message ||
                    e.message ||
                    "Counter failed - rates may breach margin floor"
                );
                throw err;
              } finally {
                setActing(false);
              }
            }}
            onNegotiationUpdated={({ toolName } = {}) => {
              void load({ silent: true });
              if (toolName === "accept_client_counter") {
                toast.success("Client counter accepted");
              } else if (toolName === "submit_firm_counter") {
                toast.success("Counter sent to client");
              } else {
                toast.success("Negotiation updated");
              }
            }}
          />
        </section>

        <section
          className={`min-h-0 min-w-0 flex-col bg-surface lg:col-span-5 ${
            mobilePane === "rates" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="flex shrink-0 items-center gap-1 border-b border-border/60 px-4 py-2">
            {(
              [
                { id: "rates" as const, label: "Rate card", icon: HiOutlineDocumentText },
                { id: "history" as const, label: "History", icon: HiOutlineChatAlt2 },
              ] as const
            ).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setRail(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    rail === t.id
                      ? "bg-ink text-canvas"
                      : "text-ink/60 hover:bg-hover hover:text-ink"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="rates-scrollable min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {rail === "rates" ? (
              <div className="space-y-6 animate-fade-in">
                {detail.scopeSummary && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
                      Scope
                    </p>
                    <ul className="mt-3 space-y-3">
                      {detail.scopeSummary
                        .split(/\n+/)
                        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
                        .filter(Boolean)
                        .map((line) => {
                          const parts = line.split(/\s+[—–-]\s+/);
                          const title = parts[0];
                          const body = parts.slice(1).join(" — ");
                          return (
                            <li key={line} className="flex gap-3">
                              <span
                                aria-hidden
                                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/35"
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold tracking-tight text-ink">
                                  {title}
                                </p>
                                {body && (
                                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink/60">
                                    {body}
                                  </p>
                                )}
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                )}

                <div>
                  <OfferCompareRail
                    rounds={detail.rounds || []}
                    currency={currency}
                    viewer="FIRM"
                    selectedRoundId={selectedOffer?.id ?? null}
                    onSelect={selectOffer}
                    showMargin
                    partyLabels={{ FIRM: "Firm", CLIENT: "Client" }}
                  />

                  <div className="mt-6 mb-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
                        {mode === "counter" ? "Revised rates" : "Fee earner detail"}
                      </p>
                      {mode === "counter" && (
                        <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-ink">
                          {formatMoney(
                            drafts.reduce((s, d) => s + d.hours * d.hourlyRate, 0),
                            currency
                          )}
                        </p>
                      )}
                    </div>
                    {open && mode === "view" && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const baseline =
                            latestCommercialOffer(detail.rounds) || last;
                          setSelectedRoundId(baseline?.id ?? null);
                          setDrafts(aggregateRateLevels(baseline?.lines || []));
                          setMode("counter");
                        }}
                      >
                        Counter
                      </Button>
                    )}
                    {open && mode === "counter" && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setMode("view");
                          const offer =
                            offers.find((o) => o.id === selectedRoundId) ||
                            latestCommercialOffer(detail.rounds) ||
                            last;
                          setDrafts(aggregateRateLevels(offer?.lines || []));
                        }}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                  <RateCardEditor
                    currency={currency}
                    drafts={drafts}
                    editable={mode === "counter" && open}
                    onChange={setDrafts}
                    compareAgainst={compareAgainst}
                    compareLabel={
                      mode === "counter"
                        ? "Current"
                        : selectedOffer?.id === original?.id
                          ? "Opening"
                          : "Original"
                    }
                  />

                  <div className="mt-6">
                    <RateIntelligencePanel
                      intelligence={rateIntelligence}
                      isLoading={rateIntelligenceLoading}
                      drafts={drafts}
                      currency={currency}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 animate-fade-in">
                <NegotiationRoundTimeline
                  rounds={detail.rounds || []}
                  currency={currency}
                  partyLabels={{ FIRM: "Firm", CLIENT: "Client" }}
                  showMargin
                />
                <AuditTrailPanel
                  entityUid={uid}
                  title="Audit trail"
                  maxRows={15}
                />
              </div>
            )}
          </div>

          {open && (
            <div className="shrink-0 space-y-3 border-t border-border/60 bg-surface p-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Note to client (optional)"
                className="w-full resize-none rounded-xl border border-border bg-field px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="secondary"
                  loading={acting}
                  onClick={async () => {
                    setActing(true);
                    try {
                      await negotiationApi.firmWithdraw(uid, { comment });
                      toast.success("Proposal withdrawn");
                      await load();
                    } catch (err: unknown) {
                      const e = err as {
                        response?: { data?: { message?: string } };
                        message?: string;
                      };
                      toast.error(
                        e.response?.data?.message || e.message || "Withdraw failed"
                      );
                    } finally {
                      setActing(false);
                    }
                  }}
                >
                  Withdraw
                </Button>
                <Button
                  variant="secondary"
                  loading={acting}
                  onClick={async () => {
                    setActing(true);
                    try {
                      await negotiationApi.firmReject(uid, { comment });
                      toast.success("Rejected");
                      await load();
                    } catch (err: unknown) {
                      const e = err as {
                        response?: { data?: { message?: string } };
                        message?: string;
                      };
                      toast.error(
                        e.response?.data?.message || e.message || "Reject failed"
                      );
                    } finally {
                      setActing(false);
                    }
                  }}
                >
                  Reject
                </Button>
                {canAcceptClient && (
                  <Button
                    variant="cta"
                    loading={acting}
                    onClick={async () => {
                      setActing(true);
                      try {
                        await negotiationApi.firmAcceptCounter(uid, { comment });
                        toast.success("Client counter accepted");
                        await load();
                      } catch (err: unknown) {
                        const e = err as {
                          response?: { data?: { message?: string } };
                          message?: string;
                        };
                        toast.error(
                          e.response?.data?.message ||
                            e.message ||
                            "Cannot accept - check margin floor"
                        );
                      } finally {
                        setActing(false);
                      }
                    }}
                  >
                    Accept client counter
                  </Button>
                )}
                {mode === "counter" && (
                  <Button
                    variant="cta"
                    loading={acting}
                    onClick={async () => {
                      if (!last) return;
                      setActing(true);
                      try {
                        await negotiationApi.firmCounter(uid, {
                          comment,
                          lines: linesFromRateDrafts(last.lines, drafts),
                        });
                        toast.success("Counter sent to client");
                        await load();
                      } catch (err: unknown) {
                        const e = err as {
                          response?: { data?: { message?: string } };
                          message?: string;
                        };
                        toast.error(
                          e.response?.data?.message ||
                            e.message ||
                            "Counter failed - rates may breach margin floor"
                        );
                      } finally {
                        setActing(false);
                      }
                    }}
                  >
                    Send counter
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <EngagementPackWorkspace
        negotiationUid={uid}
        open={packOpen}
        onClose={() => {
          setPackOpen(false);
          void load({ silent: true });
        }}
        mode="firm"
      />
    </div>
  );
}
