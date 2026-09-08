"use client";

import React, { useState } from "react";
import { usePmsConnectors, useDatasets } from "@/modules/data-room/hooks/useDataRoom";
import { PmsConnectorFormModal } from "@/modules/data-room/components/PmsConnectorFormModal";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { HiPlus, HiCloudUpload, HiLightningBolt, HiCheckCircle, HiXCircle, HiClock } from "react-icons/hi";

function SyncStatusBadge({ status }: { status?: string }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-field text-ink/40 border border-border/60">
        <HiClock className="w-3 h-3" /> Never synced
      </span>
    );
  }
  if (status === "SUCCESS") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
        <HiCheckCircle className="w-3 h-3" /> Success
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
      <HiXCircle className="w-3 h-3" /> {status}
    </span>
  );
}

export default function PmsConnectorsPage() {
  const { connectors, isLoading, createConnector, syncNow, testConnection, refetch } = usePmsConnectors();
  const { datasets } = useDatasets({}, 0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [syncingUid, setSyncingUid] = useState<string | null>(null);
  const [testingUid, setTestingUid] = useState<string | null>(null);

  const handleCreate = async (cmd: any) => {
    await createConnector(cmd);
    toast.success("PMS connector created.");
    refetch();
  };

  const handleSyncNow = async (uid: string) => {
    setSyncingUid(uid);
    try {
      await syncNow(uid);
      toast.success("Sync completed.");
    } catch (err: any) {
      toast.error(err.message || "Sync failed.");
    } finally {
      setSyncingUid(null);
    }
  };

  const handleTest = async (uid: string) => {
    setTestingUid(uid);
    try {
      const result = await testConnection(uid);
      if (result.reachable) {
        toast.success("Connector is reachable.");
      } else {
        toast.error("Connector is not reachable.");
      }
    } catch (err: any) {
      toast.error(err.message || "Test failed.");
    } finally {
      setTestingUid(null);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "—";
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto flex flex-col gap-6 text-ink/90">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
            <HiCloudUpload className="w-7 h-7 text-primary" /> PMS Connectors
          </h1>
          <p className="text-sm text-ink/55 mt-1">
            Sync historical matters and billing data directly from your practice management system.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          <HiPlus className="w-4.5 h-4.5" /> New Connector
        </Button>
      </div>

      {/* Named-vendor integrations are a later phase; the generic REST connector
          is the one that actually runs today. */}
      <div className="bg-field/50 border border-border/50 rounded-3xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink/35">
          Coming next
        </p>
        <h2 className="mt-1.5 text-sm font-bold text-ink">Native practice-management integrations</h2>
        <p className="mt-1 text-xs text-ink/55 max-w-2xl leading-relaxed">
          Direct, credentialed connectors for the systems most firms run on. Until these
          ship, the same data can be synced today through the Generic REST connector or
          imported as a file.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Aderant", "Elite 3E", "Intapp", "SAP", "NetDocuments"].map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/70 bg-surface text-[11px] font-semibold text-ink/45"
            >
              {name}
              <span className="text-[9px] font-bold uppercase tracking-wider text-ink/30">
                Planned
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto rates-scrollable">
          <table className="min-w-full divide-y divide-gray-100 text-xs">
            <thead className="bg-field">
              <tr>
                <th className="px-5 py-3.5 text-left font-bold text-ink/55 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3.5 text-left font-bold text-ink/55 uppercase tracking-wider">System</th>
                <th className="px-5 py-3.5 text-left font-bold text-ink/55 uppercase tracking-wider">Base URL</th>
                <th className="px-5 py-3.5 text-left font-bold text-ink/55 uppercase tracking-wider">Schedule</th>
                <th className="px-5 py-3.5 text-left font-bold text-ink/55 uppercase tracking-wider">Last Synced</th>
                <th className="px-5 py-3.5 text-left font-bold text-ink/55 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-right font-bold text-ink/55 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-ink/80">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse bg-field/20">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-4 bg-field rounded w-5/6" />
                    </td>
                  </tr>
                ))
              ) : connectors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-ink/40">
                    No PMS connectors configured yet. Click &quot;New Connector&quot; to sync your first practice-management system.
                  </td>
                </tr>
              ) : (
                connectors.map((c) => (
                  <tr key={c.uid} className="hover:bg-field/30 transition-colors">
                    <td className="px-5 py-4 text-ink font-extrabold">{c.displayName}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 border border-border/80 rounded bg-field text-ink/60 font-bold text-[10px] uppercase">
                        {c.systemType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-ink/65 max-w-[220px] truncate">{c.baseUrl}</td>
                    <td className="px-5 py-4 text-ink/65">Every {c.syncIntervalHours}h</td>
                    <td className="px-5 py-4 text-ink/65">{formatDateTime(c.lastSyncedAt)}</td>
                    <td className="px-5 py-4">
                      <SyncStatusBadge status={c.lastSyncStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTest(c.uid)}
                          disabled={testingUid === c.uid}
                          className="px-3 py-1.5 bg-field border border-border hover:bg-canvas rounded-full text-[11px] font-bold text-ink/80 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {testingUid === c.uid ? "Testing..." : "Test"}
                        </button>
                        <button
                          onClick={() => handleSyncNow(c.uid)}
                          disabled={syncingUid === c.uid}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary/5 border border-primary/20 hover:bg-primary/10 rounded-full text-[11px] font-bold text-primary transition-all cursor-pointer disabled:opacity-50"
                        >
                          <HiLightningBolt className="w-3.5 h-3.5" />
                          {syncingUid === c.uid ? "Syncing..." : "Sync Now"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PmsConnectorFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleCreate}
        datasets={datasets}
      />
    </div>
  );
}
