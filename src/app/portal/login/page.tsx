"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClientAuthProvider } from "@/context/ClientAuthContext";
import { useClientAuth } from "@/hooks/useClientAuth";
import { Button } from "@/components/ui/Button";
import { HiLockClosed, HiXCircle } from "react-icons/hi";

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
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8 flex flex-col items-center text-center gap-6 animate-fade-in">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-black/[0.08] border-t-[#0a0a0a] animate-spin" />
          <HiLockClosed className="w-6 h-6 text-[#0a0a0a]/60 absolute" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1.5">Verifying Invitation</h1>
          <p className="text-sm text-gray-500">
            Establishing a secure connection and validating your portal token...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-gray-200 p-8 flex flex-col items-center text-center gap-6 animate-fade-in-up">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <HiXCircle className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1.5">Verification Failed</h1>
        <p className="text-xs text-gray-500 leading-relaxed">
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
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8 flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full border-4 border-black/[0.08] border-t-[#0a0a0a] animate-spin" />
              <h1 className="text-xl font-bold text-gray-900 mb-1.5">Loading Portal</h1>
            </div>
          }
        >
          <PortalLoginHandler />
        </Suspense>
      </div>
    </ClientAuthProvider>
  );
}
