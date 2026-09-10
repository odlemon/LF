"use client";

import React from "react";
import { HiOutlineLightBulb, HiOutlineSparkles } from "react-icons/hi";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/format";
import type { MatterLearning } from "@/lib/api/modules/matterLearning.api";
import { lessonPreview } from "../lib/lesson";

/**
 * One lesson in the list.
 *
 * The title is the lesson itself, so it gets the weight. Everything else — where it came from,
 * which practice it applies to, when it was recorded — is supporting detail on one line beneath,
 * because a partner scanning twenty of these is reading the lessons, not the metadata.
 */

export const AUTHOR_ADVISOR = "Negotiation Advisor";

export function LearningCard({
  learning,
  practiceAreaName,
  onOpen,
}: {
  learning: MatterLearning;
  practiceAreaName: (code?: string | null) => string;
  onOpen: (l: MatterLearning) => void;
}) {
  const captured = learning.loggedByName === AUTHOR_ADVISOR;
  const preview = lessonPreview(learning.learningText);

  return (
    <button
      type="button"
      onClick={() => onOpen(learning)}
      className="group w-full text-left rounded-2xl border border-border bg-surface p-5 transition-all hover:border-ink/25 hover:shadow-[0_2px_16px_-8px_rgba(10,10,10,0.28)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
            captured ? "bg-ink text-on-primary" : "bg-field text-ink/50"
          }`}
          aria-hidden
        >
          {captured ? (
            <HiOutlineSparkles className="h-3.5 w-3.5" />
          ) : (
            <HiOutlineLightBulb className="h-3.5 w-3.5" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-snug text-ink">{learning.title}</h3>

          {preview && (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink/60">{preview}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            {learning.practiceAreaCode ? (
              <Badge variant="info">{practiceAreaName(learning.practiceAreaCode)}</Badge>
            ) : (
              <Badge variant="neutral">Firm-wide</Badge>
            )}
            {learning.clientType && (
              <Badge variant="neutral">{learning.clientType.replace(/_/g, " ")}</Badge>
            )}
            <span className="text-[11px] text-ink/35">·</span>
            <span className="text-[11px] font-medium text-ink/45">
              {captured ? "Captured from a negotiation" : learning.loggedByName || "Recorded"}
            </span>
            {learning.matterReference && (
              <>
                <span className="text-[11px] text-ink/35">·</span>
                <span className="font-mono text-[11px] text-ink/45">
                  {learning.matterReference}
                </span>
              </>
            )}
            <span className="ml-auto shrink-0 text-[11px] text-ink/40">
              {formatDate(learning.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
