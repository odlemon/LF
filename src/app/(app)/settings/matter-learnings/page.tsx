"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineSearch, HiPlus, HiRefresh, HiX } from "react-icons/hi";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { usePracticeAreas } from "@/modules/firm/hooks/useFirm";
import {
  matterLearningApi,
  type MatterLearning,
} from "@/lib/api/modules/matterLearning.api";
import { AUTHOR_ADVISOR, LearningCard } from "@/modules/knowledge/components/LearningCard";
import { LearningDetail } from "@/modules/knowledge/components/LearningDetail";
import { LearningForm, type LearningDraft } from "@/modules/knowledge/components/LearningForm";
import { searchableText } from "@/modules/knowledge/lib/lesson";

/**
 * The firm's pricing memory.
 *
 * Two things drove this layout. Filtering used to be a row of pills — one per practice area —
 * which wrapped onto three lines before a firm had ten practices, and offered no way to narrow by
 * anything else. And clicking a learning opened the edit form, so reading one meant reading it
 * inside a textarea. Both are now what they should be: a compact filter bar that scales, and a
 * reading view with revising as a deliberate second step.
 */

type SourceFilter = "all" | "people" | "captured";

const SOURCES: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "Every source" },
  { value: "people", label: "Recorded by people" },
  { value: "captured", label: "Captured from negotiations" },
];

export default function MatterLearningsPage() {
  const { areas: practiceAreas } = usePracticeAreas();

  const [items, setItems] = useState<MatterLearning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [practiceArea, setPracticeArea] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MatterLearning | null>(null);
  const [editing, setEditing] = useState(false);
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

  const areaName = useCallback(
    (code?: string | null) => practiceAreas.find((p) => p.code === code)?.name ?? code ?? "",
    [practiceAreas]
  );

  // Only the practice areas that actually have learnings — a filter listing empty options is a
  // list of dead ends.
  const areaOptions = useMemo(() => {
    const used = new Set(items.map((i) => i.practiceAreaCode).filter(Boolean) as string[]);
    return [
      { value: "", label: "Every practice area" },
      { value: "__firmwide", label: "Firm-wide only" },
      ...practiceAreas
        .filter((pa) => used.has(pa.code))
        .map((pa) => ({ value: pa.code, label: pa.name })),
    ];
  }, [items, practiceAreas]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((l) => {
      if (practiceArea === "__firmwide" && l.practiceAreaCode) return false;
      if (practiceArea && practiceArea !== "__firmwide" && l.practiceAreaCode !== practiceArea) {
        return false;
      }
      const captured = l.loggedByName === AUTHOR_ADVISOR;
      if (source === "people" && captured) return false;
      if (source === "captured" && !captured) return false;
      if (needle && !searchableText(l).includes(needle)) return false;
      return true;
    });
  }, [items, query, practiceArea, source]);

  const capturedCount = useMemo(
    () => items.filter((l) => l.loggedByName === AUTHOR_ADVISOR).length,
    [items]
  );

  const filtered = query.trim() !== "" || practiceArea !== "" || source !== "all";
  const clearFilters = () => {
    setQuery("");
    setPracticeArea("");
    setSource("all");
  };

  const startNew = () => {
    setSelected(null);
    setEditing(true);
    setOpen(true);
  };

  const openLearning = (l: MatterLearning) => {
    setSelected(l);
    setEditing(false);
    setOpen(true);
  };

  const save = async (draft: LearningDraft) => {
    setSaving(true);
    try {
      if (selected) {
        await matterLearningApi.update(selected.uid, draft);
        toast.success("Learning updated");
      } else {
        await matterLearningApi.create(draft);
        toast.success("Recorded — the pricing agent will use it from now on");
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
    if (!selected) return;
    setSaving(true);
    try {
      await matterLearningApi.remove(selected.uid);
      toast.success("Learning removed");
      setOpen(false);
      await load();
    } catch {
      toast.error("Could not remove that learning");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Matter learnings</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink/55">
            What the firm has worked out about pricing its own work. Everything here is read by the
            pricing agent when it scopes a comparable matter, so a lesson recorded once stops being
            relearned deal by deal.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={() => void load()}>
            <HiRefresh className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="primary" onClick={startNew}>
            <HiPlus className="h-4 w-4" />
            Record a learning
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <HiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, matters, clients"
            aria-label="Search learnings"
            className="w-full rounded-full border border-border bg-canvas py-2.5 pl-11 pr-4 text-sm text-ink placeholder-ink/35 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:w-auto sm:grid-cols-2">
          <Select
            value={practiceArea}
            onChange={setPracticeArea}
            options={areaOptions}
            placeholder="Every practice area"
          />
          <Select
            value={source}
            onChange={(v) => setSource(v as SourceFilter)}
            options={SOURCES}
            placeholder="Every source"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink/50">
        <span>
          {visible.length} {visible.length === 1 ? "learning" : "learnings"}
          {filtered && items.length !== visible.length ? ` of ${items.length}` : ""}
        </span>
        {capturedCount > 0 && !filtered && (
          <>
            <span className="text-ink/30">·</span>
            <span>
              {capturedCount} captured automatically when a negotiation closed
            </span>
          </>
        )}
        {filtered && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto inline-flex items-center gap-1 font-semibold text-ink/60 transition-colors hover:text-ink cursor-pointer"
          >
            <HiX className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {error && <Alert variant="error" message={error} />}

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-surface" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          title={filtered ? "Nothing matches those filters" : "Nothing recorded yet"}
          description={
            filtered
              ? "Try a broader search, or clear the filters to see everything the firm has recorded."
              : "When a matter teaches the firm something about how to price that kind of work, record it here and every future scope will take it into account. Closed negotiations also add their own."
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((l) => (
            <LearningCard
              key={l.uid}
              learning={l}
              practiceAreaName={areaName}
              onOpen={openLearning}
            />
          ))}
        </div>
      )}

      <Drawer
        isOpen={open}
        onClose={() => setOpen(false)}
        title={selected ? (editing ? "Revise learning" : "Learning") : "Record a learning"}
        size="xl"
      >
        {selected && !editing ? (
          <LearningDetail
            learning={selected}
            practiceAreaName={areaName}
            onEdit={() => setEditing(true)}
            onRemove={remove}
            removing={saving}
          />
        ) : (
          <LearningForm
            existing={selected}
            practiceAreas={practiceAreas}
            saving={saving}
            onCancel={() => (selected ? setEditing(false) : setOpen(false))}
            onSave={save}
          />
        )}
      </Drawer>
    </div>
  );
}
