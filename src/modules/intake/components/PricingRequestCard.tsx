import React from "react";
import Link from "next/link";
import { HiOutlineArrowRight, HiOutlineChevronRight } from "react-icons/hi";
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
      className="group flex items-center gap-4 py-4 transition-colors hover:bg-hover/40"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-on-primary">
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-[15px] font-semibold tracking-tight text-ink transition-colors group-hover:text-primary">
            {request.matterTitle}
          </p>
          <IntakeStatusBadge status={request.status} />
        </div>
        <p className="mt-1 truncate text-xs text-ink/60">
          {displayClient}
          {practiceArea ? ` · ${practiceArea}` : ""}
          <span className="mx-1.5 text-ink/20">·</span>
          {formatRelativeTime(request.createdAt)}
        </p>
      </div>

      {request.status === "SCOPE_CONFIRMED" ? (
        <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-ink transition-all group-hover:gap-1.5 sm:inline-flex">
          Continue to pricing
          <HiOutlineArrowRight className="h-3.5 w-3.5" />
        </span>
      ) : (
        <HiOutlineChevronRight className="h-4 w-4 shrink-0 text-ink/30 transition-colors group-hover:text-ink/60" />
      )}
    </Link>
  );
}
