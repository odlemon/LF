"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HiArrowLeft, HiChevronDoubleLeft, HiViewBoards } from "react-icons/hi";
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
import { PricingRequestWorkspaceSkeleton } from "@/modules/intake/components/PricingRequestWorkspaceSkeleton";
import {
  ChatMode,
  IntakeAttachment,
  IntakeMessage,
  MatterScope,
  PricingRequest,
} from "@/modules/intake/types";
import { getFeeEarnerLevels, getPracticeAreas } from "@/lib/api/modules/firm.api";
import { intakeApi } from "@/lib/api/modules/intake.api";
import { FeeEarnerLevel, PracticeArea } from "@/modules/firm/types";
import {
  cloneMatterScope,
  matterScopeToRestorePayload,
} from "@/modules/intake/utils/scopeSnapshot";

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
  const [scopeOpen, setScopeOpen] = useState(true);

  const scopeHistoryRef = useRef<MatterScope[]>([]);
  const latestScopeRef = useRef<MatterScope | null>(initialScope);
  const chatControlsRef = useRef<{
    setScope: (scope: MatterScope | null) => void;
    setScopeGenerated: (value: boolean) => void;
    setChatMode: (mode: ChatMode) => void;
  } | null>(null);

  const rememberScope = useCallback((next: MatterScope | null) => {
    const prev = latestScopeRef.current;
    if (
      prev &&
      prev.phases?.length &&
      JSON.stringify(prev) !== JSON.stringify(next)
    ) {
      scopeHistoryRef.current.push(cloneMatterScope(prev));
      if (scopeHistoryRef.current.length > 25) {
        scopeHistoryRef.current.shift();
      }
    }
    latestScopeRef.current = next;
  }, []);

  const handleScopeChange = useCallback(
    (next: MatterScope | null) => {
      rememberScope(next);
      setScope(next);
    },
    [rememberScope, setScope]
  );

  const attachmentHook = useAttachments(uid, initialAttachments, setAttachments);
  const scopeHook = useScope(uid, initialScope, handleScopeChange, (updated) =>
    setRequest(updated)
  );

  const onScopeFromChat = useCallback(
    (scope: MatterScope) => {
      rememberScope(scope);
      setScope(scope);
      setScopeGenerated(true);
      setScopeOpen(true);
      scopeHook.setScope(scope);
      setRequest({
        uid: request.uid,
        firmUid: request.firmUid,
        matterTitle: request.matterTitle,
        clientProfileUid: request.clientProfileUid,
        clientName: request.clientName,
        practiceAreaUid: request.practiceAreaUid,
        practiceAreaName: request.practiceAreaName,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        createdByUid: request.createdByUid,
        scopeGenerated: true,
        status:
          request.status === "SCOPE_CONFIRMED"
            ? "SCOPE_CONFIRMED"
            : "SCOPE_GENERATED",
        chatMode:
          request.chatMode === "SCOPE_CONFIRMED"
            ? "SCOPE_CONFIRMED"
            : "SCOPE_GENERATED",
      });
    },
    [
      rememberScope,
      setScope,
      setScopeGenerated,
      scopeHook,
      setRequest,
      request.uid,
      request.firmUid,
      request.matterTitle,
      request.clientProfileUid,
      request.clientName,
      request.practiceAreaUid,
      request.practiceAreaName,
      request.createdAt,
      request.updatedAt,
      request.createdByUid,
      request.status,
      request.chatMode,
    ]
  );

  const onMessagesUpdated = useCallback(
    (msgs: IntakeMessage[]) => {
      setWorkspaceMessages(msgs);
    },
    [setWorkspaceMessages]
  );

  const localActions = useMemo(
    () => ({
      onResetScope: async () => {
        const updated = await intakeApi.resetScope(uid);
        scopeHistoryRef.current = [];
        latestScopeRef.current = null;

        // Clear every scope copy — parent, hook, and chat — so the panel empties immediately
        setRequest({
          ...updated,
          scopeGenerated: false,
          status: updated.status ?? "IN_PROGRESS",
          chatMode: updated.chatMode ?? "SCOPING",
        });
        setScope(null);
        setScopeGenerated(false);
        scopeHook.setScope(null);
        chatControlsRef.current?.setScope(null);
        chatControlsRef.current?.setScopeGenerated(false);
        chatControlsRef.current?.setChatMode("SCOPING");
      },
      onUndoScope: async () => {
        const previous = scopeHistoryRef.current.pop();
        if (!previous) return false;

        const restored = await intakeApi.restoreScope(
          uid,
          matterScopeToRestorePayload(previous)
        );
        latestScopeRef.current = restored;
        setScope(restored);
        setScopeGenerated(true);
        scopeHook.setScope(restored);
        chatControlsRef.current?.setScope(restored);
        chatControlsRef.current?.setScopeGenerated(true);
        chatControlsRef.current?.setChatMode("SCOPE_GENERATED");
        setRequest({
          ...request,
          scopeGenerated: true,
          status: "SCOPE_GENERATED",
          chatMode: "SCOPE_GENERATED",
        });
        return true;
      },
    }),
    [
      uid,
      setRequest,
      setScope,
      setScopeGenerated,
      scopeHook,
      request,
    ]
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
    },
    localActions
  );

  chatControlsRef.current = {
    setScope: chat.setScope,
    setScopeGenerated: chat.setScopeGenerated,
    setChatMode: chat.setChatMode,
  };

  const [feeEarnerLevels, setFeeEarnerLevels] = React.useState<FeeEarnerLevel[]>([]);
  const [practiceAreas, setPracticeAreas] = React.useState<PracticeArea[]>([]);

  useEffect(() => {
    getFeeEarnerLevels()
      .then(setFeeEarnerLevels)
      .catch(() => setFeeEarnerLevels([]));
    getPracticeAreas()
      .then(setPracticeAreas)
      .catch(() => setPracticeAreas([]));
  }, []);

  useEffect(() => {
    latestScopeRef.current = initialScope;
  }, [initialScope]);

  const displayScope = chat.scope ?? scopeHook.scope;
  // A scope with no phases is not a real plan — show the empty state
  const hasActivePlan = Boolean(displayScope?.phases?.length);
  const displayChatMode =
    chat.chatMode ?? request.chatMode ?? statusToChatMode(request.status);
  const scopeGenerated =
    hasActivePlan &&
    (chat.scopeGenerated ||
      request.scopeGenerated ||
      displayChatMode === "SCOPE_GENERATED" ||
      displayChatMode === "SCOPE_CONFIRMED" ||
      request.status === "SCOPE_GENERATED" ||
      request.status === "SCOPE_CONFIRMED");
  const panelScope = hasActivePlan ? displayScope : null;

  useEffect(() => {
    if (chat.scopeBuildActive && !scopeGenerated) {
      setScopeOpen(true);
    }
  }, [chat.scopeBuildActive, scopeGenerated]);

  const handleConfirmScope = async () => {
    try {
      await scopeHook.confirmScope();
      chat.setChatMode("SCOPE_CONFIRMED");
      toast.success("Scope confirmed — you can still ask questions in chat");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(e.response?.data?.message || e.message || "Failed to confirm scope");
    }
  };

  const isCancelled = request.status === "CANCELLED";
  const isConfirmed =
    displayChatMode === "SCOPE_CONFIRMED" || request.status === "SCOPE_CONFIRMED";
  const showConfirmScope =
    !isConfirmed &&
    hasActivePlan &&
    (displayChatMode === "SCOPE_GENERATED" ||
      request.status === "SCOPE_GENERATED" ||
      scopeGenerated);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-canvas">
      {/* Wraps on narrow screens: at 375px the title, badge and CTA competing on one
          row truncated the matter name to a single character. */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 sm:px-6 py-3.5 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3 min-w-0 flex-1 basis-[60%]">
          <button
            type="button"
            onClick={() => router.push("/pricing-requests")}
            className="p-2 text-ink/50 hover:text-ink hover:bg-hover rounded-lg shrink-0 transition-colors"
            aria-label="Back"
          >
            <HiArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-ink truncate tracking-tight">
              {request.matterTitle}
            </h1>
            <p className="text-xs text-ink/50 truncate mt-0.5">{clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ChatModeBadge chatMode={displayChatMode} />
          {isConfirmed && (
            <Button
              variant="cta"
              onClick={() => router.push(`/pricing-requests/${uid}/pricing`)}
            >
              Continue to pricing
            </Button>
          )}
          {showConfirmScope && (
            <Button variant="cta" onClick={handleConfirmScope} loading={scopeHook.isConfirming}>
              Confirm Scope
            </Button>
          )}
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden min-h-0 bg-canvas">
        <div
          className={`flex min-h-0 h-full transition-[width,flex,padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scopeOpen
              ? "w-full md:w-1/2 md:border-r md:border-border"
              : "w-full justify-center px-4 sm:px-8"
          }`}
        >
          <ChatPanel
            messages={chat.messages}
            isAiThinking={chat.isAiThinking}
            showTypingIndicator={chat.showTypingIndicator}
            streamingMessageId={chat.streamingMessageId}
            onSendMessage={chat.sendMessage}
            onStopStreaming={chat.stopStreaming}
            onRemoveQueued={chat.removeQueuedMessage}
            queueCount={chat.queueCount}
            attachments={attachmentHook.attachments}
            uploadingFiles={attachmentHook.uploadingFiles}
            onAttach={(file) => attachmentHook.attach(file)}
            onDeleteAttachment={attachmentHook.deleteAttachment}
            disabled={isCancelled}
            isAttaching={attachmentHook.isAttaching}
            chatMode={displayChatMode}
            layout={scopeOpen ? "split" : "centered"}
          />
        </div>

        <div
          className={`absolute top-0 right-0 bottom-0 z-20 w-full md:w-1/2 flex flex-col bg-surface border-l border-border shadow-[-12px_0_40px_rgba(10,10,10,0.04)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
            scopeOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
          }`}
          aria-hidden={!scopeOpen}
        >
          <ScopePanel
            scope={panelScope}
            scopeGenerated={scopeGenerated}
            chatMode={displayChatMode}
            feeEarnerLevels={feeEarnerLevels}
            practiceAreas={practiceAreas}
            onCollapse={() => setScopeOpen(false)}
            isBuilding={Boolean(chat.scopeBuildActive && !scopeGenerated)}
            buildProgressStep={chat.scopeProgressStep}
            buildProgressLabel={chat.scopeProgressLabel}
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

        <button
          type="button"
          onClick={() => setScopeOpen(true)}
          className={`absolute right-4 top-1/2 z-10 -translate-y-1/2 flex flex-col items-center gap-2 px-2.5 py-4 rounded-2xl border border-border bg-surface shadow-[0_8px_30px_rgba(10,10,10,0.08)] text-ink/55 hover:text-ink hover:border-ink/20 transition-all duration-500 ease-out ${
            scopeOpen
              ? "opacity-0 translate-x-4 pointer-events-none"
              : "opacity-100 translate-x-0 delay-200"
          }`}
          aria-label="Show scope panel"
          title="Show scope"
          tabIndex={scopeOpen ? -1 : 0}
        >
          <HiChevronDoubleLeft className="w-4 h-4" />
          <HiViewBoards className="w-4 h-4" />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ writingMode: "vertical-rl" }}
          >
            Scope
          </span>
        </button>
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
    return <PricingRequestWorkspaceSkeleton />;
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
