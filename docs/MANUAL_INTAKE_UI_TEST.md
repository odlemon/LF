# Manual UI test — Pricing request intake (Ashworth Meridian demo)

## Before you start

1. Backend running on `http://localhost:8080`
2. Frontend running on `http://localhost:3000`
3. DeepSeek (or another AI provider) already configured and **active** under Settings → AI Config

---

## Step 1 — Log in

1. Open `http://localhost:3000/auth`
2. Email: `admin@lysp.io`
3. Password: `admin123` 
4. Sign in

You land in the firm app (sidebar on the left).

---

## Step 2 — Open Pricing Requests

1. In the left sidebar, click **Pricing Requests**
2. You should see the list page at `/pricing-requests`

---

## Step 3 — Create a pricing request

1. Click **New Request** (top right)
2. In the modal, fill exactly:

| Field | Enter |
|--------|--------|
| Client | Search and select **Helix Therapeutics plc** |
| Title | `Project Helix follow-on SPA` |
| Practice Area | **Corporate / M&A** |

3. Click **Create** (or the primary submit button on the modal)

You are taken to the request workspace: chat on one side, scope panel on the other.

---

## Step 4 — Chat: verify RAG (historical data)

In the chat box, paste this message and send:

```
We are scoping a UK public takeover for Helix Therapeutics similar to Project Meridian. Please look at our past M&A matters and summarise what comparable scopes looked like before we build phases.
```

**What you should see**

- Streaming / typing from the agent
- Mentions of **Project Meridian** (and likely fee ~£1.85m, hours ~2,140)
- Possibly other COR_MA comparables (Harbour, Cipher, etc.)
- Tool activity labels such as searching historical matters / loading benchmarks (if shown in the UI)

If the agent answers with generic advice and never references Meridian or firm history, RAG is not working.

---

## Step 5 — Chat: generate the scope

Paste and send:

```
Please generate an initial scope now for this Helix public takeover. Use fee earner codes EQ_PARTNER, SR_ASSOC, ASSOC. Include 2 phases: (1) Bid preparation and announcements (2) SPA and disclosure. Keep each phase to 2 tasks with realistic hours grounded in Project Meridian. Add one EXCLUDED assumption about regulatory Phase 2. Call generate_scope now.
```

**What you should see**

- Tool activity for generating scope
- Right-hand **scope panel** fills with 2 phases and tasks
- Chat mode / badge moves toward scoping or scope generated
- Hours should look grounded (partner / SA / associate mix), not random tiny numbers

---

## Step 6 — Confirm the scope

1. When the scope is generated and the UI shows a confirm action, click **Confirm Scope** (header of the request workspace)
2. Toast: scope confirmed
3. You may be redirected to `/pricing-requests/{uid}/pricing` (pricing page may still say coming soon — that is expected)

4. Go back: sidebar **Pricing Requests** → open the same request again  
   Or use the browser back button to return to the intake workspace if still available

Chat mode should be **Scope Confirmed** / locked.

---

## Step 7 — Verify scope is locked (mutating tools stripped)

In chat, paste and send:

```
Please increase the EQ_PARTNER hours on the bid preparation task to 350 using update_task. Then confirm the change.
```

**What you should see**

- Agent refuses to change the scope (locked / mutating tools unavailable)
- Scope panel hours for that partner task **do not** change to 350 (they stay at whatever was generated, e.g. ~280)

---

## Step 8 — Verify read-only still works after confirm

Paste and send:

```
Without changing anything, what is the current total estimated hours and how does it compare to Project Meridian?
```

**What you should see**

- Agent answers with current total hours from the locked scope
- Still references Project Meridian as a benchmark
- Scope panel unchanged

---

## Done checklist

- [ ] Logged in as admin
- [ ] Created request for Helix + Corporate / M&A
- [ ] Agent used Project Meridian / firm history (RAG)
- [ ] Scope generated into the right panel
- [ ] Confirm Scope succeeded
- [ ] Mutate request refused; hours unchanged
- [ ] Read-only question still answered with Meridian comparison

---

## Optional: peek at seeded data first

If you want to see the firm world before intake:

| Where | What to check |
|--------|----------------|
| Settings → Firm | Ashworth Meridian LLP |
| Settings → Practice Areas | Corporate / M&A, Private Equity, etc. |
| Settings → Rate Cards | London Standard 2026 (Active) |
| Settings → Data Room | Closed Matters / time / billing datasets |
| Clients | Helix Therapeutics plc, Northbridge Capital, etc. |
