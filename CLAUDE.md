# CLAUDE.md — HireFlow

This file is the persistent project context for Claude Code. Read it at the start of every session. It tells you what this project is, how it is built, and the rules that govern all code you write or modify.

---

## Project Overview

**HireFlow** is a job application pipeline tracker — a full-stack web application that gives job seekers a structured, opinionated 6-stage pipeline (Applied → Screening → Interview → Assessment → Offer → Closed) instead of a spreadsheet.

**Methodology:** Specification-Driven Development (SDD). Every feature starts as a spec before it becomes code. No PBI enters development without an approved spec in `docs/spec.md`.

**Author:** Emo Onerhime (`github.com/eonerhime`)
**Repository:** `github.com/eonerhime/hireflow` (public)
**Notion workspace:** `https://dull-grain-172.notion.site/Hireflow-3463cecb82d08016a90be8bf80a5c6ce`

---

## Tech Stack

| Layer                       | Technology            | Version | Notes                                                        |
| --------------------------- | --------------------- | ------- | ------------------------------------------------------------ |
| Framework                   | Next.js               | 15.5.15 | PINNED — do not upgrade; v16 breaks Vercel deployment        |
| Language                    | TypeScript            | 5.x     | Strict mode enforced — `"strict": true`                      |
| Styling                     | Tailwind CSS          | 4.x     | Utility classes only — no custom CSS files                   |
| ORM                         | Prisma                | 5.22.0  | PINNED — do not upgrade; v6/v7 WASM incompatible with Vercel |
| Import from '@prisma/client |
| Validation                  | Zod                   | 3.x     | Server and client — schemas in `lib/schemas/`                |
| Forms                       | react-hook-form       | 7.x     | Always use `zodResolver` from `@hookform/resolvers`          |
| Auth (tokens)               | jose                  | 5.x     | Edge-compatible JWT — NOT `jsonwebtoken`                     |
| Password hashing            | bcryptjs              | 2.x     | 10 salt rounds — never `bcrypt` (native)                     |
| Testing                     | React Testing Library | 14.x    | Component tests — spec AC drives test cases                  |
| Test runner                 | Jest                  | 29.x    | Config in `jest.config.ts`                                   |
| Database                    | Neon (PostgreSQL 17)  | —       | Pooled URL for runtime, direct URL for migrations            |
| Deployment                  | Vercel                | —       | Hobby plan; `develop` → preview, `main` → production         |

---

## Directory Structure

```
hireFlow/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── login/route.ts
│   │       ├── logout/route.ts
│   │       └── register/route.ts
│   ├── dashboard/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/          ← shared UI components (Sprint 2+)
├── lib/
│   ├── prisma.ts        ← Prisma singleton — import from here ONLY
│   ├── jwt.ts           ← JWT sign/verify utilities
│   └── schemas/
│       └── auth.ts      ← Zod schemas for auth
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── docs/                ← all SDD documents (must be named exactly "docs")
│   ├── product.md
│   ├── plan.md
│   ├── spec.md
│   ├── features.md
│   ├── tasks.md
│   ├── implementation.md
│   ├── testing.md
│   ├── linkedin.md
│   ├── notion-setup.md
│   └── sprints/
│       └── sprint-01.md
├── proxy.ts         ← JWT verification at Edge — project root
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── jest.config.ts
├── jest.setup.ts
├── .env.example          ← committed, all keys with empty values
└── .env.local            ← gitignored, never commit
```

---

## Non-Negotiable Code Rules

These rules are permanent. Never break them — they were decisions made before the first commit.

1. **No `any` types.** TypeScript strict mode is active from commit one. Never use `any` — fix the type properly.
2. **No `new PrismaClient()` outside `lib/prisma.ts`.** Always import `prisma`
   from `@/lib/prisma`. Prisma v7 requires a `PrismaNeon` adapter — never call
   `new PrismaClient()` without `{ adapter }`. Import `PrismaClient` from
   `'@prisma/client'`.
3. **No inline styles.** Tailwind utility classes only — no `style={}` props.
4. **No Zod schemas defined inline.** All schemas live in `lib/schemas/` — never in components or route handlers.
5. **No `jsonwebtoken`.** Use `jose` — it is Edge Runtime compatible and required for `proxy.ts`.
6. **No `bcrypt`.** Use `bcryptjs` — no native compilation, same API, same security.
7. **No direct commits to `main`.** All development goes through feature branches → `develop` → `main` at sprint close.
8. **No secrets in source.** `.env.local` is gitignored. Never hardcode `DATABASE_URL`, `JWT_SECRET`, or any secret.
9. **No business logic in page components.** Pages compose components and call API routes. Logic belongs in route handlers and lib utilities.
10. **No `console.log` in committed code.** Remove all debug logging before marking a task done.

---

## Branch Strategy

| Branch    | Pattern                      | Purpose                             |
| --------- | ---------------------------- | ----------------------------------- |
| `main`    | `main`                       | Production only — no direct pushes  |
| `develop` | `develop`                    | Integration branch for all features |
| Feature   | `feature/PBI-XXX-short-desc` | One branch per PBI                  |

**Commit message format:**

```
[PBI-XXX] Short description of what this commit does
[DOCS] Update docs/tasks.md Sprint 1 progress
```

**PR self-review checklist before merge to `develop`:**

- `tsc --noEmit` passes
- `npm run lint` passes with no warnings
- `npm test` passes
- Manual test against AC in `docs/spec.md`
- No `console.log` in any changed file
- No `.env` values hardcoded
- No `any` types introduced

---

## Environment Variables

| Variable          | Purpose                             | Where Set            |
| ----------------- | ----------------------------------- | -------------------- |
| `DATABASE_URL`    | Neon pooled connection (runtime)    | `.env.local`, Vercel |
| `DIRECT_URL`      | Neon direct connection (migrations) | `.env.local`, Vercel |
| `JWT_SECRET`      | JWT signing key (min 32 chars)      | `.env.local`, Vercel |
| `NEXTAUTH_URL`    | Base URL of the application         | `.env.local`, Vercel |
| `NEXTAUTH_SECRET` | Reserved for Sprint 6 Google OAuth  | `.env.local`, Vercel |

**Generate secrets:**

```bash
openssl rand -base64 32
```

---

## Authentication Architecture

```
Register:
  Client → POST /api/auth/register → Zod validate → bcrypt.hash(pw, 10) → prisma.user.create → 201

Login:
  Client → POST /api/auth/login → Zod validate → prisma.user.findUnique → bcrypt.compare → SignJWT → Set HTTP-only cookie → 200

Protected request:
  Browser sends cookie automatically → proxy.ts → jwtVerify → next() or redirect/401

Logout:
  Client → POST /api/auth/logout → Clear cookie (Max-Age=0) → 200 → client redirects to /login
```

**Cookie name:** `hireFlow-token`
**Cookie settings:** `HttpOnly: true`, `Secure: process.env.NODE_ENV === 'production'`, `SameSite: 'lax'`, `Path: '/'`, `Max-Age: 604800` (7 days)

**Public routes (never intercepted by middleware):**

- `/`, `/login`, `/register`, `/api/auth/login`, `/api/auth/register`

---

## Database Schema (Sprint 1)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt hash only — never plaintext
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Additional models (Application, Contact, etc.) are added in Sprints 2–3. When adding models, always run `npx prisma migrate dev --name <descriptive-name>` and commit the migration file.

---

## Current Sprint

**Sprint 1 of 6** — Foundation & Auth
**Dates:** 06 May – 19 May 2026
**Sprint Goal:** The project infrastructure is live and a user can register and log in securely.

| PBI     | Item                                                | Size | Status |
| ------- | --------------------------------------------------- | ---- | ------ |
| PBI-007 | GitHub repository + branch strategy                 | S    | [ ]    |
| PBI-001 | Next.js project scaffold with TypeScript + Tailwind | S    | [ ]    |
| PBI-002 | PostgreSQL database setup on Neon                   | S    | [ ]    |
| PBI-039 | HTTPS + security headers (Next.js config)           | S    | [ ]    |
| PBI-046 | Notion workspace setup and public share             | S    | [ ]    |
| PBI-003 | Prisma ORM setup + initial schema                   | M    | [ ]    |
| PBI-037 | Input validation (Zod — server and client)          | M    | [ ]    |
| PBI-004 | User registration (email/password + bcrypt)         | M    | [ ]    |
| PBI-005 | User login + JWT session management                 | M    | [ ]    |
| PBI-006 | Protected route middleware                          | S    | [ ]    |
| PBI-008 | Vercel deployment (dev environment)                 | S    | [ ]    |

**Week 3 focus (06–12 May):** PBI-001, PBI-002, PBI-003, PBI-039, PBI-037
**Week 4 focus (13–19 May):** PBI-004, PBI-005, PBI-006, PBI-008

---

## SDD Document Map

When you need context, reference these docs directly:

| Question                                    | Document                    |
| ------------------------------------------- | --------------------------- |
| What are we building and why?               | `docs/product.md`           |
| What are the sprint dates and capacity?     | `docs/plan.md`              |
| What exactly must a feature do?             | `docs/spec.md`              |
| What is the feature breakdown for this PBI? | `docs/features.md`          |
| What atomic tasks are left to do?           | `docs/tasks.md`             |
| What stack decision was made and why?       | `docs/implementation.md`    |
| What test cases cover this AC?              | `docs/testing.md`           |
| What is the sprint status today?            | `docs/sprints/sprint-01.md` |

**Reference files by `@mention` in the Claude Code chat**, e.g.:

- `@docs/spec.md implement PBI-004 registration API route`
- `@docs/tasks.md what tasks remain for PBI-005?`
- `@docs/testing.md write the RTL test for TC-004-01`

---

## Testing Approach

- **Spec-first:** Write the test case before implementing the feature
- **Source of truth:** Test cases in `docs/testing.md` are derived from AC in `docs/spec.md`
- **Run tests:** `npm test`
- **Watch mode:** `npm test -- --watch`
- **Coverage:** `npm test -- --coverage`
- **A PBI is not Done until its tests pass**

Test files are co-located with their components/routes:

```
components/RegisterForm/RegisterForm.tsx
components/RegisterForm/RegisterForm.test.tsx
```

---

## Definition of Done (Every PBI)

Before marking any PBI `[x]`:

- [ ] All AC from `docs/spec.md` met
- [ ] `tsc --noEmit` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] `npm test` — all tests passing
- [ ] No `console.log` in changed files
- [ ] Manually tested against AC
- [ ] PBI status updated in `docs/product.md` and `docs/sprints/sprint-01.md`

**Frontend PBIs additionally:**

- [ ] RTL test written and passing
- [ ] Renders correctly at 375px and 1280px
- [ ] No inline styles

**Backend PBIs additionally:**

- [ ] Correct HTTP status codes (200, 201, 400, 401, 404, 500)
- [ ] Zod validation on all inputs
- [ ] Protected routes return 401 if unauthenticated
- [ ] Consistent JSON error shape: `{ error: string, details?: ... }`

---

## Known Gotchas

These are documented lessons from setup — do not repeat these mistakes:

1. **`develop` before first commit.** The `develop` branch must exist before any application code or docs are committed. Never commit directly to `main`.
2. **`docs` folder must be named exactly `docs`.** Every cross-reference in every SDD document uses `/docs`. Any other name breaks all links.
3. **Prisma creates a `.env` file on `init` — delete it.** This project uses `.env.local`. Delete the Prisma-generated `.env` immediately. Confirm `.env` is in `.gitignore`.
4. **Neon `DATABASE_URL` must use pooled string without `channel_binding=require`.** Remove that parameter from the connection string in both `.env.local` and Vercel environment variables — it causes authentication failures on Vercel serverless.
5. **`useSearchParams()` requires a Suspense boundary** in Next.js App Router. Wrap any component using it in `<Suspense>`.
6. **`secure: true` on cookies breaks localhost.** Use `secure: process.env.NODE_ENV === 'production'` on all cookie operations.
7. **`JWT_SECRET` must be set before testing auth routes.** If missing, login returns 500 silently.
8. **`bcryptjs` not `bcrypt`.** Never install `bcrypt` — it requires native compilation that fails on Vercel.
9. **`jose` in API routes only — never in `middleware.ts`.** Vercel's Edge Runtime rejects all jose import paths. Use `crypto.subtle` (Web Crypto API) for JWT verification in `middleware.ts`. jose is safe in `lib/jwt.ts` and API routes which run on Node.js runtime.
10. **Tailwind v4 — use `@import "tailwindcss"` in `globals.css`.**
    The `@tailwind` directives are gone in v4. One line replaces all three.
11. **Prisma is pinned to v5.22.0 — do not upgrade.** Prisma v6/v7 introduced WASM-based adapters incompatible with Vercel serverless. v5 uses the standard singleton pattern with no adapter. Import from `@prisma/client` — not `generated/prisma`. Run `npx prisma generate` after any schema change.

12. **Next.js is pinned to 15.5.15 — do not upgrade.** Next.js 16 deprecated `middleware.ts` in favour of `proxy.ts` which Vercel does not yet support. All routes returned 404 on Vercel with v16.

13. **`prisma.config.ts` does not exist in Prisma v5.** Delete it if auto-generated by any tooling. Prisma v5 reads `DATABASE_URL` directly from the environment via `schema.prisma` datasource block.

14. **`postinstall: prisma generate` is required in `package.json`.** Without it Vercel builds fail — the Prisma client is not generated before TypeScript type checking runs.

15. **Never use `@latest` when installing packages.** Always pin to specific versions. `@latest` installed Next.js 16 and Prisma v7 both of which broke Vercel deployment. Use `npx create-next-app@15` and `npm install prisma@5 @prisma/client@5`.

16. **Vercel framework preset must be set to Next.js at project creation.** Wrong preset causes all routes to return 404 from static. Verify immediately — Settings → General → Framework Preset → Next.js.

17. **Run `npm run build` locally before every Vercel push.** A passing local build does not guarantee Vercel success but a failing local build guarantees Vercel failure.

18. **Remove `channel_binding=require` from `DATABASE_URL`.** Neon's default pooled connection string includes this parameter — remove it from both `.env.local` and Vercel environment variables.

19. **`jose` cannot be used in `middleware.ts` on Vercel Edge Runtime.** Use `crypto.subtle` instead. jose is safe in API routes only.

---

## Rendering Strategy

| Route type            | Strategy                          | Reason                                          |
| --------------------- | --------------------------------- | ----------------------------------------------- |
| `/login`, `/register` | Client Component (`'use client'`) | Form interactivity required                     |
| `/dashboard`          | Server Component (default)        | Data fetched server-side at page level          |
| `/api/*`              | Route Handler                     | REST API — JSON responses only                  |
| `proxy.ts`            | Edge Runtime                      | Runs before rendering — must be Edge-compatible |

---

## Upcoming Sprints (for context)

| Sprint   | Goal                                       | Start Date  |
| -------- | ------------------------------------------ | ----------- |
| Sprint 2 | Core Pipeline (CRUD + Kanban)              | 20 May 2026 |
| Sprint 3 | Contacts + Reminders + Dashboard (MVP)     | 03 Jun 2026 |
| Sprint 4 | Notes + Metrics + API Hardening            | 17 Jun 2026 |
| Sprint 5 | Resume Management + Email Reminders        | 01 Jul 2026 |
| Sprint 6 | Analytics + Export + OAuth + E2E (Release) | 15 Jul 2026 |

**MVP target:** 16 June 2026 (Sprint 3 close)
**Full release target:** 28 July 2026 (Sprint 6 close)

---

_CLAUDE.md — HireFlow — Generated April 18, 2026_
_Update this file at each sprint close. Keep it accurate — this is what Claude Code reads at the start of every session._
