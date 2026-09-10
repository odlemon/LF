"use client";

import React from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import type { AiProviderConfig } from "../types";
import { deploymentKind, endpointLabel, governedBy } from "../lib/deployment";

/**
 * What leaves the firm, where it goes, and whose contract governs it.
 *
 * Stated from the live configuration rather than as a fixed marketing claim, because it changes
 * with the deployment: a firm on its own Azure resource has a different answer from one still on
 * Lysp's managed capacity, and only the firm's own security review can tell them apart. The
 * screen should not pretend otherwise.
 */
export function DataHandlingPanel({ config }: { config: AiProviderConfig | null }) {
  if (!config) {
    return null;
  }
  const kind = deploymentKind(config);
  const host = endpointLabel(config);

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: "Requests go to",
      value: <span className="font-mono">{host}</span>,
    },
    {
      label: "What is sent",
      value:
        "The matter's scope, the rate card and past-matter figures relevant to it, and the firm's house view. Uploaded files are sent as extracted text, not as documents.",
    },
    {
      label: "What is not sent",
      value:
        "Client contact records, user credentials, billing data, and any matter outside the one being priced.",
    },
    {
      label: "Retention and training",
      value: governedBy(config),
    },
    {
      label: "Credential storage",
      value: (
        <>
          Encrypted at rest. Never returned by the API — only{" "}
          <span className="font-mono">{config.apiKeyHint}</span> is ever shown again.
        </>
      ),
    },
  ];

  return (
    <section className="rounded-2xl border border-border bg-surface">
      <header className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold text-ink">Data handling</h2>
        <p className="mt-0.5 text-[12px] text-ink/50">
          Read from the deployment currently in use, not from a fixed statement.
        </p>
      </header>

      <dl className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-1 gap-1 px-5 py-3.5 sm:grid-cols-3 sm:gap-4">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-ink/40 sm:pt-0.5">
              {row.label}
            </dt>
            <dd className="text-[13px] leading-relaxed text-ink/70 sm:col-span-2">{row.value}</dd>
          </div>
        ))}
      </dl>

      {kind === "MANAGED" && (
        <div className="flex items-start gap-2.5 border-t border-border bg-warning/5 px-5 py-4">
          <HiOutlineExclamationCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-[12px] leading-relaxed text-ink/65">
            This firm is on Lysp&apos;s managed capacity. That is fine for evaluation, but client
            matter text is reaching the vendor under Lysp&apos;s commercial terms rather than the
            firm&apos;s own. Connect an Azure OpenAI resource or a private endpoint before pricing
            live client work.
          </p>
        </div>
      )}
    </section>
  );
}
