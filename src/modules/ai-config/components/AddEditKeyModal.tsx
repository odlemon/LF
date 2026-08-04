"use client";

import React, { useState, useEffect } from "react";
import { AiProvider, AiProviderConfig } from "../types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useSaveProvider } from "../hooks/useAiConfig";
import { HiEye, HiEyeOff } from "react-icons/hi";

interface AddEditKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: AiProvider;
  existingConfig: AiProviderConfig | null;
  onSuccess: () => void;
}

const providerMetaData = {
  ANTHROPIC: {
    displayName: "Anthropic Claude",
    helperText: "Your key should start with sk-ant-",
    defaultModel: "claude-sonnet-4-20250514",
  },
  OPENAI: {
    displayName: "OpenAI",
    helperText: "Your key should start with sk-",
    defaultModel: "gpt-4o",
  },
  GEMINI: {
    displayName: "Google Gemini",
    helperText: "Your key starts with AIza",
    defaultModel: "gemini-1.5-pro",
  },
  DEEPSEEK: {
    displayName: "DeepSeek",
    helperText: "Your key starts with sk-",
    defaultModel: "deepseek-chat",
  },
};

export function AddEditKeyModal({
  isOpen,
  onClose,
  provider,
  existingConfig,
  onSuccess,
}: AddEditKeyModalProps) {
  const meta = providerMetaData[provider];
  const { saveProvider, isSaving } = useSaveProvider();

  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setApiKey("");
      setModelName(existingConfig?.modelName || "");
      setShowKey(false);
      setValidationError("");
      setApiError("");
    }
  }, [isOpen, existingConfig]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setApiError("");

    if (!apiKey.trim()) {
      setValidationError("API key is required");
      return;
    }

    try {
      await saveProvider({
        provider,
        apiKey: apiKey.trim(),
        modelName: modelName.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setApiError(
        err.response?.data?.message || err.message || "An error occurred while saving the configuration"
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure ${meta.displayName}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {apiError && <Alert variant="error" message={apiError} />}

        {/* API Key field */}
        <div className="flex flex-col gap-1.5 relative">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1 select-none">
            API Key <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your API key here"
              className={`w-full px-5 py-2.5 bg-white border ${
                validationError ? "border-rose-300 focus:ring-rose-100" : "border-gray-250 focus:ring-primary/20"
              } rounded-full text-xs text-gray-800 focus:outline-none focus:ring-2 pr-12 font-medium`}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showKey ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
            </button>
          </div>
          {validationError ? (
            <span className="text-[10px] font-bold text-rose-500 pl-1">
              {validationError}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-gray-400 pl-1">
              {meta.helperText}
            </span>
          )}
        </div>

        {/* Model Name field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1 select-none">
            Model Name (optional)
          </label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder={meta.defaultModel}
            className="w-full px-5 py-2.5 bg-white border border-gray-250 focus:border-primary focus:ring-primary/20 rounded-full text-xs text-gray-800 focus:outline-none focus:ring-2 font-medium"
          />
          <span className="text-[10px] font-semibold text-gray-400 pl-1">
            Leave blank to use the default model shown above
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full py-3"
            loading={isSaving}
          >
            Save
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="text-center text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors py-1 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
