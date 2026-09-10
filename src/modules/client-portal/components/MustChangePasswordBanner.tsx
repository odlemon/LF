"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineKey } from "react-icons/hi";
import { useClientAuth } from "@/hooks/useClientAuth";

export function MustChangePasswordBanner() {
  const { user } = useClientAuth();
  const pathname = usePathname();

  if (!user?.mustChangePassword) return null;
  if (pathname?.startsWith("/client-portal/settings")) return null;

  return (
    <div className="shrink-0 border-b border-amber-200/80 bg-amber-50 px-4 py-2.5 text-amber-950 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <HiOutlineKey className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Update your password</p>
            <p className="text-xs text-amber-900/70 dark:text-amber-400">
              Your account still uses a temporary password. Set a new one to keep this workspace secure.
            </p>
          </div>
        </div>
        <Link
          href="/client-portal/settings#security"
          className="rounded-full bg-ink px-3.5 py-1.5 text-xs font-semibold text-canvas hover:opacity-90"
        >
          Change password
        </Link>
      </div>
    </div>
  );
}
