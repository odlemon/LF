"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IdentityProviderConfig, SaveIdentityProviderCommand } from "../types";

interface IdentityProviderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (command: SaveIdentityProviderCommand) => Promise<any>;
  existingConfig: IdentityProviderConfig | null;
}

const inputClassName =
  "w-full px-5 py-2.5 bg-surface border border-border focus:border-primary focus:ring-primary/20 rounded-full text-xs text-ink/90 focus:outline-none focus:ring-2 font-medium";

const labelClassName = "text-[10px] font-bold text-ink/40 uppercase tracking-wider pl-1 select-none";

export function IdentityProviderFormModal({
  isOpen,
  onClose,
  onSave,
  existingConfig,
}: IdentityProviderFormModalProps) {
  const [providerName, setProviderName] = useState("");
  const [issuerUri, setIssuerUri] = useState("");
  const [authorizationUri, setAuthorizationUri] = useState("");
  const [tokenUri, setTokenUri] = useState("");
  const [userInfoUri, setUserInfoUri] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [emailDomain, setEmailDomain] = useState("");
  const [defaultRoleName, setDefaultRoleName] = useState("CRM");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProviderName(existingConfig?.providerName || "");
      setIssuerUri(existingConfig?.issuerUri || "");
      setAuthorizationUri(existingConfig?.authorizationUri || "");
      setTokenUri(existingConfig?.tokenUri || "");
      setUserInfoUri(existingConfig?.userInfoUri || "");
      setClientId(existingConfig?.clientId || "");
      setClientSecret("");
      setEmailDomain(existingConfig?.emailDomain || "");
      setDefaultRoleName(existingConfig?.defaultRoleName || "CRM");
      setError(null);
    }
  }, [isOpen, existingConfig]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !providerName.trim() ||
      !authorizationUri.trim() ||
      !tokenUri.trim() ||
      !userInfoUri.trim() ||
      !clientId.trim() ||
      !emailDomain.trim()
    ) {
      setError("Provider name, authorization/token/user-info URLs, client ID, and email domain are required.");
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
        issuerUri: issuerUri.trim() || undefined,
        authorizationUri: authorizationUri.trim(),
        tokenUri: tokenUri.trim(),
        userInfoUri: userInfoUri.trim(),
        clientId: clientId.trim(),
        clientSecret: clientSecret.trim() || undefined,
        emailDomain: emailDomain.trim(),
        defaultRoleName: defaultRoleName.trim() || "CRM",
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save identity provider.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingConfig ? "Edit Identity Provider" : "New Identity Provider"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200/50 text-rose-700 text-xs font-bold rounded-2xl">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className={labelClassName}>Provider Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. demo-sso (also the OAuth2 registration id)"
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            disabled={!!existingConfig}
            className={`${inputClassName} disabled:opacity-60`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
              Client Secret {existingConfig ? "(leave blank to keep current)" : "*"}
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClassName}>Issuer URI</label>
          <input
            type="text"
            value={issuerUri}
            onChange={(e) => setIssuerUri(e.target.value)}
            placeholder="e.g. https://idp.example.com"
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelClassName}>Authorization URI *</label>
          <input
            type="text"
            required
            value={authorizationUri}
            onChange={(e) => setAuthorizationUri(e.target.value)}
            className={inputClassName}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClassName}>Token URI *</label>
            <input
              type="text"
              required
              value={tokenUri}
              onChange={(e) => setTokenUri(e.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClassName}>User Info URI *</label>
            <input
              type="text"
              required
              value={userInfoUri}
              onChange={(e) => setUserInfoUri(e.target.value)}
              className={inputClassName}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={labelClassName}>Email Domain *</label>
            <input
              type="text"
              required
              placeholder="e.g. acmelaw.com"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              className={inputClassName}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClassName}>Default Role</label>
            <input
              type="text"
              value={defaultRoleName}
              onChange={(e) => setDefaultRoleName(e.target.value)}
              className={inputClassName}
            />
          </div>
        </div>
        <span className="text-[10px] font-semibold text-ink/40 pl-1 -mt-2">
          A brand-new user whose email matches this domain is auto-provisioned on first SSO login with this role — never an admin role, so a first login can never self-escalate.
        </span>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border shrink-0">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {existingConfig ? "Save Changes" : "Create Provider"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
