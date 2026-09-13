import React from "react";
import Link from "next/link";
import { HiOutlineArrowRight } from "react-icons/hi";
import { PricingRequest } from "../types";
import { IntakeStatusBadge } from "./IntakeStatusBadge";
import { formatRelativeTime } from "@/lib/utils/format";

interface PricingRequestCardProps {
  request: PricingRequest;
  clientName?: string;
}

export function PricingRequestCard({ request, clientName }: PricingRequestCardProps) {
  const displayClient = clientName ?? request.clientName ?? "Unassigned client";
  const practiceArea = request.practiceAreaName;
  const href =
    request.status === "SCOPE_CONFIRMED"
      ? `/pricing-requests/${request.uid}/pricing`
      : `/pricing-requests/${request.uid}`;
  const initial = displayClient.trim().charAt(0).toUpperCase() || "?";

  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold leading-snug tracking-tight text-ink line-clamp-2 transition-colors group-hover:text-primary">
          {request.matterTitle}
        </h3>
        <IntakeStatusBadge status={request.status} className="shrink-0" />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{displayClient}</p>
          {practiceArea && <p className="truncate text-xs text-ink/60">{practiceArea}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3 text-xs font-medium text-ink/60">
        <span>{formatRelativeTime(request.createdAt)}</span>
        {request.status === "SCOPE_CONFIRMED" && (
          <span className="inline-flex items-center gap-1 font-semibold text-ink transition-all group-hover:gap-1.5">
            Continue to pricing
            <HiOutlineArrowRight className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </Link>
  );
}
