"use client";

import React from "react";

export function PortalAtmosphere({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-full">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse 75% 45% at 12% -5%, rgba(10,10,10,0.055), transparent 55%), radial-gradient(ellipse 50% 35% at 90% 10%, rgba(10,10,10,0.03), transparent 50%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink/35">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/50">
            {description}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
