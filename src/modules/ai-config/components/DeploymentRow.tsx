"use client";

import React from "react";
import {
  HiOutlineCheckCircle,
  HiOutlineCloud,
  HiOutlineExclamationCircle,
  HiOutlineOfficeBuilding,
  HiOutlineServer,
} from "react-icons/hi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { AiProviderConfig } from "../types";
import {
  deploymentKind,
  endpointLabel,
  KIND_LABEL,
  PROVIDER_LABEL,
  type DeploymentKind,
} from "../lib/deployment";

const KIND_ICON: Record<DeploymentKind, React.ComponentType<{ className?: string }>> = {
  AZURE: HiOutlineOfficeBuilding,
  PRIVATE: HiOutlineServer,
  MANAGED: HiOutlineCloud,
};

function testedLabel(config: AiProviderConfig): { text: string; ok: boolean | null } {
  if (!config.lastTestedAt) return { text: "Never verified", ok: null };
  const when = new Date(config.lastTestedAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return {
    text: config.lastTestResult === "SUCCESS" ? `Verified ${when}` : `Failed ${when}`,
    ok: config.lastTestResult === "SUCCESS",
  };
}

/**
 * One configured deployment.
 *
 * Leads with where the inference runs, because that is the fact a firm's security review asks
 * about first. The vendor and model are secondary — a firm that has moved its capacity into its
 * own tenant cares more that the hostname is theirs than which family the weights come from.
 */
export function DeploymentRow({
  config,
  isActive,
  onActivate,
  onTest,
  onEdit,
  onRemove,
  busy,
}: {
  config: AiProviderConfig;
  isActive: boolean;
  onActivate: (c: AiProviderConfig) => void;
  onTest: (c: AiProviderConfig) => void;
  onEdit: (c: AiProviderConfig) => void;
  onRemove: (c: AiProviderConfig) => void;
  busy: boolean;
}) {
  const kind = deploymentKind(config);
  const Icon = KIND_ICON[kind];
  const tested = testedLabel(config);

  return (
    <div
      className={`rounded-2xl border bg-surface p-5 transition-colors ${
        isActive ? "border-ink/30" : "border-border"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
              isActive ? "bg-ink text-on-primary" : "bg-field text-ink/60"
            }`}
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-ink">{KIND_LABEL[kind]}</h3>
              {isActive && <Badge variant="primary">Serving now</Badge>}
            </div>
            <p className="mt-1 truncate font-mono text-[12px] text-ink/60">
              {endpointLabel(config)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink/60">
              <span className="font-semibold text-ink/60">{PROVIDER_LABEL[config.provider]}</span>
              <span>·</span>
              <span className="font-mono">{config.modelName}</span>
              {config.deploymentName && (
                <>
                  <span>·</span>
                  <span className="font-mono">{config.deploymentName}</span>
                </>
              )}
              <span>·</span>
              <span className="font-mono">key {config.apiKeyHint}</span>
              <span>·</span>
              <span
                className={`inline-flex items-center gap-1 ${
                  tested.ok === false ? "text-warning" : ""
                }`}
              >
                {tested.ok === true && <HiOutlineCheckCircle className="h-3.5 w-3.5" />}
                {tested.ok === false && <HiOutlineExclamationCircle className="h-3.5 w-3.5" />}
                {tested.text}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => onTest(config)} disabled={busy}>
            Verify
          </Button>
          <Button variant="secondary" onClick={() => onEdit(config)} disabled={busy}>
            Edit
          </Button>
          {!isActive && (
            <>
              <Button variant="primary" onClick={() => onActivate(config)} disabled={busy}>
                Use this
              </Button>
              <Button variant="secondary" onClick={() => onRemove(config)} disabled={busy}>
                Remove
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
