"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { MatterLearning } from "@/lib/api/modules/matterLearning.api";

export interface LearningDraft {
  title: string;
  learningText: string;
  practiceAreaCode?: string;
  clientType?: string;
  matterReference?: string;
}

const CLIENT_TYPES = [
  { value: "", label: "Any client type" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "FINANCIAL_INSTITUTION", label: "Financial institution" },
  { value: "GOVERNMENT", label: "Government" },
  { value: "INDIVIDUAL", label: "Individual" },
];

const LABEL = "text-[10px] font-bold uppercase tracking-wider text-ink/60 pl-1 select-none";

export function LearningForm({
  existing,
  practiceAreas,
  saving,
  onCancel,
  onSave,
}: {
  existing: MatterLearning | null;
  practiceAreas: { code: string; name: string }[];
  saving: boolean;
  onCancel: () => void;
  onSave: (draft: LearningDraft) => void;
}) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [practiceArea, setPracticeArea] = useState("");
  const [clientType, setClientType] = useState("");
  const [matterRef, setMatterRef] = useState("");

  useEffect(() => {
    setTitle(existing?.title ?? "");
    setText(existing?.learningText ?? "");
    setPracticeArea(existing?.practiceAreaCode ?? "");
    setClientType(existing?.clientType ?? "");
    setMatterRef(existing?.matterReference ?? "");
  }, [existing]);

  const ready = title.trim().length > 0 && text.trim().length > 0;

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        onSave({
          title: title.trim(),
          learningText: text.trim(),
          practiceAreaCode: practiceArea || undefined,
          clientType: clientType || undefined,
          matterReference: matterRef.trim() || undefined,
        });
      }}
    >
      <div className="flex flex-col gap-1.5">
        <label className={LABEL} htmlFor="learning-title">
          The position, in one line
        </label>
        <Input
          id="learning-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. TSAs overrun on partial-stake deals"
          maxLength={200}
          autoFocus
        />
        <span className="pl-1 text-[11px] text-ink/60">
          Write the conclusion, not the topic. This is what a partner reads when scanning the list.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={LABEL} htmlFor="learning-body">
          In full
        </label>
        <Textarea
          id="learning-body"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write it as you would explain it to a partner about to price this kind of matter. The pricing agent reads this text directly."
          maxLength={4000}
        />
        <span className="pl-1 text-[11px] text-ink/60">{text.length} / 4000</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Practice area"
          placeholder="Applies firm-wide"
          value={practiceArea}
          onChange={setPracticeArea}
          options={[
            { value: "", label: "Applies firm-wide" },
            ...practiceAreas.map((pa) => ({ value: pa.code, label: pa.name })),
          ]}
        />
        <Select
          label="Client type"
          placeholder="Any client type"
          value={clientType}
          onChange={setClientType}
          options={CLIENT_TYPES}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={LABEL} htmlFor="learning-ref">
          Matter it came from <span className="font-normal normal-case">(optional)</span>
        </label>
        <Input
          id="learning-ref"
          value={matterRef}
          onChange={(e) => setMatterRef(e.target.value)}
          placeholder="e.g. MAT-2026-0412"
          maxLength={100}
        />
      </div>

      <p className="text-[12px] leading-relaxed text-ink/60">
        Leaving both narrowing fields blank makes this apply to every matter. Narrow it only when
        the position genuinely stops holding elsewhere — one nobody sees is worth nothing.
      </p>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={saving} disabled={!ready}>
          {existing ? "Save changes" : "Add it"}
        </Button>
      </div>
    </form>
  );
}
