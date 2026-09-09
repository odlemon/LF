"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineLightBulb, HiPlus, HiRefresh } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { usePracticeAreas } from "@/modules/firm/hooks/useFirm";
import {
  matterLearningApi,
  type MatterLearning,
} from "@/lib/api/modules/matterLearning.api";
import { formatDate } from "@/lib/utils/format";

const CLIENT_TYPES = [
  { value: "", label: "Any client type" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "FINANCIAL_INSTITUTION", label: "Financial Institution" },
  { value: "GOVERNMENT", label: "Government" },
  { value: "INDIVIDUAL", label: "Individual" },
];

const FIELD =
  "w-full px-5 py-2.5 bg-surface border border-border rounded-full text-sm text-ink placeholder-ink/35 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

export default function MatterLearningsPage() {
  const { areas: practiceAreas } = usePracticeAreas();
  const [items, setItems] = useState<MatterLearning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<string>("all");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MatterLearning | null>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [practiceArea, setPracticeArea] = useState("");
  const [clientType, setClientType] = useState("");
  const [matterRef, setMatterRef] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await matterLearningApi.list());
    } catch {
      setError("Could not load the firm's learnings.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const tabs = useMemo(() => {
    const used = new Set(items.map((i) => i.practiceAreaCode).filter(Boolean) as string[]);
    return [
      { id: "all", label: "All", count: items.length },
      { id: "firmwide", label: "Firm-wide", count: items.filter((i) => !i.practiceAreaCode).length },
      ...practiceAreas
        .filter((pa) => used.has(pa.code))
        .map((pa) => ({
          id: pa.code,
          label: pa.name,
          count: items.filter((i) => i.practiceAreaCode === pa.code).length,
        })),
    ];
  }, [items, practiceAreas]);

  const visible = useMemo(() => {
    if (tab === "all") return items;
    if (tab === "firmwide") return items.filter((i) => !i.practiceAreaCode);
    return items.filter((i) => i.practiceAreaCode === tab);
  }, [items, tab]);

  const startNew = () => {
    setEditing(null);
    setTitle("");
    setText("");
    setPracticeArea("");
    setClientType("");
    setMatterRef("");
    setOpen(true);
  };

  const startEdit = (l: MatterLearning) => {
    setEditing(l);
    setTitle(l.title ?? "");
    setText(l.learningText ?? "");
    setPracticeArea(l.practiceAreaCode ?? "");
    setClientType(l.clientType ?? "");
    setMatterRef(l.matterReference ?? "");
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        title,
        learningText: text,
        practiceAreaCode: practiceArea || undefined,
        clientType: clientType || undefined,
        matterReference: matterRef || undefined,
      };
      if (editing) {
        await matterLearningApi.update(editing.uid, payload);
        toast.success("Learning updated");
      } else {
        await matterLearningApi.create(payload);
        toast.success("Learning recorded — the pricing agent will use it from now on");
      }
      setOpen(false);
      await load();
    } catch {
      toast.error("Could not save that learning");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await matterLearningApi.remove(editing.uid);
      toast.success("Learning removed");
      setOpen(false);
      await load();
    } catch {
      toast.error("Could not remove that learning");
    } finally {
      setSaving(false);
    }
  };

  const areaName = (code?: string | null) =>
    practiceAreas.find((p) => p.code === code)?.name ?? code;

  return (
    <div className="p-4 sm:p-8 max-w-5xl w-full mx-auto flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-ink tracking-tight">Matter learnings</h1>
          <p className="text-sm text-ink/55 mt-1 max-w-2xl leading-relaxed">
            What the firm has worked out about pricing its own work. Everything here is read by
            the pricing agent when it scopes a comparable matter, so a lesson recorded once stops
            being relearned deal by deal.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="secondary" onClick={() => void load()}>
            <HiRefresh className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="primary" onClick={startNew}>
            <HiPlus className="w-4 h-4" />
            Record a learning
          </Button>
        </div>
      </div>

      {tabs.length > 2 && <Tabs tabs={tabs} activeId={tab} onChange={setTab} />}

      {error && <Alert variant="error" message={error} />}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl border border-border bg-surface animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title="Nothing recorded yet"
          description="When a matter teaches the firm something about how to price that kind of work, record it here and every future scope will take it into account."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((l) => (
            <button
              key={l.uid}
              type="button"
              onClick={() => startEdit(l)}
              className="text-left bg-surface border border-border/70 rounded-2xl p-5 transition-all hover:border-ink/30 hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <HiOutlineLightBulb className="w-4 h-4 text-ink/35 shrink-0" />
                <span className="text-sm font-bold text-ink">{l.title}</span>
                {l.practiceAreaCode ? (
                  <Badge variant="info">{areaName(l.practiceAreaCode)}</Badge>
                ) : (
                  <Badge variant="neutral">Firm-wide</Badge>
                )}
                {l.clientType && <Badge variant="neutral">{l.clientType.replace(/_/g, " ")}</Badge>}
                <span className="ml-auto text-[11px] text-ink/40">{formatDate(l.createdAt)}</span>
              </div>
              <p className="mt-2.5 text-sm text-ink/70 leading-relaxed line-clamp-3">
                {l.learningText}
              </p>
              {(l.matterReference || l.loggedByName) && (
                <p className="mt-2 text-[11px] text-ink/40">
                  {l.matterReference && <>From {l.matterReference}</>}
                  {l.matterReference && l.loggedByName && " · "}
                  {l.loggedByName && <>Recorded by {l.loggedByName}</>}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      <Drawer
        isOpen={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit learning" : "Record a learning"}
        size="lg"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-ink/40 uppercase tracking-wider pl-1">
              What is the lesson
            </label>
            <input
              className={FIELD}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. TSAs overrun on partial-stake deals"
              maxLength={200}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-ink/40 uppercase tracking-wider pl-1">
              In full
            </label>
            <Textarea
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write it as you would explain it to a partner about to price this kind of matter. The pricing agent reads this text directly."
              maxLength={4000}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Practice area"
              placeholder="Applies firm-wide"
              value={practiceArea}
              onChange={setPracticeArea}
              options={[
                { value: "", label: "Applies firm-wide" },
                ...practiceAreas.map((pa) => ({ value: pa.code, label: pa.name })),
              ]}
            />
            <Select
              label="Client type"
              placeholder="Any client type"
              value={clientType}
              onChange={setClientType}
              options={CLIENT_TYPES}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-ink/40 uppercase tracking-wider pl-1">
              Matter it came from <span className="font-normal normal-case">(optional)</span>
            </label>
            <input
              className={FIELD}
              value={matterRef}
              onChange={(e) => setMatterRef(e.target.value)}
              placeholder="e.g. MAT-2026-0412"
              maxLength={100}
            />
          </div>

          <p className="text-[12px] text-ink/45 leading-relaxed">
            Leaving practice area and client type blank makes this apply to every matter. Narrow
            it when the lesson only holds for a particular kind of work.
          </p>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
            {editing ? (
              <Button variant="secondary" onClick={remove} disabled={saving}>
                Remove
              </Button>
            ) : (
              <span />
            )}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={save}
                loading={saving}
                disabled={!title.trim() || !text.trim()}
              >
                {editing ? "Save" : "Record"}
              </Button>
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
