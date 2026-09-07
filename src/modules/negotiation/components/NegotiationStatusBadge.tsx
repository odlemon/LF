"use client";

import {
  negotiationStatusClass,
  negotiationStatusLabel,
} from "../utils";

export function NegotiationStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-tight ${negotiationStatusClass(
        status
      )}`}
    >
      {negotiationStatusLabel(status)}
    </span>
  );
}
