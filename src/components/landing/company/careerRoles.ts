export type CareerRole = {
  slug: string;
  title: string;
  team: string;
  employmentType: string;
  summary: string;
  overview: string;
  applicationQuestion: string;
  applicationPlaceholder: string;
  responsibilities: string[];
  qualifications: string[];
  facts?: { label: string; value: string }[];
  companyOverview?: string;
  customers?: string[];
  niceToHave?: string[];
  reasonsToJoin?: { title: string; description: string }[];
  interviewProcess?: { title: string; description: string }[];
};

export const CAREER_ROLES: CareerRole[] = [
  {
    slug: "founding-engineer",
    title: "Founding Engineer",
    team: "Product and Engineering",
    employmentType: "Full time",
    summary:
      "Build the backend systems and cloud infrastructure behind Lysp's legal pricing intelligence platform with our founders and customers.",
    overview:
      "As an early engineer, you will own backend features from design through delivery. You will build dependable services, connect them to Lysp's AI systems, and work directly with the people using the product.",
    applicationQuestion:
      "What have you shipped? Tell us what you built, what you owned, and what happened after people started using it.",
    applicationPlaceholder:
      "Choose one product or feature. Explain your contribution and its impact.",
    responsibilities: [
      "Build backend systems and cloud infrastructure, including workflows that use language models and agentic tools. Orchestrate calls to Lysp's AI systems through robust, well structured services.",
      "Add useful logging, metrics, and tracing so services are observable, debuggable, and ready for on call ownership.",
      "Take integrations and product changes from implementation through testing and release.",
      "Work with law firm customers and the founders to understand workflows, clarify requirements, and turn customer needs into engineering work.",
      "Join code reviews, technical design discussions, and an on call rotation for the services you own.",
      "Explain technical decisions clearly and keep customers and teammates informed about progress and blockers.",
    ],
    qualifications: [
      "Five or more years building and operating production web applications.",
      "Strong understanding of API design, authentication and authorization, background jobs, and robust error handling.",
      "Experience taking a defined feature or project through implementation and delivery. Be ready to explain what you built, the decisions you made, and the outcome.",
      "Experience implementing LLM features, including orchestration, memory or state management, tool use, and evaluation in production workflows.",
      "Clear communication with customers, engineers, and people without a technical background.",
      "Curiosity about the problem behind a request and an interest in improving the product from user feedback.",
      "Accountability, openness to feedback, and comfort surfacing blockers early as your scope grows.",
      "Adaptability across technologies and an interest in learning unfamiliar systems quickly.",
    ],
    facts: [
      { label: "Base salary", value: "$110,000 to $125,000 per year, plus bonus" },
      { label: "Equity", value: "0.05% to 0.35%" },
      { label: "Location", value: "Remote and location flexible" },
      {
        label: "In person",
        value: "Meet with the founders in New York City for three days each month. Remote on all other days",
      },
      {
        label: "Monthly visit expenses",
        value: "Transport, accommodation, and meals for the three monthly in person days are covered",
      },
      {
        label: "Work authorization",
        value: "Must be authorized to work in the U.S. Lysp does not sponsor visas.",
      },
      { label: "Technology", value: "Java, Postgres, Azure, and LLM systems" },
      { label: "Benefits", value: "Medical coverage and 401(k) benefits" },
    ],
    companyOverview:
      "Lysp is building legal pricing intelligence software for law firms. The platform helps teams scope legal work, price matters, approve fees, negotiate with clients, and understand financial outcomes. More than 15 law firms across the US and UK trust Lysp, including:",
    customers: [
      "Reed Smith",
      "Dentons",
      "BakerHostetler",
      "Cullen and Dykman LLP",
      "DLA Piper",
    ],
    niceToHave: [
      "Experience building B2B software for larger organizations in a fast moving team.",
      "Experience working directly with customers or alongside product teams to understand user needs.",
      "Familiarity with integrations and data flows across systems.",
      "TypeScript experience. Lysp uses it extensively, and we welcome strong engineers from other stacks.",
      "Practical experience using AI tools to build software or improve a workflow.",
    ],
    reasonsToJoin: [
      {
        title: "Growth",
        description:
          "As an early member of the team, you will shape your role and help build the core infrastructure behind Lysp.",
      },
      {
        title: "Impact",
        description:
          "We focus on measurable returns for law firm customers. Our product supports core pricing work, and engineers help shape technical and product decisions across a growing set of products.",
      },
    ],
    interviewProcess: [
      {
        title: "Conversation with one of the co-founders (30 minutes)",
        description: "Get to know each other, discuss what you want to build, and learn about Lysp and the role.",
      },
      {
        title: "Technical session (2 hours)",
        description: "A combined discussion and working session covering systems design, Azure and cloud architecture, product design, LLM orchestration and memory, and a practical debugging scenario.",
      },
      {
        title: "Paid practical task (a few hours, with up to 24 hours to complete)",
        description: "Complete a small, clearly scoped feature or debugging task. We will agree the scope and timing with you in advance, and Lysp will pay you for the work.",
      },
    ],
  },
  {
    slug: "enterprise-account-executive",
    title: "Enterprise Account Executive",
    team: "Sales",
    employmentType: "Full time",
    summary:
      "Help leading law firms understand the commercial value of Lysp and guide complex sales from the first conversation through a signed agreement.",
    overview:
      "You will own the full sales cycle with law firm customers, working directly with partners, pricing leaders, and firm executives. The role combines targeted prospecting, consultative discovery, product demonstrations, commercial proposals, and negotiation.",
    applicationQuestion:
      "Tell us about the most complex enterprise software sale you led. Who was involved, what did you own, and what was the outcome?",
    applicationPlaceholder:
      "Describe the customer, sales cycle, your role, and the result.",
    responsibilities: [
      "Build and manage a pipeline of law firm opportunities through targeted outreach, referrals, and industry events.",
      "Lead discovery with partners, pricing teams, finance leaders, and firm executives to understand commercial workflows.",
      "Run tailored product demonstrations and build a clear business case around each firm's goals.",
      "Guide multi stakeholder sales cycles from qualification through proposal, security and procurement reviews, negotiation, and close.",
      "Keep opportunity records, forecasts, and next steps current in Lysp's CRM.",
      "Work with the founders, product, and implementation teams to onboard new customers and identify opportunities to expand adoption.",
      "Spend three days each week at customer offices and two days working remotely.",
    ],
    qualifications: [
      "Five or more years of B2B software sales experience, including at least three years closing enterprise accounts.",
      "A record of meeting sales targets and managing long, multi stakeholder sales cycles.",
      "Experience selling to senior leaders, partners, or finance and operations executives.",
      "Strong discovery, presentation, business case development, negotiation, and closing skills.",
      "Comfort building pipeline through outbound prospecting and managing opportunities independently.",
      "Clear communication, reliable follow through, and disciplined CRM forecasting.",
      "Willingness to travel regularly to customer offices.",
    ],
    facts: [
      { label: "Base salary", value: "$85,000 to $100,000 per year" },
      {
        label: "On target earnings",
        value: "$170,000 to $200,000 per year, including base and commission",
      },
      { label: "Equity", value: "0.10% to 0.20%" },
      {
        label: "Work arrangement",
        value: "Three days each week at customer offices and two days remote",
      },
      {
        label: "Work authorization",
        value: "Must be authorized to work in the U.S. Lysp does not sponsor visas.",
      },
      { label: "Benefits", value: "Medical coverage and 401(k) benefits" },
    ],
    companyOverview:
      "Lysp is building legal pricing intelligence software for law firms. The platform helps teams scope legal work, price matters, approve fees, negotiate with clients, and understand financial outcomes. More than 15 law firms across the US and UK trust Lysp, including:",
    customers: [
      "Reed Smith",
      "Dentons",
      "BakerHostetler",
      "Cullen and Dykman LLP",
      "DLA Piper",
    ],
    niceToHave: [
      "Experience selling legal technology, professional services software, or workflow products.",
      "Familiarity with Salesforce, HubSpot, or a similar CRM.",
      "Experience working with product and implementation teams to improve customer adoption.",
    ],
    reasonsToJoin: [
      {
        title: "Growth",
        description:
          "Help shape how Lysp grows with law firms and build a repeatable enterprise sales motion.",
      },
      {
        title: "Impact",
        description:
          "Work directly with firms on pricing decisions that affect client relationships, matter margins, and revenue predictability.",
      },
    ],
    interviewProcess: [
      {
        title: "Introductory conversation",
        description: "Meet with a founder to discuss your experience, the role, and what you are looking for.",
      },
      {
        title: "Enterprise sales discussion",
        description: "Walk through complex deals you have led, how you build pipeline, and how you manage a multi stakeholder sale.",
      },
      {
        title: "Customer scenario",
        description: "Practice a discovery conversation and explain how you would introduce Lysp to a law firm.",
      },
      {
        title: "Final conversation",
        description: "Meet with the team to discuss customer visits, targets, compensation, and next steps.",
      },
    ],
  },
];

export function getCareerRole(slug: string) {
  return CAREER_ROLES.find((role) => role.slug === slug);
}
