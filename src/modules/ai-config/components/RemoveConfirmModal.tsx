"use client";

import React from "react";
import { AiProviderConfig } from "../types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useDeleteProvider } from "../hooks/useAiConfig";

interface RemoveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AiProviderConfig;
  onSuccess: () => void;
}

export function RemoveConfirmModal({
  isOpen,
  onClose,
  config,
  onSuccess,
}: RemoveConfirmModalProps) {
  const { deleteProvider, isDeleting } = useDeleteProvider();

  const handleConfirm = async () => {
    try {
      await deleteProvider(config.id);
      onSuccess();
      onClose();
    } catch {
      // Hook already handles error toast messages
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Remove ${config.displayName} configuration?`}
      size="md"
    >
      <div className="flex flex-col gap-6">
        <p className="text-sm text-ink/55 leading-relaxed">
          This will permanently remove the API key for <span className="font-bold text-ink/90">{config.displayName}</span>. You can add it again at any time.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={isDeleting}
            className="w-full sm:flex-1 py-3"
          >
            Remove
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
