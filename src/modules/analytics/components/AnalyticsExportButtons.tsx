"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineDocumentDownload, HiOutlineTable } from "react-icons/hi";
import { Button } from "@/components/ui/Button";
import { analyticsApi } from "@/lib/api/modules/analytics.api";
import type { PeriodParams } from "@/modules/analytics/types";

/**
 * The two deliverables the dashboard itself cannot be: a workbook the pricing director takes
 * into Excel, and a document the managing partner reads in a meeting.
 */
export function AnalyticsExportButtons({ period }: { period: PeriodParams }) {
  const [busy, setBusy] = useState<"xlsx" | "pdf" | null>(null);

  const save = (data: ArrayBuffer, type: string, filename: string) => {
    const url = URL.createObjectURL(new Blob([data], { type }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stamp = period.to || new Date().toISOString().slice(0, 10);

  const download = async (kind: "xlsx" | "pdf") => {
    setBusy(kind);
    try {
      if (kind === "xlsx") {
        save(
          await analyticsApi.exportWorkbook(period),
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          `lysp-analytics-${stamp}.xlsx`
        );
      } else {
        save(
          await analyticsApi.exportBoardPack(period),
          "application/pdf",
          `lysp-board-pack-${stamp}.pdf`
        );
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Could not build the export");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" onClick={() => download("xlsx")} disabled={busy !== null}>
        <HiOutlineTable className="h-4 w-4" />
        {busy === "xlsx" ? "Building…" : "Excel"}
      </Button>
      <Button variant="secondary" onClick={() => download("pdf")} disabled={busy !== null}>
        <HiOutlineDocumentDownload className="h-4 w-4" />
        {busy === "pdf" ? "Building…" : "Board pack"}
      </Button>
    </div>
  );
}
