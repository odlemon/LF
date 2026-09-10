"use client";

import React from "react";
import { HiOutlineSparkles, HiPencil, HiTrash } from "react-icons/hi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/format";
import type { MatterLearning } from "@/lib/api/modules/matterLearning.api";
import { parseLesson } from "../lib/lesson";
import { AUTHOR_ADVISOR } from "./LearningCard";

/**
 * Reading view for one position.
 *
 * A position written from a closed negotiation runs to several hundred words under headings.
 * Dropping straight into an edit form — which is what this screen used to do on click — made the
 * common action (read it) impossible without wading through a textarea, and the rare one (revise
 * it) the default.
 */
export function LearningDetail({
  learning,
  practiceAreaName,
  onEdit,
  onRemove,
  removing,
}: {
  learning: MatterLearning;
  practiceAreaName: (code?: string | null) => string;
  onEdit: () => void;
  onRemove: () => void;
  removing: boolean;
}) {
  const sections = parseLesson(learning.learningText);
  const captured = learning.loggedByName === AUTHOR_ADVISOR;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold leading-snug tracking-tight text-ink">
          {learning.title}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {learning.practiceAreaCode ? (
            <Badge variant="info">{practiceAreaName(learning.practiceAreaCode)}</Badge>
          ) : (
            <Badge variant="neutral">Firm-wide</Badge>
          )}
          {learning.clientType && (
            <Badge variant="neutral">{learning.clientType.replace(/_/g, " ")}</Badge>
          )}
        </div>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink/45">
          {captured ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-ink/60">
              <HiOutlineSparkles className="h-3.5 w-3.5" />
              Written automatically when this negotiation closed
            </span>
          ) : (
            <span>Added by {learning.loggedByName || "a colleague"}</span>
          )}
          <span>·</span>
          <span>{formatDate(learning.createdAt)}</span>
          {learning.matterReference && (
            <>
              <span>·</span>
              <span className="font-mono">{learning.matterReference}</span>
            </>
          )}
        </p>
      </header>

      <div className="flex flex-col gap-5 border-t border-border pt-5">
        {sections.map((section, i) => (
          <section key={i} className="flex flex-col gap-1.5">
            {section.heading && (
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-ink/40">
                {section.heading}
              </h3>
            )}
            {/* whitespace-pre-line: the advisor writes one point per line, and collapsing them
                into a paragraph turns a checklist into a run-on sentence. */}
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink/75">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="secondary" onClick={onRemove} disabled={removing}>
          <HiTrash className="h-4 w-4" />
          Remove
        </Button>
        <Button variant="primary" onClick={onEdit}>
          <HiPencil className="h-4 w-4" />
          Revise
        </Button>
      </div>

      {captured && (
        <p className="text-[12px] leading-relaxed text-ink/45">
          The pricing agent reads this when scoping comparable work. Revise it if the firm&apos;s
          position has moved — a correction here changes what every future scope is told.
        </p>
      )}
    </div>
  );
}
