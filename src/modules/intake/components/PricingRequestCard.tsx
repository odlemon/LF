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
  const displayClient = clientName ?? request.clientName ?? "—";
  const practiceArea = request.practiceAreaName ?? "—";

  return (
    <Link
      href={`/pricing-requests/${request.uid}`}
      className="block bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-bold text-gray-900 line-clamp-2">{request.matterTitle}</h3>
        <IntakeStatusBadge status={request.status} />
      </div>
      <div className="flex flex-col gap-1 text-sm text-gray-600">
        <span>
          <span className="font-semibold text-gray-500">Client:</span> {displayClient}
        </span>
        <span>
          <span className="font-semibold text-gray-500">Practice area:</span> {practiceArea}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-3 font-medium">
        {formatRelativeTime(request.createdAt)}
      </p>
    </Link>
  );
}
