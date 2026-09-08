import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Root fallback. The landing group sets its own richer metadata; this is what the firm app
 * and client portal inherit, and it was still the create-next-app default — every workspace
 * tab read "Create Next App".
 *
 * The template applies to nested segments that set their own title, so a page can contribute
 * its name without repeating the product.
 */
export const metadata: Metadata = {
  title: {
    default: "Lysp",
    template: "%s | Lysp",
  },
  description: "Pricing intelligence for elite law firms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
