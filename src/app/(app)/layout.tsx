"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "react-hot-toast";

function FirmAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto rates-scrollable">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function FirmLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FirmAuthGuard>
        {children}
        <Toaster position="top-right" />
      </FirmAuthGuard>
    </AuthProvider>
  );
}
