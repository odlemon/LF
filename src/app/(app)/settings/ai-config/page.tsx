"use client";

import React, { useState } from "react";
import { HiOutlineExclamationCircle, HiPlus, HiRefresh } from "react-icons/hi";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useActiveProvider, useAiProviders } from "@/modules/ai-config/hooks/useAiConfig";
import type { AiProviderConfig } from "@/modules/ai-config/types";
import { ConnectDeploymentDrawer } from "@/modules/ai-config/components/ConnectDeploymentDrawer";
import { DataHandlingPanel } from "@/modules/ai-config/components/DataHandlingPanel";
import { DeploymentRow } from "@/modules/ai-config/components/DeploymentRow";
import { ActivateConfirmModal } from "@/modules/ai-config/components/ActivateConfirmModal";
import { RemoveConfirmModal } from "@/modules/ai-config/components/RemoveConfirmModal";
import { TestConnectionModal } from "@/modules/ai-config/components/TestConnectionModal";

/**
 * Model deployments.
 *
 * This screen used to be four cards — Anthropic, OpenAI, Gemini, DeepSeek — each asking for that
 * vendor's consumer API key. No firm of this size buys inference that way. They hold capacity in
 * their own cloud tenant, in a region their clients have approved, under an agreement their
 * general counsel has read, and they expect software to point at it.
 *
 * So the unit here is a deployment, not a vendor: where does inference run, under whose contract,
 * and what leaves the building to get there. The vendor is a detail of the deployment.
 */
export default function AiConfigPage() {
  const { providers, isLoading: providersLoading, refetch: refetchProviders } = useAiProviders();
  const { activeProvider, isLoading: activeLoading, refetch: refetchActive } = useActiveProvider();

  const [connectOpen, setConnectOpen] = useState(false);
  const [editing, setEditing] = useState<AiProviderConfig | null>(null);

  const [testConfig, setTestConfig] = useState<AiProviderConfig | null>(null);
  const [activateConfig, setActivateConfig] = useState<AiProviderConfig | null>(null);
  const [removeConfig, setRemoveConfig] = useState<AiProviderConfig | null>(null);

  const loading = providersLoading || activeLoading;

  const refreshAll = () => {
    refetchProviders();
    refetchActive();
  };

  const connect = () => {
    setEditing(null);
    setConnectOpen(true);
  };

  const edit = (config: AiProviderConfig) => {
    setEditing(config);
    setConnectOpen(true);
  };

  // The active row first: it is the one answering every question anybody asks about this screen.
  const ordered = [...providers].sort((a, b) => Number(b.active) - Number(a.active));

  return (
    <PermissionGate
      permission="AI_CONFIG_READ"
      fallback={
        <div className="mx-auto w-full max-w-5xl p-8">
          <Alert variant="error" message="You do not have permission to view AI configuration." />
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-8">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-ink">AI configuration</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink/60">
              Where Lysp sends a pricing request to be reasoned about. Point it at your own Azure
              OpenAI resource or private gateway and the matter text never leaves your tenant. One
              deployment serves the firm at a time.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="secondary" onClick={refreshAll}>
              <HiRefresh className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="primary" onClick={connect}>
              <HiPlus className="h-4 w-4" />
              Connect a deployment
            </Button>
          </div>
        </header>

        {!loading && !activeProvider && (
          <div className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning/5 p-5">
            <HiOutlineExclamationCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div>
              <h2 className="text-sm font-bold text-ink">No deployment in use</h2>
              <p className="mt-0.5 text-[13px] leading-relaxed text-ink/60">
                Every AI feature in Lysp is unavailable until one of the deployments below is
                selected.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-[104px] animate-pulse rounded-2xl border border-border bg-surface"
              />
            ))}
          </div>
        ) : ordered.length === 0 ? (
          <EmptyState
            title="No deployment connected"
            description="Connect your Azure OpenAI resource, a gateway you operate, or — to get started quickly — Lysp's managed capacity."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {ordered.map((config) => (
              <DeploymentRow
                key={config.id}
                config={config}
                isActive={config.active}
                onActivate={setActivateConfig}
                onTest={setTestConfig}
                onEdit={edit}
                onRemove={setRemoveConfig}
                busy={loading}
              />
            ))}
          </div>
        )}

        {!loading && <DataHandlingPanel config={activeProvider ?? null} />}

        <ConnectDeploymentDrawer
          isOpen={connectOpen}
          onClose={() => setConnectOpen(false)}
          existing={editing}
          onSaved={refreshAll}
        />

        {testConfig && (
          <TestConnectionModal
            isOpen
            onClose={() => {
              setTestConfig(null);
              refreshAll();
            }}
            config={testConfig}
          />
        )}

        {activateConfig && (
          <ActivateConfirmModal
            isOpen
            onClose={() => setActivateConfig(null)}
            config={activateConfig}
            activeConfig={activeProvider}
            onSuccess={refreshAll}
          />
        )}

        {removeConfig && (
          <RemoveConfirmModal
            isOpen
            onClose={() => setRemoveConfig(null)}
            config={removeConfig}
            onSuccess={refreshAll}
          />
        )}
      </div>
    </PermissionGate>
  );
}
