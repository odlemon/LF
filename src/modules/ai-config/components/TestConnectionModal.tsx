"use client";

import React, { useEffect } from "react";
import { AiProviderConfig } from "../types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useTestProvider } from "../hooks/useAiConfig";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";

interface TestConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AiProviderConfig;
}

export function TestConnectionModal({
  isOpen,
  onClose,
  config,
}: TestConnectionModalProps) {
  const { testProvider, isTesting, testResult } = useTestProvider();

  useEffect(() => {
    if (isOpen && config?.id) {
      testProvider(config.id);
    }
  }, [isOpen, config, testProvider]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Test Connection"
      size="sm"
    >
      <div className="flex flex-col items-center justify-center text-center p-4 min-h-48">
        {isTesting && (
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-semibold text-ink/60">
              Testing connection to {config.displayName}...
            </span>
          </div>
        )}

        {!isTesting && testResult && (
          <div className="flex flex-col items-center gap-4 w-full">
            {testResult.success ? (
              <>
                <HiCheckCircle className="w-12 h-12 text-ink/70 shrink-0" />
                <h4 className="text-lg font-bold text-ink leading-tight">
                  Connection Successful
                </h4>
                <div className="flex flex-col gap-1 text-xs text-ink/60">
                  <p>{config.displayName} responded in {testResult.responseTimeMs}ms</p>
                  <p className="font-semibold text-ink/80">Model: {testResult.modelName || config.modelName}</p>
                </div>
              </>
            ) : (
              <>
                <HiXCircle className="w-12 h-12 text-red-500 shrink-0" />
                <h4 className="text-lg font-bold text-ink leading-tight">
                  Connection Failed
                </h4>
                <div className="flex flex-col gap-2 text-xs text-ink/60 max-w-xs">
                  <p className="font-medium text-red-700 bg-red-50/50 p-2.5 rounded-xl border border-red-100/50 break-words max-h-24 overflow-y-auto rates-scrollable">
                    {testResult.message || "Connection failed with a blank error response."}
                  </p>
                  <p className="font-semibold">Check that your API key is correct and has not expired.</p>
                </div>
              </>
            )}

            <Button
              variant="secondary"
              onClick={onClose}
              className="mt-4 px-6"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
