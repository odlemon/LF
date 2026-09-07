"use client";

import React, { useEffect } from "react";
import { HiX } from "react-icons/hi";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-5xl",
  "3xl": "max-w-7xl",
  full: "max-w-full",
};

export function Drawer({ isOpen, onClose, title, children, size = "xl" }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const widthClass = sizeClasses[size] || sizeClasses.xl;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Slide panel */}
      <div
        className={`relative ${widthClass} w-full bg-surface shadow-2xl flex flex-col h-full z-50 transform transition-transform duration-300 ease-out border-l border-border/40 animate-slide-in-right`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0 bg-surface">
          <h2 className="text-base font-extrabold text-ink tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-ink/40 hover:text-gray-655 rounded-xl hover:bg-field transition-all cursor-pointer border border-transparent hover:border-border/50"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto rates-scrollable p-6 bg-field/10">
          {children}
        </div>
      </div>
    </div>
  );
}
