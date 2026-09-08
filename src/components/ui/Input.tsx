"use client";

import React from "react";

/** Shared pill field styles — matches platform buttons. */
export const fieldClassName =
  "w-full px-5 py-2.5 border border-border rounded-full bg-field text-ink text-sm font-semibold placeholder:text-ink/30 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-surface disabled:opacity-60 disabled:cursor-not-allowed";

export const fieldErrorClassName =
  "w-full px-5 py-2.5 border border-red-300 dark:border-red-800 rounded-full bg-field text-ink text-sm font-semibold placeholder:text-ink/30 outline-none transition-all duration-200 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/40 focus:bg-surface disabled:opacity-60 disabled:cursor-not-allowed";

export const textareaClassName =
  "w-full px-5 py-2.5 border border-border rounded-2xl bg-field text-ink text-sm font-semibold placeholder:text-ink/30 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-surface resize-none disabled:opacity-60 disabled:cursor-not-allowed";

export const textareaErrorClassName =
  "w-full px-5 py-2.5 border border-red-300 dark:border-red-800 rounded-2xl bg-field text-ink text-sm font-semibold placeholder:text-ink/30 outline-none transition-all duration-200 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/40 focus:bg-surface resize-none disabled:opacity-60 disabled:cursor-not-allowed";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ className = "", error = false, ...props }: InputProps) {
  return <input className={`${error ? fieldErrorClassName : fieldClassName} ${className}`} {...props} />;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ className = "", error = false, ...props }: TextareaProps) {
  return (
    <textarea
      className={`${error ? textareaErrorClassName : textareaClassName} ${className}`}
      {...props}
    />
  );
}
