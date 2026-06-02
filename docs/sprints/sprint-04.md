# HireFlow — Sprint 04

**Document Type:** Sprint Artifact
**Version:** 1.1
**Sprint:** 4 of 6
**Status:** Closed
**Start Date:** 30 April 2026
**End Date:** 03 May 2026
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

**The application is hardened and measurable. Users can log interview notes per stage, view a timeline of notes per application, and see conversion and time-in-stage metrics on the dashboard.**

At sprint close: interview notes are functional, the notes timeline renders on the detail page, conversion rate and time-in-stage metrics display on the dashboard, source effectiveness is tracked, API rate limiting is active, integration tests cover all new routes, and API documentation is committed.

---

## Sprint Commitments

| PBI     | Item                                                 | Size | Priority | Status |
| ------- | ---------------------------------------------------- | ---- | -------- | ------ |
| PBI-026 | Conversion rate metric (applied → interview → offer) | M    | 🟡       | [x]    |
| PBI-027 | Time-in-stage metric per application                 | L    | 🟡       | [x]    |
| PBI-028 | Source effectiveness metric                          | M    | 🔵       | [x]    |
| PBI-030 | Interview notes per stage                            | M    | 🟠       | [x]    |
| PBI-031 | Notes history / timeline view                        | M    | 🟡       | [x]    |
| PBI-038 | API rate limiting                                    | M    | 🟠       | [x]    |
| PBI-041 | Integration tests — API routes                       | L    | 🟠       | [x]    |
| PBI-044 | API documentation (OpenAPI / inline comments)        | M    | 🟠       | [x]    |

**Status markers:** `[ ]` Not started · `[~]` In progress · `[x]` Done · `[!]` Blocked

**Total PBIs:** 8 · **S:** 0 · **M:** 6 · **L:** 2
**Estimated dev hours:** ~26 hrs · **Available dev capacity:** 31 hrs/sprint
**Note:** PBI-027 required a new `stageEnteredAt` field on the `Application` model — migration ran alongside PBI-028's `source` field addition. Both schema changes delivered in a single migration.

---

## Dependency Order

PBI-038 (rate limiting) — independent, implement first
PBI-030 (interview notes) → PBI-031 (notes timeline)
PBI-027 (time-in-stage) requires schema migration — run alongside PBI-028 migration
PBI-026 (conversion rate) → PBI-027 (time-in-stage) → PBI-028 (source effectiveness)
PBI-041 (integration tests) — after all new routes are stable
PBI-044 (API docs) — last, written when all routes are complete

---

## Capacity & Schedule

| Day   | Date         | Focus                                                |
| ----- | ------------ | ---------------------------------------------------- |
| Day 1 | 30 Apr (Wed) | PBI-038 — API rate limiting                          |
| Day 2 | 01 May (Thu) | PBI-030 — Interview notes per stage                  |
| Day 3 | 02 May (Fri) | PBI-031 — Notes history / timeline view              |
| Day 4 | 03 May (Sat) | PBI-026 — Conversion rate metric + schema migrations |
| Day 5 | 04 May (Sun) | PBI-027 — Time-in-stage metric                       |
| Day 6 | 05 May (Mon) | PBI-028 — Source effectiveness + PBI-044 — API docs  |
| Day 7 | 06 May (Tue) | PBI-041 — Integration tests + Sprint Review + Retro  |

---

## Sprint Ceremonies

| Ceremony              | Date        | Output                                                     |
| --------------------- | ----------- | ---------------------------------------------------------- |
| Sprint Planning       | 30 Apr 2026 | This document confirmed, tasks.md Sprint 4 slice activated |
| Mid-sprint checkpoint | 03 May 2026 | Progress review; overflow rule applied if needed           |
| Sprint Review         | 03 May 2026 | All PBIs reviewed against AC — all 8 complete              |
| Sprint Retrospective  | 03 May 2026 | Retro notes written in §Retrospective below                |
| Phase 2 Gate Check    | 03 May 2026 | Should Have PBIs progress reviewed                         |

---

## Sprint 3 Lessons Applied

| #   | Lesson                                                                            | Change Applied                                                                         |
| --- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 1   | Browser verification PBIs clustered at sprint close                               | Dedicated verification block scheduled at sprint open — Day 1                          |
| 2   | PBI-019 S size underestimated due to multi-layer coordination                     | Any PBI touching Prisma + component + route bumped to M regardless of apparent scope   |
| 3   | `revalidatePath` alone does not bust Vercel edge cache — client fix also required | `router.refresh()` + `setTimeout(() => router.push(...), 100)` in all client mutations |
| 4   | README written last — gaps in documentation surface too late                      | PBI-044 (API docs) written when routes are stable, not after retro                     |

---

## Daily Log

| Date         | PBIs Worked      | Notes                                                                                       |
| ------------ | ---------------- | ------------------------------------------------------------------------------------------- |
| 30 Apr (Wed) | PBI-038          | Rate limiting implemented in middleware.ts — 60 req/min per IP, POST/PATCH/DELETE only      |
| 01 May (Thu) | PBI-030          | InterviewNote model, API routes, form and actions components, tests passing                 |
| 02 May (Fri) | PBI-031          | NoteTimeline and NoteViewToggle components built; sort logic centralised in NoteViewToggle  |
| 03 May (Sat) | PBI-026, PBI-027 | Schema migration (stageEnteredAt, source), metrics route, ConversionChart, TimeInStageChart |
| 03 May (Sat) | PBI-028          | SourceChart, source field wired through schema → form → API → dashboard                     |
| 03 May (Sat) | PBI-041, PBI-044 | 80 tests passing across 17 suites; JSDoc blocks added to all 10 route files                 |

---

## Blocked Items

| PBI | Blocked Since | Reason | Resolution |
| --- | ------------- | ------ | ---------- |
| —   | —             | —      | —          |

---

## Mid-Sprint Checkpoint (03 May 2026)

**Date completed:** 03 May 2026

| PBI     | Status at Checkpoint | On Track? |
| ------- | -------------------- | --------- |
| PBI-038 | [x] Done             | ✅        |
| PBI-030 | [x] Done             | ✅        |
| PBI-031 | [x] Done             | ✅        |
| PBI-026 | [x] Done             | ✅        |
| PBI-027 | [x] Done             | ✅        |
| PBI-028 | [x] Done             | ✅        |
| PBI-041 | [x] Done             | ✅        |
| PBI-044 | [x] Done             | ✅        |

**Overflow decision:** None. All 8 PBIs completed within sprint. Sprint closed ahead of schedule.

---

## Sprint Review (03 May 2026)

**Date completed:** 03 May 2026

### PBI Completion

| PBI     | Item                                                 | Done? | Notes                                                                                             |
| ------- | ---------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------- |
| PBI-026 | Conversion rate metric (applied → interview → offer) | [x]   | appliedToInterview and interviewToOffer percentages rendering on dashboard                        |
| PBI-027 | Time-in-stage metric per application                 | [x]   | avgDays per stage calculated from stageEnteredAt; TimeInStageChart rendering                      |
| PBI-028 | Source effectiveness metric                          | [x]   | source field wired end-to-end; SourceChart rendering per source with interview and offer rates    |
| PBI-030 | Interview notes per stage                            | [x]   | Notes created, edited, and deleted per stage; InterviewNoteForm and InterviewNoteActions complete |
| PBI-031 | Notes history / timeline view                        | [x]   | NoteTimeline and NoteViewToggle components complete; sort by stage order then createdAt DESC      |
| PBI-038 | API rate limiting                                    | [x]   | 60 mutating requests/IP/min in middleware.ts; returns 429 with Retry-After: 60                    |
| PBI-041 | Integration tests — API routes                       | [x]   | 80 tests passing across 17 suites covering all new routes                                         |
| PBI-044 | API documentation (OpenAPI / inline comments)        | [x]   | JSDoc blocks added to all 10 route files; stray @jest-environment removed from notes route        |

### Sprint Goal Met?

- [x] Yes — sprint goal achieved in full

**Notes:** All 8 committed PBIs delivered. Sprint completed 3 days ahead of the planned close date. 80 tests passing. No PBIs carried over. TypeScript strict mode clean (`tsc --noEmit` passes).

### Velocity

| Metric            | Value |
| ----------------- | ----- |
| PBIs committed    | 8     |
| PBIs completed    | 8     |
| PBIs carried over | 0     |
| S completed       | 0     |
| M completed       | 6     |
| L completed       | 2     |

---

## Sprint Retrospective (03 May 2026)

**Date completed:** 03 May 2026

### What went well?

All 8 PBIs delivered with no overflow. The decision to centralise metric chart logic in `DashboardClient` as props-driven components — rather than fetching from the API in each chart — paid off immediately: charts react to Kanban state changes with no additional fetch overhead. The `NoteViewToggle` wrapper pattern (keeping the detail page as a server component while toggling list/timeline client-side) was clean and didn't require any architecture rework. Running the `stageEnteredAt` and `source` schema migrations together in a single operation saved meaningful time. Test discipline held: every new route and component was covered before moving to the next PBI.

### What didn't go well?

The TypeScript inference mismatch between Zod's input and output types (caused by the `.transform()` on the `source` field) was not caught until `tsc --noEmit` at sprint close. It required introducing `z.input<>` alongside `z.infer<>` and updating `useForm`'s generic in `ApplicationForm`. This should have been caught earlier — the pattern was known from the schema design decision. Inline `Record` type annotations with complex value types also mangled on save in two places, requiring refactoring to named type aliases mid-sprint.

### What will change in Sprint 5?

Any schema field that uses `.transform()` will have both `z.input<>` and `z.output<>` types exported from the schema file at the point of authoring — not retrofitted after a compiler error. Named type aliases will be the default for any `Record` with a non-primitive value type; inline annotations will not be used.

### Retro insight for LinkedIn

Writing a schema transform feels like a small decision — until TypeScript reminds you that the form's raw state and the API's validated output are different types. Exporting both `z.input<>` and `z.infer<>` from every schema file with a transform is now a hard rule in this project, not an afterthought. One compiler error at sprint close is one too many when the fix takes thirty seconds and the pattern was already known.

---

## Sprint Close Checklist

- [x] All committed PBIs marked `[x]` or formally moved to Sprint 5 with reason
- [x] `product.md` PBI statuses updated
- [x] Sprint Review section completed
- [x] Sprint Retrospective section completed
- [x] LinkedIn retro insight captured above
- [x] Notion Sprint Board updated — Sprint 4 marked ✅ Closed, Sprint 5 🔄 In progress
- [x] Notion Changelog entry added for Sprint 4
- [x] `sprint-04.md` committed to `/docs/sprints/`
- [x] `plan.md` Sprint Summary Table updated with close date
- [x] Phase 2 gate progress recorded in `plan.md`

---

_sprint-04.md v1.1 — 03 May 2026 — HireFlow_
_Sprint closed ahead of schedule. All 8 PBIs delivered. 80 tests passing. No overflow._
