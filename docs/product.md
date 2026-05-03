# HireTrace — Product Document

**Document Type:** Product Owner Artifact
**Version:** 1.0
**Date:** April 16, 2026
**Status:** Active
**Author:** Product Owner
**Repository:** https://github.com/eonerhime/hiretrace

---

## Cross-References

| Document            | Purpose                                           |
| ------------------- | ------------------------------------------------- |
| `plan.md`           | Sprint calendar, release phases, capacity         |
| `spec.md`           | Feature specs, acceptance criteria, API contracts |
| `features.md`       | Feature breakdown per epic                        |
| `tasks.md`          | Atomic dev tasks per feature                      |
| `testing.md`        | Test philosophy, suites, cases, results log       |
| `implementation.md` | SSOT: stack, phases, rules, changelog             |
| `linkedin.md`       | Content strategy and post log                     |

---

## Table of Contents

1. [Mission](#1-mission)
2. [Problem Statement](#2-problem-statement)
3. [Target Users & Personas](#3-target-users--personas)
4. [Success Metrics](#4-success-metrics)
5. [Scope Boundaries](#5-scope-boundaries)
6. [Backlog Derivation Strategies](#6-backlog-derivation-strategies)
7. [Product Backlog](#7-product-backlog)
8. [Release Plan](#8-release-plan)

---

## 1. Mission

HireTrace is a structured job search management tool that gives job seekers clarity, control, and confidence over their application pipeline.

Most job seekers manage their search in spreadsheets, notebooks, or memory — tools that were never designed for the non-linear, relationship-driven, emotionally charged process of finding work. HireTrace replaces that friction with a purpose-built pipeline tracker that surfaces what matters: where you stand, what needs attention, and what's working.

Built in public using Spec-Driven Development, HireTrace also serves as a live demonstration of product ownership, agile execution, full-stack development, testing discipline, and technical documentation — across a single, coherent project.

---

## 2. Problem Statement

### The Core Problem

Job searching is a pipeline management problem that most people treat as a list management problem.

The consequences are predictable:

- Applications fall through the cracks with no follow-up
- Candidates lose track of which version of their resume was sent to which employer
- Interview stages are missed or poorly prepared for because there is no visibility into what is coming next
- Outcome data is never captured, so the same mistakes repeat across the search
- The emotional weight of rejection is amplified by disorganisation

### Why Existing Solutions Fall Short

| Tool             | Limitation                                                      |
| ---------------- | --------------------------------------------------------------- |
| Spreadsheets     | No stage workflow, no reminders, no analytics, high maintenance |
| Notion templates | Flexible but requires self-assembly; no structure enforced      |
| LinkedIn         | Shows jobs, not your pipeline; no tracking once applied         |
| Huntr / Teal     | Functional but not locally relevant or deeply customisable      |
| Memory           | Fails at scale beyond 5 active applications                     |

### The Opportunity

A focused, opinionated pipeline tracker — one that enforces a sensible workflow, surfaces the right information at the right time, and gets out of the way — solves this problem cleanly. And because every professional on LinkedIn has experienced this problem, the audience for the showcase is the product's own target user.

---

## 3. Target Users & Personas

### Persona 1 — The Active Applicant

**Name:** Adaeze, 28
**Situation:** Mid-level marketing professional actively seeking a new role. Applying to 3–5 positions per week across multiple industries.
**Pain points:** Loses track of where she is with each company. Misses follow-up windows. Cannot remember which recruiter she spoke to. Feels overwhelmed rather than in control.
**Goal:** A clear view of her pipeline at all times so she can act with intention rather than react to chaos.
**How HireTrace helps:** Kanban pipeline view, contact CRM per application, follow-up reminders, status history.

---

### Persona 2 — The Career Transitioner

**Name:** Emeka, 35
**Situation:** Transitioning from operations management into product management. Applying selectively — fewer applications, higher stakes. Research-intensive process.
**Pain points:** Needs to track different resume versions per role type. Wants to log interview notes and link them to specific applications. Needs to measure which channels (referrals, cold apply, LinkedIn) are yielding results.
**Goal:** Structured intelligence gathering on his own search so he can refine his strategy over time.
**How HireTrace helps:** Resume version linking, interview notes per stage, outcome analytics, source tracking.

---

### Persona 3 — The Recent Graduate

**Name:** Temi, 23
**Situation:** Final-year student applying for first professional roles. High volume, low conversion. Unfamiliar with professional job search norms.
**Pain points:** Does not know what a healthy pipeline looks like. Gets discouraged without visibility into progress. No sense of what follow-up is appropriate or when.
**Goal:** Structure and guidance, not just storage.
**How HireTrace helps:** Stage pipeline enforces a process; reminders surface next actions; analytics show conversion rate as a motivating metric, not just a count of rejections.

---

## 4. Success Metrics

### Product Metrics (MVP)

| Metric                       | Target                               | Measurement                   |
| ---------------------------- | ------------------------------------ | ----------------------------- |
| Applications trackable       | Up to 50 active per user             | DB record count               |
| Pipeline stages covered      | 6 core stages                        | Stage enum in schema          |
| Core user journey completion | Add → Track → Close an application   | E2E test pass                 |
| Page load time               | < 2 seconds on 4G                    | Lighthouse / Vercel analytics |
| Mobile responsiveness        | Full functionality on 375px viewport | RTL + manual test             |

### Portfolio Metrics (LinkedIn Showcase)

| Metric                               | Target                      | Measurement        |
| ------------------------------------ | --------------------------- | ------------------ |
| LinkedIn post impressions per sprint | > 500                       | LinkedIn analytics |
| Profile views increase               | > 20% over project duration | LinkedIn analytics |
| GitHub repo stars                    | > 10 by MVP launch          | GitHub             |
| Notion workspace views               | Tracked per sprint share    | Notion analytics   |
| Inbound connection requests          | > 5 per sprint post         | LinkedIn           |

---

## 5. Scope Boundaries

### In Scope — MVP

- User authentication (email/password)
- Job application creation and management
- 6-stage Kanban pipeline (Applied → Screening → Interview → Assessment → Offer → Closed)
- Contact tracking per application (recruiter, hiring manager)
- Application status dashboard with summary metrics
- Follow-up reminder system (date-based)
- Mobile-responsive UI

### In Scope — Full Release

- Resume version tracking and linking per application
- Interview notes per stage
- Outcome analytics (conversion rate, time-in-stage, source effectiveness)
- CSV export of application history
- Google OAuth
- Email notifications for reminders

### Explicitly Out of Scope

- Job discovery / job board integration (HireTrace tracks applications, not sources)
- AI-generated cover letters or resume suggestions
- Team or shared pipeline features (single-user only at this stage)
- Mobile native app (web-first, mobile-responsive)
- Paid subscription tiers (free for MVP and full release)

---

## 6. Backlog Derivation Strategies

The product backlog was not generated by listing assumed features. It was derived systematically using six strategies, applied in sequence. This section makes that process visible — a core demonstration of product ownership discipline.

---

### Strategy 1 — Persona Journey Mapping

Each persona (§3) was walked through their end-to-end job search journey. At every step, the question asked was: _what information does this person need, and what action do they need to take?_ This produced a list of capability needs anchored in real behaviour rather than assumed features.

**Output:** Core pipeline stages, contact tracking, follow-up reminders, notes per application.

---

### Strategy 2 — Pain Point Inversion

Each pain point identified in the Problem Statement (§2) was inverted into a product capability. A pain point is an unmet need; inverting it produces a feature hypothesis.

| Pain Point                             | Inverted Capability                       |
| -------------------------------------- | ----------------------------------------- |
| Applications fall through the cracks   | Follow-up reminder system                 |
| Cannot track which resume was sent     | Resume version linking                    |
| No visibility into what is coming next | Kanban pipeline with stage progression    |
| Outcome data never captured            | Analytics: conversion rate, time-in-stage |
| Disorganisation amplifies rejection    | Status dashboard with progress framing    |

**Output:** Reminders, resume linking, analytics, dashboard.

---

### Strategy 3 — Competitive Gap Analysis

Existing tools (§2) were analysed for what they do well and where they fail. Items where all competitors are weak and user need is high were prioritised as differentiation opportunities.

**Key gaps identified:**

- No existing free tool combines pipeline tracking + contact CRM + outcome analytics in one view
- Most tools are not opinionated about workflow — they offer flexibility where users need guidance
- Resume version linking is absent or buried in all tools reviewed

**Output:** Contact CRM per application, opinionated 6-stage pipeline, resume version linking elevated to full release priority.

---

### Strategy 4 — MoSCoW Prioritisation

All capability hypotheses from Strategies 1–3 were filtered through MoSCoW to establish MVP boundaries.

| Priority         | Capabilities                                                                     |
| ---------------- | -------------------------------------------------------------------------------- |
| Must Have        | Auth, application CRUD, 6-stage pipeline, contact tracking, dashboard, reminders |
| Should Have      | Interview notes, source tracking, mobile responsiveness                          |
| Could Have       | Resume version linking, analytics, CSV export, Google OAuth                      |
| Won't Have (now) | Job discovery, AI features, team features, native app                            |

**Output:** MVP scope (§5) and full release scope defined.

---

### Strategy 5 — Sprint Capacity Sizing

Each backlog item was sized by effort (S / M / L / XL) and mapped against available sprint capacity. Items too large for a single sprint were decomposed. This produced a backlog shaped by what is actually deliverable, not just what is desirable.

**Sizing reference:**

| Size | Effort    | Examples                                        |
| ---- | --------- | ----------------------------------------------- |
| S    | < 2 hours | Static page, UI component, simple API route     |
| M    | 2–4 hours | Feature with form + validation + DB write       |
| L    | 4–8 hours | Feature with complex state, multiple API routes |
| XL   | > 8 hours | Decompose — too large for a single task         |

**Output:** Backlog items sized and decomposable tasks identified (see §7).

---

### Strategy 6 — Dependency Ordering

Backlog items were sequenced by technical dependency. Items that are prerequisites for others were elevated regardless of business priority. This prevents sprint blockers from surfacing mid-delivery.

**Key dependency chains identified:**

- Auth must precede all user-scoped features
- DB schema must precede all API routes
- API routes must precede all frontend data-dependent components
- Core pipeline CRUD must precede analytics (no data to analyse without applications)

**Output:** Epic and sprint ordering in §8.

---

## 7. Product Backlog

Items are ordered by priority within each epic. Status reflects current state at document version date.

**Status markers:** `[ ]` Not started | `[~]` In progress | `[x]` Done | `[!]` Blocked

**Size:** S < 2hr | M 2–4hr | L 4–8hr | XL > 8hr (decompose)

**Priority:** 🔴 Must Have | 🟠 Should Have | 🟡 Could Have | 🔵 Post-MVP

---

### Epic 1 — Foundation & Auth

| ID      | Item                                                | Size | Priority | Status |
| ------- | --------------------------------------------------- | ---- | -------- | ------ |
| PBI-001 | Next.js project scaffold with TypeScript + Tailwind | S    | 🔴       | [x]    |
| PBI-002 | PostgreSQL database setup on Neon                   | S    | 🔴       | [x]    |
| PBI-003 | Prisma ORM setup + initial schema                   | M    | 🔴       | [x]    |
| PBI-004 | User registration (email/password + bcrypt)         | M    | 🔴       | [x]    |
| PBI-005 | User login + JWT session management                 | M    | 🔴       | [x]    |
| PBI-006 | Protected route middleware                          | S    | 🔴       | [x]    |
| PBI-007 | GitHub repository + branch strategy                 | S    | 🔴       | [x]    |
| PBI-008 | Vercel deployment (dev environment)                 | S    | 🔴       | [x]    |

---

### Epic 2 — Application Pipeline (Core)

| ID      | Item                                             | Size | Priority | Status |
| ------- | ------------------------------------------------ | ---- | -------- | ------ |
| PBI-009 | Application data model (schema + migration)      | M    | 🔴       | [x]    |
| PBI-010 | Add new application (form + API + DB write)      | M    | 🔴       | [x]    |
| PBI-011 | View all applications (dashboard list/card view) | M    | 🔴       | [x]    |
| PBI-012 | Edit application details                         | M    | 🔴       | [x]    |
| PBI-013 | Delete application (soft delete)                 | S    | 🔴       | [x]    |
| PBI-014 | 6-stage Kanban pipeline view                     | L    | 🔴       | [x]    |
| PBI-015 | Drag-and-drop stage progression                  | L    | 🔴       | [x]    |
| PBI-016 | Application detail page                          | M    | 🔴       | [x]    |

---

### Epic 3 — Contact Tracking

| ID      | Item                                         | Size | Priority | Status |
| ------- | -------------------------------------------- | ---- | -------- | ------ |
| PBI-017 | Contact data model (linked to application)   | M    | 🔴       | [x]    |
| PBI-018 | Add / edit contact per application           | M    | 🔴       | [x]    |
| PBI-019 | Contact list view on application detail page | S    | 🔴       | [x]    |

---

### Epic 4 — Reminders & Follow-ups

| ID      | Item                                     | Size | Priority | Status |
| ------- | ---------------------------------------- | ---- | -------- | ------ |
| PBI-020 | Follow-up date field on application      | S    | 🔴       | [x]    |
| PBI-021 | Overdue follow-up indicator on dashboard | M    | 🔴       | [x]    |
| PBI-022 | Reminder list / upcoming actions view    | M    | 🟠       | [ ]    |
| PBI-023 | Email notification for due reminders     | L    | 🟡       | [ ]    |

---

### Epic 5 — Dashboard & Metrics

| ID      | Item                                                  | Size | Priority | Status |
| ------- | ----------------------------------------------------- | ---- | -------- | ------ |
| PBI-024 | Summary stats bar (total, active, interviews, offers) | M    | 🔴       | [x]    |
| PBI-025 | Pipeline stage distribution (visual)                  | M    | 🟠       | [x]    |
| PBI-026 | Conversion rate metric (applied → interview → offer)  | M    | 🟡       | [x]    |
| PBI-027 | Time-in-stage metric per application                  | L    | 🟡       | [x]    |
| PBI-028 | Source effectiveness metric                           | M    | 🔵       | [x]    |

---

### Epic 6 — Notes & Documentation

| ID      | Item                                | Size | Priority | Status |
| ------- | ----------------------------------- | ---- | -------- | ------ |
| PBI-029 | General notes field per application | S    | 🟠       | [x]    |
| PBI-030 | Interview notes per stage           | M    | 🟠       | [x]    |
| PBI-031 | Notes history / timeline view       | M    | 🟡       | [x]    |

---

### Epic 7 — Resume Management

| ID      | Item                                        | Size | Priority | Status |
| ------- | ------------------------------------------- | ---- | -------- | ------ |
| PBI-032 | Resume version label field per application  | S    | 🟡       | [ ]    |
| PBI-033 | Resume file upload and storage              | L    | 🟡       | [ ]    |
| PBI-034 | Link specific resume version to application | M    | 🟡       | [ ]    |

---

### Epic 8 — Data & Export

| ID      | Item                              | Size | Priority | Status |
| ------- | --------------------------------- | ---- | -------- | ------ |
| PBI-035 | CSV export of application history | M    | 🟡       | [ ]    |
| PBI-036 | Google OAuth login                | M    | 🟡       | [ ]    |

---

### Epic 9 — Quality & Security

| ID      | Item                                         | Size | Priority | Status |
| ------- | -------------------------------------------- | ---- | -------- | ------ |
| PBI-037 | Input validation (Zod — server and client)   | M    | 🔴       | [x]    |
| PBI-038 | API rate limiting                            | M    | 🟠       | [x]    |
| PBI-039 | HTTPS + security headers (Next.js config)    | S    | 🔴       | [x]    |
| PBI-040 | React Testing Library — core component suite | L    | 🔴       | [ ]    |
| PBI-041 | Integration tests — API routes               | L    | 🟠       | [x]    |
| PBI-042 | E2E tests — critical user journeys           | L    | 🟡       | [ ]    |

---

### Epic 10 — Documentation & Portfolio

| ID      | Item                                              | Size | Priority | Status |
| ------- | ------------------------------------------------- | ---- | -------- | ------ |
| PBI-043 | README.md (project overview, setup, architecture) | M    | 🔴       | [x]    |
| PBI-044 | API documentation (OpenAPI / inline comments)     | M    | 🟠       | [x]    |
| PBI-045 | LinkedIn post per sprint (see linkedin.md)        | S    | 🔴       | [ ]    |
| PBI-046 | Notion workspace setup and public share           | S    | 🔴       | [x]    |

---

## 8. Release Plan

### Phase 1 — MVP (Sprints 1–3)

**Goal:** A working, deployed application that covers the core job search pipeline.
**Acceptance gate:** All 🔴 Must Have items complete. App live on Vercel. Core RTL tests passing.

| Sprint   | Focus                            | Key PBIs                                      |
| -------- | -------------------------------- | --------------------------------------------- |
| Sprint 1 | Foundation + Auth                | PBI-001 to PBI-008, PBI-037, PBI-039, PBI-046 |
| Sprint 2 | Core Pipeline                    | PBI-009 to PBI-016, PBI-040                   |
| Sprint 3 | Contacts + Reminders + Dashboard | PBI-017 to PBI-025, PBI-043                   |

---

### Phase 2 — Enhanced (Sprints 4–5)

**Goal:** Add the features that turn a useful tool into a compelling one.
**Acceptance gate:** All 🟠 Should Have items complete. Integration tests passing. Notion workspace updated.

| Sprint   | Focus                               | Key PBIs                                      |
| -------- | ----------------------------------- | --------------------------------------------- |
| Sprint 4 | Notes + Metrics + API hardening     | PBI-026 to PBI-031, PBI-038, PBI-041, PBI-044 |
| Sprint 5 | Resume management + Reminders email | PBI-032 to PBI-034, PBI-022, PBI-023          |

---

### Phase 3 — Full Release (Sprint 6)

**Goal:** Polish, analytics, export, and Google OAuth. Portfolio-complete.
**Acceptance gate:** All 🟡 Could Have items complete. E2E tests passing. LinkedIn showcase complete.

| Sprint   | Focus                            | Key PBIs                                          |
| -------- | -------------------------------- | ------------------------------------------------- |
| Sprint 6 | Analytics + Export + OAuth + E2E | PBI-035 to PBI-036, PBI-042, PBI-045 (final post) |

---

### Backlog Summary

| Epic                     | Total PBIs | Must Have 🔴 | Should Have 🟠 | Could Have 🟡 | Post-MVP 🔵 |
| ------------------------ | ---------- | ------------ | -------------- | ------------- | ----------- |
| 1 — Foundation & Auth    | 8          | 8            | —              | —             | —           |
| 2 — Application Pipeline | 8          | 8            | —              | —             | —           |
| 3 — Contact Tracking     | 3          | 3            | —              | —             | —           |
| 4 — Reminders            | 4          | 2            | 1              | 1             | —           |
| 5 — Dashboard & Metrics  | 5          | 1            | 1              | 2             | 1           |
| 6 — Notes                | 3          | —            | 2              | 1             | —           |
| 7 — Resume Management    | 3          | —            | —              | 3             | —           |
| 8 — Data & Export        | 2          | —            | —              | 2             | —           |
| 9 — Quality & Security   | 6          | 3            | 2              | 1             | —           |
| 10 — Documentation       | 4          | 3            | 1              | —             | —           |
| **TOTAL**                | **46**     | **28**       | **7**          | **10**        | **1**       |

---

_product.md v1.2 — 03 May 2026 — HireTrace_
_This document is the upstream source for all downstream SDD artefacts. Changes here must be reflected in plan.md and communicated to sprint-XX.md at the next sprint planning session._
