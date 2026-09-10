"use client";

import React, { useEffect, useMemo, useState } from "react";
import { HiEye, HiEyeOff, HiOutlineShieldCheck } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useSaveProvider } from "../hooks/useAiConfig";
import type { AiProvider, AiProviderConfig } from "../types";
import {
  deploymentKind,
  KIND_BLURB,
  KIND_LABEL,
  PROVIDER_LABEL,
  type DeploymentKind,
} from "../lib/deployment";

/**
 * Connecting a model deployment.
 *
 * The old form asked which vendor you wanted and where to paste that vendor's key. This asks the
 * question a firm's own architecture actually poses — where does the inference run, and under
 * whose agreement — and then asks only for the fields that kind of answer needs. An Azure
 * resource needs a deployment name and a dated API version; a private gateway needs neither.
 */

const LABEL = "text-[10px] font-bold uppercase tracking-wider text-ink/60 pl-1 select-none";

const KIND_OPTIONS: { value: DeploymentKind; label: string }[] = [
  { value: "AZURE", label: "Azure OpenAI in our tenant" },
  { value: "PRIVATE", label: "Our own endpoint or gateway" },
  { value: "MANAGED", label: "Managed by Lysp" },
];

const MODEL_SUGGESTIONS: Record<AiProvider, string> = {
  OPENAI: "gpt-4o",
  ANTHROPIC: "claude-sonnet-4-20250514",
  GEMINI: "gemini-1.5-pro",
  DEEPSEEK: "deepseek-chat",
};

/** Azure dates its API surface; a wrong or missing version is a common first-time failure. */
const DEFAULT_API_VERSION = "2024-10-21";

export function ConnectDeploymentDrawer({
  isOpen,
  onClose,
  existing,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  existing: AiProviderConfig | null;
  onSaved: () => void;
}) {
  const { saveProvider, isSaving } = useSaveProvider();

  const [kind, setKind] = useState<DeploymentKind>("AZURE");
  const [provider, setProvider] = useState<AiProvider>("OPENAI");
  const [modelName, setModelName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiVersion, setApiVersion] = useState(DEFAULT_API_VERSION);
  const [deploymentName, setDeploymentName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (existing) {
      setKind(deploymentKind(existing));
      setProvider(existing.provider);
      setModelName(existing.modelName ?? "");
      setBaseUrl(existing.baseUrl ?? "");
      setApiVersion(existing.apiVersion ?? DEFAULT_API_VERSION);
      setDeploymentName(existing.deploymentName ?? "");
    } else {
      setKind("AZURE");
      setProvider("OPENAI");
      setModelName("");
      setBaseUrl("");
      setApiVersion(DEFAULT_API_VERSION);
      setDeploymentName("");
    }
    setApiKey("");
    setShowKey(false);
    setError("");
  }, [isOpen, existing]);

  const providerOptions = useMemo(
    () =>
      (Object.keys(PROVIDER_LABEL) as AiProvider[]).map((p) => ({
        value: p,
        label: PROVIDER_LABEL[p],
      })),
    []
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!existing && !apiKey.trim()) {
      setError("A credential is required to connect a deployment.");
      return;
    }
    if (kind !== "MANAGED" && !baseUrl.trim()) {
      setError("Enter the endpoint Lysp should send requests to.");
      return;
    }
    if (kind === "AZURE" && !deploymentName.trim()) {
      setError("Azure routes by deployment name — enter the one you created in the portal.");
      return;
    }
    if (kind !== "MANAGED") {
      try {
        const parsed = new URL(baseUrl.trim());
        if (parsed.protocol !== "https:") {
          setError("The endpoint must be https. Credentials and client data travel over it.");
          return;
        }
      } catch {
        setError("That endpoint is not a valid URL.");
        return;
      }
    }

    try {
      await saveProvider({
        provider,
        apiKey: apiKey.trim(),
        modelName: modelName.trim() || MODEL_SUGGESTIONS[provider],
        // Cleared rather than omitted when switching back to managed, so a deployment that used
        // to point at a private endpoint does not keep routing there invisibly.
        baseUrl: kind === "MANAGED" ? "" : baseUrl.trim(),
        apiVersion: kind === "AZURE" ? apiVersion.trim() : "",
        deploymentName: kind === "AZURE" ? deploymentName.trim() : "",
      });
      onSaved();
      onClose();
    } catch (err) {
      const res = (err as { response?: { data?: { message?: string } } })?.response;
      setError(res?.data?.message || "Could not save that deployment.");
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={existing ? "Edit deployment" : "Connect a deployment"}
      size="xl"
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        {error && <Alert variant="error" message={error} />}

        <div className="flex flex-col gap-1.5">
          <Select
            label="Where does inference run"
            value={kind}
            onChange={(v) => setKind(v as DeploymentKind)}
            options={KIND_OPTIONS}
          />
          <p className="pl-1 text-[12px] leading-relaxed text-ink/60">{KIND_BLURB[kind]}</p>
        </div>

        {kind === "AZURE" && (
          <>
            <div className="flex flex-col gap-1.5">
              <label className={LABEL} htmlFor="dep-endpoint">
                Resource endpoint
              </label>
              <Input
                id="dep-endpoint"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://acme-legal.openai.azure.com"
              />
              <span className="pl-1 text-[11px] text-ink/60">
                From Azure AI Foundry, Keys and Endpoint. The region in this hostname is where
                requests are processed.
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className={LABEL} htmlFor="dep-name">
                  Deployment name
                </label>
                <Input
                  id="dep-name"
                  value={deploymentName}
                  onChange={(e) => setDeploymentName(e.target.value)}
                  placeholder="gpt-4o-pricing"
                />
                <span className="pl-1 text-[11px] text-ink/60">
                  What you named it, not the model.
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={LABEL} htmlFor="dep-version">
                  API version
                </label>
                <Input
                  id="dep-version"
                  value={apiVersion}
                  onChange={(e) => setApiVersion(e.target.value)}
                  placeholder={DEFAULT_API_VERSION}
                />
                <span className="pl-1 text-[11px] text-ink/60">
                  Azure dates its API. Wrong version, opaque failure.
                </span>
              </div>
            </div>
          </>
        )}

        {kind === "PRIVATE" && (
          <div className="flex flex-col gap-1.5">
            <label className={LABEL} htmlFor="dep-baseurl">
              Base URL
            </label>
            <Input
              id="dep-baseurl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://ai-gateway.acmelaw.com/v1"
            />
            <span className="pl-1 text-[11px] text-ink/60">
              Anything that answers the OpenAI wire format. Include the version path if your
              gateway expects one.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Model family"
            value={provider}
            onChange={(v) => setProvider(v as AiProvider)}
            options={providerOptions}
          />
          <div className="flex flex-col gap-1.5">
            <label className={LABEL} htmlFor="dep-model">
              Model
            </label>
            <Input
              id="dep-model"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder={MODEL_SUGGESTIONS[provider]}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={LABEL} htmlFor="dep-key">
            Credential {existing && <span className="font-normal normal-case">(leave blank to keep the current one)</span>}
          </label>
          <div className="relative">
            <Input
              id="dep-key"
              type={showKey ? "text" : "password"}
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={existing ? "Unchanged" : "Paste the key for this deployment"}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/60 transition-colors hover:text-ink cursor-pointer"
              aria-label={showKey ? "Hide credential" : "Show credential"}
            >
              {showKey ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-canvas p-4">
          <HiOutlineShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-ink/60" />
          <p className="text-[12px] leading-relaxed text-ink/60">
            The credential is encrypted before it is stored and is never returned by the API — not
            to this screen, not to anyone. Only the last four characters are ever shown again.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSaving}>
            {existing ? "Save deployment" : "Connect"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
