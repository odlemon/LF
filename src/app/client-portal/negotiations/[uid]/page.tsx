"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { HiArrowLeft, HiOutlineChatAlt2, HiOutlineDocumentText } from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import * as negotiationApi from "@/modules/negotiation/api";
import { NegotiationRoundTimeline } from "@/modules/negotiation/components/NegotiationRoundTimeline";
import { NegotiationStatusBadge } from "@/modules/negotiation/components/NegotiationStatusBadge";
import { OfferCompareRail } from "@/modules/negotiation/components/OfferCompareRail";
import { RateCardEditor } from "@/modules/negotiation/components/RateCardEditor";
import { EngagementPackWorkspace } from "@/modules/negotiation/components/EngagementPackWorkspace";
import { RateCoachWorkspace } from "@/modules/client-portal/components/RateCoachWorkspace";
import type {
  EngagementPack,
  NegotiationDetail,
  NegotiationLineCommand,
  RateLevelDraft,
} from "@/modules/negotiation/types";
import {
  aggregateRateLevels,
  commercialOffers,
  formatMoney,
  isOpenStatus,
  latestCommercialOffer,
  latestRound,
  linesFromRateDrafts,
  openingOffer,
} from "@/modules/negotiation/utils";
import { formatDateTime } from "@/modules/client-portal/format";

type RailTab = "rates" | "history";

export default function PortalNegotiationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;

  const [detail, setDetail] = useState<NegotiationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [comment, setComment] = useState("");
  const [drafts, setDrafts] = useState<RateLevelDraft[]>([]);
  const [counterMode, setCounterMode] = useState(false);
  const [rail, setRail] = useState<RailTab>("rates");
  const [mobilePane, setMobilePane] = useState<"coach" | "rates">("coach");
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [packOpen, setPackOpen] = useState(false);
  const [pack, setPack] = useState<EngagementPack | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const n = await negotiationApi.getPortalNegotiation(uid);
      setDetail(n);
      const latest = latestCommercialOffer(n.rounds) || latestRound(n);
      setSelectedRoundId(latest?.id ?? null);
      setDrafts(aggregateRateLevels(latest?.lines || []));
      setCounterMode(false);
      if (n.status === "CLIENT_APPROVED") {
        try {
          const p = await negotiationApi.getPortalEngagementPack(uid);
          setPack(p);
        } catch {
          setPack(null);
        }
      } else {
        setPack(null);
      }
    } catch {
      if (!opts?.silent) setDetail(null);
      toast.error("Could not load proposal");
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void load();
  }, [load]);

  const last = useMemo(() => latestRound(detail), [detail]);
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
  const currency = detail?.currency || "GBP";

  const selectOffer = (roundId: string) => {
    if (counterMode) return;
    setSelectedRoundId(roundId);
    const offer = offers.find((o) => o.id === roundId);
    if (offer) setDrafts(aggregateRateLevels(offer.lines || []));
  };

  const draftTotal = useMemo(
    () => drafts.reduce((s, d) => s + d.hours * d.hourlyRate, 0),
    [drafts]
  );

  const compareAgainst = useMemo(() => {
    if (counterMode) {
      return aggregateRateLevels(selectedOffer?.lines || last?.lines || []);
    }
    if (!selectedOffer || !original || selectedOffer.id === original.id) {
      return null;
    }
    return aggregateRateLevels(original.lines || []);
  }, [counterMode, selectedOffer, original, last]);

  const applySuggestion = (lines: NegotiationLineCommand[]) => {
    if (!last || !lines.length) return;
    const baseline = latestCommercialOffer(detail?.rounds) || last;
    setSelectedRoundId(baseline?.id ?? null);
    setCounterMode(true);
    setDrafts(
      aggregateRateLevels(
        (baseline?.lines || last.lines).map((line) => {
          const match = lines.find(
            (x) =>
              (x.feeEarnerLevelUid && x.feeEarnerLevelUid === line.feeEarnerLevelUid) ||
              (x.feeEarnerLevelCode && x.feeEarnerLevelCode === line.feeEarnerLevelCode) ||
              (x.feeEarnerLevelName && x.feeEarnerLevelName === line.feeEarnerLevelName)
          );
          return match ? { ...line, hourlyRate: Number(match.hourlyRate) } : line;
        })
      )
    );
    setRail("rates");
    setMobilePane("rates");
    toast.success("Suggested rates loaded into the editor");
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-ink" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <p className="text-sm text-ink/60">Proposal not found</p>
        <Button variant="secondary" onClick={() => router.push("/client-portal/negotiations")}>
          Back to proposals
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-col bg-canvas">
      {/* Top bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/60 bg-surface/90 px-4 py-3 backdrop-blur-md sm:px-5">
        <button
          type="button"
          onClick={() => router.push("/client-portal/negotiations")}
          className="rounded-lg p-2 text-ink/50 hover:bg-hover hover:text-ink"
          aria-label="Back"
        >
          <HiArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-base font-semibold tracking-tight text-ink sm:text-lg">
              {detail.matterTitle || "Fee proposal"}
            </h1>
            <NegotiationStatusBadge status={detail.status} />
          </div>
          <p className="mt-0.5 text-xs text-ink/45">
            {formatMoney(detail.latestGrossFees, currency)}
            {detail.responseDeadline
              ? ` · respond by ${formatDateTime(detail.responseDeadline)}`
              : ""}
          </p>
        </div>
        <div className="flex gap-1 rounded-full bg-field p-1 lg:hidden">
          <button
            type="button"
            onClick={() => setMobilePane("coach")}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
              mobilePane === "coach" ? "bg-surface text-ink shadow-sm" : "text-ink/45"
            }`}
          >
            Coach
          </button>
          <button
            type="button"
            onClick={() => setMobilePane("rates")}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${
              mobilePane === "rates" ? "bg-surface text-ink shadow-sm" : "text-ink/45"
            }`}
          >
            Rates
          </button>
        </div>
      </div>

      {pack && (pack.status === "SENT" || pack.status === "ACKNOWLEDGED") && (
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-ink px-4 py-3 text-canvas sm:px-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">
              {pack.status === "ACKNOWLEDGED"
                ? "Engagement acknowledged"
                : "Engagement pack ready for review"}
            </p>
            <p className="mt-0.5 text-xs text-canvas/55">
              {pack.status === "ACKNOWLEDGED"
                ? "You can view or print the letter and fee schedule."
                : "Review the engagement letter and annexed fee schedule, then acknowledge."}
            </p>
          </div>
          <Button
            variant="cta"
            className="!bg-canvas !text-ink hover:!bg-canvas/90"
            onClick={() => setPackOpen(true)}
          >
            {pack.status === "SENT"
              ? "Review & acknowledge"
              : "View engagement pack"}
          </Button>
        </div>
      )}

      {/* Split workspace */}
      <div className="grid min-h-0 flex-1 lg:grid-cols-12">
        {/* AI coach */}
        <section
          className={`min-h-0 border-border/60 lg:col-span-7 lg:border-r ${
            mobilePane === "coach" ? "flex flex-col" : "hidden lg:flex lg:flex-col"
          }`}
        >
          <RateCoachWorkspace
            negotiationUid={uid}
            currency={currency}
            matterTitle={detail.matterTitle}
            open={open}
            onApplyRates={applySuggestion}
            onSubmitRates={async (lines) => {
              setActing(true);
              try {
                const updated = await negotiationApi.portalCounter(uid, {
                  lines,
                  comment: comment || undefined,
                });
                setDetail(updated);
                setDrafts(aggregateRateLevels(latestRound(updated)?.lines || []));
                setCounterMode(false);
                setComment("");
                toast.success("Counter sent to the firm");
              } catch (err: unknown) {
                const e = err as {
                  response?: { data?: { message?: string } };
                  message?: string;
                };
                toast.error(
                  e.response?.data?.message || e.message || "Could not send counter"
                );
                throw err;
              } finally {
                setActing(false);
              }
            }}
            onNegotiationUpdated={({ toolName } = {}) => {
              void load({ silent: true });
              if (toolName === "accept_proposal") {
                toast.success("Proposal accepted");
              } else if (toolName === "submit_counter") {
                toast.success("Counter sent to the firm");
              } else {
                toast.success("Proposal updated");
              }
            }}
          />
        </section>

        {/* Rate rail */}
        <section
          className={`min-h-0 flex-col bg-surface lg:col-span-5 ${
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
                      : "text-ink/50 hover:bg-hover hover:text-ink"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto rates-scrollable p-4 sm:p-5">
            {rail === "rates" ? (
              <div className="space-y-7 animate-fade-in">
                {detail.coverMessage && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                      From the firm
                    </p>
                    <p className="mt-2 border-l-2 border-ink/15 pl-3.5 text-[15px] leading-relaxed text-ink/75">
                      {detail.coverMessage}
                    </p>
                  </div>
                )}

                {detail.scopeSummary && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
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
                                  <p className="mt-0.5 text-[13px] leading-relaxed text-ink/55">
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
                    viewer="CLIENT"
                    selectedRoundId={selectedOffer?.id ?? null}
                    onSelect={selectOffer}
                    partyLabels={{ FIRM: "Firm", CLIENT: "You" }}
                  />

                  <div className="mt-6 mb-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                        {counterMode ? "Your counter" : "Fee earner detail"}
                      </p>
                      {counterMode && (
                        <>
                          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-ink">
                            {formatMoney(draftTotal, currency)}
                          </p>
                          <p className="mt-1 text-[12px] text-ink/45">
                            Estimated fees at the rates below
                          </p>
                        </>
                      )}
                    </div>
                    {open && !counterMode && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const baseline =
                            latestCommercialOffer(detail.rounds) || last;
                          setSelectedRoundId(baseline?.id ?? null);
                          setDrafts(aggregateRateLevels(baseline?.lines || []));
                          setCounterMode(true);
                        }}
                      >
                        Edit rates
                      </Button>
                    )}
                    {open && counterMode && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCounterMode(false);
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
                    editable={counterMode && open}
                    onChange={setDrafts}
                    compareAgainst={compareAgainst}
                    compareLabel={
                      counterMode
                        ? "Current"
                        : selectedOffer?.id === original?.id
                          ? "Opening"
                          : "Original"
                    }
                  />
                </div>
              </div>
            ) : (
              <NegotiationRoundTimeline
                rounds={detail.rounds || []}
                currency={currency}
                partyLabels={{ FIRM: "Firm", CLIENT: "You" }}
              />
            )}
          </div>

          {open && (
            <div className="shrink-0 space-y-3 border-t border-border/60 bg-surface p-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Note to the firm (optional)"
                className="w-full resize-none rounded-xl border border-border bg-field px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="secondary"
                  loading={acting}
                  onClick={async () => {
                    setActing(true);
                    try {
                      await negotiationApi.portalReject(uid, { comment });
                      toast.success("Proposal declined");
                      await load();
                    } catch (err: unknown) {
                      const e = err as {
                        response?: { data?: { message?: string } };
                        message?: string;
                      };
                      toast.error(e.response?.data?.message || e.message || "Reject failed");
                    } finally {
                      setActing(false);
                    }
                  }}
                >
                  Reject
                </Button>
                {counterMode ? (
                  <Button
                    variant="cta"
                    loading={acting}
                    onClick={async () => {
                      if (!last) return;
                      setActing(true);
                      try {
                        await negotiationApi.portalCounter(uid, {
                          comment,
                          lines: linesFromRateDrafts(last.lines, drafts),
                        });
                        toast.success("Counter submitted");
                        await load();
                      } catch (err: unknown) {
                        const e = err as {
                          response?: { data?: { message?: string } };
                          message?: string;
                        };
                        toast.error(
                          e.response?.data?.message || e.message || "Counter failed"
                        );
                      } finally {
                        setActing(false);
                      }
                    }}
                  >
                    Submit counter
                  </Button>
                ) : (
                  <Button
                    variant="cta"
                    loading={acting}
                    onClick={async () => {
                      setActing(true);
                      try {
                        await negotiationApi.portalAccept(uid, { comment });
                        toast.success("Rates accepted");
                        await load();
                      } catch (err: unknown) {
                        const e = err as {
                          response?: { data?: { message?: string } };
                          message?: string;
                        };
                        toast.error(
                          e.response?.data?.message || e.message || "Accept failed"
                        );
                      } finally {
                        setActing(false);
                      }
                    }}
                  >
                    Accept rates
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
        mode="portal"
        onAcknowledged={() => void load({ silent: true })}
      />
    </div>
  );
}
