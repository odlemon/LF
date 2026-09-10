"use client";

import React from "react";
import Link from "next/link";
import { RecordsBrowser } from "@/modules/data-room/components/RecordsBrowser";
import { HiArrowSmLeft, HiClipboardList } from "react-icons/hi";

export default function StandaloneRecordsPage() {
  return (
    <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-6 text-ink/90">
      {/* Back to overview link */}
      <div>
        <Link
          href="/settings/data-room"
          className="text-xs font-bold text-ink/40 hover:text-primary flex items-center gap-1 w-fit transition-colors py-1.5 -my-1.5 rounded"
        >
          <HiArrowSmLeft className="w-4 h-4" /> Back to Data Room Overview
        </Link>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
          <HiClipboardList className="w-7 h-7 text-primary" /> Pricing Records Explorer
        </h1>
        <p className="text-sm text-ink/55 mt-1">
          Audit and browse through all structured items extracted from files ingested into your firm&apos;s Data Room.
        </p>
      </div>

      {/* Main Records Tabbed Browser Panel */}
      <RecordsBrowser />
    </div>
  );
}
