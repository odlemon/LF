export type UseCaseId = "flow" | "negotiation" | "discounts" | "analytics";

export type OutcomeBeat = {
  n: string;
  title: string;
  body: string;
};

export type UseCase = {
  id: UseCaseId;
  /** Anchor id on /product (flow kept for backward-compatible #flow links). */
  anchor: string;
  label: string;
  jumpLabel: string;
  /** Short line for homepage platform carousel. */
  brief: string;
  title: string;
  description: string;
  foundation?: string;
  /** Business outcomes, not product feature checklists. */
  outcomes: OutcomeBeat[];
};

/** @deprecated Alias for homepage carousel compatibility. */
export type WorkflowStep = OutcomeBeat;

export const USE_CASES: UseCase[] = [
  {
    id: "flow",
    anchor: "flow",
    label: "Pricing",
    jumpLabel: "Pricing",
    brief: "One conversation becomes a fee your firm will stand behind.",
    title: "Stop pricing from memory and hope.",
    description:
      "When an RFP lands, the firm should know what similar work actually cost, what margin it protected, and what fee to put in front of the client. Lysp turns that into one continuous commercial judgment, not a week of handoffs.",
    foundation:
      "Every recommendation is grounded in your matter history, rate cards, and OCGs. Your commercial data stays yours.",
    outcomes: [
      {
        n: "01",
        title: "The brief becomes a priced matter",
        body: "Partners stop rebuilding the same scope in Word. The work is named, phased, and staffed once, with exclusions that survive client review.",
      },
      {
        n: "02",
        title: "The fee has a reason",
        body: "Comps, rate cards, and margin floors sit next to the number. You can defend it in the room, not invent the rationale after the client pushes back.",
      },
      {
        n: "03",
        title: "The proposal leaves ready",
        body: "What finance approved is what the client sees. No last-minute spreadsheet version, no silent discount buried in an email.",
      },
      {
        n: "04",
        title: "Why it matters",
        body: "Underpricing and write-downs usually start here, before negotiation. Getting this desk right is where leakage is prevented, not audited later.",
      },
    ],
  },
  {
    id: "negotiation",
    anchor: "negotiation",
    label: "Rate Negotiation",
    jumpLabel: "Negotiation",
    brief: "Counters and acceptances with an attributable trail.",
    title: "Negotiation without the inbox theater.",
    description:
      "Clients will push. That is the job. Lysp keeps the push inside a portal where partners and finance stay in control, and leadership can reconstruct every round without hunting threads.",
    outcomes: [
      {
        n: "01",
        title: "The client answers in one place",
        body: "Counters arrive as numbers and notes, not side deals in a partner’s personal inbox.",
      },
      {
        n: "02",
        title: "Margin floors hold",
        body: "Revised offers that threaten the floor route to the people who own P&L before anything goes back out.",
      },
      {
        n: "03",
        title: "Acceptance closes cleanly",
        body: "When the fee is done, the trail is done with it. Who offered, who cleared, who accepted.",
      },
      {
        n: "04",
        title: "Why it matters",
        body: "Most margin erosion in elite work happens after the first fee, in the scramble to keep the relationship. This is how you keep the relationship without giving the firm away.",
      },
    ],
  },
  {
    id: "discounts",
    anchor: "discounts",
    label: "Volume Discounts",
    jumpLabel: "Discounts",
    brief: "Relationship economics that stay true as matters close.",
    title: "Volume promises that match the books.",
    description:
      "Strategic clients expect tiers. Finance expects truth. Lysp keeps both on the same number as matters close, so BD never sells a discount finance cannot recognize.",
    outcomes: [
      {
        n: "01",
        title: "Tiers live on the relationship",
        body: "Bands and percentages are set once. They do not get reinvented in a pitch deck every quarter.",
      },
      {
        n: "02",
        title: "Progress moves with closed work",
        body: "YTD spend and savings update when matters finish. No catch-up spreadsheet at quarter end.",
      },
      {
        n: "03",
        title: "Clients see the same truth",
        body: "Distance to the next tier is visible in the portal. The conversation stays commercial, not forensic.",
      },
      {
        n: "04",
        title: "Why it matters",
        body: "Broken volume math burns trust twice: once with the client, once with finance. Accurate tiers protect both.",
      },
    ],
  },
  {
    id: "analytics",
    anchor: "analytics",
    label: "Pricing Analytics",
    jumpLabel: "Analytics",
    brief: "Where the firm wins fees, and where it leaks them.",
    title: "See leakage before the write-down.",
    description:
      "Pricing committees should not run on anecdotes. Lysp puts win rate, margin, and realization where leaders can act, practice by practice, before soft pricing becomes a pattern.",
    outcomes: [
      {
        n: "01",
        title: "The firm number is visible",
        body: "Win rate, margin, and realization for the period you care about, without waiting for a deck.",
      },
      {
        n: "02",
        title: "Desks that need attention surface",
        body: "Watch and alert statuses show which practices are underpricing or giving away realization.",
      },
      {
        n: "03",
        title: "The committee gets evidence",
        body: "Drill from the rollup to the matters that moved the number. Decisions stop being stories.",
      },
      {
        n: "04",
        title: "Why it matters",
        body: "Elite firms do not lose money in one dramatic deal. They lose it in quiet patterns. This is how you see the pattern in time.",
      },
    ],
  },
];

export const PRODUCT_ROLES = [
  {
    role: "Pricing & finance",
    body: "Hold the floor before the fee leaves. See realization while there is still time to act.",
  },
  {
    role: "Partners & BD",
    body: "Price from firm history in the moment. Negotiate without losing the trail.",
  },
  {
    role: "Practice leaders",
    body: "Compare desks. Catch leakage early, not in next year’s write-off review.",
  },
  {
    role: "Clients",
    body: "Receive fees, counter cleanly, and track volume savings without PDF tennis.",
  },
] as const;
