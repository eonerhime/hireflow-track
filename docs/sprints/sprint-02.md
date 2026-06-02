# HireFlow — Sprint 02

**Document Type:** Sprint Artifact
**Version:** 1.0
**Sprint:** 2 of 6
**Status:** In progress
**Start Date:** 21 April 2026
**End Date:** 22 April 2026
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

**A logged-in user can create, view, edit, delete, and progress job applications through a 6-stage Kanban pipeline.**

At sprint close: the application CRUD is working, the Kanban pipeline renders all 6 stages, drag-and-drop stage progression works, and the application detail page is accessible. RTL tests cover core pipeline components.

---

## Sprint Commitments

| PBI     | Item                                             | Size | Priority | Status |
| ------- | ------------------------------------------------ | ---- | -------- | ------ |
| PBI-009 | Application data model (schema + migration)      | M    | 🔴       | [x]    |
| PBI-010 | Add new application (form + API + DB write)      | M    | 🔴       | [x]    |
| PBI-011 | View all applications (dashboard list/card view) | M    | 🔴       | [x]    |
| PBI-012 | Edit application details                         | M    | 🔴       | [x]    |
| PBI-013 | Delete application (soft delete)                 | S    | 🔴       | [x]    |
| PBI-014 | 6-stage Kanban pipeline view                     | L    | 🔴       | [x]    |
| PBI-015 | Drag-and-drop stage progression                  | L    | 🔴       | [x]    |
| PBI-016 | Application detail page                          | M    | 🔴       | [x]    |
| PBI-040 | React Testing Library — core component suite     | L    | 🔴       | [x]    |

**Status markers:** `[ ]` Not started · `[~]` In progress · `[x]` Done · `[!]` Blocked

**Total PBIs:** 9 · **S:** 1 · **M:** 4 · **L:** 4
**Estimated dev hours:** ~40.5 hrs · **Available dev capacity:** 31 hrs/sprint
**Note:** Sprint 2 is tight. PBI-015 (drag-and-drop) is the first candidate for overflow if mid-sprint checkpoint shows slippage. A simple stage dropdown on the application card is an acceptable fallback that still satisfies the pipeline spec.

---

## Dependency Order

Work in this sequence — each PBI depends on the one above it:

```
PBI-009 (schema) → PBI-010 (create) → PBI-011 (list) → PBI-012 (edit)
                                                       → PBI-013 (delete)
                                                       → PBI-016 (detail page)
                                    → PBI-014 (Kanban view)
                                                       → PBI-015 (drag-and-drop)
PBI-040 (RTL tests) — written alongside each component
```

---

## Capacity & Schedule

| Day   | Date         | Focus                                              |
| ----- | ------------ | -------------------------------------------------- |
| Day 1 | 21 Apr (Tue) | PBI-009 — Application schema + migration           |
| Day 2 | 22 Apr (Wed) | PBI-010 — Add application form + API               |
| Day 3 | 23 Apr (Thu) | PBI-011 — View all applications + PBI-013 — Delete |
| Day 4 | 24 Apr (Fri) | PBI-012 — Edit application + mid-sprint checkpoint |
| Day 5 | 25 Apr (Sat) | PBI-014 — Kanban pipeline view                     |
| Day 6 | 26 Apr (Sun) | PBI-015 — Drag-and-drop + PBI-016 — Detail page    |
| Day 7 | 27 Apr (Mon) | PBI-040 — RTL tests + Sprint Review + Retro        |

---

## Sprint Ceremonies

| Ceremony              | Date        | Output                                                     |
| --------------------- | ----------- | ---------------------------------------------------------- |
| Sprint Planning       | 21 Apr 2026 | This document confirmed, tasks.md Sprint 2 slice activated |
| Mid-sprint checkpoint | 24 Apr 2026 | Progress review; overflow rule applied if needed           |
| Sprint Review         | 27 Apr 2026 | All PBIs reviewed against AC                               |
| Sprint Retrospective  | 27 Apr 2026 | Retro notes written in §Retrospective below                |

---

## Sprint 1 Lessons Applied

These are the specific changes from the Sprint 1 retro applied to this sprint:

- [x] All packages pinned before install — no `@latest`
- [x] `npm run build` run locally before every Vercel push
- [x] Feature branch created for all Sprint 2 PBIs — `feature/sprint-02-pipeline`
- [x] Control docs updated at sprint close — not incrementally

---

## Daily Log

| Date | PBIs Worked | Notes |
| ---- | ----------- | ----- |
|      |             |       |

---

## Blocked Items

| PBI | Blocked Since | Reason | Resolution |
| --- | ------------- | ------ | ---------- |
| —   | —             | —      | —          |

---

## Mid-Sprint Checkpoint (22 April 2026)

**Date completed:** 22 April 2026

| PBI     | Status at Checkpoint | On Track? |
| ------- | -------------------- | --------- |
| PBI-009 | Done                 | ✅        |
| PBI-010 | Done                 | ✅        |
| PBI-011 | Done                 | ✅        |
| PBI-012 | In progress          | ✅        |
| PBI-013 | Not started          | ✅        |
| PBI-014 | Not started          | ✅        |
| PBI-015 | Not started          | ✅        |
| PBI-016 | Not started          | ✅        |
| PBI-040 | Not started          | ✅        |

**Overflow decision:** None — all PBIs completed within sprint.

**Overflow decision:** _(none / list PBI moved to Sprint 3 with reason)_

---

## Sprint Review (22 April 2026)

**Date completed:** 22 April 2026

### PBI Completion

| PBI     | Item                                             | Done? | Notes                                                                                                  |
| ------- | ------------------------------------------------ | ----- | ------------------------------------------------------------------------------------------------------ |
| PBI-009 | Application data model (schema + migration)      | [x]   |                                                                                                        |
| PBI-010 | Add new application (form + API + DB write)      | [x]   |                                                                                                        |
| PBI-011 | View all applications (dashboard list/card view) | [x]   |                                                                                                        |
| PBI-012 | Edit application details                         | [x]   |                                                                                                        |
| PBI-013 | Delete application (soft delete)                 | [x]   |                                                                                                        |
| PBI-014 | 6-stage Kanban pipeline view                     | [x]   |                                                                                                        |
| PBI-015 | Drag-and-drop stage progression                  | [x]   |                                                                                                        |
| PBI-016 | Application detail page                          | [x]   |                                                                                                        |
| PBI-040 | React Testing Library — core component suite     | [x]   | `ApplicationCard.test.tsx` and `KanbanBoard.test.tsx` not executed — deferred to Sprint 3 testing pass |

### Sprint Goal Met?

- [x] Yes — sprint goal achieved in full

**Notes:** All 9 PBIs delivered within the sprint. A logged-in user can create, view, edit, delete, and progress job applications through a 6-stage Kanban pipeline with drag-and-drop. Dynamic back navigation implemented across detail and edit pages. Shared state architecture applied to keep list and Kanban views in sync.

### Velocity

| Metric            | Value |
| ----------------- | ----- |
| PBIs committed    | 9     |
| PBIs completed    | 9     |
| PBIs carried over | 0     |
| S completed       | 1     |
| M completed       | 4     |
| L completed       | 4     |

---

## Sprint Retrospective (22 April 2026)

**Date completed:** 22 April 2026

### What went well?

- All 9 PBIs delivered within the sprint window with no overflow
- The single feature branch strategy (`feature/sprint-02-pipeline`) kept the workflow clean
- API route tests written per PBI kept DoD verification concrete and repeatable
- Shared state architecture (`DashboardClient`) solved the list/Kanban sync problem cleanly once identified
- The `@jest-environment node` pattern for API route tests is now established for all future sprints

### What didn't go well?

- DoD check format in the implementation guide was inconsistent — some PBIs had bullet lists with no instructions on how to verify, causing mid-sprint confusion
- `getByLabelText` failures revealed missing `htmlFor`/`id` pairs on form inputs — an accessibility gap that should have been caught earlier
- Jest configuration required manual fixes (`moduleNameMapper`, `@jest-environment node`) that weren't documented in the implementation guide
- `ApplicationCard.test.tsx` and `KanbanBoard.test.tsx` were written but not executed — incomplete coverage for PBI-040

### What will change in Sprint 3?

- All DoD checks written in the three-column table format from the start — no bullet-list DoD items
- `htmlFor`/`id` pairs required on all form inputs as a coding standard — not optional
- Jest gotchas (`moduleNameMapper`, node environment for API tests) documented in the implementation guide before Sprint 3 begins
- `ApplicationCard.test.tsx` and `KanbanBoard.test.tsx` executed and passing before Sprint 3 closes

### Retro insight for LinkedIn Post 16

The biggest friction in Sprint 2 wasn't the code — it was the gap between writing a DoD item and knowing how to actually verify it. "PATCH returns 404 if not found" means nothing without a test file to run. In Sprint 3, every DoD item ships with an explicit verification method: a command to run, a browser action to take, or a file to check. Ambiguity in the DoD is a productivity tax paid at the worst possible moment.

---

## Sprint Close Checklist

- [x] All committed PBIs marked `[x]` or formally moved to Sprint 3 with reason
- [x] `product.md` PBI statuses updated
- [x] Sprint Review section completed
- [x] Sprint Retrospective section completed
- [x] LinkedIn Post 16 retro insight captured above
- [x] LinkedIn carousel Post 17 slides 5 and 6 filled in
- [x] Notion Sprint Board updated — Sprint 2 marked ✅ Closed, Sprint 3 🔄 In progress
- [x] Notion Changelog entry added for Sprint 2
- [x] `sprint-02.md` committed to `/docs/sprints/`
- [x] `plan.md` Sprint Summary Table updated with close date

---

_sprint-02.md v1.0 — 21 April 2026 — HireFlow_
_Active sprint document. Update daily. Source of truth for Sprint 2 progress, blocks, and retrospective output._
