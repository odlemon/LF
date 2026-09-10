"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClientAuthProvider } from "@/context/ClientAuthContext";
import { useClientAuth } from "@/hooks/useClientAuth";
import { HiArrowRight, HiEye, HiEyeOff } from "react-icons/hi";

/**
 * The client portal sign-in.
 *
 * <p>Built to the same structure as the firm sign-in: a full-bleed brand panel, an editorial
 * headline, the same form rhythm and the same button. Until now this was a generic centred
 * card in a different typeface with a different logo treatment — the first thing a client
 * ever saw of the product looked like a different product from the one their firm was
 * showing them. The two surfaces are meant to be recognisably one platform; they should
 * greet people the same way.
 */
function ClientLoginForm() {
  const { login } = useClientAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login({ email, password });
      router.push("/client-portal/dashboard");
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errorObj.response?.data?.message || errorObj.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const field =
    "w-full rounded-2xl border border-black/[0.08] bg-[#f6f6f3] px-5 py-[0.95rem] text-[15px] text-[#0a0a0a] placeholder:text-[#0a0a0a]/60 outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-[#0a0a0a]/15 focus-visible:border-[#0a0a0a] focus:bg-white focus:ring-4 focus:ring-black/[0.04] disabled:opacity-60";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200/70 bg-red-50 px-5 py-3 text-center text-[13px] font-medium text-red-700 animate-fade-in"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="client-email"
          className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/60"
        >
          Email
        </label>
        <input
          id="client-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
          placeholder="name@company.com"
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label
          htmlFor="client-password"
          className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a0a0a]/60"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="client-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${field} pr-12`}
            placeholder="Your password"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#0a0a0a]/60 transition-colors hover:bg-black/[0.04] hover:text-[#0a0a0a]/70"
          >
            {showPassword ? <HiEyeOff className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0a0a0a] px-6 py-[0.95rem] text-[15px] font-semibold text-[#fefefc] shadow-[0_14px_40px_-20px_rgba(10,10,10,0.55)] transition-all duration-200 hover:bg-black hover:shadow-[0_18px_48px_-18px_rgba(10,10,10,0.6)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none cursor-pointer"
      >
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
  );
}

export default function ClientLoginPage() {
  return (
    <ClientAuthProvider>
      <div className="relative min-h-[100svh] w-full bg-[#fefefc] text-[#0a0a0a] lg:grid lg:grid-cols-12">
        {/* Brand panel — same construction as the firm sign-in, different frame and copy. */}
        <aside className="relative min-h-[42svh] overflow-hidden text-[#fefefc] sm:min-h-[48svh] lg:col-span-7 lg:min-h-[100svh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/practices/banking-glass.jpg"
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-[1.01] object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#060807] via-[#0a0f0d]/60 to-[#0a0f0d]/25"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-[#060807]/55 via-transparent to-[#060807]/15"
          />

          <div className="relative z-10 flex h-full min-h-[42svh] flex-col px-6 py-6 sm:min-h-[48svh] sm:px-10 sm:py-8 lg:min-h-[100svh] lg:px-14 lg:py-10 xl:px-16">
            <div className="flex items-start justify-between gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo/lysp-logo-bw-white.png"
                alt="Lysp"
                width={1024}
                height={1024}
                className="h-16 w-16 object-contain drop-shadow-[0_12px_36px_rgba(0,0,0,0.5)] sm:h-20 sm:w-20 lg:h-28 lg:w-28"
              />
            </div>

            <div className="mt-auto max-w-xl pb-2 sm:pb-4 lg:pb-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85 sm:text-[12px]">
                Client workspace
              </p>
              <h1 className="mt-4 text-balance text-[1.85rem] font-semibold leading-[1.05] tracking-tight sm:mt-5 sm:text-4xl lg:text-[2.85rem] xl:text-[3.35rem]">
                Your proposals, in plain terms.
              </h1>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/78 sm:mt-5 sm:text-[16px]">
                Review each fee proposal, understand the rate card behind it, and respond with
                confidence.
              </p>

              <div className="mt-9 hidden items-center gap-3 text-[12px] font-medium tracking-wide text-white/55 lg:flex">
                <span>Proposals</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>Rate coach</span>
                <span className="h-1 w-1 rounded-full bg-white/30" />
                <span>Matter history</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Form column */}
        <section className="relative flex min-h-[58svh] flex-col lg:col-span-5 lg:min-h-[100svh]">
          <div className="hidden justify-end px-8 pt-6 lg:flex xl:px-12">
            <Link
              href="https://lysp.ai"
              className="text-[13px] font-medium text-[#0a0a0a]/60 transition-colors hover:text-[#0a0a0a] py-1.5 -my-1.5"
            >
              About Lysp
            </Link>
          </div>

          <div className="relative flex flex-1 flex-col justify-center px-6 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-10 sm:py-12 lg:px-12 lg:py-8 xl:px-16">
            <div className="mx-auto w-full max-w-[400px] lg:mx-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/60">
                Client portal
              </p>
              <h2 className="mt-6 text-[1.9rem] font-semibold leading-[1.08] tracking-tight sm:text-[2.25rem]">
                Welcome back.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#0a0a0a]/60">
                Sign in to the workspace your firm set up for you.
              </p>

              <div className="mt-9 sm:mt-10">
                <ClientLoginForm />
              </div>

              <div className="mt-10 border-t border-black/[0.06] pt-8">
                <p className="text-[13px] leading-relaxed text-[#0a0a0a]/60">
                  <Link
                    href="/client-login/forgot"
                    className="font-semibold text-[#0a0a0a]/70 hover:text-[#0a0a0a] underline underline-offset-4 inline-block py-1.5 -my-1.5"
                  >
                    Forgot your password?
                  </Link>
                  <br />
                  Access is by invitation from your firm. If you have not received one, ask your
                  relationship partner.
                </p>
              </div>
            </div>
          </div>

          <footer className="px-6 pb-6 sm:px-10 lg:px-12 xl:px-16">
            <p className="text-[11px] text-[#0a0a0a]/60">
              Only your organisation&apos;s proposals are visible here · Encrypted in transit
            </p>
          </footer>
        </section>
      </div>
    </ClientAuthProvider>
  );
}
