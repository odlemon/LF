"use client";

import React, { useCallback, useEffect, useState } from "react";
import { HiCheckCircle, HiClipboardCopy, HiExclamationCircle } from "react-icons/hi";
import toast from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useRoles } from "@/modules/roles/hooks/useRoles";
import { ssoApi } from "@/lib/api/modules/sso.api";
import {
  IdentityProviderConfig,
  IssuerCheckResult,
  SaveIdentityProviderCommand,
} from "../types";

/**
 * Configuring an identity provider used to mean transcribing three endpoint URLs by hand while
 * the one field that makes all three unnecessary — the issuer — was optional. Any real OIDC
 * provider (Keycloak, Okta, Entra) publishes those endpoints at its discovery document, so this
 * form asks for the issuer first, checks it against the provider before saving, and keeps the
 * manual endpoints behind a disclosure for the rare provider that has no discovery document.
 *
 * It also shows the redirect URI this deployment will use. That value has to be registered on the
 * provider's side, and a mismatch of one trailing slash is otherwise only discoverable through a
 * user's failed login.
 */

interface IdentityProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (command: SaveIdentityProviderCommand) => Promise<unknown>;
  existingConfig: IdentityProviderConfig | null;
}

const inputClassName =
  "w-full px-5 py-2.5 bg-surface border border-border focus:border-primary focus:ring-primary/20 rounded-full text-xs text-ink/90 focus:outline-none focus:ring-2 font-medium";

const labelClassName = "text-[10px] font-bold text-ink/40 uppercase tracking-wider pl-1 select-none";

const hintClassName = "text-[10px] font-semibold text-ink/40 pl-1";

function errorMessage(err: unknown, fallback: string): string {
  const response = (err as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message || (err as Error)?.message || fallback;
}

export function IdentityProviderFormModal({
  isOpen,
  onClose,
  onSave,
  existingConfig,
}: IdentityProviderFormModalProps) {
  const { roles } = useRoles();

  const [providerName, setProviderName] = useState("");
  const [issuerUri, setIssuerUri] = useState("");
  const [authorizationUri, setAuthorizationUri] = useState("");
  const [tokenUri, setTokenUri] = useState("");
  const [userInfoUri, setUserInfoUri] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [defaultRoleName, setDefaultRoleName] = useState("CRM");
  const [manualEndpoints, setManualEndpoints] = useState(false);

  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState<IssuerCheckResult | null>(null);
  const [redirectUri, setRedirectUri] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setProviderName(existingConfig?.providerName || "");
    setIssuerUri(existingConfig?.issuerUri || "");
    setAuthorizationUri(existingConfig?.authorizationUri || "");
    setTokenUri(existingConfig?.tokenUri || "");
    setUserInfoUri(existingConfig?.userInfoUri || "");
    setClientId(existingConfig?.clientId || "");
    setClientSecret("");
    setEmailDomain(existingConfig?.emailDomain || "");
    setDefaultRoleName(existingConfig?.defaultRoleName || "CRM");
    setManualEndpoints(!!existingConfig && !existingConfig.issuerUri);
    setChecked(null);
    setError(null);
  }, [isOpen, existingConfig]);

  // The callback URL depends only on where this deployment is served from, so it can be shown
  // before anything else is filled in — it is the first thing the provider's side needs.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    void ssoApi
      .redirectUri(providerName.trim() || "")
      .then((uri) => {
        if (!cancelled) setRedirectUri(uri);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [isOpen, providerName]);

  const checkIssuer = useCallback(async () => {
    if (!issuerUri.trim()) {
      setError("Enter the issuer URL first.");
      return;
    }
    setChecking(true);
    setError(null);
    try {
      const result = await ssoApi.verifyIssuer(issuerUri.trim(), providerName.trim());
      setChecked(result);
      setAuthorizationUri(result.authorizationUri);
      setTokenUri(result.tokenUri);
      setUserInfoUri(result.userInfoUri);
    } catch (err) {
      setChecked(null);
      setError(errorMessage(err, "Could not read that provider's OpenID configuration."));
    } finally {
      setChecking(false);
    }
  }, [issuerUri, providerName]);

  if (!isOpen) return null;

  const copyRedirectUri = async () => {
    try {
      await navigator.clipboard.writeText(redirectUri);
      toast.success("Redirect URI copied");
    } catch {
      toast.error("Could not copy — select the text instead");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerName.trim() || !clientId.trim() || !emailDomain.trim()) {
      setError("Provider name, client ID and email domain are required.");
      return;
    }
    if (!manualEndpoints && !issuerUri.trim()) {
      setError(
        "Enter the issuer URL, or switch on manual endpoints if the provider has no discovery document."
      );
      return;
    }
    if (manualEndpoints && (!authorizationUri.trim() || !tokenUri.trim() || !userInfoUri.trim())) {
      setError("All three endpoint URLs are required when there is no issuer to discover them from.");
      return;
    }
    if (!existingConfig && !clientSecret.trim()) {
      setError("Client secret is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        providerName: providerName.trim(),
        issuerUri: manualEndpoints ? undefined : issuerUri.trim(),
        authorizationUri: authorizationUri.trim() || undefined,
        tokenUri: tokenUri.trim() || undefined,
        userInfoUri: userInfoUri.trim() || undefined,
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim() || undefined,
        emailDomain: emailDomain.trim(),
        defaultRoleName: defaultRoleName.trim() || "CRM",
      });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Failed to save identity provider."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = roles.length
    ? roles.map((r) => ({ value: r.name, label: r.name }))
    : [{ value: defaultRoleName, label: defaultRoleName }];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingConfig ? "Edit identity provider" : "New identity provider"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="flex items-start gap-2 p-3.5 bg-danger/5 border border-danger/25 text-danger text-xs font-semibold rounded-2xl leading-relaxed">
            <HiExclamationCircle className="w-4 h-4 shrink-0 mt-px" />
            <span>{error}</span>
          </div>
        )}

        {/* Register this on the provider's side. Shown first because it is the step that happens
            outside Lysp, and the one people forget. */}
        <div className="rounded-2xl border border-border bg-canvas p-4 flex flex-col gap-2">
          <span className={labelClassName}>Redirect URI to register with the provider</span>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 truncate text-[11px] font-mono text-ink/80 bg-surface border border-border rounded-full px-4 py-2">
              {redirectUri || "—"}
            </code>
            <button
              type="button"
              onClick={copyRedirectUri}
              disabled={!redirectUri}
              className="shrink-0 p-2 rounded-full border border-border text-ink/50 hover:text-ink hover:border-ink/30 transition-colors cursor-pointer disabled:opacity-40"
              aria-label="Copy redirect URI"
            >
              <HiClipboardCopy className="w-4 h-4" />
            </button>
          </div>
          <span className={hintClassName}>
            In Keycloak this is the client&apos;s <em>Valid redirect URI</em>. It must match exactly.
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClassName}>Provider name *</label>
          <input
            type="text"
            required
            placeholder="keycloak"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value.toLowerCase())}
            disabled={!!existingConfig}
            className={`${inputClassName} disabled:opacity-60`}
          />
          <span className={hintClassName}>
            Lowercase letters, digits and hyphens. It appears in the sign-in URL.
          </span>
        </div>

        {!manualEndpoints && (
          <div className="flex flex-col gap-1.5">
            <label className={labelClassName}>Issuer URL *</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={issuerUri}
                onChange={(e) => {
                  setIssuerUri(e.target.value);
                  setChecked(null);
                }}
                placeholder="https://sso.acmelaw.com/realms/acme"
                className={inputClassName}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => void checkIssuer()}
                loading={checking}
                disabled={!issuerUri.trim()}
              >
                Check
              </Button>
            </div>
            <span className={hintClassName}>
              For Keycloak this is the realm root — https://host/realms/your-realm. Everything else
              is read from its discovery document.
            </span>
          </div>
        )}

        {checked && (
          <div className="rounded-2xl border border-border bg-canvas p-4 flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-ink">
              <HiCheckCircle className="w-4 h-4" />
              Provider reachable
            </span>
            <dl className="grid grid-cols-1 gap-1.5 text-[11px] font-mono text-ink/60">
              {[
                ["authorize", checked.authorizationUri],
                ["token", checked.tokenUri],
                ["userinfo", checked.userInfoUri],
                ["jwks", checked.jwkSetUri],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2 min-w-0">
                  <dt className="w-16 shrink-0 text-ink/35">{label}</dt>
                  <dd className="truncate">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClassName}>Client ID *</label>
            <input
              type="text"
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClassName}>
              Client secret {existingConfig ? "(leave blank to keep current)" : "*"}
            </label>
            <input
              type="password"
              autoComplete="new-password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClassName}>Email domain *</label>
            <input
              type="text"
              required
              placeholder="acmelaw.com"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              className={inputClassName}
            />
          </div>
          <Select
            label="Default role"
            value={defaultRoleName}
            onChange={setDefaultRoleName}
            options={roleOptions}
            placeholder="Choose a role"
          />
        </div>
        <span className={`${hintClassName} -mt-2 leading-relaxed`}>
          Only an identity whose email ends in this domain is accepted, even after the provider has
          authenticated it — an identity provider says who someone is, not which firm&apos;s data
          they reach. A new user lands on the role above, never an admin one, so a first SSO login
          cannot self-escalate.
        </span>

        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setManualEndpoints((v) => !v)}
            className="text-[11px] font-bold text-ink/50 hover:text-ink transition-colors cursor-pointer py-1.5 -my-1.5"
          >
            {manualEndpoints
              ? "← Use an issuer URL instead"
              : "Provider has no discovery document — enter endpoints manually"}
          </button>
        </div>

        {manualEndpoints && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelClassName}>Authorization URL *</label>
              <input
                type="text"
                value={authorizationUri}
                onChange={(e) => setAuthorizationUri(e.target.value)}
                className={inputClassName}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelClassName}>Token URL *</label>
                <input
                  type="text"
                  value={tokenUri}
                  onChange={(e) => setTokenUri(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClassName}>User info URL *</label>
                <input
                  type="text"
                  value={userInfoUri}
                  onChange={(e) => setUserInfoUri(e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
            <span className={`${hintClassName} leading-relaxed`}>
              Without an issuer there is no JWKS to validate an id_token against, so this path signs
              in from the user-info endpoint alone. Prefer an issuer URL wherever the provider
              offers one.
            </span>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-3 border-t border-border shrink-0">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {existingConfig ? "Save changes" : "Create provider"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
