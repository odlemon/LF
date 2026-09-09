"use client";

import React, { useState } from "react";
import { PermissionGate } from "@/components/shared/PermissionGate";
import { Alert } from "@/components/ui/Alert";
import { useAiProviders, useActiveProvider } from "@/modules/ai-config/hooks/useAiConfig";
import { AiProvider, AiProviderConfig } from "@/modules/ai-config/types";
import { ProviderCard } from "@/modules/ai-config/components/ProviderCard";
import { AddEditKeyModal } from "@/modules/ai-config/components/AddEditKeyModal";
import { TestConnectionModal } from "@/modules/ai-config/components/TestConnectionModal";
import { ActivateConfirmModal } from "@/modules/ai-config/components/ActivateConfirmModal";
import { RemoveConfirmModal } from "@/modules/ai-config/components/RemoveConfirmModal";
import { HiCheckCircle, HiExclamation } from "react-icons/hi";

export default function AiConfigPage() {
  const { providers, isLoading: providersLoading, refetch: refetchProviders } = useAiProviders();
  const { activeProvider, isLoading: activeLoading, refetch: refetchActive } = useActiveProvider();

  // Modals state
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>("ANTHROPIC");
  const [addEditConfig, setAddEditConfig] = useState<AiProviderConfig | null>(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);

  const [testConfig, setTestConfig] = useState<AiProviderConfig | null>(null);
  const [isTestOpen, setIsTestOpen] = useState(false);

  const [activateConfig, setActivateConfig] = useState<AiProviderConfig | null>(null);
  const [isActivateOpen, setIsActivateOpen] = useState(false);

  const [removeConfig, setRemoveConfig] = useState<AiProviderConfig | null>(null);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);

  const isGlobalLoading = providersLoading || activeLoading;

  const handleRefreshAll = () => {
    refetchProviders();
    refetchActive();
  };

  const handleAddKey = (provider: AiProvider) => {
    setSelectedProvider(provider);
    setAddEditConfig(null);
    setIsAddEditOpen(true);
  };

  const handleEditKey = (provider: AiProvider, config: AiProviderConfig) => {
    setSelectedProvider(provider);
    setAddEditConfig(config);
    setIsAddEditOpen(true);
  };

  const handleTestConnection = (config: AiProviderConfig) => {
    setTestConfig(config);
    setIsTestOpen(true);
  };

  const handleActivateProvider = (config: AiProviderConfig) => {
    setActivateConfig(config);
    setIsActivateOpen(true);
  };

  const handleRemoveConfig = (config: AiProviderConfig) => {
    setRemoveConfig(config);
    setIsRemoveOpen(true);
  };

  const formatTestedDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const providerList: AiProvider[] = ["ANTHROPIC", "OPENAI", "GEMINI", "DEEPSEEK"];

  return (
    <PermissionGate
      permission="AI_CONFIG_READ"
      fallback={
        <div className="p-8 max-w-5xl w-full mx-auto">
          <Alert variant="error" message="You do not have permission to view AI configuration." />
        </div>
      }
    >
      <div className="p-8 max-w-5xl w-full mx-auto flex flex-col gap-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">AI Configuration</h1>
          <p className="text-sm text-ink/55 mt-1">
            Configure the AI provider that powers Lysp&apos;s pricing intelligence. Only one provider can be active at a time.
          </p>
        </div>

        {/* Active Provider Banner */}
        {isGlobalLoading ? (
          <div className="h-[90px] bg-field rounded-2xl animate-pulse" />
        ) : activeProvider ? (
          <div className="bg-hover border border-border rounded-2xl p-5 flex items-center gap-4 animate-fade-in shadow-sm shadow-black/5">
            <HiCheckCircle className="w-8 h-8 text-ink/70 shrink-0" />
            <div className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-ink">
                  Active Provider: {activeProvider.displayName}
                </h4>
                <p className="text-xs text-ink/80 font-semibold mt-0.5">
                  Model: {activeProvider.modelName}
                </p>
              </div>
              <div className="shrink-0">
                {activeProvider.lastTestResult === "SUCCESS" ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-hover text-ink border border-border tracking-wide uppercase">
                    Last tested: {formatTestedDate(activeProvider.lastTestedAt)}
                  </span>
                ) : activeProvider.lastTestResult === "FAILED" ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 tracking-wide uppercase">
                    Last test failed: {formatTestedDate(activeProvider.lastTestedAt)}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-canvas text-ink/55 border border-border tracking-wide uppercase">
                    Not yet tested
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-start gap-4 animate-fade-in shadow-sm shadow-amber-500/5">
            <HiExclamation className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <h4 className="text-sm font-bold text-yellow-900">No active AI provider configured</h4>
              <p className="text-xs text-yellow-700 font-semibold leading-relaxed">
                Add a provider below and activate it before using any AI features.
              </p>
            </div>
          </div>
        )}

        {/* Providers Grid */}
        {isGlobalLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="h-44 bg-field rounded-2xl animate-pulse" />
            <div className="h-44 bg-field rounded-2xl animate-pulse" />
            <div className="h-44 bg-field rounded-2xl animate-pulse" />
            <div className="h-44 bg-field rounded-2xl animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {providerList.map((providerVal) => {
              const config = providers.find((p) => p.provider === providerVal) || null;
              const isActive = activeProvider ? activeProvider.provider === providerVal : false;

              return (
                <ProviderCard
                  key={providerVal}
                  provider={providerVal}
                  config={config}
                  isActive={isActive}
                  onAdd={handleAddKey}
                  onEdit={handleEditKey}
                  onActivate={handleActivateProvider}
                  onTest={handleTestConnection}
                  onRemove={handleRemoveConfig}
                />
              );
            })}
          </div>
        )}

        {/* Modals */}
        {isAddEditOpen && (
          <AddEditKeyModal
            isOpen={isAddEditOpen}
            onClose={() => setIsAddEditOpen(false)}
            provider={selectedProvider}
            existingConfig={addEditConfig}
            onSuccess={handleRefreshAll}
          />
        )}

        {isTestOpen && testConfig && (
          <TestConnectionModal
            isOpen={isTestOpen}
            onClose={() => {
              setIsTestOpen(false);
              setTestConfig(null);
              // Refresh to capture test outcome badge state updates
              handleRefreshAll();
            }}
            config={testConfig}
          />
        )}

        {isActivateOpen && activateConfig && (
          <ActivateConfirmModal
            isOpen={isActivateOpen}
            onClose={() => {
              setIsActivateOpen(false);
              setActivateConfig(null);
            }}
            config={activateConfig}
            activeConfig={activeProvider}
            onSuccess={handleRefreshAll}
          />
        )}

        {isRemoveOpen && removeConfig && (
          <RemoveConfirmModal
            isOpen={isRemoveOpen}
            onClose={() => {
              setIsRemoveOpen(false);
              setRemoveConfig(null);
            }}
            config={removeConfig}
            onSuccess={handleRefreshAll}
          />
        )}
      </div>
    </PermissionGate>
  );
}
