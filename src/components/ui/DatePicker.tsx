"use client";

import React, { useState, useEffect, useRef } from "react";
import { HiCalendar, HiChevronLeft, HiChevronRight } from "react-icons/hi";

export interface DatePickerProps {
  value?: string; // Format: "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date...",
  disabled = false,
  error,
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return new Date();
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // Close calendar on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update currentMonth if value changes from outside
  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        setCurrentMonth(parsed);
      }
    }
  }, [value]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const getDaysGrid = () => {
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay(); // Day of week (0-6)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const grid = [];

    // Prev month padding
    for (let i = startDay - 1; i >= 0; i--) {
      grid.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month padding (pad to fill 42 cells total for grid stability)
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      grid.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return grid;
  };

  const formatSelectedDate = (dateString?: string) => {
    if (!dateString) return placeholder;
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return placeholder;
    
    // Smooth localized or clean ISO formatting
    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSelectDay = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const isSelected = (date: Date) => {
    if (!value) return false;
    const parsed = new Date(value);
    return (
      parsed.getFullYear() === date.getFullYear() &&
      parsed.getMonth() === date.getMonth() &&
      parsed.getDate() === date.getDate()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  };

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-2.5 bg-field border rounded-full text-sm font-semibold text-left flex items-center justify-between text-ink hover:bg-canvas/40 focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none ${
          error
            ? "border-red-300 focus:ring-red-100 dark:border-red-800 dark:focus:ring-red-950/40"
            : "border-border focus:ring-primary/20 focus:border-primary/80"
        }`}
      >
        <span className={value ? "text-ink" : "text-ink/40"}>
          {formatSelectedDate(value)}
        </span>
        <HiCalendar className="w-4 h-4 text-ink/40" />
      </button>
      {error && (
        <span className="mt-1.5 block text-[10px] font-bold text-red-600 dark:text-red-400 pl-1">
          {error}
        </span>
      )}

      {/* Calendar Overlay */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 bg-surface rounded-2xl border border-border shadow-[0_12px_40px_rgba(0,0,0,0.08)] p-4 z-50 transform origin-top animate-fade-in select-none">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-canvas text-ink/65 transition-colors cursor-pointer"
            >
              <HiChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-ink">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-canvas text-ink/65 transition-colors cursor-pointer"
            >
              <HiChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[11px] font-bold text-ink/40 uppercase tracking-wider">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {getDaysGrid().map(({ day, isCurrentMonth, date }, idx) => {
              const selected = isSelected(date);
              const today = isToday(date);

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectDay(date)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ${
                    selected
                      ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/20"
                      : isCurrentMonth
                      ? "text-ink hover:bg-canvas"
                      : "text-ink/25 hover:bg-field"
                  }`}
                >
                  <span>{day}</span>
                  {/* Subtle dot underneath today's date */}
                  {today && (
                    <span
                      className={`absolute bottom-1 w-1 h-1 rounded-full ${
                        selected ? "bg-surface" : "bg-primary"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
