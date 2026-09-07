"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Quicksand } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider, platformRootClass, useTheme, PLATFORM_THEME_VARS } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { AppToaster } from "@/components/ui/AppToaster";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function FirmShell({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  return (
    <div
      className={platformRootClass(theme, `${quicksand.className} flex min-h-screen antialiased`)}
      style={PLATFORM_THEME_VARS[theme]}
      data-theme={theme}
    >
      <Sidebar isMobileOpen={isMobileNavOpen} onMobileClose={() => setIsMobileNavOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col overflow-hidden bg-canvas text-ink">
        <Navbar onMenuClick={() => setIsMobileNavOpen(true)} />
        <main className="rates-scrollable min-h-0 flex-1 overflow-y-auto bg-canvas text-ink">
          {children}
        </main>
      </div>
      <AppToaster />
    </div>
  );
}

function FirmAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    if (
      user?.userType === "CLIENT_USER" ||
      (user?.roles || []).includes("CLIENT_USER")
    ) {
      router.replace("/client-portal/dashboard");
    }
  }, [isAuthenticated, isLoading, router, user]);

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

  if (
    user?.userType === "CLIENT_USER" ||
    (user?.roles || []).includes("CLIENT_USER")
  ) {
    return null;
  }

  return <FirmShell>{children}</FirmShell>;
}

export default function FirmLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <FirmAuthGuard>
          {children}
        </FirmAuthGuard>
      </ThemeProvider>
    </AuthProvider>
  );
}
