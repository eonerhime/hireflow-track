# HireFlow — Tasks Document

**Document Type:** Developer Task Artifact
**Version:** 1.0 — Sprint 1 Slice
**Date:** April 17, 2026
**Status:** Active
**Author:** Developer
**Repository:** _(to be added)_

---

## Cross-References

| Document       | Relationship                                             |
| -------------- | -------------------------------------------------------- |
| `features.md`  | Upstream — each task group implements a named feature    |
| `spec.md`      | Acceptance criteria that tasks must collectively satisfy |
| `sprint-01.md` | Active sprint — tasks pulled from here daily             |
| `testing.md`   | Test tasks listed here; results logged in testing.md     |

---

## How This Document Works

Each feature from `features.md` is broken into atomic tasks. A task is the smallest unit of work that can be completed in a single focused session — target under 1 hour each. Tasks are pulled into a work session, not assigned to calendar slots.

**Task ID format:** `T-[Feature ID]-[sequence]` e.g. `T-F004-01-01`

**Task status markers:** `[ ]` Not started · `[~]` In progress · `[x]` Done · `[!]` Blocked

**Working convention:** At the start of each session, scan this list, pick the next `[ ]` task in dependency order, mark it `[~]`, complete it, mark it `[x]`. Never have more than 3 tasks marked `[~]` at once.

---

## Sprint 1 Tasks

---

### PBI-007 — GitHub Repository + Branch Strategy

#### F-007-01 — Repository Initialisation

| Task ID      | Task                                                                   | Status |
| ------------ | ---------------------------------------------------------------------- | ------ |
| T-F007-01-01 | Create public GitHub repository named `hireflow-track`                 | [x]    |
| T-F007-01-02 | Add Node.js `.gitignore` (include `.env`, `.env.local`, `.next`)       | [x]    |
| T-F007-01-03 | Add `README.md` placeholder with project name and one-line description | [x]    |

#### F-007-02 — Branch Strategy Setup

| Task ID                                                               | Task                                                                  | Status |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- | ------ |
| T-F007-02-01                                                          | Immediately after repo creation: run `git checkout -b develop && git  |        |
| push -u origin develop` — before any other commits                    | [x]                                                                   |
| T-F007-02-02                                                          | Enable branch protection on `main`: Settings → Branches → Add ruleset |        |
| → Require PR before merging — do this before committing anything else | [x]                                                                   |
| T-F007-02-03                                                          | Add branch naming convention to `README.md`: `feature-PBI-XXX-desc`   | [x]    |

#### F-007-03 — SDD Documents Committed

| Task ID                                 | Task                                         | Status |
| --------------------------------------- | -------------------------------------------- | ------ |
| T-F007-03-01                            | Create `/docs` directory on `develop` branch |        |
| — must be named exactly `docs`; all SDD |                                              |
| cross-references depend on this path    | [x]                                          |
| T-F007-03-02                            | Commit `product.md` to `/docs`               | [x]    |
| T-F007-03-03                            | Commit `plan.md` to `/docs`                  | [x]    |
| T-F007-03-04                            | Commit `linkedin.md` to `/docs`              | [x]    |
| T-F007-03-05                            | Commit `spec.md` (Sprint 1 slice) to `/docs` | [ ]    |
| T-F007-03-06                            | Commit `notion-setup.md` to `/docs`          | [ ]    |
| T-F007-03-07                            | Create `/docs/sprints/` subdirectory         | [ ]    |
| T-F007-03-08                            | Commit `sprint-01.md` to `/docs/sprints/`    | [ ]    |
| T-F007-03-09                            | Commit `features.md` to `/docs`              | [ ]    |
| T-F007-03-10                            | Commit `tasks.md` to `/docs`                 | [ ]    |

---

### PBI-001 — Next.js Project Scaffold

#### F-001-01 — Next.js Application Initialisation

| Task ID      | Task                                                                                            | Status |
| ------------ | ----------------------------------------------------------------------------------------------- | ------ |
| T-F001-01-01 | Run: `npx create-next-app@latest . --typescript --tailwind --eslint --app --import-alias "@/*"` | [ ]    |
| T-F001-01-02 | Delete default boilerplate content from `app/page.tsx`                                          | [ ]    |
| T-F001-01-03 | Replace with minimal placeholder: `<main><h1>HireFlow</h1></main>`                              | [ ]    |
| T-F001-01-04 | Run `npm run dev` — confirm starts on `localhost:3000` with no errors                           | [ ]    |
| T-F001-01-05 | Run `npm run build` — confirm build completes with no errors                                    | [ ]    |

#### F-001-02 — TypeScript Strict Mode

| Task ID      | Task                                                       | Status |
| ------------ | ---------------------------------------------------------- | ------ |
| T-F001-02-01 | Open `tsconfig.json` — confirm `"strict": true` is present | [ ]    |
| T-F001-02-02 | Run `tsc --noEmit` — confirm zero errors                   | [ ]    |

#### F-001-03 — Tailwind CSS Configuration

| Task ID      | Task                                                                               | Status |
| ------------ | ---------------------------------------------------------------------------------- | ------ |
| T-F001-03-01 | Open `tailwind.config.ts` — confirm content paths include `app/` and `components/` | [ ]    |
| T-F001-03-02 | Add a test class (`className="text-blue-500"`) to the placeholder page             | [ ]    |
| T-F001-03-03 | Confirm colour renders correctly in browser — then remove test class               | [ ]    |

#### F-001-04 — Directory Structure and Environment Setup

| Task ID      | Task                                                                                                                          | Status |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------ |
| T-F001-04-01 | Create `components/` directory (add `.gitkeep` if empty)                                                                      | [ ]    |
| T-F001-04-02 | Create `lib/` directory (add `.gitkeep` if empty)                                                                             | [ ]    |
| T-F001-04-03 | Create `prisma/` directory (add `.gitkeep` if empty)                                                                          | [ ]    |
| T-F001-04-04 | Create `.env.example` with keys: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (values empty) | [ ]    |
| T-F001-04-05 | Confirm `.env.local` is listed in `.gitignore`                                                                                | [ ]    |
| T-F001-04-06 | Run `npm run lint` — confirm no warnings                                                                                      | [ ]    |

---

### PBI-002 — PostgreSQL Database Setup on Neon

#### F-002-01 — Neon Database Provisioning

| Task ID      | Task                                                                 | Status |
| ------------ | -------------------------------------------------------------------- | ------ |
| T-F002-01-01 | Log into neon.tech — create new project named `hireflow-track-token` | [ ]    |
| T-F002-01-02 | Navigate to Connection Details — locate pooled connection string     | [ ]    |
| T-F002-01-03 | Navigate to Connection Details — locate direct connection string     | [ ]    |
| T-F002-01-04 | Confirm database status shows Active in Neon dashboard               | [ ]    |

#### F-002-02 — Connection String Configuration

| Task ID      | Task                                                                | Status |
| ------------ | ------------------------------------------------------------------- | ------ |
| T-F002-02-01 | Create `.env.local` — add `DATABASE_URL=<pooled connection string>` | [ ]    |
| T-F002-02-02 | Add `DIRECT_URL=<direct connection string>` to `.env.local`         | [ ]    |
| T-F002-02-03 | Confirm `.env.local` does not appear in `git status`                | [ ]    |

---

### PBI-039 — HTTPS + Security Headers

#### F-039-01 — Security Headers Configuration

| Task ID      | Task                                                                                                                             | Status |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------ |
| T-F039-01-01 | Open `next.config.ts` — add `securityHeaders` array with all 5 headers (see spec.md PBI-039 Implementation Notes for exact code) | [ ]    |
| T-F039-01-02 | Add `async headers()` function to `nextConfig` returning headers for `source: '/(.*)'`                                           | [ ]    |
| T-F039-01-03 | Run `npm run build` — confirm no errors                                                                                          | [ ]    |
| T-F039-01-04 | Run `npm run dev` — open DevTools → Network → any request → Headers — confirm all 5 headers present                              | [ ]    |
| T-F039-01-05 | Note CSP `unsafe-eval`/`unsafe-inline` trade-off in `implementation.md`                                                          | [ ]    |

---

### PBI-046 — Notion Workspace Setup

#### F-046-01 — Notion Workspace Creation

| Task ID      | Task                                                                          | Status |
| ------------ | ----------------------------------------------------------------------------- | ------ |
| T-F046-01-01 | Follow `notion-setup.md` §2 — create Notion account if not done               | [x]    |
| T-F046-01-02 | Follow `notion-setup.md` §4 Page 1 — create and populate Home page            | [x]    |
| T-F046-01-03 | Follow `notion-setup.md` §4 Page 2 — create Documents Index with GitHub links | [x]    |
| T-F046-01-04 | Follow `notion-setup.md` §4 Page 3 — create Sprint Board with full table      | [x]    |
| T-F046-01-05 | Follow `notion-setup.md` §4 Page 4 — create Changelog page                    | [x]    |
| T-F046-01-06 | Link Home page navigation items to sub-pages                                  | [x]    |

#### F-046-02 — Public Share and Link Distribution

| Task ID      | Task                                                            | Status |
| ------------ | --------------------------------------------------------------- | ------ |
| T-F046-02-01 | Share Home page publicly: Share → Share to web → ON             | [x]    |
| T-F046-02-02 | Test public link in incognito browser — confirm no login prompt | [x]    |
| T-F046-02-03 | Record public Notion URL in `plan.md` cross-reference table     | [ ]    |

---

### PBI-003 — Prisma ORM Setup + Initial Schema

#### F-003-01 — Prisma Installation and Configuration

| Task ID      | Task                                                                                                                                        | Status |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| T-F003-01-01 | Run: `npm install prisma @prisma/client`                                                                                                    | [ ]    |
| T-F003-01-02 | Run: `npx prisma init` — creates `prisma/schema.prisma` and `.env`                                                                          | [ ]    |
| T-F003-01-03 | Delete the `.env` file created by Prisma init (using `.env.local` instead) — confirm `.env` is in `.gitignore`                              | [ ]    |
| T-F003-01-04 | Update `prisma/schema.prisma` datasource block: set `provider = "postgresql"`, `url = env("DATABASE_URL")`, `directUrl = env("DIRECT_URL")` | [ ]    |

#### F-003-02 — User Model and Initial Migration

| Task ID      | Task                                                                         | Status |
| ------------ | ---------------------------------------------------------------------------- | ------ |
| T-F003-02-01 | Add `User` model to `schema.prisma` (see spec.md PBI-003 for exact schema)   | [ ]    |
| T-F003-02-02 | Run: `npx prisma migrate dev --name init`                                    | [ ]    |
| T-F003-02-03 | Confirm migration completes with no errors                                   | [ ]    |
| T-F003-02-04 | Run: `npx prisma studio` — confirm `User` table visible with correct columns | [ ]    |
| T-F003-02-05 | Confirm `prisma/migrations/` directory and migration file are committed      | [ ]    |

#### F-003-03 — Prisma Client Singleton

| Task ID      | Task                                                                                    | Status |
| ------------ | --------------------------------------------------------------------------------------- | ------ |
| T-F003-03-01 | Create `lib/prisma.ts` — add singleton pattern (see spec.md PBI-003 for exact code)     | [ ]    |
| T-F003-03-02 | Run `tsc --noEmit` — confirm no TypeScript errors                                       | [ ]    |
| T-F003-03-03 | Search codebase for `new PrismaClient()` outside `lib/prisma.ts` — confirm zero results | [ ]    |

---

### PBI-037 — Input Validation (Zod)

#### F-037-01 — Zod and Form Library Installation

| Task ID      | Task                                                                                  | Status |
| ------------ | ------------------------------------------------------------------------------------- | ------ |
| T-F037-01-01 | Run: `npm install zod react-hook-form @hookform/resolvers`                            | [ ]    |
| T-F037-01-02 | Run: `npm list zod react-hook-form @hookform/resolvers` — confirm all three installed | [ ]    |

#### F-037-02 — Auth Validation Schemas

| Task ID      | Task                                                                      | Status |
| ------------ | ------------------------------------------------------------------------- | ------ |
| T-F037-02-01 | Create `lib/schemas/auth.ts`                                              | [ ]    |
| T-F037-02-02 | Define and export `registerSchema` (see spec.md PBI-037 for exact schema) | [ ]    |
| T-F037-02-03 | Define and export `loginSchema`                                           | [ ]    |
| T-F037-02-04 | Export types `RegisterInput` and `LoginInput` using `z.infer<>`           | [ ]    |
| T-F037-02-05 | Run `tsc --noEmit` — confirm schemas are fully typed with no errors       | [ ]    |

---

### PBI-004 — User Registration

#### F-004-01 — Registration API Route

| Task ID      | Task                                                                       | Status |
| ------------ | -------------------------------------------------------------------------- | ------ |
| T-F004-01-01 | Create `app/api/auth/register/route.ts`                                    | [ ]    |
| T-F004-01-02 | Parse request body and run `registerSchema.safeParse()`                    | [ ]    |
| T-F004-01-03 | Return 400 with `details` array if Zod validation fails                    | [ ]    |
| T-F004-01-04 | Query DB for existing user with same email — return 409 if found           | [ ]    |
| T-F004-01-05 | Install bcryptjs: `npm install bcryptjs && npm install -D @types/bcryptjs` | [ ]    |
| T-F004-01-06 | Hash password: `bcrypt.hash(password, 10)`                                 | [ ]    |
| T-F004-01-07 | Create `User` record via `prisma.user.create()` with hashed password       | [ ]    |
| T-F004-01-08 | Return 201 `{ message: "Account created successfully" }`                   | [ ]    |
| T-F004-01-09 | Add try/catch — return 500 on unexpected error                             | [ ]    |
| T-F004-01-10 | Confirm `password` field is never included in any response object          | [ ]    |
| T-F004-01-11 | Test route manually (Postman or curl) — confirm 201, 400, 409 responses    | [ ]    |

#### F-004-02 — Registration Page and Form

| Task ID      | Task                                                                       | Status |
| ------------ | -------------------------------------------------------------------------- | ------ |
| T-F004-02-01 | Create `app/register/page.tsx`                                             | [ ]    |
| T-F004-02-02 | Build form with fields: email, password, confirmPassword                   | [ ]    |
| T-F004-02-03 | Wire `useForm` with `zodResolver(registerSchema)`                          | [ ]    |
| T-F004-02-04 | Display field-level error messages from `formState.errors`                 | [ ]    |
| T-F004-02-05 | On submit: POST to `/api/auth/register`                                    | [ ]    |
| T-F004-02-06 | On 201: redirect to `/login?registered=true` via `router.push()`           | [ ]    |
| T-F004-02-07 | On 409: display inline error _"An account with this email already exists"_ | [ ]    |
| T-F004-02-08 | On 400: display generic inline error                                       | [ ]    |
| T-F004-02-09 | Apply Tailwind classes — form is usable at 375px and 1280px                | [ ]    |
| T-F004-02-10 | Write RTL test: form renders all three fields and submit button            | [ ]    |
| T-F004-02-11 | Write RTL test: submitting empty form shows validation errors              | [ ]    |
| T-F004-02-12 | Write RTL test: mismatched passwords show confirmPassword error            | [ ]    |
| T-F004-02-13 | Run `npm test` — confirm all tests pass                                    | [ ]    |

---

### PBI-005 — User Login + JWT Session Management

#### F-005-01 — Login API Route

| Task ID      | Task                                                                                        | Status |
| ------------ | ------------------------------------------------------------------------------------------- | ------ |
| T-F005-01-01 | Install jose: `npm install jose`                                                            | [ ]    |
| T-F005-01-02 | Create `app/api/auth/login/route.ts`                                                        | [ ]    |
| T-F005-01-03 | Parse request body and run `loginSchema.safeParse()`                                        | [ ]    |
| T-F005-01-04 | Return 400 with `details` if validation fails                                               | [ ]    |
| T-F005-01-05 | Query DB for user by email — return 401 (generic) if not found                              | [ ]    |
| T-F005-01-06 | Compare password with `bcrypt.compare()` — return 401 (generic) if mismatch                 | [ ]    |
| T-F005-01-07 | Sign JWT with `jose` SignJWT — payload: `userId`, `email`; expiry: `7d`; algorithm: `HS256` | [ ]    |
| T-F005-01-08 | Set `hireflow-track-token` cookie: HttpOnly, Secure, SameSite=Lax, Path=/, Max-Age=604800   | [ ]    |
| T-F005-01-09 | Return 200 `{ message: "Login successful" }`                                                | [ ]    |
| T-F005-01-10 | Add try/catch — return 500 on unexpected error                                              | [ ]    |
| T-F005-01-11 | Test route manually — confirm cookie is set and is HTTP-only                                | [ ]    |

#### F-005-02 — Logout API Route

| Task ID      | Task                                                     | Status |
| ------------ | -------------------------------------------------------- | ------ |
| T-F005-02-01 | Create `app/api/auth/logout/route.ts`                    | [ ]    |
| T-F005-02-02 | Clear `hireflow-track-token` cookie by setting Max-Age=0 | [ ]    |
| T-F005-02-03 | Return 200 `{ message: "Logged out" }`                   | [ ]    |
| T-F005-02-04 | Test manually — confirm cookie is absent after logout    | [ ]    |

#### F-005-03 — Login Page and Form

| Task ID      | Task                                                                                      | Status |
| ------------ | ----------------------------------------------------------------------------------------- | ------ |
| T-F005-03-01 | Create `app/login/page.tsx`                                                               | [ ]    |
| T-F005-03-02 | Build form with email and password fields                                                 | [ ]    |
| T-F005-03-03 | Wire `useForm` with `zodResolver(loginSchema)`                                            | [ ]    |
| T-F005-03-04 | Display field-level errors from `formState.errors`                                        | [ ]    |
| T-F005-03-05 | On submit: POST to `/api/auth/login`                                                      | [ ]    |
| T-F005-03-06 | On 200: redirect to `/dashboard` via `router.push()`                                      | [ ]    |
| T-F005-03-07 | On 401: display _"Invalid email or password"_ inline                                      | [ ]    |
| T-F005-03-08 | Check URL for `?registered=true` — display _"Account created. Please log in."_ if present | [ ]    |
| T-F005-03-09 | Apply Tailwind classes — form usable at 375px and 1280px                                  | [ ]    |
| T-F005-03-10 | Write RTL test: form renders email and password fields                                    | [ ]    |
| T-F005-03-11 | Write RTL test: 401 response shows generic error message                                  | [ ]    |
| T-F005-03-12 | Write RTL test: `?registered=true` param shows success message                            | [ ]    |
| T-F005-03-13 | Run `npm test` — confirm all tests pass                                                   | [ ]    |

---

### PBI-006 — Protected Route Middleware

#### F-006-01 — Next.js Middleware with JWT Verification

| Task ID      | Task                                                                                | Status |
| ------------ | ----------------------------------------------------------------------------------- | ------ |
| T-F006-01-01 | Create `middleware.ts` at project root                                              | [ ]    |
| T-F006-01-02 | Add `matcher` config: `['/dashboard/:path*', '/api/:path*']`                        | [ ]    |
| T-F006-01-03 | Read `hireflow-track-token` from request cookies                                    | [ ]    |
| T-F006-01-04 | If no token: redirect to `/login` (page routes) or return 401 JSON (API routes)     | [ ]    |
| T-F006-01-05 | Verify JWT with `jose` jwtVerify using `JWT_SECRET`                                 | [ ]    |
| T-F006-01-06 | If valid: `NextResponse.next()`                                                     | [ ]    |
| T-F006-01-07 | If expired/invalid: redirect to `/login` or return 401                              | [ ]    |
| T-F006-01-08 | Exclude `/api/auth/login` and `/api/auth/register` from protection                  | [ ]    |
| T-F006-01-09 | Create placeholder `app/dashboard/page.tsx` (simple heading) to test redirect       | [ ]    |
| T-F006-01-10 | Manual test: navigate to `/dashboard` without cookie — confirm redirect to `/login` | [ ]    |
| T-F006-01-11 | Manual test: navigate to `/dashboard` with valid cookie — confirm page renders      | [ ]    |
| T-F006-01-12 | Run `tsc --noEmit` — confirm no TypeScript errors                                   | [ ]    |

---

### PBI-008 — Vercel Deployment (Dev Environment)

#### F-008-01 — Vercel Project Configuration

| Task ID      | Task                                                                               | Status |
| ------------ | ---------------------------------------------------------------------------------- | ------ |
| T-F008-01-01 | Log into vercel.com — confirm `hireflow-track` project is connected to GitHub repo | [x]    |
| T-F008-01-02 | Confirm framework preset is set to Next.js                                         | [x]    |
| T-F008-01-03 | Push a test commit to `develop` — confirm automatic deployment triggers            | [ ]    |
| T-F008-01-04 | Confirm deployment completes successfully and preview URL is accessible            | [ ]    |

#### F-008-02 — Environment Variables on Vercel

| Task ID      | Task                                                                                    | Status |
| ------------ | --------------------------------------------------------------------------------------- | ------ |
| T-F008-02-01 | Go to Vercel → Project Settings → Environment Variables                                 | [ ]    |
| T-F008-02-02 | Add `DATABASE_URL` (pooled Neon string) — Preview scope                                 | [ ]    |
| T-F008-02-03 | Add `DIRECT_URL` (direct Neon string) — Preview scope                                   | [ ]    |
| T-F008-02-04 | Add `JWT_SECRET` (min 32 chars, randomly generated) — Preview scope                     | [ ]    |
| T-F008-02-05 | Add `NEXTAUTH_URL` (set to Vercel preview URL) — Preview scope                          | [ ]    |
| T-F008-02-06 | Add `NEXTAUTH_SECRET` (randomly generated) — Preview scope                              | [ ]    |
| T-F008-02-07 | Redeploy — test `POST /api/auth/register` on preview URL — confirm 201 or 409 (not 500) | [ ]    |
| T-F008-02-08 | Record Vercel preview URL in `implementation.md`                                        | [ ]    |

---

## Sprint 1 Task Summary

| PBI       | Total Tasks | Completed | Remaining |
| --------- | ----------- | --------- | --------- |
| PBI-007   | 13          | 13        | 0         |
| PBI-001   | 12          | 12        | 0         |
| PBI-002   | 7           | 7         | 0         |
| PBI-039   | 5           | 5         | 0         |
| PBI-046   | 8           | 8         | 0         |
| PBI-003   | 10          | 10        | 0         |
| PBI-037   | 7           | 7         | 0         |
| PBI-004   | 24          | 24        | 0         |
| PBI-005   | 27          | 27        | 0         |
| PBI-006   | 12          | 12        | 0         |
| PBI-008   | 8           | 8         | 0         |
| **Total** | **133**     | **133**   | **0**     |

**Pre-sprint tasks already done (marked `[x]`):** GitHub repo created, `.gitignore` added, `README.md` added, core SDD docs committed, Notion workspace built and published, Vercel project connected. 14 tasks complete before Sprint 1 even starts.

---

## Sprint 2 Slice

Sprint 2 tasks (PBI-009 to PBI-016, PBI-040) will be authored during Sprint 1 and committed before Sprint 2 Planning on 20 May 2026.

---

_tasks.md v1.0 — Sprint 1 Slice — April 17, 2026 — HireFlow_
_This is your daily working document during Sprint 1. Open it at the start of every session. Pick the next `[ ]` task. Complete it. Mark it `[x]`. Close the session._
