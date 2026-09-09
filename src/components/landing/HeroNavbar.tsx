"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { HiChevronDown, HiMenu, HiX } from "react-icons/hi";
import { useBookDemo } from "@/components/landing/BookDemoModal";

type HeroNavbarProps = {
  variant?: "default" | "overMedia";
};

type NavItem = {
  label: string;
  href?: string;
  children?: { label: string; description: string; href: string }[];
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Product",
    children: [
      {
        label: "Overview",
        description: "How firms use Lysp end to end",
        href: "/#platform",
      },
      {
        label: "Pricing",
        description: "From RFP to a fee your firm will stand behind",
        href: "/product#flow",
      },
      {
        label: "Rate Negotiation",
        description: "Client portal counters and acceptances",
        href: "/product#negotiation",
      },
      {
        label: "Volume Discounts",
        description: "Automatic tier tracking and savings",
        href: "/product#discounts",
      },
      {
        label: "Pricing Analytics",
        description: "Win rates, margins, and benchmarks",
        href: "/product#analytics",
      },
    ],
  },
  { label: "Security", href: "/security" },
  {
    label: "Resources",
    children: [
      {
        label: "Blog",
        description: "Notes on pricing intelligence for elite firms",
        href: "/blog",
      },
      {
        label: "ROI Calculator",
        description: "Model leakage, realization, and Lysp ROI",
        href: "/roi-calculator",
      },
      {
        label: "Privacy Policy",
        description: "How we handle personal information",
        href: "/privacy",
      },
    ],
  },
  {
    label: "Company",
    children: [
      {
        label: "About",
        description: "Mission and what we are building",
        href: "/about",
      },
      {
        label: "Contact",
        description: "Sales, support, and general inquiries",
        href: "/contact",
      },
      {
        label: "Pricing",
        description: "Custom, usage-based - estimate your spend",
        href: "/#pricing",
      },
    ],
  },
];

export function HeroNavbar({ variant = "default" }: HeroNavbarProps) {
  const { openBookDemo } = useBookDemo();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDesktop, setOpenDesktop] = useState<string | null>(null);
  const [openMobile, setOpenMobile] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const overMedia = variant === "overMedia";
  const onDark = overMedia && !isScrolled;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDesktop(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300 ${
        onDark
          ? "bg-transparent text-[#fefefc] before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-gradient-to-b before:from-black/40 before:to-transparent before:pointer-events-none"
          : "bg-[#fefefc]/95 text-[#0a0a0a] backdrop-blur-md border-b border-black/5"
      }`}
    >
      <div className="mx-auto flex h-14 sm:h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        {/* Brand */}
        <Link
          href="/"
          className="relative z-10 flex shrink-0 items-center gap-2"
          onClick={() => setIsMenuOpen(false)}
        >
          <span className="text-[17px] sm:text-lg font-semibold tracking-tight">Lysp</span>
        </Link>

        {/* Center nav - Legora pattern */}
        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            const isOpen = openDesktop === item.label;

            if (!hasChildren) {
              return (
                <Link
                  key={item.label}
                  href={item.href ?? "#"}
                  className={`rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                    onDark ? "text-white/85 hover:text-white" : "text-[#0a0a0a]/80 hover:text-[#0a0a0a]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setOpenDesktop(item.label)}
                onMouseLeave={() => setOpenDesktop(null)}
              >
                <button
                  type="button"
                  className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                    onDark ? "text-white/85 hover:text-white" : "text-[#0a0a0a]/80 hover:text-[#0a0a0a]"
                  }`}
                  aria-expanded={isOpen}
                  onClick={() => setOpenDesktop(isOpen ? null : item.label)}
                >
                  {item.label}
                  <HiChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <div
                  className={`absolute left-1/2 top-full z-50 w-[340px] -translate-x-1/2 pt-3 transition-all duration-200 ${
                    isOpen
                      ? "pointer-events-auto opacity-100 translate-y-0"
                      : "pointer-events-none opacity-0 -translate-y-1"
                  }`}
                >
                  <div className="overflow-hidden rounded-xl border border-black/8 bg-[#fefefc] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.45)]">
                    <ul className="py-2">
                      {item.children!.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            onClick={() => setOpenDesktop(null)}
                            className="block px-4 py-3 hover:bg-[#ebf5ed] transition-colors"
                          >
                            <span className="block text-[13px] font-semibold text-[#0a0a0a]">
                              {child.label}
                            </span>
                            <span className="mt-0.5 block text-[12px] leading-snug text-[#6b6b6b]">
                              {child.description}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Right CTAs */}
        <div className="relative z-10 flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className={`hidden sm:inline-flex text-[13px] font-medium transition-colors ${
              onDark ? "text-white/85 hover:text-white" : "text-[#0a0a0a]/80 hover:text-[#0a0a0a]"
            }`}
          >
            Log in
          </Link>

          <button
            type="button"
            onClick={() => openBookDemo("navbar")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 sm:px-5 py-2 text-[13px] font-semibold transition-colors cursor-pointer ${
              onDark
                ? "bg-[#fefefc] text-[#0a0a0a] hover:bg-white"
                : "bg-[#0a0a0a] text-[#fefefc] hover:bg-black"
            }`}
          >
            Book a demo
          </button>

          <button
            type="button"
            className={`lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
              onDark ? "text-white hover:bg-white/10" : "text-[#0a0a0a] hover:bg-black/5"
            }`}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            {isMenuOpen ? <HiX className="h-5 w-5" /> : <HiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile full-screen menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 sm:top-16 z-40 bg-[#fefefc] overflow-y-auto">
          <div className="px-4 sm:px-6 py-4 flex flex-col gap-1 pb-28">
            {NAV_ITEMS.map((item) => {
              const hasChildren = Boolean(item.children?.length);
              const isOpen = openMobile === item.label;

              if (!hasChildren) {
                return (
                  <Link
                    key={item.label}
                    href={item.href ?? "#"}
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-lg px-3 py-3.5 text-[15px] font-medium text-[#0a0a0a]"
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div key={item.label} className="border-b border-black/5 last:border-0">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg px-3 py-3.5 text-[15px] font-medium text-[#0a0a0a]"
                    onClick={() => setOpenMobile(isOpen ? null : item.label)}
                  >
                    {item.label}
                    <HiChevronDown
                      className={`h-4 w-4 text-[#6b6b6b] transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <ul className="pb-3 pl-3">
                      {item.children!.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="block rounded-lg px-3 py-2.5"
                          >
                            <span className="block text-[14px] font-semibold text-[#0a0a0a]">
                              {child.label}
                            </span>
                            <span className="block text-[12px] text-[#6b6b6b]">{child.description}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}

            <div className="mt-6 flex flex-col gap-3 px-3">
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="text-center rounded-full border border-black/15 px-5 py-3 text-[14px] font-semibold text-[#0a0a0a]"
              >
                Log in
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openBookDemo("navbar-mobile");
                }}
                className="text-center rounded-full bg-[#0a0a0a] px-5 py-3 text-[14px] font-semibold text-[#fefefc] cursor-pointer"
              >
                Book a demo
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
