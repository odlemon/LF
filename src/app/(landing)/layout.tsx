import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { preload } from "react-dom";
import "../globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lysp - Pricing intelligence for elite law firms",
  description: "Pricing intelligence for elite law firms. Consolidate billing, rate, and matter data to improve realization and revenue predictability.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  preload("/videos/golden-hour-poster.jpg", { as: "image", fetchPriority: "high" });
  preload("/videos/golden-hour-desktop.mp4", { as: "video", fetchPriority: "high" });

  return (
    <div className={`${quicksand.className} min-h-screen bg-gray-100 antialiased`}>
      {children}
    </div>
  );
}
