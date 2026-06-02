# HireFlow — Plan Document

**Document Type:** Scrum Master Artifact
**Version:** 2.0
**Date:** April 20, 2026
**Status:** Active
**Author:** Scrum Master
**Repository:** https://github.com/eonerhime/hireflow-track

---

## Cross-References

| Document               | Relationship                                                           |
| ---------------------- | ---------------------------------------------------------------------- |
| `product.md`           | Upstream source — PBIs, release phases, sizing used to build this plan |
| `spec.md`              | Downstream — sprint dates here lock spec authoring windows             |
| `sprints/sprint-XX.md` | One file per sprint; dates and PBIs drawn from this document           |
| `linkedin.md`          | Week labels in linkedin.md map to calendar dates defined here          |
| `implementation.md`    | Technical decisions; sprint gates reference implementation status      |
| `testing.md`           | DoD test requirements defined here; results logged there               |

---

## Table of Contents

1. [Project Calendar](#1-project-calendar)
2. [Capacity Model](#2-capacity-model)
3. [Sprint Allocation](#3-sprint-allocation)
4. [Definition of Done](#4-definition-of-done)
5. [Sprint Summary Table](#5-sprint-summary-table)
6. [Phase Gates](#6-phase-gates)
7. [Risk Register](#7-risk-register)

---

## 1. Project Calendar

### Timeline Overview

| Period           | Label            | Start Date      | End Date    | Duration                 |
| ---------------- | ---------------- | --------------- | ----------- | ------------------------ |
| Pre-Sprint Posts | Weeks 1–2        | 21 Apr 2026     | 02 May 2026 | Concurrent with Sprint 2 |
| Sprint 1         | Week 1           | 18 Apr 2026     | 20 Apr 2026 | 3 days ✅ Done           |
| Sprint 2         | Week 2           | 21 Apr 2026     | 27 Apr 2026 | 1 week                   |
| Sprint 3         | Week 3           | 28 Apr 2026     | 04 May 2026 | 1 week                   |
| Sprint 4         | Week 4           | 05 May 2026     | 11 May 2026 | 1 week                   |
| Sprint 5         | Week 5           | 12 May 2026     | 18 May 2026 | 1 week                   |
| Sprint 6         | Week 6           | 19 May 2026     | 25 May 2026 | 1 week                   |
| Buffer           | Week 7           | 26 May 2026     | 31 May 2026 | 5 days                   |
| **Full Release** | **Week 6 Close** | **25 May 2026** | —           | —                        |

**Project start:** 21 April 2026 (first Tuesday post slot — Post 01)
**MVP target:** 04 May 2026 (Sprint 3 close)
**Full release target:** 25 May 2026 (Sprint 6 close)
**Capacity:** 8 hours/day, 7 days/week
**Sprint duration:** 1 week each (Sprints 2–6)
**Sprint 1 actual:** 18–20 April 2026 — completed ahead of schedule

**Note on Pre-Sprint posts:** LinkedIn posts 01–06 run starting 21 April concurrently with Sprint 2 coding. Sprint 1 posts (07–12) are published weeks 5–6 — the audience does not know Sprint 1 completed ahead of schedule.

---

### Week-by-Week Calendar

#### Pre-Sprint — Weeks 1 & 2

| Date        | Day      | Activity                                      | LinkedIn Post |
| ----------- | -------- | --------------------------------------------- | ------------- |
| 22 Apr 2026 | Tuesday  | Publish Post 01 — Project Announcement        | Post 01       |
| 24 Apr 2026 | Thursday | Publish Post 02 — The Problem HireFlow Solves | Post 02       |
| 25 Apr 2026 | Saturday | Publish Post 03 — What is SDD                 | Post 03       |
| 28 Apr 2026 | Tuesday  | Publish Post 04 — product.md explained        | Post 04       |
| 29 Apr 2026 | Thursday | Publish Post 05 — Building the Backlog        | Post 05       |
| 02 May 2026 | Saturday | Publish Post 06 — The 6 Strategies            | Post 06       |

**Pre-sprint deliverables (before Sprint 1 kickoff):**

- [ ] GitHub repository created (`hireflow-track`, public, Node.js `.gitignore`)
- [ ] `README.md` placeholder committed to `main` (GitHub requires this at repo creation)
- [ ] `develop` branch created from `main` immediately — before any further commits
- [ ] Branch protection enabled on `main` (Settings → Branches → Require PR before merging)
- [ ] All subsequent commits go to `develop` — never directly to `main`
- [ ] `/docs` directory created on `develop` — name must be `docs`, not `spec` or any other name; cross-references throughout all SDD documents depend on this exact path
- [ ] All SDD documents committed to `/docs` on `develop`: `product.md`, `plan.md`, `spec.md`, `linkedin.md`, `notion-setup.md`, `features.md`, `tasks.md`, `implementation.md`, `testing.md`
- [ ] `/docs/sprints/` subdirectory created; `sprint-01.md` committed there
- [ ] Branch strategy documented in `README.md` and `implementation.md`
- [ ] Notion workspace created and shared publicly (follow `notion-setup.md`)
- [ ] Canva brand kit and carousel template set up (see linkedin.md)
- [ ] Neon PostgreSQL instance provisioned (free at neon.tech — no credit card required)
- [ ] Vercel project connected to GitHub repo (dev environment — preview on `develop` push)

---

#### Sprint 1 — Weeks 3–4 (06 May – 19 May 2026)

| Date        | Day       | Activity                                                  | LinkedIn Post |
| ----------- | --------- | --------------------------------------------------------- | ------------- |
| 06 May 2026 | Wednesday | **Sprint 1 Planning** — kickoff, goal set, backlog pulled | —             |
| 09 May 2026 | Saturday  | Mid-sprint checkpoint (self-review)                       | —             |
| 12 May 2026 | Tuesday   | Publish Post 07 — Sprint 1 Goal                           | Post 07       |
| 14 May 2026 | Thursday  | Publish Post 08 — First Commit                            | Post 08       |
| 16 May 2026 | Saturday  | Publish Post 09 — Auth is Live                            | Post 09       |
| 19 May 2026 | Tuesday   | **Sprint 1 Review + Retro** — close sprint                | —             |
| 19 May 2026 | Tuesday   | Publish Post 10 — Retro Insight                           | Post 10       |
| 21 May 2026 | Thursday  | Publish Post 11 — Sprint 1 Carousel                       | Post 11       |
| 23 May 2026 | Saturday  | Publish Post 12 — implementation.md                       | Post 12       |

---

#### Sprint 2 — Weeks 5–6 (20 May – 02 Jun 2026)

| Date        | Day       | Activity                                                  | LinkedIn Post |
| ----------- | --------- | --------------------------------------------------------- | ------------- |
| 20 May 2026 | Wednesday | **Sprint 2 Planning** — kickoff, goal set, backlog pulled | —             |
| 23 May 2026 | Saturday  | Mid-sprint checkpoint (self-review)                       | —             |
| 26 May 2026 | Tuesday   | Publish Post 13 — First Feature Shipped                   | Post 13       |
| 28 May 2026 | Thursday  | Publish Post 14 — Writing Tests First                     | Post 14       |
| 30 May 2026 | Saturday  | Publish Post 15 — Kanban Pipeline                         | Post 15       |
| 02 Jun 2026 | Tuesday   | **Sprint 2 Review + Retro** — close sprint                | —             |
| 02 Jun 2026 | Tuesday   | Publish Post 16 — Retro Insight                           | Post 16       |
| 04 Jun 2026 | Thursday  | Publish Post 17 — Sprint 2 Carousel                       | Post 17       |
| 06 Jun 2026 | Saturday  | Publish Post 18 — What the Spec Drove                     | Post 18       |

---

#### Sprint 3 — Weeks 7–8 (03 Jun – 16 Jun 2026)

| Date        | Day       | Activity                                                  | LinkedIn Post |
| ----------- | --------- | --------------------------------------------------------- | ------------- |
| 03 Jun 2026 | Wednesday | **Sprint 3 Planning** — kickoff, goal set, backlog pulled | —             |
| 07 Jun 2026 | Sunday    | Mid-sprint checkpoint (self-review)                       | —             |
| 09 Jun 2026 | Tuesday   | Publish Post 19 — Contact Tracking                        | Post 19       |
| 11 Jun 2026 | Thursday  | Publish Post 20 — Dashboard Metrics                       | Post 20       |
| 13 Jun 2026 | Saturday  | Publish Post 21 — Reminder System                         | Post 21       |
| 16 Jun 2026 | Tuesday   | **Sprint 3 Review + Retro** — close sprint · MVP GATE     | —             |
| 16 Jun 2026 | Tuesday   | Publish Post 22 — MVP is Live                             | Post 22       |
| 18 Jun 2026 | Thursday  | Publish Post 23 — Sprint 3 Carousel                       | Post 23       |
| 20 Jun 2026 | Saturday  | Publish Post 24 — Phase 1 Retrospective                   | Post 24       |

---

#### Sprint 4 — Weeks 9–10 (17 Jun – 30 Jun 2026)

| Date        | Day       | Activity                                                  | LinkedIn Post |
| ----------- | --------- | --------------------------------------------------------- | ------------- |
| 17 Jun 2026 | Wednesday | **Sprint 4 Planning** — kickoff, goal set, backlog pulled | —             |
| 21 Jun 2026 | Sunday    | Mid-sprint checkpoint (self-review)                       | —             |
| 23 Jun 2026 | Tuesday   | Publish Post 25 — Interview Notes                         | Post 25       |
| 25 Jun 2026 | Thursday  | Publish Post 26 — API Rate Limiting                       | Post 26       |
| 30 Jun 2026 | Tuesday   | **Sprint 4 Review + Retro** — close sprint                | —             |
| 30 Jun 2026 | Tuesday   | Publish Post 27 — Sprint 4 Retro Insight                  | Post 27       |
| 02 Jul 2026 | Thursday  | Publish Post 28 — Sprint 4 Carousel                       | Post 28       |

---

#### Sprint 5 — Weeks 11–12 (01 Jul – 14 Jul 2026)

| Date        | Day       | Activity                                                  | LinkedIn Post |
| ----------- | --------- | --------------------------------------------------------- | ------------- |
| 01 Jul 2026 | Wednesday | **Sprint 5 Planning** — kickoff, goal set, backlog pulled | —             |
| 05 Jul 2026 | Sunday    | Mid-sprint checkpoint (self-review)                       | —             |
| 07 Jul 2026 | Tuesday   | Publish Post 29 — Resume Version Linking                  | Post 29       |
| 09 Jul 2026 | Thursday  | Publish Post 30 — Email Notifications                     | Post 30       |
| 14 Jul 2026 | Tuesday   | **Sprint 5 Review + Retro** — close sprint                | —             |
| 14 Jul 2026 | Tuesday   | Publish Post 31 — Sprint 5 Retro Insight                  | Post 31       |
| 16 Jul 2026 | Thursday  | Publish Post 32 — Sprint 5 Carousel                       | Post 32       |

---

#### Sprint 6 — Weeks 13–14 (15 Jul – 28 Jul 2026)

| Date        | Day       | Activity                                                       | LinkedIn Post |
| ----------- | --------- | -------------------------------------------------------------- | ------------- |
| 15 Jul 2026 | Wednesday | **Sprint 6 Planning** — kickoff, goal set, backlog pulled      | —             |
| 19 Jul 2026 | Sunday    | Mid-sprint checkpoint (self-review)                            | —             |
| 21 Jul 2026 | Tuesday   | Publish Post 33 — Outcome Analytics                            | Post 33       |
| 23 Jul 2026 | Thursday  | Publish Post 34 — Google OAuth                                 | Post 34       |
| 28 Jul 2026 | Tuesday   | **Sprint 6 Review + Retro** — close sprint · FULL RELEASE GATE | —             |
| 28 Jul 2026 | Tuesday   | Publish Post 35 — Sprint 6 Retro Insight                       | Post 35       |
| 30 Jul 2026 | Thursday  | Publish Post 36 — Sprint 6 Carousel (Full Release)             | Post 36       |
| 01 Aug 2026 | Saturday  | Publish Post 37 — The Complete HireFlow Build Story            | Post 37       |

---

## 2. Capacity Model

### Assumptions

HireFlow is a solo project. The developer is also Product Owner, Scrum Master, Tester, and Documenter. Capacity must account for all five roles, not just implementation time.

**Available hours per week:** 10 hours
**Sprint duration:** 2 weeks
**Raw hours per sprint:** 20 hours

### Role Time Allocation Per Sprint

| Role          | % of Capacity | Hours per Sprint | Activities                                                  |
| ------------- | ------------- | ---------------- | ----------------------------------------------------------- |
| Developer     | 55%           | 11 hours         | Implementation, debugging, code review                      |
| Tester        | 20%           | 4 hours          | RTL tests, integration tests, E2E (Sprint 6)                |
| Documenter    | 10%           | 2 hours          | spec.md authoring, implementation.md updates, sprint-XX.md  |
| Product Owner | 10%           | 2 hours          | Backlog refinement, acceptance criteria review, PBI updates |
| Scrum Master  | 5%            | 1 hour           | Planning, retro, checkpoint, linkedin.md post publishing    |

**Net implementation capacity:** 11 hours per sprint

### Sizing Reference (from product.md)

| Size | Effort    | Hours Modelled As |
| ---- | --------- | ----------------- |
| S    | < 2 hours | 1.5 hours         |
| M    | 2–4 hours | 3 hours           |
| L    | 4–8 hours | 6 hours           |
| XL   | > 8 hours | Decompose         |

### Capacity vs. Backlog Fit Check

| Sprint   | PBIs Planned                           | S Count | M Count | L Count | Est. Hours | Capacity | Fit      |
| -------- | -------------------------------------- | ------- | ------- | ------- | ---------- | -------- | -------- |
| Sprint 1 | PBI-001–008, PBI-037, PBI-039, PBI-046 | 5       | 4       | 0       | 19.5       | 11 dev   | ✅ Tight |
| Sprint 2 | PBI-009–016, PBI-040                   | 1       | 4       | 4       | 40.5       | 11 dev   | ⚠️ Heavy |
| Sprint 3 | PBI-017–025, PBI-043                   | 2       | 8       | 0       | 27         | 11 dev   | ⚠️ Heavy |
| Sprint 4 | PBI-026–031, PBI-038, PBI-041, PBI-044 | 0       | 5       | 4       | 39         | 11 dev   | ⚠️ Heavy |
| Sprint 5 | PBI-032–034, PBI-022–023               | 1       | 2       | 2       | 19.5       | 11 dev   | ✅ Tight |
| Sprint 6 | PBI-035–036, PBI-042, PBI-045 (final)  | 1       | 2       | 1       | 13.5       | 11 dev   | ✅ Fit   |

**Note on ⚠️ Heavy sprints:** Sprints 2, 3, and 4 are load-heavy when all PBIs are sized raw. The Scrum Master will use the first mid-sprint checkpoint of each heavy sprint to reassess progress and apply the overflow rule below.

**Overflow rule:** If more than 30% of planned PBIs are not in progress by the mid-sprint checkpoint, one PBI is deprioritised to the next sprint's backlog. Overflow items are added to the next sprint's planning session, not dropped.

---

## 3. Sprint Allocation

### Sprint 1 — Foundation & Auth

**Sprint Goal:** The project infrastructure is live and a user can register and log in securely.
**Dates:** 06 May – 19 May 2026
**Phase:** Phase 1 (MVP)

| PBI     | Item                                                | Size | Priority | Assigned Role    |
| ------- | --------------------------------------------------- | ---- | -------- | ---------------- |
| PBI-007 | GitHub repository + branch strategy                 | S    | 🔴       | Developer        |
| PBI-001 | Next.js project scaffold with TypeScript + Tailwind | S    | 🔴       | Developer        |
| PBI-002 | PostgreSQL database setup on Railway                | S    | 🔴       | Developer        |
| PBI-039 | HTTPS + security headers (Next.js config)           | S    | 🔴       | Developer        |
| PBI-046 | Notion workspace setup and public share             | S    | 🔴       | Scrum Master     |
| PBI-003 | Prisma ORM setup + initial schema                   | M    | 🔴       | Developer        |
| PBI-004 | User registration (email/password + bcrypt)         | M    | 🔴       | Developer        |
| PBI-005 | User login + JWT session management                 | M    | 🔴       | Developer        |
| PBI-006 | Protected route middleware                          | S    | 🔴       | Developer        |
| PBI-037 | Input validation (Zod — server and client)          | M    | 🔴       | Developer/Tester |
| PBI-008 | Vercel deployment (dev environment)                 | S    | 🔴       | Developer        |

**Sprint 1 DoD Gate:** Auth flow (register → login → protected route) working end-to-end. Deployed to Vercel dev. Zod validation active on all auth inputs. Security headers set. Notion workspace live. RTL tests written for auth components.

---

### Sprint 2 — Core Pipeline

**Sprint Goal:** A logged-in user can create, view, edit, delete, and progress applications through a 6-stage Kanban pipeline.
**Dates:** 20 May – 02 Jun 2026
**Phase:** Phase 1 (MVP)

| PBI     | Item                                             | Size | Priority | Assigned Role |
| ------- | ------------------------------------------------ | ---- | -------- | ------------- |
| PBI-009 | Application data model (schema + migration)      | M    | 🔴       | Developer     |
| PBI-010 | Add new application (form + API + DB write)      | M    | 🔴       | Developer     |
| PBI-011 | View all applications (dashboard list/card view) | M    | 🔴       | Developer     |
| PBI-012 | Edit application details                         | M    | 🔴       | Developer     |
| PBI-013 | Delete application (soft delete)                 | S    | 🔴       | Developer     |
| PBI-014 | 6-stage Kanban pipeline view                     | L    | 🔴       | Developer     |
| PBI-015 | Drag-and-drop stage progression                  | L    | 🔴       | Developer     |
| PBI-016 | Application detail page                          | M    | 🔴       | Developer     |
| PBI-040 | React Testing Library — core component suite     | L    | 🔴       | Tester        |

**Sprint 2 DoD Gate:** Full application CRUD working. Kanban pipeline renders all 6 stages with drag-and-drop. Application detail page accessible. RTL test suite covers core pipeline components. No console errors in production build.

---

### Sprint 3 — Contacts + Reminders + Dashboard

**Sprint Goal:** The MVP is complete. Users can track contacts, set reminders, and see their pipeline state at a glance on the dashboard.
**Dates:** 03 Jun – 16 Jun 2026
**Phase:** Phase 1 (MVP) — Phase Gate at sprint close

| PBI     | Item                                                  | Size | Priority | Assigned Role |
| ------- | ----------------------------------------------------- | ---- | -------- | ------------- |
| PBI-017 | Contact data model (linked to application)            | M    | 🔴       | Developer     |
| PBI-018 | Add / edit contact per application                    | M    | 🔴       | Developer     |
| PBI-019 | Contact list view on application detail page          | S    | 🔴       | Developer     |
| PBI-020 | Follow-up date field on application                   | S    | 🔴       | Developer     |
| PBI-021 | Overdue follow-up indicator on dashboard              | M    | 🔴       | Developer     |
| PBI-024 | Summary stats bar (total, active, interviews, offers) | M    | 🔴       | Developer     |
| PBI-025 | Pipeline stage distribution (visual)                  | M    | 🟠       | Developer     |
| PBI-029 | General notes field per application                   | S    | 🟠       | Developer     |
| PBI-043 | README.md (project overview, setup, architecture)     | M    | 🔴       | Documenter    |

**Sprint 3 DoD Gate:** All 28 Must Have PBIs complete. App live on Vercel production URL. Dashboard renders summary stats and pipeline chart. Contact tracking and reminders functional. README complete and accurate. Core RTL tests passing. **MVP Phase Gate cleared.**

---

### Sprint 4 — Notes + Metrics + API Hardening

**Sprint Goal:** The product is enhanced with interview notes, advanced metrics, and hardened API security. Documentation is complete.
**Dates:** 17 Jun – 30 Jun 2026
**Phase:** Phase 2 (Enhanced)

| PBI     | Item                                                 | Size | Priority | Assigned Role |
| ------- | ---------------------------------------------------- | ---- | -------- | ------------- |
| PBI-026 | Conversion rate metric (applied → interview → offer) | M    | 🟡       | Developer     |
| PBI-027 | Time-in-stage metric per application                 | L    | 🟡       | Developer     |
| PBI-030 | Interview notes per stage                            | M    | 🟠       | Developer     |
| PBI-031 | Notes history / timeline view                        | M    | 🟡       | Developer     |
| PBI-038 | API rate limiting                                    | M    | 🟠       | Developer     |
| PBI-041 | Integration tests — API routes                       | L    | 🟠       | Tester        |
| PBI-044 | API documentation (OpenAPI / inline comments)        | M    | 🟠       | Documenter    |

**Sprint 4 DoD Gate:** Interview notes functional per stage with timeline view. Conversion rate and time-in-stage metrics rendering. API rate limiting active. Integration tests passing for all critical routes. API docs committed.

---

### Sprint 5 — Resume Management + Email Reminders

**Sprint Goal:** Users can link resume versions to applications and receive email reminders for follow-up dates.
**Dates:** 01 Jul – 14 Jul 2026
**Phase:** Phase 2 (Enhanced)

| PBI     | Item                                        | Size | Priority | Assigned Role |
| ------- | ------------------------------------------- | ---- | -------- | ------------- |
| PBI-022 | Reminder list / upcoming actions view       | M    | 🟠       | Developer     |
| PBI-023 | Email notification for due reminders        | L    | 🟡       | Developer     |
| PBI-032 | Resume version label field per application  | S    | 🟡       | Developer     |
| PBI-033 | Resume file upload and storage              | L    | 🟡       | Developer     |
| PBI-034 | Link specific resume version to application | M    | 🟡       | Developer     |

**Sprint 5 DoD Gate:** Reminder list view functional. Email notifications sending for overdue/due reminders. Resume version labels, uploads, and linking working end-to-end. Storage provider integrated and tested. Phase 2 acceptance gate cleared.

---

### Sprint 6 — Analytics + Export + OAuth + E2E

**Sprint Goal:** The full release is complete. All Could Have items are shipped, E2E tests are passing, and the portfolio showcase is complete.
**Dates:** 15 Jul – 28 Jul 2026
**Phase:** Phase 3 (Full Release) — Phase Gate at sprint close

| PBI     | Item                               | Size | Priority | Assigned Role |
| ------- | ---------------------------------- | ---- | -------- | ------------- |
| PBI-035 | CSV export of application history  | M    | 🟡       | Developer     |
| PBI-036 | Google OAuth login                 | M    | 🟡       | Developer     |
| PBI-042 | E2E tests — critical user journeys | L    | 🟡       | Tester        |
| PBI-045 | LinkedIn post per sprint (final)   | S    | 🔴       | Scrum Master  |

**Sprint 6 DoD Gate:** CSV export working. Google OAuth functional alongside email/password auth. E2E tests passing for all critical user journeys. All 46 PBIs complete. Final LinkedIn posts published. **Full Release Phase Gate cleared.**

---

## 4. Definition of Done

The Definition of Done (DoD) applies to every PBI. An item is Done only when all applicable criteria are met. Partial completion is not Done.

### Universal DoD — All PBIs

- [ ] Acceptance criteria (from spec.md) are met in full
- [ ] Code is committed to the correct feature branch
- [ ] Pull request reviewed and merged to `main` (self-review with checklist)
- [ ] No TypeScript compiler errors (`tsc --noEmit` passes)
- [ ] No ESLint errors or warnings on changed files
- [ ] No console errors in the browser on affected pages
- [ ] Tested manually against acceptance criteria before marking Done
- [ ] PBI status updated to `[x]` in `product.md`
- [ ] PBI status updated to `[x]` in the active `sprint-XX.md`

### DoD — Frontend PBIs (any UI component or page)

All universal criteria, plus:

- [ ] RTL test written covering the component's primary behaviour
- [ ] RTL test passes (`npm test` clean run)
- [ ] Component renders correctly at 375px viewport (mobile)
- [ ] Component renders correctly at 1280px viewport (desktop)
- [ ] No inline styles — all styling via Tailwind utility classes

### DoD — Backend PBIs (any API route or DB operation)

All universal criteria, plus:

- [ ] API route responds with correct HTTP status codes (200, 201, 400, 401, 404, 500)
- [ ] Input validated with Zod on both server and client (where applicable)
- [ ] Protected routes return 401 if request is unauthenticated
- [ ] No raw SQL — all DB access via Prisma
- [ ] Error states handled and return a consistent JSON error shape
- [ ] Integration test written and passing (from Sprint 4 onward)

### DoD — Documentation PBIs

All universal criteria, plus:

- [ ] Document committed to correct location in repo
- [ ] Cross-references in other documents updated if affected
- [ ] Notion workspace reflects new document or update

### DoD — Testing PBIs

All universal criteria, plus:

- [ ] Test suite runs to completion with no failures (`npm test`)
- [ ] Test coverage report reviewed
- [ ] Test cases match spec.md acceptance criteria exactly
- [ ] Test results logged in `testing.md`

### DoD — Sprint Close (Scrum Master)

Before a sprint is marked Closed in `sprint-XX.md`:

- [ ] All committed PBIs are Done (or formally moved to next sprint with documented reason)
- [ ] Sprint retrospective notes written in `sprint-XX.md`
- [ ] `product.md` PBI statuses updated
- [ ] LinkedIn sprint carousel content filled in (slide 5 test coverage, slide 6 retro)
- [ ] Notion workspace updated
- [ ] Sprint close date recorded in this document

---

## 5. Sprint Summary Table

Track sprint status here. Update at each sprint close.

| Sprint   | Dates              | Goal                                   | PBI Count | Status         | Close Date  | Notes                       |
| -------- | ------------------ | -------------------------------------- | --------- | -------------- | ----------- | --------------------------- |
| Sprint 1 | 18–20 Apr 2026     | Foundation + Auth                      | 11        | ✅ Closed      | 20 Apr 2026 | Completed ahead of schedule |
| Sprint 2 | 21–27 Apr 2026     | Core Pipeline                          | 9         | ✅ Closed      | 22 Apr 2026 | Completed ahead of schedule |
| Sprint 3 | 28 Apr–04 May 2026 | Contacts + Reminders + Dashboard (MVP) | 9         | ✅ Closed      | 24 Apr 2026 | Completed ahead of schedule |
| Sprint 4 | 05–11 May 2026     | Notes + Metrics + API Hardening        | 7         | ✅ Closed      | 03 May 2026 | Completed ahead of schedule |
| Sprint 5 | 12–18 May 2026     | Resume Management + Email Reminders    | 5         | ✅ Closed      | 26 May 2026 | Completed behind schedule   |
| Sprint 6 | 19–25 May 2026     | Analytics + Export + OAuth + E2E       | 4         | 🔲 Not started | —           |                             |

**Status markers:** 🔲 Not started | 🔄 In progress | ✅ Closed | ⚠️ Overflow

---

## 6. Phase Gates

Phase gates are hard checkpoints. The next phase does not begin until the gate is cleared.

### Phase 1 Gate — MVP (Sprint 3 Close: 04 May 2026)

| Gate Criterion                                                | Status |
| ------------------------------------------------------------- | ------ |
| All 28 Must Have PBIs complete and marked `[x]` in product.md | [ ]    |
| Application live on Vercel production URL                     | [ ]    |
| Core RTL test suite passing with no failures                  | [ ]    |
| README.md committed and accurate                              | [ ]    |
| Notion workspace updated and publicly accessible              | [ ]    |
| Sprint 3 retro completed and documented                       | [ ]    |
| Post 22 (MVP is Live) published on LinkedIn                   | [ ]    |

**Gate cleared:** _(date to be recorded)_

---

### Phase 2 Gate — Enhanced (Sprint 5 Close)

| Gate Criterion                                                 | Status |
| -------------------------------------------------------------- | ------ |
| All 7 Should Have PBIs complete and marked `[x]` in product.md | [x]    |
| Integration tests passing for all critical API routes          | [x]    |
| API documentation committed                                    | [x]    |
| Notion workspace updated                                       | [x]    |
| Sprint 5 retro completed and documented                        | [x]    |

**Sprint 4 progress:** 6 of 7 Should Have PBIs complete (PBI-022 — Reminder list view — remains; scheduled for Sprint 5). Integration tests and API docs delivered in Sprint 4.

**Gate cleared: 26 May 2026**

---

### Phase 3 Gate — Full Release (Sprint 6 Close: 25 May 2026)

| Gate Criterion                                                 | Status |
| -------------------------------------------------------------- | ------ |
| All 10 Could Have PBIs complete and marked `[x]` in product.md | [ ]    |
| E2E tests passing for all critical user journeys               | [ ]    |
| All 46 PBIs marked `[x]` in product.md                         | [ ]    |
| LinkedIn showcase complete (Posts 01–37 published)             | [ ]    |
| Sprint 6 retro completed and documented                        | [ ]    |
| Post 37 (long-form retrospective) published on LinkedIn        | [ ]    |

**Gate cleared:** _(date to be recorded)_

---

## 7. Risk Register

| ID  | Risk                                                         | Likelihood | Impact | Mitigation                                                                                       |
| --- | ------------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------------------------ |
| R01 | Sprint 2 is overloaded (Kanban + D&D + RTL in 2 weeks)       | High       | Medium | Drag-and-drop (PBI-015) is deprioritised first if mid-sprint checkpoint shows slippage           |
| R02 | Sprint 3 load is heavy with MVP gate pressure                | Medium     | High   | PBI-025 (pipeline chart) moves to Sprint 4 if Sprint 3 is at risk; gate still passable without   |
| R03 | Email notifications (PBI-023) have third-party dependency    | Medium     | Medium | Resend (or equivalent) evaluated in Sprint 4; fallback is in-app notification only               |
| R04 | Resume file upload (PBI-033) requires storage provider setup | Medium     | Medium | Evaluate Cloudinary or Supabase Storage in Sprint 4; decision logged as ADR in implementation.md |
| R05 | LinkedIn posting discipline slips under development pressure | Medium     | Low    | Posts are pre-written; publishing takes < 5 minutes; treat as non-negotiable sprint ceremony     |
| R06 | Capacity model is optimistic for heavy sprints               | Medium     | Medium | Overflow rule (§2) activates at mid-sprint checkpoint; no sprint carries more than 1 overflow    |
| R07 | Google OAuth (PBI-036) blocked by app verification delays    | Low        | Medium | Begin OAuth app registration at Sprint 5 start; implement with unverified app first              |
| R08 | Vercel or Railway outage during demo/post publishing         | Low        | High   | Screenshot app state locally before any post that requires a live app screenshot                 |

---

_plan.md v2.1 — 03 May 2026 — HireFlow_
_Sprint 4 closed 03 May 2026 ahead of schedule. Sprint Summary Table and Phase 2 gate updated._
