"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { HiArrowLeft, HiArrowRight, HiEye, HiEyeOff, HiOutlineShieldCheck } from "react-icons/hi";
import { getPublicApiBase } from "@/lib/api/baseUrl";

const fieldClass =
  "w-full rounded-full border border-black/[0.1] bg-[#f7f7f5] px-5 py-[0.95rem] text-[15px] text-[#0a0a0a] placeholder:text-[#0a0a0a]/60 outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-[#0a0a0a]/15 focus-visible:border-[#0a0a0a] disabled:opacity-60";

const primaryButtonClass =
  "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-[0.95rem] text-[15px] font-semibold text-[#fefefc] shadow-[0_14px_40px_-20px_rgba(10,10,10,0.55)] transition-all duration-200 hover:bg-black hover:shadow-[0_18px_48px_-18px_rgba(10,10,10,0.6)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer";

const backToEmailClass =
  "inline-flex items-center gap-2 text-[13px] font-semibold text-[#0a0a0a]/60 hover:text-[#0a0a0a] transition-colors py-1 -my-1 cursor-pointer";

type Step = "email" | "checking" | "password" | "sso";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [providerName, setProviderName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Resolve which identity provider owns this address (if any), then branch the form instead
   * of showing both a password field and a separate SSO button and making the person choose.
   * A domain with no SSO provider is not an error — it's the ordinary case — so a 404 here
   * just continues to the password step. A network/server hiccup on the *lookup* fails open
   * to the password step too, rather than blocking sign-in over a check that isn't essential.
   */
  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    if (!address.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setStep("checking");
    try {
      const res = await fetch(
        `${getPublicApiBase()}/api/v1/sso/provider-for-email?email=${encodeURIComponent(address)}`
      );
      if (res.ok) {
        const { providerName: found } = await res.json();
        setProviderName(found);
        setStep("sso");
        return;
      }
    } catch {
      // fall through to password
    }
    setStep("password");
  };

  const handleBack = () => {
    setStep("email");
    setPassword("");
    setProviderName(null);
    setError(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const loggedIn = await login({ email, password });
      if (
        loggedIn.userType === "CLIENT_USER" ||
        (loggedIn.roles || []).includes("CLIENT_USER")
      ) {
        router.push("/client-portal/dashboard");
        return;
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || errorObj.message || "Authentication failed";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSsoContinue = () => {
    if (!providerName) return;
    window.location.href = `${getPublicApiBase()}/api/oauth2/authorization/${encodeURIComponent(providerName)}`;
  };

  return (
    <div className="w-full space-y-5">
      {error ? (
        <div
          role="alert"
          className="rounded-full border border-black/[0.08] bg-[#0a0a0a]/[0.04] px-5 py-3.5 text-[13px] text-[#0a0a0a]/75 leading-snug text-center"
        >
          {error}
        </div>
      ) : null}

      {(step === "email" || step === "checking") && (
        <form onSubmit={handleContinue} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-[#0a0a0a]/60"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              className={`mt-2.5 ${fieldClass}`}
              placeholder="name@lawfirm.com"
              required
              disabled={step === "checking"}
            />
          </div>
          <button type="submit" disabled={step === "checking"} className={primaryButtonClass}>
            {step === "checking" ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Checking…
              </span>
            ) : (
              <>
                Continue
                <HiArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}

      {step === "sso" && (
        <div className="space-y-5">
          <button type="button" onClick={handleBack} className={backToEmailClass}>
            <HiArrowLeft className="h-3.5 w-3.5" />
            {email}
          </button>
          <div className="flex items-start gap-3 rounded-2xl border border-black/[0.08] bg-[#f7f7f5] px-5 py-4 text-[14px] leading-relaxed text-[#0a0a0a]/75">
            <HiOutlineShieldCheck className="h-5 w-5 shrink-0 mt-0.5 text-[#0a0a0a]/60" />
            <span>
              Your firm signs in with single sign-on. You&apos;ll continue on your
              organization&apos;s login page.
            </span>
          </div>
          <button type="button" onClick={handleSsoContinue} className={primaryButtonClass}>
            Continue with SSO
            <HiArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {step === "password" && (
        <form onSubmit={handlePasswordSubmit} className="space-y-5">
          <button type="button" onClick={handleBack} className={backToEmailClass}>
            <HiArrowLeft className="h-3.5 w-3.5" />
            {email}
          </button>
          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-[#0a0a0a]/60"
            >
              Password
            </label>
            <div className="relative mt-2.5">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                className={`${fieldClass} pr-12`}
                placeholder="Your password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#0a0a0a]/60 hover:text-[#0a0a0a]/70 transition-colors cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={isLoading} className={primaryButtonClass}>
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Signing in
              </span>
            ) : (
              <>
                Sign in
                <HiArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <div className="relative min-h-[100svh] w-full bg-[#fefefc] text-[#0a0a0a] lg:grid lg:grid-cols-12">
        {/* Brand panel */}
        <aside className="relative lg:col-span-7 min-h-[42svh] sm:min-h-[48svh] lg:min-h-[100svh] overflow-hidden text-[#fefefc]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/practices/ma-glass.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover scale-[1.01]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#060807] via-[#0a0f0d]/60 to-[#0a0f0d]/25"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-[#060807]/55 via-transparent to-[#060807]/15"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative z-10 flex h-full min-h-[42svh] sm:min-h-[48svh] lg:min-h-[100svh] flex-col px-6 sm:px-10 lg:px-14 xl:px-16 py-6 sm:py-8 lg:py-10">
            <div className="flex items-start justify-between gap-4">
              <Link
                href="/"
                className="inline-flex w-fit transition-opacity hover:opacity-90"
                aria-label="Lysp home"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo/lysp-logo-bw-white.png"
                  alt="Lysp"
                  width={1024}
                  height={1024}
                  className="h-16 w-16 sm:h-20 sm:w-20 lg:h-28 lg:w-28 object-contain drop-shadow-[0_12px_36px_rgba(0,0,0,0.5)]"
                />
              </Link>
              <Link
                href="/"
                className="lg:hidden text-[13px] font-medium text-white/75 hover:text-white transition-colors pt-1 py-1.5 -my-1.5"
              >
                Back to site
              </Link>
            </div>

            <div className="mt-auto pb-2 sm:pb-4 lg:pb-10 max-w-xl">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-white/50" />
                <p className="text-[11px] sm:text-[12px] font-semibold tracking-[0.28em] uppercase text-white/85">
                  Pricing intelligence
                </p>
              </div>
              <h1 className="mt-4 sm:mt-5 text-[1.85rem] sm:text-4xl lg:text-[2.85rem] xl:text-[3.35rem] font-semibold tracking-tight text-balance leading-[1.05]">
                For the desks that own the fee.
              </h1>
              <p className="mt-4 sm:mt-5 text-[14px] sm:text-[16px] text-white/78 leading-relaxed max-w-md">
                Firm history, rate cards, and negotiation in one place. Sign in to continue where
                your team left off.
              </p>

              <div className="mt-9 hidden lg:flex items-center gap-3 text-[12px] font-medium tracking-wide text-white/55">
                <span>Matter pricing</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>Negotiation trail</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>Realization</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Form panel */}
        <section className="relative lg:col-span-5 flex flex-col bg-[#fefefc] min-h-0 border-t border-black/[0.04] lg:border-t-0 lg:border-l lg:border-black/[0.06]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(10,10,10,0.028),transparent_50%)]"
          />

          <div className="relative hidden lg:flex items-center justify-end px-10 xl:px-14 pt-9">
            <Link
              href="/"
              className="text-[13px] font-medium text-[#0a0a0a]/60 hover:text-[#0a0a0a] transition-colors py-1.5 -my-1.5"
            >
              Back to site
            </Link>
          </div>

          <div className="relative flex flex-1 flex-col justify-center px-6 sm:px-10 lg:px-12 xl:px-16 py-10 sm:py-12 lg:py-8 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
            <div className="w-full max-w-[400px] mx-auto lg:mx-0">
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#0a0a0a]/60">
                Workspace
              </p>

              <h2 className="mt-6 text-[1.9rem] sm:text-[2.25rem] font-semibold tracking-tight leading-[1.08]">
                Welcome back.
              </h2>
              <p className="mt-3 text-[15px] text-[#0a0a0a]/60 leading-relaxed">
                Firm workspace sign-in.
              </p>

              <div className="mt-9 sm:mt-10">
                <LoginForm />
              </div>

              <div className="mt-10 pt-8 border-t border-black/[0.06]">
                <p className="text-[13px] text-[#0a0a0a]/60 leading-relaxed">
                  <Link
                    href="/login/forgot"
                    className="font-semibold text-[#0a0a0a]/70 hover:text-[#0a0a0a] underline underline-offset-4 inline-block py-1.5 -my-1.5"
                  >
                    Forgot your password?
                  </Link>
                  <span className="mx-2 text-[#0a0a0a]/25">|</span>
                  Looking for your{" "}
                  <a
                    href="https://client.lysp.ai"
                    className="font-semibold text-[#0a0a0a]/70 hover:text-[#0a0a0a] underline underline-offset-4 inline-block py-1.5 -my-1.5"
                  >
                    client portal
                  </a>
                  ?
                  <br />
                  Need access for your firm?{" "}
                  {/* Absolute, and a plain anchor: /contact only exists on the marketing site,
                      so on this host the middleware redirects it away. A Next Link prefetches
                      that redirect cross-origin and the browser blocks it on CORS — a console
                      error on every visit to the sign-in page, for a link nobody had clicked. */}
                  <a
                    href="https://lysp.ai/contact"
                    className="font-semibold text-[#0a0a0a] underline-offset-4 hover:underline inline-block py-1.5 -my-1.5"
                  >
                    Contact us
                  </a>
                </p>
              </div>
            </div>
          </div>

          <footer className="relative hidden lg:block px-10 xl:px-14 pb-9">
            <p className="text-[11px] text-[#0a0a0a]/60 tracking-wide">
              Privileged commercial data · Encrypted in transit
            </p>
          </footer>
        </section>
      </div>
    </AuthProvider>
  );
}
