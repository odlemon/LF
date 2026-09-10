"use client";

import { useEffect, useMemo, useState } from "react";
import { HiMinus, HiPlus, HiTrash } from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import type { FeeEarnerLevel } from "@/modules/firm/types";
import type {
  PricingModel,
  PricingScenario,
  PricingScenarioLine,
  ScenarioLineEdit,
  UpdateScenarioCommand,
} from "../types";
import { PRICING_MODEL_LABELS } from "../types";
import { Select } from "@/components/ui/Select";

interface WhatIfPanelProps {
  scenario: PricingScenario;
  saving: boolean;
  feeEarnerLevels?: FeeEarnerLevel[];
  onApply: (command: UpdateScenarioCommand) => Promise<void>;
}

type DraftLine = {
  key: string;
  id?: string;
  phaseName: string;
  description: string;
  hours: string;
  hourlyRate: string;
  feeEarnerLevelUid: string;
  feeEarnerLevelCode: string;
  feeEarnerLevelName: string;
};

function StepperControl({
  label,
  valueLabel,
  hint,
  onDec,
  onInc,
  canDec,
  canInc,
}: {
  label: string;
  valueLabel: string;
  hint: string;
  onDec: () => void;
  onInc: () => void;
  canDec: boolean;
  canInc: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-canvas/40 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
            {label}
          </p>
          <p className="mt-2 text-[1.65rem] font-semibold tabular-nums tracking-tight text-ink leading-none">
            {valueLabel}
          </p>
          <p className="mt-1.5 text-[11px] text-ink/40 leading-snug">{hint}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
          <button
            type="button"
            onClick={onDec}
            disabled={!canDec}
            aria-label={`Decrease ${label}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-surface text-ink/60 transition-colors hover:border-ink/20 hover:text-ink disabled:opacity-30 disabled:hover:border-border/70 disabled:hover:text-ink/60"
          >
            <HiMinus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onInc}
            disabled={!canInc}
            aria-label={`Increase ${label}`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-surface text-ink/60 transition-colors hover:border-ink/20 hover:text-ink disabled:opacity-30 disabled:hover:border-border/70 disabled:hover:text-ink/60"
          >
            <HiPlus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function linesToDraft(lines: PricingScenarioLine[]): DraftLine[] {
  return lines.map((line, i) => ({
    key: line.id || `tmp-${i}`,
    id: line.id,
    phaseName: line.phaseName || "Other",
    description: line.description || line.feeEarnerLevelName || "",
    hours: String(Number(line.hours ?? 0)),
    hourlyRate: String(Number(line.hourlyRate ?? 0)),
    feeEarnerLevelUid: line.feeEarnerLevelUid || "",
    feeEarnerLevelCode: line.feeEarnerLevelCode || "",
    feeEarnerLevelName: line.feeEarnerLevelName || "",
  }));
}

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

const MODEL_OPTIONS = Object.keys(PRICING_MODEL_LABELS) as PricingModel[];

export function WhatIfPanel({
  scenario,
  saving,
  feeEarnerLevels = [],
  onApply,
}: WhatIfPanelProps) {
  const [name, setName] = useState(scenario.name);
  const [pricingModel, setPricingModel] = useState<PricingModel>(
    scenario.pricingModel
  );
  const [effortX, setEffortX] = useState(1);
  const [discountPct, setDiscountPct] = useState(0);
  const [capAmount, setCapAmount] = useState("");
  const [draftLines, setDraftLines] = useState<DraftLine[]>([]);
  const [showBreakdown, setShowBreakdown] = useState(true);

  useEffect(() => {
    setName(scenario.name);
    setPricingModel(scenario.pricingModel);
    setEffortX(Number(scenario.hoursMultiplier || 1));
    setDiscountPct(Number(scenario.discountPct || 0));
    setCapAmount(
      scenario.capAmount != null && scenario.capAmount !== undefined
        ? String(scenario.capAmount)
        : ""
    );
    setDraftLines(linesToDraft(scenario.lines ?? []));
  }, [
    scenario.id,
    scenario.name,
    scenario.pricingModel,
    scenario.hoursMultiplier,
    scenario.discountPct,
    scenario.capAmount,
    scenario.lines,
  ]);

  const showCap =
    pricingModel === "HOURLY_WITH_CAP" || pricingModel === "HYBRID";

  const liveLineTotal = useMemo(
    () =>
      draftLines.reduce((sum, line) => {
        const h = Number(line.hours) || 0;
        const r = Number(line.hourlyRate) || 0;
        return sum + h * r;
      }, 0),
    [draftLines]
  );

  const linesDirty = useMemo(() => {
    const original = scenario.lines ?? [];
    if (draftLines.length !== original.length) return true;
    return draftLines.some((d, i) => {
      const o = original[i];
      if (!o) return true;
      return (
        d.id !== o.id ||
        d.phaseName !== (o.phaseName || "Other") ||
        d.description !== (o.description || o.feeEarnerLevelName || "") ||
        Math.abs(Number(d.hours) - Number(o.hours)) > 0.001 ||
        Math.abs(Number(d.hourlyRate) - Number(o.hourlyRate)) > 0.001 ||
        d.feeEarnerLevelUid !== (o.feeEarnerLevelUid || "")
      );
    });
  }, [draftLines, scenario.lines]);

  const dirty =
    name.trim() !== scenario.name ||
    pricingModel !== scenario.pricingModel ||
    Math.abs(effortX - Number(scenario.hoursMultiplier || 1)) > 0.001 ||
    Math.abs(discountPct - Number(scenario.discountPct || 0)) > 0.001 ||
    (showCap &&
      (capAmount === ""
        ? scenario.capAmount != null
        : Number(capAmount) !== Number(scenario.capAmount ?? NaN))) ||
    linesDirty;

  const nudgeEffort = (delta: number) => {
    setEffortX((v) => {
      const next = Math.round(Math.min(3, Math.max(0.5, v + delta)) * 100) / 100;
      const ratio = next / (v || 1);
      if (Math.abs(ratio - 1) > 0.0001) {
        setDraftLines((lines) =>
          lines.map((l) => ({
            ...l,
            hours: String(
              Math.round((Number(l.hours) || 0) * ratio * 100) / 100
            ),
          }))
        );
      }
      return next;
    });
  };
  const nudgeDiscount = (delta: number) => {
    setDiscountPct((v) => Math.min(40, Math.max(0, v + delta)));
  };

  const updateLine = (key: string, patch: Partial<DraftLine>) => {
    setDraftLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, ...patch } : l))
    );
  };

  const removeLine = (key: string) => {
    setDraftLines((prev) => prev.filter((l) => l.key !== key));
  };

  const addLine = () => {
    const level = feeEarnerLevels[0];
    setDraftLines((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}`,
        phaseName: prev[prev.length - 1]?.phaseName || "Other",
        description: "",
        hours: "1",
        hourlyRate: "250",
        feeEarnerLevelUid: level?.uid || "",
        feeEarnerLevelCode: level?.code || "",
        feeEarnerLevelName: level?.name || "",
      },
    ]);
    setShowBreakdown(true);
  };

  const applyLevel = (key: string, levelUid: string) => {
    const level = feeEarnerLevels.find((l) => l.uid === levelUid);
    updateLine(key, {
      feeEarnerLevelUid: levelUid,
      feeEarnerLevelCode: level?.code || "",
      feeEarnerLevelName: level?.name || "",
    });
  };

  const handleApply = async (preset?: {
    effortX?: number;
    discountPct?: number;
  }) => {
    let nextEffort = effortX;
    let nextDiscount = discountPct;
    let linesForSave = draftLines;

    if (preset?.effortX != null) {
      const ratio = preset.effortX / (effortX || 1);
      nextEffort = Math.round(Math.min(3, Math.max(0.5, preset.effortX)) * 100) / 100;
      if (Math.abs(ratio - 1) > 0.0001) {
        linesForSave = draftLines.map((l) => ({
          ...l,
          hours: String(
            Math.round((Number(l.hours) || 0) * ratio * 100) / 100
          ),
        }));
        setDraftLines(linesForSave);
      }
      setEffortX(nextEffort);
    }
    if (preset?.discountPct != null) {
      nextDiscount = preset.discountPct;
      setDiscountPct(nextDiscount);
    }

    const command: UpdateScenarioCommand = {
      hoursMultiplier: nextEffort,
      discountPct: nextDiscount,
      name: name.trim() || scenario.name,
      pricingModel,
    };
    if (showCap) {
      command.capAmount = capAmount === "" ? null : Number(capAmount);
    }

    const original = scenario.lines ?? [];
    const linesChanged =
      linesForSave.length !== original.length ||
      linesForSave.some((d, i) => {
        const o = original[i];
        if (!o) return true;
        return (
          d.id !== o.id ||
          d.phaseName !== (o.phaseName || "Other") ||
          d.description !== (o.description || o.feeEarnerLevelName || "") ||
          Math.abs(Number(d.hours) - Number(o.hours)) > 0.001 ||
          Math.abs(Number(d.hourlyRate) - Number(o.hourlyRate)) > 0.001 ||
          d.feeEarnerLevelUid !== (o.feeEarnerLevelUid || "")
        );
      });

    // Prefer sending absolute lines whenever the breakdown differs, so edits stick.
    if (linesChanged || name.trim() !== scenario.name || pricingModel !== scenario.pricingModel) {
      command.lines = linesForSave.map((d) => ({
        id: d.id,
        phaseName: d.phaseName.trim() || "Other",
        description: d.description.trim() || null,
        hours: Number(d.hours) || 0,
        hourlyRate: Number(d.hourlyRate) || 0,
        feeEarnerLevelUid: d.feeEarnerLevelUid || null,
        feeEarnerLevelCode: d.feeEarnerLevelCode || null,
        feeEarnerLevelName: d.feeEarnerLevelName || null,
      }));
    }

    await onApply(command);
  };

  const byPhase = useMemo(() => {
    const map = new Map<string, DraftLine[]>();
    for (const line of draftLines) {
      const key = line.phaseName || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(line);
    }
    return map;
  }, [draftLines]);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
            Scenario editor
          </h4>
          {dirty && (
            <p className="text-[11px] text-ink/40">Unsaved changes</p>
          )}
        </div>

        <div className="space-y-2.5">
          <div className="rounded-2xl border border-border/50 bg-canvas/40 px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
              Name
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full bg-transparent text-base font-semibold tracking-tight text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface placeholder:text-ink/25"
              placeholder="Scenario name"
            />
          </div>

          <div className="rounded-2xl border border-border/50 bg-canvas/40 px-4 py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
              Pricing model
            </p>
            <Select
              className="mt-2"
              value={pricingModel}
              onChange={(value) => setPricingModel(value as PricingModel)}
              options={MODEL_OPTIONS.map((m) => ({
                value: m,
                label: PRICING_MODEL_LABELS[m],
              }))}
            />
          </div>

          <StepperControl
            label="Effort scale"
            valueLabel={`${effortX.toFixed(2)}×`}
            hint="Multiplies every line’s hours (1.00× = current baseline)"
            onDec={() => nudgeEffort(-0.05)}
            onInc={() => nudgeEffort(0.05)}
            canDec={effortX > 0.5}
            canInc={effortX < 3}
          />
          <StepperControl
            label="Discount"
            valueLabel={`${discountPct}%`}
            hint="Commercial reduction on fees"
            onDec={() => nudgeDiscount(-1)}
            onInc={() => nudgeDiscount(1)}
            canDec={discountPct > 0}
            canInc={discountPct < 40}
          />

          {showCap && (
            <div className="rounded-2xl border border-border/50 bg-canvas/40 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/35">
                Fee cap
              </p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-sm text-ink/40">
                  {scenario.currency || "GBP"}
                </span>
                <input
                  type="number"
                  value={capAmount}
                  onChange={(e) => setCapAmount(e.target.value)}
                  className="w-full bg-transparent text-[1.65rem] font-semibold tabular-nums tracking-tight text-ink leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface placeholder:text-ink/20"
                  placeholder="Optional"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-ink/40">
                Ceiling for capped or hybrid models
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {[
            {
              label: "Lean −10%",
              run: () => void handleApply({ effortX: Math.max(0.5, effortX * 0.9) }),
            },
            {
              label: "Reset 1.00×",
              run: () => void handleApply({ effortX: 1 }),
            },
            {
              label: "Buffer +15%",
              run: () =>
                void handleApply({
                  effortX: Math.min(3, effortX * 1.15),
                }),
            },
            {
              label: "Clear discount",
              run: () => void handleApply({ discountPct: 0 }),
            },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={preset.run}
              className="rounded-full border border-border/70 bg-surface px-3 py-1 text-[11px] font-semibold text-ink/60 hover:text-ink hover:border-ink/25 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <button
            type="button"
            onClick={() => setShowBreakdown((v) => !v)}
            className="text-left"
          >
            <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/35">
              Fee breakdown
            </h4>
            <p className="mt-1 text-[11px] text-ink/40">
              Edit hours, rates, phases, or add lines · est.{" "}
              <span className="tabular-nums font-semibold text-ink/55">
                {formatMoney(liveLineTotal, scenario.currency)}
              </span>{" "}
              before discount
            </p>
          </button>
          <Button variant="secondary" onClick={addLine}>
            <HiPlus className="h-3.5 w-3.5" />
            Add line
          </Button>
        </div>

        {showBreakdown && (
          <div className="space-y-5">
            {[...byPhase.entries()].map(([phase, phaseLines]) => (
              <div key={phase}>
                <p className="text-[13px] font-semibold text-ink tracking-tight mb-2">
                  {phase}
                </p>
                <ul className="space-y-2">
                  {phaseLines.map((line) => {
                    const amount =
                      (Number(line.hours) || 0) *
                      (Number(line.hourlyRate) || 0);
                    return (
                      <li
                        key={line.key}
                        className="rounded-xl border border-border/60 bg-canvas/50 p-3.5 space-y-2.5"
                      >
                        <div className="flex items-start gap-2">
                          <input
                            value={line.description}
                            onChange={(e) =>
                              updateLine(line.key, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Work description"
                            className="flex-1 min-w-0 bg-transparent text-sm font-medium text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-surface placeholder:text-ink/30"
                          />
                          <button
                            type="button"
                            onClick={() => removeLine(line.key)}
                            className="p-1.5 rounded-lg text-ink/35 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            aria-label="Remove line"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <label className="block">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink/35">
                              Phase
                            </span>
                            <input
                              value={line.phaseName}
                              onChange={(e) =>
                                updateLine(line.key, {
                                  phaseName: e.target.value,
                                })
                              }
                              className="mt-1 w-full h-9 rounded-lg border border-border/70 bg-surface px-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-primary/10"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink/35">
                              Hours
                            </span>
                            <input
                              type="number"
                              min={0}
                              step={0.5}
                              value={line.hours}
                              onChange={(e) =>
                                updateLine(line.key, { hours: e.target.value })
                              }
                              className="mt-1 w-full h-9 rounded-lg border border-border/70 bg-surface px-2.5 text-xs tabular-nums text-ink focus:outline-none focus:ring-2 focus:ring-primary/10"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink/35">
                              Rate / h
                            </span>
                            <input
                              type="number"
                              min={0}
                              step={10}
                              value={line.hourlyRate}
                              onChange={(e) =>
                                updateLine(line.key, {
                                  hourlyRate: e.target.value,
                                })
                              }
                              className="mt-1 w-full h-9 rounded-lg border border-border/70 bg-surface px-2.5 text-xs tabular-nums text-ink focus:outline-none focus:ring-2 focus:ring-primary/10"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-ink/35">
                              Level
                            </span>
                            <Select
                              className="mt-1"
                              value={line.feeEarnerLevelUid}
                              onChange={(value) => applyLevel(line.key, value)}
                              placeholder="—"
                              options={[
                                { value: "", label: "—" },
                                ...(feeEarnerLevels ?? []).map((l) => ({
                                  value: l.uid,
                                  label: l.code || l.name,
                                })),
                              ]}
                            />
                          </label>
                        </div>
                        <p className="text-right text-xs tabular-nums font-semibold text-ink/70">
                          {formatMoney(amount, scenario.currency)}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {draftLines.length === 0 && (
              <p className="text-sm text-ink/40 py-4 text-center">
                No lines yet — add one to build the fee from scratch.
              </p>
            )}
          </div>
        )}
      </div>

      {dirty && (
        <Button
          variant="cta"
          className="w-full"
          loading={saving}
          onClick={() => void handleApply()}
        >
          Apply changes & recalculate
        </Button>
      )}
    </div>
  );
}
