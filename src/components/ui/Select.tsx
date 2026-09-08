"use client";

import React, { useState, useRef, useEffect } from "react";
import { HiChevronDown as ChevronDownIcon, HiCheck as CheckIcon } from "react-icons/hi";

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Choose option...",
  label,
  error,
  disabled = false,
  required = false,
  className = "",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-[10px] font-bold text-ink/40 uppercase tracking-wider pl-1 select-none">
          {label} {required && <span className="text-red-600 dark:text-red-400">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-5 py-2.5 bg-surface border ${
          error
            ? "border-red-300 focus:ring-red-100 dark:border-red-800 dark:focus:ring-red-950/40"
            : isOpen
            ? "border-primary focus:ring-primary/20"
            : "border-border hover:border-ink/20"
        } rounded-full text-xs font-bold text-ink/90 transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:bg-field cursor-pointer`}
      >
        <span className={selectedOption ? "text-ink/90" : "text-ink/40 font-semibold"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-ink/40 transition-transform duration-200 shrink-0 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {/* Options Dropdown list */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden max-h-56 overflow-y-auto rates-scrollable animate-fade-in-up">
          <div className="py-1">
            {options.length === 0 ? (
              <div className="px-5 py-3 text-xs font-semibold text-ink/40 text-center">
                No options available
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-5 py-2.5 text-left text-xs font-bold transition-colors ${
                      isSelected
                        ? "bg-primary/5 text-primary"
                        : "text-ink/80 hover:bg-field hover:text-ink"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span>{opt.label}</span>
                      {opt.description && (
                        <span className="text-[10px] text-ink/40 font-medium">
                          {opt.description}
                        </span>
                      )}
                    </div>
                    {isSelected && <CheckIcon className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 pl-1">
          {error}
        </span>
      )}
    </div>
  );
}
