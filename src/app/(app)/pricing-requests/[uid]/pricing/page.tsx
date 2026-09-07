"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { intakeApi } from "@/lib/api/modules/intake.api";
import { ChatModeBadge } from "@/modules/intake/components/IntakeStatusBadge";
import type { PricingRequest } from "@/modules/intake/types";
import { DecisionModal } from "@/modules/pricing/components/DecisionModal";
import { GenerateEmptyState } from "@/modules/pricing/components/GenerateEmptyState";
import { GenerateProgress } from "@/modules/pricing/components/GenerateProgress";
import { PartnerReviewView } from "@/modules/pricing/components/PartnerReviewView";
import { PricingWorkspaceSkeleton } from "@/modules/pricing/components/PricingWorkspaceSkeleton";
import { ScenarioCard } from "@/modules/pricing/components/ScenarioCard";
import { ScenarioDetail } from "@/modules/pricing/components/ScenarioDetail";
import {
  ScenarioStageRail,
  ScenarioStatusBadge,
  scenarioStatusMeta,
} from "@/modules/pricing/components/ScenarioStatusBadge";
import { SubmitPartnerModal } from "@/modules/pricing/components/SubmitPartnerModal";
import { SendToClientModal } from "@/modules/negotiation/components/SendToClientModal";
import { usePricingWorkspace } from "@/modules/pricing/hooks/usePricingWorkspace";
import { PRICING_MODEL_LABELS } from "@/modules/pricing/types";

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

export default function PricingWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = params.uid as string;
  const { user } = useAuth();

  const [request, setRequest] = useState<PricingRequest | null>(null);
  const [requestLoading, setRequestLoading] = useState(true);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [decision, setDecision] = useState<"approve" | "reject" | "return" | null>(
    null
  );

  const workspace = usePricingWorkspace(uid);

  const roles = user?.roles || [];
  const isPartnerOnly =
    roles.includes("PARTNER") &&
    !roles.includes("SUPER_ADMIN") &&
    !roles.includes("ADMIN");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await intakeApi.getRequest(uid);
        if (!cancelled) setRequest(r);
      } catch {
        if (!cancelled) setRequest(null);
      } finally {
        if (!cancelled) setRequestLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  // Partner review: open the preferred / requested scenario
  useEffect(() => {
    if (!isPartnerOnly || workspace.isLoading) return;
    const reviewUid = searchParams.get("review");
    const preferred = workspace.scenarios.find((s) => s.preferred);
    const pending = workspace.scenarios.find((s) => s.status === "PENDING_PARTNER");
    const target =
      (reviewUid && workspace.scenarios.find((s) => s.id === reviewUid)?.id) ||
      preferred?.id ||
      pending?.id ||
      workspace.scenarios[0]?.id;
    if (target && target !== workspace.selectedUid) {
      workspace.selectScenario(target);
    }
  }, [
    isPartnerOnly,
    searchParams,
    workspace.isLoading,
    workspace.scenarios,
    workspace.selectedUid,
    workspace.selectScenario,
  ]);

  if (requestLoading || workspace.isLoading) {
    return <PricingWorkspaceSkeleton />;
  }

  const clientName = request?.clientName || "Client";
  const matterTitle = request?.matterTitle || "Pricing";

  if (isPartnerOnly) {
    const review =
      workspace.detail ||
      workspace.preferredScenario ||
      workspace.scenarios.find((s) => s.status === "PENDING_PARTNER") ||
      null;

    if (!review) {
      return (
        <div className="h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-sm font-semibold text-ink/70">Nothing to review here</p>
          <Button variant="secondary" onClick={() => router.push("/approvals")}>
            Back to approvals
          </Button>
        </div>
      );
    }

    return (
      <>
        <PartnerReviewView
          matterTitle={matterTitle}
          clientName={clientName}
          scenario={review}
          deciding={workspace.isDeciding}
          onBack={() => router.push("/approvals")}
          onDecide={async (action, comment) => {
            await workspace.applyDecision(action, review.id, comment);
            // Stay on review when approved so partner can send to client
            if (action !== "approve") {
              router.push("/approvals");
            }
          }}
          onSendToClient={
            review.status === "APPROVED"
              ? () => setSendOpen(true)
              : undefined
          }
        />
        <SendToClientModal
          open={sendOpen}
          requestUid={uid}
          scenarioUid={review.id}
          defaultClientProfileUid={request?.clientProfileUid}
          matterTitle={matterTitle}
          clientName={clientName}
          onClose={() => setSendOpen(false)}
          onSent={(n) => {
            setSendOpen(false);
            router.push(`/negotiations/${n.id}`);
          }}
        />
      </>
    );
  }

  const currency = workspace.scenarios[0]?.currency || "GBP";
  const lowestFee =
    workspace.scenarios.length > 0
      ? Math.min(...workspace.scenarios.map((s) => Number(s.grossFees) || 0))
      : null;

  const preferred = workspace.preferredScenario;
  const pendingReview = preferred?.status === "PENDING_PARTNER";
  const returnedForCorrection =
    preferred?.status === "RETURNED_FOR_CORRECTION";
  const isElevated =
    roles.includes("SUPER_ADMIN") ||
    roles.includes("ADMIN") ||
    (user?.permissions || []).includes("SCENARIO_APPROVE");
  const isAssignee =
    !!preferred?.assignedPartnerEmail &&
    !!user?.email &&
    preferred.assignedPartnerEmail.toLowerCase() === user.email.toLowerCase();
  const canDecide = !!pendingReview && (isElevated || isAssignee);
  const canEditDraft =
    !preferred ||
    preferred.status === "DRAFT" ||
    preferred.status === "RETURNED_FOR_CORRECTION" ||
    preferred.status === "GENERATION_FAILED";
  const canSubmit =
    workspace.preferredExists &&
    !!preferred &&
    (preferred.status === "DRAFT" ||
      preferred.status === "RETURNED_FOR_CORRECTION" ||
      preferred.status === "PENDING_PARTNER");
  const canSendToClient = !!preferred && preferred.status === "APPROVED";

  const footerHint = pendingReview
    ? canDecide
      ? `Pending partner review${
          preferred?.assignedPartnerName
            ? ` · assigned to ${preferred.assignedPartnerName}`
            : ""
        }`
      : `Pending partner review${
          preferred?.assignedPartnerName
            ? ` by ${preferred.assignedPartnerName}`
            : ""
        }`
    : returnedForCorrection
      ? `Returned for correction${
          preferred?.assignedPartnerName
            ? ` · will go back to ${preferred.assignedPartnerName}`
            : ""
        }`
      : canSendToClient
        ? "Partner approved — send the rate card to the client to start negotiation"
    : preferred
      ? scenarioStatusMeta(preferred.status).hint ||
        scenarioStatusMeta(preferred.status).label
      : workspace.preferredExists
        ? "Preferred draft is set — submit when you’re ready for partner review"
        : "Choose a scenario, set it as preferred, then submit to a partner";

  const stageScenario = preferred || workspace.detail;

  const handleSubmitClick = () => {
    if (returnedForCorrection && preferred?.assignedPartnerUserUid) {
      void workspace.submitPartner();
      return;
    }
    if (returnedForCorrection && preferred?.assignedPartnerEmail) {
      void workspace.submitPartner();
      return;
    }
    setSubmitOpen(true);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-canvas relative">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 20% 0%, rgba(10,10,10,0.04), transparent 50%)",
        }}
      />

      <div className="relative flex items-center justify-between px-6 py-3.5 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.push(`/pricing-requests/${uid}`)}
            className="p-2 text-ink/50 hover:text-ink hover:bg-hover rounded-lg shrink-0 transition-colors"
            aria-label="Back to intake"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-ink truncate tracking-tight">
              {matterTitle}
            </h1>
            <p className="text-xs text-ink/50 truncate mt-0.5">{clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
          {stageScenario && (
            <ScenarioStatusBadge status={stageScenario.status} />
          )}
          {request?.chatMode && <ChatModeBadge chatMode={request.chatMode} />}
          {!workspace.isEmpty && !workspace.isGenerating && (
            <Button
              variant="secondary"
              onClick={() => void workspace.generate()}
            >
              Regenerate
            </Button>
          )}
        </div>
      </div>

      {stageScenario && !workspace.isGenerating && !workspace.isEmpty && (
        <div className="relative shrink-0 border-b border-border/70 bg-surface/90">
          <div className="px-6 py-3 space-y-2">
            <ScenarioStageRail status={stageScenario.status} />
            {stageScenario.status === "PENDING_PARTNER" &&
              stageScenario.assignedPartnerName && (
                <p className="text-[11px] text-ink/45">
                  With {stageScenario.assignedPartnerName}
                  {stageScenario.submittedAt
                    ? ` · submitted ${new Date(stageScenario.submittedAt).toLocaleString()}`
                    : ""}
                </p>
              )}
            {stageScenario.status === "RETURNED_FOR_CORRECTION" &&
              stageScenario.assignedPartnerName && (
                <p className="text-[11px] text-amber-900/70 dark:text-amber-200/70">
                  Address the partner comments below, then resubmit to{" "}
                  {stageScenario.assignedPartnerName} — no need to re-select them.
                </p>
              )}
            {(stageScenario.status === "APPROVED" ||
              stageScenario.status === "REJECTED") &&
              stageScenario.decidedByEmail && (
                <p className="text-[11px] text-ink/45">
                  Decided by {stageScenario.decidedByEmail}
                  {stageScenario.decidedAt
                    ? ` · ${new Date(stageScenario.decidedAt).toLocaleString()}`
                    : ""}
                  {stageScenario.decisionComment
                    ? ` — “${stageScenario.decisionComment}”`
                    : ""}
                </p>
              )}
          </div>
          {canSendToClient && preferred && (
            <div className="border-t border-border/60 bg-gradient-to-r from-field/40 via-surface to-surface px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
                  Next step
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink tracking-tight">
                  Send approved rates to {clientName}
                </p>
              </div>
              <Button
                variant="cta"
                className="shrink-0"
                onClick={() => setSendOpen(true)}
              >
                Send to client
              </Button>
            </div>
          )}
        </div>
      )}

      {workspace.isGenerating ? (
        <GenerateProgress
          activeStep={workspace.progressStep}
          statusLabel={workspace.progressLabel}
          toolSteps={workspace.toolSteps}
        />
      ) : workspace.isEmpty ? (
        <GenerateEmptyState
          generating={false}
          onGenerate={() => void workspace.generate()}
          matterTitle={matterTitle}
        />
      ) : (
        <>
          <div className="relative flex-1 flex min-h-0 overflow-hidden">
            <div className="w-full lg:w-[46%] xl:w-[44%] overflow-y-auto rates-scrollable border-r border-border/60 p-5 sm:p-6">
              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
                  Compare
                </p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <h2 className="text-lg font-semibold text-ink tracking-tight">
                    {workspace.scenarios.length} scenarios
                  </h2>
                  {lowestFee != null && (
                    <p className="text-xs text-ink/45 tabular-nums shrink-0 pb-0.5">
                      From {formatMoney(lowestFee, currency)}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {workspace.scenarios.map((s) => (
                    <button
                      key={`chip-${s.id}`}
                      type="button"
                      onClick={() => workspace.selectScenario(s.id)}
                      className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-tight transition-colors ${
                        workspace.selectedUid === s.id
                          ? "bg-ink text-on-primary"
                          : "bg-field text-ink/55 hover:text-ink"
                      }`}
                    >
                      {PRICING_MODEL_LABELS[s.pricingModel] ?? s.pricingModel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                {workspace.scenarios.map((s, i) => (
                  <ScenarioCard
                    key={s.id}
                    scenario={s}
                    index={i}
                    selected={workspace.selectedUid === s.id}
                    onSelect={() => workspace.selectScenario(s.id)}
                  />
                ))}
              </div>
            </div>

            <div className="hidden lg:flex flex-1 min-w-0 bg-surface">
              <div className="w-full min-h-0">
                <ScenarioDetail
                  scenario={workspace.detail}
                  savingWhatIf={workspace.isSavingWhatIf}
                  onWhatIf={workspace.applyWhatIf}
                />
              </div>
            </div>
          </div>

          <div className="relative shrink-0 border-t border-border bg-surface/95 backdrop-blur-sm px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ink/45 max-w-md">{footerHint}</p>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {canDecide && preferred ? (
                <>
                  <Button
                    variant="secondary"
                    loading={workspace.isDeciding}
                    onClick={() => setDecision("return")}
                  >
                    Return
                  </Button>
                  <Button
                    variant="secondary"
                    loading={workspace.isDeciding}
                    onClick={() => setDecision("reject")}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="cta"
                    loading={workspace.isDeciding}
                    onClick={() => setDecision("approve")}
                  >
                    Approve
                  </Button>
                </>
              ) : (
                <>
                  {canEditDraft && (
                    <Button
                      variant="secondary"
                      loading={workspace.isPreferring}
                      disabled={!workspace.selectedUid}
                      onClick={() => void workspace.prefer()}
                    >
                      Set as preferred
                    </Button>
                  )}
                  {canSubmit && (
                    <Button
                      variant="cta"
                      loading={workspace.isSubmitting}
                      disabled={!workspace.preferredExists}
                      onClick={handleSubmitClick}
                    >
                      {returnedForCorrection
                        ? preferred?.assignedPartnerName
                          ? `Resubmit to ${preferred.assignedPartnerName}`
                          : "Resubmit to partner"
                        : "Submit to Partner"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      <SubmitPartnerModal
        open={submitOpen}
        loading={workspace.isSubmitting}
        onClose={() => setSubmitOpen(false)}
        onSubmit={async (partnerUserUid) => {
          try {
            await workspace.submitPartner(partnerUserUid);
            setSubmitOpen(false);
          } catch {
            /* toast already shown */
          }
        }}
      />

      {preferred && (
        <SendToClientModal
          open={sendOpen}
          requestUid={uid}
          scenarioUid={preferred.id}
          defaultClientProfileUid={request?.clientProfileUid}
          matterTitle={matterTitle}
          clientName={clientName}
          onClose={() => setSendOpen(false)}
          onSent={(n) => {
            setSendOpen(false);
            router.push(`/negotiations/${n.id}`);
          }}
        />
      )}

      <DecisionModal
        open={decision !== null}
        title={
          decision === "approve"
            ? "Approve scenario"
            : decision === "reject"
              ? "Reject scenario"
              : "Return for correction"
        }
        confirmLabel={
          decision === "approve"
            ? "Approve"
            : decision === "reject"
              ? "Reject"
              : "Return"
        }
        loading={workspace.isDeciding}
        requireComment={decision === "reject" || decision === "return"}
        onClose={() => setDecision(null)}
        onConfirm={async (comment) => {
          if (!decision || !preferred) return;
          try {
            await workspace.applyDecision(decision, preferred.id, comment);
            setDecision(null);
          } catch {
            /* toast already shown */
          }
        }}
      />
    </div>
  );
}
