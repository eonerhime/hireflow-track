# HireFlow — Specification Document

**Document Type:** Specification Artifact
**Version:** 1.0 — Sprint 1 Slice
**Date:** April 17, 2026
**Status:** Active
**Author:** Product Owner / Developer
**Repository:** https://github.com/eonerhime/hireflow-track

---

## Cross-References

| Document               | Relationship                                                |
| ---------------------- | ----------------------------------------------------------- |
| `product.md`           | Upstream source — PBIs, acceptance gates, scope boundaries  |
| `plan.md`              | Sprint dates and DoD that govern spec authoring windows     |
| `tasks.md`             | Atomic dev tasks derived from specs in this document        |
| `testing.md`           | Test cases written against acceptance criteria defined here |
| `implementation.md`    | Technical decisions that constrain or inform specs          |
| `sprints/sprint-01.md` | Active sprint document — PBI status tracked there           |

---

## How This Document Works

Each PBI from `product.md` has a specification section here. A spec section contains:

- **Overview** — what this item is and why it exists
- **Acceptance Criteria** — the exact conditions that must be true for the item to be Done. Written in Given / When / Then format. These are the conditions tested in `testing.md`.
- **API Contract** — for backend PBIs: endpoints, request shape, response shape, error states
- **Implementation Notes** — constraints, decisions, or gotchas the developer must know before starting
- **DoD Checklist** — the item-level Definition of Done (from `plan.md`) applied to this specific PBI

Specs are authored per sprint slice. This file contains the Sprint 1 slice only.

**Spec status markers:** `[ ]` Not specced | `[~]` In review | `[x]` Approved | `[!]` Blocked

---

## Sprint 1 Slice — PBIs in Scope

| PBI     | Item                                                | Size | Spec Status |
| ------- | --------------------------------------------------- | ---- | ----------- |
| PBI-007 | GitHub repository + branch strategy                 | S    | [x]         |
| PBI-001 | Next.js project scaffold with TypeScript + Tailwind | S    | [x]         |
| PBI-002 | PostgreSQL database setup on Neon                   | S    | [x]         |
| PBI-039 | HTTPS + security headers (Next.js config)           | S    | [x]         |
| PBI-046 | Notion workspace setup and public share             | S    | [x]         |
| PBI-003 | Prisma ORM setup + initial schema                   | M    | [x]         |
| PBI-004 | User registration (email/password + bcrypt)         | M    | [x]         |
| PBI-005 | User login + JWT session management                 | M    | [x]         |
| PBI-006 | Protected route middleware                          | S    | [x]         |
| PBI-037 | Input validation (Zod — server and client)          | M    | [x]         |
| PBI-008 | Vercel deployment (dev environment)                 | S    | [x]         |

---

## Specifications

---

### PBI-007 — GitHub Repository + Branch Strategy

**Epic:** Foundation & Auth
**Size:** S
**Priority:** 🔴 Must Have
**Sprint:** 1
**Depends on:** Nothing — first action of Sprint 1

#### Overview

Establish the GitHub repository that will house all project code and SDD documents. Define and document the branch strategy that all subsequent development follows. This PBI is the prerequisite for every other PBI in the project.

#### Acceptance Criteria

**AC-007-01 — Repository exists and is correctly configured**

- Given the developer navigates to the GitHub repository URL
- When the page loads
- Then the repository is public, named `hireflow-track`, contains a `README.md`, and has a `.gitignore` configured for Node.js

**AC-007-02 — Branch strategy is in place**

- Given the repository exists
- When the developer views the branches
- Then a `main` branch exists (protected — no direct pushes) and a `develop` branch exists as the integration branch
- And `develop` was created before any SDD document commits — not after

**AC-007-03 — Branch naming convention is documented**

- Given a developer is starting a new PBI
- When they create a branch
- Then the branch follows the convention: `feature/PBI-XXX-short-description` (e.g. `feature/PBI-004-user-registration`)

**AC-007-04 — SDD documents are committed**

- Given the repository is set up
- When the developer views the repository root
- Then `product.md`, `plan.md`, `spec.md` (Sprint 1 slice), and `linkedin.md` are present in a `/docs` directory

#### Implementation Notes

- Repository name: `hireflow-track` (lowercase, no spaces)
- Visibility: Public — required for portfolio showcase
- **First action sequence — do in this exact order:**
  1. Create repository on GitHub
  2. Commit `README.md` placeholder to `main` (GitHub creates `main` automatically)
  3. Create `develop` branch from `main` and push it: `git checkout -b develop && git push -u origin develop`
  4. Enable branch protection on `main` immediately: Settings → Branches → Add ruleset → Require PR before merging
  5. All subsequent commits — including SDD documents — go to `develop`
- `.gitignore`: use GitHub's standard Node template; add `.env` and `.env.local` manually
- `/docs` folder must be named exactly `docs` — SDD cross-references depend on this path
  ```
  /docs
    product.md
    plan.md
    spec.md
    linkedin.md
    notion-setup.md
  ```
- `sprints/` subdirectory created in `/docs` at Sprint 1 kickoff; `sprint-01.md` committed there

#### DoD Checklist

- [ ] Repository exists, is public, and is named `hireflow-track`
- [ ] `main` and `develop` branches exist
- [ ] Branch protection enabled on `main`
- [ ] `.gitignore` excludes `.env`, `node_modules`, `.next`
- [ ] `/docs` directory contains all four SDD documents
- [ ] PBI marked `[x]` in `product.md` and `sprint-01.md`

---

### PBI-001 — Next.js Project Scaffold with TypeScript + Tailwind

**Epic:** Foundation & Auth
**Size:** S
**Priority:** 🔴 Must Have
**Sprint:** 1
**Depends on:** PBI-007 (repository must exist)

#### Overview

Initialise the Next.js 15 application with TypeScript strict mode and Tailwind CSS. This scaffold is the foundation all application code is built on. Getting it right — strict TypeScript, correct directory structure, Tailwind configured — prevents expensive retrofitting later.

#### Acceptance Criteria

**AC-001-01 — Application runs locally**

- Given the developer clones the repository and runs `npm install`
- When they run `npm run dev`
- Then the application starts on `localhost:3000` with no errors in the terminal

**AC-001-02 — TypeScript strict mode is active**

- Given the project scaffold exists
- When the developer opens `tsconfig.json`
- Then `"strict": true` is present and no TypeScript errors exist in the initial codebase

**AC-001-03 — Tailwind CSS is configured and working**

- Given the scaffold exists
- When a component uses a Tailwind utility class (e.g. `className="text-blue-500"`)
- Then the class applies correctly in the browser with no build errors

**AC-001-04 — Directory structure matches the agreed convention**

- Given the scaffold exists
- When the developer views the project root
- Then the following directories exist: `app/`, `components/`, `lib/`, `prisma/`, `public/`

**AC-001-05 — Environment variable structure is in place**

- Given the scaffold exists
- When the developer views the project root
- Then a `.env.example` file exists with all required variable keys (values empty) and `.env.local` is in `.gitignore`

#### Implementation Notes

- Initialise with: `npx create-next-app@latest hireflow-track --typescript --tailwind --eslint --app --src-dir no --import-alias "@/*"`
- Use Next.js **App Router** (not Pages Router) — required for Next.js 15
- `tsconfig.json` — confirm `"strict": true` is set; do not modify other compiler options at scaffold stage
- Tailwind: confirm `tailwind.config.ts` content paths include `./app/**/*.{ts,tsx}` and `./components/**/*.{ts,tsx}`
- Required `.env.example` keys at Sprint 1:
  ```
  DATABASE_URL=
  JWT_SECRET=
  NEXTAUTH_URL=
  NEXTAUTH_SECRET=
  ```
- ESLint config: use default Next.js config; do not customise at scaffold stage
- Delete the default Next.js boilerplate content from `app/page.tsx` — replace with a minimal placeholder: `<main><h1>HireFlow</h1></main>`

#### DoD Checklist

- [ ] `npm run dev` starts with no errors
- [ ] `tsc --noEmit` passes with no errors
- [ ] `npm run lint` passes with no warnings
- [ ] `"strict": true` confirmed in `tsconfig.json`
- [ ] Tailwind utility class renders correctly in browser
- [ ] Directory structure: `app/`, `components/`, `lib/`, `prisma/`, `public/` all exist
- [ ] `.env.example` committed with all Sprint 1 variable keys
- [ ] `.env.local` confirmed absent from repository (in `.gitignore`)
- [ ] PBI marked `[x]` in `product.md` and `sprint-01.md`

---

### PBI-002 — PostgreSQL Database Setup on Neon

**Epic:** Foundation & Auth
**Size:** S
**Priority:** 🔴 Must Have
**Sprint:** 1
**Depends on:** PBI-007 (repository), PBI-001 (scaffold — needs `DATABASE_URL` in `.env.local`)

#### Overview

Provision a PostgreSQL database on Neon that the application connects to. This is the persistence layer for all user and application data. The database must be reachable from both the local development environment and Vercel.

#### Acceptance Criteria

**AC-002-01 — Database is provisioned on Neon**

- Given the developer logs into Neon
- When they view the HireFlow project
- Then a PostgreSQL service is running with status _Active_

**AC-002-02 — Local connection is verified**

- Given the `DATABASE_URL` is set in `.env.local`
- When the developer runs `npx prisma db push` (after PBI-003)
- Then the command completes successfully with no connection errors

**AC-002-03 — Connection string is not committed to the repository**

- Given the repository exists
- When the developer searches the commit history for `DATABASE_URL`
- Then no connection string value appears in any committed file

#### Implementation Notes

- Neon account: create at neon.tech — free tier, no credit card required
- Project setup: New Project → Create Database → copy both connection strings from Dashboard → Connection Details panel
- Two connection strings are required:
  - `DATABASE_URL` (pooled, contains `-pooler` in hostname) → `lib/prisma.ts` → runtime queries only
  - `DIRECT_URL` (direct, no `-pooler`) → `prisma.config.ts` → all Prisma CLI commands only
- Pooled URL throws P1001 on all Prisma CLI commands — never use `DATABASE_URL` in `prisma.config.ts`
- Add both to `.env.local`:
  DATABASE_URL=<pooled connection string>
  DIRECT_URL=<direct connection string>
- `prisma.config.ts` uses `@next/env` `loadEnvConfig` to read `.env.local` — `dotenv/config` only reads `.env` which does not exist in this project
- `schema.prisma` datasource block contains no URL fields — Prisma v6 pattern
- Add both variables to Vercel environment variables (done at PBI-008)
- Neon compute pauses after inactivity — resumes automatically in under 1 second; not a problem for a portfolio project

#### DoD Checklist

- [ ] PostgreSQL service running on Neon with status Active
- [ ] `DATABASE_URL` set in `.env.local` (not committed)
- [ ] `DATABASE_URL` added to Vercel environment variables
- [ ] Connection verified (Prisma can reach the database — tested at PBI-003)
- [ ] Neon project noted in `implementation.md` under infrastructure decisions
- [ ] PBI marked `[x]` in `product.md` and `sprint-01.md`

---

### PBI-039 — HTTPS + Security Headers (Next.js Config)

**Epic:** Quality & Security
**Size:** S
**Priority:** 🔴 Must Have
**Sprint:** 1
**Depends on:** PBI-001 (scaffold must exist)

#### Overview

Configure HTTP security headers in `next.config.ts` to protect the application against common web vulnerabilities. This is done at scaffold stage — not retrofitted — because adding headers later risks breaking existing behaviour. HTTPS is handled automatically by Vercel; this PBI is about the response headers the application sends.

#### Acceptance Criteria

**AC-039-01 — Security headers are present on all responses**

- Given the application is running (locally or on Vercel)
- When the developer inspects the response headers in browser DevTools (Network tab → any request → Headers)
- Then the following headers are present: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`

**AC-039-02 — X-Frame-Options prevents clickjacking**

- Given the application is running
- When the `X-Frame-Options` header is inspected
- Then its value is `DENY`

**AC-039-03 — Content type sniffing is disabled**

- Given the application is running
- When the `X-Content-Type-Options` header is inspected
- Then its value is `nosniff`

**AC-039-04 — Referrer policy is set**

- Given the application is running
- When the `Referrer-Policy` header is inspected
- Then its value is `strict-origin-when-cross-origin`

**AC-039-05 — No build errors introduced by config change**

- Given the headers are configured in `next.config.ts`
- When `npm run build` is run
- Then the build completes with no errors

#### Implementation Notes

Add the following to `next.config.ts`:

```typescript
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

- The CSP `unsafe-eval` and `unsafe-inline` entries are required for Next.js in development. Tighten in a later sprint if time allows — log as a known trade-off in `implementation.md`.
- HTTPS is enforced automatically on Vercel — no additional config required.

#### DoD Checklist

- [ ] Security headers configured in `next.config.ts`
- [ ] All five headers present in response (verified in DevTools)
- [ ] `npm run build` passes with no errors
- [ ] CSP trade-offs noted in `implementation.md`
- [ ] PBI marked `[x]` in `product.md` and `sprint-01.md`

---

### PBI-046 — Notion Workspace Setup and Public Share

**Epic:** Documentation & Portfolio
**Size:** S
**Priority:** 🔴 Must Have
**Sprint:** 1
**Depends on:** Nothing technical — can be done in parallel with development tasks

#### Overview

Create and publish the HireFlow Notion workspace so that LinkedIn followers have a single public link to the project hub from Week 1 onward. The workspace does not need to be complete at Sprint 1 — it needs to be live, credible, and navigable.

#### Acceptance Criteria

**AC-046-01 — Workspace is publicly accessible**

- Given a visitor has the public Notion link
- When they open it in a browser without a Notion account
- Then the HireFlow Home page loads with no login prompt

**AC-046-02 — All four pages exist and are navigable**

- Given the workspace is live
- When a visitor opens it
- Then Home, Documents Index, Sprint Board, and Changelog are all accessible from the Home page

**AC-046-03 — Sprint Board is accurate at publish time**

- Given the workspace is first made public
- When a visitor views the Sprint Board
- Then Pre-Sprint shows 🔄 In progress and all other sprints show 🔲 Not started

**AC-046-04 — Documents Index links to committed SDD files**

- Given the workspace is live
- When a visitor clicks a document link in the Documents Index
- Then they are taken to the correct file in the GitHub repository

**AC-046-05 — Public link is recorded**

- Given the workspace is live
- When the Scrum Master opens `plan.md`
- Then the Notion public URL is recorded in the cross-reference table

#### Implementation Notes

- Full setup instructions in `notion-setup.md` — follow that guide exactly
- The live app link on the Home page will be a placeholder until Sprint 3 close — use the text `[Live app — available at MVP launch, 16 June 2026]`
- The Changelog page has no entries at Sprint 1 — this is correct; the placeholder text is sufficient
- At Sprint 1 close, add a Changelog entry and update Sprint Board (see `notion-setup.md` maintenance schedule)
- The Notion link will first appear in a LinkedIn post at Week 8 (Post 22) — but the workspace should be live from Sprint 1 so it is available if anyone navigates from the GitHub repo

#### DoD Checklist

- [ ] Notion account created
- [ ] All four pages created: Home, Documents Index, Sprint Board, Changelog
- [ ] Home page body content complete (tagline, links, About, Navigate, Status callout)
- [ ] Sprint Board table accurate at publish date
- [ ] Documents Index links to GitHub for all committed SDD files
- [ ] Workspace made public (Share → Share to web → ON)
- [ ] Public link tested in incognito browser
- [ ] Public link recorded in `plan.md` cross-reference table
- [ ] PBI marked `[x]` in `product.md` and `sprint-01.md`

---

### PBI-003 — Prisma ORM Setup + Initial Schema

**Epic:** Foundation & Auth
**Size:** M
**Priority:** 🔴 Must Have
**Sprint:** 1
**Depends on:** PBI-001 (scaffold), PBI-002 (database)

#### Overview

Install and configure Prisma ORM and define the initial database schema. The Sprint 1 schema covers the `User` model only. The `Application`, `Contact`, and other models are added in Sprint 2 and Sprint 3. Getting the `User` model right — with correct field types, constraints, and indexes — is the foundation everything else builds on.

#### Acceptance Criteria

**AC-003-01 — Prisma is installed and initialised**

- Given the project scaffold exists
- When the developer runs `npx prisma generate`
- Then the Prisma client generates with no errors

**AC-003-02 — User model is defined correctly**

- Given `prisma/schema.prisma` exists
- When the developer opens it
- Then the `User` model contains: `id`, `email`, `password`, `createdAt`, `updatedAt` with the correct types and constraints (see Implementation Notes)

**AC-003-03 — Migration runs successfully**

- Given the schema is defined and `DATABASE_URL` is set
- When the developer runs `npx prisma migrate dev --name init`
- Then the migration completes, the `User` table is created in the Neon database, and the migration file is committed to the repository

**AC-003-04 — Prisma Studio can view the User table**

- Given the migration has run
- When the developer runs `npx prisma studio`
- Then the `User` table is visible with the correct columns and zero rows

**AC-003-05 — Prisma client is instantiated as a singleton**

- Given the project exists
- When the developer opens `lib/prisma.ts`
- Then the Prisma client is exported as a singleton (prevents connection pool exhaustion in development)

#### API Contract

Not applicable — this PBI is infrastructure, not an API route.

#### Implementation Notes

**Schema definition:**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
}


model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

> Prisma v6 — connection URL configured in `prisma.config.ts`, not here.
```

- Use `cuid()` not `uuid()` for IDs — shorter, URL-safe, ordered
- `email` must be `@unique` — enforced at DB level, not just application level
- `password` stores the bcrypt hash — never the plaintext password
- `updatedAt` uses `@updatedAt` — Prisma updates this automatically on every write

**Prisma singleton (`lib/prisma.ts`):**

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

> Prisma v7 requires an adapter. `new PrismaClient()` without `{ adapter }`
> throws `PrismaClientInitializationError` at runtime.

- This pattern prevents Next.js hot-reload from creating multiple Prisma connections in development
- Import `prisma` from `@/lib/prisma` in all API routes — never instantiate `PrismaClient` directly

#### DoD Checklist

- [ ] `npm install prisma @prisma/client` completed
- [ ] `prisma/schema.prisma` contains correct `User` model
- [ ] Migration file committed to repository (`prisma/migrations/`)
- [ ] `npx prisma migrate dev` runs clean against Neon database
- [ ] `lib/prisma.ts` singleton created and exported
- [ ] `npx prisma studio` shows `User` table with correct columns
- [ ] No TypeScript errors (`tsc --noEmit` clean)
- [ ] PBI marked `[x]` in `product.md` and `sprint-01.md`
- [ ] `DATABASE_URL` (pooled) and `DIRECT_URL` (direct) set in `.env.local`
- [ ] Both variables added to Vercel environment variables
- [ ] `DATABASE_URL` confirmed in `lib/prisma.ts`
- [ ] `DIRECT_URL` confirmed in `prisma.config.ts`

---

### PBI-004 — User Registration (Email/Password + bcrypt)

**Epic:** Foundation & Auth
**Size:** M
**Priority:** 🔴 Must Have
**Sprint:** 1
**Depends on:** PBI-003 (User model), PBI-037 (Zod validation)

#### Overview

Allow a new user to create an account with an email address and password. The password is hashed with bcrypt before storage. The registration form validates input client-side and server-side. On success, the user is redirected to the login page.

#### Acceptance Criteria

**AC-004-01 — Registration form renders**

- Given the user navigates to `/register`
- When the page loads
- Then a form is displayed with fields for email, password, and confirm password, and a submit button

**AC-004-02 — Successful registration creates a user**

- Given the user is on `/register`
- When they submit a valid email and password (≥ 8 characters)
- Then a new `User` record is created in the database with the hashed password, and the user is redirected to `/login` with a success message

**AC-004-03 — Duplicate email is rejected**

- Given a user with `email@example.com` already exists
- When a new user attempts to register with the same email
- Then the API returns a 409 response and the form displays the error: _"An account with this email already exists"_

**AC-004-04 — Weak password is rejected**

- Given the user is on `/register`
- When they submit a password with fewer than 8 characters
- Then the form displays a validation error before submission: _"Password must be at least 8 characters"_

**AC-004-05 — Password mismatch is rejected**

- Given the user is on `/register`
- When the password and confirm password fields do not match
- Then the form displays a validation error: _"Passwords do not match"_

**AC-004-06 — Empty fields are rejected**

- Given the user is on `/register`
- When they submit the form with any required field empty
- Then the form displays a field-level validation error and does not submit

**AC-004-07 — Password is never stored in plaintext**

- Given a user registers successfully
- When the developer queries the `User` table in Prisma Studio
- Then the `password` field contains a bcrypt hash (starts with `$2b$`) — not the original password

#### API Contract

**Endpoint:** `POST /api/auth/register`

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "confirmPassword": "securepassword123"
}
```

**Success response — 201:**

```json
{
  "message": "Account created successfully"
}
```

**Error responses:**

| Status | Condition                | Body                                                       |
| ------ | ------------------------ | ---------------------------------------------------------- |
| 400    | Validation failed (Zod)  | `{ "error": "Validation failed", "details": [...] }`       |
| 409    | Email already registered | `{ "error": "An account with this email already exists" }` |
| 500    | Unexpected server error  | `{ "error": "Internal server error" }`                     |

**Route file:** `app/api/auth/register/route.ts`

#### Implementation Notes

- Install bcrypt: `npm install bcryptjs` and `npm install -D @types/bcryptjs`
- Salt rounds: `10` — do not lower this value
- Hash pattern:
  ```typescript
  import bcrypt from "bcryptjs";
  const hashedPassword = await bcrypt.hash(password, 10);
  ```
- Never return the `password` field in any API response — select explicit fields from Prisma
- The `confirmPassword` field is validated on the client and in the Zod schema but is **not** sent to the database — it is a UI-only concern
- Redirect on success: use Next.js `router.push('/login')` from the client component after a 201 response
- Success message on `/login` page: pass via URL query param (`/login?registered=true`) and display a toast or inline message

#### DoD Checklist

- [ ] `POST /api/auth/register` route created and returns correct status codes
- [ ] Passwords hashed with bcrypt (salt rounds: 10) before DB write
- [ ] Duplicate email returns 409
- [ ] Zod schema validates email format, password length (≥ 8), and password match
- [ ] Client-side validation fires before form submission
- [ ] `/register` page renders and submits correctly
- [ ] Redirect to `/login` on success
- [ ] RTL test: form renders, validation errors appear, successful submission redirects
- [ ] `tsc --noEmit` and `npm run lint` clean
- [ ] PBI marked `[x]` in `product.md` and `sprint-01.md`

---

### PBI-005 — User Login + JWT Session Management

**Epic:** Foundation & Auth
**Size:** M
**Priority:** 🔴 Must Have
**Sprint:** 1
**Depends on:** PBI-004 (User records must exist), PBI-003 (Prisma), PBI-037 (Zod)

#### Overview

Allow a registered user to log in with their email and password. On success, issue a signed JWT stored in an HTTP-only cookie. The JWT is the session token used to authenticate all subsequent requests. On logout, the cookie is cleared.

#### Acceptance Criteria

**AC-005-01 — Login form renders**

- Given the user navigates to `/login`
- When the page loads
- Then a form is displayed with email and password fields and a submit button

**AC-005-02 — Successful login issues a session cookie**

- Given a registered user exists
- When they submit correct credentials
- Then the server responds with a 200, sets an HTTP-only cookie named `hireflow-track-token`, and the user is redirected to `/dashboard`

**AC-005-03 — Incorrect credentials are rejected**

- Given a registered user exists
- When they submit an incorrect password or unregistered email
- Then the server responds with a 401 and the form displays: _"Invalid email or password"_ (do not specify which field is wrong)

**AC-005-04 — JWT contains correct payload**

- Given a user logs in successfully
- When the JWT in the cookie is decoded (in tests or DevTools)
- Then the payload contains: `userId`, `email`, and `exp` (expiry timestamp)

**AC-005-05 — Session expires after 7 days**

- Given a user is logged in
- When 7 days have passed since login
- Then the cookie expires, subsequent requests to protected routes return 401, and the user is redirected to `/login`

**AC-005-06 — Logout clears the session**

- Given a user is logged in
- When they trigger logout (POST to `/api/auth/logout`)
- Then the `hireflow-track-token` cookie is cleared and the user is redirected to `/login`

**AC-005-07 — Cookie is HTTP-only and not accessible via JavaScript**

- Given a user is logged in
- When the developer opens the browser console and runs `document.cookie`
- Then `hireflow-track-token` is not visible in the output

#### API Contract

**Endpoint:** `POST /api/auth/login`

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Success response — 200:**

```json
{
  "message": "Login successful"
}
```

Sets cookie: `hireflow-track-token=<jwt>; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`

**Error responses:**

| Status | Condition           | Body                                                 |
| ------ | ------------------- | ---------------------------------------------------- |
| 400    | Validation failed   | `{ "error": "Validation failed", "details": [...] }` |
| 401    | Invalid credentials | `{ "error": "Invalid email or password" }`           |
| 500    | Server error        | `{ "error": "Internal server error" }`               |

---

**Endpoint:** `POST /api/auth/logout`

**Request body:** None

**Success response — 200:**

```json
{
  "message": "Logged out"
}
```

Clears cookie: `hireflow-track-token`; redirects client to `/login`

#### Implementation Notes

- Install: `npm install jose` — used for JWT signing and verification (`jose` is Edge Runtime compatible; `jsonwebtoken` is not)
- `JWT_SECRET` must be set in `.env.local` and Vercel environment — minimum 32 characters, randomly generated
- JWT signing:
  ```typescript
  import { SignJWT } from "jose";
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ userId: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
  ```
- Cookie settings: `HttpOnly: true`, `Secure: true` (Vercel handles HTTPS), `SameSite: 'Lax'`, `Path: '/'`, `Max-Age: 604800` (7 days)
- Use Next.js `cookies()` from `next/headers` to set and clear cookies in Route Handlers
- Never return the JWT in the response body — cookie only
- Error message for invalid credentials must be generic (do not reveal whether email or password was wrong — prevents user enumeration)

#### DoD Checklist

- [ ] `POST /api/auth/login` route created and returns correct status codes
- [ ] `POST /api/auth/logout` route clears cookie and redirects
- [ ] JWT signed with `jose`, contains `userId`, `email`, `exp`
- [ ] Cookie set as HTTP-only, Secure, SameSite=Lax, 7-day expiry
- [ ] `document.cookie` in browser console does not expose `hireflow-track-token`
- [ ] Invalid credentials return 401 with generic message
- [ ] Redirect to `/dashboard` on successful login
- [ ] RTL test: form renders, error message on bad credentials, cookie set on success
- [ ] `tsc --noEmit` and `npm run lint` clean
- [ ] PBI marked `[x]` in `product.md` and `sprint-01.md`

---

### PBI-006 — Protected Route Middleware

**Epic:** Foundation & Auth
**Size:** S
**Priority:** 🔴 Must Have
**Sprint:** 1
**Depends on:** PBI-005 (JWT session must exist to verify)

#### Overview

Protect all application routes behind authentication. Any request to a protected route without a valid session cookie is redirected to `/login`. The middleware runs at the Edge before any page or API route is rendered.

#### Acceptance Criteria

**AC-006-01 — Unauthenticated user is redirected from dashboard**

- Given no session cookie exists
- When the user navigates to `/dashboard`
- Then they are redirected to `/login` without the page rendering

**AC-006-02 — Authenticated user accesses protected routes**

- Given a valid `hireflow-track-token` cookie exists
- When the user navigates to `/dashboard`
- Then the page renders normally

**AC-006-03 — Expired JWT redirects to login**

- Given a `hireflow-track-token` cookie exists but the JWT is expired
- When the user navigates to any protected route
- Then they are redirected to `/login` and the expired cookie is cleared

**AC-006-04 — API routes return 401 for unauthenticated requests**

- Given no session cookie exists
- When a request is made to any protected API route (e.g. `GET /api/applications`)
- Then the API returns a 401 response — not a redirect

**AC-006-05 — Public routes are not blocked**

- Given no session cookie exists
- When the user navigates to `/login` or `/register`
- Then the page renders normally without redirection

#### Implementation Notes

- File location: `middleware.ts` at the project root (Next.js convention)
- Use `NextResponse.redirect` for page routes and `NextResponse.json` with 401 for API routes
- JWT verification in middleware using `jose`:
  ```typescript
  import { jwtVerify } from "jose";
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  ```
- Public routes (do not protect): `/`, `/login`, `/register`, `/api/auth/login`, `/api/auth/register`
- Protected route pattern: all routes under `/dashboard` and `/api` except auth routes
- Use `matcher` config in middleware to scope which routes the middleware runs on:
  ```typescript
  export const config = {
    matcher: ["/dashboard/:path*", "/api/:path*"],
  };
  ```
- Exclude auth API routes from the matcher or handle them inside the middleware with an allow-list

#### DoD Checklist

- [ ] `middleware.ts` exists at project root
- [ ] Unauthenticated requests to `/dashboard` redirect to `/login`
- [ ] Unauthenticated requests to protected API routes return 401
- [ ] Expired JWT is caught and user is redirected
- [ ] `/login` and `/register` are accessible without authentication
- [ ] `tsc --noEmit` and `npm run lint` clean
- [ ] RTL/integration test: middleware redirects unauthenticated requests
- [ ] PBI marked `[x]` in `product.md` and `sprint-01.md`

---

### PBI-037 — Input Validation (Zod — Server and Client)

**Epic:** Quality & Security
**Size:** M
**Priority:** 🔴 Must Have
**Sprint:** 1
**Depends on:** PBI-001 (scaffold)
**Used by:** PBI-004 (registration), PBI-005 (login) — must be ready before these

#### Overview

Install Zod and define the validation schemas used in Sprint 1. Zod schemas run on both the server (in API route handlers) and the client (for real-time form feedback). Defining them as shared schemas in `lib/schemas/` ensures the same rules apply in both environments without duplication.

#### Acceptance Criteria

**AC-037-01 — Zod is installed**

- Given the project exists
- When the developer runs `npm list zod`
- Then zod is listed as a dependency

**AC-037-02 — Auth schemas are defined and exported**

- Given `lib/schemas/auth.ts` exists
- When the developer opens it
- Then `registerSchema` and `loginSchema` are exported with the correct validation rules

**AC-037-03 — Server-side validation rejects invalid input**

- Given an API route uses a Zod schema
- When an invalid request body is received (e.g. malformed email, short password)
- Then the route returns a 400 response with a `details` array describing which fields failed and why

**AC-037-04 — Client-side validation fires before submission**

- Given a form uses the Zod schema via react-hook-form + zodResolver
- When the user submits the form with invalid input
- Then field-level error messages appear without a network request being made

**AC-037-05 — Schema rules match across client and server**

- Given a password of 7 characters
- When validated on both client and server
- Then both reject it with the same rule: minimum 8 characters

#### Implementation Notes

- Install: `npm install zod` and `npm install react-hook-form @hookform/resolvers`
- Schema file location: `lib/schemas/auth.ts`
- Schema definitions:

```typescript
import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

- Server-side usage in API route:
  ```typescript
  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        error: "Validation failed",
        details: result.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }
  ```
- Client-side usage with react-hook-form:
  ```typescript
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });
  ```
- The `confirmPassword` field is only in `registerSchema` — not sent to the API

#### DoD Checklist

- [ ] `zod`, `react-hook-form`, `@hookform/resolvers` installed
- [ ] `lib/schemas/auth.ts` created with `registerSchema` and `loginSchema`
- [ ] Types `RegisterInput` and `LoginInput` exported
- [ ] Server-side: API routes return 400 with `details` array on Zod failure
- [ ] Client-side: forms display field-level errors before submission
- [ ] `tsc --noEmit` clean (schemas fully typed)
- [ ] PBI marked `[x]` in `product.md` and `sprint-01.md`

---

### PBI-008 — Vercel Deployment (Dev Environment)

**Epic:** Foundation & Auth
**Size:** S
**Priority:** 🔴 Must Have
**Sprint:** 1
**Depends on:** PBI-007 (GitHub repo), PBI-001 (scaffold), PBI-002 (database URL)

#### Overview

Connect the GitHub repository to Vercel and deploy the application to a development preview URL. Every push to the `develop` branch triggers a new preview deployment. The `main` branch deploys to the production URL (used from Sprint 3 onward for the MVP launch).

#### Acceptance Criteria

**AC-008-01 — Application is deployed and accessible**

- Given the Vercel project is connected to the GitHub repository
- When the developer pushes to `develop`
- Then a deployment runs automatically and the application is accessible at a Vercel preview URL

**AC-008-02 — Environment variables are configured on Vercel**

- Given the Vercel project exists
- When the developer views Project Settings → Environment Variables
- Then `DATABASE_URL`, `JWT_SECRET`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` are all set for the Preview environment

**AC-008-03 — Build passes on Vercel**

- Given the code is pushed to GitHub
- When Vercel runs the build
- Then the build completes with no errors (same as `npm run build` locally)

**AC-008-04 — The deployed app connects to the database**

- Given the app is deployed on Vercel
- When a request is made to `/api/auth/register`
- Then the route responds (not a 500 database connection error)

#### Implementation Notes

- Vercel account: create at vercel.com — free Hobby plan is sufficient
- Connect via: New Project → Import Git Repository → select `hireflow-track`
- Framework preset: **Next.js** (auto-detected)
- Build settings: leave as default (`next build`)
- Environment variables: add all `.env.example` keys under Settings → Environment Variables → select **Preview** scope for `develop` branch deployments, **Production** scope for `main`
- `NEXTAUTH_URL`: set to the Vercel preview URL for Preview environment; update to the production URL when `main` is deployed
- Neon database: the same Neon PostgreSQL instance is used for both dev and production at this stage — this is acceptable for a portfolio project and noted as a known simplification in `implementation.md`
- After PBI-008 is done, record the Vercel project URL in `implementation.md`

#### DoD Checklist

- [ ] Vercel project created and linked to GitHub repository
- [ ] Push to `develop` triggers automatic deployment
- [ ] All environment variables set on Vercel (Preview scope)
- [ ] Build passes on Vercel with no errors
- [ ] Deployed app accessible at Vercel preview URL
- [ ] Database connection verified on deployed app
- [ ] Vercel project URL recorded in `implementation.md`
- [ ] PBI marked `[x]` in `product.md` and `sprint-01.md`

---

## Sprint 2 Slice

Sprint 2 specifications (PBI-009 to PBI-016, PBI-040) will be authored during Sprint 1 and committed before Sprint 2 Planning on 20 May 2026.

---

_spec.md v1.0 — Sprint 1 Slice — April 17, 2026 — HireFlow_
_This document is the authoritative specification source for all implementation work. No PBI enters development without an approved spec section. Acceptance criteria here are the exact criteria used in `testing.md`._
