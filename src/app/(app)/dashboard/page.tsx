"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { HiLogout } from "react-icons/hi";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/auth");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.firstName} {user?.lastName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <HiLogout className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Firm User Profile</h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div><span className="font-medium text-gray-500">Email:</span> {user?.email}</div>
          <div>
            <span className="font-medium text-gray-500">Role Permissions:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {user?.permissions.map((perm) => (
                <span
                  key={perm}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
