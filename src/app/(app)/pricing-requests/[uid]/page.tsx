"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import {
  useRequestWorkspace,
  useIntakeChat,
  useAttachments,
  useScope,
} from "@/modules/intake/hooks/useIntake";
import { ChatPanel } from "@/modules/intake/components/ChatPanel";
import { ScopePanel } from "@/modules/intake/components/ScopePanel";
import { ChatModeBadge } from "@/modules/intake/components/IntakeStatusBadge";
import {
  ChatMode,
  IntakeAttachment,
  IntakeMessage,
  MatterScope,
  PricingRequest,
} from "@/modules/intake/types";
import { getFeeEarnerLevels } from "@/lib/api/modules/firm.api";
import { FeeEarnerLevel } from "@/modules/firm/types";

function statusToChatMode(status: string): ChatMode {
  if (status === "SCOPE_CONFIRMED") return "SCOPE_CONFIRMED";
  if (status === "SCOPE_GENERATED") return "SCOPE_GENERATED";
  if (status === "IN_PROGRESS") return "SCOPING";
  return "GENERAL";
}

interface LoadedWorkspaceProps {
  uid: string;
  request: PricingRequest;
  clientName: string;
  initialMessages: IntakeMessage[];
  initialAttachments: IntakeAttachment[];
  initialScope: MatterScope | null;
  initialScopeGenerated: boolean;
  setScope: (scope: MatterScope | null) => void;
  setScopeGenerated: (value: boolean) => void;
  setRequest: (request: PricingRequest) => void;
  setAttachments: (attachments: IntakeAttachment[]) => void;
  setWorkspaceMessages: (messages: IntakeMessage[]) => void;
}

function PricingRequestWorkspaceLoaded({
  uid,
  request,
  clientName,
  initialMessages,
  initialAttachments,
  initialScope,
  initialScopeGenerated,
  setScope,
  setScopeGenerated,
  setRequest,
  setAttachments,
  setWorkspaceMessages,
}: LoadedWorkspaceProps) {
  const router = useRouter();

  const attachmentHook = useAttachments(uid, initialAttachments, setAttachments);
  const scopeHook = useScope(uid, initialScope, setScope, (updated) => setRequest(updated));

  const onScopeFromChat = useCallback(
    (scope: MatterScope) => {
      setScope(scope);
      setScopeGenerated(true);
      scopeHook.setScope(scope);
    },
    [setScope, setScopeGenerated, scopeHook]
  );

  const onMessagesUpdated = useCallback(
    (msgs: IntakeMessage[]) => {
      setWorkspaceMessages(msgs);
    },
    [setWorkspaceMessages]
  );

  const initialChatMode = useMemo(
    () => request.chatMode ?? statusToChatMode(request.status),
    [request]
  );

  const chat = useIntakeChat(
    uid,
    initialMessages,
    onScopeFromChat,
    onMessagesUpdated,
    {
      scope: initialScope,
      scopeGenerated: initialScopeGenerated,
      chatMode: initialChatMode,
    }
  );

  const [feeEarnerLevels, setFeeEarnerLevels] = React.useState<FeeEarnerLevel[]>([]);

  useEffect(() => {
    getFeeEarnerLevels()
      .then(setFeeEarnerLevels)
      .catch(() => setFeeEarnerLevels([]));
  }, []);

  const scopeGenerated =
    chat.scopeGenerated || initialScopeGenerated || !!chat.scope || !!scopeHook.scope;
  const displayScope = chat.scope ?? scopeHook.scope ?? initialScope;
  const displayChatMode =
    chat.chatMode ?? request.chatMode ?? statusToChatMode(request.status);

  const handleConfirmScope = async () => {
    try {
      await scopeHook.confirmScope();
      chat.setChatMode("SCOPE_CONFIRMED");
      toast.success("Scope confirmed");
      router.push(`/pricing-requests/${uid}/pricing`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(e.response?.data?.message || e.message || "Failed to confirm scope");
    }
  };

  const isCancelled = request.status === "CANCELLED";
  const showConfirmScope =
    displayChatMode === "SCOPE_GENERATED" || request.status === "SCOPE_GENERATED";

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50/50">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.push("/pricing-requests")}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg shrink-0"
            aria-label="Back"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">{request.matterTitle}</h1>
            <p className="text-sm text-gray-500 truncate">{clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <ChatModeBadge chatMode={displayChatMode} />
          {showConfirmScope && displayChatMode !== "SCOPE_CONFIRMED" && (
            <Button variant="cta" onClick={handleConfirmScope} loading={scopeHook.isConfirming}>
              Confirm Scope
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-row flex-1 overflow-hidden min-h-0">
        <ChatPanel
          messages={chat.messages}
          isAiThinking={chat.isAiThinking}
          showTypingIndicator={chat.showTypingIndicator}
          streamingMessageId={chat.streamingMessageId}
          onSendMessage={chat.sendMessage}
          onStopStreaming={chat.stopStreaming}
          attachments={attachmentHook.attachments}
          uploadingFiles={attachmentHook.uploadingFiles}
          onAttach={(file) => attachmentHook.attach(file)}
          onDeleteAttachment={attachmentHook.deleteAttachment}
          disabled={isCancelled}
          chatMode={displayChatMode}
        />
        <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-white">
          <ScopePanel
            scope={displayScope}
            scopeGenerated={scopeGenerated}
            chatMode={displayChatMode}
            feeEarnerLevels={feeEarnerLevels}
            onUpdatePhase={scopeHook.updatePhase}
            onAddPhase={scopeHook.addPhase}
            onDeletePhase={scopeHook.deletePhase}
            onAddTask={scopeHook.addTask}
            onUpdateTask={scopeHook.updateTask}
            onDeleteTask={scopeHook.deleteTask}
            onAddAssumption={scopeHook.addAssumption}
            onDeleteAssumption={scopeHook.deleteAssumption}
          />
        </div>
      </div>
    </div>
  );
}

export default function PricingRequestWorkspacePage() {
  const params = useParams();
  const uid = params.uid as string;
  const router = useRouter();

  const workspace = useRequestWorkspace(uid);
  const {
    request,
    clientName,
    messages,
    attachments,
    scope,
    scopeGenerated,
    isLoading,
    error,
    setScope,
    setScopeGenerated,
    setRequest,
    setAttachments,
    setMessages,
  } = workspace;

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-8">
        <p className="text-red-600 text-sm font-medium">{error ?? "Request not found"}</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push("/pricing-requests")}>
          Back to list
        </Button>
      </div>
    );
  }

  return (
    <PricingRequestWorkspaceLoaded
      uid={uid}
      request={request}
      clientName={clientName}
      initialMessages={messages}
      initialAttachments={attachments}
      initialScope={scope}
      initialScopeGenerated={scopeGenerated}
      setScope={setScope}
      setScopeGenerated={setScopeGenerated}
      setRequest={setRequest}
      setAttachments={setAttachments}
      setWorkspaceMessages={setMessages}
    />
  );
}
