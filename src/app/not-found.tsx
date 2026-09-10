import Link from "next/link";

/**
 * Root 404.
 *
 * <p>Served for every mistyped URL on all three surfaces, so it cannot assume the workspace
 * shell or an authenticated session — a prospect following a rotted link from a pitch deck lands
 * here too. Plain marketing colours rather than the platform tokens for the same reason: those
 * are scoped to `.platform-root`, which is not mounted on this route.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#fefefc] text-[#0a0a0a] flex items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0a0a0a]/60">
          404
        </p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
          That page isn&apos;t here.
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[#0a0a0a]/60">
          The link may be out of date, or the address slightly off. Nothing is broken — you have
          simply arrived somewhere that does not exist.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#0a0a0a] px-6 py-2.5 text-[15px] font-semibold text-[#fefefc] transition-opacity hover:opacity-90"
          >
            Back to lysp.ai
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-2.5 text-[15px] font-semibold transition-colors hover:border-black/25"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-8 text-[13px] text-[#0a0a0a]/60">
          Looking for your client portal?{" "}
          <a href="https://client.lysp.ai" className="underline underline-offset-4 hover:text-[#0a0a0a]">
            client.lysp.ai
          </a>
        </p>
      </div>
    </main>
  );
}
