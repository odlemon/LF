"use client";

import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { fieldClassName } from "@/components/ui/Input";
import { analyticsApi } from "@/lib/api/modules/analytics.api";
import { usePermission } from "@/hooks/usePermission";
import { PERMISSIONS } from "@/lib/utils/permissions";
import type { AnomalyEffectiveness, AnomalyThresholds } from "@/modules/analytics/types";

/** Detector switches, paired with the setting that tunes each one. */
const DETECTORS: {
  key: keyof AnomalyThresholds;
  type: string;
  label: string;
  tuning?: { key: keyof AnomalyThresholds; label: string; step: string; hint: string }[];
}[] = [
  {
    key: "scopeOverrunEnabled",
    type: "SCOPE_OVERRUN",
    label: "Scope overrun",
    tuning: [
      {
        key: "scopeOverrunRatio",
        label: "Flag at this multiple of practice-area average hours",
        step: "0.05",
        hint: "1.05–5. Lower flags more.",
      },
    ],
  },
  {
    key: "excessRoundsEnabled",
    type: "EXCESS_ROUNDS",
    label: "Excess negotiation rounds",
    tuning: [
      {
        key: "excessRoundsRatio",
        label: "Flag at this multiple of the firm's average rounds",
        step: "0.1",
        hint: "1.1–10. Lower flags more.",
      },
    ],
  },
  {
    key: "marginBelowPaAvgEnabled",
    type: "MARGIN_BELOW_PA_AVG",
    label: "Margin below practice-area average",
    tuning: [
      { key: "paMarginMediumRelPct", label: "Medium severity at (% below)", step: "0.5", hint: "Must exceed the low band." },
      { key: "paMarginLowRelPct", label: "Low severity at (% below)", step: "0.5", hint: "Must sit below the medium band." },
    ],
  },
  {
    key: "rateDeviationEnabled",
    type: "RATE_DEVIATION",
    label: "Rate below recommendation",
    tuning: [
      { key: "rateRecoMediumRelPct", label: "Medium severity at (% below)", step: "0.5", hint: "Must exceed the low band." },
      { key: "rateRecoLowRelPct", label: "Low severity at (% below)", step: "0.5", hint: "Must sit below the medium band." },
    ],
  },
  {
    key: "rateAboveCardEnabled",
    type: "RATE_ABOVE_CARD",
    label: "Rate off the card",
    tuning: [
      {
        key: "rateDeviationTolerancePct",
        label: "Tolerance below card before flagging (%)",
        step: "0.5",
        hint: "Higher tolerates more variance.",
      },
    ],
  },
  { key: "marginBelowFloorEnabled", type: "MARGIN_BELOW_FLOOR", label: "Margin below the firm floor" },
  { key: "discountAboveMaxEnabled", type: "DISCOUNT_ABOVE_MAX", label: "Discount above partner maximum" },
];

/**
 * Detector performance and tuning, side by side.
 *
 * <p>These belong together: the false-positive rate is the evidence that a threshold is wrong,
 * and the threshold is the thing you change in response. Separating them would mean noticing a
 * problem on one screen and fixing it on another.
 */
export function DetectorTuningPanel() {
  const canManage = usePermission(PERMISSIONS.ANOMALY_THRESHOLD_MANAGE);
  const [effectiveness, setEffectiveness] = useState<AnomalyEffectiveness | null>(null);
  const [thresholds, setThresholds] = useState<AnomalyThresholds | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    Promise.all([
      analyticsApi.getAnomalyEffectiveness().catch(() => null),
      analyticsApi.getAnomalyThresholds().catch(() => null),
    ])
      .then(([e, t]) => {
        setEffectiveness(e);
        setThresholds(t);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!thresholds) return;
    setSaving(true);
    try {
      setThresholds(await analyticsApi.saveAnomalyThresholds(thresholds));
      toast.success("Detector settings saved");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not save the settings");
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setSaving(true);
    try {
      setThresholds(await analyticsApi.resetAnomalyThresholds());
      toast.success("Reset to the built-in defaults");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not reset");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-field/60" />;
  }
  if (!effectiveness || !thresholds) {
    return null;
  }

  const byType = new Map(effectiveness.detectors.map((d) => [d.anomalyType, d]));

  return (
    <section className="rounded-2xl border border-border/70 bg-surface p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
            Detector performance
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-ink">
            Are these flags worth reading?
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {effectiveness.overallFalsePositiveRatePct !== null && (
            <span
              className={`rounded-full px-2.5 py-1 text-xs ${
                effectiveness.overallFalsePositiveRatePct >= 50
                  ? "bg-amber-50 text-amber-700"
                  : "bg-field text-ink/55"
              }`}
            >
              {effectiveness.overallFalsePositiveRatePct}% dismissed as valid
            </span>
          )}
          {canManage && (
            <Button variant="secondary" onClick={() => setOpen((o) => !o)}>
              {open ? "Hide tuning" : "Tune detectors"}
            </Button>
          )}
        </div>
      </div>

      <p className="mt-2 text-xs text-ink/50">
        When a reviewer closes a flag as a valid exception they are saying the detector was
        wrong. A detector routinely dismissed is mis-tuned for this firm — the rate only appears
        once it has been judged {effectiveness.minReviewedForRate} times.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] text-ink/45">
              <th className="pb-2 font-medium">Detector</th>
              <th className="pb-2 text-right font-medium">Flags</th>
              <th className="pb-2 text-right font-medium">Open</th>
              <th className="pb-2 text-right font-medium">Actioned</th>
              <th className="pb-2 text-right font-medium">Dismissed</th>
              <th className="pb-2 text-right font-medium">False positive</th>
            </tr>
          </thead>
          <tbody>
            {effectiveness.detectors.map((d) => (
              <tr key={d.anomalyType} className="border-b border-border/50 last:border-0">
                <td className="py-2.5">
                  <span className={d.enabled ? "text-ink" : "text-ink/40 line-through"}>
                    {d.anomalyType.replace(/_/g, " ").toLowerCase()}
                  </span>
                  {!d.enabled && (
                    <span className="ml-2 rounded-full bg-field px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink/45">
                      off
                    </span>
                  )}
                  <p className="mt-0.5 text-[11px] text-ink/45">{d.verdict}</p>
                </td>
                <td className="py-2.5 text-right tabular-nums text-ink/70">{d.totalFlags}</td>
                <td className="py-2.5 text-right tabular-nums text-ink/70">{d.open}</td>
                <td className="py-2.5 text-right tabular-nums text-ink/70">{d.actioned}</td>
                <td className="py-2.5 text-right tabular-nums text-ink/70">
                  {d.dismissedAsValid}
                </td>
                <td className="py-2.5 text-right tabular-nums">
                  {d.falsePositiveRatePct === null ? (
                    <span className="text-ink/25">—</span>
                  ) : (
                    <span
                      className={
                        d.falsePositiveRatePct >= 50 ? "text-amber-700" : "text-ink/70"
                      }
                    >
                      {d.falsePositiveRatePct}%
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && canManage && (
        <div className="mt-6 border-t border-border pt-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
            Tuning
          </p>
          <div className="mt-4 flex flex-col gap-5">
            {DETECTORS.map((d) => {
              const stats = byType.get(d.type);
              const enabled = thresholds[d.key] as boolean;
              return (
                <div key={d.type} className="rounded-2xl border border-border bg-field/30 p-4">
                  <label className="flex items-center gap-2.5 text-sm font-medium text-ink">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) =>
                        setThresholds({ ...thresholds, [d.key]: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-border"
                    />
                    {d.label}
                    {stats && stats.falsePositiveRatePct !== null &&
                      stats.falsePositiveRatePct >= 50 && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                          noisy
                        </span>
                      )}
                  </label>

                  {d.tuning && enabled && (
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {d.tuning.map((t) => (
                        <div key={String(t.key)} className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-ink/60">
                            {t.label}
                          </label>
                          <input
                            type="number"
                            step={t.step}
                            value={String(thresholds[t.key] ?? "")}
                            onChange={(e) =>
                              setThresholds({
                                ...thresholds,
                                [t.key]: Number(e.target.value),
                              })
                            }
                            className={fieldClassName}
                          />
                          <span className="text-[11px] text-ink/40">{t.hint}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={reset} disabled={saving}>
              Reset to defaults
            </Button>
            <Button variant="cta" onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </div>
          <p className="mt-3 text-[11px] text-ink/40">
            Changes affect matters scanned from now on. Existing flags are left as they are —
            silently re-judging past decisions would rewrite a record people have already acted on.
          </p>
        </div>
      )}
    </section>
  );
}
