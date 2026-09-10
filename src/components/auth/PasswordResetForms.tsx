"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

/**
 * Shared password-reset UI for both surfaces.
 *
 * The two logins differ in chrome but the flow is identical, so one component serves both and
 * takes the copy that differs as props: a client whose firm issued their access needs different
 * words from a lawyer who has forgotten their own.
 */

const FIELD =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-[15px] text-[#0a0a0a] placeholder-[#0a0a0a]/35 outline-none transition-colors focus-visible:ring-4 focus-visible:ring-[#0a0a0a]/15 focus-visible:border-[#0a0a0a] disabled:opacity-60";
const LABEL = "block text-[12px] font-semibold tracking-wide text-[#0a0a0a]/55 mb-1.5";
const BUTTON =
  "w-full inline-flex items-center justify-center rounded-full bg-[#0a0a0a] px-6 py-2.5 text-[15px] font-semibold text-[#fefefc] transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer";

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#fefefc] text-[#0a0a0a] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {children}
      </div>
    </main>
  );
}

export function ForgotPasswordForm({ portal, backHref }: { portal: boolean; backHref: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await apiClient.post(
        portal
          ? ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST_PORTAL
          : ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST,
        { email }
      );
    } catch {
      // Deliberately swallowed. The server answers identically whether or not the address is
      // known, and showing a failure here would leak the distinction it works to hide.
    } finally {
      setSent(true);
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Shell title="Check your email">
        <p className="mt-4 text-[15px] leading-relaxed text-[#0a0a0a]/60">
          If <span className="font-semibold text-[#0a0a0a]/80">{email}</span> has an account, a
          reset link is on its way. It works once and expires in an hour.
        </p>
        <Link
          href={backHref}
          className="mt-8 inline-block text-[14px] font-semibold underline underline-offset-4 py-1.5"
        >
          Back to sign in
        </Link>
      </Shell>
    );
  }

  return (
    <Shell title="Reset your password">
      <p className="mt-3 text-[15px] leading-relaxed text-[#0a0a0a]/60">
        {portal
          ? "Enter the address your firm used to set up your access and we will send you a link."
          : "Enter your work email and we will send you a link to choose a new password."}
      </p>
      <form onSubmit={submit} className="mt-7 flex flex-col gap-4">
        <div>
          <label className={LABEL} htmlFor="reset-email">
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            required
            autoComplete="email"
            className={FIELD}
            placeholder={portal ? "name@company.com" : "name@lawfirm.com"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
        </div>
        <button type="submit" className={BUTTON} disabled={busy || !email.trim()}>
          {busy ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <Link
        href={backHref}
        className="mt-6 inline-block text-[14px] font-semibold text-[#0a0a0a]/55 hover:text-[#0a0a0a] py-1.5"
      >
        Back to sign in
      </Link>
    </Shell>
  );
}

export function ResetPasswordForm({ backHref }: { backHref: string }) {
  const params = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tooShort = password.length > 0 && password.length < 12;
  const mismatch = confirm.length > 0 && confirm !== password;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await apiClient.post(ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, { token, password });
      setDone(true);
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { message?: string } } })?.response;
      setError(res?.data?.message || "That link is no longer valid. Request a new one.");
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <Shell title="That link is incomplete">
        <p className="mt-4 text-[15px] leading-relaxed text-[#0a0a0a]/60">
          The reset link is missing its token. Copy it from your email again, or request a new one.
        </p>
        <Link
          href={backHref}
          className="mt-8 inline-block text-[14px] font-semibold underline underline-offset-4 py-1.5"
        >
          Back to sign in
        </Link>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell title="Password changed">
        <p className="mt-4 text-[15px] leading-relaxed text-[#0a0a0a]/60">
          You can sign in with your new password now.
        </p>
        <Link
          href={backHref}
          className="mt-8 inline-block text-[14px] font-semibold underline underline-offset-4 py-1.5"
        >
          Sign in
        </Link>
      </Shell>
    );
  }

  return (
    <Shell title="Choose a new password">
      <form onSubmit={submit} className="mt-7 flex flex-col gap-4">
        <div>
          <label className={LABEL} htmlFor="new-password">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            required
            autoComplete="new-password"
            className={FIELD}
            placeholder="At least 12 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
          {tooShort && (
            <p className="mt-1.5 text-[13px] text-[#b45309]">
              A little longer &mdash; 12 characters minimum.
            </p>
          )}
        </div>
        <div>
          <label className={LABEL} htmlFor="confirm-password">
            Confirm
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            autoComplete="new-password"
            className={FIELD}
            placeholder="Type it again"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={busy}
          />
          {mismatch && <p className="mt-1.5 text-[13px] text-[#b45309]">Those do not match.</p>}
        </div>

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-[14px] text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          className={BUTTON}
          disabled={busy || password.length < 12 || password !== confirm}
        >
          {busy ? "Saving..." : "Set new password"}
        </button>
      </form>
    </Shell>
  );
}
