export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readMins: number;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "from-rfp-to-accepted-fee",
    title: "From RFP to accepted fee: why pricing still breaks in elite firms",
    excerpt:
      "The work is rigorous. The fee process often is not. How scattered rate cards, email counters, and late realization reviews create leakage.",
    category: "Pricing ops",
    date: "2026-07-14",
    readMins: 6,
  },
  {
    slug: "volume-discounts-without-spreadsheets",
    title: "Volume discounts without the quarter-end spreadsheet rebuild",
    excerpt:
      "Relationship economics only work when tiers update as matters close - and clients can see progress without a custom report.",
    category: "Client economics",
    date: "2026-06-28",
    readMins: 5,
  },
  {
    slug: "pricing-data-is-privileged",
    title: "Pricing data is privileged. Treat it that way.",
    excerpt:
      "Rates, OCGs, and negotiation history are among a firm’s most sensitive assets. What enterprise buyers should demand from any pricing platform.",
    category: "Security",
    date: "2026-06-10",
    readMins: 7,
  },
  {
    slug: "usage-based-pricing-for-law-firms",
    title: "Why usage-based beats seat licenses for pricing tools",
    excerpt:
      "Commercial intensity varies by desk and season. Seat fees punish collaboration. Credits align cost with matters priced and negotiations run.",
    category: "Product",
    date: "2026-05-22",
    readMins: 4,
  },
];
