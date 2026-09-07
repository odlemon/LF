"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "cta" | "client" | "danger";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "transition-all duration-200 flex items-center justify-center gap-2 font-semibold disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";
  let variantStyles = "";

  switch (variant) {
    case "primary":
      variantStyles =
        "px-4 py-2 text-sm text-on-primary bg-primary hover:bg-primary-hover rounded-full shadow-sm";
      break;
    case "cta":
      variantStyles =
        "px-5 py-3 text-[15px] text-on-primary bg-primary hover:bg-primary-hover rounded-full shadow-[0_14px_40px_-20px_rgba(10,10,10,0.55)]";
      break;
    case "client":
      variantStyles =
        "w-full py-3 px-4 bg-primary hover:bg-primary-hover text-on-primary text-sm rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-surface";
      break;
    case "secondary":
      variantStyles =
        "px-4 py-2 text-sm text-ink bg-field hover:bg-hover rounded-full border border-border";
      break;
    case "danger":
      variantStyles =
        "px-4 py-2 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-full border border-red-100 dark:text-red-300 dark:bg-red-950/40 dark:border-red-900/50 dark:hover:bg-red-950/60";
      break;
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}
