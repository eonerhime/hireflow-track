# HireFlow — Sprint 6B

**Document Type:** Scrum Master Artifact
**Sprint:** 6B — UI/UX Upgrade (Dashboard Redesign + Dark Mode)
**Dates:** TBC — begin after Sprint 6 Phase 3 gate is cleared
**Status:** 🔲 Not started
**Branch:** `feature/sprint-06b-ui-upgrade`
**Author:** Scrum Master
**Repository:** https://github.com/eonerhime/hireflow-track

---

## Cross-References

| Document            | Relationship                                             |
| ------------------- | -------------------------------------------------------- |
| `product.md`        | Upstream source — new PBIs added in this sprint          |
| `plan.md`           | Sprint dates; this sprint follows Sprint 6 gate close    |
| `sprint-06.md`      | Predecessor — all PBIs there must be closed before start |
| `implementation.md` | ADR for `react-day-picker` logged here before coding     |
| `testing.md`        | Test results logged here at sprint close                 |

---

## Sprint Goal

Deliver a production-quality UI/UX upgrade that makes HireFlow feel like a real product people want to use every day. The redesigned dashboard gives users an at-a-glance view of their full job search — recent activity, upcoming follow-ups, pipeline analytics, and a date range filter — all in a dark-mode-capable interface that matches the design mock-up.

---

## Sprint PBIs

| ID      | Title                                            | Size | Priority | Status    | Notes                                                           |
| ------- | ------------------------------------------------ | ---- | -------- | --------- | --------------------------------------------------------------- |
| PBI-047 | Dark mode toggle (system + user preference)      | M    | 🟡       | [x] To do | Tailwind `dark:` classes throughout; no schema change           |
| PBI-048 | Activity log — schema + write points + API       | M    | 🟡       | [x] To do | New `ActivityLog` model; writes on stage change, create, delete |
| PBI-049 | Notification bell wired to existing reminders    | S    | 🟡       | [x] To do | No new model; consumes `/api/reminders`; badge + dropdown       |
| PBI-050 | Dashboard date range filter                      | M    | 🟡       | [x] To do | `react-day-picker`; filters all dashboard API queries           |
| PBI-051 | Dashboard layout restructure (mock-up alignment) | L    | 🟡       | [x] To do | Two-column card grid; pipeline bar; activity feed; tasks panel  |

**Status markers:** [ ] To do · [~] In progress · [x] Done · [!] Blocked

---

## Dependency Order

```
PBI-047 (dark mode — CSS/Tailwind layer, no data dependency)
    ↓ (run in parallel — both are foundational)
PBI-048 (ActivityLog schema + write points + API)
    ↓
PBI-049 (NotificationBell — reuses /api/reminders, no PBI-048 dependency)

PBI-050 (date range filter — extends existing dashboard API routes)

PBI-051 (dashboard restructure — depends on PBI-047, PBI-048, PBI-049, PBI-050 all stable)
```

**Recommended sequence:** PBI-047 → PBI-048 → PBI-049 → PBI-050 → PBI-051

Rationale: Dark mode first because it touches every component — doing it after layout restructure doubles the surface area. ActivityLog next because the dashboard's activity feed needs real data. NotificationBell is self-contained. Date range filter extends existing API routes with no UI risk. Dashboard restructure goes last because it assembles all the above pieces into the new layout.

---

## Schema Migration Needs

### PBI-048 — Activity Log

New `ActivityLog` model. No changes to existing models.

```prisma
model ActivityLog {
  id            String      @id @default(cuid())
  userId        String
  applicationId String?
  action        ActivityAction
  metadata      Json?
  createdAt     DateTime    @default(now())
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum ActivityAction {
  APPLICATION_CREATED
  APPLICATION_DELETED
  STAGE_CHANGED
  RESUME_LINKED
  NOTE_ADDED
}
```

Migration name: `add_activity_log`

> ⚠️ After migration, update ALL three mock factories if `Application` shape changes. In this sprint `Application` itself does not change — only the new `ActivityLog` model is added. Still run `npm test` immediately after migration to confirm no breakage.

**What gets logged and where:**

| Event               | Route                                                    | Metadata shape                          |
| ------------------- | -------------------------------------------------------- | --------------------------------------- |
| Application created | `POST /api/applications`                                 | `{ company, role, stage }`              |
| Application deleted | `DELETE /api/applications/[id]`                          | `{ company, role }`                     |
| Stage changed       | `PATCH /api/applications/[id]` (when `stage` in body)    | `{ company, role, fromStage, toStage }` |
| Resume linked       | `PATCH /api/applications/[id]` (when `resumeId` in body) | `{ company, role, resumeLabel }`        |
| Note added          | `POST /api/notes`                                        | `{ company, role }`                     |

---

## New Package

```bash
# Date range picker — install only when you reach PBI-050
npm install react-day-picker@8.10.1 date-fns@3.6.0 --legacy-peer-deps
```

Pin both versions exactly. `react-day-picker@8.x` uses `date-fns` as a peer dependency. Do not install v9 — it has a different API surface.

---

## Sprint 6B Tasks

### PBI-047 — Dark Mode Toggle

#### Setup

| Task     | Description                                                                                   | Status |
| -------- | --------------------------------------------------------------------------------------------- | ------ |
| T-047-01 | Confirm `darkMode: 'class'` is set in Tailwind config (or add `@variant dark { ... }` for v4) | [ ]    |
| T-047-02 | Create `components/ThemeToggle.tsx` — client component, toggles `dark` class on `<html>`      | [ ]    |
| T-047-03 | Persist theme preference to `localStorage` — restore on page load via script in `<head>`      | [ ]    |
| T-047-04 | Respect `prefers-color-scheme` as the initial default when no stored preference exists        | [ ]    |
| T-047-05 | Add `ThemeToggle` to dashboard layout header                                                  | [ ]    |

#### Component coverage

| Task     | Description                                                                                                    | Status |
| -------- | -------------------------------------------------------------------------------------------------------------- | ------ |
| T-047-06 | Add `dark:` classes to sidebar: background, text, active state, hover state                                    | [ ]    |
| T-047-07 | Add `dark:` classes to dashboard layout: page background, top bar                                              | [ ]    |
| T-047-08 | Add `dark:` classes to all card components: `StatsBar`, `PipelineChart`, `ConversionChart`, `TimeInStageChart` | [ ]    |
| T-047-09 | Add `dark:` classes to `ApplicationList`, `ApplicationForm`, application detail page                           | [ ]    |
| T-047-10 | Add `dark:` classes to `ContactList`, `ContactForm`                                                            | [ ]    |
| T-047-11 | Add `dark:` classes to `ReminderList`, `ResumeList`, `ResumeUploadForm`, `NoteTimeline`                        | [ ]    |
| T-047-12 | Add `dark:` classes to all form inputs: borders, backgrounds, placeholder text, focus rings                    | [ ]    |
| T-047-13 | Add `dark:` classes to all modal/overlay elements                                                              | [ ]    |
| T-047-14 | Verify toggle in browser: light → dark → light, no flash of unstyled content on reload                         | [ ]    |
| T-047-15 | Write RTL test: `ThemeToggle` renders a button                                                                 | [ ]    |
| T-047-16 | Write RTL test: clicking `ThemeToggle` adds `dark` class to document element                                   | [ ]    |
| T-047-17 | `npm test` — all tests pass                                                                                    | [ ]    |
| T-047-18 | `npm run build` — no errors                                                                                    | [ ]    |

---

### PBI-048 — Activity Log

#### Schema + Migration

| Task     | Description                                                          | Status |
| -------- | -------------------------------------------------------------------- | ------ |
| T-048-01 | Add `ActivityLog` model and `ActivityAction` enum to `schema.prisma` | [ ]    |
| T-048-02 | Add `activityLogs ActivityLog[]` relation to `User` model            | [ ]    |
| T-048-03 | Run `npx prisma migrate dev --name add_activity_log`                 | [ ]    |
| T-048-04 | Run `npm test` immediately after migration — confirm no regressions  | [ ]    |

#### Write points

| Task     | Description                                                                                                   | Status |
| -------- | ------------------------------------------------------------------------------------------------------------- | ------ |
| T-048-05 | Write to `ActivityLog` in `POST /api/applications` — action: `APPLICATION_CREATED`                            | [ ]    |
| T-048-06 | Write to `ActivityLog` in `DELETE /api/applications/[id]` — action: `APPLICATION_DELETED`                     | [ ]    |
| T-048-07 | Write to `ActivityLog` in `PATCH /api/applications/[id]` when `stage` is in body — action: `STAGE_CHANGED`    | [ ]    |
| T-048-08 | Write to `ActivityLog` in `PATCH /api/applications/[id]` when `resumeId` is in body — action: `RESUME_LINKED` | [ ]    |
| T-048-09 | Write to `ActivityLog` in `POST /api/notes` — action: `NOTE_ADDED`                                            | [ ]    |
| T-048-10 | All activity writes are fire-and-forget — wrap in try/catch, log error, never throw                           | [ ]    |

#### API

| Task     | Description                                                                         | Status |
| -------- | ----------------------------------------------------------------------------------- | ------ |
| T-048-11 | Create `GET /api/activity` route — return last 20 events for authenticated user     | [ ]    |
| T-048-12 | Return fields: `id`, `action`, `metadata`, `createdAt`, `applicationId`             | [ ]    |
| T-048-13 | Order by `createdAt DESC`                                                           | [ ]    |
| T-048-14 | Return 401 if unauthenticated                                                       | [ ]    |
| T-048-15 | Return 200 with empty array if no activity yet — never 404                          | [ ]    |
| T-048-16 | Write integration test: GET returns 401 when unauthenticated                        | [ ]    |
| T-048-17 | Write integration test: GET returns array of activity events for authenticated user | [ ]    |

#### UI

| Task     | Description                                                                                        | Status |
| -------- | -------------------------------------------------------------------------------------------------- | ------ |
| T-048-18 | Create `components/ActivityFeed.tsx` — renders last 20 activity events                             | [ ]    |
| T-048-19 | Each item shows: icon per action type, human-readable label, relative time ("2 hours ago")         | [ ]    |
| T-048-20 | Human-readable labels: "You moved [role] at [company] to [stage]", "You added [role] at [company]" | [ ]    |
| T-048-21 | Relative time: use `date-fns` `formatDistanceToNow` (already installed for PBI-050)                | [ ]    |
| T-048-22 | Empty state: "No activity yet. Add your first application to get started."                         | [ ]    |
| T-048-23 | Link each item to `/dashboard/applications/[applicationId]` when `applicationId` is set            | [ ]    |
| T-048-24 | Write RTL test: renders list of activity events                                                    | [ ]    |
| T-048-25 | Write RTL test: renders empty state when no events                                                 | [ ]    |
| T-048-26 | `npm test` — all tests pass                                                                        | [ ]    |
| T-048-27 | `npm run build` — no errors                                                                        | [ ]    |

---

### PBI-049 — Notification Bell

| Task     | Description                                                                                     | Status |
| -------- | ----------------------------------------------------------------------------------------------- | ------ |
| T-049-01 | Create `components/NotificationBell.tsx` — client component, fetches `/api/reminders`           | [ ]    |
| T-049-02 | Badge: count of reminders where `followUpAt <= today` — red badge, hidden when count is 0       | [ ]    |
| T-049-03 | Clicking bell toggles a dropdown panel — max 5 items, "View all" link to `/dashboard/reminders` | [ ]    |
| T-049-04 | Each dropdown item: company name, role, follow-up date, overdue indicator                       | [ ]    |
| T-049-05 | Dropdown closes on click outside (use `useEffect` + `document` click listener or `onBlur`)      | [ ]    |
| T-049-06 | Add `NotificationBell` to dashboard layout top bar, right of the date range picker              | [ ]    |
| T-049-07 | Dark mode: badge and dropdown panel styled with `dark:` classes                                 | [ ]    |
| T-049-08 | Write RTL test: bell renders without badge when no overdue reminders                            | [ ]    |
| T-049-09 | Write RTL test: badge shows correct count when overdue reminders exist                          | [ ]    |
| T-049-10 | Write RTL test: dropdown renders reminder items on bell click                                   | [ ]    |
| T-049-11 | `npm test` — all tests pass                                                                     | [ ]    |
| T-049-12 | `npm run build` — no errors                                                                     | [ ]    |

---

### PBI-050 — Dashboard Date Range Filter

| Task     | Description                                                                                    | Status |
| -------- | ---------------------------------------------------------------------------------------------- | ------ |
| T-050-01 | Install `react-day-picker@8.10.1` and `date-fns@3.6.0` — pin versions                          | [ ]    |
| T-050-02 | Create `components/DateRangePicker.tsx` — client component wrapping `react-day-picker`         | [ ]    |
| T-050-03 | Presets: "This Week", "This Month", "Last 30 Days", "All Time" — shown as quick-select buttons | [ ]    |
| T-050-04 | Custom range: calendar popover for manual `from`/`to` selection                                | [ ]    |
| T-050-05 | Selected range displayed as "May 12 – May 18, 2026" in the trigger button                      | [ ]    |
| T-050-06 | Default: "This Month" on first load                                                            | [ ]    |
| T-050-07 | Store selected range in URL search params (`?from=2026-05-12&to=2026-05-18`) for shareability  | [ ]    |
| T-050-08 | Pass `from`/`to` as query params to `GET /api/dashboard/metrics` — filter `appliedAt` range    | [ ]    |
| T-050-09 | Pass `from`/`to` to `GET /api/reminders` — filter `followUpAt` range                           | [ ]    |
| T-050-10 | Pass `from`/`to` to `GET /api/activity` — filter `createdAt` range                             | [ ]    |
| T-050-11 | "All Time" preset: omit date params entirely — no filtering                                    | [ ]    |
| T-050-12 | Dark mode: picker popover and preset buttons styled with `dark:` classes                       | [ ]    |
| T-050-13 | Write RTL test: date range picker renders with default "This Month" label                      | [ ]    |
| T-050-14 | Write RTL test: selecting "This Week" preset updates the displayed label                       | [ ]    |
| T-050-15 | `npm test` — all tests pass                                                                    | [ ]    |
| T-050-16 | `npm run build` — no errors                                                                    | [ ]    |

---

### PBI-051 — Dashboard Layout Restructure

> Depends on PBI-047, PBI-048, PBI-049, PBI-050 all passing `npm test` and `npm run build`.

#### Layout

| Task     | Description                                                                                            | Status |
| -------- | ------------------------------------------------------------------------------------------------------ | ------ |
| T-051-01 | Redesign `app/dashboard/page.tsx` — new two-column card grid layout matching mock-up                   | [ ]    |
| T-051-02 | Top section: greeting ("Good evening, [name] 👋") + subtitle + date range picker + bell                | [ ]    |
| T-051-03 | Pipeline Overview bar: horizontal stage-progress row — Applied → Screening → Interview → Offer → Hired | [ ]    |
| T-051-04 | Pipeline bar shows count per stage + delta vs previous period ("+ 3 this week")                        | [ ]    |
| T-051-05 | Left column (60%): Upcoming panel (reminders) + Recent Activity feed                                   | [ ]    |
| T-051-06 | Right column (40%): Application Analytics donut chart + Tasks panel (reminders reused)                 | [ ]    |
| T-051-07 | "View calendar →" link in Upcoming panel → `/dashboard/reminders`                                      | [ ]    |
| T-051-08 | Tasks panel: "X / Y completed" progress bar where Y = total reminders, X = non-overdue                 | [ ]    |
| T-051-09 | All panels are dark-mode-aware via `dark:` classes from PBI-047                                        | [ ]    |

#### Sidebar

| Task     | Description                                                                                       | Status |
| -------- | ------------------------------------------------------------------------------------------------- | ------ |
| T-051-10 | Redesign sidebar to match mock-up: icon + label nav items, collapsible on mobile                  | [ ]    |
| T-051-11 | Nav items: Dashboard, Applications, Pipeline, Contacts, Reminders, Analytics, Documents, Settings | [ ]    |
| T-051-12 | Active state: highlighted background matching mock-up blue                                        | [ ]    |
| T-051-13 | Bottom of sidebar: user avatar, name, email                                                       | [ ]    |
| T-051-14 | Sidebar collapses to icon-only on screens < 768px                                                 | [ ]    |

#### Typography + polish

| Task     | Description                                                                                           | Status |
| -------- | ----------------------------------------------------------------------------------------------------- | ------ |
| T-051-15 | Import `Geist` or `DM Sans` from `next/font/google` — replace default font                            | [ ]    |
| T-051-16 | Card components: subtle border (`border border-gray-200 dark:border-gray-700`), rounded-xl, shadow-sm | [ ]    |
| T-051-17 | Stage badges: pill style matching mock-up (Interview = yellow, Offer = green, etc.)                   | [ ]    |
| T-051-18 | All interactive elements have visible focus rings for accessibility                                   | [ ]    |
| T-051-19 | Mobile responsive at 375px — single column, sidebar becomes bottom tab bar or hamburger               | [ ]    |

#### Testing

| Task     | Description                                                                                   | Status |
| -------- | --------------------------------------------------------------------------------------------- | ------ |
| T-051-20 | Write RTL test: dashboard renders greeting with user name                                     | [ ]    |
| T-051-21 | Write RTL test: pipeline overview bar renders all 5 stage labels                              | [ ]    |
| T-051-22 | Write RTL test: upcoming panel renders reminder items                                         | [ ]    |
| T-051-23 | Write RTL test: tasks panel renders progress bar                                              | [ ]    |
| T-051-24 | `npm test` — all tests pass                                                                   | [ ]    |
| T-051-25 | `npm run build` — no errors                                                                   | [ ]    |
| T-051-26 | Manual: full visual review in light mode and dark mode at desktop (1280px) and mobile (375px) | [ ]    |

---

## Definition of Done Checklist (per PBI)

Before marking any PBI `[x]`:

- [x] All tasks for the PBI are marked `[x]`
- [x] `npx tsc --noEmit` — zero TypeScript errors
- [x] `npm run lint` — zero warnings
- [x] `npm test` — all tests pass (no regressions)
- [x] `npm run build` — clean build
- [x] Pushed to `feature/sprint-06b-ui-upgrade` — Vercel preview deployment passes
- [x] PBI marked `[x]` in `product.md`

---

## Sprint Setup Checklist

- [x] Sprint 6 Phase 3 gate confirmed closed before starting
- [x] Create branch: `git checkout develop && git pull && git checkout -b feature/sprint-06b-ui-upgrade`
- [x] Push branch: `git push -u origin feature/sprint-06b-ui-upgrade`
- [x] Confirm branch appears in GitHub

---

## Test Inventory — Sprint 6B Additions

| File                                   | Tests   | Covers                              |
| -------------------------------------- | ------- | ----------------------------------- |
| `__tests__/ThemeToggle.test.tsx`       | 2       | PBI-047 toggle renders + class flip |
| `__tests__/api.activity.test.ts`       | 2       | PBI-048 GET 401 + 200               |
| `__tests__/ActivityFeed.test.tsx`      | 2       | PBI-048 component                   |
| `__tests__/NotificationBell.test.tsx`  | 3       | PBI-049 badge + dropdown            |
| `__tests__/DateRangePicker.test.tsx`   | 2       | PBI-050 default label + preset      |
| `__tests__/Dashboard.test.tsx`         | 4       | PBI-051 layout                      |
| **Sprint 6B additions**                | **15**  |                                     |
| **Running RTL total (after Sprint 6)** | **122** |                                     |

---

## Sprint Review (complete at close)

**Date completed:** _TBC_

### PBI Completion

| PBI     | Item                         | Done? | Notes |
| ------- | ---------------------------- | ----- | ----- |
| PBI-047 | Dark mode toggle             | [x]   |       |
| PBI-048 | Activity log                 | [x]   |       |
| PBI-049 | Notification bell            | [x]   |       |
| PBI-050 | Date range filter            | [x]   |       |
| PBI-051 | Dashboard layout restructure | [x]   |       |

### Sprint Goal Met?

- [x] Yes — sprint goal achieved in full
- [x] Partial — see notes

---

## Sprint Retrospective (complete at close)

**Date completed:** _TBC_

### What went well?

_Complete at sprint close._

### What didn't go well?

_Complete at sprint close._

---

## Carry-Forward Decisions

- Dark mode `dark:` classes must be added at the time of component authoring — retroactively adding them is expensive. All new components from this sprint forward must include `dark:` variants.
- `react-day-picker` v8 requires `date-fns` v3 as a peer — do not upgrade either independently
- Activity log writes must never throw — always fire-and-forget with error logging; user-facing mutations must not fail because of a logging write
- `ActivityLog` entries for deleted applications retain `applicationId` for reference but the relation becomes a dangling FK — add `onDelete: SetNull` to the `applicationId` field so Prisma handles this cleanly
- Never use `window.confirm()` — use inline `confirmingDelete` state pattern (established in Sprint 4)
- All new components must have `htmlFor`/`id` pairs on form labels/inputs

---

_sprint-06b.md v1.0 — 26 May 2026 — HireFlow_
_Drafted at Sprint 6B planning. Update status markers daily. Complete Review and Retro sections at sprint close._
