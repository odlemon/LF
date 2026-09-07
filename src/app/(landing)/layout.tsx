import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import { preload } from "react-dom";
import "../globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_LANDING_URL ?? "https://lysp.ai";

/** What a shared link says about Lysp. */
const SHARE_TITLE = "Pricing intelligence for elite law firms";
const SHARE_DESCRIPTION =
  "The firms that win the most work price it better than anyone else. Lysp is how they do it.";

export const metadata: Metadata = {
  // Without this, Next cannot turn the generated card's relative path into the absolute URL
  // that Open Graph requires, and every crawler silently drops the image.
  metadataBase: new URL(SITE_URL),
  title: "Lysp - Pricing intelligence for elite law firms",
  description:
    "Pricing intelligence for elite law firms. Consolidate billing, rate, and matter data to improve realization and revenue predictability.",
  openGraph: {
    type: "website",
    siteName: "Lysp",
    url: SITE_URL,
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    // The card itself comes from opengraph-image.tsx; Next appends it here automatically.
  },
  twitter: {
    // summary_large_image, not summary: the whole point of the card is the photograph, and
    // the small variant crops it to a thumbnail beside the text.
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  preload("/videos/golden-hour-poster.jpg", { as: "image", fetchPriority: "high" });
  preload("/videos/golden-hour-desktop.mp4", { as: "video", fetchPriority: "high" });
  preload("/images/practices/ma-glass.jpg", { as: "image", fetchPriority: "high" });
  preload("/images/practices/banking-glass.jpg", { as: "image" });
  preload("/images/practices/litigation-glass.jpg", { as: "image" });
  preload("/images/practices/realestate-glass.jpg", { as: "image" });
  preload("/images/practices/employment-glass.jpg", { as: "image" });

  return (
    <div className={`${quicksand.className} min-h-screen bg-gray-100 antialiased`}>
      {children}
    </div>
  );
}
