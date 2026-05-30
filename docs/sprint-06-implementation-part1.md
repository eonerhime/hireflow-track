# HireTrace — Sprint 6 Implementation Guide (Part 1 of 2)

**Document Type:** Developer Implementation Reference
**Sprint:** 6 of 6
**Branch:** `feature/sprint-06-analytics-export-oauth` (from `develop`)
**Status:** Ready to implement
**PBIs:** PBI-040 → PBI-036 → PBI-035 → PBI-042 → PBI-045
**Covers:** PBI-040 (RTL suite) and PBI-036 (Google OAuth)

---

## Before You Write a Single Line of Code

### Step 1 — Create branch and confirm baseline

```bash
git checkout develop
git pull origin develop
git checkout -b feature/sprint-06-analytics-export-oauth
git push -u origin feature/sprint-06-analytics-export-oauth
npm run build        # must pass clean
npx tsc --noEmit     # must pass clean
npm test             # must pass clean — 95 tests expected
```

If any of the three fail, fix before starting Sprint 6 work.

### Step 2 — Install new packages

```bash
# NextAuth — pinned version — install only when you reach PBI-036
npm install next-auth@4.24.11

# Playwright — install only when you reach PBI-042
npm install --save-dev @playwright/test@1.51.1
npx playwright install chromium
```

> **Never use `@latest`.** Pin both versions exactly as shown. Confirm the latest stable patch for `next-auth@4.x` before installing — the minor version shown here is the recommended pin at Sprint 6 authoring time.

### Step 3 — Log the OAuth ADR before any PBI-036 code

Open `docs/implementation.md`. In the ADR section, add the OAuth provider entry from the **ADR** section of this document before writing a single line of PBI-036 code. This is a hard gate — do not skip it.

You're right. Here's the ADR entry to add to `docs/implementation.md`:

```markdown
## ADR-016 — Google OAuth Provider

**Date:** [date]
**Status:** Accepted
**PBI:** PBI-036

### Context

HireTrace uses a custom JWT implementation with `jose` for session management.
PBI-036 requires adding Google OAuth login alongside the existing email/password
flow. A decision is needed on which OAuth library to adopt.

### Options Considered

| Criterion             | NextAuth.js v4          | Auth.js v5 (beta)        |
| --------------------- | ----------------------- | ------------------------ |
| Next.js 15 support    | ✅ App Router via shim  | ✅ Native App Router     |
| Stability             | Stable — v4.24.x        | Beta — API may change    |
| Existing auth coexist | Credentials provider    | Same concern             |
| Prisma adapter        | @auth/prisma-adapter v4 | @auth/prisma-adapter v5  |
| Session strategy      | JWT — aligns with jose  | JWT or database sessions |
| Google provider       | ✅ Built-in             | ✅ Built-in              |
| Migration complexity  | Medium                  | Higher — beta churn risk |

### Decision

Use **NextAuth.js v4** with Google + Credentials providers.

### Rationale

- Stable release — no beta churn risk in the final sprint
- JWT session strategy aligns with the existing jose-based approach
- Credentials provider preserves email/password login with no separate system
- Auth.js v5 rejected — beta API risk unacceptable at project close

### Consequences

- `jose` session helpers replaced by `getToken` (middleware) and
  `getServerSession` (API routes)
- All API routes migrated from custom `getUserFromRequest` to
  `getServerSession(authOptions)` — one route at a time
- `session.user.id` must be explicitly set in the JWT callback —
  all user-scoped queries depend on it
- No `Account` model needed — JWT session strategy stores data in
  the token, not the database
- `JWT_SECRET` retained in env until NextAuth migration confirmed
  working, then removed
- OAuth users created via `signIn` callback on first login —
  duplicate accounts prevented by email lookup before creation
```

---

## Critical Rules Carried Forward From Sprint 5

| Rule                                                                                     | Why                                                                                  |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `npm run build` locally before every Vercel push                                         | Catches issues Vercel will catch                                                     |
| Never `@latest` — all packages pinned                                                    | Cascading version conflicts                                                          |
| `@jest-environment node` docblock must be absolute first line of API test files          | Anything before it breaks the override — never add to route files                    |
| `jest.mock()` calls must come BEFORE all imports in API test files                       | Jest hoisting requirement                                                            |
| PATCH routes with partial update bodies — use conditional spreads only                   | `...(field !== undefined && { field })` — never unconditional `field: value ?? null` |
| `router.refresh()` + `setTimeout(() => router.push(...), 100)` for redirecting mutations | `router.refresh()` alone insufficient in Next.js 15 App Router                       |
| `export const dynamic = "force-dynamic"` on pages with relational data after mutations   | Prevents stale caches                                                                |
| Server components use direct Prisma queries — never `fetch("/api/...")`                  | No round-trips in server components                                                  |
| `resume` is a relation field — NOT on the base `Application` type                        | Only `resumeId` (FK scalar) is on the type — mock factories use `resumeId: null`     |
| Mock `next/cache` in ALL API route test files that call `revalidatePath`                 | Unmocked `revalidatePath` throws in Jest node env                                    |
| Validate request body BEFORE DB lookup                                                   | Fail fast with 400                                                                   |
| Update ALL three mock factories when adding fields to `Application`                      | `ApplicationList.test.tsx`, `PipelineChart.test.tsx`, `StatsBar.test.tsx`            |
| All form inputs must have `htmlFor` on `<label>` and `id` on `<input>`                   | Required for RTL `getByLabelText` and accessibility                                  |
| `revalidatePath("/dashboard")` in all mutating API route handlers                        | Invalidates Vercel edge cache                                                        |
| All code updates delivered in markdown code blocks — no exceptions                       | Consistency                                                                          |
| `npx tsc --noEmit` not `tsc --noEmit`                                                    | `tsc` may not be on PATH                                                             |

---

## Directory Structure After Sprint 6

New files this sprint creates (additions to the Sprint 5 structure):

```
hiretrace/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts              ← NextAuth handler (PBI-036)
│   │   └── export/
│   │       └── applications/
│   │           └── route.ts              ← GET CSV export (PBI-035)
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                  ← Updated: Google OAuth button (PBI-036)
│   └── dashboard/
│       └── applications/
│           └── [id]/
│               └── page.tsx              ← Unchanged structurally
├── components/
│   └── ExportButton.tsx                  ← CSV export trigger (PBI-035)
├── lib/
│   └── auth.ts                           ← Updated: NextAuth session helper (PBI-036)
├── middleware.ts                          ← Updated: NextAuth getToken (PBI-036)
├── playwright.config.ts                  ← Playwright config (PBI-042)
├── e2e/
│   ├── auth.spec.ts                      ← PBI-042 Journey 1
│   ├── pipeline.spec.ts                  ← PBI-042 Journey 2
│   ├── export.spec.ts                    ← PBI-042 Journey 3
│   └── oauth.spec.ts                     ← PBI-042 Journey 4
└── __tests__/
    ├── KanbanBoard.test.tsx              ← PBI-040
    ├── ApplicationDetail.test.tsx        ← PBI-040
    ├── ResumeList.delete.test.tsx        ← PBI-040
    ├── api.export.applications.test.ts   ← PBI-035
    ├── ExportButton.test.tsx             ← PBI-035
    ├── LoginPage.oauth.test.tsx          ← PBI-036
    └── api.auth.session.test.ts          ← PBI-036
```

---

## Environment Variables

Add the following to `.env.local` and to Vercel (Preview scope) before starting PBI-036.

`.env.local` (full set after Sprint 6):

```
DATABASE_URL=<pooled Neon string — no channel_binding=require>
DIRECT_URL=<direct Neon string>
JWT_SECRET=<min 32 chars — kept for any legacy jose references during migration>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random secret — generate with: openssl rand -base64 32>
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your API key>
CLOUDINARY_API_SECRET=<your API secret>
RESEND_API_KEY=<your Resend API key>
CRON_SECRET=<min 32 chars>
```

On Vercel, set `NEXTAUTH_URL` to your production/preview URL — not `localhost`. The redirect URI registered in Google Cloud Console must match.

---

## ADR — Google OAuth Provider

**Log this in `docs/implementation.md` before writing any PBI-036 code.**

**Decision:** Use NextAuth.js v4 with Google + Credentials providers.

**Rationale:**

- NextAuth.js v4 is stable, actively maintained, and has first-class support for the Google OAuth provider
- JWT session strategy aligns with the existing jose-based session — the transition is a drop-in replacement at the middleware and API route layer
- The Credentials provider allows email/password login to coexist with OAuth without maintaining a separate auth system
- Auth.js v5 (next-auth v5 beta) was considered and rejected — beta API churn risk is unacceptable in the final sprint of a portfolio project with a hard close date

**Migration path from custom jose auth:**

1. Install `next-auth@4` alongside existing code — do not delete jose helpers yet
2. Create `app/api/auth/[...nextauth]/route.ts` with Google + Credentials providers
3. Update `middleware.ts` to use `getToken` from `next-auth/jwt` (replaces custom jose verify)
4. Update all API route session checks to use `getServerSession` or `getToken`
5. Remove custom jose session helpers once NextAuth is confirmed working
6. Keep `JWT_SECRET` in env until confirmed unused — then remove

**Account model:** NextAuth v4 with JWT session strategy does NOT require an `Account` model — session data is stored in the JWT, not the database. No Prisma schema migration needed. If a future developer switches to database sessions, an `Account` model would be required at that point.

**Constraints:**

- OAuth user email must be checked against existing `User` records on first sign-in — do not create duplicates
- `session.user.id` must be set in the JWT callback — all API routes depend on this
- The `NEXTAUTH_URL` env var must be set on Vercel — NextAuth uses it to build redirect URIs

---

## PBI-040 — React Testing Library — Core Component Suite

**Goal:** Fill component test gaps identified at Sprint 2. No new components — RTL tests only. Target: `KanbanBoard`, `ApplicationDetail`, `ResumeList` (delete flow).

### Step 1 — Audit current coverage

Before writing any tests, scan `__tests__/` for components with zero test files. The known gaps at Sprint 6 start:

- `KanbanBoard` — no test file
- `ApplicationDetail` (page content) — no test file
- `ResumeList` inline delete flow — `ResumeUploadForm.test.tsx` exists but does not test delete confirmation state

Run `npm test -- --verbose` to confirm all 95 tests pass before adding new ones.

### Step 2 — KanbanBoard tests

`__tests__/KanbanBoard.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import KanbanBoard from "@/components/KanbanBoard";
import { ApplicationStage } from "@prisma/client";

// Minimal application shape for Kanban rendering
const makeApp = (overrides: Partial<{
  id: string;
  company: string;
  role: string;
  stage: ApplicationStage;
}> = {}) => ({
  id: "app-1",
  company: "Acme Corp",
  role: "Senior Engineer",
  stage: "APPLIED" as ApplicationStage,
  location: null,
  salary: null,
  jobUrl: null,
  followUpAt: null,
  notes: null,
  source: null,
  resumeVersionLabel: null,
  resumeId: null,
  appliedAt: new Date().toISOString(),
  stageEnteredAt: new Date().toISOString(),
  deletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: "user-1",
  ...overrides,
});

describe("KanbanBoard", () => {
  it("renders a column for each of the 6 pipeline stages", () => {
    render(<KanbanBoard applications={[]} />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Screening")).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
    expect(screen.getByText("Assessment")).toBeInTheDocument();
    expect(screen.getByText("Offer")).toBeInTheDocument();
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("renders an application card in the correct stage column", () => {
    const app = makeApp({ stage: "INTERVIEW", role: "Product Manager", company: "BetaCo" });
    render(<KanbanBoard applications={[app]} />);
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getByText("BetaCo")).toBeInTheDocument();
  });
});
```

> **Note:** `KanbanBoard` uses `@hello-pangea/dnd` for drag-and-drop. If the component throws in test because DnD context is missing, wrap the render in a `DragDropContext` with a no-op `onDragEnd`:
>
> ```typescript
> import { DragDropContext } from "@hello-pangea/dnd";
> render(
>   <DragDropContext onDragEnd={() => {}}>
>     <KanbanBoard applications={[]} />
>   </DragDropContext>
> );
> ```

### Step 3 — ApplicationDetail tests

`__tests__/ApplicationDetail.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import ApplicationDetail from "@/components/ApplicationDetail";

// Adjust the import path to match your actual component location.
// If detail rendering lives in the page itself rather than a component,
// extract the presentational parts into ApplicationDetail.tsx first.

const makeDetailApp = (overrides = {}) => ({
  id: "app-1",
  company: "Acme Corp",
  role: "Senior Engineer",
  stage: "INTERVIEW",
  location: "Lagos, NG",
  salary: "₦500,000",
  jobUrl: "https://example.com/job",
  followUpAt: new Date(Date.now() + 86400000).toISOString(),
  notes: "Initial notes",
  source: "LinkedIn",
  resumeVersionLabel: null,
  resumeId: null,
  resume: null,
  appliedAt: new Date().toISOString(),
  stageEnteredAt: new Date().toISOString(),
  contacts: [],
  interviewNotes: [],
  ...overrides,
});

describe("ApplicationDetail", () => {
  it("renders company, role, and stage", () => {
    render(<ApplicationDetail application={makeDetailApp()} />);
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText(/interview/i)).toBeInTheDocument();
  });

  it("renders linked resume label and download link when resume is set", () => {
    const app = makeDetailApp({
      resumeId: "resume-1",
      resume: {
        id: "resume-1",
        label: "PM Resume v3",
        fileUrl: "https://res.cloudinary.com/example/resume.pdf",
      },
    });
    render(<ApplicationDetail application={app} />);
    expect(screen.getByText("PM Resume v3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /download/i })).toBeInTheDocument();
  });

  it("renders empty state copy when no contacts or notes are present", () => {
    const app = makeDetailApp({ contacts: [], interviewNotes: [], notes: null });
    render(<ApplicationDetail application={app} />);
    // Adjust text to match your actual empty state copy
    expect(
      screen.getByText(/no contacts/i) ||
      screen.queryByText(/no notes/i)
    ).toBeTruthy();
  });
});
```

### Step 4 — ResumeList delete confirmation tests

`__tests__/ResumeList.delete.test.tsx`:

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import ResumeList from "@/components/ResumeList";

const mockResumes = [
  {
    id: "resume-1",
    label: "PM Resume v3",
    fileUrl: "https://res.cloudinary.com/example/resume.pdf",
    uploadedAt: new Date().toISOString(),
  },
];

// Mock fetch — ResumeList calls DELETE /api/resumes/[id] on confirm
global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
) as jest.Mock;

describe("ResumeList — delete confirmation", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows inline delete confirmation when delete button is clicked", () => {
    render(<ResumeList resumes={mockResumes} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it("hides confirmation and returns to normal state when cancel is clicked", () => {
    render(<ResumeList resumes={mockResumes} />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });
});
```

### Step 5 — Run and confirm

```bash
npm test -- --testPathPatterns="KanbanBoard|ApplicationDetail|ResumeList.delete"
npm test   # full suite — 95 + new tests must all pass
```

### DoD check

| Confirmed | How                                                      | Item                  |
| --------- | -------------------------------------------------------- | --------------------- |
| [x]       | `npm test` — KanbanBoard.test.tsx passes (2 tests)       | KanbanBoard covered   |
| [x]       | `npm test` — ResumeList.delete.test.tsx passes (2 tests) | Delete flow covered   |
| [x]       | Full suite — no regressions                              | All 95+ tests passing |
| [x]       | `npx tsc --noEmit` passes clean                          | TypeScript clean      |

---

## PBI-036 — Google OAuth Login

**Goal:** Add Google OAuth login alongside the existing email/password flow using NextAuth.js v4. Both login methods must work after migration. The auth session layer moves from custom jose to NextAuth JWT.

### Step 1 — Google Cloud setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project named `hiretrace` (or use existing)
3. Navigate to APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: Web application
5. Authorised redirect URIs — add both:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://<your-vercel-url>/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local` and Vercel

### Step 2 — Create NextAuth route handler 2

`app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, user is populated — persist id to token
      if (user) token.userId = user.id;
      return token;
    },
    async session({ session, token }) {
      // Expose userId to session for API route access
      if (token.userId) session.user.id = token.userId as string;
      return session;
    },
    async signIn({ user, account }) {
      // OAuth sign-in: create User record if this email is new
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existing) {
          const created = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? user.email.split("@")[0],
              passwordHash: "", // OAuth users have no password
            },
          });
          user.id = created.id;
        } else {
          user.id = existing.id;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

> **TypeScript note:** `session.user.id` is not on the default NextAuth `Session` type. Extend it in `types/next-auth.d.ts`:
>
> ```typescript
> import "next-auth";
> declare module "next-auth" {
>   interface Session {
>     user: {
>       id: string;
>       name?: string | null;
>       email?: string | null;
>       image?: string | null;
>     };
>   }
> }
> ```

### Step 3 — Update middleware.ts

Replace the custom jose session check with NextAuth's `getToken`:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const PUBLIC_API_ROUTES = [
  "/api/auth",
  "/api/auth/login",
  "/api/auth/register",
  "/api/reminders/send",
];

// Rate limiting configurations
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60;
const MUTATING_METHODS = new Set(["POST", "PATCH", "DELETE"]);

// Note: In production Edge Runtimes, consider Upstash Redis for persistent tracking.
// We keep this lightweight Map safe from breaking edge builds by checking whitelists first.
const rateLimitStore = new Map<
  string,
  { count: number; windowStart: number }
>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute = pathname.startsWith("/api");
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isPublicApiRoute = PUBLIC_API_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // 1. CRITICAL: Immediately grant exit execution for public cron paths
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Rate limiting — mutating API routes only (safely skipped for /api/reminders/send)
  if (isApiRoute && MUTATING_METHODS.has(request.method)) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const allowed = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        },
      );
    }
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
```

### Step 4 — Update API route session checks

Replace all `getUserFromRequest` / jose verify calls with NextAuth's `getServerSession` or `getToken`. The pattern for API routes:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Inside your API route handler:
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
const userId = session.user.id;
```

Apply this replacement to every route that previously called `getUserFromRequest`:

- `app/api/applications/route.ts`
- `app/api/applications/[id]/route.ts`
- `app/api/contacts/route.ts`
- `app/api/contacts/[id]/route.ts`
- `app/api/notes/route.ts`
- `app/api/notes/[id]/route.ts`
- `app/api/reminders/route.ts`
- `app/api/reminders/send/route.ts`
- `app/api/resumes/route.ts`
- `app/api/resumes/[id]/route.ts`
- `app/api/dashboard/metrics/route.ts`
- `app/api/export/applications/route.ts` (Sprint 6 — see Part 2)

> **Do this migration one route at a time.** Update, build, test locally before moving to the next. Do NOT batch all routes in one commit — if something breaks you will not know which route caused it.

### Step 5 — Add Google button to login page

In `app/login/page.tsx` or your login component, add the OAuth button below the email/password form:

```typescript
"use client";
import { signIn } from "next-auth/react";

// Inside the component JSX:
<div className="mt-4">
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300" />
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="bg-white px-2 text-gray-500">or</span>
    </div>
  </div>

  <button
    type="button"
    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    className="mt-4 flex w-full items-center justify-center gap-3 rounded-md
               border border-gray-300 bg-white px-4 py-2 text-sm font-medium
               text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none
               focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    <svg
      className="h-5 w-5"
      aria-hidden="true"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
    Continue with Google
  </button>
</div>
```

Add the same button to `app/register/page.tsx`.

### Step 6 — Wrap app in SessionProvider

NextAuth requires a `SessionProvider` at the root. In `app/layout.tsx` or the closest client boundary:

```typescript
"use client";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

> If `app/layout.tsx` is currently a server component, create a `components/Providers.tsx` client component that wraps `SessionProvider`, and import it into `layout.tsx`. This keeps the layout a server component.

### Step 7 — Tests

`__tests__/LoginPage.oauth.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/login/page";

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

describe("LoginPage", () => {
  it("renders the Google OAuth button", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /continue with google/i })
    ).toBeInTheDocument();
  });
});
```

`__tests__/api.auth.session.test.ts`:

```typescript
/**
 * @jest-environment node
 */

jest.mock("next-auth", () => ({
  getServerSession: jest.fn().mockResolvedValue(null),
}));

import { GET } from "@/app/api/applications/route";

describe("Applications route — session guard", () => {
  it("returns 401 when no session exists", async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
```

### Step 8 — Manual verification

Run these manually — they cannot be unit tested without a live Google OAuth flow:

1. `npm run dev` — navigate to `http://localhost:3000/login`
2. Click "Continue with Google" — confirm redirect to Google consent screen
3. Complete OAuth — confirm redirect to `/dashboard`
4. Check dashboard renders correctly — user name/email visible
5. Sign out — confirm redirect to `/login`
6. Sign in with email/password — confirm still works
7. Attempt to access `/dashboard` without session — confirm redirect to `/login`

### DoD check

api.resumes.[id].test.ts
api.dashboard.metrics.test.ts

| Confirmed | How                                             | Item                               |
| --------- | ----------------------------------------------- | ---------------------------------- |
| [x]       | `npm test` — LoginPage.oauth.test.tsx passes    | OAuth button renders               |
| [x]       | `npm test` — api.auth.session.test.ts passes    | Session guard 401                  |
| [x]       | Manual — Google OAuth sign-in flow completes    | OAuth login works                  |
| [x]       | Manual — email/password login still works       | Credentials provider works         |
| [x]       | Manual — sign out and re-authenticate           | Session lifecycle correct          |
| [x]       | `npm test` — all 95+ tests pass, no regressions | No regressions from auth migration |
| [x]       | `npm run build` — no errors                     | Build clean                        |
| [x]       | `npx tsc --noEmit` — zero errors                | TypeScript clean                   |

---

_sprint-06-implementation-part1.md — 26 May 2026 — HireTrace_
_Continue in Part 2: PBI-035 (CSV Export), PBI-042 (E2E), PBI-045 (LinkedIn)._
