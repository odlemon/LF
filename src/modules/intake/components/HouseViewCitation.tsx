"use client";

import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  HiChevronDown,
  HiOutlineLightBulb,
  HiOutlineSparkles,
  HiPencil,
  HiTrash,
} from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { usePracticeAreas } from "@/modules/firm/hooks/useFirm";
import {
  matterLearningApi,
  type CitedPosition,
  type MatterLearning,
} from "@/lib/api/modules/matterLearning.api";
import { LearningForm, type LearningDraft } from "@/modules/knowledge/components/LearningForm";

/**
 * What the firm already believed, before the agent said anything.
 *
 * The pricing agent is handed a few of the firm's settled positions before it scopes a matter,
 * and that used to happen invisibly — a recommendation arrived with a number and no way to ask
 * where it came from. This is the citation: the same sentences the agent read, and the ability to
 * correct one on the spot.
 *
 * Correcting here rather than on a separate screen is the point. A partner who spots a wrong
 * claim about their own client will fix it in the two seconds they are looking at it; they will
 * not navigate somewhere else later to do it.
 *
 * Renders nothing when the firm has no relevant position, because a band announcing an absence is
 * just noise on every matter a new firm prices.
 */
export function HouseViewCitation({ requestUid }: { requestUid: string }) {
  const { areas } = usePracticeAreas();
  const [positions, setPositions] = useState<CitedPosition[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CitedPosition | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await matterLearningApi.forRequest(requestUid);
      setPositions(data.positions ?? []);
    } catch {
      // A citation that cannot load must not break the workspace around it.
      setPositions([]);
    }
  }, [requestUid]);

  useEffect(() => {
    void load();
  }, [load]);

  if (positions.length === 0) return null;

  const areaName = (code?: string | null) =>
    areas.find((a) => a.code === code)?.name ?? code ?? "Firm-wide";

  const save = async (draft: LearningDraft) => {
    if (!editing) return;
    setSaving(true);
    try {
      await matterLearningApi.update(editing.uid, draft);
      toast.success("Position updated — future scopes will use the corrected version");
      setEditing(null);
      await load();
    } catch {
      toast.error("Could not save that correction");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (position: CitedPosition) => {
    setSaving(true);
    try {
      await matterLearningApi.remove(position.uid);
      toast.success("Position removed from the firm's house view");
      await load();
    } catch {
      toast.error("Could not remove that position");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <section className="border-b border-border bg-canvas">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-hover cursor-pointer sm:px-6"
        >
          <HiOutlineLightBulb className="h-4 w-4 shrink-0 text-ink/40" />
          <span className="min-w-0 flex-1 truncate text-[12px] text-ink/60">
            Pricing this against{" "}
            <span className="font-semibold text-ink/80">
              {positions.length} {positions.length === 1 ? "position" : "positions"}
            </span>{" "}
            the firm already holds
          </span>
          <HiChevronDown
            className={`h-4 w-4 shrink-0 text-ink/35 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Capped and scrollable: three closed-negotiation write-ups run to several hundred words
            each, and expanded at full height they pushed the conversation this band is supposed
            to explain off the screen. */}
        {open && (
          <div className="flex max-h-[45vh] flex-col gap-2.5 overflow-y-auto px-4 pb-4 sm:px-6">
            {positions.map((p) => (
              <article key={p.uid} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      p.automatic ? "bg-ink text-on-primary" : "bg-field text-ink/50"
                    }`}
                    aria-hidden
                  >
                    {p.automatic ? (
                      <HiOutlineSparkles className="h-3 w-3" />
                    ) : (
                      <HiOutlineLightBulb className="h-3 w-3" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13px] font-semibold leading-snug text-ink">{p.title}</h4>
                    <p className="mt-1 whitespace-pre-line text-[12px] leading-relaxed text-ink/60">
                      {p.learningText}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink/40">
                      <span>{areaName(p.practiceAreaCode)}</span>
                      <span>·</span>
                      <span>
                        {p.automatic
                          ? "Written from a closed negotiation — evidence, not instruction"
                          : `Recorded by ${p.loggedByName || "a colleague"}`}
                      </span>
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        disabled={saving}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-ink/60 transition-colors hover:border-ink/30 hover:text-ink disabled:opacity-50 cursor-pointer"
                      >
                        <HiPencil className="h-3 w-3" />
                        This needs correcting
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(p)}
                        disabled={saving}
                        className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-ink/50 transition-colors hover:border-danger/40 hover:text-danger disabled:opacity-50 cursor-pointer"
                      >
                        <HiTrash className="h-3 w-3" />
                        Does not apply
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            <p className="text-[11px] leading-relaxed text-ink/40">
              These are read by the agent before it scopes. A correction here changes what every
              future matter of this kind is told.
            </p>
          </div>
        )}
      </section>

      <Drawer
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title="Correct this position"
        size="xl"
      >
        {editing && (
          <LearningForm
            existing={editing as unknown as MatterLearning}
            practiceAreas={areas}
            saving={saving}
            onCancel={() => setEditing(null)}
            onSave={save}
          />
        )}
      </Drawer>
    </>
  );
}
