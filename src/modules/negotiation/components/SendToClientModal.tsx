"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { getClient } from "@/lib/api/modules/firm.api";
import * as negotiationApi from "../api";
import type { NegotiationDetail } from "../types";

interface SendToClientModalProps {
  open: boolean;
  requestUid: string;
  scenarioUid: string;
  scenarioCurrency?: string | null;
  /** Locked to the pricing request’s client — no re-pick. */
  defaultClientProfileUid?: string | null;
  matterTitle?: string;
  clientName?: string;
  onClose: () => void;
  onSent: (negotiation: NegotiationDetail) => void;
}

export function SendToClientModal({
  open,
  requestUid,
  scenarioUid,
  scenarioCurrency,
  defaultClientProfileUid,
  matterTitle,
  clientName,
  onClose,
  onSent,
}: SendToClientModalProps) {
  const [portalEmail, setPortalEmail] = useState<string | null>(null);
  const [coverMessage, setCoverMessage] = useState("");
  const [resolving, setResolving] = useState(false);
  const [sending, setSending] = useState(false);
  const [currencyConfirmed, setCurrencyConfirmed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCoverMessage(
      `Please review the proposed rates for ${matterTitle || "this matter"}.`
    );
    setCurrencyConfirmed(false);
    setPortalEmail(null);
    if (!defaultClientProfileUid) return;

    let cancelled = false;
    setResolving(true);
    (async () => {
      try {
        const client = await getClient(defaultClientProfileUid);
        if (!cancelled) setPortalEmail(client.contactEmail || null);
      } catch {
        /* backend still resolves contact email from the profile */
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, defaultClientProfileUid, matterTitle]);

  if (!open) return null;

  const lockedName = clientName || "this client";
  const hasScenarioCurrency = Boolean(scenarioCurrency?.trim());
  const canSend = !!defaultClientProfileUid && hasScenarioCurrency && currencyConfirmed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-[2rem] border border-border shadow-[0_12px_40px_rgba(0,0,0,0.14)] w-full max-w-md p-6 animate-fade-in-up">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
          Client proposal
        </p>
        <h3 className="mt-2 text-lg font-semibold text-ink tracking-tight">
          Send to {lockedName}
        </h3>

        <div className="mt-5 rounded-xl border border-border/70 bg-field/40 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">
            Recipient
          </p>
          <p className="mt-1 text-sm font-semibold text-ink tracking-tight">
            {lockedName}
          </p>
          <p className="mt-0.5 text-xs text-ink/60">
            {resolving
              ? "Loading portal contact…"
              : portalEmail
                ? portalEmail
                : "Portal login from client contact email"}
          </p>
        </div>

        {!canSend && (
          <p className="mt-4 text-xs text-red-600 dark:text-red-400">
            {!defaultClientProfileUid
              ? "This pricing request has no client linked. Fix the request before sending."
              : "Confirm the quote currency below before sending."}
          </p>
        )}

        <div className="mt-4 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-amber-950">
          <p className="text-sm font-semibold">
            Quote currency: {scenarioCurrency || "Not set"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
            {hasScenarioCurrency
              ? "This comes from the selected office's active rate card. Check it against the matter and the currency agreed with the client before sending."
              : "This pricing scenario has no currency. Update the selected office or scenario before sending the proposal."}
          </p>
          <label className="mt-3 flex cursor-pointer items-start gap-2 text-xs leading-relaxed">
            <input
              type="checkbox"
              checked={currencyConfirmed}
              disabled={!hasScenarioCurrency}
              onChange={(e) => setCurrencyConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-ink"
            />
            <span>I confirm this is the intended quote currency for this client.</span>
          </label>
        </div>

        <div className="mt-4">
          <label className="block text-[11px] font-semibold text-ink/60 mb-1.5">
            Cover message
          </label>
          <textarea aria-label="Cover message"
            value={coverMessage}
            onChange={(e) => setCoverMessage(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-field px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/15 resize-none"
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button
            variant="cta"
            loading={sending}
            disabled={!canSend}
            onClick={async () => {
              if (!defaultClientProfileUid) return;
              setSending(true);
              try {
                const n = await negotiationApi.sendToClient(
                  requestUid,
                  scenarioUid,
                  {
                    clientProfileUid: defaultClientProfileUid,
                    coverMessage: coverMessage || undefined,
                    quoteCurrencyConfirmed: currencyConfirmed,
                  }
                );
                toast.success(`Proposal sent to ${lockedName}`);
                onSent(n);
              } catch (err: unknown) {
                const e = err as {
                  response?: { data?: { message?: string } };
                  message?: string;
                };
                toast.error(
                  e.response?.data?.message ||
                    e.message ||
                    "Could not send proposal"
                );
              } finally {
                setSending(false);
              }
            }}
          >
            Send proposal
          </Button>
        </div>
      </div>
    </div>
  );
}
