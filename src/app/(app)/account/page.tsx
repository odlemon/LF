"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import {
  PortalAtmosphere,
  PortalPageHeader,
} from "@/modules/client-portal/PortalChrome";

export default function FirmAccountPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  const initials = (() => {
    if (!user) return "LY";
    const first = user.firstName?.[0] || "";
    const last = user.lastName?.[0] || "";
    return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || "LY";
  })();

  const roles = user?.roles || [];
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "User";

  return (
    <PortalAtmosphere>
      <div className="mx-auto w-full max-w-5xl space-y-8 px-5 py-6 sm:px-8 sm:py-8 animate-fade-in">
        <PortalPageHeader
          eyebrow="Account"
          title="Your profile"
          description="How you appear across approvals, negotiations, and client relationships."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <section className="lg:col-span-5">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-start">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-on-primary">
                {initials}
              </span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-ink">
                  {fullName}
                </h2>
                <p className="mt-0.5 text-sm text-ink/60">{user?.email}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {roles.map((role) => (
                    <span
                      key={role}
                      className="rounded-md border border-border bg-field px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink/60"
                    >
                      {role.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-ink/60">
              You are signed into the firm workspace. Partners lead client
              relationships, pricing approvals, and live rate negotiations.
            </p>
          </section>

          <section className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
                Workspace
              </p>
              <dl className="mt-3 divide-y divide-border/50 border-y border-border/50">
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-sm text-ink/60">Display name</dt>
                  <dd className="text-sm font-semibold text-ink">{fullName}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-3.5">
                  <dt className="text-sm text-ink/60">Sign-in email</dt>
                  <dd className="text-sm font-semibold text-ink">{user?.email}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <dt className="text-sm font-semibold text-ink">Appearance</dt>
                    <dd className="mt-0.5 text-xs text-ink/60">
                      Currently {theme === "dark" ? "dark" : "light"} mode
                    </dd>
                  </div>
                  <ThemeToggle />
                </div>
              </dl>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-5">
              <Link
                href="/settings/preferences"
                className="text-sm font-semibold text-ink underline-offset-2 hover:underline py-1.5 -my-1.5"
              >
                Open settings
              </Link>
              <Button
                variant="secondary"
                onClick={async () => {
                  await logout();
                  router.push("/login");
                }}
              >
                Sign out
              </Button>
            </div>
          </section>
        </div>
      </div>
    </PortalAtmosphere>
  );
}
