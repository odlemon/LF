"use client";

import React from "react";
import { AiProvider, AiProviderConfig } from "../types";
import { Button } from "@/components/ui/Button";
import { PermissionGate } from "@/components/shared/PermissionGate";

interface ProviderCardProps {
  provider: AiProvider;
  config: AiProviderConfig | null;
  isActive: boolean;
  onAdd: (provider: AiProvider) => void;
  onEdit: (provider: AiProvider, config: AiProviderConfig) => void;
  onActivate: (config: AiProviderConfig) => void;
  onTest: (config: AiProviderConfig) => void;
  onRemove: (config: AiProviderConfig) => void;
}

const providerDetails = {
  ANTHROPIC: {
    displayName: "Anthropic Claude",
    bgClass: "bg-orange-100",
    textClass: "text-orange-600",
    initial: "A",
  },
  OPENAI: {
    displayName: "OpenAI",
    bgClass: "bg-gray-100",
    textClass: "text-gray-700",
    initial: "O",
  },
  GEMINI: {
    displayName: "Google Gemini",
    bgClass: "bg-blue-100",
    textClass: "text-blue-600",
    initial: "G",
  },
  DEEPSEEK: {
    displayName: "DeepSeek",
    bgClass: "bg-indigo-100",
    textClass: "text-indigo-600",
    initial: "D",
  },
};

export function ProviderCard({
  provider,
  config,
  isActive,
  onAdd,
  onEdit,
  onActivate,
  onTest,
  onRemove,
}: ProviderCardProps) {
  const details = providerDetails[provider];

  const formatDate = (dateStr: string | null) => {
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

  // State 1: Not configured (no API key saved)
  if (!config) {
    return (
      <div className="bg-white p-5 rounded-2xl border-2 border-dashed border-gray-250 flex flex-col justify-between gap-6 transition-all duration-200 hover:border-gray-300 hover:shadow-sm">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${details.bgClass} ${details.textClass}`}>
            {details.initial}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-base font-bold text-gray-400">
              {details.displayName}
            </span>
            <span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wide">
                Not configured
              </span>
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <PermissionGate permission="AI_CONFIG_MANAGE">
            <Button variant="secondary" onClick={() => onAdd(provider)}>
              Add API Key
            </Button>
          </PermissionGate>
        </div>
      </div>
    );
  }

  // State 3: Configured and active
  if (isActive) {
    return (
      <div className="bg-white p-5 rounded-2xl border-2 border-primary flex flex-col justify-between gap-6 transition-all duration-200 shadow-md shadow-primary/5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${details.bgClass} ${details.textClass}`}>
            {details.initial}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <span className="text-base font-bold text-gray-900 leading-tight">
                {details.displayName}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                Active
              </span>
            </div>
            <div className="flex flex-col gap-0.5 text-xs text-gray-500">
              <span className="font-semibold">Key: {config.apiKeyHint}</span>
              <span>Model: <span className="font-medium text-gray-700">{config.modelName}</span></span>
            </div>
            {config.lastTestResult && (
              <div className="mt-1">
                {config.lastTestResult === "SUCCESS" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 tracking-wide">
                    Last tested: {formatDate(config.lastTestedAt)}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 tracking-wide">
                    Last test failed: {formatDate(config.lastTestedAt)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <PermissionGate permission="AI_CONFIG_MANAGE">
            <Button variant="secondary" onClick={() => onTest(config)}>
              Test
            </Button>
            <Button variant="secondary" onClick={() => onEdit(provider, config)}>
              Edit Key
            </Button>
          </PermissionGate>
        </div>
      </div>
    );
  }

  // State 2: Configured but not active
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 flex flex-col justify-between gap-6 transition-all duration-200 hover:shadow-md hover:border-gray-300">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${details.bgClass} ${details.textClass}`}>
          {details.initial}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-gray-900 leading-tight">
              {details.displayName}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase tracking-wide">
              Inactive
            </span>
          </div>
          <div className="flex flex-col gap-0.5 text-xs text-gray-500">
            <span className="font-semibold">Key: {config.apiKeyHint}</span>
            <span>Model: <span className="font-medium text-gray-700">{config.modelName}</span></span>
          </div>
          {config.lastTestResult && (
            <div className="mt-1">
              {config.lastTestResult === "SUCCESS" ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 tracking-wide">
                  Last tested: {formatDate(config.lastTestedAt)}
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-50 text-red-700 border border-red-100 tracking-wide">
                  Last test failed: {formatDate(config.lastTestedAt)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <PermissionGate permission="AI_CONFIG_MANAGE">
          <Button variant="danger" onClick={() => onRemove(config)}>
            Remove
          </Button>
          <Button variant="secondary" onClick={() => onTest(config)}>
            Test
          </Button>
          <Button variant="primary" onClick={() => onActivate(config)}>
            Activate
          </Button>
        </PermissionGate>
      </div>
    </div>
  );
}
