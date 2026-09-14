"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClientAuthProvider } from "@/context/ClientAuthContext";
import { useClientAuth } from "@/hooks/useClientAuth";
import { Button } from "@/components/ui/Button";
import { HiLockClosed, HiXCircle } from "react-icons/hi";

const CARD_CLASS =
  "w-full max-w-md bg-surface rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-border p-8 flex flex-col items-center text-center gap-6";

function PortalLoginHandler() {
  const { login } = useClientAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function handleAutoLogin() {
      if (!token) {
        setStatus("error");
        setErrorMessage("No invitation token found in the URL. Please verify your secure invitation link.");
        return;
      }

      try {
        await login({ inviteToken: token });
        router.push("/client-portal/dashboard");
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(
          err.response?.data?.message ||
          err.message ||
          "The invitation token is invalid or has expired (validity limit is 72 hours)."
        );
      }
    }

    handleAutoLogin();
  }, [token, login, router]);

  if (status === "loading") {
    return (
      <div className={`${CARD_CLASS} animate-fade-in`}>
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-ink/10 border-t-ink animate-spin" />
          <HiLockClosed className="w-6 h-6 text-ink/60 absolute" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink mb-1.5">Verifying Invitation</h1>
          <p className="text-sm text-ink/60">
            Establishing a secure connection and validating your portal token...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CARD_CLASS} animate-fade-in-up`}>
      {/*
        No dark: variant here on purpose -- like every other pre-auth page (/login,
        /client-login), this route isn't wrapped in ThemeProvider, so a `.dark` class is
        never applied to it regardless of the visitor's preference. Adding dark: classes
        here would be dead code implying a capability this page structurally doesn't have.
      */}
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <HiXCircle className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-ink mb-1.5">Verification Failed</h1>
        <p className="text-xs text-ink/60 leading-relaxed">
          {errorMessage}
        </p>
      </div>
      <Button
        variant="secondary"
        onClick={() => router.push("/client-login")}
        className="w-full font-semibold py-2.5"
      >
        Go to Client Sign In
      </Button>
    </div>
  );
}

export default function PortalLoginPage() {
  return (
    <ClientAuthProvider>
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <Suspense
          fallback={
            <div className={CARD_CLASS}>
              <div className="w-16 h-16 rounded-full border-4 border-ink/10 border-t-ink animate-spin" />
              <h1 className="text-xl font-bold text-ink mb-1.5">Loading Portal</h1>
            </div>
          }
        >
          <PortalLoginHandler />
        </Suspense>
      </div>
    </ClientAuthProvider>
  );
}
