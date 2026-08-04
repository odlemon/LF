"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClientAuthProvider } from "@/context/ClientAuthContext";
import { useClientAuth } from "@/hooks/useClientAuth";
import { ClientSidebar } from "@/components/layout/ClientSidebar";

function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useClientAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/client-login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ClientSidebar />
      <main className="flex-1 overflow-y-auto rates-scrollable">
        {children}
      </main>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthProvider>
      <ClientAuthGuard>
        {children}
      </ClientAuthGuard>
    </ClientAuthProvider>
  );
}
