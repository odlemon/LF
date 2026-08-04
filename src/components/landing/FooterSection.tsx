"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Toast } from "./Toast";
import { HiMail, HiPhone, HiShare, HiArrowRight } from "react-icons/hi";

export function FooterSection() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      setToast({ message: "Please enter a valid email address.", type: "error" });
      return;
    }
    setToast({ message: "Thank you for subscribing! We've sent a confirmation to your email.", type: "success" });
    setEmail("");
  };

  const navLinks = [
    { label: "Workflow", href: "#workflow" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#integrations" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer id="contact" className="bg-gradient-to-br from-gray-50 via-white to-gray-50 border-t border-gray-200/50">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-12 sm:gap-16 items-start">
          
          <div className="flex flex-col gap-6 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600">
              Built for pricing and finance teams
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              Run pricing, proposals, and renewals on one workspace
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-lg">
              Lysp helps law firms replace manual, reactive processes with clear, automated control sheets. Keep realization predictable and coordinate seamlessly with your client portals.
            </p>

            <div className="flex flex-col gap-3.5 mt-2">
              <a
                href="Nyasha@lysp.io"
                className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors"
              >
                <HiMail className="w-5 h-5 text-emerald-500 shrink-0" />
                nyasha@lysp.io
              </a>
              <a
                href="tel:+14155550198"
                className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors"
              >
                <HiPhone className="w-5 h-5 text-emerald-500 shrink-0" />
                +1 (415) 555-0198
              </a>
              <a
                href="https://www.linkedin.com/company/lyspio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors"
              >
                <HiShare className="w-5 h-5 text-emerald-500 shrink-0" />
                LinkedIn Company Page
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/40 p-6 flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Stay current</h3>
                <p className="text-[11px] text-gray-500 mt-1 leading-normal font-semibold">
                  Get bi-weekly updates on legal pricing benchmarks and guidelines direct to your inbox.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="rounded-full border border-emerald-200/80 bg-white p-1 flex items-center justify-between shadow-sm">
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-0 ring-0 focus:ring-0 focus:outline-none text-xs text-gray-700 px-3.5 flex-1 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-full p-2 text-xs font-semibold shadow-sm transition-all"
                >
                  <HiArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="rounded-[24px] border border-gray-200/50 bg-white/70 backdrop-blur p-6 flex flex-col gap-4">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Explore</span>
              <nav className="grid grid-cols-2 gap-x-6 gap-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs font-semibold text-gray-600 hover:text-emerald-600 transition-colors uppercase tracking-wider"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-gray-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11px] text-gray-400 font-semibold text-center sm:text-left">
            © {new Date().getFullYear()} Lysp. Pricing intelligence for legal teams.
          </span>
          <div className="flex gap-6 justify-center">
            <Link href="#privacy" className="text-[11px] text-gray-400 hover:text-emerald-600 font-semibold">
              Privacy Policy
            </Link>
            <Link href="#terms" className="text-[11px] text-gray-400 hover:text-emerald-600 font-semibold">
              Terms of Service
            </Link>
            <Link href="#security" className="text-[11px] text-gray-400 hover:text-emerald-600 font-semibold">
              Security Standards
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
