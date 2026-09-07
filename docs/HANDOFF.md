# Lysp — New-Context Handoff

Open a fresh chat/window, then say: **"Read docs/HANDOFF.md and continue from there."**

This doc is the full state transfer. The new agent should read it plus the linked docs, then verify servers are running before doing anything else.

---

## What Was Just Built (this session)

**Rate Negotiation MVP** — the full loop from partner approval → client portal negotiation → agreed rates. All 7 todos completed and API-verified end-to-end.

### Flow
1. Partner approves a pricing scenario → `APPROVED`
2. Firm clicks **Send to client** on the pricing workspace → creates a `SENT` negotiation with Round 0 (firm opening snapshot)
3. `client@lysp.io` logs into the portal → sees proposal in **Proposals** → Accepts, Counters, or Rejects
4. Firm sees counter in **Negotiations** (`/negotiations`), gets AI brief, Accepts / Counters / Rejects
5. When accepted → `CLIENT_APPROVED`. When client rejects → `CLIENT_REJECTED`. Firm can also `WITHDRAWN`.

### Key rules (enforced)
- Client **never** sees margin, estimated cost, guardrails, or firm AI internals.
- AI is advisory only — humans accept/counter/reject.
- Firm cannot accept a counter that breaches the margin floor (409 Conflict).
- `sendToClient` fails with 409 if the scenario isn't APPROVED or a negotiation already exists for it.
- Portal users auto-created with temp password `client123` and `mustChangePassword=true`.

---

## Verified smoke test (Aug 9)

```
client@lysp.io / client123  -> CLIENT_USER, client_seed_techco, tokenLen=253
GET /v1/portal/negotiations -> 1 proposal
GET detail                  -> margin hidden, 2 rounds
POST counter (client)       -> NEGOTIATING, round=2
POST ai/suggest (firm, intent=counter) -> clearsGuardrail=true, margin=38.00
POST accept-counter (firm)  -> CLIENT_APPROVED
```

---

## Where the code lives

### Frontend (`lysp-frontend`)
- Negotiation module: `src/modules/negotiation/`
  - `types.ts`, `api.ts`, `utils.ts`
  - `components/NegotiationStatusBadge.tsx`, `SendToClientModal.tsx`, `AiSuggestPanel.tsx`, `RateCardEditor.tsx`
- Firm pages: `src/app/(app)/negotiations/page.tsx`, `[uid]/page.tsx`
- Portal pages: `src/app/client-portal/negotiations/page.tsx`, `[uid]/page.tsx`, `src/app/client-portal/page.tsx` (redirects to `/dashboard`)
- Send-to-client wired into `src/app/(app)/pricing-requests/[uid]/pricing/page.tsx` (only when preferred scenario status = `APPROVED`)
- Auth redirect logic in `src/app/auth/page.tsx` and `src/app/(app)/layout.tsx` (client users auto-redirect to `/client-portal/dashboard`)
- `src/lib/api/endpoints.ts` has all negotiation BFF routes

### Backend (`lysp-backend`)
- Module: `lysp-backend/negotiation/`
- Changelog: `app/src/main/resources/db/changelog/modules/negotiation/002-negotiation-mvp.sql`
- Core service: `negotiation/src/main/java/com/lysp/negotiation/service/NegotiationService.java`
- AI service: `.../NegotiationAiService.java`
- Firm controller: `.../api/NegotiationController.java`
- Portal controller: `.../api/PortalNegotiationController.java` (`/v1/portal/negotiations`)
- Auth: `security/src/main/java/com/lysp/security/service/AuthService.java` (firm first, fallback to portal), `LyspClientJwtService.java`
- Seeder: `app/src/main/java/com/lysp/app/config/PortalClientSeeder.java`

---

## What's fixed / changed in this session

- Unified login: `client@lysp.io` works at `/v1/auth/login` (was invite-only before)
- `LyspClientJwtService.getSignKey()` accepts non-base64 secrets (falls back to UTF-8) — default secret in `application.yml` was invalid base64
- `application.yml` duplicate `expiry-minutes` key removed
- Portal links changed from `/client-portal/proposals/[uid]` to `/client-portal/negotiations/[uid]` everywhere
- `ClientAuthContext` accepts both `PORTAL` and `CLIENT_USER` JWT types
- `AuthContext` sets `userType: CLIENT_USER` so `(app)/layout.tsx` bounces client users to the portal

---

## Accounts (local)

| Side | Email | Password | Route after login |
|---|---|---|---|
| Firm admin | admin@lysp.io | admin123 | /dashboard |
| Firm partner | partner@lysp.io | partner123 | /approvals |
| Client portal | client@lysp.io | client123 | /client-portal/dashboard |

Demo client profile: **Helix Therapeutics plc** (`client_seed_techco`). Seeded portal user `client@lysp.io` links to it.

---

## How to run (Windows, PowerShell)

### Backend
```powershell
cd c:\Users\lysp\Desktop\LYSP\lysp-backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
.\mvnw.cmd -pl app "-Dspring-boot.run.profiles=local" spring-boot:run
```
Takes ~30–60s to bind on `http://localhost:8080` (context path `/api`).

### Frontend
```powershell
cd c:\Users\lysp\Desktop\LYSP\lysp-frontend
npm run dev
```
Serves on `http://localhost:3000`.

### Health checks
```powershell
Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/login" -Method Options
Invoke-WebRequest -Uri "http://localhost:3000/auth"
```

---

## Current server state (as of last check)

- **Backend:** DOWN (was UP; terminal `432262` was the last good run)
- **Frontend:** DOWN (zombie port-3000 PID 5388 was killed; `npm run dev` terminal `631456` ended)
- The next agent should start both services fresh before testing.

---

## What's NOT done / next candidates

1. Change-password screen for the portal (`mustChangePassword` is set but no UI yet)
2. Volume-discount / committee tiers (intentionally skipped for MVP)
3. PDF export of final rate card
4. Email notifications (currently in-app only via `UserNotificationService`)
5. Admin UI to convert demo `client_user` passwords

---

## User preferences

- Never ask the user to restart servers — the agent owns runtime restarts.
- Use demo accounts above for manual testing.
- Keep client portal simple — no firm internals ever.

---

## If you need more context

- System overview: `docs/SYSTEM_OVERVIEW.md`
- Intake manual test: `docs/MANUAL_INTAKE_UI_TEST.md`
- Negotiation testing guide (just written): `docs/NEGOTIATION_TESTING.md`
- Backend agentic AI rules: `.cursor/rules/lysp-backend-ai-engineering.mdc`
