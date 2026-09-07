import React from "react";
import Link from "next/link";
import { PricingRequest } from "../types";
import { IntakeStatusBadge } from "./IntakeStatusBadge";
import { formatRelativeTime } from "@/lib/utils/format";

interface PricingRequestCardProps {
  request: PricingRequest;
  clientName?: string;
}

export function PricingRequestCard({ request, clientName }: PricingRequestCardProps) {
  const displayClient = clientName ?? request.clientName ?? "-";
  const practiceArea = request.practiceAreaName ?? "-";
  const href =
    request.status === "SCOPE_CONFIRMED"
      ? `/pricing-requests/${request.uid}/pricing`
      : `/pricing-requests/${request.uid}`;

  return (
    <Link
      href={href}
      className="block bg-surface rounded-2xl border border-border/60 p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-bold text-ink line-clamp-2">{request.matterTitle}</h3>
        <IntakeStatusBadge status={request.status} />
      </div>
      <div className="flex flex-col gap-1 text-sm text-ink/65">
        <span>
          <span className="font-semibold text-ink/55">Client:</span> {displayClient}
        </span>
        <span>
          <span className="font-semibold text-ink/55">Practice area:</span> {practiceArea}
        </span>
      </div>
      <p className="text-xs text-ink/40 mt-3 font-medium">
        {formatRelativeTime(request.createdAt)}
      </p>
      {request.status === "SCOPE_CONFIRMED" && (
        <p className="text-xs font-semibold text-ink/70 mt-3">
          Continue to pricing →
        </p>
      )}
    </Link>
  );
}
