"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Quicksand } from "next/font/google";
import { ClientAuthProvider } from "@/context/ClientAuthContext";
import { ThemeProvider, platformRootClass, useTheme, PLATFORM_THEME_VARS } from "@/context/ThemeContext";
import { useClientAuth } from "@/hooks/useClientAuth";
import { ClientSidebar } from "@/components/layout/ClientSidebar";
import { AppToaster } from "@/components/ui/AppToaster";
import { ClientPortalTopBar } from "@/modules/client-portal/components/ClientPortalTopBar";
import { MustChangePasswordBanner } from "@/modules/client-portal/components/MustChangePasswordBanner";
import { ConnectionBanner } from "@/components/layout/ConnectionBanner";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function ClientShell({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // A client component cannot export Next metadata, so every portal screen showed the bare
  // root title. Clients keep a proposal open beside their email for days; the tab should say
  // which screen it is.
  useEffect(() => {
    const segment = (pathname || "").split("/").filter(Boolean)[1];
    const names: Record<string, string> = {
      dashboard: "Dashboard",
      negotiations: "Proposals",
      discount: "Discount status",
      matters: "Matter history",
      account: "Account",
      settings: "Settings",
    };
    document.title = `${names[segment] || "Client portal"} | Lysp`;
  }, [pathname]);

  return (
    <div
      className={platformRootClass(theme, `${quicksand.className} flex min-h-screen antialiased`)}
      style={PLATFORM_THEME_VARS[theme]}
      data-theme={theme}
    >
      <ClientSidebar
        isMobileOpen={isMobileNavOpen}
        onMobileClose={() => setIsMobileNavOpen(false)}
      />
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden bg-canvas text-ink">
        <ClientPortalTopBar onMenuClick={() => setIsMobileNavOpen(true)} />
        <ConnectionBanner />
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
      router.push("/client-login");
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
