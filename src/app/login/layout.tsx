import type { Metadata } from "next";
import { preload } from "react-dom";
import { quicksand } from "@/lib/fonts";

export const metadata: Metadata = {
  // The root layout applies a "%s | Lysp" template, so naming the product here too
  // produced "Log in | Lysp | Lysp".
  title: "Log in",
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
