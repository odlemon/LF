/** Firm-wide overview demo data for the dashboard. Deep cuts live under Analytics later. */

export type OverviewKpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  caption: string;
};

export type TrendPoint = {
  month: string;
  feesWon: number;
  pipeline: number;
  marginPct: number;
  winRate: number;
};

export type StagePoint = {
  stage: string;
  count: number;
  value: number;
};

export type PracticePoint = {
  name: string;
  fees: number;
  matters: number;
};

export type LiveMatter = {
  id: string;
  title: string;
  client: string;
  stage: string;
  value: string;
  owner: string;
  updated: string;
};

export const FIRM_OVERVIEW = {
  firmName: "Ashworth Meridian LLP",
  asOf: "Live overview · demo data",
  kpis: [
    {
      id: "won",
      label: "Fees won (YTD)",
      value: "£12.4M",
      delta: "+18.2%",
      positive: true,
      caption: "Accepted preferred scenarios",
    },
    {
      id: "pipeline",
      label: "Active pipeline",
      value: "£6.1M",
      delta: "42 matters",
      positive: true,
      caption: "Intake → partner review",
    },
    {
      id: "margin",
      label: "Avg. won margin",
      value: "34.8%",
      delta: "+2.1 pts",
      positive: true,
      caption: "Above 20% firm floor",
    },
    {
      id: "win",
      label: "Win rate",
      value: "74%",
      delta: "+6 pts",
      positive: true,
      caption: "Closed proposals this year",
    },
    {
      id: "protect",
      label: "Margin protected",
      value: "£1.9M",
      delta: "61 blocks",
      positive: true,
      caption: "Guardrails stopped underpricing",
    },
    {
      id: "cycle",
      label: "Avg. cycle",
      value: "4.8d",
      delta: "−1.2d",
      positive: true,
      caption: "Intake confirm → partner decision",
    },
  ] satisfies OverviewKpi[],

  /** Monthly commercial trend — hoverable line/area charts */
  trend: [
    { month: "Jan", feesWon: 820, pipeline: 4100, marginPct: 31.2, winRate: 66 },
    { month: "Feb", feesWon: 910, pipeline: 4350, marginPct: 32.0, winRate: 68 },
    { month: "Mar", feesWon: 1040, pipeline: 4580, marginPct: 32.8, winRate: 70 },
    { month: "Apr", feesWon: 1180, pipeline: 4920, marginPct: 33.1, winRate: 71 },
    { month: "May", feesWon: 1090, pipeline: 5100, marginPct: 33.5, winRate: 69 },
    { month: "Jun", feesWon: 1320, pipeline: 5450, marginPct: 34.0, winRate: 73 },
    { month: "Jul", feesWon: 1410, pipeline: 5720, marginPct: 34.4, winRate: 75 },
    { month: "Aug", feesWon: 1580, pipeline: 6100, marginPct: 34.8, winRate: 74 },
  ] satisfies TrendPoint[],

  /** Where work sits across the firm right now */
  stages: [
    { stage: "Intake", count: 9, value: 820 },
    { stage: "Scope locked", count: 7, value: 1100 },
    { stage: "Pricing", count: 8, value: 1450 },
    { stage: "Partner", count: 5, value: 980 },
    { stage: "Client", count: 6, value: 1250 },
    { stage: "Won", count: 27, value: 4280 },
  ] satisfies StagePoint[],

  /** Practice mix of won fees YTD (£000s) */
  practices: [
    { name: "Corporate", fees: 4200, matters: 18 },
    { name: "Litigation", fees: 2800, matters: 22 },
    { name: "Employment", fees: 1650, matters: 31 },
    { name: "Funds", fees: 2400, matters: 9 },
    { name: "Real estate", fees: 1350, matters: 14 },
  ] satisfies PracticePoint[],

  liveMatters: [
    {
      id: "m1",
      title: "Northbridge acquisition diligence",
      client: "Northbridge Capital",
      stage: "Partner review",
      value: "£185k",
      owner: "V. Ashworth",
      updated: "12m ago",
    },
    {
      id: "m2",
      title: "Helix Bio Series B employment",
      client: "Helix Bio",
      stage: "Returned",
      value: "£42k",
      owner: "J. Okonkwo",
      updated: "1h ago",
    },
    {
      id: "m3",
      title: "Meridian cross-border JV",
      client: "Meridian Holdings",
      stage: "Pricing",
      value: "£96k",
      owner: "P. Shah",
      updated: "3h ago",
    },
    {
      id: "m4",
      title: "Ashworth PE fund formation",
      client: "Ashworth PE",
      stage: "Client negotiation",
      value: "£310k",
      owner: "V. Ashworth",
      updated: "Yesterday",
    },
    {
      id: "m5",
      title: "Privilege review — data room",
      client: "Northbridge Capital",
      stage: "Intake",
      value: "£28k",
      owner: "A. Chen",
      updated: "Yesterday",
    },
  ] satisfies LiveMatter[],

  snapshot: {
    openRequests: 42,
    awaitingPartner: 5,
    scenariosThisWeek: 23,
    approvalsThisWeek: 11,
    firstPassAccept: "62%",
    compsUsed: 218,
  },
};
