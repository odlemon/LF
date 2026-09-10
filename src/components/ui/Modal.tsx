import React, { useEffect } from "react";
import { HiX } from "react-icons/hi";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
};

export function Modal({ isOpen, onClose, title, children, size = "lg" }: ModalProps) {
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

  const widthClass = sizeClasses[size] || sizeClasses.lg;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop click dismisser */}
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className={`bg-surface rounded-2xl ${widthClass} w-full shadow-2xl relative animate-fade-in-up border border-border/40 z-50 overflow-hidden flex flex-col max-h-[85vh]`}>
        <div className="p-5 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="text-base font-bold text-ink leading-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-ink/60 hover:text-ink/70 rounded-lg hover:bg-field transition-colors cursor-pointer"
          >
            <HiX className="w-4.5 h-4.5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto rates-scrollable flex-1 text-sm text-ink/90 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
