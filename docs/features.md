# HireFlow — Features Document

**Document Type:** Feature Breakdown Artifact
**Version:** 1.0 — Sprint 1 Slice
**Date:** April 17, 2026
**Status:** Active
**Author:** Product Owner / Developer
**Repository:** [https://github.com/eonerhime/hireflow-track](https://github.com/eonerhime/hireflow-track)

---

## Cross-References

| Document       | Relationship                                             |
| -------------- | -------------------------------------------------------- |
| `product.md`   | Upstream — PBIs that each feature section implements     |
| `spec.md`      | Acceptance criteria that each feature must satisfy       |
| `tasks.md`     | Downstream — atomic dev tasks derived from features here |
| `sprint-01.md` | Active sprint — features in scope for current sprint     |

---

## How This Document Works

Each PBI from `product.md` is decomposed into one or more named **features**. A feature is a discrete, implementable unit of behaviour — larger than an atomic task, smaller than a PBI. Features are the vocabulary used in pull request titles, commit messages, and `tasks.md`.

**Feature ID format:** `F-[PBI ID]-[sequence]` e.g. `F-004-01`

**Feature status markers:** `[ ]` Not started · `[~]` In progress · `[x]` Done

---

## Sprint 1 Features

---

### PBI-007 — GitHub Repository + Branch Strategy

| Feature ID | Feature Name              | Status |
| ---------- | ------------------------- | ------ |
| F-007-01   | Repository initialisation | [x]    |
| F-007-02   | Branch strategy setup     | [x]    |
| F-007-03   | SDD documents committed   | [x]    |

---

#### F-007-01 — Repository Initialisation

**Behaviour:** A public GitHub repository named `HireFlow` exists with a Node.js `.gitignore`, a `README.md` placeholder, and the correct visibility setting. This is the single source of truth for all project code and documentation.

**Completion signal:** Repository is accessible at `github.com/eonerhime/HireFlow` with no private flag.

---

#### F-007-02 — Branch Strategy Setup

**Behaviour:** A `main` branch (protected, no direct pushes) and a `develop` branch (integration branch) exist. All feature development happens on branches named `feature/PBI-XXX-short-description`, opened from `develop` and merged back via pull request.

**Completion signal:** Both branches exist; branch protection is enabled on `main`; branch naming convention is documented in the project `README.md`.

---

#### F-007-03 — SDD Documents Committed

**Behaviour:** All SDD documents generated to date are committed to the `/docs` directory on the `develop` branch. The repository is immediately useful to a visitor who wants to understand the project before the first line of application code is written.

**Completion signal:** `/docs` contains `product.md`, `plan.md`, `spec.md`, `linkedin.md`, `notion-setup.md`. `/docs/sprints/sprint-01.md` exists.

---

### PBI-001 — Next.js Project Scaffold with TypeScript + Tailwind

| Feature ID | Feature Name                              | Status |
| ---------- | ----------------------------------------- | ------ |
| F-001-01   | Next.js application initialisation        | [ ]    |
| F-001-02   | TypeScript strict mode configuration      | [ ]    |
| F-001-03   | Tailwind CSS configuration                | [ ]    |
| F-001-04   | Directory structure and environment setup | [ ]    |

---

#### F-001-01 — Next.js Application Initialisation

**Behaviour:** A Next.js 15 application using the App Router is initialised in the repository root. It starts without errors on `localhost:3000` and builds without errors via `npm run build`. Default boilerplate content is removed and replaced with a minimal placeholder.

**Completion signal:** `npm run dev` starts clean; `npm run build` completes clean; browser shows `HireFlow` heading at `localhost:3000`.

---

#### F-001-02 — TypeScript Strict Mode Configuration

**Behaviour:** `tsconfig.json` has `"strict": true` enabled. No TypeScript errors exist in the initial codebase. All future code in the project must satisfy strict mode — this is enforced from commit one, not retrofitted.

**Completion signal:** `tsc --noEmit` passes with zero errors.

---

#### F-001-03 — Tailwind CSS Configuration

**Behaviour:** Tailwind CSS is configured with content paths covering `app/` and `components/`. Utility classes apply correctly in the browser. No custom theme configuration at scaffold stage — brand tokens added in a later sprint.

**Completion signal:** A test component with `className="text-blue-500"` renders the correct colour in the browser.

---

#### F-001-04 — Directory Structure and Environment Setup

**Behaviour:** The agreed directory structure exists (`app/`, `components/`, `lib/`, `prisma/`, `public/`). A `.env.example` file is committed with all Sprint 1 variable keys and empty values. `.env.local` is confirmed absent from the repository.

**Completion signal:** All five directories exist; `.env.example` is committed; `git log --all -- .env.local` returns nothing.

---

### PBI-002 — PostgreSQL Database Setup on Neon

| Feature ID | Feature Name                    | Status |
| ---------- | ------------------------------- | ------ |
| F-002-01   | Neon database provisioning      | [ ]    |
| F-002-02   | Connection string configuration | [ ]    |

---

#### F-002-01 — Neon Database Provisioning

**Behaviour:** A PostgreSQL database is provisioned on Neon under a project named `HireFlow`. The database is active and reachable. Both the pooled connection string (for runtime) and the direct connection string (for migrations) are available in the Neon dashboard.

**Completion signal:** Neon dashboard shows database status as Active; both connection strings are visible in the Connection Details panel.

---

#### F-002-02 — Connection String Configuration

**Behaviour:** Both Neon connection strings are stored in `.env.local` and in Vercel environment variables. The Prisma schema datasource block references both via `url` and `directUrl`. The strings are never committed to the repository.

**Completion signal:** `npx prisma migrate dev` runs successfully against the Neon database; `git log --all -- .env.local` returns nothing.

---

### PBI-039 — HTTPS + Security Headers

| Feature ID | Feature Name                   | Status |
| ---------- | ------------------------------ | ------ |
| F-039-01   | Security headers configuration | [ ]    |

---

#### F-039-01 — Security Headers Configuration

**Behaviour:** Five HTTP security headers are configured in `next.config.ts` and applied to all responses: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Content-Security-Policy`. Headers are present on both local and Vercel deployments.

**Completion signal:** Browser DevTools Network tab shows all five headers on any page response; `npm run build` completes clean.

---

### PBI-046 — Notion Workspace Setup

| Feature ID | Feature Name                       | Status |
| ---------- | ---------------------------------- | ------ |
| F-046-01   | Notion workspace creation          | [ ]    |
| F-046-02   | Public share and link distribution | [ ]    |

---

#### F-046-01 — Notion Workspace Creation

**Behaviour:** The HireFlow Notion workspace contains four pages — Home, Documents Index, Sprint Board, and Changelog — populated with the content defined in `notion-setup.md`. The Sprint Board is accurate at creation date. The Documents Index links to all committed SDD files on GitHub.

**Completion signal:** All four pages exist and are navigable from the Home page; Sprint Board shows correct statuses; all GitHub links resolve correctly.

---

#### F-046-02 — Public Share and Link Distribution

**Behaviour:** The Notion workspace Home page is shared publicly (no login required). The public URL is tested in an incognito browser and recorded in `plan.md`.

**Completion signal:** Public URL opens without a Notion login prompt in incognito; URL is recorded in `plan.md` cross-reference table.

---

### PBI-003 — Prisma ORM Setup + Initial Schema

| Feature ID | Feature Name                          | Status |
| ---------- | ------------------------------------- | ------ |
| F-003-01   | Prisma installation and configuration | [ ]    |
| F-003-02   | User model and initial migration      | [ ]    |
| F-003-03   | Prisma client singleton               | [ ]    |

---

#### F-003-01 — Prisma Installation and Configuration

**Behaviour:** Prisma is installed (`prisma` and `@prisma/client`). The `prisma/schema.prisma` file exists with the correct `generator` and `datasource` blocks, including both `url` and `directUrl` for Neon compatibility.

**Completion signal:** `npx prisma generate` runs with no errors; schema file exists with correct datasource config.

---

#### F-003-02 — User Model and Initial Migration

**Behaviour:** The `User` model is defined in `schema.prisma` with fields: `id` (cuid), `email` (unique), `password`, `createdAt`, `updatedAt`. A migration named `init` runs successfully against the Neon database and creates the `User` table. The migration file is committed to the repository.

**Completion signal:** `npx prisma migrate dev --name init` completes clean; `User` table visible in Prisma Studio with correct columns; migration file in `prisma/migrations/`.

---

#### F-003-03 — Prisma Client Singleton

**Behaviour:** A singleton Prisma client is exported from `lib/prisma.ts` using the global pattern that prevents connection pool exhaustion during Next.js hot-reload in development. All API routes import `prisma` from this file — never instantiate `PrismaClient` directly.

**Completion signal:** `lib/prisma.ts` exists and exports the singleton; no direct `new PrismaClient()` calls exist outside this file.

---

### PBI-037 — Input Validation (Zod)

| Feature ID | Feature Name                      | Status |
| ---------- | --------------------------------- | ------ |
| F-037-01   | Zod and form library installation | [ ]    |
| F-037-02   | Auth validation schemas           | [ ]    |

---

#### F-037-01 — Zod and Form Library Installation

**Behaviour:** `zod`, `react-hook-form`, and `@hookform/resolvers` are installed as dependencies. They are available for import across the project.

**Completion signal:** `npm list zod react-hook-form @hookform/resolvers` shows all three installed.

---

#### F-037-02 — Auth Validation Schemas

**Behaviour:** `lib/schemas/auth.ts` exports `registerSchema`, `loginSchema`, `RegisterInput` (type), and `LoginInput` (type). `registerSchema` validates email format, password minimum length (8 chars), and password/confirmPassword match. `loginSchema` validates email format and non-empty password. Both schemas are used on client (react-hook-form + zodResolver) and server (safeParse in API route handlers).

**Completion signal:** `tsc --noEmit` clean; server returns 400 with `details` array on invalid input; client shows field errors before submission.

---

### PBI-004 — User Registration

| Feature ID | Feature Name               | Status |
| ---------- | -------------------------- | ------ |
| F-004-01   | Registration API route     | [ ]    |
| F-004-02   | Registration page and form | [ ]    |

---

#### F-004-01 — Registration API Route

**Behaviour:** `POST /api/auth/register` accepts email, password, and confirmPassword. It validates input with `registerSchema`, checks for duplicate email, hashes the password with bcrypt (10 salt rounds), creates the `User` record in the database, and returns 201 on success. Returns 400 on validation failure, 409 on duplicate email, 500 on server error. The `password` field is never returned in any response.

**Completion signal:** All AC from `spec.md` PBI-004 API Contract met; manual test via Postman or browser confirms correct status codes.

---

#### F-004-02 — Registration Page and Form

**Behaviour:** `/register` renders a form with email, password, and confirm password fields. The form uses `react-hook-form` with `zodResolver(registerSchema)` for client-side validation. Field-level errors display before submission. On 201 response, the user is redirected to `/login?registered=true`. On 409, the form displays the duplicate email error inline.

**Completion signal:** All AC from `spec.md` PBI-004 met; RTL test covers render, validation errors, and success redirect.

---

### PBI-005 — User Login + JWT Session Management

| Feature ID | Feature Name        | Status |
| ---------- | ------------------- | ------ |
| F-005-01   | Login API route     | [ ]    |
| F-005-02   | Logout API route    | [ ]    |
| F-005-03   | Login page and form | [ ]    |

---

#### F-005-01 — Login API Route

**Behaviour:** `POST /api/auth/login` validates credentials with `loginSchema`, retrieves the user by email, compares the password hash with bcrypt, signs a JWT using `jose` (payload: `userId`, `email`, `exp: 7d`), sets it as an HTTP-only cookie (`HireFlow-token`), and returns 200. Returns 400 on validation failure, 401 on invalid credentials (generic message — does not specify which field). Cookie is HTTP-only, Secure, SameSite=Lax, Path=/, Max-Age=604800.

**Completion signal:** All AC from `spec.md` PBI-005 API Contract met; `document.cookie` in browser console does not expose `HireFlow-token`.

---

#### F-005-02 — Logout API Route

**Behaviour:** `POST /api/auth/logout` clears the `HireFlow-token` cookie by setting its Max-Age to 0 and returns 200. Client redirects to `/login` after receiving the response.

**Completion signal:** After logout, `HireFlow-token` cookie is absent; navigating to `/dashboard` redirects to `/login`.

---

#### F-005-03 — Login Page and Form

**Behaviour:** `/login` renders a form with email and password fields. Uses `react-hook-form` with `zodResolver(loginSchema)`. On 401, displays _"Invalid email or password"_ inline. On success (200), redirects to `/dashboard`. If the URL contains `?registered=true`, displays a success message: _"Account created. Please log in."_

**Completion signal:** All AC from `spec.md` PBI-005 met; RTL test covers render, error message on 401, success redirect.

---

### PBI-006 — Protected Route Middleware

| Feature ID | Feature Name                             | Status |
| ---------- | ---------------------------------------- | ------ |
| F-006-01   | Next.js middleware with JWT verification | [ ]    |

---

#### F-006-01 — Next.js Middleware with JWT Verification

**Behaviour:** `middleware.ts` at the project root intercepts all requests matching `/dashboard/:path*` and `/api/:path*` (excluding auth routes). It reads the `HireFlow-token` cookie, verifies the JWT using `jose`. Valid token → `NextResponse.next()`. Missing or expired token → redirect to `/login` for page routes; 401 JSON response for API routes. Public routes (`/`, `/login`, `/register`, `/api/auth/*`) are never intercepted.

**Completion signal:** All AC from `spec.md` PBI-006 met; unauthenticated request to `/dashboard` redirects; unauthenticated API request returns 401.

---

### PBI-008 — Vercel Deployment (Dev Environment)

| Feature ID | Feature Name                    | Status |
| ---------- | ------------------------------- | ------ |
| F-008-01   | Vercel project configuration    | [ ]    |
| F-008-02   | Environment variables on Vercel | [ ]    |

---

#### F-008-01 — Vercel Project Configuration

**Behaviour:** The Vercel project is connected to the `HireFlow` GitHub repository. Pushes to `develop` trigger automatic preview deployments. The Next.js framework is auto-detected. Build settings are default.

**Completion signal:** Push to `develop` triggers a Vercel deployment that completes successfully; preview URL is accessible.

---

#### F-008-02 — Environment Variables on Vercel

**Behaviour:** All required environment variables are set in Vercel Project Settings → Environment Variables for the Preview environment: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`. The deployed app connects to the Neon database without error.

**Completion signal:** A request to `POST /api/auth/register` on the Vercel preview URL returns 201 or 409 (not 500); all env vars visible in Vercel dashboard.

---

## Sprint 2 Slice

Sprint 2 features (PBI-009 to PBI-016, PBI-040) will be authored during Sprint 1 and committed before Sprint 2 Planning on 20 May 2026.

---

_features.md v1.0 — Sprint 1 Slice — April 17, 2026 — HireFlow_
_Features are the bridge between PBIs (what to build) and tasks (how to build it). Every feature here has a corresponding task breakdown in `tasks.md`._
