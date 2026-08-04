"use client";

import React from "react";
import Link from "next/link";
import { usePermission } from "@/hooks/usePermission";
import { useEntityAuditTrail } from "@/modules/audit-trail/hooks/useAuditTrail";
import { ACTION_SENTENCE_MAP, ACTION_COLOR_MAP } from "@/modules/audit-trail/types";
import { HiOutlineClock, HiChevronRight } from "react-icons/hi";

interface AuditTrailPanelProps {
  entityUid: string;
  title?: string; // default: "Activity History"
  maxRows?: number; // default: 10
}

export function AuditTrailPanel({
  entityUid,
  title = "Activity History",
  maxRows = 10,
}: AuditTrailPanelProps) {
  // 1. Gated: if user lacks AUDIT_READ permission, return null silently
  const hasAccess = usePermission("AUDIT_READ");
  
  // 2. Fetch the entity trail
  const { events, isLoading } = useEntityAuditTrail(entityUid, maxRows + 1);

  if (!hasAccess || !entityUid) return null;

  // Formatting helper for premium relative timestamps
  const getRelativeTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMs < 0) return "Just now"; // Catch local timezone offsets
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;
    
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  // Determine if we exceed maxRows
  const hasMore = events.length > maxRows;
  const displayedEvents = events.slice(0, maxRows);

  return (
    <div className="flex flex-col gap-4 animate-fade-in w-full">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
          <HiOutlineClock className="w-4 h-4 text-gray-500" />
          {title}
        </h3>
      </div>

      {isLoading ? (
        // Inline Loading Spinner
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
        </div>
      ) : events.length === 0 ? (
        // Small muted message if no events exist
        <p className="text-xs text-gray-450 italic leading-relaxed py-2">
          No activity recorded yet.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5 pl-2">
          <div className="relative border-l border-gray-150/80 ml-2.5 pl-6 pb-2 flex flex-col gap-5.5">
            {displayedEvents.map((event) => {
              const sentenceTemplate = ACTION_SENTENCE_MAP[event.actionType];
              const sentence = sentenceTemplate
                ? sentenceTemplate(event.resourceName)
                : `interacted with this ${event.resourceName || "resource"}`;
              
              const circleBgColor = ACTION_COLOR_MAP[event.actionType] || "bg-gray-400";

              return (
                <div key={event.id} className="relative text-xs leading-normal">
                  {/* Timeline Circle Bullet */}
                  <span className={`absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${circleBgColor}`} />
                  
                  <div className="text-gray-600">
                    <strong className="font-bold text-gray-900 pr-1 hover:text-primary transition-colors">
                      {event.actorName}
                    </strong>
                    {sentence}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {getRelativeTime(event.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Deep link if more records exist */}
          {hasMore && (
            <Link
              href={`/audit-trail?entityUid=${encodeURIComponent(entityUid)}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover hover:underline self-start transition-all"
            >
              <span>View all activity history</span>
              <HiChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
