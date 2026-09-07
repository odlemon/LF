import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { preload } from "react-dom";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Log in | Lysp",
  description: "Sign in to Lysp pricing intelligence for your firm.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  preload("/images/practices/ma-glass.jpg", { as: "image", fetchPriority: "high" });
  preload("/images/logo/lysp-logo-bw-white.png", { as: "image", fetchPriority: "high" });

  return (
    <div className={`${quicksand.className} min-h-screen antialiased bg-[#0a0f0d]`}>
      {children}
    </div>
  );
}
