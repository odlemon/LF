"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi";
import { Button } from "@/components/ui/Button";

export default function PricingWorkspacePlaceholderPage() {
  const params = useParams();
  const router = useRouter();
  const uid = params.uid as string;

  return (
    <div className="p-8 max-w-2xl mx-auto flex flex-col gap-6">
      <button
        type="button"
        onClick={() => router.push(`/pricing-requests/${uid}`)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary w-fit"
      >
        <HiArrowLeft className="w-4 h-4" />
        Back to intake workspace
      </button>
      <div className="bg-white rounded-2xl border border-gray-200/60 p-8 shadow-sm text-center">
        <h1 className="text-xl font-bold text-gray-900">Pricing Workspace</h1>
        <p className="text-sm text-gray-500 mt-2">Coming soon - AI pricing scenarios will be generated here.</p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => router.push("/pricing-requests")}
        >
          All pricing requests
        </Button>
      </div>
    </div>
  );
}
