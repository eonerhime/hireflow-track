# HireTrace — Sprint 6

**Document Type:** Scrum Master Artifact
**Sprint:** 6 — Analytics + Export + OAuth + E2E
**Dates:** 26 May 2026 – 02 Jun 2026
**Status:** 🔲 Not started
**Branch:** `feature/sprint-06-analytics-export-oauth`
**Author:** Scrum Master
**Repository:** https://github.com/eonerhime/hiretrace

---

## Cross-References

| Document            | Relationship                                           |
| ------------------- | ------------------------------------------------------ |
| `product.md`        | Upstream source — PBI definitions, sizes, priorities   |
| `plan.md`           | Sprint dates, capacity model, DoD, phase gates         |
| `spec.md`           | Acceptance criteria for each PBI in this sprint        |
| `tasks.md`          | Atomic dev tasks per feature — updated at sprint start |
| `implementation.md` | ADR log; OAuth provider decision logged here           |
| `testing.md`        | Test results logged here at sprint close               |

---

## Sprint Goal

Deliver the full release. CSV export and Google OAuth ship the remaining Could Have features. E2E tests cover all critical user journeys. The final LinkedIn post closes the portfolio showcase. Phase 3 gate is cleared at sprint close.

---

## Sprint PBIs

| ID      | Title                                        | Size | Priority | Status    | Notes                                                          |
| ------- | -------------------------------------------- | ---- | -------- | --------- | -------------------------------------------------------------- |
| PBI-035 | CSV export of application history            | M    | 🟡       | [x] Done  | No schema change needed — query existing Application table     |
| PBI-036 | Google OAuth login                           | M    | 🟡       | [x] Done  | ADR required before code; runs alongside email/password auth   |
| PBI-040 | React Testing Library — core component suite | L    | 🔴       | [x] Done  | Carried from Sprint 2 — fills gaps in existing component tests |
| PBI-042 | E2E tests — critical user journeys           | L    | 🟡       | [x] Done  | Playwright recommended; covers register → pipeline → export    |
| PBI-045 | LinkedIn post per sprint (final post)        | S    | 🔴       | [ ] To do | Final portfolio showcase post — publish at sprint close        |

**Status markers:** [ ] To do · [~] In progress · [x] Done · [!] Blocked

---

## Dependency Order

```
PBI-036 ADR → PBI-036 (Google OAuth — auth layer change)
    ↓
PBI-035 (CSV export — no auth dependency but ship after OAuth is stable)

PBI-040 (RTL component suite — no dependencies, run in parallel)

PBI-042 (E2E — depends on PBI-035 and PBI-036 being stable)
    ↓
PBI-045 (LinkedIn final post — publish after Phase 3 gate cleared)
```

**Recommended sequence:** PBI-040 → PBI-036 (ADR first) → PBI-035 → PBI-042 → PBI-045

Rationale: PBI-040 fills RTL gaps with no external dependencies — a clean warm-up. PBI-036 (OAuth) touches the auth layer and must stabilise before E2E tests are authored. PBI-035 (CSV) is self-contained and slots in after OAuth. PBI-042 (E2E) goes last because it exercises the complete app including export and OAuth. PBI-045 publishes after the gate is cleared.

---

## Schema Migration Needs

None. Sprint 6 requires no Prisma schema changes.

- PBI-035 reads from the existing `Application` table — no new fields
- PBI-036 adds OAuth provider support via NextAuth/Auth.js — user identity is managed in the session layer, not a new Prisma model (the existing `User` model is sufficient; an `Account` model may be needed depending on Auth.js adapter — log this in the ADR before coding)
- PBI-040 and PBI-042 are test-only — no schema impact
- PBI-045 is a LinkedIn post — no schema impact

> ⚠️ If the Auth.js adapter requires an `Account` model, update the ADR and add the migration before any OAuth code. Do NOT add schema changes speculatively — confirm in the ADR first.

---

## ADR — Google OAuth Provider (PBI-036)

**Decision required before writing any PBI-036 code.**
Log the decision in `implementation.md` before the first task is started.

### Options

| Criterion                 | NextAuth.js v4 (next-auth)         | Auth.js v5 (next-auth v5 beta) |
| ------------------------- | ---------------------------------- | ------------------------------ |
| Next.js 15 support        | ✅ Works with App Router via shim  | ✅ Native App Router support   |
| Stability                 | Stable — v4.24.x                   | Beta — API may change          |
| Existing auth coexistence | Requires replacing current JWT     | Same concern — must bridge     |
| Prisma adapter            | `@auth/prisma-adapter` v4          | `@auth/prisma-adapter` v5      |
| Session strategy          | JWT (aligns with current approach) | JWT or database sessions       |
| Google provider           | ✅ Built-in                        | ✅ Built-in                    |
| Complexity of migration   | Medium — wraps existing routes     | Higher — beta churn risk       |

**Recommended:** NextAuth.js v4 — stable, well-documented, Google provider is first-class, and JWT session strategy aligns with the current jose-based approach. The existing email/password login must continue working alongside OAuth.

**Key constraint:** The current auth uses a custom JWT implementation with `jose`. NextAuth.js will take over session management. The migration path: install NextAuth, configure Google + Credentials providers (to preserve email/password), update middleware to use NextAuth session, remove the custom `jose` middleware session check.

**Log this decision in `implementation.md` §ADR section before coding begins.**

---

## Sprint 6 Tasks

### PBI-040 — React Testing Library — core component suite

> Fills gaps in component coverage identified at Sprint 2. No new components — tests only.

#### Coverage targets

| Task     | Description                                                                                  | Status |
| -------- | -------------------------------------------------------------------------------------------- | ------ |
| T-040-01 | Audit existing RTL tests — list components with zero or minimal coverage                     | [ ]    |
| T-040-02 | Write RTL test: `KanbanBoard` — renders columns for all 6 stages                             | [ ]    |
| T-040-03 | Write RTL test: `KanbanBoard` — renders application cards in correct stage column            | [ ]    |
| T-040-04 | Write RTL test: `ApplicationDetail` — renders company, role, stage, follow-up date           | [ ]    |
| T-040-05 | Write RTL test: `ApplicationDetail` — renders linked resume label and download link when set | [ ]    |
| T-040-06 | Write RTL test: `ApplicationDetail` — renders empty state when no notes or contacts          | [ ]    |
| T-040-07 | Write RTL test: `ContactForm` (edit mode) — pre-populates fields with existing contact data  | [ ]    |
| T-040-08 | Write RTL test: `ResumeList` — inline delete confirmation renders on delete button click     | [ ]    |
| T-040-09 | Write RTL test: `ResumeList` — cancel confirmation returns to normal state                   | [ ]    |
| T-040-10 | Write RTL test: `ReminderList` — overdue badge renders for past `followUpAt` dates           | [ ]    |
| T-040-11 | `npm test` — all tests pass, no regressions                                                  | [ ]    |
| T-040-12 | `npm run build` — no errors                                                                  | [ ]    |

---

### PBI-036 — Google OAuth login

> **Log ADR in `implementation.md` before Task T-036-01.**

#### Setup

| Task     | Description                                                                                                                       | Status |
| -------- | --------------------------------------------------------------------------------------------------------------------------------- | ------ |
| T-036-00 | Log OAuth provider ADR in `implementation.md` — NextAuth v4 vs Auth.js v5                                                         | [ ]    |
| T-036-01 | Create Google Cloud project and OAuth 2.0 credentials (Client ID + Secret)                                                        | [ ]    |
| T-036-02 | Set authorised redirect URI: `https://<vercel-url>/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/google` | [ ]    |
| T-036-03 | Install NextAuth: `npm install next-auth@4` — pin version                                                                         | [ ]    |
| T-036-04 | Add env vars to `.env.local` and Vercel: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`            | [ ]    |

#### API + Auth

| Task     | Description                                                                                                                      | Status |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- | ------ |
| T-036-05 | Create `app/api/auth/[...nextauth]/route.ts` — configure Google provider + Credentials provider (email/password must still work) | [ ]    |
| T-036-06 | Configure Credentials provider to use existing bcrypt password validation + Prisma user lookup                                   | [ ]    |
| T-036-07 | Configure session strategy: JWT — aligns with current jose-based session                                                         | [ ]    |
| T-036-08 | Add `session.user.id` to JWT and session callbacks — required for all user-scoped queries                                        | [ ]    |
| T-036-09 | Update `middleware.ts` — replace custom `jose` session check with `getToken` from `next-auth/jwt`                                | [ ]    |
| T-036-10 | Update all API route session checks — replace `jose` verify with `getServerSession` or `getToken`                                | [ ]    |
| T-036-11 | On first OAuth login: create User record if not exists (use NextAuth `signIn` callback)                                          | [ ]    |
| T-036-12 | Ensure OAuth user and Credentials user share the same `User` model — no duplicate accounts for same email                        | [ ]    |

#### UI

| Task     | Description                                                                                  | Status |
| -------- | -------------------------------------------------------------------------------------------- | ------ |
| T-036-13 | Add "Continue with Google" button to login page                                              | [ ]    |
| T-036-14 | Add "Continue with Google" button to register page                                           | [ ]    |
| T-036-15 | Style Google button per Google branding guidelines (white button, Google logo, correct font) | [ ]    |
| T-036-16 | On OAuth login success: redirect to `/dashboard` — same as email/password login              | [ ]    |
| T-036-17 | On OAuth login failure: display error message on login page                                  | [ ]    |
| T-036-18 | Write RTL test: login page renders Google OAuth button                                       | [ ]    |
| T-036-19 | Write integration test: `GET /api/auth/session` returns 401 when unauthenticated             | [ ]    |
| T-036-20 | Manual test: full Google OAuth flow — sign in, see dashboard, sign out                       | [ ]    |
| T-036-21 | Manual test: email/password login still works after NextAuth migration                       | [ ]    |
| T-036-22 | `npm test` — all tests pass                                                                  | [ ]    |
| T-036-23 | `npm run build` — no errors                                                                  | [ ]    |

---

### PBI-035 — CSV export of application history

> No schema change needed. Reads from existing `Application` table.

#### API

| Task     | Description                                                                                                                          | Status |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| T-035-01 | Create `GET /api/export/applications` route                                                                                          | [ ]    |
| T-035-02 | Validate session — return 401 if unauthenticated                                                                                     | [ ]    |
| T-035-03 | Query all applications for authenticated user — include `contacts` relation (name, email) and linked `resume` (label)                | [ ]    |
| T-035-04 | Generate CSV string server-side — do not use a client-side library; build with `Array.join` or a lightweight server util             | [ ]    |
| T-035-05 | CSV columns: `company`, `role`, `stage`, `location`, `salary`, `source`, `followUpAt`, `resumeVersionLabel`, `contacts`, `appliedAt` | [ ]    |
| T-035-06 | Set response headers: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="applications.csv"`                       | [ ]    |
| T-035-07 | Return 200 with CSV body                                                                                                             | [ ]    |
| T-035-08 | Add `revalidatePath` — not needed (GET only); confirm no mutation side effects                                                       | [ ]    |
| T-035-09 | Write integration test: GET returns 401 when unauthenticated                                                                         | [ ]    |
| T-035-10 | Write integration test: GET returns CSV content-type and non-empty body for authenticated user                                       | [ ]    |
| T-035-11 | Write integration test: GET returns correct column headers in first CSV row                                                          | [ ]    |

#### UI

| Task     | Description                                                                                                       | Status |
| -------- | ----------------------------------------------------------------------------------------------------------------- | ------ |
| T-035-12 | Add "Export CSV" button to dashboard (applications list view or dashboard header)                                 | [ ]    |
| T-035-13 | On click: fetch `/api/export/applications` and trigger browser download (use `URL.createObjectURL` + `<a>` click) | [ ]    |
| T-035-14 | Show loading state on button during fetch                                                                         | [ ]    |
| T-035-15 | Show error message if export fails                                                                                | [ ]    |
| T-035-16 | Write RTL test: export button renders on dashboard                                                                | [ ]    |
| T-035-17 | Write RTL test: export button shows loading state while fetch is in progress                                      | [ ]    |
| T-035-18 | `npm test` — all tests pass                                                                                       | [ ]    |
| T-035-19 | `npm run build` — no errors                                                                                       | [ ]    |

---

### PBI-042 — E2E tests — critical user journeys

> Playwright recommended. Install after PBI-035 and PBI-036 are stable.

#### Setup

| Task     | Description                                                                                              | Status |
| -------- | -------------------------------------------------------------------------------------------------------- | ------ |
| T-042-01 | Install Playwright: `npm install --save-dev @playwright/test` — pin version                              | [ ]    |
| T-042-02 | Run `npx playwright install` — install browser binaries                                                  | [ ]    |
| T-042-03 | Create `playwright.config.ts` — base URL `http://localhost:3000`, single browser (Chromium for CI speed) | [ ]    |
| T-042-04 | Add `e2e/` directory — separate from `__tests__/` (RTL tests stay in `__tests__/`)                       | [ ]    |
| T-042-05 | Add `npm run test:e2e` script to `package.json`: `playwright test`                                       | [ ]    |
| T-042-06 | Confirm E2E tests do NOT run as part of `npm test` (Jest config excludes `e2e/`)                         | [ ]    |

#### Journey 1 — Register and log in

| Task     | Description                                                                              | Status |
| -------- | ---------------------------------------------------------------------------------------- | ------ |
| T-042-07 | E2E: navigate to `/register`, fill name + email + password, submit, land on `/dashboard` | [ ]    |
| T-042-08 | E2E: navigate to `/login`, fill email + password, submit, land on `/dashboard`           | [ ]    |
| T-042-09 | E2E: log out from dashboard, confirm redirect to `/login`                                | [ ]    |

#### Journey 2 — Application pipeline

| Task     | Description                                                                               | Status |
| -------- | ----------------------------------------------------------------------------------------- | ------ |
| T-042-10 | E2E: add a new application (company, role, stage), confirm it appears in application list | [ ]    |
| T-042-11 | E2E: open application detail, edit role field, save, confirm updated value is displayed   | [ ]    |
| T-042-12 | E2E: delete an application, confirm it no longer appears in application list              | [ ]    |
| T-042-13 | E2E: drag application card between Kanban columns, confirm stage updates                  | [ ]    |

#### Journey 3 — CSV export

| Task     | Description                                                                                      | Status |
| -------- | ------------------------------------------------------------------------------------------------ | ------ |
| T-042-14 | E2E: click Export CSV on dashboard, confirm file download initiates (check download event fires) | [ ]    |

#### Journey 4 — Google OAuth (smoke test only)

| Task     | Description                                                                                         | Status |
| -------- | --------------------------------------------------------------------------------------------------- | ------ |
| T-042-15 | E2E: navigate to `/login`, confirm Google OAuth button is present and links to Google auth endpoint | [ ]    |

#### Completion

| Task     | Description                                  | Status |
| -------- | -------------------------------------------- | ------ |
| T-042-16 | `npm run test:e2e` — all journeys pass in CI | [ ]    |
| T-042-17 | `npm run build` — no errors                  | [ ]    |

---

### PBI-045 — LinkedIn post per sprint (final post)

> Publish after the Phase 3 gate is cleared. This closes the public build-in-progress series.

| Task     | Description                                                                             | Status |
| -------- | --------------------------------------------------------------------------------------- | ------ |
| T-045-01 | Draft final LinkedIn post — sprint retro insight + project completion announcement      | [ ]    |
| T-045-02 | Include: what was built, total sprint count, total tests, what the project demonstrates | [ ]    |
| T-045-03 | Link to GitHub repo and Notion workspace in post                                        | [ ]    |
| T-045-04 | Publish post on LinkedIn                                                                | [ ]    |
| T-045-05 | Log post URL in `linkedin.md`                                                           | [ ]    |

---

## Definition of Done Checklist (per PBI)

Before marking any PBI `[x]`:

- [ ] All tasks for the PBI are marked `[x]`
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run lint` — zero warnings
- [ ] `npm test` — all tests pass (no regressions)
- [ ] `npm run build` — clean build
- [ ] Pushed to `feature/sprint-06-analytics-export-oauth` — Vercel preview deployment passes
- [ ] PBI marked `[x]` in `product.md`

---

## Sprint Setup Checklist

- [ ] Create branch: `git checkout develop && git pull && git checkout -b feature/sprint-06-analytics-export-oauth`
- [ ] Push branch: `git push -u origin feature/sprint-06-analytics-export-oauth`
- [ ] Confirm branch appears in GitHub
- [ ] Log OAuth provider ADR in `implementation.md` before touching PBI-036

---

## Test Inventory — Sprint 6 Additions

| File                                        | Tests   | Covers                        |
| ------------------------------------------- | ------- | ----------------------------- |
| `__tests__/KanbanBoard.test.tsx`            | 2       | PBI-040 Kanban columns        |
| `__tests__/ApplicationDetail.test.tsx`      | 3       | PBI-040 detail page           |
| `__tests__/ResumeList.delete.test.tsx`      | 2       | PBI-040 inline delete confirm |
| `__tests__/api.export.applications.test.ts` | 3       | PBI-035 GET export            |
| `__tests__/ExportButton.test.tsx`           | 2       | PBI-035 UI                    |
| `__tests__/LoginPage.oauth.test.tsx`        | 1       | PBI-036 OAuth button          |
| `__tests__/api.auth.session.test.ts`        | 1       | PBI-036 session 401           |
| `e2e/auth.spec.ts`                          | 3       | PBI-042 Journey 1             |
| `e2e/pipeline.spec.ts`                      | 4       | PBI-042 Journey 2             |
| `e2e/export.spec.ts`                        | 1       | PBI-042 Journey 3             |
| `e2e/oauth.spec.ts`                         | 1       | PBI-042 Journey 4             |
| **Sprint 6 RTL additions**                  | **12**  |                               |
| **Sprint 6 E2E additions**                  | **9**   |                               |
| **Running RTL total**                       | **107** |                               |

---

## Sprint Review (target: 02 Jun 2026)

**Date completed:** _TBC_

### PBI Completion

| PBI     | Item                                         | Done? | Notes |
| ------- | -------------------------------------------- | ----- | ----- |
| PBI-035 | CSV export of application history            | [ ]   |       |
| PBI-036 | Google OAuth login                           | [ ]   |       |
| PBI-040 | React Testing Library — core component suite | [ ]   |       |
| PBI-042 | E2E tests — critical user journeys           | [ ]   |       |
| PBI-045 | LinkedIn post per sprint (final)             | [ ]   |       |

### Sprint Goal Met?

- [ ] Yes — sprint goal achieved in full
- [ ] Partial — see notes

### Velocity

| Metric            | Value |
| ----------------- | ----- |
| PBIs committed    | 5     |
| PBIs completed    | _TBC_ |
| PBIs carried over | _TBC_ |
| S completed       | _TBC_ |
| M completed       | _TBC_ |
| L completed       | _TBC_ |

---

## Sprint Retrospective (target: 02 Jun 2026)

**Date completed:** _TBC_

### What went well?

_Complete at sprint close._

### What didn't go well?

_Complete at sprint close._

### What will change?

_N/A — this is the final sprint._

### Retro insight for LinkedIn

_Draft at sprint close for PBI-045._

---

## Phase 3 Gate — Full Release

| Criterion                                                      | Status |
| -------------------------------------------------------------- | ------ |
| All 🟡 Could Have PBIs complete and marked `[x]` in product.md | [ ]    |
| E2E tests passing for all critical user journeys               | [ ]    |
| Google OAuth functional alongside email/password auth          | [ ]    |
| CSV export working and downloadable                            | [ ]    |
| Final LinkedIn post published                                  | [ ]    |
| Sprint 6 retro completed and documented                        | [ ]    |

_Gate target: 02 Jun 2026_

---

## Carry-Forward Decisions (from Sprint 5 — do not repeat these mistakes)

- PATCH routes with partial update bodies must use conditional spreads: `...(field !== undefined && { field })` — never unconditional `field: value ?? null`
- `router.refresh()` + `setTimeout(() => router.push(...), 100)` mandatory for client mutations where server-rendered relation data must be visible after update
- `export const dynamic = "force-dynamic"` on pages that need fresh relational data after mutations
- Server components that need relational data must use direct Prisma queries — never `fetch("/api/...")` round-trips
- `resume` is a relation field — NOT on the base Prisma `Application` type; only `resumeId` (the FK) is — remove `resume: null` from mock factories; keep `resumeId: null`
- `updateApplicationSchema` must override `company` and `role` as optional — they are required in `createApplicationSchema` but a PATCH body may contain only one field
- When running Jest on files with `[id]` in the name, always escape brackets: `npm test "api.resumes.\[id\]"`
- All code updates delivered in markdown code blocks — no exceptions
- `z.input<>` and `z.infer<>` both exported from any schema with `.transform()`
- Named type aliases for any `Record` with non-primitive value type
- All metric charts are props-driven from DashboardClient — never fetch from API
- Mock `next/cache` in ALL API route test files that call `revalidatePath`
- `jest.mock()` calls must come BEFORE all imports in API test files
- `@jest-environment node` docblock must be absolute first line of API test files — never in route files
- Update ALL three mock factories when adding fields to `Application`
- Validate request body BEFORE DB lookup — fail fast with 400
- Never `@latest` — always pin versions
- `npx tsc --noEmit` not `tsc --noEmit`

---

_sprint-06.md v1.0 — 26 May 2026 — HireTrace_
_Drafted at Sprint 6 start. Update status markers daily. Complete Review and Retro sections at sprint close._
