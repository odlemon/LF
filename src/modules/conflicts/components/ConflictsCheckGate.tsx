"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/utils/permissions";
import {
  ClearConflictCheckCommand,
  ConflictCheckView,
  ConflictMatch,
  ConflictMatchResolution,
  ConflictParty,
  ConflictPartyRole,
  PartySubmission,
} from "../types";

const ROLE_OPTIONS = [
  { value: "OPPOSING_PARTY", label: "Opposing party" },
  { value: "RELATED_ENTITY", label: "Related entity" },
  { value: "OTHER", label: "Other" },
];

const SOURCE_LABEL: Record<string, string> = {
  EXISTING_CLIENT: "Existing client",
  PRIOR_MATTER_PARTY: "Prior matter party",
};

interface Row {
  name: string;
  role: ConflictPartyRole;
}

interface ConflictsCheckGateProps {
  clientName: string;
  view: ConflictCheckView | null;
  isLoading: boolean;
  error: string | null;
  runCheck: (parties: PartySubmission[]) => Promise<ConflictCheckView>;
  clearCheck: (command: ClearConflictCheckCommand) => Promise<ConflictCheckView>;
}

export function ConflictsCheckGate({
  clientName,
  view,
  isLoading,
  error,
  runCheck,
  clearCheck,
}: ConflictsCheckGateProps) {
  const canClear = usePermission(PERMISSIONS.CONFLICTS_CHECK_CLEAR);

  const [rows, setRows] = useState<Row[]>([{ name: "", role: "OPPOSING_PARTY" }]);
  const [isRunning, setIsRunning] = useState(false);

  const [decision, setDecision] = useState<"CLEARED" | "WAIVED" | "FLAGGED">("CLEARED");
  const [note, setNote] = useState("");
  const [resolutions, setResolutions] = useState<Record<string, ConflictMatchResolution>>({});
  const [isDeciding, setIsDeciding] = useState(false);

  if (isLoading) {
    return (
      <div className="relative flex-1 flex items-center justify-center">
        <p className="text-sm font-semibold text-ink/60">Loading conflicts check…</p>
      </div>
    );
  }

  if (error && !view) {
    return (
      <div className="relative flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm">
          <Alert variant="error" message={error} />
        </div>
      </div>
    );
  }

  if (!view) {
    return null;
  }

  const { check, parties, matches } = view;
  const canSubmit = check.status === "NOT_STARTED" || check.status === "FLAGGED";
  const hasHistory = parties.length > 0;

  const addRow = () => setRows((prev) => [...prev, { name: "", role: "OPPOSING_PARTY" }]);
  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));
  const updateRow = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const handleRunCheck = async () => {
    setIsRunning(true);
    try {
      const submissions = [
        { name: clientName, role: "CLIENT" as ConflictPartyRole },
        ...rows.filter((r) => r.name.trim()).map((r) => ({ name: r.name.trim(), role: r.role })),
      ];
      const updated = await runCheck(submissions);
      if (updated.check.status === "CLEARED") {
        toast.success("No conflicting parties found — you can continue.");
      } else if (updated.check.status === "PENDING_REVIEW") {
        toast("Possible conflicts found — sent for Partner review.", { icon: "⚠️" });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to run conflicts check");
    } finally {
      setIsRunning(false);
    }
  };

  const handleDecide = async () => {
    if (decision !== "CLEARED" && !note.trim()) {
      toast.error("A note is required to waive or confirm a conflict");
      return;
    }
    setIsDeciding(true);
    try {
      await clearCheck({ decision, note: note.trim() || undefined, matchResolutions: resolutions });
      toast.success(
        decision === "CLEARED"
          ? "Conflicts check cleared."
          : decision === "WAIVED"
          ? "Conflict waived — matter can proceed."
          : "Conflict confirmed — matter is blocked."
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to record decision");
    } finally {
      setIsDeciding(false);
    }
  };

  return (
    <div className="relative flex-1 flex items-start justify-center overflow-y-auto py-10 px-4 sm:px-6 bg-canvas">
      <div className="w-full max-w-xl flex flex-col gap-5">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/60">
            Before this matter can be priced
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Conflicts-of-interest check
          </h2>
          <p className="mt-2 text-sm text-ink/60 leading-relaxed">
            Name every party involved in this matter. We search them against the firm&apos;s
            existing clients and every party recorded on any past or current matter.
          </p>
        </div>

        {check.status === "FLAGGED" && (
          <Alert
            variant="error"
            message={`This matter is blocked: a conflict was confirmed${
              check.clearanceNote ? ` — "${check.clearanceNote}"` : "."
            }`}
          />
        )}

        {hasHistory && (
          <div className="bg-surface rounded-2xl border border-border/60 shadow-sm p-5 flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
              Submitted parties
            </p>
            <div className="flex flex-wrap gap-2">
              {parties.map((p: ConflictParty) => (
                <span
                  key={p.uid}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border border-border/60 bg-field text-ink/80"
                >
                  {p.name}
                  <span className="text-ink/40">
                    {p.role === "CLIENT" ? "client" : p.role.toLowerCase().replace("_", " ")}
                  </span>
                </span>
              ))}
            </div>

            {matches.length > 0 && (
              <div className="flex flex-col gap-2 pt-1">
                <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
                  Possible matches
                </p>
                {matches.map((m: ConflictMatch) => (
                  <div
                    key={m.uid}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-amber-50/70 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-800/40"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{m.matchedName}</p>
                      <p className="text-xs text-ink/60">
                        {SOURCE_LABEL[m.matchedSource] || m.matchedSource}
                      </p>
                    </div>
                    {check.status === "PENDING_REVIEW" && canClear && (
                      <select
                        value={resolutions[m.uid] || "UNRESOLVED"}
                        onChange={(e) =>
                          setResolutions((prev) => ({
                            ...prev,
                            [m.uid]: e.target.value as ConflictMatchResolution,
                          }))
                        }
                        className="text-xs font-semibold bg-surface border border-border rounded-full px-3 py-1.5"
                      >
                        <option value="UNRESOLVED">Unresolved</option>
                        <option value="ACKNOWLEDGED_NOT_A_CONFLICT">Not a conflict</option>
                        <option value="CONFIRMED_CONFLICT">Confirmed conflict</option>
                      </select>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {check.status === "PENDING_REVIEW" && !canClear && (
          <Alert
            variant="warning"
            message="Possible conflicts were found. A Partner needs to review and clear this before pricing can continue."
          />
        )}

        {check.status === "PENDING_REVIEW" && canClear && (
          <div className="bg-surface rounded-2xl border border-border/60 shadow-sm p-5 flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
              Partner decision
            </p>
            <Select
              label="Decision"
              value={decision}
              onChange={(v) => setDecision(v as "CLEARED" | "WAIVED" | "FLAGGED")}
              options={[
                { value: "CLEARED", label: "Clear — not a real conflict" },
                { value: "WAIVED", label: "Waive — real, but consented / managed" },
                { value: "FLAGGED", label: "Flag — confirmed conflict, block matter" },
              ]}
            />
            <Textarea
              placeholder={
                decision === "CLEARED"
                  ? "Optional note"
                  : "Required: explain the waiver or the confirmed conflict"
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
            <Button variant="cta" onClick={handleDecide} loading={isDeciding}>
              Record decision
            </Button>
          </div>
        )}

        {canSubmit && (
          <div className="bg-surface rounded-2xl border border-border/60 shadow-sm p-5 flex flex-col gap-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
              {check.status === "FLAGGED" ? "Revise parties and re-run" : "Parties"}
            </p>
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-field border border-border/60">
              <span className="text-sm font-semibold text-ink">{clientName}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-ink/40">
                Client
              </span>
            </div>
            {rows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  placeholder="Party name (e.g. opposing counsel, related company)"
                  value={row.name}
                  onChange={(e) => updateRow(i, { name: e.target.value })}
                  className="flex-1"
                />
                <div className="w-44 shrink-0">
                  <Select
                    value={row.role}
                    onChange={(v) => updateRow(i, { role: v as ConflictPartyRole })}
                    options={ROLE_OPTIONS}
                  />
                </div>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-ink/40 hover:text-red-600 text-xs font-bold px-2"
                    aria-label="Remove party"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={addRow}
                className="text-xs font-bold text-ink/60 hover:text-ink"
              >
                + Add another party
              </button>
              <Button variant="cta" onClick={handleRunCheck} loading={isRunning}>
                Run check
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
