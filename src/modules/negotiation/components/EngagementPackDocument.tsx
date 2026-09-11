"use client";

import type { EngagementPack } from "../types";
import { formatMoney } from "../utils";

type DocSection = "letter" | "schedule";

interface Props {
  pack: EngagementPack;
  section?: DocSection;
}

export function EngagementPackDocument({ pack, section = "letter" }: Props) {
  const currency = pack.currency || "GBP";
  const lines = pack.rateSchedule || [];

  if (section === "schedule") {
    return (
      <div className="engagement-doc mx-auto w-full max-w-[720px] bg-[#f7f4ef] text-ink shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="border-b border-ink/10 px-8 py-10 sm:px-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
            Annex A
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            Fee Schedule
          </h2>
          <p className="mt-2 text-sm text-ink/60">
            {pack.matterTitle}
            {pack.clientName ? ` · ${pack.clientName}` : ""}
          </p>
        </div>
        <div className="px-8 py-8 sm:px-12">
          <div className="overflow-x-auto rates-scrollable">
            <table className="w-full border-collapse text-sm">

              <thead>
                <tr className="border-b border-ink/15 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-ink/60">
                  <th className="pb-3 pr-3 font-bold">Fee earner level</th>
                  <th className="pb-3 pr-3 text-right font-bold">Hours</th>
                  <th className="pb-3 pr-3 text-right font-bold">Rate</th>
                  <th className="pb-3 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="border-b border-ink/8">
                    <td className="py-3 pr-3 align-top">
                      <span className="font-medium text-ink">
                        {line.feeEarnerLevelName ||
                          line.feeEarnerLevelCode ||
                          "—"}
                      </span>
                      {line.description && (
                        <p className="mt-0.5 text-xs text-ink/60">
                          {line.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 pr-3 text-right tabular-nums text-ink/70">
                      {line.hours != null ? Number(line.hours) : "—"}
                    </td>
                    <td className="py-3 pr-3 text-right tabular-nums text-ink/70">
                      {formatMoney(line.hourlyRate, currency)}
                    </td>
                    <td className="py-3 text-right tabular-nums font-medium text-ink">
                      {formatMoney(line.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={3}
                    className="pt-4 text-sm font-semibold text-ink"
                  >
                    Agreed estimated total
                  </td>
                  <td className="pt-4 text-right text-sm font-semibold tabular-nums text-ink">
                    {formatMoney(pack.agreedGrossFees, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="engagement-doc mx-auto w-full max-w-[720px] bg-[#f7f4ef] text-ink shadow-[0_1px_0_rgba(0,0,0,0.04)]">
      <div
        className="engagement-letter-body print:bg-white px-8 py-10 text-[13.5px] leading-[1.7] text-ink/85 sm:px-12 sm:py-12 [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-ink [&_h2]:mb-2 [&_h2]:mt-7 [&_h2]:text-[11px] [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-[0.14em] [&_h2]:text-ink/60 [&_p]:mb-3 [&_strong]:font-semibold [&_strong]:text-ink [&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border-b [&_td]:border-ink/8 [&_td]:py-2 [&_td]:align-top [&_th]:border-b [&_th]:border-ink/15 [&_th]:pb-2 [&_th]:text-left [&_th]:text-[10px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[0.12em] [&_th]:text-ink/60 [&_.letter-head]:mb-8 [&_.letter-head]:border-b [&_.letter-head]:border-ink/10 [&_.letter-head]:pb-6 [&_.firm-name]:text-lg [&_.firm-name]:font-semibold [&_.firm-name]:tracking-tight [&_.firm-name]:text-ink [&_.firm-address]:mt-1 [&_.firm-address]:text-xs [&_.firm-address]:text-ink/60 [&_.letter-date]:mt-3 [&_.letter-date]:text-xs [&_.letter-date]:text-ink/60 [&_.salutation]:mb-4 [&_.matter-ref]:mb-5 [&_.signature-block]:mt-10 [&_.signature-block]:grid [&_.signature-block]:gap-8 [&_.signature-block]:sm:grid-cols-2 [&_.sig-label]:mb-6 [&_.sig-label]:text-xs [&_.sig-label]:font-semibold [&_.sig-label]:text-ink [&_.sig-line]:mb-2 [&_.sig-meta]:text-xs [&_.sig-meta]:text-ink/60 [&_.annex]:mt-12 [&_.annex]:border-t [&_.annex]:border-ink/10 [&_.annex]:pt-8 [&_.num]:text-right [&_.num]:tabular-nums"
        dangerouslySetInnerHTML={{
          __html: pack.letterBodyHtml || "<p>Letter not available.</p>",
        }}
      />
    </div>
  );
}

export function EngagementPackStatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const label =
    status === "ACKNOWLEDGED"
      ? "Acknowledged"
      : status === "SENT"
        ? "Sent"
        : status === "DRAFT"
          ? "Draft"
          : status || "—";
  return (
    <span className="inline-flex items-center rounded-full border border-border/80 bg-field px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">
      {label}
    </span>
  );
}
