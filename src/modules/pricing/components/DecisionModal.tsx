"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface DecisionModalProps {
  open: boolean;
  title: string;
  confirmLabel: string;
  loading: boolean;
  requireComment?: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
}

export function DecisionModal({
  open,
  title,
  confirmLabel,
  loading,
  requireComment,
  onClose,
  onConfirm,
}: DecisionModalProps) {
  const [comment, setComment] = useState("");

  // The component stays mounted between decisions, so without this the note from the previous
  // one is still in the box when the modal reopens. On a two-stage matrix that means the
  // partner's comment is what gets submitted as the finance sign-off.
  useEffect(() => {
    if (open) {
      setComment("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_40px_rgba(0,0,0,0.14)] w-full max-w-md p-6 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-ink tracking-tight">{title}</h3>
        <p className="mt-2 text-sm text-ink/50 leading-relaxed">
          The submitter will be notified in real time.
        </p>
        <label className="block mt-5 text-[11px] font-semibold text-ink/55 mb-1.5">
          Comment{requireComment ? "" : " (optional)"}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border bg-field px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/15 resize-none"
          placeholder="Add a short note…"
        />
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="cta"
            loading={loading}
            disabled={requireComment && !comment.trim()}
            onClick={() => onConfirm(comment.trim())}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
