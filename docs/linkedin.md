# HireFlow — LinkedIn Content Plan

**Document Type:** Portfolio Communication Artefact
**Version:** 5.0
**Date:** 22 April 2026
**Status:** Active
**Posting Frequency:** 3x per week — Tuesday, Thursday, Saturday
**Personal Brand:** Full — real name, real photo, first-person voice

---

## Cross-References

| Document               | Relationship                                    |
| ---------------------- | ----------------------------------------------- |
| `product.md`           | Source of project milestones that trigger posts |
| `plan.md`              | Sprint calendar drives post schedule            |
| `sprints/sprint-XX.md` | Sprint close triggers carousel post             |
| `implementation.md`    | Technical milestones trigger screenshot posts   |

---

## How This File Works

This file contains **every LinkedIn post for the HireFlow project**, written and ready to publish. Each post is tied to a specific project milestone and a specific date slot.

**Your workflow per post:**

1. Open this file on the scheduled day
2. Find the next post marked `[ ]` Not posted
3. Copy the post text into LinkedIn
4. Attach the screenshot or carousel file noted above the post
5. Publish
6. Mark status `[x]` Posted and record impressions in the Post Log after 48 hours

**Post status markers:**

- `[ ]` Not posted
- `[~]` Drafted / scheduled
- `[x]` Posted

---

## Canva One-Time Setup (Done ✅)

Brand kit, carousel template (1080×1350px), and screenshot frame (1080×1080px) are complete.

**Rule:** Always duplicate a saved template. Never design from scratch.

---

## Content Cadence Overview

| Date        | Day      | Post    | Topic                       | Asset      |
| ----------- | -------- | ------- | --------------------------- | ---------- |
| 21 Apr 2026 | Tuesday  | Post 01 | Project Announcement        | Text only  |
| 23 Apr 2026 | Thursday | Post 02 | The Problem HireFlow Solves | Screenshot |
| 25 Apr 2026 | Saturday | Post 03 | What is SDD                 | Text only  |
| 28 Apr 2026 | Tuesday  | Post 04 | product.md explained        | Screenshot |
| 30 Apr 2026 | Thursday | Post 05 | Building the Backlog        | Text only  |
| 02 May 2026 | Saturday | Post 06 | The 6 Strategies            | Screenshot |
| 05 May 2026 | Tuesday  | Post 07 | Sprint 1 Goal               | Screenshot |
| 07 May 2026 | Thursday | Post 08 | First Commit                | Screenshot |
| 09 May 2026 | Saturday | Post 09 | Auth is Live                | Screenshot |
| 12 May 2026 | Tuesday  | Post 10 | Sprint 1 Retro Insight      | Text only  |
| 14 May 2026 | Thursday | Post 11 | Sprint 1 Carousel           | Carousel   |
| 16 May 2026 | Saturday | Post 12 | implementation.md           | Screenshot |
| 19 May 2026 | Tuesday  | Post 13 | First Feature Shipped       | Screenshot |
| 21 May 2026 | Thursday | Post 14 | Writing Tests First         | Screenshot |
| 23 May 2026 | Saturday | Post 15 | Kanban Pipeline             | Screenshot |
| 26 May 2026 | Tuesday  | Post 16 | Sprint 2 Retro Insight      | Text only  |
| 28 May 2026 | Thursday | Post 17 | Sprint 2 Carousel           | Carousel   |
| 30 May 2026 | Saturday | Post 18 | What the Spec Drove         | Screenshot |
| 02 Jun 2026 | Tuesday  | Post 19 | Contact Tracking            | Screenshot |
| 04 Jun 2026 | Thursday | Post 20 | Dashboard Metrics           | Screenshot |
| 06 Jun 2026 | Saturday | Post 21 | Reminder System             | Screenshot |
| 09 Jun 2026 | Tuesday  | Post 22 | MVP is Live                 | Screenshot |
| 11 Jun 2026 | Thursday | Post 23 | Sprint 3 Carousel           | Carousel   |
| 13 Jun 2026 | Saturday | Post 24 | Phase 1 Retro               | Text only  |

**Note on schedule:** 24 posts total. Posting runs 3x/week from 21 April to 13 June 2026 — the day the HireFlow MVP story closes. The narrative ends cleanly at Phase 1 complete. LinkedIn presence is then free for the next project.

**Note on schedule:** 24 posts total. Posting runs 3x/week from 21 April to 13 June 2026 — the day the HireFlow MVP story closes. The narrative ends cleanly at Phase 1 complete. LinkedIn presence is then free for the next project.

---

## Optimal LinkedIn Posting Schedule (2026)

| Day          | Best Time (Local Time)  | Strategy & Why It Works                                                                                                                             |
| :----------- | :---------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tuesday**  | **10:00 AM – 11:00 AM** | **The Mid-Week Peak:** This is the highest engagement window. Perfect for your most important technical deep-dives or project launches.             |
| **Thursday** | **11:00 AM – 1:00 PM**  | **The Lunch Break Scroll:** Great for high-value "saveable" content like PDF carousels, cheat sheets, or industry insights.                         |
| **Saturday** | **9:00 AM – 10:00 AM**  | **Casual Professional:** Reach people before their weekend starts. Stick to lighter content like personal reflections or "Behind the Code" updates. |

---

## PRE-SPRINT POSTS — 21 Apr – 02 May 2026

Post these while Sprint 2 coding is underway. They establish your voice, your process, and your audience before the technical posts begin.

---

### POST 01 — Project Announcement

**21 April 2026 · Tuesday · Text only**
**Asset:** None
**Status:** `[x]` Posted

```
I'm building something. And I'm doing it in public.

HireFlow is a job application pipeline tracker — built for
job seekers who are tired of managing their search in a
spreadsheet that was never designed for the job.

But the project itself is as important as the product.

I'm wearing every hat:
→ Product Owner — defining what gets built and why
→ Scrum Master — running the sprints and ceremonies
→ Full-Stack Developer — Next.js, PostgreSQL, Neon, Vercel
→ Tester — React Testing Library, integration, E2E
→ Documenter — specs, ADRs, API docs

The methodology is Spec-Driven Development. Every feature
starts as a spec before it becomes code.

I'll be posting 3x a week — the decisions, the trade-offs,
the retros, and the lessons.

Follow along if you want to see what it looks like to build
software the right way, from the ground up.

Sprint 1 is already underway.

#HireFlow #BuildInPublic #ScrumMaster #ProductOwner #NextJS #SpecDrivenDevelopment
```

---

### POST 02 — The Problem HireFlow Solves

**23 April 2026 · Thursday · Text + Screenshot**
**Asset:** Screenshot of product.md Problem Statement section in GitHub → HireFlow Screenshot Frame
**Status:** `[x]` Posted

```
Most job seekers have a list problem.
What they actually have is a pipeline problem.

Here's the difference:

A list tracks what you've done.
A pipeline tracks where things are and what needs to happen next.

Spreadsheets are lists. They have no stage workflow, no
follow-up triggers, no conversion visibility. They just grow
longer and more overwhelming.

The result:
→ Applications fall through with no follow-up
→ Candidates lose track of which resume went where
→ Rejection compounds because there's no structure to hold it

HireFlow is opinionated about this. It enforces a 6-stage
pipeline: Applied → Screening → Interview → Assessment →
Offer → Closed.

You can't skip stages. You can't lose context. You can see
exactly where you stand.

The screenshot is from product.md — the Product Owner
document I wrote before touching any code.

Full doc in the GitHub repo. Link in comments.

#HireFlow #BuildInPublic #ProductOwner #JobSearch #SoftwareEngineering



```

---

### POST 03 — What is Spec-Driven Development

**25 April 2026 · Saturday · Text only**
**Asset:** None
**Status:** `[x]` Posted

```
Spec-Driven Development changed how I build software.

Here's what it means in practice:

Before I write a single line of code, I write:
→ A product document (the why and the what)
→ A feature spec (the exact behaviour expected)
→ Acceptance criteria (how I know it's done)
→ A test case (how I prove it)

Only then does implementation begin.

Most developers do the opposite. They build first, then figure
out what they were supposed to build. Then they write tests
to confirm what they accidentally made.

SDD flips this. The spec is the contract. The code is the
fulfilment of that contract. The test is the proof.

For HireFlow, every one of the 46 backlog items has a spec
before it has a commit.

The upfront cost is real.
The downstream cost of not doing it is higher.

What does your pre-build process look like?

#HireFlow #BuildInPublic #SpecDrivenDevelopment #SoftwareEngineering #Agile
```

---

### POST 04 — The product.md File Explained

**28 April 2026 · Tuesday · Text + Screenshot**
**Asset:** Screenshot of product.md Table of Contents in GitHub → HireFlow Screenshot Frame
**Status:** `[x]` Posted

```
I wrote 600 words before opening my code editor.

That document is product.md — the Product Owner artefact
that drives every downstream decision on HireFlow.

It contains:
→ Mission — why this product exists
→ Problem statement — what it solves and for whom
→ 3 user personas with named, specific pain points
→ Success metrics — product AND portfolio
→ Scope boundaries — what HireFlow is and is not
→ 6 backlog derivation strategies (enumerated, not assumed)
→ 46 prioritised backlog items across 10 epics
→ A 3-phase, 6-sprint release plan

The scope boundary section is the one most POs skip.

Knowing what you're NOT building is as important as knowing
what you are. It's the document that lets you say no — with
evidence, not instinct.

Full document in the GitHub repo. Link in comments.

#HireFlow #BuildInPublic #ProductOwner #Agile #ScrumMaster #SpecDrivenDevelopment

https://github.com/eonerhime/hireflow-track/blob/develop/docs/product.md
```

---

### POST 05 — Building the Backlog

**30 April 2026 · Thursday · Text only**
**Asset:** None
**Status:** `[x]` Posted

```
A backlog is not a wish list.

A wish list is what happens when a team sits in a room and
brainstorms features until the whiteboard is full.

A backlog is derived — from evidence, from user behaviour,
from pain points, from competitive gaps, from delivery constraints.

For HireFlow, I used 6 strategies to build the backlog.
None of them started with "what features should we build?"

Tomorrow I'll walk through all 6.

The result: 46 backlog items across 10 epics. Every one
traceable to a user need or a delivery constraint.

Zero guessing. Full traceability.

That's the difference between a Product Owner and someone
who makes lists.

#HireFlow #BuildInPublic #ProductOwner #ProductManagement #Agile
```

---

### POST 06 — The 6 Backlog Derivation Strategies

**02 May 2026 · Saturday · Text + Screenshot**
**Asset:** Screenshot of Backlog Derivation Strategies section in product.md → HireFlow Screenshot Frame
**Status:** `[x]` Posted

```
Here are the 6 strategies I used to build the HireFlow
product backlog — without a single brainstorm session.

1. Persona Journey Mapping
Walk each user through their end-to-end journey.
At every step: what do they need, and what do they need to do?

2. Pain Point Inversion
Every pain point is an unmet need.
Invert it — you get a feature hypothesis with a rationale attached.

3. Competitive Gap Analysis
What do existing tools do badly?
Where are all competitors weak? That's your differentiation.

4. MoSCoW Prioritisation
Must / Should / Could / Won't Have.
This is how scope is defined — not by gut feel.

5. Sprint Capacity Sizing
Every item is sized S / M / L / XL.
Items too large are decomposed. The backlog is shaped by what's
deliverable, not just what's desirable.

6. Dependency Ordering
What must exist before something else can be built?
This prevents sprint blockers before they happen.

Result: 46 items. 28 Must Have. 7 Should Have. 10 Could Have.

All in product.md — link in comments.

#HireFlow #BuildInPublic #ProductOwner #ProductManagement #Agile #ScrumMaster

https://github.com/eonerhime/hireflow-track/blob/develop/docs/product.md#6-backlog-derivation-strategies
```

---

## SPRINT 1 POSTS — 20 Apr – 16 May 2026

Sprint 1 ran 20–21 April 2026 (compressed). Screenshots are already captured. Post on schedule.

---

### POST 07 — Sprint 1 Goal and Plan

**05 May 2026 · Tuesday · Text + Screenshot**
**Asset:** Screenshot of Notion Sprint Board showing Sprint 1 → HireFlow Screenshot Frame
**Status:** `[x]` Posted

```
Sprint 1 starts today.

Goal: A deployed Next.js application with working
authentication. Foundation complete. Nothing else.

That specificity is intentional.

Most teams make the mistake of writing sprint goals that
describe a list of tasks. "Build auth, set up the DB,
configure deployment." That's a task list. Not a goal.

A sprint goal describes the value delivered when the sprint
is done. "Users can securely register and log in to
HireFlow" — that's a goal. It has a clear definition of
done the whole team can rally behind.

(Yes, I am the whole team. The discipline still applies.)

Sprint 1 backlog:
→ PBI-001 to PBI-008 — Foundation and Auth
→ PBI-037, PBI-039 — Validation + security headers
→ PBI-046 — Notion workspace live and public

Notion board is live and public. Link in comments.

How do you decide what goes into a sprint — gut feel or a system?
Tell me what works for you 👇

#HireFlow #BuildInPublic #ScrumMaster #Agile #Sprint #NextJS
```

---

### POST 08 — First Commit

**07 May 2026 · Thursday · Text + Screenshot**
**Asset:** Screenshot of GitHub commit history showing first meaningful feature commit → HireFlow Screenshot Frame
**Status:** `[x]` Posted

```
First commit is in.

Next.js 15. TypeScript strict mode. Tailwind CSS.
PostgreSQL on Neon. Prisma ORM. Repository on GitHub.

The scaffold is never just the scaffold.

Every decision made here — folder structure, TypeScript
config, ORM choice, database provider — creates constraints
that follow you to production. Getting it right costs an hour.
Getting it wrong costs a sprint.

Three decisions I made deliberately:

1. Neon over Railway for PostgreSQL
   Genuinely free tier. No credit card. No monthly cost.
   The right choice for a portfolio project.

2. Prisma over raw SQL
   Schema-first aligns with SDD — the data model is a spec
   before it's a migration.

3. TypeScript strict mode from day one
   Not from "when things get complex." From commit one.
   Retrofitting types is a tax on future-you.

Repo is public. Link in comments.

What's the hardest part of setting up auth from scratch?
Share your war stories below 👇

#HireFlow #BuildInPublic #NextJS #TypeScript #Prisma #PostgreSQL
```

---

### POST 09 — Auth is Live

**09 May 2026 · Saturday · Text + Screenshot**
**Asset:** Screenshot of HireFlow login page on Vercel → HireFlow Screenshot Frame
**Status:** `[x]` Posted

```
Authentication is live on HireFlow.

Email + password registration. bcrypt hashing.
JWT session management. Protected route middleware.

Here's what most tutorials get wrong about auth:

They treat it as a feature. It's not. It's infrastructure.

Every user-scoped feature in HireFlow — applications,
contacts, reminders, analytics — depends on knowing who
the user is. Auth isn't first because it's most interesting.
It's first because nothing else works without it.

The acceptance criteria, written in spec.md before any code:

→ User can register with email and password
→ Password is hashed — never stored plain
→ User can log in and receive a JWT session
→ Protected routes redirect unauthenticated users to /login
→ Session persists across page refreshes

Every criterion has a corresponding RTL test.

Spec drives test. Test drives code. That's SDD.

What feature do you always build first in a new app — and why?
Let me know below 👇

#HireFlow #BuildInPublic #Auth #NextJS #SpecDrivenDevelopment #ReactTestingLibrary
```

---

### POST 10 — Sprint 1 Retro Insight

**12 May 2026 · Tuesday · Text only**
**Asset:** None
**Status:** `[x]` Posted

```
Sprint 1 shipped on time. All 11 PBIs complete.

But the most expensive line of code I wrote this sprint was:

npx create-next-app@latest

@latest installed Next.js 16. Prisma @latest installed v7.
Both broke Vercel in different ways. 9 deployments to fix.

Sprint 2 rule: every package version is pinned before install.
The 30 seconds it takes to check the version number is cheaper
than the hours it takes to debug a breaking change you didn't
see coming.

Most tutorials don't mention this. Most developers learn it
the hard way.

Now it's in the spec. In the control docs. In the repo.
The lesson stays even when the memory fades.

That's the other thing SDD is for.

At what point does a side project start feeling like a real product to you?
Share your moment below 👇

#HireFlow #BuildInPublic #ScrumMaster #Agile #Retrospective #SoftwareEngineering
```

---

### POST 11 — Sprint 1 Carousel

**14 May 2026 · Thursday · Carousel PDF**
**Asset:** Build carousel in Canva using HireFlow Carousel Template. Export as PDF.
**Status:** `[x]` Posted

**Slide content:**

```
SLIDE 1 — Hook
Sprint 1 is done.
Here's everything that happened — and one thing I'd change.

SLIDE 2 — Context
HireFlow | Sprint 1
Goal: Working auth on a deployed Next.js app
Duration: 3 days (planned: 2 weeks)
Items committed: 11 | Completed: 11 | Carried over: 0

SLIDE 3 — What shipped
✓ Next.js 15.5.15 + TypeScript strict + Tailwind v4
✓ PostgreSQL 17 on Neon + Prisma v5
✓ Email/password auth with bcrypt
✓ JWT session management (HTTP-only cookie)
✓ Protected route middleware (Web Crypto API)
✓ Vercel deployment live

SLIDE 4 — The SDD layer
Every feature started as an acceptance criterion.
Every AC became a test case.
Every test case drove the implementation.
Zero features built without a spec.

SLIDE 5 — Test coverage
Schema unit tests: 7 passing
Auth component RTL tests: passing
npm test — all green

SLIDE 6 — The retro
✗ @latest installs caused cascading version conflicts
✗ 9 Vercel deployments to resolve middleware issues
→ Sprint 2: every package pinned to specific version
→ npm run build locally before every Vercel push

SLIDE 7 — The result
HireFlow is live on Vercel.
Register. Log in. See the dashboard.
The foundation is solid.
[Screenshot of live login page]

SLIDE 8 — What's next
Sprint 2: The core application pipeline.
Kanban board. Drag-and-drop. Application CRUD.
The product starts to exist.

SLIDE 9 — Takeaway
The sprint goal is not a task list.
"Users can securely register and log in" is a goal.
"Build auth, set up DB, configure deployment" is a list.
Know the difference.

SLIDE 10 — CTA
Follow for Sprint 2.
GitHub · Notion · Live app — links in comments.
```

**Caption:**

```
Sprint 1 closed. Foundation and auth — done.

Swipe to see what was built, what the retro surfaced,
and the one thing I'm changing in Sprint 2.

GitHub: https://github.com/eonerhime/hireflow-track
Live app: https://hireflow-track.vercel.app/register
Notion: https://dull-grain-172.notion.site/HireFLow-3463cecb82d08016a90be8bf80a5c6ce

What metric would you add to a job tracker that no tool currently shows?
I'm listening 👇

#HireFlow #BuildInPublic #ScrumMaster #NextJS #Agile #Sprint
```

---

### POST 12 — The implementation.md File

**16 May 2026 · Saturday · Text + Screenshot**
**Asset:** Screenshot of implementation.md ADR section open in GitHub → HireFlow Screenshot Frame
**Status:** `[x]` Posted

```
This one file runs the entire project.

implementation.md is the single source of truth for HireFlow.

It contains:
→ The canonical tech stack — pinned versions, not @latest
→ Architectural Decision Records — every major choice with its rationale
→ Known trade-offs — constraints accepted and why
→ A sprint-by-sprint changelog

The ADR section is the most valuable part.

By Sprint 1 close it had 13 entries. Each one is a decision
that would otherwise live in someone's head — and disappear
when the project ends.

ADR-013: Why the JWT middleware uses Web Crypto API instead of jose.
ADR-012: Why Prisma is pinned to v5.22.0.
ADR-011: Why Next.js is pinned to 15.5.15.

Every one of those cost time to discover. The ADR means
the cost is paid once — not rediscovered by the next person
who touches the codebase.

Full file in the GitHub repo. Link in comments.

#HireFlow #BuildInPublic #SoftwareEngineering #Documentation #SpecDrivenDevelopment
```

---

## SPRINT 2 POSTS — 19–30 May 2026

---

### POST 13 — First Feature Shipped

**19 May 2026 · Tuesday · Text + Screenshot**
**Asset:** Screenshot of Add Application form in HireFlow → HireFlow Screenshot Frame
**Status:** `[x]` Posted

```
The first real feature is live on HireFlow.

You can now add a job application — company, role,
location, salary, and job URL.

Under the hood:
→ Zod schema validation on server and client
→ Prisma write to PostgreSQL on Neon
→ API route with typed request and response
→ Form with controlled inputs and error states
→ RTL tests: render, validation, submit, error state

The spec for this feature was written before the component was.
The acceptance criteria drove the test cases.
The test cases drove the implementation.

That sequence matters.

When you write the test after the code, you're testing what
you built. When you write the test before, you're testing
what you meant to build.

Different questions. Different answers.

#HireFlow #BuildInPublic #NextJS #ReactTestingLibrary #SpecDrivenDevelopment
```

---

### POST 14 — Writing Tests First

**21 May 2026 · Thursday · Text + Screenshot**
**Asset:** Screenshot of RTL test file — use carbon.now.sh for clean code screenshot → HireFlow Screenshot Frame
**Status:** `[x]` Posted

```
Here's the test I wrote before the component existed.

[Screenshot of RTL test]

Three things writing tests first forces you to do:

1. Think about behaviour, not implementation
   The test describes what the user experiences — not how
   the code works. That's the right level of abstraction.

2. Define done before you start
   When the test passes, the feature is complete.
   No ambiguity. No "I think it's done."

3. Make the acceptance criteria concrete
   The spec says what should happen. The test proves it does.
   Spec, test, and feature become a single traceable unit.

React Testing Library is the right tool because it tests
from the user's perspective — what they see and interact
with — not internal component state.

That alignment between how users experience the app and how
tests verify it is what makes the test suite valuable.

#HireFlow #BuildInPublic #ReactTestingLibrary #Testing #SpecDrivenDevelopment
```

---

### POST 15 — The Kanban Pipeline

**23 May 2026 · Saturday · Text + Screenshot**
**Asset:** Screenshot of HireFlow Kanban board → HireFlow Screenshot Frame
**Status:** `[x]` Posted

```
The Kanban pipeline is live.

6 stages: Applied → Screening → Interview →
Assessment → Offer → Closed

Drag an application card from one column to the next.
Stage updates. Database writes. No page reload.

Here's the product decision behind the 6 stages:

Most job trackers let you define your own stages.
Flexible. Unopinionated. And completely unhelpful.

When you're in a stressful job search, the last thing you
need is to design your own workflow. You need a sensible
default that matches how hiring actually works.

HireFlow is opinionated. These 6 stages cover 95% of
hiring processes. If your process is unusual, you'll know
which stage to use anyway.

Opinionated tools get used.
Infinitely flexible tools become configuration projects.

#HireFlow #BuildInPublic #ProductOwner #NextJS #UX #JobSearch
```

---

### POST 16 — Sprint 2 Retro Insight

**26 May 2026 · Tuesday · Text only**
**Asset:** None
**Status:** `[x]` Posted

```
Sprint 2 retro. One insight worth sharing.

The biggest friction wasn't the code.
It was the gap between writing a DoD item and knowing
how to actually verify it.

"PATCH returns 404 if not found" means nothing without
a test file to run against it.

Every DoD item in Sprint 3 ships with an explicit
verification method — a command to run, a browser action
to take, or a file to check.

Ambiguity in the DoD is a productivity tax.
You pay it at the worst possible moment — when you think
you're done and you're not.

The spec template is updated. The DoD format is fixed.
Retros are only useful if they change something.

#HireFlow #BuildInPublic #ScrumMaster #Retrospective #Agile #SpecDrivenDevelopment
```

---

### POST 17 — Sprint 2 Carousel

**28 May 2026 · Thursday · Carousel PDF**
**Asset:** Build in Canva using HireFlow Carousel Template. Export as PDF.
**Status:** `[x]` Posted

**Slide content:**

```
SLIDE 1 — Hook
Sprint 2 done. The product now exists.
Here's what it took — and what the retro changed.

SLIDE 2 — Context
HireFlow | Sprint 2
Goal: Core application pipeline — CRUD + Kanban board
Duration: 1 week
Items committed: [5] | Completed: [5]

SLIDE 3 — What shipped
✓ Application data model + Prisma migration
✓ Add / edit / delete application
✓ Application detail page
✓ 6-stage Kanban pipeline view
✓ Drag-and-drop stage progression
✓ RTL test suite for all new components

SLIDE 4 — The hardest part
Drag-and-drop edge cases.
Same column drops. Failed DB writes. Mobile fallback.
None were in the original spec. All are now in the spec template.

SLIDE 5 — Test coverage
API route tests: 4 passing (PATCH handler)
Auth schema tests: 7 passing
Component tests: ApplicationForm, ApplicationList, DeleteButton passing
npm test — all green

SLIDE 6 — The retro change
DoD items now ship with explicit verification methods.
"PATCH returns 404" means nothing without a test to run.
Every DoD item in Sprint 3 has a command, browser action, or file check attached.

SLIDE 7 — The result
You can add, track, and move job applications
through a 6-stage pipeline. The core product works.
[Screenshot of Kanban board]

SLIDE 8 — What's next
Sprint 3: Contacts, reminders, dashboard.
The pipeline becomes a tool. The tool becomes useful.

SLIDE 9 — Takeaway
Flexibility is not always a feature.
An opinionated 6-stage pipeline gets used.
An infinitely configurable one becomes a project.

SLIDE 10 — CTA
Follow for Sprint 3 — MVP closes out.
GitHub · Notion · live app in comments.
```

**Caption:**

```
Sprint 2 closed. HireFlow now has a working Kanban pipeline.

Swipe to see what shipped, what the retro changed about
the spec template, and what's next.

#HireFlow #BuildInPublic #ScrumMaster #NextJS #Agile
```

---

### POST 18 — What the Spec Drove

**30 May 2026 · Saturday · Text + Screenshot**
**Asset:** Screenshot of spec.md showing AC for the application pipeline → HireFlow Screenshot Frame
**Status:** `[x]` Posted

```
Here's what a feature spec looks like before the code exists.

[Screenshot of spec.md acceptance criteria section]

Every feature in HireFlow has:
→ A plain-language description
→ Numbered, testable acceptance criteria
→ Edge cases — what happens when things go wrong
→ API contract — endpoint, request shape, response shape
→ Test case references — which RTL tests cover which AC

This is not extra work. This is the work.

The code is the easy part. Knowing exactly what the code
needs to do — that's what spec-driven development makes explicit.

When the spec is written:
The developer knows when they're done.
The tester knows what to test.
The reviewer knows why a decision was made.

One document. Three audiences. Zero ambiguity.

Full spec.md in the GitHub repo. Link in comments.

#HireFlow #BuildInPublic #SpecDrivenDevelopment #SoftwareEngineering #Documentation
```

---

## SPRINT 3 POSTS — MVP (02–13 Jun 2026)

---

### POST 19 — Contact Tracking Built

**02 June 2026 · Tuesday · Text + Screenshot**
**Asset:** Screenshot of contact section on application detail page → HireFlow Screenshot Frame
**Status:** `[x]` Posted

```
You now know who to follow up with.

HireFlow tracks contacts per application — recruiter name,
role, email, LinkedIn, and notes.

This was a deliberate product decision made in the spec phase.

Most job trackers treat the application as the unit.
HireFlow treats the relationship as the unit.

Because the application doesn't make a decision.
A person does. And knowing who that person is — with their
details one click away — is the difference between a timely
follow-up and a missed opportunity.

The data model: Contact is linked to Application, not to User.
One application can have multiple contacts. Contacts don't
exist outside an application context.

That constraint was in the spec before the schema was written.
Constraints are decisions. Decisions need reasons.
The reason is in product.md.

What's your biggest takeaway from building product spec-first? 👇

#HireFlow #BuildInPublic #NextJS #ProductOwner #SpecDrivenDevelopment
```

---

### POST 20 — Dashboard Metrics

**04 June 2026 · Thursday · Text + Screenshot**
**Asset:** Screenshot of HireFlow dashboard summary stats bar → HireFlow Screenshot Frame
**Status:** `[ ]` Not posted

```
The dashboard now shows you what matters.

Total applications. Active pipeline. Interviews scheduled.
Offers received. Overdue follow-ups.

Five numbers. Complete picture.

Here's the product thinking behind the metric selection:

I started with 12 potential metrics. Then asked one question
for each: "Does knowing this number change what the user
does next?"

If yes — it stays.
If it's just interesting — it goes.

Conversion rate stayed. (Tells you if applications are landing.)
Time-in-stage stayed. (Tells you if something is stalled.)
Total applications sent did not stay on the dashboard.
A vanity metric. Volume without conversion is noise.

Good metrics drive action.
Interesting metrics drive dashboards nobody uses.

#HireFlow #BuildInPublic #ProductOwner #UX #Metrics #JobSearch
```

---

### POST 21 — Reminder System

**06 June 2026 · Saturday · Text + Screenshot**
**Asset:** Screenshot of overdue follow-up indicator on dashboard → HireFlow Screenshot Frame
**Status:** `[ ]` Not posted

```
The follow-up reminder is the feature that makes
HireFlow actually useful.

Every application has a follow-up date. When that date
passes without a status update, the application is flagged
on the dashboard. Red. Unmissable.

Here's why this matters more than it sounds:

The average job seeker applies to 30+ roles. At that volume,
follow-up timing is nearly impossible to manage manually.
The follow-up window is typically 5–7 business days.
Miss it and you're either forgotten or look unprepared.

The reminder doesn't send an email. It doesn't send a push
notification. It makes the thing you need to do impossible
to ignore when you open the app.

Friction reduction, not notification spam.

That's a product decision. It's in the spec. It has a reason.

#HireFlow #BuildInPublic #ProductOwner #UX #JobSearch #NextJS
```

---

---

### POST 22 — HireTrace is Live

**09 June 2026 · Tuesday · Text + Screenshot**
**Asset:** Screenshot of live HireFlow app on Vercel — full dashboard view → HireFlow Screenshot Frame
**Status:** `[ ]` Not posted

```
HireFlow MVP is live.

Here's what shipped across 7 sprints:

→ Email + Google OAuth authentication
→ 6-stage Kanban pipeline with drag-and-drop
→ Contact tracking per application
→ Interview notes with timeline view
→ Conversion, time-in-stage, and source metrics
→ Resume upload and version linking
→ Email reminders via cron job
→ Dark mode, activity log, notification bell
→ Analytics with date range filtering
→ Legal pages — Privacy Policy, Terms of Service, Cookie Policy
→ 120 RTL tests + 9 Playwright E2E tests. All passing.

Built with Next.js 15, TypeScript strict mode, Tailwind CSS v4,
PostgreSQL on Neon, Prisma, NextAuth.js, Cloudinary, Resend.
Deployed on Vercel. Repo is public.

Spec-driven from the first document to the last commit.

Every feature has a spec. Every spec has acceptance criteria.
Every AC has a test. Every test is passing.

Live app: https://hiretrace-ten.vercel.app
GitHub: https://github.com/eonerhime/hiretrace

#HireFlow #BuildInPublic #MVP #NextJS #ScrumMaster #ProductOwner #FullStack
```

---

### POST 23 — The Numbers (SDD + Agentic Coding vs Solo Dev)

**11 June 2026 · Thursday · Carousel PDF**
**Asset:** Build in Canva using HireFlow Carousel Template. Export as PDF.
**Status:** `[ ]` Not posted

```
HireTrace took 7 weeks to build. Here's what that actually means.

SLIDE 2 — Context
HireFlow | Sprint 3
Goal: Contacts + Reminders + Dashboard = MVP complete
Duration: 1 week | Phase 1 of 3 closed

→ 56 PBIs defined before a single line of code was written
→ 7 sprints. All closed.
→ 13+ Architectural Decision Records logged
→ 120 RTL unit/integration tests
→ 9 Playwright E2E tests
→ 0 features built without acceptance criteria
→ Full-stack: auth, pipeline, contacts, notes, metrics,
  file upload, email, dark mode, legal pages, E2E tests

Now the comparison most people don't talk about.

A solo developer building this without SDD or agentic tooling
would conservatively spend:

→ Requirements and design: 2–3 weeks
→ Development: 10–14 weeks
→ Testing: 3–4 weeks
→ Documentation: 1–2 weeks
→ Total: 16–23 weeks

HireTrace was built in 7 weeks.

That's not because corners were cut.
The test suite, the docs, the ADRs, the specs — all there.

SLIDE 10 — CTA
HireFlow is live. Try it.
Link in comments. Follow for Phase 2.
```

When every feature starts as a spec with testable acceptance
criteria, you never build the wrong thing. You never debate
what "done" means. You never refactor because requirements
drifted.

And when agentic tools can execute against a clear spec —
generating boilerplate, scaffolding test files, implementing
patterns — the developer becomes a decision-maker, not a typist.

The combination compresses timelines by 60–70% without
sacrificing quality. The test suite proves it. The repo is public.

That's the actual case for building spec-first.

#HireFlow #BuildInPublic #MVP #ScrumMaster #NextJS #Agile
```

---

### POST 24 — What I Actually Learned

**13 June 2026 · Saturday · Text only**
**Asset:** None
**Status:** `[ ]` Not posted

```
HireFlow Phase 1 is done. Here's the full picture.

The numbers:
→ 3 sprints. 8 weeks planned. Compressed to 3 weeks.
→ 28 Must Have backlog items. All shipped.
→ 46 PBIs defined before a single line of code was written.
→ 13 Architectural Decision Records logged.
→ Every feature spec'd, tested, and deployed.
→ 0 features built without acceptance criteria.

What I actually learned — one lesson per hat.

As Product Owner:
The scope boundary section is the most valuable thing you write.
Knowing what you're NOT building prevents more wasted time than
any sprint ceremony ever will. It's also the document that lets
you say no — with evidence, not instinct.

As Scrum Master:
Sprint goals are not task lists. This seems obvious until you're
under pressure and start writing tasks and calling them a goal.
Writing the goal first — then pulling items — is a discipline.
It takes repetition to become a reflex.

As Developer:
Pin every package version before you install it. @latest cost me
9 Vercel deployments in Sprint 1. The 30 seconds it takes to
check a version number is always cheaper than the hours it takes
to debug a breaking change you didn't see coming.

As Tester:
Writing the test before the component is uncomfortable —
until it isn't. Once you've done it consistently, writing the
test after feels like guessing. You stop testing what you built
and start testing what you meant to build.
Different question. Better answer.

As a Builder in Public:
The posts made me more deliberate. Knowing I'd have to explain
every decision made me make better decisions. That accountability
was the most underrated part of the whole process.

HireFlow is live. The repo is public. The spec docs are
all there. If anything in these 24 posts was useful —
the methodology, the decisions, the trade-offs — it's all
in the GitHub repo to read, fork, or steal from.

That's what building in public is for.

GitHub: https://github.com/eonerhime/hiretrace
Live: https://hiretrace-ten.vercel.app

#HireFlow #BuildInPublic #ScrumMaster #ProductOwner #FullStack #Retrospective #SpecDrivenDevelopment
```

---

## Post Log

Record impressions 48 hours after each post.

| #   | Date Posted | Format            | Impressions | Comments | Link |
| --- | ----------- | ----------------- | ----------- | -------- | ---- |
| 01  | 21 Apr      | Text              | 272         |          |      |
| 02  | 23 Apr      | Text + Screenshot | 107         |          |      |
| 03  |             | Text              |             |          |      |
| 04  |             | Text + Screenshot |             |          |      |
| 05  |             | Text              |             |          |      |
| 06  |             | Text + Screenshot |             |          |      |
| 07  |             | Text + Screenshot |             |          |      |
| 08  |             | Text + Screenshot |             |          |      |
| 09  |             | Text + Screenshot |             |          |      |
| 10  |             | Text              |             |          |      |
| 11  |             | Carousel          |             |          |      |
| 12  |             | Text + Screenshot |             |          |      |
| 13  |             | Text + Screenshot |             |          |      |
| 14  |             | Text + Screenshot |             |          |      |
| 15  |             | Text + Screenshot |             |          |      |
| 16  |             | Text              |             |          |      |
| 17  |             | Carousel          |             |          |      |
| 18  |             | Text + Screenshot |             |          |      |
| 19  |             | Text + Screenshot |             |          |      |
| 20  |             | Text + Screenshot |             |          |      |
| 21  |             | Text + Screenshot |             |          |      |
| 22  |             | Text + Screenshot |             |          |      |
| 23  |             | Carousel          |             |          |      |
| 24  |             | Text              |             |          |      |

---

_linkedin.md v5.0 — 27 April 2026 — HireFlow_
_Revised from v4.0: Sprint actual dates updated (Pre-Sprint: 18 Apr, Sprint 1: 20 Apr, Sprint 2: 22–27 Apr). Post 16 retro insight updated to reflect actual Sprint 2 retro. Post 17 Slides 5 and 6 filled with actual test results. Notion Sprint Board corrected to actual dates._
