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
  const baseStyles = "transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-60 disabled:cursor-not-allowed";
  let variantStyles = "";

  switch (variant) {
    case "primary":
      variantStyles = "px-4 py-2 text-sm text-white bg-primary hover:bg-primary/90 rounded-full shadow-sm";
      break;
    case "cta":
      variantStyles = "px-5 py-3 text-[15px] text-white bg-primary hover:bg-primary/90 rounded-full shadow-md shadow-primary/30";
      break;
    case "client":
      variantStyles = "w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm rounded-full shadow-sm shadow-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2";
      break;
    case "secondary":
      variantStyles = "px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200/80 rounded-full border border-gray-200/50";
      break;
    case "danger":
      variantStyles = "px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-full border border-red-100";
      break;
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
