"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import { useClientAuth } from "@/hooks/useClientAuth";
import {
  changePortalPassword,
  loadNotificationPrefs,
  saveNotificationPrefs,
  type PortalNotificationPrefs,
} from "@/modules/client-portal/api";
import {
  PortalAtmosphere,
  PortalPageHeader,
} from "@/modules/client-portal/PortalChrome";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-ink/45">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-ink" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-canvas shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

export default function ClientSettingsPage() {
  const { theme } = useTheme();
  const { logout, clearMustChangePassword, user } = useClientAuth();
  const router = useRouter();
  const [prefs, setPrefs] = useState<PortalNotificationPrefs>(() => loadNotificationPrefs());
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#security") {
      document.getElementById("security")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const persistPrefs = (next: PortalNotificationPrefs) => {
    setPrefs(next);
    saveNotificationPrefs(next);
    toast.success("Preferences saved on this device");
  };

  return (
    <PortalAtmosphere>
      <div className="mx-auto w-full max-w-3xl space-y-10 px-5 py-6 sm:px-8 sm:py-8 animate-fade-in">
        <PortalPageHeader
          eyebrow="Settings"
          title="Workspace preferences"
          description="Appearance, security, and how this portal behaves on your device."
        />

        <section>
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
        </section>

        <section id="security" className="scroll-mt-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
            Security
          </p>
          {user?.mustChangePassword && (
            <p className="mt-2 rounded-xl border border-amber-200/80 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-950">
              Your account requires a password update before you continue using a temporary
              credential.
            </p>
          )}
          <p className="mt-2 text-sm text-ink/50">
            Change the password for <span className="font-semibold text-ink">{user?.email}</span>.
            Minimum 8 characters.
          </p>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold text-ink/55">
                Current password
              </span>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-field px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold text-ink/55">
                New password
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-field px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold text-ink/55">
                Confirm new password
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-field px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
            </label>
            <Button
              variant="cta"
              loading={savingPw}
              disabled={
                !currentPassword ||
                newPassword.length < 8 ||
                newPassword !== confirmPassword
              }
              onClick={async () => {
                if (newPassword !== confirmPassword) {
                  toast.error("New passwords do not match");
                  return;
                }
                setSavingPw(true);
                try {
                  await changePortalPassword(currentPassword, newPassword);
                  clearMustChangePassword();
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  toast.success("Password updated");
                } catch (err: unknown) {
                  const e = err as {
                    response?: { data?: { message?: string } };
                    message?: string;
                  };
                  toast.error(
                    e.response?.data?.message || e.message || "Could not change password"
                  );
                } finally {
                  setSavingPw(false);
                }
              }}
            >
              Update password
            </Button>
          </div>
        </section>

        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
            Notifications
          </p>
          <p className="mt-1 text-xs text-ink/45">
            Saved on this device until firm-wide email preferences are available.
          </p>
          <div className="mt-2 divide-y divide-border/50 border-y border-border/50">
            <ToggleRow
              label="Proposal alerts"
              description="Remind me when a new fee proposal or counter arrives."
              checked={prefs.proposalAlerts}
              onChange={(v) => persistPrefs({ ...prefs, proposalAlerts: v })}
            />
            <ToggleRow
              label="Weekly digest"
              description="A short summary of open proposals once a week."
              checked={prefs.weeklyDigest}
              onChange={(v) => persistPrefs({ ...prefs, weeklyDigest: v })}
            />
            <ToggleRow
              label="Coach tips"
              description="Occasional Rate Coach suggestions on open proposals."
              checked={prefs.coachTips}
              onChange={(v) => persistPrefs({ ...prefs, coachTips: v })}
            />
          </div>
        </section>

        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
            Session
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-y border-border/50 py-4">
            <div>
              <p className="text-sm font-semibold text-ink">Sign out of this workspace</p>
              <p className="mt-0.5 text-xs text-ink/45">
                Ends your session on this browser.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={async () => {
                await logout();
                router.push("/auth");
              }}
            >
              Sign out
            </Button>
          </div>
        </section>
      </div>
    </PortalAtmosphere>
  );
}
