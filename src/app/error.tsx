"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Root error boundary — the 500.
 *
 * <p>Deliberately says nothing about what failed. A stack trace or exception message on a page
 * about privileged pricing data is a disclosure, and it tells the reader nothing they can act on
 * anyway. The digest is shown because it is the one thing that makes a support conversation
 * productive: it identifies this occurrence in the server log without revealing its contents.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in the browser console for anyone debugging locally; the server already has the
    // full trace against this digest.
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#fefefc] text-[#0a0a0a] flex items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0a0a0a]/60">
          Something went wrong
        </p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
          We hit a problem on our side.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[#0a0a0a]/60">
          Your work is safe. This was a fault in the application, not in anything you did — try
          again, and if it keeps happening tell us and we will look at it directly.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#0a0a0a] px-6 py-2.5 text-[15px] font-semibold text-[#fefefc] transition-opacity hover:opacity-90 cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-2.5 text-[15px] font-semibold transition-colors hover:border-black/25"
          >
            Back to safety
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-[13px] text-[#0a0a0a]/60">
            Reference <span className="font-mono text-[#0a0a0a]/70">{error.digest}</span> — quote
            this to{" "}
            <a href="mailto:support@lysp.ai" className="underline underline-offset-4 hover:text-[#0a0a0a]">
              support@lysp.ai
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
