# Contributing to HireTrace

HireTrace is an open portfolio project built using Spec-Driven Development. Contributions, forks, and adaptations are welcome. This document covers everything you need to get the project running locally and understand the rules that keep it stable.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Package Management Rules](#package-management-rules)
- [Database](#database)
- [Testing](#testing)
- [Code Style and Architecture Rules](#code-style-and-architecture-rules)
- [Branch and PR Workflow](#branch-and-pr-workflow)
- [Pre-Merge Checklist](#pre-merge-checklist)

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A [Neon](https://neon.tech) PostgreSQL database (free tier is sufficient)
- A [Cloudinary](https://cloudinary.com) account (free tier — for avatar and resume storage)
- A [Resend](https://resend.com) account (free tier — for email reminders)
- A Google Cloud project with OAuth 2.0 credentials (for Google sign-in)

### Installation

```bash
git clone https://github.com/eonerhime/hiretrace
cd hiretrace
npm install --legacy-peer-deps
```

> **`--legacy-peer-deps` is required.** The project uses React 19, which has peer dependency conflicts with several packages. All installs must use this flag. A `.npmrc` file at the root sets this automatically for Vercel deploys.

---

## Environment Variables

Create a `.env.local` file at the project root. All variables are required unless marked optional.

```env
# Database — Neon PostgreSQL
DATABASE_URL=<pooled connection string — do NOT append ?channel_binding=require>
DIRECT_URL=<direct connection string>

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<random string — min 32 chars>

# Google OAuth
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your API key>
CLOUDINARY_API_SECRET=<your API secret>

# Resend (email)
RESEND_API_KEY=<your API key>

# Cron job auth
CRON_SECRET=<random string — min 32 chars — generate with: openssl rand -base64 32>
```

Add the same variables to Vercel → Project Settings → Environment Variables for Preview and Production scopes.

---

## Running the App

```bash
# Development (port 3001 — port 3000 may conflict with other local apps)
npm run dev -- -p 3001

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build (run this before every Vercel push)
npm run build
```

> **Always run `npm run build` locally before pushing to Vercel.** Build failures on Vercel are slower to debug than local ones.

---

## Package Management Rules

**Never use `@latest`.** Always pin exact versions before installing.

```bash
# Wrong
npm install some-package@latest

# Right — check npm for the current stable version first
npm install some-package@x.x.x --legacy-peer-deps
```

The pinned stack (do not change these without a documented ADR):

| Package              | Pinned version                              |
| -------------------- | ------------------------------------------- |
| next                 | 15.5.15                                     |
| react                | 19.2.4                                      |
| typescript           | strict mode                                 |
| tailwindcss          | v4 (`@import "tailwindcss"` in globals.css) |
| prisma               | 5.22.0                                      |
| next-auth            | 4.24.11                                     |
| @hello-pangea/dnd    | 18.0.1                                      |
| react-day-picker     | 8.10.1                                      |
| date-fns             | 3.6.0                                       |
| cloudinary           | 2.5.1                                       |
| resend               | 4.0.0                                       |
| @playwright/test     | 1.51.1                                      |
| @testing-library/dom | 10.4.0                                      |

Version conflicts caused by `@latest` installs were the single largest source of deployment failures during development. The 30 seconds it takes to check a version is cheaper than the hours it takes to debug a breaking change.

---

## Database

HireTrace uses PostgreSQL 17 on [Neon](https://neon.tech) via Prisma.

### Applying schema changes

```bash
# Apply schema changes (preferred — avoids migration drift on Neon)
npx prisma db push

# Generate the Prisma client after schema changes
npx prisma generate

# Open Prisma Studio to inspect the database
npx prisma studio
```

> **Use `prisma db push` rather than `prisma migrate dev`** on the Neon-hosted database. Migration drift accumulated during development makes `migrate dev` unreliable on this project. `db push` syncs the schema directly without creating migration files.

### Connection string

Use the **pooled** Neon connection string for `DATABASE_URL`. Do not append `?channel_binding=require` — this causes connection failures with Prisma on Neon.

---

## Testing

### Unit and integration tests (React Testing Library + Jest)

```bash
# Run all tests
npm test

# Run a specific test file
npm test -- --testPathPattern=ApplicationList

# Watch mode
npm test -- --watch
```

**Expected baseline:** 120 tests passing, 0 failing.

#### Rules for writing tests

- `@jest-environment node` docblock must be the **absolute first line** of every API route test file — before any comments or imports. Anything before it breaks the Jest environment override.
- `jest.mock()` calls must come before all imports in API test files (Jest hoisting requirement).
- Always mock `next/cache` in API route test files that call `revalidatePath` — unmocked, it throws in the Jest node environment.
- Mock `getServerSession` from `next-auth/next` in API route tests — do not connect to a real session.
- All form inputs must have `htmlFor` on `<label>` and matching `id` on `<input>` — required for `getByLabelText` and accessibility.
- API route tests that accept `NextRequest` must pass `new Request(url)` cast to `NextRequest` — not a plain object.

### E2E tests (Playwright)

```bash
# Run E2E tests (app must be running on port 3001)
npm run dev -- -p 3001   # in one terminal
npx playwright test       # in another terminal

# Run headed (visible browser)
npx playwright test --headed
```

**Expected baseline:** 9 tests passing, 0 failing.

#### Rules for writing E2E tests

- Use `getByRole("link", { name: /pattern/ }).first()` — avoid strict mode violations from duplicate elements in the activity feed.
- `playwright.config.ts` has `webServer` with `reuseExistingServer: true` — the app must already be running on port 3001.
- Set `workers: 1` in `playwright.config.ts` — parallel workers cause session conflicts.

---

## Code Style and Architecture Rules

These rules are enforced across the codebase. Follow them when adding or modifying code.

### Server vs client components

- **Server components** fetch data with direct Prisma queries. Never use `fetch("/api/...")` inside a server component.
- **Client components** own all interactivity. Mark with `"use client"` at the top.
- Icons and navigation items must live inside client components — they cannot be passed as props across the server/client boundary.

### Authentication

- `authOptions` lives in `lib/auth-options.ts`. Never import it from the NextAuth route file (`app/api/auth/[...nextauth]/route.ts`).
- All dashboard pages and the login page must include `export const dynamic = "force-dynamic"` to prevent static caching of authenticated content.
- Server components use `getServerSession(authOptions)` directly — never `fetch("/api/...")` for session data.

### Dates

- All `Date` objects must be serialised to ISO strings before passing from server components to client components. Passing raw `Date` objects across the server/client boundary causes hydration errors.

```typescript
// Wrong
<ClientComponent date={application.createdAt} />

// Right
<ClientComponent date={application.createdAt.toISOString()} />
```

### Activity logging

- `logActivity()` calls are always fire-and-forget: `void logActivity(...)`. Never `await` them in a mutation path.
- Activity log writes must never throw — user mutations must not fail because of logging.
- `logActivity` metadata uses `?? undefined`, never `?? null` — the Prisma `Json` field rejects null.

### Tailwind CSS

- Dark mode is configured via `@variant dark (&:where(.dark, .dark *))` in `globals.css` — there is no `tailwind.config.ts` dark mode setting.
- Use `dark:bg-gray-900` for input backgrounds in dark mode — not `dark:bg-gray-700`.
- The FOUC prevention script in `app/layout.tsx` applies the `dark` class to `<html>` before React hydrates — do not remove it.

### Logos

- Light mode: `/public/hiretrace-horizontal.png`
- Dark mode: `/public/hiretrace-horizontal-dark.png`
- Always render both and toggle visibility with `dark:hidden` / `hidden dark:block`.

---

## Branch and PR Workflow

```
main (protected) → develop (integration) → feature/sprint-XX-description
```

- Branch from `develop`, not `main`.
- PRs merge to `develop` first — never directly to `main`.
- Merge conflicts: always accept incoming (`develop`) — never accept both sides.
- Use the sprint goal as the PR title.

---

## Pre-Merge Checklist

Run all four before opening a PR. All must pass clean.

```bash
npx tsc --noEmit   # TypeScript
npm run lint        # ESLint
npm test            # Jest (120 tests)
npm run build       # Next.js build
```

If any of the four fail, fix before pushing. Vercel will catch the same failures — local is faster.
