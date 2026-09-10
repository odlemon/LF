"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineOfficeBuilding, HiOutlineMail, HiOutlineGlobe } from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import { useClientAuth } from "@/hooks/useClientAuth";
import { updatePortalMe } from "@/modules/client-portal/api";
import {
  PortalAtmosphere,
  PortalPageHeader,
} from "@/modules/client-portal/PortalChrome";

export default function ClientAccountPage() {
  const { user, refreshUser } = useClientAuth();
  const [name, setName] = useState(user?.contactName || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.contactName || "");
  }, [user?.contactName]);

  const initials = (user?.contactName || user?.email || "C")
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const dirty = name.trim() !== (user?.contactName || "").trim();

  return (
    <PortalAtmosphere>
      <div className="mx-auto w-full max-w-3xl space-y-8 px-5 py-6 sm:px-8 sm:py-8 animate-fade-in">
        <PortalPageHeader
          eyebrow="Account"
          title="Your profile"
          description="How you appear in this client workspace when negotiating with the firm."
        />

        <section className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-on-primary">
            {initials || "C"}
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              {user?.contactName}
            </h2>
            <p className="mt-0.5 text-sm text-ink/60">{user?.clientName}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink/60">
              {user?.roleLabel || "Client representative"}
            </p>
          </div>
        </section>

        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
            Organisation
          </p>
          <dl className="mt-3 divide-y divide-border/50 border-y border-border/50">
            <div className="flex items-start gap-3 py-3.5">
              <HiOutlineOfficeBuilding className="mt-0.5 h-4 w-4 shrink-0 text-ink/60" />
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                  Company
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">
                  {user?.clientName || "—"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3 py-3.5">
              <HiOutlineMail className="mt-0.5 h-4 w-4 shrink-0 text-ink/60" />
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                  Sign-in email
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">{user?.email}</dd>
              </div>
            </div>
            {user?.country && (
              <div className="flex items-start gap-3 py-3.5">
                <HiOutlineGlobe className="mt-0.5 h-4 w-4 shrink-0 text-ink/60" />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                    Country
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink">{user.country}</dd>
                </div>
              </div>
            )}
          </dl>
        </section>

        <section>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
            Display name
          </p>
          <p className="mt-1 text-sm text-ink/60">
            This is the name shown in the portal. Your email stays as the login identity.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block min-w-0 flex-1">
              <span className="sr-only">Display name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-field px-3.5 text-sm font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-primary/15"
                maxLength={200}
              />
            </label>
            <Button
              variant="cta"
              loading={saving}
              disabled={!dirty || !name.trim()}
              onClick={async () => {
                setSaving(true);
                try {
                  await updatePortalMe(name.trim());
                  await refreshUser();
                  toast.success("Profile updated");
                } catch (err: unknown) {
                  const e = err as {
                    response?: { data?: { message?: string } };
                    message?: string;
                  };
                  toast.error(
                    e.response?.data?.message || e.message || "Could not update profile"
                  );
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save name
            </Button>
          </div>
        </section>

        <section className="border-t border-border/50 pt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/60">
            Session
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink/60">
            You are signed in to a secure Lysp client workspace for{" "}
            <span className="font-semibold text-ink">{user?.clientName}</span>. Only your
            organisation&apos;s proposals and history are visible here — never firm margins or
            internal pricing.
          </p>
        </section>
      </div>
    </PortalAtmosphere>
  );
}
