"use client";

import React, { useState, useEffect, useRef } from "react";
import { HiCheck, HiX } from "react-icons/hi";

interface InlineEditFieldProps {
  value: string;
  onSave: (value: string) => Promise<unknown> | void;
  className?: string;
  inputClassName?: string;
  multiline?: boolean;
  readOnly?: boolean;
}

export function InlineEditField({
  value,
  onSave,
  className = "",
  inputClassName = "",
  multiline = false,
  readOnly = false,
}: InlineEditFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) setDraft(value);
  }, [value, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const cancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  const save = async () => {
    if (draft.trim() === value.trim()) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await onSave(draft.trim());
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      save();
    }
    if (e.key === "Enter" && multiline && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      save();
    }
  };

  if (!isEditing) {
    if (readOnly) {
      return <span className={className}>{value}</span>;
    }

    return (
      <span
        className={`cursor-pointer hover:text-primary transition-colors ${className}`}
        onClick={() => setIsEditing(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setIsEditing(true)}
      >
        {value}
      </span>
    );
  }

  const sharedClass = multiline
    ? `flex-1 px-3 py-1.5 text-sm border border-primary/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 ${inputClassName}`
    : `flex-1 px-3 py-1.5 text-sm border border-primary/40 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 ${inputClassName}`;

  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      {multiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={isSaving}
          className={sharedClass}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className={sharedClass}
        />
      )}
      <button
        type="button"
        onClick={save}
        disabled={isSaving}
        className="p-1 text-ink/70 hover:bg-hover rounded"
      >
        <HiCheck className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={cancel}
        disabled={isSaving}
        className="p-1 text-ink/40 hover:bg-field rounded"
      >
        <HiX className="w-4 h-4" />
      </button>
    </div>
  );
}
