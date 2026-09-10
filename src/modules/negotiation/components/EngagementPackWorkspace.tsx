"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlinePrinter, HiX } from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import * as negotiationApi from "../api";
import type { EngagementPack } from "../types";
import {
  EngagementPackDocument,
  EngagementPackStatusBadge,
} from "./EngagementPackDocument";

interface Props {
  negotiationUid: string;
  open: boolean;
  onClose: () => void;
  /** Firm can generate/send; portal is view + optional acknowledge */
  mode: "firm" | "portal";
  onAcknowledged?: () => void;
}

export function EngagementPackWorkspace({
  negotiationUid,
  open,
  onClose,
  mode,
  onAcknowledged,
}: Props) {
  const [pack, setPack] = useState<EngagementPack | null>(null);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState(false);
  const [section, setSection] = useState<"letter" | "schedule">("letter");
  const [missing, setMissing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setMissing(false);
    try {
      const p =
        mode === "firm"
          ? await negotiationApi.getEngagementPack(negotiationUid)
          : await negotiationApi.getPortalEngagementPack(negotiationUid);
      setPack(p);
    } catch {
      setPack(null);
      setMissing(true);
    } finally {
      setLoading(false);
    }
  }, [negotiationUid, mode]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  if (!open) return null;

  const generate = async () => {
    setActing(true);
    try {
      const p = await negotiationApi.generateEngagementPack(negotiationUid);
      setPack(p);
      setMissing(false);
      toast.success(
        pack ? "Engagement pack regenerated" : "Engagement pack generated"
      );
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        e.response?.data?.message || e.message || "Could not generate pack"
      );
    } finally {
      setActing(false);
    }
  };

  const send = async () => {
    setActing(true);
    try {
      const p = await negotiationApi.sendEngagementPack(negotiationUid);
      setPack(p);
      toast.success("Engagement pack sent to client");
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        e.response?.data?.message || e.message || "Could not send pack"
      );
    } finally {
      setActing(false);
    }
  };

  const acknowledge = async () => {
    setActing(true);
    try {
      const p = await negotiationApi.acknowledgeEngagementPack(negotiationUid);
      setPack(p);
      toast.success("Engagement acknowledged");
      onAcknowledged?.();
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        e.response?.data?.message || e.message || "Could not acknowledge"
      );
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas/95 backdrop-blur-[2px]">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-surface/95 px-4 py-3 sm:px-6 print:hidden">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-ink">
              Engagement pack
            </h2>
            {pack && <EngagementPackStatusBadge status={pack.status} />}
          </div>
          <p className="mt-0.5 truncate text-xs text-ink/60">
            {pack?.matterTitle || "Letter of engagement and fee schedule"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {mode === "firm" && (missing || !pack) && (
            <Button variant="cta" loading={acting} onClick={generate}>
              Generate pack
            </Button>
          )}
          {mode === "firm" && pack?.status === "DRAFT" && (
            <>
              <Button variant="secondary" loading={acting} onClick={generate}>
                Regenerate
              </Button>
              <Button variant="cta" loading={acting} onClick={send}>
                Send to client
              </Button>
            </>
          )}
          {mode === "portal" && pack?.status === "SENT" && (
            <Button variant="cta" loading={acting} onClick={acknowledge}>
              Acknowledge engagement
            </Button>
          )}
          {pack && (
            <Button
              variant="secondary"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5"
            >
              <HiOutlinePrinter className="h-4 w-4" />
              Print
            </Button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-ink/60 hover:bg-hover hover:text-ink"
            aria-label="Close"
          >
            <HiX className="h-5 w-5" />
          </button>
        </div>
      </div>

      {pack && (
        <div className="flex shrink-0 justify-center gap-1 border-b border-border/50 bg-surface/80 px-4 py-2 print:hidden">
          {(
            [
              { id: "letter" as const, label: "Engagement letter" },
              { id: "schedule" as const, label: "Fee schedule" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSection(t.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                section === t.id
                  ? "bg-ink text-canvas"
                  : "text-ink/60 hover:bg-hover hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto bg-[linear-gradient(180deg,#e8e4dc_0%,#d9d4cb_100%)] px-3 py-6 sm:px-6 sm:py-10 print:bg-white print:p-0">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-ink" />
          </div>
        ) : pack ? (
          <div className="print:block">
            {mode === "portal" && pack.status === "ACKNOWLEDGED" && (
              <p className="mx-auto mb-4 max-w-[720px] text-center text-xs font-medium text-ink/60 print:hidden">
                You acknowledged this engagement
                {pack.acknowledgedAt
                  ? ` on ${new Date(pack.acknowledgedAt).toLocaleString("en-GB")}`
                  : ""}
                .
              </p>
            )}
            <EngagementPackDocument pack={pack} section={section} />
            {/* Print both sections */}
            <div className="hidden print:block">
              {section !== "letter" && (
                <EngagementPackDocument pack={pack} section="letter" />
              )}
              {section !== "schedule" && (
                <div className="mt-10">
                  <EngagementPackDocument pack={pack} section="schedule" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
            <p className="text-sm text-ink/60">
              {mode === "firm"
                ? "No engagement pack yet. Generate a letter and fee schedule from the agreed rates."
                : "The firm has not sent an engagement pack for this matter yet."}
            </p>
            {mode === "firm" && (
              <Button variant="cta" loading={acting} onClick={generate}>
                Generate engagement pack
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
