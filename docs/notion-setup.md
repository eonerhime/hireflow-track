# HireFlow — Notion Workspace Setup Guide

**Document Type:** Setup & Operations Guide
**Version:** 1.0
**Date:** April 17, 2026
**Status:** Active
**Author:** Scrum Master
**Audience:** Solo developer — assumes no prior Notion experience

---

## Cross-References

| Document      | Relationship                                                                |
| ------------- | --------------------------------------------------------------------------- |
| `plan.md`     | PBI-046 — Notion workspace setup is a Sprint 1 deliverable                  |
| `linkedin.md` | Public Notion link appears in Posts 22, 23, and all Sprint 4–6 post footers |

---

## Table of Contents

1. [What You Are Building](#1-what-you-are-building)
2. [Account Setup](#2-account-setup)
3. [Workspace Structure](#3-workspace-structure)
4. [Page-by-Page Build Guide](#4-page-by-page-build-guide)
5. [Making It Public](#5-making-it-public)
6. [Maintenance Schedule](#6-maintenance-schedule)
7. [Setup Checklist](#7-setup-checklist)

---

## 1. What You Are Building

The HireFlow Notion workspace is a **public-facing project hub** — not a task management system. Its purpose is to give LinkedIn followers one link where they can see the full shape of the project: what's being built, how it's structured, and where it stands right now.

It is not where you do your work. Your work lives in GitHub (code), VS Code (implementation), and your SDD markdown files (documentation). Notion is where you **display** that work to an audience.

**What the workspace contains:**

| Page            | Purpose                                                      |
| --------------- | ------------------------------------------------------------ |
| Cover / Home    | Project intro, links to app and GitHub, your LinkedIn        |
| Documents Index | Links to all SDD documents in the GitHub repo                |
| Sprint Board    | Sprint-by-sprint status table — updated at each sprint close |
| Changelog       | One-line entries per sprint — shows momentum at a glance     |

That is the entire workspace. Four pages. Nothing else is needed for this project.

---

## 2. Account Setup

### Step 1 — Create a Notion account

1. Go to [notion.so](https://notion.so)
2. Click **Get Notion free**
3. Sign up with your Google account or email
4. When prompted to choose a plan, select **Free** — it has everything you need
5. When asked _"What are you using Notion for?"_ — select **Personal**
6. Skip any team setup prompts

### Step 2 — Understand the interface (2-minute orientation)

Notion is built around **pages**. A page can contain text, tables, images, and links. Pages can be nested inside other pages (sub-pages). That's the entire mental model you need.

The left sidebar shows your pages. The main area is where you edit. Every page has a **title** at the top and a **body** below it where you add content using blocks.

**How to add a block:** Click anywhere in the body of a page and press `/` (forward slash). A menu appears with all available block types. The ones you'll use most:

| Command     | What it creates                           |
| ----------- | ----------------------------------------- |
| `/text`     | Plain text paragraph                      |
| `/heading1` | Large heading (H1)                        |
| `/heading2` | Medium heading (H2)                       |
| `/table`    | A simple table                            |
| `/divider`  | A horizontal line                         |
| `/link`     | An inline link (or just paste a URL)      |
| `/page`     | A sub-page nested inside the current one  |
| `/callout`  | A highlighted box (good for status notes) |

That's all you need to know to build this workspace.

---

## 3. Workspace Structure

```
HireFlow (Home Page)
├── Documents Index
├── Sprint Board
└── Changelog
```

All four pages live at the top level of your Notion sidebar. The Home Page links to the other three. Visitors land on Home and can navigate from there.

---

## 4. Page-by-Page Build Guide

### Page 1 — Home (HireFlow)

This is the page whose link you will share publicly on LinkedIn.

**Step 1 — Create the page**

In the left sidebar, click **+ New page**. Title it: `HireFlow`

**Step 2 — Add a cover image**

At the top of the page, hover over the title area until you see **Add cover** appear. Click it. Notion will add a default cover image. Click **Change cover** → **Gallery** → pick any solid-colour or minimal abstract image. Alternatively, click **Upload** and upload a simple banner you make in Canva using your brand colour `#0A2342` (Deep Navy). Size: 1500 × 600px, solid fill, white text: _HireFlow_.

**Step 3 — Add a page icon**

Hover over the title → click **Add icon** → type `🔍` or `📋` and select it. This appears in the browser tab and sidebar.

**Step 4 — Add the page body**

Copy and paste the content below into the page body, then fill in the bracketed placeholders once you have your links:

---

```
HireFlow

A job application pipeline tracker — built for job seekers who need
clarity, control, and confidence over their search.

Built in public using Spec-Driven Development.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Live App       [link — add at Sprint 3 close]
🐙 GitHub         [your GitHub repo URL]
💼 LinkedIn       https://linkedin.com/in/emoonerhime

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

About This Project

HireFlow is a structured job search management tool that gives job
seekers a purpose-built pipeline tracker — not a spreadsheet.

This workspace documents the full build process: the product decisions,
the sprint-by-sprint execution, and the technical implementation. Every
feature starts as a spec before it becomes code.

Tech stack: Next.js 15 · TypeScript · Tailwind CSS · PostgreSQL ·
Neon · Vercel · Prisma

Methodology: Spec-Driven Development (SDD)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Navigate This Workspace

→ Documents Index — all SDD project documents
→ Sprint Board — sprint goals, dates, and current status
→ Changelog — what shipped, sprint by sprint

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Project Status

Phase 1 (MVP) — In progress
Sprint 1 of 6 — Foundation & Auth
Target MVP date: 16 June 2026
```

---

**How to format it in Notion:**

- `HireFlow` at the top → this is already your H1 page title, delete the duplicate
- The tagline → `/text` block
- The links section → use `/callout` block for the three links box — it gives it a visual highlight
- _About This Project_ → `/heading2`
- _Navigate This Workspace_ → `/text` — then select each `→` line and use **Link to page** to link each one to its sub-page (do this after creating the sub-pages below)
- _Project Status_ → `/callout` block — update this at each sprint

---

### Page 2 — Documents Index

**Step 1 — Create the sub-page**

From the Home page body, type `/page` and name it `Documents Index`. This creates it nested under Home and also adds it to your sidebar.

**Step 2 — Add the page body**

```
Documents Index

Every SDD document for HireFlow lives in the GitHub repository.
Links below go directly to each file.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Core Documents

product.md — Product Owner artifact. Mission, personas, 46-item
backlog, release plan.
[GitHub link]

plan.md — Scrum Master artifact. Sprint calendar, capacity model,
Definition of Done.
[GitHub link]

spec.md — Feature specifications, acceptance criteria, API contracts.
[GitHub link — add slices as they are committed]

linkedin.md — Content strategy and all 37 LinkedIn posts.
[GitHub link]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Sprint Documents

sprint-01.md — Foundation & Auth [GitHub link — add at sprint close]
sprint-02.md — Core Pipeline [GitHub link — add at sprint close]
sprint-03.md — Contacts + Reminders + Dashboard [GitHub link — add at sprint close]
sprint-04.md — Notes + Metrics + API Hardening [GitHub link — add at sprint close]
sprint-05.md — Resume Management + Email Reminders [GitHub link — add at sprint close]
sprint-06.md — Analytics + Export + OAuth + E2E [GitHub link — add at sprint close]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implementation Documents

implementation.md — Stack decisions, architecture, ADRs, changelog.
[GitHub link — add when created]

testing.md — Test philosophy, suites, cases, results log.
[GitHub link — add when created]
```

**Formatting tip:** Each document name → bold it (select text → `Cmd/Ctrl + B`). Each GitHub link → paste the URL and Notion will offer to create a bookmark — click **Create bookmark** for a nicer visual, or just leave it as an inline link.

---

### Page 3 — Sprint Board

**Step 1 — Create the sub-page**

From Home, type `/page` and name it `Sprint Board`.

**Step 2 — Add a table**

Type `/table` → select **Simple table** (not database). Build this table:

| Sprint     | Dates                | Goal                                   | Status         | Notes |
| ---------- | -------------------- | -------------------------------------- | -------------- | ----- |
| Pre-Sprint | 22 Apr – 05 May 2026 | Infrastructure + Posts 01–06           | 🔄 In progress | —     |
| Sprint 1   | 06 May – 19 May 2026 | Foundation + Auth                      | 🔲 Not started | —     |
| Sprint 2   | 20 May – 02 Jun 2026 | Core Pipeline                          | 🔲 Not started | —     |
| Sprint 3   | 03 Jun – 16 Jun 2026 | Contacts + Reminders + Dashboard (MVP) | 🔲 Not started | —     |
| Sprint 4   | 17 Jun – 30 Jun 2026 | Notes + Metrics + API Hardening        | 🔲 Not started | —     |
| Sprint 5   | 01 Jul – 14 Jul 2026 | Resume Management + Email Reminders    | 🔲 Not started | —     |
| Sprint 6   | 15 Jul – 28 Jul 2026 | Analytics + Export + OAuth + E2E       | 🔲 Not started | —     |

**Status emoji key** (add below the table as a text block):

```
🔲 Not started   🔄 In progress   ✅ Closed   ⚠️ Overflow
```

**Step 3 — Add a callout above the table**

Type `/callout` and paste:

```
📌 Updated at every sprint close. Last updated: [date]
```

Update the date each time you close a sprint.

---

### Page 4 — Changelog

**Step 1 — Create the sub-page**

From Home, type `/page` and name it `Changelog`.

**Step 2 — Add the page body**

```
Changelog

One entry per sprint. Most recent at the top.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Entries added at each sprint close]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

How to read this log

Each entry records: what sprint closed, what the goal was,
what shipped, and what (if anything) carried over.
```

**At each sprint close, prepend a new entry at the top in this format:**

```
Sprint 1 — Closed 19 May 2026
Goal: Foundation + Auth
Shipped: GitHub repo, Next.js scaffold, Neon DB, Prisma schema,
user registration, login, JWT sessions, protected routes, Zod
validation, security headers, Vercel dev deployment, Notion workspace.
Carried over: —
```

The Changelog is intentionally sparse. One entry, five lines maximum, every two weeks. It is a proof-of-momentum signal for anyone who visits the workspace mid-project.

---

## 5. Making It Public

Once your four pages are built:

1. Open the **Home (HireFlow)** page
2. Click **Share** in the top-right corner
3. Toggle **Share to web** → ON
4. Leave all other options as default (Comments off, Editing off)
5. Click **Copy link**
6. Paste that link somewhere safe — this is your Notion URL for all LinkedIn posts

**Important:** Only the Home page needs to be made public. The sub-pages (Documents Index, Sprint Board, Changelog) inherit the public setting automatically because they are nested under Home.

**Test it:** Open the link in a private/incognito browser window. You should see the Home page exactly as a visitor would, with no Notion login prompt.

---

## 6. Maintenance Schedule

Notion requires minimal ongoing effort. Here is the complete maintenance schedule:

| Trigger                      | Action                                                                                   | Time Required |
| ---------------------------- | ---------------------------------------------------------------------------------------- | ------------- |
| Pre-Sprint complete (05 May) | Mark Pre-Sprint ✅ in Sprint Board                                                       | 2 minutes     |
| Each sprint kickoff          | Update _Project Status_ callout on Home                                                  | 2 minutes     |
| Each sprint close            | Add Changelog entry · Update Sprint Board row · Add sprint-XX.md link in Documents Index | 10 minutes    |
| MVP live (16 Jun)            | Add live app link to Home page                                                           | 2 minutes     |
| New SDD doc committed        | Add GitHub link to Documents Index                                                       | 2 minutes     |

Total maintenance time across the full project: approximately 90 minutes spread across 14 weeks.

---

## 7. Setup Checklist

Complete in order. Tick each item when done.

### One-time setup (do before April 22)

- [ ] Notion account created at notion.so
- [ ] Home page created and titled `HireFlow`
- [ ] Cover image added to Home page
- [ ] Page icon added to Home page
- [ ] Home page body content added (tagline, links section, About, Navigate, Status)
- [ ] `Documents Index` sub-page created with all document entries
- [ ] `Sprint Board` sub-page created with full sprint table
- [ ] `Changelog` sub-page created (body only — no entries yet)
- [ ] Home page navigation links updated to point to sub-pages
- [ ] GitHub repo URL added to Home page and Documents Index
- [ ] Home page shared publicly (Share → Share to web → ON)
- [ ] Public link tested in incognito browser
- [ ] Public link saved (will be used in LinkedIn posts from Week 8)
- [ ] Notion workspace link added to `plan.md` cross-reference table

### Per-sprint maintenance

- [ ] Sprint 1 close (19 May) — Changelog entry + Sprint Board update + sprint-01.md link
- [ ] Sprint 2 close (02 Jun) — Changelog entry + Sprint Board update + sprint-02.md link
- [ ] Sprint 3 close (16 Jun) — Changelog entry + Sprint Board update + live app link added to Home
- [ ] Sprint 4 close (30 Jun) — Changelog entry + Sprint Board update + sprint-04.md link
- [ ] Sprint 5 close (14 Jul) — Changelog entry + Sprint Board update + sprint-05.md link
- [ ] Sprint 6 close (28 Jul) — Changelog entry + Sprint Board update + sprint-06.md link

---

_notion-setup.md v1.0 — April 17, 2026 — HireFlow_
_This document is the authoritative guide for the HireFlow Notion workspace. It is a setup and operations reference — not a living document. Update only if the workspace structure changes._
