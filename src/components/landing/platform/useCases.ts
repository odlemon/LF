export type UseCaseId = "flow" | "negotiation" | "discounts" | "analytics";

export type UseCase = {
  id: UseCaseId;
  label: string;
  brief: string;
  title: string;
  description: string;
};

export const USE_CASES: UseCase[] = [
  {
    id: "flow",
    label: "Scope → Price → Propose",
    brief: "One conversation becomes a scoped, priced, ready-to-send proposal.",
    title: "From RFP to client-ready proposal - one continuous flow.",
    description:
      "Describe the matter, attach the RFP, and talk it through. Lysp builds the scope, recommends fees from your firm’s own history, and generates a branded proposal - no forms, no spreadsheets, no handoffs.",
  },
  {
    id: "negotiation",
    label: "Rate Negotiation",
    brief: "Clients counter and accept in a dedicated portal - every round tracked.",
    title: "Negotiate rates without the email chain.",
    description:
      "Clients receive proposals, submit counter-offers, and accept rates through a dedicated portal. Every round is attributable. Partners and pricing stay in control.",
  },
  {
    id: "discounts",
    label: "Volume Discounts",
    brief: "Automatic tier tracking across the client relationship.",
    title: "Volume discounts that run themselves.",
    description:
      "Tier progress updates as matters close. Clients see savings in real time. Your team stops rebuilding discount math in spreadsheets.",
  },
  {
    id: "analytics",
    label: "Pricing Analytics",
    brief: "Win rates, margins, and benchmarks across every practice.",
    title: "Firm-wide pricing intelligence, finally visible.",
    description:
      "Win rates, margin trends, rate benchmarks, and anomaly detection - across practice areas and client types. See where pricing is winning and where it’s leaking.",
  },
];
