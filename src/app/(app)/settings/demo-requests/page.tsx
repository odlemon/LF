"use client";

import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineMail, HiOutlinePhone, HiRefresh } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { Textarea } from "@/components/ui/Input";
import {
  demoRequestAdminApi,
  type DemoRequestRecord,
} from "@/lib/api/modules/demoRequest.api";
import { formatDate } from "@/lib/utils/format";

type Tab = "all" | "NEW" | "CONTACTED" | "SCHEDULED" | "CLOSED_WON" | "CLOSED_LOST";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "NEW", label: "New" },
  { id: "CONTACTED", label: "Contacted" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "CLOSED_WON", label: "Won" },
  { id: "CLOSED_LOST", label: "Lost" },
];

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "SCHEDULED", label: "Demo scheduled" },
  { value: "CLOSED_WON", label: "Closed - won" },
  { value: "CLOSED_LOST", label: "Closed - lost" },
];

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  NEW: "info",
  CONTACTED: "warning",
  SCHEDULED: "primary",
  CLOSED_WON: "success",
  CLOSED_LOST: "neutral",
};

function statusLabel(status: string) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export default function DemoRequestsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<DemoRequestRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<DemoRequestRecord | null>(null);
  const [draftStatus, setDraftStatus] = useState("NEW");
  const [draftNote, setDraftNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (status: Tab, pageIndex: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await demoRequestAdminApi.list(status, pageIndex);
      setItems(data.content ?? []);
      setTotalPages(data.totalPages ?? 1);
      setTotalElements(data.totalElements ?? 0);
    } catch {
      setError("Could not load demo requests.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(tab, page);
  }, [load, tab, page]);

  const openRequest = (request: DemoRequestRecord) => {
    setSelected(request);
    setDraftStatus(request.status);
    setDraftNote(request.internalNote ?? "");
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await demoRequestAdminApi.update(selected.uid, draftStatus, draftNote);
      toast.success("Demo request updated");
      setSelected(null);
      await load(tab, page);
    } catch {
      toast.error("Could not update the demo request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Demo requests</h1>
          <p className="text-sm text-ink/55 mt-1">
            Enquiries from the marketing site.{" "}
            {tab === "all"
              ? `${totalElements} in total.`
              : `${totalElements} at this stage.`}
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load(tab, page)}>
          <HiRefresh className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Tabs
        tabs={TABS}
        activeId={tab}
        onChange={(id) => {
          setTab(id);
          setPage(0);
        }}
      />

      {error && <Alert variant="error" message={error} />}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl border border-border bg-surface animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No demo requests here yet"
          description={
            tab === "all"
              ? "When someone books a demo from the site, it lands here."
              : "Nothing at this stage right now."
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((request) => (
            <button
              key={request.uid}
              type="button"
              onClick={() => openRequest(request)}
              className="text-left bg-surface border border-border/70 rounded-2xl p-5 transition-all hover:border-ink/30 hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={STATUS_VARIANT[request.status] ?? "neutral"}>
                  {statusLabel(request.status)}
                </Badge>
                <span className="text-sm font-bold text-ink">{request.firmName}</span>
                {request.firmSize && (
                  <span className="text-[11px] font-semibold text-ink/45">
                    · {request.firmSize}
                  </span>
                )}
                <span className="ml-auto text-[11px] text-ink/40">
                  {formatDate(request.createdAt)}
                </span>
              </div>

              <p className="mt-2 text-sm text-ink/75">
                {request.fullName}
                {request.roleTitle ? (
                  <span className="text-ink/50"> · {request.roleTitle}</span>
                ) : null}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink/55">
                <span className="inline-flex items-center gap-1.5">
                  <HiOutlineMail className="w-3.5 h-3.5" />
                  {request.workEmail}
                </span>
                {request.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <HiOutlinePhone className="w-3.5 h-3.5" />
                    {request.phone}
                  </span>
                )}
                {request.source && (
                  <span className="text-ink/35">from {request.source}</span>
                )}
              </div>

              {request.message && (
                <p className="mt-2.5 text-sm text-ink/60 leading-relaxed line-clamp-2">
                  {request.message}
                </p>
              )}
            </button>
          ))}

          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      )}

      <Drawer
        isOpen={selected != null}
        onClose={() => setSelected(null)}
        title={selected ? selected.firmName : "Demo request"}
        size="lg"
      >
        {selected && (
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={STATUS_VARIANT[selected.status] ?? "neutral"}>
                  {statusLabel(selected.status)}
                </Badge>
                {!selected.notified && (
                  <Badge variant="warning">Sales email not sent</Badge>
                )}
                <span className="ml-auto text-[11px] text-ink/40">
                  {formatDate(selected.createdAt)}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {[
                  ["Name", selected.fullName],
                  ["Work email", selected.workEmail],
                  ["Firm", selected.firmName],
                  ["Role", selected.roleTitle],
                  ["Firm size", selected.firmSize],
                  ["Country", selected.country],
                  ["Phone", selected.phone],
                  ["Came from", selected.source],
                ]
                  .filter(([, value]) => Boolean(value))
                  .map(([label, value]) => (
                    <div key={label as string}>
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-ink/40">
                        {label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-ink/85 break-words">
                        {value}
                      </dd>
                    </div>
                  ))}
              </dl>

              {selected.message && (
                <div className="mt-5 pt-4 border-t border-border">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">
                    What they asked for
                  </p>
                  <p className="mt-1.5 text-sm text-ink/75 leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-border">
                <a
                  href={`mailto:${selected.workEmail}?subject=${encodeURIComponent(
                    "Your Lysp demo"
                  )}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-ink hover:underline"
                >
                  <HiOutlineMail className="w-4 h-4" />
                  Reply to {selected.fullName}
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Select
                label="Status"
                options={STATUS_OPTIONS}
                value={draftStatus}
                onChange={setDraftStatus}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-ink/40 uppercase tracking-wider pl-1">
                  Internal note
                </label>
                <Textarea
                  rows={4}
                  value={draftNote}
                  onChange={(e) => setDraftNote(e.target.value)}
                  placeholder="e.g. left a voicemail, following up Thursday"
                  maxLength={4000}
                />
              </div>

              {selected.handledBy && (
                <p className="text-[11px] text-ink/40">
                  Last updated by {selected.handledBy}
                </p>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setSelected(null)} disabled={saving}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={save} loading={saving}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
