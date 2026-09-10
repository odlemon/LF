"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { HiChevronDown, HiCheck, HiSearch } from "react-icons/hi";
import { ClientProfile } from "@/modules/firm/types";

function formatClientSubtitle(client: ClientProfile): string {
  const type = client.type.replace(/_/g, " ");
  return `${type} · ${client.tier} · ${client.country}`;
}

interface ClientSearchSelectProps {
  clients: ClientProfile[];
  value: string;
  onChange: (uid: string) => void;
  isLoading?: boolean;
  error?: string;
  disabled?: boolean;
}

export function ClientSearchSelect({
  clients,
  value,
  onChange,
  isLoading = false,
  error,
  disabled = false,
}: ClientSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.contactEmail.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const selected = clients.find((c) => c.uid === value);

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={dropdownRef}>
      <label className="text-xs font-semibold text-ink/80 uppercase tracking-wider">
        Client <span className="text-red-600 dark:text-red-400">*</span>
      </label>
      <button
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-5 py-2.5 bg-surface border ${
          error ? "border-red-300" : "border-border"
        } rounded-full text-sm font-semibold text-ink/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 text-left`}
      >
        <span className={`min-w-0 truncate ${selected ? "text-ink/90" : "text-ink/40"}`}>
          {isLoading ? "Loading clients..." : selected ? selected.name : "Select client"}
        </span>
        <HiChevronDown
          className={`w-4 h-4 text-ink/40 transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-surface border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in-up">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <HiSearch className="absolute left-3 top-2.5 w-4 h-4 text-ink/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search clients"
        placeholder="Search clients..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-border rounded-full bg-field focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-surface"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto rates-scrollable py-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-ink/40 text-center">No clients found</p>
            ) : (
              filtered.map((client) => {
                const isSelected = client.uid === value;
                return (
                  <button
                    key={client.uid}
                    type="button"
                    onClick={() => {
                      onChange(client.uid);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={`w-full flex items-start justify-between gap-2 px-4 py-2.5 text-left ${
                      isSelected ? "bg-primary/5 text-primary" : "text-ink/80 hover:bg-field"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-bold truncate">{client.name}</span>
                      <span
                        className={`text-[10px] font-medium truncate ${
                          isSelected ? "text-primary/70" : "text-ink/40"
                        }`}
                      >
                        {formatClientSubtitle(client)}
                      </span>
                    </div>
                    {isSelected && <HiCheck className="w-4 h-4 shrink-0 mt-0.5" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
      {error && <span className="text-[10px] font-bold text-red-500 pl-1">{error}</span>}
    </div>
  );
}
