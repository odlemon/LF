"use client";

import React from "react";
import { AiProviderConfig } from "../types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useActivateProvider } from "../hooks/useAiConfig";

interface ActivateConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AiProviderConfig;
  activeConfig: AiProviderConfig | null;
  onSuccess: () => void;
}

export function ActivateConfirmModal({
  isOpen,
  onClose,
  config,
  activeConfig,
  onSuccess,
}: ActivateConfirmModalProps) {
  const { activateProvider, isActivating } = useActivateProvider();

  const handleConfirm = async () => {
    try {
      await activateProvider(config.id, config.displayName);
      onSuccess();
      onClose();
    } catch {
      // Hook already handles error toast
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Activate ${config.displayName}?`}
      size="md"
    >
      <div className="flex flex-col gap-6">
        <p className="text-sm text-ink/55 leading-relaxed">
          This will set <span className="font-bold text-ink/90">{config.displayName}</span> as the active AI provider.{" "}
          {activeConfig && (
            <span>
              The current active provider (<span className="font-semibold text-ink/80">{activeConfig.displayName}</span>) will be deactivated.
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={handleConfirm}
            loading={isActivating}
            className="w-full sm:flex-1 py-3"
          >
            Confirm Activation
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:flex-1 text-center text-xs font-bold text-ink/40 hover:text-ink/70 transition-colors py-3 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
