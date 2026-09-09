"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { HiArrowRight, HiCheckCircle, HiX } from "react-icons/hi";
import { demoRequestApi } from "@/lib/api/modules/demoRequest.api";
import { Select } from "@/components/ui/Select";

// Lysp sells to firms with a real pricing function, which starts around a hundred fee earners.
// Offering smaller bands invited enquiries that were never going to be a fit and made the form
// look like it was written for a different company.
const FIRM_SIZES = [
  "101-500 fee earners",
  "501-1000 fee earners",
  "1000-2500 fee earners",
  "2500+ fee earners",
];

const ROLES = [
  "Managing Partner",
  "Partner",
  "Pricing Director / Pricing Manager",
  "Finance Director / CFO",
  "Business Development",
  "Operations / COO",
  "Other",
];

const FIELD =
  "w-full rounded-xl border border-black/10 bg-white px-4 py-2.5 text-[15px] text-[#0a0a0a] placeholder-[#0a0a0a]/35 outline-none transition-colors focus:border-[#0a0a0a]/40 disabled:opacity-60";
const LABEL = "block text-[12px] font-semibold tracking-wide text-[#0a0a0a]/55 mb-1.5";

interface BookDemoContextValue {
  openBookDemo: (source?: string) => void;
}

const BookDemoContext = createContext<BookDemoContextValue>({ openBookDemo: () => {} });

/** Lets any CTA anywhere on the marketing site open the demo form. */
export function useBookDemo() {
  return useContext(BookDemoContext);
}

export function BookDemoProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<string | undefined>(undefined);

  const openBookDemo = useCallback((from?: string) => {
    setSource(from);
    setIsOpen(true);
  }, []);

  const value = useMemo(() => ({ openBookDemo }), [openBookDemo]);

  return (
    <BookDemoContext.Provider value={value}>
      {children}
      <BookDemoModal isOpen={isOpen} onClose={() => setIsOpen(false)} source={source} />
    </BookDemoContext.Provider>
  );
}

function BookDemoModal({
  isOpen,
  onClose,
  source,
}: {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}) {
  const [fullName, setFullName] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [firmName, setFirmName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [firmSize, setFirmSize] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  // A background that scrolls behind an open dialog is disorienting on a phone, where the
  // dialog fills the screen and the page underneath appears to move on its own.
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

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const ack = await demoRequestApi.submit({
        fullName,
        workEmail,
        firmName,
        roleTitle: roleTitle || undefined,
        firmSize: firmSize || undefined,
        country: country || undefined,
        phone: phone || undefined,
        message: message || undefined,
        source: source || "book-a-demo",
      });
      setReference(ack.reference);
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { message?: string } } })?.response;
      setError(
        response?.data?.message ||
          "We could not send that just now. Please email nyasha@lysp.ai and we will pick it up."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-demo-title"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden />

      <div className="relative z-10 my-auto w-full max-w-2xl rounded-[1.5rem] bg-[#fefefc] p-6 text-[#0a0a0a] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.55)] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-[#0a0a0a]/40 transition-colors hover:bg-black/5 hover:text-[#0a0a0a]"
        >
          <HiX className="h-5 w-5" />
        </button>

        {reference ? (
          <div className="py-4 text-center">
            <HiCheckCircle className="mx-auto h-12 w-12 text-[#0a0a0a]" aria-hidden />
            <h2 id="book-demo-title" className="mt-5 text-2xl font-semibold tracking-tight">
              Thank you — that is with us.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#0a0a0a]/60">
              Someone from Lysp will be in touch at{" "}
              <span className="font-semibold text-[#0a0a0a]">{workEmail}</span> shortly, usually
              within one working day.
            </p>
            <p className="mt-5 text-[12px] text-[#0a0a0a]/40">
              Reference <span className="tabular-nums">{reference}</span>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-7 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#0a0a0a] px-5 py-2.5 text-[14px] font-semibold text-[#fefefc] transition-colors hover:bg-black"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/35">
              Book a demo
            </p>
            <h2
              id="book-demo-title"
              className="mt-2 text-[1.6rem] font-semibold leading-tight tracking-tight sm:text-[1.9rem]"
            >
              See Lysp on your own matters.
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[#0a0a0a]/55">
              Thirty minutes, your rate card, and a matter you priced recently. We will show you
              what Lysp would have proposed, and why.
            </p>

            <form onSubmit={onSubmit} className="mt-6" noValidate>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={LABEL} htmlFor="bd-name">
                    Full name <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="bd-name"
                    className={FIELD}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Fairfax"
                    autoComplete="name"
                    required
                    maxLength={160}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="bd-email">
                    Work email <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="bd-email"
                    type="email"
                    className={FIELD}
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="jane.fairfax@firm.com"
                    autoComplete="email"
                    required
                    maxLength={255}
                    disabled={submitting}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={LABEL} htmlFor="bd-firm">
                    Firm <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="bd-firm"
                    className={FIELD}
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Ashworth Meridian LLP"
                    autoComplete="organization"
                    required
                    maxLength={200}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="bd-role">
                    Your role
                  </label>
                  <Select
                    id="bd-role"
                    variant="marketing"
                    placeholder="Select…"
                    options={ROLES.map((r) => ({ value: r, label: r }))}
                    value={roleTitle}
                    onChange={setRoleTitle}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="bd-size">
                    Firm size
                  </label>
                  <Select
                    id="bd-size"
                    variant="marketing"
                    placeholder="Select…"
                    options={FIRM_SIZES.map((v) => ({ value: v, label: v }))}
                    value={firmSize}
                    onChange={setFirmSize}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="bd-country">
                    Country
                  </label>
                  <input
                    id="bd-country"
                    className={FIELD}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United States"
                    autoComplete="country-name"
                    maxLength={80}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className={LABEL} htmlFor="bd-phone">
                    Phone <span className="font-normal text-[#0a0a0a]/35">(optional)</span>
                  </label>
                  <input
                    id="bd-phone"
                    type="tel"
                    className={FIELD}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 20 7000 0000"
                    autoComplete="tel"
                    maxLength={40}
                    disabled={submitting}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={LABEL} htmlFor="bd-message">
                    What would you like to get out of the session?
                  </label>
                  <textarea
                    id="bd-message"
                    className={`${FIELD} resize-none`}
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. we price fixed-fee M&A work and lose margin to scope creep"
                    maxLength={4000}
                    disabled={submitting}
                  />
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700"
                >
                  {error}
                </p>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[12px] leading-relaxed text-[#0a0a0a]/40">
                  We use these details only to arrange your demo.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#0a0a0a] px-6 py-2.5 text-[15px] font-semibold text-[#fefefc] transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? "Sending…" : "Request a demo"}
                  {!submitting && <HiArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
