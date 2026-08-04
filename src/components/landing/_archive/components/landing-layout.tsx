import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "../globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lysp - Enterprise Pricing Intelligence for Law Firms",
  description: "Consolidate billing, rate, and matter data to deliver consistent, realization-improving pricing models.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${quicksand.className} min-h-screen bg-gray-100 antialiased`}>
      {children}
    </div>
  );
}
