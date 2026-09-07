"use client";

import React from "react";

/** Shared pill field styles — matches platform buttons. */
export const fieldClassName =
  "w-full px-5 py-2.5 border border-border rounded-full bg-field text-ink text-sm font-semibold placeholder:text-ink/30 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-surface disabled:opacity-60 disabled:cursor-not-allowed";

export const textareaClassName =
  "w-full px-5 py-2.5 border border-border rounded-2xl bg-field text-ink text-sm font-semibold placeholder:text-ink/30 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-surface resize-none disabled:opacity-60 disabled:cursor-not-allowed";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return <input className={`${fieldClassName} ${className}`} {...props} />;
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = "", ...props }: TextareaProps) {
  return <textarea className={`${textareaClassName} ${className}`} {...props} />;
}
