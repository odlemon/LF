# Testing Rate Negotiation + Agentic AI

How to exercise the full negotiation loop and the two live AI chats (client Rate Coach + firm Negotiation Advisor).

**Servers**

- Frontend: http://localhost:3000
- Backend: http://localhost:8080 (API under `/api`)
- Login: http://localhost:3000/auth (one screen for firm and client)

---

## Accounts

| Side | Email | Password | After login |
|---|---|---|---|
| Firm admin | `admin@lysp.io` | `admin123` | `/dashboard` |
| Firm partner | `partner@lysp.io` | `partner123` | `/approvals` |
| Client portal | `client@lysp.io` | `client123` | `/client-portal/dashboard` |

Client is linked to **Helix Therapeutics plc**. Use two browser profiles (or normal + incognito) so firm and client stay logged in side by side.

---

## What you are testing

Two **isolated conversational agents** (not hardcoded scripts):

| Side | UI | Agent knows |
|---|---|---|
| Client | Rate Coach (left pane on proposal detail) | Proposal, rounds, market benchmarks — **never** margin/cost/guardrails |
| Firm | Negotiation Advisor (on `/negotiations/[uid]`) | Rounds, margins, floor, client history, market tools |

Chat history is persisted per side. Hard-refresh should keep messages. Firm chat is invisible to the portal JWT and vice versa.

---

## A. Prep — open a live proposal

### Option 1 — Use the existing demo negotiation

1. Firm: log in → **Negotiations** → open the Helix / “test” matter (or whichever is listed).
2. Client (incognito): log in → **Proposals** → open the same matter.

If status is already `CLIENT_APPROVED`, you can still test **AI chat** and **History**. Accept / Counter buttons stay disabled until you send a fresh proposal (Option 2).

### Option 2 — Send a fresh proposal (full Accept/Counter path)

1. Firm: **Pricing Requests** → open a request → **Pricing**.
2. Preferred scenario must be `APPROVED`. If not: set preferred → submit to partner → approve as partner.
3. Footer **Send to client** → confirm Helix / `client@lysp.io` → send.
4. You land on `/negotiations/[uid]` with status `SENT`, Round 0 opening offer.

---

## B. Client portal — Rate Coach (agentic AI)

1. As `client@lysp.io`, open **Proposals** → the negotiation.
2. Left pane is **Rate Coach**. Right pane toggles **Rate card** / **History**.

### Chat smoke

1. Type a freeform message, e.g. `hi - explain this proposal briefly`.
2. You should see streaming tokens, then a finished reply grounded in *this* proposal (scope, rates, total).
3. Hard-refresh the page → prior messages reload (persisted history).
4. Try prompt chips (they send real user messages, not fake modes):
   - “How do these rates compare to market?”
   - “Suggest a measured counter and propose rates I can apply”

### What “good” looks like

- Replies are contextual (not identical every time; not a canned script).
- **No em dashes** (`—`) in AI text (hyphen `-` is fine).
- **No firm internals**: no margin %, cost basis, min margin / floor, guardrails, partner review flags.
- If the coach proposes rates, **Apply suggested rates** (when shown) fills the rate editor — you still submit the counter yourself.

### Human actions (when status is open: `SENT` or `NEGOTIATING`)

1. **Rate card** tab → review rates → optional **Edit rates** for a counter.
2. Optional note to the firm (coach can draft one into the note field).
3. **Accept rates** / **Submit counter** / **Reject** — humans always confirm.

---

## C. Firm — Negotiation Advisor (agentic AI)

1. As `admin@lysp.io`, open **Negotiations** → same `uid`.
2. Use the **Negotiation Advisor** chat panel (replaces the old one-shot “Get AI brief”).

### Chat smoke

1. Send `hi - give a one-sentence strategy note`.
2. Expect a firm-side reply that may mention margin / floor / walk-away (allowed on firm only).
3. Ask: `What's the market for Partner?`  
   - Agent should call tools (e.g. market benchmarks); reply should cite peer/median-style numbers when data exists.
4. Hard-refresh → firm history still there; portal chat must **not** show these messages.

### Apply rates + respond

1. If the advisor proposes a rate card, **Apply to rate card** → editor enters counter mode.
2. Firm choices:
   - **Accept client counter** (only when latest round is client; blocked if below margin floor).
   - **Send counter** after editing rates.
   - **Reject** / **Withdraw**.

---

## D. History timeline (both sides)

1. **Portal:** Rate card rail → **History**.
2. **Firm:** scroll to the negotiation trail on the detail page.

Expect a vertical timeline (not flat grey cards):

- Round number + action badge (Opening / Counter / Accepted / …)
- Party label (portal: Firm / You; firm: Firm / Client)
- Fee total; delta vs previous round when it changed
- Comment as a quote strip
- Firm view can show margin %; portal must not

---

## E. Isolation checklist (quick)

| Check | How |
|---|---|
| Client never sees margin in UI | Portal rate card, coach replies, history |
| Firm chat ≠ client chat | Different wording; firm may discuss margin; client must not |
| Cross-auth blocked | Portal JWT cannot load `/api/v1/negotiations/{uid}/ai/messages` |
| History per side | Refresh each browser; messages stay on that side only |
| No template AI | Same prompt twice can vary; “hi” is not a fixed keyword script |

---

## Status meanings

| Status | Meaning |
|---|---|
| `SENT` | With client, awaiting first response |
| `NEGOTIATING` | At least one counter exchanged |
| `CLIENT_APPROVED` | Agreed — closed |
| `CLIENT_REJECTED` | Client declined — closed |
| `WITHDRAWN` | Firm pulled the proposal — closed |

---

## Portal account (profile & settings)

1. As `client@lysp.io`, open any portal page — top-right shows **avatar menu** (Profile, Settings, Sign out).
2. Sidebar: click the user card, or **Account** / **Settings**.
3. **Account** — company, email, editable display name (saved via API).
4. **Settings** — theme, change password (current + new, min 8 chars), device notification prefs, Sign out.
5. If `mustChangePassword` is set, an amber banner points to Settings → Security.
6. **Realtime notifications** — bell in the top bar uses the same SSE inbox as the firm app (`/v1/me/notifications/stream`). Proposal sent / firm counter / accepted / rejected land here; toast respects Settings → Proposal alerts.


1. Two browsers: firm admin + client.
2. Open the same proposal on both.
3. Client coach: freeform “explain this” → confirm no margin, no em dashes, history survives refresh.
4. Client History tab → timeline looks right.
5. Firm advisor: “strategy note” + “market for Partner” → confirm tools/context + margin OK on firm side.
6. If negotiation is still open: client counter → firm advisor on the counter → accept or counter → timeline updates.

---

## Notes

- Volume discount tiers are not a product yet; if asked, the client agent should say no formal tier program is configured (honest stub).
- AI never submits Accept/Counter for you.
- Legacy `/ai/suggest` may still exist for compatibility; the product path is `/ai/messages/stream` via the chat UIs.
