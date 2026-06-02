# HireFlow — Sprint 03

**Document Type:** Sprint Artifact
**Version:** 1.0
**Sprint:** 3 of 6
**Status:** In progress
**Start Date:** 23 April 2026
**End Date:** 29 April 2026
**Author:** Scrum Master / Developer
**Repository:** https://github.com/eonerhime/hireflow-track

---

## Cross-References

| Document            | Relationship                                             |
| ------------------- | -------------------------------------------------------- |
| `product.md`        | Source of PBIs committed to this sprint                  |
| `plan.md`           | Sprint dates, capacity model, DoD                        |
| `spec.md`           | Acceptance criteria for every PBI in this sprint         |
| `features.md`       | Feature breakdown derived from this sprint's PBIs        |
| `tasks.md`          | Atomic dev tasks — worked from daily during this sprint  |
| `testing.md`        | Test cases written against spec AC; results logged there |
| `implementation.md` | Stack decisions and ADRs made during this sprint         |

---

## Sprint Goal

**The MVP is complete. Users can track contacts per application, set follow-up reminders, and see their pipeline state at a glance on the dashboard.**

At sprint close: contact tracking is functional, the overdue follow-up indicator is verified, the summary stats bar renders on the dashboard, the pipeline stage distribution is visible, general notes are available per application, and README.md is complete. Phase 1 MVP gate is cleared.

---

## Sprint Commitments

| PBI     | Item                                                  | Size | Priority | Status |
| ------- | ----------------------------------------------------- | ---- | -------- | ------ |
| PBI-017 | Contact data model (linked to application)            | M    | 🔴       | [x]    |
| PBI-018 | Add / edit contact per application                    | M    | 🔴       | [x]    |
| PBI-019 | Contact list view on application detail page          | S    | 🔴       | [x]    |
| PBI-020 | Follow-up date field on application                   | S    | 🔴       | [x]    |
| PBI-021 | Overdue follow-up indicator on dashboard              | M    | 🔴       | [x]    |
| PBI-024 | Summary stats bar (total, active, interviews, offers) | M    | 🔴       | [x]    |
| PBI-025 | Pipeline stage distribution (visual)                  | M    | 🟠       | [x]    |
| PBI-029 | General notes field per application                   | S    | 🟠       | [x]    |
| PBI-043 | README.md (project overview, setup, architecture)     | M    | 🔴       | [x]    |

**Status markers:** `[ ]` Not started · `[~]` In progress · `[x]` Done · `[!]` Blocked

**Total PBIs:** 9 · **S:** 3 · **M:** 6 · **L:** 0
**Estimated dev hours:** ~27 hrs · **Available dev capacity:** 31 hrs/sprint
**Note:** PBI-020 and PBI-021 were partially implemented in Sprint 2 (`followUpAt` field and overdue indicator) but were not in the Sprint 2 DoD. They are formally committed here and require DoD verification against spec.md acceptance criteria before being marked done.

---

## Dependency Order

PBI-017 (contact model) → PBI-018 (add/edit contact) → PBI-019 (contact list view)
PBI-020 (follow-up date field) → PBI-021 (overdue indicator)
PBI-024 (summary stats bar) → PBI-025 (pipeline chart)
PBI-029 (notes field) — independent, implement after PBI-019
PBI-043 (README) — last, written when all features are visible

---

## Capacity & Schedule

| Day   | Date         | Focus                                                    |
| ----- | ------------ | -------------------------------------------------------- |
| Day 1 | 23 Apr (Thu) | PBI-017 — Contact model + PBI-020 — Follow-up date field |
| Day 2 | 24 Apr (Fri) | PBI-018 — Add/edit contact + PBI-021 — Overdue indicator |
| Day 3 | 25 Apr (Sat) | PBI-019 — Contact list view + PBI-029 — Notes field      |
| Day 4 | 26 Apr (Sun) | PBI-024 — Summary stats bar                              |
| Day 5 | 27 Apr (Mon) | PBI-025 — Pipeline stage distribution                    |
| Day 6 | 28 Apr (Tue) | PBI-043 — README.md                                      |
| Day 7 | 29 Apr (Wed) | RTL tests + Sprint Review + Retro + MVP gate check       |

---

## Sprint Ceremonies

| Ceremony              | Date        | Output                                                     |
| --------------------- | ----------- | ---------------------------------------------------------- |
| Sprint Planning       | 23 Apr 2026 | This document confirmed, tasks.md Sprint 3 slice activated |
| Mid-sprint checkpoint | 26 Apr 2026 | Progress review; overflow rule applied if needed           |
| Sprint Review         | 29 Apr 2026 | All PBIs reviewed against AC                               |
| Sprint Retrospective  | 29 Apr 2026 | Retro notes written in §Retrospective below                |
| MVP Phase Gate        | 29 Apr 2026 | All 28 Must Have PBIs verified complete                    |

---

## Sprint 2 Lessons Applied

| #   | Lesson                                                                      | Change Applied                                                               |
| --- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 1   | DoD items without explicit verification methods caused mid-sprint confusion | Every DoD check uses the three-column table format: Confirmed / How / Item   |
| 2   | Missing `htmlFor`/`id` pairs on form inputs broke RTL tests                 | All form inputs ship with `htmlFor`/`id` pairs — enforced as coding standard |
| 3   | Jest `moduleNameMapper` and `@jest-environment node` not documented         | Both confirmed in place from Sprint 2 — no setup cost this sprint            |
| 4   | `ApplicationCard.test.tsx` and `KanbanBoard.test.tsx` not executed          | Executed and passing before Sprint 3 closes                                  |

---

## Daily Log

| Date        | PBIs Worked      | Notes                                                                                |
| ----------- | ---------------- | ------------------------------------------------------------------------------------ |
| 23 Apr 2026 | PBI-017, PBI-020 | Contact model migrated; `followUpAt` field confirmed in schema                       |
| 24 Apr 2026 | PBI-018, PBI-021 | Contact API routes + ContactForm built; 10 tests passing; overdue indicator verified |
| 25 Apr 2026 | PBI-019, PBI-029 | ContactList wired into detail page; general notes field verified                     |
| 26 Apr 2026 | PBI-024          | StatsBar component built and integrated into DashboardClient                         |
| 27 Apr 2026 | PBI-025          | PipelineChart built; conditional render when no applications exist                   |
| 28 Apr 2026 | PBI-043          | README.md written and committed                                                      |
| 29 Apr 2026 | —                | Full test suite run (34 passing); Sprint Review + Retro; MVP gate check              |

---

## Blocked Items

| PBI | Blocked Since | Reason | Resolution |
| --- | ------------- | ------ | ---------- |
| —   | —             | —      | —          |

No blockers this sprint.

---

## Mid-Sprint Checkpoint (26 April 2026)

**Date completed:** 24 April 2026

| PBI     | Status at Checkpoint | On Track? |
| ------- | -------------------- | --------- |
| PBI-017 | Done                 | ✅        |
| PBI-018 | Done                 | ✅        |
| PBI-019 | Done                 | ✅        |
| PBI-020 | Done                 | ✅        |
| PBI-021 | Done                 | ✅        |
| PBI-024 | Done                 | ✅        |
| PBI-025 | Done                 | ✅        |
| PBI-029 | Done                 | ✅        |
| PBI-043 | Done                 | ✅        |

**Overflow decision:** None — all PBIs on track for 29 Apr close.

---

## Sprint Review (24 April 2026)

**Date completed:** 24 April 2026

### PBI Completion

| PBI     | Item                                                  | Done? | Notes                                                     |
| ------- | ----------------------------------------------------- | ----- | --------------------------------------------------------- |
| PBI-017 | Contact data model (linked to application)            | [x]   | Prisma model + migration complete                         |
| PBI-018 | Add / edit contact per application                    | [x]   | POST, PATCH, DELETE routes; ContactForm; 10 tests passing |
| PBI-019 | Contact list view on application detail page          | [x]   | ContactList wired into detail page with Prisma include    |
| PBI-020 | Follow-up date field on application                   | [x]   | `followUpAt` field verified against spec AC               |
| PBI-021 | Overdue follow-up indicator on dashboard              | [x]   | Indicator verified against spec AC                        |
| PBI-024 | Summary stats bar (total, active, interviews, offers) | [x]   | StatsBar component built and rendering                    |
| PBI-025 | Pipeline stage distribution (visual)                  | [x]   | PipelineChart built; hidden when no applications exist    |
| PBI-029 | General notes field per application                   | [x]   | Notes field verified against spec AC                      |
| PBI-043 | README.md (project overview, setup, architecture)     | [x]   | Committed to develop                                      |

### Sprint Goal Met?

- [x] Yes — sprint goal achieved in full
- [ ] Partial — sprint goal partially met (explain below)
- [ ] No — sprint goal not met (explain below)

**Notes:** All 9 PBIs delivered within sprint window. No overflow. MVP phase gate cleared on 29 Apr 2026.

### Velocity

| Metric            | Value |
| ----------------- | ----- |
| PBIs committed    | 9     |
| PBIs completed    | 9     |
| PBIs carried over | 0     |
| S completed       | 3     |
| M completed       | 6     |
| L completed       | 0     |

---

## MVP Phase Gate (29 April 2026)

| Gate Criterion                                                | Status                          |
| ------------------------------------------------------------- | ------------------------------- |
| All 28 Must Have PBIs complete and marked `[x]` in product.md | [x]                             |
| Application live on Vercel production URL                     | [x]                             |
| Core RTL test suite passing with no failures                  | [x] — 34 tests passing          |
| README.md committed and accurate                              | [x]                             |
| Notion workspace updated and publicly accessible              | [x]                             |
| Sprint 3 retro completed and documented                       | [x]                             |
| Post 22 (MVP is Live) published on LinkedIn                   | [ ] — scheduled per linkedin.md |

**Gate cleared:** 24 April 2026

---

## Sprint Retrospective (29 April 2026)

**Date completed:** 24 April 2026

### What went well?

Dashboard MVP came together cleanly — StatsBar and PipelineChart built and integrated in a single session with no rework. Contact model, API routes, and form components completed with 10 tests passing. Spec-Driven Development discipline held throughout: branch-first, then document, no scope drift. The three-column DoD table format carried forward from Sprint 2 removed all ambiguity from verification checks.

### What didn't go well?

Browser verification PBIs (PBI-020, PBI-021, PBI-029) were scoped as "no new code" but clustered at the end of the sprint. They still require deliberate checklist discipline and occupied more closing-day attention than planned. PBI-019 wiring was broader than its S size suggested — coordinating Prisma query includes, component props, and routing added surface area that a standalone story estimate would not have caught.

### What will change in Sprint 4?

Browser verification PBIs get an explicit time block at sprint open, not at sprint close. README (PBI-043) opens the sprint — writing it first forces a clean articulation of what actually exists and surfaces gaps early. Story sizing review: any PBI that touches Prisma, a component, and a route in combination gets bumped to M regardless of apparent scope.

### Retro insight for LinkedIn Post 24

Verification PBIs look like free points until they stack up on the last day. Sprint 3 closed clean, but the browser-check work bunched at the end rather than being distributed across the week. Sprint 4 opens with a dedicated verification block on day one — small change, meaningful difference to close-day pressure.

---

## Sprint Close Checklist

- [x] All committed PBIs marked `[x]` or formally moved to Sprint 4 with reason
- [x] `product.md` PBI statuses updated
- [x] Sprint Review section completed
- [x] Sprint Retrospective section completed
- [x] LinkedIn retro insight captured above
- [x] MVP Phase Gate verified and date recorded
- [x] Notion Sprint Board updated — Sprint 3 marked ✅ Closed, Sprint 4 🔄 In progress
- [x] Notion Changelog entry added for Sprint 3
- [x] `sprint-03.md` committed to `/docs/sprints/`
- [x] `plan.md` Sprint Summary Table updated with close date
- [x] `develop` → `main` merge executed (MVP gate cleared)

---

_sprint-03.md v1.0 — 23 April 2026 — HireFlow_
_Active sprint document. Update daily. Source of truth for Sprint 3 progress, blocks, and retrospective output._
