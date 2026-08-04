import React from "react";

export type SecurityBadgeId =
  | "soc-2"
  | "ccpa"
  | "iso-27001"
  | "gdpr"
  | "iso-27701"
  | "iso-42001";

type SecurityBadgeProps = {
  id: SecurityBadgeId | string;
  title: string;
  className?: string;
};

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <circle cx="60" cy="60" r="56" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle
        cx="60"
        cy="60"
        r="48"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.3"
        fill="none"
      />
      {children}
    </>
  );
}

function BadgeSvg({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className ?? "h-full w-full text-[#0a0a0a]"}
    >
      <title>{title}</title>
      {children}
    </svg>
  );
}

/** Inline cert badges - no network fetch, paint with first HTML. */
export function SecurityBadge({ id, title, className }: SecurityBadgeProps) {
  switch (id) {
    case "soc-2":
      return (
        <BadgeSvg title={title} className={className}>
          <Frame>
            <path
              d="M60 18 L78 28 L78 50 C78 68 70 80 60 88 C50 80 42 68 42 50 L42 28 Z"
              stroke="currentColor"
              strokeWidth="1.6"
              fill="none"
            />
            <text
              x="60"
              y="48"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="12"
              fontWeight="700"
              fill="currentColor"
              letterSpacing="0.06em"
            >
              SOC 2
            </text>
            <text
              x="60"
              y="64"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="9"
              fontWeight="600"
              fill="currentColor"
              fillOpacity="0.65"
              letterSpacing="0.16em"
            >
              TYPE II
            </text>
          </Frame>
        </BadgeSvg>
      );
    case "ccpa":
      return (
        <BadgeSvg title={title} className={className}>
          <Frame>
            <text
              x="60"
              y="48"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="9"
              fontWeight="600"
              fill="currentColor"
              fillOpacity="0.55"
              letterSpacing="0.16em"
            >
              CA
            </text>
            <text
              x="60"
              y="70"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="16"
              fontWeight="700"
              fill="currentColor"
              letterSpacing="0.08em"
            >
              CCPA
            </text>
            <text
              x="60"
              y="88"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="7.5"
              fontWeight="600"
              fill="currentColor"
              fillOpacity="0.5"
              letterSpacing="0.1em"
            >
              READY
            </text>
          </Frame>
        </BadgeSvg>
      );
    case "gdpr":
      return (
        <BadgeSvg title={title} className={className}>
          <Frame>
            <text
              x="60"
              y="48"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="9"
              fontWeight="600"
              fill="currentColor"
              fillOpacity="0.55"
              letterSpacing="0.16em"
            >
              EU
            </text>
            <text
              x="60"
              y="70"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="16"
              fontWeight="700"
              fill="currentColor"
              letterSpacing="0.08em"
            >
              GDPR
            </text>
            <text
              x="60"
              y="88"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="7.5"
              fontWeight="600"
              fill="currentColor"
              fillOpacity="0.5"
              letterSpacing="0.1em"
            >
              READY
            </text>
          </Frame>
        </BadgeSvg>
      );
    case "iso-27001":
      return (
        <BadgeSvg title={title} className={className}>
          <Frame>
            <text
              x="60"
              y="44"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="9"
              fontWeight="600"
              fill="currentColor"
              fillOpacity="0.55"
              letterSpacing="0.18em"
            >
              ISO
            </text>
            <text
              x="60"
              y="64"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="18"
              fontWeight="700"
              fill="currentColor"
              letterSpacing="0.02em"
            >
              27001
            </text>
            <text
              x="60"
              y="82"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="8"
              fontWeight="600"
              fill="currentColor"
              fillOpacity="0.5"
              letterSpacing="0.14em"
            >
              CERTIFIED
            </text>
          </Frame>
        </BadgeSvg>
      );
    case "iso-27701":
      return (
        <BadgeSvg title={title} className={className}>
          <Frame>
            <text
              x="60"
              y="44"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="9"
              fontWeight="600"
              fill="currentColor"
              fillOpacity="0.55"
              letterSpacing="0.18em"
            >
              ISO
            </text>
            <text
              x="60"
              y="64"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="18"
              fontWeight="700"
              fill="currentColor"
              letterSpacing="0.02em"
            >
              27701
            </text>
            <text
              x="60"
              y="82"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="8"
              fontWeight="600"
              fill="currentColor"
              fillOpacity="0.5"
              letterSpacing="0.14em"
            >
              PRIVACY
            </text>
          </Frame>
        </BadgeSvg>
      );
    case "iso-42001":
      return (
        <BadgeSvg title={title} className={className}>
          <Frame>
            <text
              x="60"
              y="44"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="9"
              fontWeight="600"
              fill="currentColor"
              fillOpacity="0.55"
              letterSpacing="0.18em"
            >
              ISO
            </text>
            <text
              x="60"
              y="64"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="18"
              fontWeight="700"
              fill="currentColor"
              letterSpacing="0.02em"
            >
              42001
            </text>
            <text
              x="60"
              y="82"
              textAnchor="middle"
              fontFamily="system-ui,Segoe UI,sans-serif"
              fontSize="8"
              fontWeight="600"
              fill="currentColor"
              fillOpacity="0.5"
              letterSpacing="0.18em"
            >
              AI
            </text>
          </Frame>
        </BadgeSvg>
      );
    default:
      return null;
  }
}
