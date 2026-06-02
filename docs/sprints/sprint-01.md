# HireFlow — Sprint 01

**Document Type:** Sprint Artifact
**Version:** 1.1
**Sprint:** 1 of 6
**Status:** Closed
**Start Date:** 18 April 2026
**End Date:** 20 April 2026
**Closed Date:** 20 April 2026
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

**The project infrastructure is live and a user can register and log in securely.**

At sprint close: the Next.js application is scaffolded, deployed to Vercel, connected to a Neon PostgreSQL database via Prisma, and a user can register with an email and password, log in, receive a JWT session cookie, and be blocked from protected routes without a valid session.

---

## Sprint Commitments

| PBI     | Item                                                | Size | Priority | Status |
| ------- | --------------------------------------------------- | ---- | -------- | ------ |
| PBI-007 | GitHub repository + branch strategy                 | S    | 🔴       | [x]    |
| PBI-001 | Next.js project scaffold with TypeScript + Tailwind | S    | 🔴       | [x]    |
| PBI-002 | PostgreSQL database setup on Neon                   | S    | 🔴       | [x]    |
| PBI-039 | HTTPS + security headers (Next.js config)           | S    | 🔴       | [x]    |
| PBI-046 | Notion workspace setup and public share             | S    | 🔴       | [x]    |
| PBI-003 | Prisma ORM setup + initial schema                   | M    | 🔴       | [x]    |
| PBI-037 | Input validation (Zod — server and client)          | M    | 🔴       | [x]    |
| PBI-004 | User registration (email/password + bcrypt)         | M    | 🔴       | [x]    |
| PBI-005 | User login + JWT session management                 | M    | 🔴       | [x]    |
| PBI-006 | Protected route middleware                          | S    | 🔴       | [x]    |
| PBI-008 | Vercel deployment (dev environment)                 | S    | 🔴       | [x]    |

**Status markers:** `[ ]` Not started · `[~]` In progress · `[x]` Done · `[!]` Blocked

**Total PBIs:** 11 · **S:** 7 · **M:** 4 · **L:** 0
**Estimated dev hours:** ~19.5 hrs · **Available dev capacity:** 11 hrs/sprint
**Note:** Sprint 1 is tight by raw sizing. PBI-046 (Notion) and PBI-007 (GitHub) are already complete per pre-sprint setup — this frees approximately 3 hours of sprint capacity.

---

## Capacity & Schedule

| Day   | Date   | Focus                                                             |
| ----- | ------ | ----------------------------------------------------------------- |
| Day 1 | 18 Apr | PBI-007, PBI-001, PBI-002, PBI-039, PBI-046 — infrastructure      |
| Day 2 | 19 Apr | PBI-003, PBI-037, PBI-004, PBI-005, PBI-006 — auth implementation |
| Day 3 | 20 Apr | PBI-008, retro, control doc updates — sprint close                |

**Sprint ceremonies:**

| Ceremony              | Date        | Output                                       |
| --------------------- | ----------- | -------------------------------------------- |
| Sprint Planning       | 18 Apr 2026 | Sprint kicked off, all PBIs pulled           |
| Mid-sprint checkpoint | 19 Apr 2026 | All PBIs in progress — no overflow needed    |
| Sprint Review         | 20 Apr 2026 | All 11 PBIs reviewed against AC — all passed |
| Sprint Retrospective  | 20 Apr 2026 | Retro notes written — see §Retrospective     |

---

## Daily Log

Use this section to record what was worked on each day. One line per session is sufficient.

| Date   | PBIs Worked                                 | Notes                                                                 |
| ------ | ------------------------------------------- | --------------------------------------------------------------------- |
| 18 Apr | PBI-007, PBI-001, PBI-002, PBI-039, PBI-046 | Infrastructure — scaffold, Neon, security headers, Notion             |
| 19 Apr | PBI-003, PBI-037, PBI-004, PBI-005, PBI-006 | Prisma, Zod, auth routes, middleware — Prisma v7 WASM issue on Vercel |
| 20 Apr | PBI-008, retro, docs                        | Resolved Vercel issues, full auth flow confirmed, sprint closed       |

---

## Blocked Items

Record any blocked PBIs here immediately. Do not leave a block undocumented.

| PBI     | Blocked Since | Reason                                                                    | Resolution                                                          |
| ------- | ------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| PBI-008 | 19 Apr        | MIDDLEWARE_INVOCATION_FAILED — jose incompatible with Vercel Edge Runtime | Replaced jose in middleware.ts with Web Crypto API (crypto.subtle)  |
| PBI-008 | 19 Apr        | Vercel framework preset showing as Other — all routes 404                 | Manually set framework preset to Next.js in Vercel project settings |
| PBI-003 | 19 Apr        | Prisma v7 WASM module undefined on Vercel serverless                      | Downgraded to Prisma v5.22.0 — standard singleton, no adapter       |

---

## Mid-Sprint Checkpoint (12 May 2026)

**Date completed:**
20 Apr 2026

| PBI     | Status at Checkpoint | On Track? |
| ------- | -------------------- | --------- |
| PBI-007 | Completed            | Yes       |
| PBI-001 | Completed            | Yes       |
| PBI-002 | Completed            | Yes       |
| PBI-039 | Completed            | Yes       |
| PBI-046 | Completed            | Yes       |
| PBI-003 | Completed            | Yes       |
| PBI-037 | Completed            | Yes       |
| PBI-004 | Completed            | Yes       |
| PBI-005 | Completed            | Yes       |
| PBI-006 | Completed            | Yes       |
| PBI-008 | Completed            | Yes       |

**Overflow decision:** _(none / list PBI moved to Sprint 2 with reason)_
No overflow; all PBIs completed

---

## Sprint Review (20 Apr 2026)

**Date completed:**
**Notes:** Auth flow works end-to-end locally and on Vercel. Register → login → protected dashboard → logout all confirmed. Cookie is HTTP-only (verified in DevTools). Schema unit tests passing. Stack pinned: Next.js 15.5.15, Prisma 5.22.0, Tailwind v4.

### PBI Completion

| PBI     | Item                                                | Done? | Notes |
| ------- | --------------------------------------------------- | ----- | ----- |
| PBI-007 | GitHub repository + branch strategy                 | [x]   |       |
| PBI-001 | Next.js project scaffold with TypeScript + Tailwind | [x]   |       |
| PBI-002 | PostgreSQL database setup on Neon                   | [x]   |       |
| PBI-039 | HTTPS + security headers (Next.js config)           | [x]   |       |
| PBI-046 | Notion workspace setup and public share             | [x]   |       |
| PBI-003 | Prisma ORM setup + initial schema                   | [x]   |       |
| PBI-037 | Input validation (Zod — server and client)          | [x]   |       |
| PBI-004 | User registration (email/password + bcrypt)         | [x]   |       |
| PBI-005 | User login + JWT session management                 | [x]   |       |
| PBI-006 | Protected route middleware                          | [x]   |       |
| PBI-008 | Vercel deployment (dev environment)                 | [x]   |       |

### Sprint Goal Met?

- [x] Yes — sprint goal achieved in full
- [ ] Partial — sprint goal partially met (explain below)
- [ ] No — sprint goal not met (explain below)

**Notes:** _(fill at review)_

### Velocity

| Metric            | Value                     |
| ----------------- | ------------------------- |
| PBIs committed    | 11                        |
| PBIs completed    | 11                        |
| PBIs carried over | 0                         |
| S completed       | 7                         |
| M completed       | 4                         |
| Actual duration   | 3 days (planned: 2 weeks) |

---

## Sprint Retrospective (19 May 2026)

**Date completed:**
21 Apr 2026

### What went well?

- All 11 PBIs completed with zero carry-over — 100% sprint goal achievement
- Auth flow works end-to-end locally and on Vercel
- SDD documentation comprehensive and ahead of schedule before coding started
- Breaking changes identified and resolved systematically — each fix documented immediately
- Control documents updated in real time — future sprints inherit accurate knowledge

### What didn't go well?

- Version conflicts consumed majority of sprint time — Next.js 16, Prisma v6/v7, Tailwind v4 all introduced breaking changes not captured in setup.md
- 9 Vercel deployment iterations required to resolve middleware and framework issues
- No version pinning strategy at project start — @latest installs caused cascading problems
- setup.md was written for versions that weren't actually installed
- Control documents required multiple correction passes as each issue was discovered
- Vercel framework preset not verified at project connection — caused all-routes-404 issue

### What will change in Sprint 2?

- All packages pinned to specific versions — never @latest
- npm run build run locally before every Vercel push — non-negotiable
- Vercel framework preset verified immediately at project connection
- Control documents updated in a single pass at sprint close

### Retro insight for LinkedIn Post 10

- Sprint 1 shipped on time. All 11 PBIs complete.
  But the most expensive line of code I wrote this sprint was: npx create-next-app@latest
- @latest installed Next.js 16. Prisma @latest installed v7.
  Both broke Vercel in different ways. 9 deployments to fix.
- Sprint 2 rule: every package version is pinned before install.
  The 30 seconds it takes to check the version number is cheaper than the hours it takes to debug a breaking change you didn't
  see coming.

---

## Sprint Close Checklist

Complete before marking this sprint Closed in `plan.md`.

- [x] All committed PBIs marked `[x]` or formally moved to Sprint 2 with reason documented
- [x] `product.md` PBI statuses updated
- [x] Sprint Review section completed
- [x] Sprint Retrospective section completed
- [x] LinkedIn Post 10 retro insight captured above
- [x] LinkedIn carousel (Post 11) slides 5 and 6 filled in
- [x] Notion Sprint Board updated — Sprint 1 marked ✅ Closed
- [x] Notion Changelog entry added for Sprint 1
- [x] `sprint-01.md` committed to `/docs/sprints/`
- [x] `plan.md` Sprint Summary Table updated with close date

---

_sprint-01.md v1.1 — 20 April 2026 — HireFlow_
_Sprint 1 closed 20 April 2026. All 11 PBIs complete. 0 carried over. Stack locked and documented. Sprint 2 starts 21 April 2026._
