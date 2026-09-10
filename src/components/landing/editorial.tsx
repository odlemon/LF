import React from "react";

/** Shared marketing shell - investor-facing pages & sections. */
export const MARKETING_SHELL =
  "relative mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10";

export const SECTION_EYEBROW =
  "text-[11px] font-semibold tracking-[0.28em] uppercase";

export const PAGE_H1 =
  "text-balance text-[2.5rem] sm:text-5xl lg:text-[3.75rem] font-semibold leading-[1.02] tracking-tight";

export const SECTION_H2 =
  "text-balance text-[1.85rem] sm:text-4xl lg:text-[3rem] font-semibold leading-[1.06] tracking-tight";

export const SECTION_BODY =
  "text-[15px] sm:text-lg leading-relaxed";

type Tone = "light" | "dark";

type SectionHeaderProps = {
  /** Topic label opening the section (e.g. Firm outcomes). */
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: Tone;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

/**
 * Uniform left-aligned section opener for landing + detail pages.
 * Eyebrow → title → description.
 *
 * The eyebrow used to be preceded by "Lysp" and a hairline rule. Set in a line of text, that
 * rule reads as a dash — "Lysp — Chambers of practice" — which is both a tic and a repetition,
 * since every one of these sections is already on Lysp's own site. The label stands alone.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  tone = "light",
  className = "",
  titleClassName = "",
  descriptionClassName = "",
}: SectionHeaderProps) {
  const isDark = tone === "dark";
  const eyeColor = isDark ? "text-white/45" : "text-[#0a0a0a]/60";
  const titleColor = isDark ? "text-[#fefefc]" : "text-[#0a0a0a]";
  const bodyColor = isDark ? "text-white/50" : "text-[#0a0a0a]/60";

  return (
    <div className={`max-w-3xl text-left ${className}`}>
      {eyebrow ? (
        <p className={`${SECTION_EYEBROW} ${eyeColor}`}>{eyebrow}</p>
      ) : null}

      <h2 className={`mt-4 sm:mt-5 ${SECTION_H2} ${titleColor} ${titleClassName}`}>
        {title}
      </h2>

      {description ? (
        <p className={`mt-5 max-w-2xl ${SECTION_BODY} ${bodyColor} ${descriptionClassName}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

type PageHeroHeaderProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  tone?: Tone;
  children?: React.ReactNode;
  className?: string;
};

/** Uniform left-aligned page hero copy (About / Product / Security / etc.). */
export function PageHeroHeader({
  eyebrow,
  title,
  description,
  tone = "light",
  children,
  className = "",
}: PageHeroHeaderProps) {
  const isDark = tone === "dark";
  const eyeColor = isDark ? "text-white/45" : "text-[#0a0a0a]/60";
  const titleColor = isDark ? "text-[#fefefc]" : "text-[#0a0a0a]";
  const bodyColor = isDark ? "text-white/50" : "text-[#0a0a0a]/60";

  return (
    <div className={`text-left ${className}`}>
      {eyebrow ? <p className={`${SECTION_EYEBROW} ${eyeColor}`}>{eyebrow}</p> : null}
      <h1 className={`mt-5 sm:mt-6 max-w-4xl ${PAGE_H1} ${titleColor}`}>{title}</h1>
      {description ? (
        <p className={`mt-5 sm:mt-6 max-w-2xl ${SECTION_BODY} font-medium ${bodyColor}`}>
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
