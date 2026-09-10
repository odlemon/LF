"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import {
  PortalAtmosphere,
  PortalPageHeader,
} from "@/modules/client-portal/PortalChrome";

export default function FirmPreferencesPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const roles = user?.roles || [];
  const canFirmSettings =
    roles.includes("ADMIN") ||
    roles.includes("SUPER_ADMIN") ||
    (user?.permissions || []).includes("FIRM_READ");
  const isPartner =
    roles.includes("PARTNER") &&
    !roles.includes("ADMIN") &&
    !roles.includes("SUPER_ADMIN");

  return (
    <PortalAtmosphere>
      <div className="mx-auto w-full max-w-5xl space-y-8 px-5 py-6 sm:px-8 sm:py-8 animate-fade-in">
        <PortalPageHeader
          eyebrow="Settings"
          title="Preferences"
          description="Appearance, shortcuts for your role, and session controls."
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <section className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                Appearance
              </p>
              <div className="mt-3 flex items-center justify-between gap-4 border-y border-border/50 py-4">
                <div>
                  <p className="text-sm font-semibold text-ink">Theme</p>
                  <p className="mt-0.5 text-xs text-ink/45">
                    Currently {theme === "dark" ? "dark" : "light"} mode
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
                Session
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-y border-border/50 py-4">
                <div>
                  <p className="text-sm font-semibold text-ink">Sign out</p>
                  <p className="mt-0.5 text-xs text-ink/45">{user?.email}</p>
                </div>
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
            </div>
          </section>

          <section className="lg:col-span-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
              {isPartner ? "Partner shortcuts" : "Firm"}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {isPartner && (
                <>
                  <Link
                    href="/negotiations"
                    className="rounded-2xl border border-border/70 bg-surface p-4 transition-colors hover:border-ink/20"
                  >
                    <p className="text-sm font-semibold text-ink py-1.5 -my-1.5">Negotiations</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink/45">
                      Live fee proposals and counters with your clients.
                    </p>
                  </Link>
                  <Link
                    href="/approvals"
                    className="rounded-2xl border border-border/70 bg-surface p-4 transition-colors hover:border-ink/20"
                  >
                    <p className="text-sm font-semibold text-ink py-1.5 -my-1.5">Approvals</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink/45">
                      Preferred scenarios waiting on your sign-off.
                    </p>
                  </Link>
                  <Link
                    href="/clients"
                    className="rounded-2xl border border-border/70 bg-surface p-4 transition-colors hover:border-ink/20"
                  >
                    <p className="text-sm font-semibold text-ink py-1.5 -my-1.5">Clients</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink/45">
                      Relationship profiles tied to your book.
                    </p>
                  </Link>
                  <Link
                    href="/account"
                    className="rounded-2xl border border-border/70 bg-field/80 p-4 transition-colors hover:border-ink/20"
                  >
                    <p className="text-sm font-semibold text-ink py-1.5 -my-1.5">Profile</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink/45">
                      Name, email, and how you appear in the firm.
                    </p>
                  </Link>
                </>
              )}
              {canFirmSettings && (
                <Link
                  href="/settings/firm"
                  className="rounded-2xl border border-border/70 bg-surface p-4 transition-colors hover:border-ink/20 sm:col-span-2"
                >
                  <p className="text-sm font-semibold text-ink py-1.5 -my-1.5">
                    Firm configuration
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-ink/45">
                    Practice areas, rate cards, users, and more.
                  </p>
                </Link>
              )}
              {!isPartner && !canFirmSettings && (
                <p className="text-sm text-ink/45 sm:col-span-2">
                  No additional firm settings are available for your role.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </PortalAtmosphere>
  );
}
