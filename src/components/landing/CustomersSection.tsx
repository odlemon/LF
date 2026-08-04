"use client";

import React from "react";

type CustomerLogo = {
  name: string;
  href: string;
  src: string;
};

const CUSTOMERS: CustomerLogo[] = [
  {
    name: "Reed Smith",
    href: "https://www.reedsmith.com/",
    src: "/images/customers/reed-smith.svg",
  },
  {
    name: "Dentons",
    href: "https://www.dentons.com/",
    src: "/images/customers/dentons.svg",
  },
  {
    name: "BakerHostetler",
    href: "https://www.bakerlaw.com/",
    src: "/images/customers/bakerhostetler.svg",
  },
  {
    name: "Clifford Chance",
    href: "https://www.cliffordchance.com/",
    src: "/images/customers/clifford-chance.svg",
  },
  {
    name: "Linklaters",
    href: "https://www.linklaters.com/",
    src: "/images/customers/linklaters.svg",
  },
  {
    name: "DLA Piper",
    href: "https://www.dlapiper.com/",
    src: "/images/customers/dla-piper.svg",
  },
  {
    name: "White & Case",
    href: "https://www.whitecase.com/",
    src: "/images/customers/white-case.svg",
  },
  {
    name: "Latham & Watkins",
    href: "https://www.lw.com/",
    src: "/images/customers/latham-watkins.svg",
  },
  {
    name: "Freshfields",
    href: "https://www.freshfields.com/",
    src: "/images/customers/freshfields.svg",
  },
  {
    name: "Kirkland & Ellis",
    href: "https://www.kirkland.com/",
    src: "/images/customers/kirkland.svg",
  },
  {
    name: "Norton Rose Fulbright",
    href: "https://www.nortonrosefulbright.com/",
    src: "/images/customers/norton-rose.svg",
  },
  {
    name: "Allen & Overy",
    href: "https://www.aoshearman.com/",
    src: "/images/customers/allen-overy.svg",
  },
];

function MarqueeTrack({ trackKey }: { trackKey: string }) {
  return (
    <div className="flex shrink-0 items-center gap-12 sm:gap-16 lg:gap-20 pr-12 sm:pr-16 lg:pr-20">
      {CUSTOMERS.map((customer) => (
        <a
          key={`${trackKey}-${customer.name}`}
          href={customer.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center justify-center min-w-[120px] sm:min-w-[150px] h-10 sm:h-12 px-2 opacity-50 grayscale transition-[opacity,filter] duration-300 hover:opacity-90 hover:grayscale-0"
          aria-label={`${customer.name} website`}
          title={customer.name}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={customer.src}
            alt={customer.name}
            className="h-6 sm:h-8 w-auto max-w-[150px] object-contain"
            loading="lazy"
            decoding="async"
          />
        </a>
      ))}
    </div>
  );
}

export function CustomersSection() {
  return (
    <section
      id="customers"
      className="relative w-full border-b border-black/[0.06] bg-[#fefefc] py-10 sm:py-12"
      aria-label="Our customers"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0a0a0a]/40">
          Our Customers
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24 bg-gradient-to-r from-[#fefefc] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-24 bg-gradient-to-l from-[#fefefc] to-transparent" />

        <div className="flex w-max animate-customers-marquee motion-reduce:animate-none">
          <MarqueeTrack trackKey="a" />
          <MarqueeTrack trackKey="b" />
        </div>
      </div>
    </section>
  );
}
