import React from "react";

/** Shared marketing shell - investor-facing pages & sections. */
export const MARKETING_SHELL =
  "relative mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-10";

export const BRAND_LINE =
  "text-[13px] font-semibold tracking-[0.08em]";

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
  /** Optional topic label under brand (e.g. Firm outcomes). */
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Show Lysp brand line. Default true. */
  brand?: boolean;
  tone?: Tone;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

/**
 * Uniform left-aligned section opener for landing + detail pages.
 * Brand → hairline → optional eyebrow → title → description.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  brand = true,
  tone = "light",
  className = "",
  titleClassName = "",
  descriptionClassName = "",
}: SectionHeaderProps) {
  const isDark = tone === "dark";
  const brandColor = isDark ? "text-white/90" : "text-[#0a0a0a]";
  const lineColor = isDark ? "bg-white/25" : "bg-[#0a0a0a]/25";
  const eyeColor = isDark ? "text-white/40" : "text-[#0a0a0a]/40";
  const titleColor = isDark ? "text-[#fefefc]" : "text-[#0a0a0a]";
  const bodyColor = isDark ? "text-white/50" : "text-[#0a0a0a]/55";

  return (
    <div className={`max-w-3xl text-left ${className}`}>
      {brand ? (
        <div className="flex items-center gap-3">
          <span className={`${BRAND_LINE} ${brandColor}`}>Lysp</span>
          <span className={`h-px w-10 ${lineColor}`} />
          {eyebrow ? (
            <p className={`${SECTION_EYEBROW} ${eyeColor}`}>{eyebrow}</p>
          ) : null}
        </div>
      ) : eyebrow ? (
        <div className="flex items-center gap-3">
          <span className={`h-px w-10 ${lineColor}`} />
          <p className={`${SECTION_EYEBROW} ${eyeColor}`}>{eyebrow}</p>
        </div>
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
  const brandColor = isDark ? "text-white/90" : "text-[#0a0a0a]";
  const lineColor = isDark ? "bg-white/25" : "bg-[#0a0a0a]/25";
  const eyeColor = isDark ? "text-white/40" : "text-[#0a0a0a]/40";
  const titleColor = isDark ? "text-[#fefefc]" : "text-[#0a0a0a]";
  const bodyColor = isDark ? "text-white/50" : "text-[#0a0a0a]/55";

  return (
    <div className={`text-left ${className}`}>
      <div className="flex items-center gap-3">
        <span className={`${BRAND_LINE} ${brandColor}`}>Lysp</span>
        <span className={`h-px w-10 ${lineColor}`} />
        {eyebrow ? <p className={`${SECTION_EYEBROW} ${eyeColor}`}>{eyebrow}</p> : null}
      </div>
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
