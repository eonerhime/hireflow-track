# HireFlow — Architecture

This document explains the structural decisions behind HireFlow: how the app is organised, why each major decision was made, and the constraints that must be respected when extending the codebase.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Application Structure](#application-structure)
- [Layout Hierarchy](#layout-hierarchy)
- [Server vs Client Components](#server-vs-client-components)
- [Authentication](#authentication)
- [Database](#database)
- [File Storage](#file-storage)
- [Email](#email)
- [Dark Mode](#dark-mode)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)
- [Architectural Decision Records](#architectural-decision-records)

---

## Tech Stack

| Layer                  | Technology                   | Version |
| ---------------------- | ---------------------------- | ------- |
| Framework              | Next.js App Router           | 15.5.15 |
| Language               | TypeScript (strict mode)     | —       |
| Styling                | Tailwind CSS v4              | —       |
| ORM                    | Prisma                       | 5.22.0  |
| Database               | PostgreSQL 17 (Neon)         | —       |
| Auth                   | NextAuth.js                  | 4.24.11 |
| Drag and drop          | @hello-pangea/dnd            | 18.0.1  |
| File storage           | Cloudinary                   | 2.5.1   |
| Email                  | Resend                       | 4.0.0   |
| Unit/integration tests | React Testing Library + Jest | —       |
| E2E tests              | Playwright                   | 1.51.1  |
| Hosting                | Vercel (Hobby)               | —       |

---

## Application Structure

```
hireFlow/
├── app/
│   ├── layout.tsx                  # Root layout — fonts, FOUC script, Providers only
│   ├── (legal)/                    # Route group — legal pages, no auth required
│   │   ├── layout.tsx              # Legal layout — logo + back link, no sidebar
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── cookies/page.tsx
│   ├── login/page.tsx              # Client component — credentials + Google OAuth
│   ├── register/page.tsx           # Client component — credentials registration
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth catch-all route
│   │   ├── applications/           # CRUD + notes + resume linking
│   │   ├── contacts/               # Contact CRUD
│   │   ├── reminders/              # GET upcoming + POST cron send
│   │   ├── resumes/                # Upload + delete
│   │   ├── dashboard/metrics/      # Aggregated pipeline metrics
│   │   ├── activity/               # Activity log feed
│   │   └── settings/               # Profile, avatar, password
│   └── dashboard/
│       ├── layout.tsx              # Auth-gated — sidebar + topbar
│       ├── page.tsx                # Server component — fetches data, renders DashboardClient
│       ├── applications/
│       ├── pipeline/
│       ├── contacts/
│       ├── reminders/
│       ├── analytics/
│       ├── resumes/
│       └── settings/
├── components/                     # All shared components
├── lib/
│   ├── auth-options.ts             # NextAuth authOptions — single source of truth
│   ├── prisma.ts                   # Prisma client singleton
│   ├── cloudinary.ts               # Cloudinary SDK initialisation
│   ├── dateRange.ts                # Date range presets (Preset type is source of truth)
│   └── schemas/                    # Zod schemas (auth, application, note, resume)
├── prisma/
│   └── schema.prisma
├── __tests__/                      # All test files
├── .npmrc                          # legacy-peer-deps=true
├── vercel.json                     # Cron schedule
└── docs/
    └── ARCHITECTURE.md             # This file
```

---

## Layout Hierarchy

There are three distinct layout contexts:

### 1. Root layout (`app/layout.tsx`)

Applies to every route. Contains only:

- Geist font variables
- FOUC prevention inline script
- `<Providers>` wrapper (NextAuth `SessionProvider`)

No navigation, no auth check, no UI chrome.

### 2. Legal layout (`app/(legal)/layout.tsx`)

Applies to `/privacy`, `/terms`, `/cookies`. Contains:

- Logo with dark/light variant
- "Back to HireFlow" link
- Footer with cross-links to all three legal pages

No auth required. Accessible to unauthenticated users.

### 3. Dashboard layout (`app/dashboard/layout.tsx`)

Applies to all `/dashboard/*` routes. Contains:

- Auth gate — redirects to `/login` if no session
- `SidebarNav` (client component)
- Top bar: `ThemeToggle`, `NotificationBell`, `LogoutButton`

---

## Server vs Client Components

This is the most important architectural boundary in the codebase.

### Server components

- Fetch data using **direct Prisma queries** — never `fetch("/api/...")`
- Cannot use React hooks, browser APIs, or event handlers
- Pass serialised data (ISO strings, plain objects) to client components
- All dashboard `page.tsx` files are server components

### Client components

- Own all interactivity: forms, drag-and-drop, modals, toggles
- Marked with `"use client"` at the top of the file
- Fetch data client-side via `fetch("/api/...")` or SWR where needed
- Icons and navigation items **must** live inside client components — they cannot be passed as props across the server/client boundary

### The serialisation rule

All `Date` objects must be converted to ISO strings before passing from server to client:

```typescript
// server component (page.tsx)
const applications = await prisma.application.findMany({ ... });

// Wrong — Date object crosses the boundary
<ClientComponent createdAt={applications[0].createdAt} />

// Right — serialised first
<ClientComponent createdAt={applications[0].createdAt.toISOString()} />
```

Passing raw `Date` objects causes React hydration errors that are difficult to debug.

---

## Authentication

HireFlow uses NextAuth.js v4 with two providers:

- **Credentials** — email + password, hashed with bcrypt
- **Google OAuth** — profile and email scopes only

### Key rules

- `authOptions` lives exclusively in `lib/auth-options.ts`. Never import it from `app/api/auth/[...nextauth]/route.ts` — this causes circular import issues in Next.js.
- All dashboard pages must include `export const dynamic = "force-dynamic"` to prevent Next.js from statically caching authenticated pages.
- The login page also requires `force-dynamic` because it reads `searchParams`.
- Server components use `getServerSession(authOptions)` directly.
- API routes use `getServerSession(authOptions)` for session access.

### Session JWT limitations

The NextAuth JWT does not automatically reflect profile updates (e.g. first/last name saved in Settings). The session token is only refreshed on sign-out/sign-in. To display updated profile data immediately, server components in `app/dashboard/layout.tsx` and `app/dashboard/page.tsx` fetch the latest `firstName`/`lastName` directly from Prisma rather than relying on the session.

---

## Database

PostgreSQL 17 on [Neon](https://neon.tech), accessed via Prisma 5.

### Schema management

Use `prisma db push` to apply schema changes, not `prisma migrate dev`. Migration drift accumulated during development makes `migrate dev` unreliable on this project.

```bash
npx prisma db push      # sync schema to database
npx prisma generate     # regenerate Prisma client
```

### Connection strings

Use the **pooled** Neon connection string for `DATABASE_URL`. Do not append `?channel_binding=require` — this causes connection failures.

### Data model summary

| Model           | Purpose                                                     |
| --------------- | ----------------------------------------------------------- |
| `User`          | Auth identity, profile (firstName, lastName, avatarUrl)     |
| `Application`   | Core job application record — stage, source, follow-up date |
| `Contact`       | Person associated with an application                       |
| `InterviewNote` | Stage-tagged note on an application                         |
| `Resume`        | Uploaded PDF — stored on Cloudinary, metadata in DB         |
| `ActivityLog`   | Immutable audit log of user actions                         |

### Soft deletes

`Application` uses soft deletion — `deletedAt` is set rather than the record being removed. All application queries filter `deletedAt: null`. Hard deletes are used for contacts, notes, and resumes.

---

## File Storage

Avatars and resume PDFs are stored on [Cloudinary](https://cloudinary.com).

- Uploads happen **server-side** via API routes — the Cloudinary API secret never reaches the client
- `fileKey` stores the Cloudinary `public_id` — required for deletion
- Cloudinary deletion runs before the database record is deleted — if it fails, the DB record is not removed and 500 is returned
- Avatars: stored in the default folder, URL saved to `User.avatarUrl`
- Resumes: stored in the `resumes/` folder, metadata in the `Resume` model

---

## Email

Transactional email is handled by [Resend](https://resend.com).

A cron job at `POST /api/reminders/send` runs daily at 08:00 UTC (configured in `vercel.json`). It emails each user a list of applications where `followUpAt` is today or earlier and `stage` is not `CLOSED`.

The cron route is secured with a `CRON_SECRET` environment variable checked against the `Authorization: Bearer` header. It is listed in the NextAuth public routes to bypass session authentication.

---

## Dark Mode

Dark mode is implemented with Tailwind CSS v4's `@variant dark` directive and a `dark` class on `<html>`.

### How it works

1. A blocking inline script in `app/layout.tsx` runs before React hydrates. It reads `localStorage` and applies the `dark` class to `<html>` immediately — preventing flash of unstyled content (FOUC).
2. `ThemeToggle` (client component) toggles the class and persists the preference to `localStorage`.
3. Tailwind's `dark:` variants apply styles when the `dark` class is present on `<html>`.

### Configuration

In `globals.css`:

```css
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));
@plugin "@tailwindcss/typography";
```

There is no `tailwind.config.ts` dark mode setting — the `@variant` directive in CSS takes precedence.

### Dark mode palette

| Usage           | Light           | Dark                 |
| --------------- | --------------- | -------------------- |
| Page background | `bg-gray-50`    | `dark:bg-gray-950`   |
| Sidebar         | `bg-white`      | `dark:bg-gray-900`   |
| Cards           | `bg-white`      | `dark:bg-gray-800`   |
| Inputs          | `bg-white`      | `dark:bg-gray-900`   |
| Primary text    | `text-gray-900` | `dark:text-gray-100` |
| Secondary text  | `text-gray-500` | `dark:text-gray-400` |

---

## Testing Strategy

HireFlow has two test layers.

### Unit and integration tests (Jest + React Testing Library)

120 tests across component rendering, form validation, API route handlers, and user interaction.

- Component tests use RTL — tests describe user behaviour, not implementation details
- API route tests mock Prisma and `getServerSession` — no real database connection
- `@jest-environment node` must be the first line of every API test file
- `jest.mock()` calls must precede all imports in API test files

### E2E tests (Playwright)

9 tests covering the full user journey: registration, login, application CRUD, pipeline navigation, and settings.

- All tests run on port 3001
- `workers: 1` — no parallel execution (session conflicts)
- `reuseExistingServer: true` — app must already be running

---

## Deployment

HireFlow deploys to Vercel (Hobby plan) from the `main` branch.

### Branch strategy

```
main (protected) → develop (integration) → feature/sprint-XX-description
```

- Feature branches cut from `develop`
- PRs merge to `develop`, then `develop` merges to `main` for release
- Never merge a feature branch directly to `main`

### Vercel-specific rules

- `npm run build` must pass locally before every push — Vercel build failures are slower to debug
- `.npmrc` contains `legacy-peer-deps=true` — required for Vercel to install dependencies correctly with React 19
- `vercel.json` at the project root configures the daily reminder cron job
- `export const dynamic = "force-dynamic"` is required on all dashboard pages and the login page — without it, Vercel's edge cache serves stale authenticated content

---

## Architectural Decision Records

Key decisions made during development, with rationale.

### ADR-001 — Next.js App Router over Pages Router

App Router enables server components, which allow direct Prisma queries in page components without an intermediate API layer. This eliminates a class of data-fetching complexity and aligns with the server/client separation pattern.

### ADR-002 — Prisma over raw SQL

Schema-first approach aligns with Spec-Driven Development — the data model is a spec before it is a migration. Type safety from Prisma eliminates a category of runtime errors.

### ADR-003 — Neon over Railway for PostgreSQL

Genuinely free tier with no credit card required. Suitable for a portfolio project with real users. The `db push` workflow fits the project's schema management needs.

### ADR-004 — NextAuth.js over custom JWT auth

Sprint 6 migrated from a custom `jose`-based JWT implementation to NextAuth.js v4. Rationale: NextAuth handles Google OAuth, session management, CSRF protection, and cookie security correctly out of the box. The custom JWT required maintaining equivalent logic manually and was a source of bugs across the test suite. `authOptions` is centralised in `lib/auth-options.ts` to avoid circular imports.

### ADR-005 — Cloudinary over Supabase Storage for file uploads

Cloudinary's free tier (25 GB storage, 25 GB bandwidth/month) is sufficient. The SDK is mature and server-side upload is straightforward from a Next.js API route. Supabase Storage would require provisioning a second service for no functional gain in this context.

### ADR-006 — `prisma db push` over `prisma migrate dev`

Migration drift accumulated during active development made `migrate dev` unreliable on the Neon-hosted database. `db push` syncs the schema directly without creating migration files, which is appropriate for a single-environment portfolio project.

### ADR-007 — Tailwind CSS v4 (`@import "tailwindcss"`)

v4's CSS-first configuration removes the need for `tailwind.config.ts` for most use cases. Dark mode is configured via `@variant dark` in `globals.css`. The `@tailwindcss/typography` plugin handles legal page prose styling.

### ADR-008 — Soft deletes for Application, hard deletes for everything else

Applications are the primary user data. Soft deletion (`deletedAt`) prevents accidental permanent loss. Supporting models (contacts, notes, resumes) are hard-deleted — they have no standalone value outside their parent application and their deletion is always intentional.

### ADR-009 — Port 3001 for local development

Port 3000 conflicts with another locally running application. `next dev -p 3001` is the standard dev command. Playwright's `webServer` config and `baseURL` are set to port 3001 accordingly.

### ADR-010 — `--legacy-peer-deps` for all installs

React 19 has peer dependency conflicts with several packages in the stack. All installs use `--legacy-peer-deps`. The `.npmrc` file sets this globally for Vercel deploys.
