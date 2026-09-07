"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Quicksand } from "next/font/google";
import { ClientAuthProvider } from "@/context/ClientAuthContext";
import { ThemeProvider, platformRootClass, useTheme, PLATFORM_THEME_VARS } from "@/context/ThemeContext";
import { useClientAuth } from "@/hooks/useClientAuth";
import { ClientSidebar } from "@/components/layout/ClientSidebar";
import { AppToaster } from "@/components/ui/AppToaster";
import { ClientPortalTopBar } from "@/modules/client-portal/components/ClientPortalTopBar";
import { MustChangePasswordBanner } from "@/modules/client-portal/components/MustChangePasswordBanner";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function ClientShell({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div
      className={platformRootClass(theme, `${quicksand.className} flex min-h-screen antialiased`)}
      style={PLATFORM_THEME_VARS[theme]}
      data-theme={theme}
    >
      <ClientSidebar />
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden bg-canvas text-ink">
        <ClientPortalTopBar />
        <MustChangePasswordBanner />
        <main className="rates-scrollable flex-1 overflow-y-auto bg-canvas text-ink">
          {children}
        </main>
      </div>
      <AppToaster />
    </div>
  );
}

function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useClientAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div
        className={platformRootClass(
          theme,
          `${quicksand.className} flex h-screen w-screen items-center justify-center`
        )}
        style={PLATFORM_THEME_VARS[theme]}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <ClientShell>{children}</ClientShell>;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthProvider>
      <ThemeProvider>
        <ClientAuthGuard>{children}</ClientAuthGuard>
      </ThemeProvider>
    </ClientAuthProvider>
  );
}
