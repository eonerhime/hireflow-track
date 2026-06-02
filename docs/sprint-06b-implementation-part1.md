# HireFlow — Sprint 6B Implementation Guide (Part 1 of 2)

**Document Type:** Developer Implementation Reference
**Sprint:** 6B — UI/UX Upgrade
**Branch:** `feature/sprint-06b-ui-upgrade` (from `develop`)
**Status:** Ready to implement
**PBIs:** PBI-047 → PBI-048 → PBI-049 → PBI-050 → PBI-051
**Covers:** PBI-047 (Dark Mode) and PBI-048 (Activity Log)

---

## Before You Write a Single Line of Code

### Step 1 — Confirm Sprint 6 is closed

```bash
git checkout develop
git pull origin develop
# Confirm Sprint 6 branch is merged — develop should have all Sprint 6 work
npm run build        # must pass clean
npx tsc --noEmit     # must pass clean
npm test             # must pass clean — 107 RTL tests expected
```

### Step 2 — Create branch

```bash
git checkout -b feature/sprint-06b-ui-upgrade
git push -u origin feature/sprint-06b-ui-upgrade
```

### Step 3 — Install new packages

```bash
# Install only when you reach PBI-050 — not before
npm install react-day-picker@8.10.1 date-fns@3.6.0 --legacy-peer-deps
npm install @testing-library/dom@10.4.0 --save-dev --legacy-peer-deps
```

---

## Critical Rules Carried Forward

| Rule                                                                       | Why                                             |
| -------------------------------------------------------------------------- | ----------------------------------------------- |
| `npm run build` locally before every Vercel push                           | Catches issues early                            |
| Never `@latest` — all packages pinned                                      | Version conflicts                               |
| Activity log writes must never throw                                       | User mutations must not fail because of logging |
| `dark:` classes added at authoring time                                    | Retroactive addition doubles the work           |
| `jest.mock()` calls before all imports in API test files                   | Jest hoisting                                   |
| `@jest-environment node` docblock as absolute first line of API test files | Never in route files                            |
| Mock `next/cache` in all API route test files calling `revalidatePath`     | Unmocked throws in Jest                         |
| All form inputs: `htmlFor` on `<label>`, `id` on `<input>`                 | RTL `getByLabelText` + accessibility            |
| `npx tsc --noEmit` not `tsc --noEmit`                                      | `tsc` may not be on PATH                        |

---

## PBI-047 — Dark Mode Toggle

**Goal:** Full dark mode support across all components, user-controlled with a toggle that persists preference and respects `prefers-color-scheme` as the initial default. Zero flash of unstyled content (FOUC) on reload.

### Step 1 — Configure Tailwind for class-based dark mode

In `tailwind.config.ts` (or equivalent Tailwind v4 config):

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // ← enables dark: variant via .dark class on <html>
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};

export default config;
```

For Tailwind v4 (`@import "tailwindcss"` in globals.css), the equivalent is:

```css
/* globals.css */
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));
```

Confirm which approach your project uses — check `globals.css` and `tailwind.config.ts`. If both exist, the v4 `@variant` approach in CSS takes precedence.

### Step 2 — Anti-FOUC script in layout head

The only way to prevent FOUC on reload is a synchronous inline script that runs before React hydrates. In `app/layout.tsx`:

```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Blocks render briefly to apply theme before paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

`suppressHydrationWarning` is required on `<html>` because the inline script modifies the class before React hydrates — React will warn about the mismatch without it.

### Step 3 — Create ThemeToggle component

`components/ThemeToggle.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";

function getInitialTheme(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("theme");
  if (stored) return stored === "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(getInitialTheme);

  useEffect(() => {
    // Only side-effect: sync the DOM class with current state
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="rounded-md border border-gray-300 bg-white dark:bg-gray-800
                 dark:border-gray-600 px-4 py-2 text-sm font-medium
                 text-gray-600 dark:text-gray-300 hover:bg-gray-50
                 dark:hover:bg-gray-700 transition-colors"
    >
      {isDark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
```

### Step 4 — Dark mode colour reference

Use these consistently across all components. They match the mock-up's dark palette:

| Token              | Light                  | Dark                        | Usage                   |
| ------------------ | ---------------------- | --------------------------- | ----------------------- |
| Page background    | `bg-gray-50`           | `dark:bg-gray-950`          | `<body>`, page wrappers |
| Sidebar background | `bg-white`             | `dark:bg-gray-900`          | Sidebar                 |
| Card background    | `bg-white`             | `dark:bg-gray-800`          | All card panels         |
| Card border        | `border-gray-200`      | `dark:border-gray-700`      | Card borders            |
| Primary text       | `text-gray-900`        | `dark:text-gray-100`        | Headings, labels        |
| Secondary text     | `text-gray-500`        | `dark:text-gray-400`        | Subtitles, metadata     |
| Input background   | `bg-white`             | `dark:bg-gray-900`          | Form inputs             |
| Input border       | `border-gray-300`      | `dark:border-gray-600`      | Form inputs             |
| Input text         | `text-gray-900`        | `dark:text-gray-100`        | Typed text              |
| Placeholder        | `placeholder-gray-400` | `dark:placeholder-gray-500` | Input placeholders      |
| Hover background   | `hover:bg-gray-50`     | `dark:hover:bg-gray-700`    | Interactive rows        |
| Active/selected    | `bg-blue-50`           | `dark:bg-blue-900/30`       | Sidebar active state    |

### Step 5 — Apply dark mode to sidebar

The sidebar is the highest-impact component. Apply the pattern here first, then replicate:

```typescript
// Sidebar wrapper
<aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200
                  dark:border-gray-700 min-h-screen flex flex-col">

  // Logo area
  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
      HireFlow
    </span>
  </div>

  // Nav item — inactive
  <Link className="flex items-center gap-3 px-4 py-3 text-sm font-medium
                   text-gray-600 dark:text-gray-400
                   hover:bg-gray-50 dark:hover:bg-gray-800
                   hover:text-gray-900 dark:hover:text-gray-100
                   rounded-lg mx-2 transition-colors">

  // Nav item — active
  <Link className="flex items-center gap-3 px-4 py-3 text-sm font-medium
                   bg-blue-50 dark:bg-blue-900/30
                   text-blue-700 dark:text-blue-400
                   rounded-lg mx-2">
```

Apply the same pattern to every component listed in T-047-06 through T-047-13.

### Step 6 — Tests

`__tests__/ThemeToggle.test.tsx`:

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggle from "@/components/ThemeToggle";

// localStorage mock is provided by jest-environment-jsdom automatically

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("renders a toggle button", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("adds dark class to document element when toggled on", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
```

### DoD check

| Confirmed | How                                                        | Item                        |
| --------- | ---------------------------------------------------------- | --------------------------- |
| [x]       | Browser — toggle switches light ↔ dark                     | Toggle works                |
| [x]       | Browser — reload after setting dark — stays dark, no flash | No FOUC                     |
| [x]       | Browser — open in incognito — follows OS preference        | System preference respected |
| [x]       | All components visually correct in dark mode               | Full dark mode coverage     |
| [x]       | `npm test` — ThemeToggle.test.tsx passes (2 tests)         | Tests passing               |
| [x]       | `npm run build` — no errors                                | Build clean                 |
| [x]       | `npx tsc --noEmit` — zero errors                           | TypeScript clean            |

---

## PBI-048 — Activity Log

**Goal:** Record key user actions to a persistent `ActivityLog` table and surface the last 20 events in a feed on the dashboard. Logging is fire-and-forget — it must never cause user-facing mutations to fail.

### Step 1 — Update schema.prisma

Add the enum and model. Place the enum above the `ActivityLog` model:

```prisma
enum ActivityAction {
  APPLICATION_CREATED
  APPLICATION_DELETED
  STAGE_CHANGED
  RESUME_LINKED
  NOTE_ADDED
}

model ActivityLog {
  id            String         @id @default(cuid())
  userId        String
  applicationId String?
  action        ActivityAction
  metadata      Json?
  createdAt     DateTime       @default(now())
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, createdAt])
}
```

Add the relation to the `User` model:

```prisma
model User {
  // existing fields ...
  activityLogs  ActivityLog[]
}
```

### Step 2 — Run migration

```bash
npx prisma migrate dev --name add_activity_log
```

Then immediately:

```bash
npm test   # must still show 107 passing — confirm no regressions
```

### Step 3 — Create the activity log helper

`lib/activity.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { ActivityAction } from "@prisma/client";

interface LogActivityParams {
  userId: string;
  applicationId?: string;
  action: ActivityAction;
  metadata?: Record<string, string | null>;
}

/**
 * Fire-and-forget activity logger.
 * Never throws — errors are logged to console only.
 * Call this after a successful mutation — never before.
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        applicationId: params.applicationId ?? null,
        action: params.action,
        metadata: params.metadata ?? undefined,
      },
    });
  } catch (error) {
    console.error("[logActivity] Failed to write activity log:", error);
    // Never rethrow — logging must not affect the calling mutation
  }
}
```

### Step 4 — Add write points to mutating routes

**`POST /api/applications`** — after successful `prisma.application.create`:

```typescript
import { logActivity } from "@/lib/activity";

// After: const application = await prisma.application.create(...)
void logActivity({
  userId: session.user.id,
  applicationId: application.id,
  action: "APPLICATION_CREATED",
  metadata: {
    company: application.company,
    role: application.role,
    stage: application.stage,
  },
});
```

**`DELETE /api/applications/[id]`** — after successful soft delete, before return:

```typescript
// Read company/role BEFORE the delete so metadata is accurate
void logActivity({
  userId: session.user.id,
  applicationId: id,
  action: "APPLICATION_DELETED",
  metadata: {
    company: application.company,
    role: application.role,
  },
});
```

**`PATCH /api/applications/[id]`** — two separate write points, both conditional:

```typescript
// After successful prisma.application.update:

// If stage was in the request body:
if (body.stage !== undefined && body.stage !== existingApplication.stage) {
  void logActivity({
    userId: session.user.id,
    applicationId: id,
    action: "STAGE_CHANGED",
    metadata: {
      company: updatedApplication.company,
      role: updatedApplication.role,
      fromStage: existingApplication.stage,
      toStage: updatedApplication.stage,
    },
  });
}

// If resumeId was in the request body and is not null:
if (body.resumeId !== undefined && body.resumeId !== null) {
  void logActivity({
    userId: session.user.id,
    applicationId: id,
    action: "RESUME_LINKED",
    metadata: {
      company: updatedApplication.company,
      role: updatedApplication.role,
    },
  });
}
```

> **Note on `void`:** The `void` keyword explicitly discards the Promise returned by `logActivity`. This signals to TypeScript and the reader that the fire-and-forget is intentional — not a forgotten `await`. Add `// eslint-disable-next-line @typescript-eslint/no-floating-promises` if your lint config flags it, or configure ESLint to allow `void` expressions.

**`POST /api/notes`** — after successful note creation:

```typescript
void logActivity({
  userId: session.user.id,
  applicationId: note.applicationId,
  action: "NOTE_ADDED",
  metadata: {
    company: application.company, // fetch from DB or pass via request
    role: application.role,
  },
});
```

### Step 5 — Create the activity API route

`app/api/activity/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activity = await prisma.activityLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error("[GET /api/activity]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Step 6 — Create ActivityFeed component

`components/ActivityFeed.tsx`:

```typescript
import { ActivityAction } from "@prisma/client";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ActivityEvent {
  id: string;
  action: ActivityAction;
  applicationId: string | null;
  metadata: Record<string, string | null> | null;
  createdAt: string; // ISO string — serialised from server
}

interface ActivityFeedProps {
  events: ActivityEvent[];
}

const ACTION_ICONS: Record<ActivityAction, string> = {
  APPLICATION_CREATED: "✦",
  APPLICATION_DELETED: "✕",
  STAGE_CHANGED: "→",
  RESUME_LINKED: "📎",
  NOTE_ADDED: "✎",
};

function describeAction(action: ActivityAction, metadata: Record<string, string | null> | null): string {
  const m = metadata ?? {};
  const who = m.role && m.company ? `${m.role} at ${m.company}` : "an application";

  switch (action) {
    case "APPLICATION_CREATED":
      return `You added ${who}`;
    case "APPLICATION_DELETED":
      return `You removed ${who}`;
    case "STAGE_CHANGED":
      return `You moved ${who} to ${m.toStage ?? "a new stage"}`;
    case "RESUME_LINKED":
      return `You linked a resume to ${who}`;
    case "NOTE_ADDED":
      return `You added a note to ${who}`;
    default:
      return "Activity recorded";
  }
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No activity yet. Add your first application to get started.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {events.map((event) => {
        const content = (
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center
                         rounded-full bg-blue-50 dark:bg-blue-900/30
                         text-sm text-blue-600 dark:text-blue-400"
            >
              {ACTION_ICONS[event.action]}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {describeAction(event.action, event.metadata)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        );

        return (
          <li key={event.id}>
            {event.applicationId ? (
              <Link
                href={`/dashboard/applications/${event.applicationId}`}
                className="block rounded-md px-2 -mx-2 hover:bg-gray-50
                           dark:hover:bg-gray-700/50 transition-colors"
              >
                {content}
              </Link>
            ) : (
              <div className="px-2 -mx-2">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
```

### Step 7 — Tests

`__tests__/api.activity.test.ts`:

```typescript
/**
 * @jest-environment node
 */

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));
jest.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    activityLog: { findMany: jest.fn() },
  },
}));

import { GET } from "@/app/api/activity/route";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = getServerSession as jest.Mock;
const mockFindMany = prisma.activityLog.findMany as jest.Mock;

function makeRequest() {
  return new NextRequest("http://localhost/api/activity", { method: "GET" });
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/activity", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns array of activity events for authenticated user", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindMany.mockResolvedValue([
      {
        id: "log-1",
        action: "APPLICATION_CREATED",
        applicationId: "app-1",
        metadata: { company: "Acme", role: "Engineer", stage: "APPLIED" },
        createdAt: new Date(),
      },
    ]);
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].action).toBe("APPLICATION_CREATED");
  });
});
```

`__tests__/ActivityFeed.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import ActivityFeed from "@/components/ActivityFeed";

const makeEvent = (overrides = {}) => ({
  id: "log-1",
  action: "APPLICATION_CREATED" as const,
  applicationId: "app-1",
  metadata: { company: "Acme Corp", role: "Senior Engineer", stage: "APPLIED" },
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe("ActivityFeed", () => {
  it("renders empty state when no events", () => {
    render(<ActivityFeed events={[]} />);
    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
  });

  it("renders a list of activity events with human-readable labels", () => {
    render(<ActivityFeed events={[makeEvent()]} />);
    expect(screen.getByText(/you added senior engineer at acme corp/i)).toBeInTheDocument();
  });
});
```

### DoD check

| Confirmed | How                                                                                  | Item                |
| --------- | ------------------------------------------------------------------------------------ | ------------------- |
| [x]       | Add an application — check `ActivityLog` table in Neon console has a row             | Write point works   |
| [x]       | Change stage on Kanban — `ActivityLog` has `STAGE_CHANGED` row with correct metadata | Stage change logged |
| [x]       | `GET /api/activity` returns events in correct order                                  | API correct         |
| [x]       | ActivityFeed renders events with correct labels                                      | Component correct   |
| [x]       | `npm test` — api.activity.test.ts + ActivityFeed.test.tsx pass                       | Tests passing       |
| [x]       | `npm run build` — no errors                                                          | Build clean         |
| [x]       | `npx tsc --noEmit` — zero errors                                                     | TypeScript clean    |

---

_sprint-06b-implementation-part1.md — 26 May 2026 — HireFlow_
_Continue in Part 2: PBI-049 (Notification Bell), PBI-050 (Date Range Filter), PBI-051 (Dashboard Restructure)._
