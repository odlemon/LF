import type { Metadata } from "next";
import Link from "next/link";
import { HeroNavbar } from "@/components/landing/HeroNavbar";
import { FooterSection } from "@/components/landing/FooterSection";
import { ProductExplorer } from "@/components/landing/platform/ProductExplorer";

export const metadata: Metadata = {
  title: "Product - Lysp",
  description:
    "Explore Lysp: scope-to-propose pricing flow, rate negotiation, volume discounts, and firm-wide pricing analytics.",
};

export default function ProductPage() {
  return (
    <div className="flex flex-col w-full bg-[#fefefc] overflow-hidden min-h-screen">
      <HeroNavbar />

      <main className="pt-14 sm:pt-16">
        <section className="relative overflow-hidden border-b border-black/[0.06] bg-[#fefefc]">
          <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-10 pt-16 sm:pt-24 pb-12 sm:pb-16">
            <p className="text-[12px] font-medium tracking-[0.22em] uppercase text-[#0a0a0a]/40">
              Product
            </p>
            <h1 className="mt-5 max-w-4xl text-balance text-[2.25rem] sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.08] tracking-tight text-[#0a0a0a]">
              Everything your team needs to scope, price and win work - powered by your own data.
            </h1>
            <p className="mt-5 max-w-2xl text-base sm:text-lg text-[#0a0a0a]/55 leading-relaxed font-medium">
              Built for enterprise law firms. One system from RFP to accepted proposal. Explore each
              capability below.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-full bg-[#0a0a0a] px-6 py-3 text-[14px] font-semibold text-[#fefefc] hover:bg-black transition-colors"
              >
                Book a demo
              </Link>
              <Link
                href="/#platform"
                className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white px-6 py-3 text-[14px] font-semibold text-[#0a0a0a] hover:bg-black/[0.03] transition-colors"
              >
                Back to overview
              </Link>
            </div>
          </div>
        </section>

        <ProductExplorer />
      </main>

      <FooterSection />
    </div>
  );
}
