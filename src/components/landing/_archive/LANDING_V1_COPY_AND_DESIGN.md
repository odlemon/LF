# Lysp Landing Page — V1 Snapshot

Archived before Legora-style hero redesign.  
Source components (full React): `_archive/components/`.  
Live components still live in `src/components/landing/`.

---

## Design system

### Typography
- **Font:** Quicksand (Google Font) — weights 400, 500, 600, 700
- Applied via `(landing)/layout.tsx` on the page wrapper
- Body: `antialiased`, layout bg `bg-gray-100`, page stack `bg-white`

### Brand colors
| Token / usage | Value |
|---|---|
| Primary (CSS `--color-primary`) | `#00CC76` |
| CTA / emerald accents | `emerald-500` / `emerald-600` / `emerald-700` |
| Headlines | `gray-900` |
| Body text | `gray-600` |
| Muted / kickers | `gray-400`–`gray-500`, emerald kickers |
| Dark section (outcomes) | `bg-gray-900`, text white / `gray-300` |
| Danger metrics | `red-600` / amber warnings |

### Layout patterns
- Section padding: `py-20 sm:py-24` (pricing/FAQ often `py-24 sm:py-28`)
- Content max-widths: `max-w-6xl` (most), `max-w-7xl` (workflow), `max-w-5xl` (FAQ)
- Horizontal padding: `px-4 sm:px-6` (+ `lg:px-12` in hero)
- Kickers: `text-xs font-semibold uppercase tracking-[0.28em|0.3em] text-emerald-600`
- Soft cards: large radius (`rounded-[24px]`–`rounded-[28px]`), light borders, soft slate shadows
- Mock UI windows: traffic-light dots, browser chrome, `select-none`

### Motion / UX
- Hero mock: 3D tilt on desktop (`perspective` + `rotateX/Y`), disabled `<1024px`
- Navbar: fixed floating pill, shrinks on scroll
- FAQ accordion, pricing toggles, workflow fee-model tabs
- Toast: slide-in-right, auto-dismiss 5s
- CSS animations in `globals.css`: `fade-in`, `fade-in-up`, `slide-in-right`

### CTAs (shared)
- Primary: emerald fill, white text, arrow icon → `/auth` (“Request a Demo”)
- Secondary: emerald outline → `/client-login` or `#pricing` (“Run a Live Trial”)
- Nav: “Sign In” → `/auth`

### Metadata
- Title: `Lysp — Enterprise Pricing Intelligence for Law Firms`
- Description: `Consolidate billing, rate, and matter data to deliver consistent, realization-improving pricing models.`

### Page composition order
1. HeroSection (+ HeroNavbar)
2. PainSection
3. WorkflowSection
4. KnowledgeComplianceSection
5. IntegrationsCTASection
6. PricingSection
7. FAQSection
8. FooterSection (+ Toast)

---

## 1. Navbar (`HeroNavbar.tsx`)

**Brand:** Lysp (green “L” mark + wordmark)

**Links:** Workflow · Pricing · Integrations · FAQ · Contact  
**CTA:** Sign In

---

## 2. Hero (`HeroSection.tsx`)

**Headline**
- Line 1: Pricing Intelligence
- Line 2 (primary green): Built for Law Firms

**Subcopy**  
Lysp consolidates billing, rate, and matter data to deliver consistent pricing models that improve realization and revenue predictability.

**CTAs**  
Request a Demo · Run a Live Trial

**Partner strip**  
Label: Works well with your existing tech stack  
Partners: Thomson Reuters, NetDocuments, QuickBooks, Salesforce, iManage, Clio  
Note: We integrate and sync data automatically which keeps matters updated everywhere.

**Mock workspace UI**
- URL chrome: `lysp.io/workspace`
- Matter Pricing — Harrison & Clarke LLP
- Badge: +9.4% Uplift
- Realization Rate: 92.4%
- Estimated Value: $450,000
- Recommended Playbook: Fixed Fee Structure Approved

**Layout note:** Split hero — copy left (~50%), tilted product mock right (~50%). White background, min-h-screen.

---

## 3. Pain (`PainSection.tsx`)

**Kicker:** The bottleneck we solve

**Headline**  
Pricing teams are stretched while demand for creative fee models keeps rising

**Subcopy**  
Lysp gives lawyers a guided path to compliant fee structures in minutes so commercial teams stop being the chokepoint and margins stay protected.

**Pipeline mock**
- Title: Active Intake Pipeline
- Badge: 4 Requests Delayed
- Card 1: Acquisition Proposal — Aderant Partners — $45M deal risk / Bypassed review
- Card 2: Fixed Fee Validation — Clio Integration — Stalled 4.2 days / Waiting on BDM

### Pain cards

**1. Non-compliant pricing slips through**  
Lawyers improvise fee structures when pricing teams are overloaded, creating margin risk and downstream write offs.  
Metrics: Bypass Pricing 68% · Avg Write-off Exposure $58k  
Impact: Margin Leakage −4.2% · Write-off Reduction −12%

**2. Pricing requests stall in queues**  
Commercial teams can't respond fast enough, leading to delayed deals and lower partner satisfaction.  
Metrics: Avg Queue Time 8.2 Days · Cost of Delay $125k  
Impact: Win Rate Loss −18% · Review Backlog +30%

**3. No guardrails at the point of need**  
Outside counsel guidelines and rate rules live in documents, meaning compliance is checked manually and late in the billing cycle.  
Metrics: OCG Compliance Gaps 34% · Manual Reviews Needed 41%  
Impact: Billing Rejections +22% · Cycle Delay +14 Days

---

## 4. Workflow (`WorkflowSection.tsx`)

**Kicker:** How lysp fits your workflow  
**Headline:** How legal teams use Lysp  
**Subcopy:** No more back-and-forth tickets. Lysp guides lawyers through the firm-approved playbook while giving pricing teams full visibility and control.

### Step 1 — Capture matter context
- Structured prompts gather matter scope, deal size, risk, and client expectations...
- Lysp preloads similar matters and firm policy guidance...
- Pricing directors see the same briefing draft inside Lysp...

### Step 2 — Compare pricing structures
- Compare multiple options based on firm realization historic targets.
- Assess margins under different client discount or success scenario models.
- Select the recommended fee playbook that aligns with firm realization goals.

**Fee tabs copy**
- Fixed Fee Structure — $450,000 — 87% Confidence — Low matter variation / Scope creep terms needed
- Standard Blended Hourly — $425 / Hour
- Success-Based Contingency — $75k + 20% Success
- Capped Hourly with Collar — $520,000 Max Cap

### Step 3 — Generate client-ready proposals
- Lysp produces proposals with approved structures...
- Partners see discount logic, FX guardrails, and margin alerts side by side...
- Clients receive proposals with optional client portal login...

**Proposal mock:** FutureLink Acquisition Proposal · Fixed Fee Plan · Ready to Send · $450,000 · 6–12 Months · Medium Risk

### After the proposal — Client intelligence & rate control
Consolidate rate agreements and active workflows into a live control panel. Ingest invoices, track active matter status, and apply correct volume tier rules automatically.

Callout: The platform ingests invoices, normalizes FX currencies, and auto-applies volume discounts to historical invoices.

Bullets:
- Direct API ingestion of matters and invoice history
- Synchronized rate sheet negotiation approvals
- Auto-push to client-ready templates and BI reports

---

## 5. Outcomes / Knowledge (`KnowledgeComplianceSection.tsx`)

**Theme:** Dark section (`bg-gray-900`)

**Badge:** What firms report  
**Headline:** Lysp turns pricing into a controllable, data-backed process  
**Subcopy:** Early adopters of Lysp achieve consistent realization rates, eliminate compliance leakage, and automate coordination with Clio, Intapp, Elite, and Aderant.

| Card | Metric | Description |
|---|---|---|
| Pricing turnaround | 62% faster responses | Matter teams generate partner-ready pricing scenarios without waiting for manual spreadsheet approvals. |
| Matter profitability | +9.4% uplift | Blended realization improves as compliance leaks are blocked and guardrails are applied during intake. |
| Client profitability insight | 15% clearer forecast | Volume tiers, negotiated rate agreements, and FX factors are fully normalized in real-time. |

Footer note: Outcomes measured across connected billing, practice management, and rate systems

---

## 6. Integrations CTA (`IntegrationsCTASection.tsx`)

**Headline:** Leave the integration workload with us and go live faster  
**Subcopy:** Lysp pulls historic matters, invoices, rate agreements, and client guidelines directly from your database, keeping all files in sync automatically.

**Integrations**
| Name | Description |
|---|---|
| Clio | Matter history and phase plans |
| QuickBooks | Billing actuals, budgeting, AR status |
| Aderant | Financial performance, WIP, and rate tables |
| Intapp | Pricing approvals, rate requests, compliance events |
| Salesforce | Client intelligence and pipeline health |
| Thomson Reuters | Rate benchmarks and guidance |

**Data control:** You control your data — Lysp never trains AI on your internal billing, rate negotiations, or OCG compliance guidelines.

---

## 7. Pricing (`PricingSection.tsx`)

**Headline:** Let the platform scale with the matters you close  
**Subcopy:** A predictable platform fee covers your pricing, finance, and client teams, with optional usage bundles.

### Base plan
- Seat-Based Base Subscription — ~$299/seat/mo (10-seat min) · Annual ~$265/seat (−11%)
- Features: Unlimited pricing proposals · Live Clio & billing integration · Custom OCG · Unlimited client viewer portals · Weekly compliance audit digests
- Allowances: 5 concurrent client proposal briefs · 3 multi-scenario rate models · 2 custom client volume discounts · 1 global firm practice area card
- Constraints: Max 10 users in base plan · API rate limited · Standard email support

### Usage credits
- $28 / credit
- Approved proposal: 3 · Bulk scenarios: 5 · Rate negotiation approval: 10 · Invoice audit: 1 per 12 · Value optimization: 1 per $5K saved
- Bundles: Mid 120/$3,360 · National 300/$8,100 · Global 600/$15,600

### Snapshots
| Firm | Spend | ROI highlights |
|---|---|---|
| Boutique | $2,990/mo · $31,800/yr | 1.5h turnaround · +4.2% realization · $32k write-offs blocked |
| Growing | $6,228/mo · $65,736/yr | −70% backlog · +9.4% realization · $145k OCG recovered |
| Large | $17,433/mo · $182,784/yr | 14h/week saved · Auto volume tiers · $650k leakage blocked |

---

## 8. FAQ (`FAQSection.tsx`)

**Kicker:** Answers for pricing teams  
**Headline:** Frequently asked questions  
**Subcopy:** Everything legal finance, pricing, and partner teams ask when getting started with Lysp.

1. **How does Lysp pull historic pricing data?**  
   Lysp syncs with Clio, QuickBooks, Aderant, and Intapp APIs to ingest closed matters, invoice line items, and past rate sheets without manual exports.

2. **What activities are included in the base seat plan?**  
   Our base plan includes unlimited proposal generation, client portal accesses, template adjustments, and OCG guardrail evaluations for up to 10 users.

3. **How do usage credits work?**  
   Credits cover resource-intensive events such as scenario models, volume discount updates, or foreign currency normalizations, starting at $28/credit.

4. **How quickly can Lysp be deployed?**  
   For standard integrations like Clio and QuickBooks, live synchronization takes under 48 hours. Custom legacy systems complete in 14 days.

5. **What safeguards protect client and firm pricing data?**  
   We run on secure enterprise-grade cloud environments. Your OCG definitions and margins are isolated, and we never train AI models on your data.

6. **Can partners review and edit proposals?**  
   Yes, partners have full editing rights to adjust rates, override guidelines with explanations, or configure specific client portals.

---

## 9. Footer (`FooterSection.tsx`)

**Kicker:** Built for pricing and finance teams  
**Headline:** Run pricing, proposals, and renewals on one workspace  
**Subcopy:** Lysp helps law firms replace manual, reactive processes with clear, automated control sheets. Keep realization predictable and coordinate seamlessly with your client portals.

**Contact**
- nyasha@lysp.io
- +1 (415) 555-0198
- LinkedIn: https://www.linkedin.com/company/lyspio

**Newsletter:** Stay current — Get bi-weekly updates on legal pricing benchmarks and guidelines direct to your inbox.

**Legal links:** Privacy Policy · Terms of Service · Security Standards  
**Copyright:** © {year} Lysp. Pricing intelligence for legal teams.

---

## Component file map

| Live path | Archive snapshot |
|---|---|
| `src/components/landing/HeroSection.tsx` | `_archive/components/HeroSection.tsx` |
| `src/components/landing/HeroNavbar.tsx` | `_archive/components/HeroNavbar.tsx` |
| `src/components/landing/PainSection.tsx` | `_archive/components/PainSection.tsx` |
| `src/components/landing/WorkflowSection.tsx` | `_archive/components/WorkflowSection.tsx` |
| `src/components/landing/KnowledgeComplianceSection.tsx` | `_archive/components/KnowledgeComplianceSection.tsx` |
| `src/components/landing/IntegrationsCTASection.tsx` | `_archive/components/IntegrationsCTASection.tsx` |
| `src/components/landing/PricingSection.tsx` | `_archive/components/PricingSection.tsx` |
| `src/components/landing/FAQSection.tsx` | `_archive/components/FAQSection.tsx` |
| `src/components/landing/FooterSection.tsx` | `_archive/components/FooterSection.tsx` |
| `src/components/landing/Toast.tsx` | `_archive/components/Toast.tsx` |
| `src/app/(landing)/page.tsx` | `_archive/components/landing-page.tsx` |
| `src/app/(landing)/layout.tsx` | `_archive/components/landing-layout.tsx` |

---

## Restore notes

To restore a section, copy from `_archive/components/` back over the live file (or import patterns from there).  
Copy/design tokens above are the source of truth for messaging if components diverge after redesign.
