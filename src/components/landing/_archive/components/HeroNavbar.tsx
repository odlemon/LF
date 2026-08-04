"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HiMenu, HiX, HiArrowRight } from "react-icons/hi";

export function HeroNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Workflow", href: "#workflow" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#integrations" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "py-1" : "py-2"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div
          className={`bg-white/95 backdrop-blur-sm border border-gray-200/80 shadow-md md:shadow-lg rounded-xl md:rounded-2xl transition-all duration-300 ${
            isScrolled ? "py-1.5" : "py-2.5"
          }`}
        >
          <div className="px-4 flex items-center justify-between">
            <Link href="#home" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
                L
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">Lysp</span>
            </Link>

            <nav className="hidden lg:flex items-center space-x-7 xl:space-x-9">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 font-semibold hover:text-emerald-600 text-sm uppercase tracking-wide transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/auth"
                className="hidden lg:flex bg-white text-gray-800 px-5 py-2 rounded-lg font-semibold text-sm shadow-sm hover:shadow-md border border-gray-200 items-center gap-2 transition-all"
              >
                Sign In
                <HiArrowRight className="w-4 h-4 text-gray-600" />
              </Link>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden h-10 w-10 rounded-lg border border-gray-200/70 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                {isMenuOpen ? (
                  <HiX className="w-5 h-5 text-gray-600" />
                ) : (
                  <HiMenu className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="lg:hidden border-t border-gray-100 mt-2 py-3 px-4 flex flex-col gap-2 bg-white rounded-b-xl animate-fade-in">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-gray-700 font-medium hover:bg-emerald-50 hover:text-emerald-600 text-sm uppercase tracking-wide transition-all"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/auth"
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 text-emerald-700 px-3 py-2 text-sm font-semibold hover:bg-emerald-100 transition-all"
              >
                Sign In
                <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
