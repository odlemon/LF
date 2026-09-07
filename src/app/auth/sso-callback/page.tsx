"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SsoCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const ssoError = searchParams.get("ssoError");

    if (ssoError) {
      router.replace(`/auth?ssoError=${encodeURIComponent(ssoError)}`);
      return;
    }
    if (!token) {
      router.replace("/auth?ssoError=missing_token");
      return;
    }
    localStorage.setItem("token", token);
    router.replace("/dashboard");
  }, [router, searchParams]);

  return (
    <div className="flex items-center gap-3 text-[#0a0a0a]/50">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
      <span className="text-[14px]">Signing you in…</span>
    </div>
  );
}

/**
 * Lands here after a successful SSO login — the backend's SsoAuthenticationSuccessHandler
 * redirects to /auth/sso-callback?token=... with the same internal JWT a password login
 * would produce. Stores it exactly like AuthContext.login() does, then hands off to the
 * dashboard; AuthContext's own effect picks up the stored token on the next mount.
 */
export default function SsoCallbackPage() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-[#fefefc]">
      <Suspense
        fallback={
          <div className="flex items-center gap-3 text-[#0a0a0a]/50">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
            <span className="text-[14px]">Signing you in…</span>
          </div>
        }
      >
        <SsoCallbackHandler />
      </Suspense>
    </div>
  );
}
