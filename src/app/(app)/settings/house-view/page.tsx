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
 * The house view: what this firm has settled on about pricing its own work.
 *
 * Framed around the fact that it fills itself. Every closed negotiation writes its own entry, and
 * the pricing agent reads them back when scoping comparable work — so this is a standing record
 * the firm curates, not a form somebody has to remember to fill in. Adding one by hand is
 * therefore a secondary action, and there is deliberately no primary call to action on the page:
 * the thing to do here is read.
 *
 * Two earlier problems drove the layout. Filtering was a row of pills, one per practice area,
 * wrapping onto three lines before a firm had ten practices. And clicking an entry opened the
 * edit form, so reading one meant reading it inside a textarea.
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
      setError("Could not load the firm's house view.");
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
        toast.success("Position updated");
      } else {
        await matterLearningApi.create(draft);
        toast.success("Added — the pricing agent will apply it from now on");
      }
      setOpen(false);
      await load();
    } catch {
      toast.error("Could not save that position");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await matterLearningApi.remove(selected.uid);
      toast.success("Position removed");
      setOpen(false);
      await load();
    } catch {
      toast.error("Could not remove that position");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-ink">House view</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink/55">
            Where this firm has landed on pricing its own work. Every negotiation that closes adds
            its own entry, and the pricing agent reads them back when it scopes comparable work — so
            what the firm learns once stops being relearned deal by deal.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" onClick={() => void load()}>
            <HiRefresh className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="secondary" onClick={startNew}>
            <HiPlus className="h-4 w-4" />
            Add a position
          </Button>
        </div>
      </header>

      {/* Stacks until lg, not sm: with the sidebar open at ~800px the three controls shared about
          550px and the search field collapsed to the width of its own icon. */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <HiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search positions, matters, clients"
            aria-label="Search the house view"
            className="w-full rounded-full border border-border bg-canvas py-2.5 pl-11 pr-4 text-sm text-ink placeholder-ink/35 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[27rem] lg:shrink-0">
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

      {/* Hidden while loading: the count is derived from state that is still empty, so it
          announced "0 positions" over a list of skeletons. */}
      <div className="flex flex-wrap items-center gap-2 text-[12px] text-ink/50">
        {loading ? (
          <span className="h-4 w-40 animate-pulse rounded bg-field" />
        ) : (
        <span>
          {visible.length} {visible.length === 1 ? "position" : "positions"}
          {filtered && items.length !== visible.length ? ` of ${items.length}` : ""}
        </span>
        )}
        {!loading && !filtered && (
          <>
            <span className="text-ink/30">·</span>
            <span>
              {capturedCount > 0
                ? `${capturedCount} written automatically as negotiations closed`
                : "Entries are added automatically as negotiations close"}
            </span>
          </>
        )}
        {!loading && filtered && (
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
          title={filtered ? "Nothing matches those filters" : "No positions yet"}
          description={
            filtered
              ? "Try a broader search, or clear the filters to see everything the firm holds."
              : "The house view builds itself: when a negotiation closes, what the firm learned from it is written up and filed here automatically. You can also add a position by hand at any time."
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
        title={selected ? (editing ? "Revise position" : "House view") : "Add a position"}
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
