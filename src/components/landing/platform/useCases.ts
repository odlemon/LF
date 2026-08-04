export type UseCaseId = "flow" | "negotiation" | "discounts" | "analytics";

export type UseCase = {
  id: UseCaseId;
  label: string;
  brief: string;
  title: string;
  description: string;
  outcome: string;
  features: string[];
};

export const USE_CASES: UseCase[] = [
  {
    id: "flow",
    label: "Scope → Price → Propose",
    brief: "One conversation becomes a scoped, priced, ready-to-send proposal.",
    title: "From RFP to client-ready proposal - one continuous flow.",
    description:
      "Describe the matter, attach the RFP, and talk it through. Lysp builds the scope, recommends fees from your firm’s own history, and generates a branded proposal - no forms, no spreadsheets, no handoffs.",
    outcome: "Hours of pricing work compressed into a single guided session.",
    features: [
      "AI matter scoping from RFP, email, or conversation",
      "Phase plans with hours, staffing mix, and fee allocation",
      "Fee recommendations grounded in your comparable matters",
      "Margin and realization guardrails before you send",
      "Branded proposals generated from approved scope",
      "OCG and rate-card checks inline - not after the fact",
    ],
  },
  {
    id: "negotiation",
    label: "Rate Negotiation",
    brief: "Clients counter and accept in a dedicated portal - every round tracked.",
    title: "Negotiate rates without the email chain.",
    description:
      "Clients receive proposals, submit counter-offers, and accept rates through a dedicated portal. Every round is attributable. Partners and pricing stay in control.",
    outcome: "Full audit trail from first offer to accepted fee.",
    features: [
      "Client portal for counters, comments, and acceptance",
      "Round-by-round negotiation log with timestamps",
      "Partner and finance approval gates on margin floors",
      "Attributable actions - who countered, who approved",
      "No side-channel rate deals buried in email",
      "Revised offers shared instantly back to the client",
    ],
  },
  {
    id: "discounts",
    label: "Volume Discounts",
    brief: "Automatic tier tracking across the client relationship.",
    title: "Volume discounts that run themselves.",
    description:
      "Tier progress updates as matters close. Clients see savings in real time. Your team stops rebuilding discount math in spreadsheets.",
    outcome: "Relationship economics that stay accurate without manual rebuilds.",
    features: [
      "Automatic YTD spend and tier progression",
      "Configurable volume bands per client relationship",
      "Live client-visible savings in the portal",
      "Matters counted as they close - not quarter-end catch-up",
      "Clear distance-to-next-tier for BD conversations",
      "Consistent application across practices and offices",
    ],
  },
  {
    id: "analytics",
    label: "Pricing Analytics",
    brief: "Win rates, margins, and benchmarks across every practice.",
    title: "Firm-wide pricing intelligence, finally visible.",
    description:
      "Win rates, margin trends, rate benchmarks, and anomaly detection - across practice areas and client types. See where pricing is winning and where it’s leaking.",
    outcome: "Leadership sees leakage and wins before they compound.",
    features: [
      "Win rate, margin, and realization by practice",
      "Trend views against peer and internal benchmarks",
      "Anomaly flags on underpricing and write-off risk",
      "Filters by practice, client type, and period",
      "Exportable digests for pricing committees",
      "Matter-level drill-down from firm rollups",
    ],
  },
];

export const PRODUCT_ROLES = [
  {
    role: "Pricing & finance",
    body: "Set guardrails, approve exceptions, and see realization before the fee leaves the building.",
  },
  {
    role: "Partners & BD",
    body: "Price from firm history in the moment - then negotiate with a clean audit trail.",
  },
  {
    role: "Practice leaders",
    body: "Compare win rates and margins across desks. Spot leakage early.",
  },
  {
    role: "Clients",
    body: "Receive proposals, counter rates, and track volume savings in one portal.",
  },
] as const;

export const PRODUCT_FOUNDATIONS = [
  {
    title: "Your matter history",
    body: "Comparable fees, staffing, write-offs, and outcomes - the basis for every recommendation.",
  },
  {
    title: "Rate cards & OCGs",
    body: "Approved rates and outside counsel guidelines enforced before a proposal is sent.",
  },
  {
    title: "Billing & PMS",
    body: "Connect the systems where hours and invoices already live so pricing stays grounded.",
  },
  {
    title: "Ethical walls",
    body: "Restricted pricing content stays behind your firm’s existing wall policies.",
  },
] as const;
