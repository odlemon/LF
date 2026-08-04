"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useClientAuth } from "@/hooks/useClientAuth";
import { HiLogout } from "react-icons/hi";

export default function ClientDashboardPage() {
  const { user, logout } = useClientAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/client-login");
  };

  return (
    <div className="px-4 sm:px-6 py-6 lg:py-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Portal Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {user?.contactName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/20"
        >
          <HiLogout className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div><span className="font-medium text-gray-500">Company:</span> {user?.clientName}</div>
          <div><span className="font-medium text-gray-500">Contact Email:</span> {user?.email}</div>
        </div>
      </div>
    </div>
  );
}
