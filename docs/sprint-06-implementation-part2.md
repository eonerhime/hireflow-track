# HireTrace — Sprint 6 Implementation Guide (Part 2 of 2)

**Document Type:** Developer Implementation Reference
**Sprint:** 6 of 6
**Branch:** `feature/sprint-06-analytics-export-oauth` (from `develop`)
**Covers:** PBI-035 (CSV Export), PBI-042 (E2E Tests), PBI-045 (LinkedIn)

> **Read Part 1 first.** This document assumes PBI-040 and PBI-036 are complete and all tests are passing.

---

## PBI-035 — CSV Export of Application History

**Goal:** A `GET /api/export/applications` route that returns a downloadable CSV of all applications for the authenticated user. An "Export CSV" button on the dashboard triggers the download client-side.

**No schema change.** Reads from the existing `Application`, `Contact`, and `Resume` tables.

### Step 1 — Create the export route

`app/api/export/applications/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// CSV helpers — no external library needed
function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";

  const str = String(value);
  // Wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToCsv(row: unknown[]): string {
  return row.map(escapeCsv).join(",");
}

const HEADERS = [
  "Company",
  "Role",
  "Stage",
  "Location",
  "Salary",
  "Source",
  "Applied At",
  "Follow-up Date",
  "Resume Version Label",
  "Linked Resume",
  "Contacts",
];

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: { userId: session.user.id, deletedAt: null },
      include: {
        contacts: { select: { name: true, email: true } },
        resume: { select: { label: true } },
      },
      orderBy: { appliedAt: "desc" },
    });

    const rows = applications.map((app) => {
      const contactsSummary = app.contacts
        .map((c) => `${c.name}${c.email ? ` <${c.email}>` : ""}`)
        .join("; ");

      return rowToCsv([
        app.company,
        app.role,
        app.stage,
        app.location,
        app.salary,
        app.source,
        app.appliedAt.toISOString().split("T")[0],
        app.followUpAt ? app.followUpAt.toISOString().split("T")[0] : null,
        app.resumeVersionLabel,
        app.resume?.label ?? null,
        contactsSummary || null,
      ]);
    });

    const csv = [rowToCsv(HEADERS), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="applications.csv"',
      },
    });
  } catch (error) {
    console.error("[GET /api/export/applications]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Step 2 — Create the ExportButton component

`components/ExportButton.tsx`:

```typescript
"use client";
import { useState } from "react";

export default function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/export/applications");
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "applications.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        aria-label="Export CSV"
        className="rounded-md border border-gray-300 bg-white px-4 py-2
                   text-sm font-medium text-gray-700 shadow-sm
                   hover:bg-gray-50 disabled:opacity-50
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {loading ? "Exporting…" : "Export CSV"}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
```

### Step 3 — Add ExportButton to dashboard

In `app/dashboard/page.tsx` or the applications list view, import and render `ExportButton`. Place it in the page header area next to any existing action buttons:

```typescript
import ExportButton from "@/components/ExportButton";

// Inside the page JSX, in the header row:
<div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
  <ExportButton />
</div>
```

### Step 4 — Integration tests

`__tests__/api.export.applications.test.ts`:

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
    application: { findMany: jest.fn() },
  },
}));

import { GET } from "@/app/api/export/applications/route";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const mockGetSession = getServerSession as jest.Mock;
const mockFindMany = prisma.application.findMany as jest.Mock;

function makeRequest() {
  return new NextRequest("http://localhost/api/export/applications", {
    method: "GET",
  });
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/export/applications", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns CSV content-type for authenticated user", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindMany.mockResolvedValue([]);
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/csv");
  });

  it("includes correct column headers in first CSV row", async () => {
    mockGetSession.mockResolvedValue({ user: { id: "user-1" } });
    mockFindMany.mockResolvedValue([]);
    const res = await GET(makeRequest());
    const text = await res.text();
    const firstRow = text.split("\n")[0];
    expect(firstRow).toContain("Company");
    expect(firstRow).toContain("Role");
    expect(firstRow).toContain("Stage");
  });
});
```

### Step 5 — RTL tests for ExportButton

`__tests__/ExportButton.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExportButton from "@/components/ExportButton";

// Mock fetch
global.fetch = jest.fn();

describe("ExportButton", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the export button", () => {
    render(<ExportButton />);
    expect(
      screen.getByRole("button", { name: /export csv/i })
    ).toBeInTheDocument();
  });

  it("shows loading state while export is in progress", async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              blob: () => Promise.resolve(new Blob(["test"])),
            }),
          100,
        ),
      ),
    );

    render(<ExportButton />);
    fireEvent.click(screen.getByRole("button", { name: /export csv/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /exporting/i })).toBeInTheDocument();
    });
  });
});
```

### DoD check

| Confirmed | How                                                              | Item               |
| --------- | ---------------------------------------------------------------- | ------------------ |
| [x]       | Browser — click Export CSV, file downloads as `applications.csv` | Download works     |
| [x]       | Open CSV in spreadsheet — columns correct, data populated        | CSV format correct |
| [x]       | Empty state — 0 applications → CSV with headers only, no error   | Empty export works |
| [x]       | `npm test` — api.export.applications.test.ts passes (3 tests)    | API tests passing  |
| [x]       | `npm test` — ExportButton.test.tsx passes (2 tests)              | RTL tests passing  |
| [x]       | `npm run build` — no errors                                      | Build clean        |
| [x]       | `npx tsc --noEmit` — zero errors                                 | TypeScript clean   |

---

## PBI-042 — E2E Tests — Critical User Journeys

**Goal:** Playwright E2E tests covering the 4 critical journeys: auth, pipeline CRUD, CSV export, and OAuth presence. Tests live in `e2e/` and run via `npm run test:e2e` — separate from the Jest `npm test` suite.

**Install only after PBI-035 and PBI-036 are stable.**

### Step 1 — Install and configure Playwright

```bash
npm install --save-dev @playwright/test@1.51.1
npx playwright install chromium
```

### Step 2 — Create playwright.config.ts

`playwright.config.ts` (project root):

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // Run sequentially — test isolation depends on shared DB state
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Do not start dev server automatically — run `npm run dev` manually before E2E
});
```

### Step 3 — Add test:e2e script to package.json

In `package.json`, add to the `scripts` block:

```json
"test:e2e": "playwright test"
```

### Step 4 — Exclude e2e/ from Jest

In `jest.config.ts`, confirm `testMatch` or `testPathIgnorePatterns` excludes `e2e/`:

```typescript
testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/e2e/"],
```

Run `npm test` to confirm the E2E directory is ignored — Jest should still report the same test count.

### Step 5 — Shared auth helper

Create `e2e/helpers/auth.ts`:

```typescript
import { Page } from "@playwright/test";

// Registers a new test user and returns credentials
export async function registerTestUser(
  page: Page,
  suffix: string | number = Date.now(),
) {
  const email = `test+${suffix}@example.com`;
  const password = "TestPassword123!";

  await page.goto("/register");
  await page.getByLabel(/name/i).fill(`Test User ${suffix}`);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /register|sign up|create/i }).click();
  await page.waitForURL("**/dashboard**");

  return { email, password };
}

// Logs in an existing user
export async function loginTestUser(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL("**/dashboard**");
}
```

> **Important:** E2E tests run against a real database. Use a dedicated test database (set `DATABASE_URL` in `.env.test` or use a test flag) to avoid polluting production data. At minimum, use email addresses with a unique timestamp suffix so test users do not conflict between runs.

### Step 6 — Journey 1: Auth

`e2e/auth.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";
import { registerTestUser, loginTestUser } from "./helpers/auth";

test("register → land on dashboard", async ({ page }) => {
  await registerTestUser(page);
  await expect(page).toHaveURL(/.*dashboard.*/);
});

test("login with email and password → land on dashboard", async ({ page }) => {
  const suffix = `login-${Date.now()}`;
  const { email, password } = await registerTestUser(page, suffix);

  // Sign out first
  const signOutBtn = page.getByRole("button", { name: /sign out|log out/i });
  if (await signOutBtn.isVisible()) await signOutBtn.click();
  await page.waitForURL("**/login**");

  await loginTestUser(page, email, password);
  await expect(page).toHaveURL(/.*dashboard.*/);
});

test("sign out → redirected to login", async ({ page }) => {
  await registerTestUser(page, `signout-${Date.now()}`);
  const signOutBtn = page.getByRole("button", { name: /sign out|log out/i });
  await signOutBtn.click();
  await expect(page).toHaveURL(/.*login.*/);
});
```

### Step 7 — Journey 2: Application pipeline

`e2e/pipeline.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";
import { registerTestUser } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await registerTestUser(page, `pipeline-${Date.now()}`);
});

test("add application → appears in list", async ({ page }) => {
  await page.getByRole("link", { name: "+ Add Application" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/company/i).fill("Acme Corp");
  await page.getByLabel(/role/i).fill("Software Engineer");
  await page.getByRole("button", { name: "Add Application" }).click();
  await page.waitForURL("**/dashboard**");
  await expect(page.getByText("Acme Corp")).toBeVisible();
});

test("edit application → updated value displayed", async ({ page }) => {
  await page.getByRole("link", { name: "+ Add Application" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/company/i).fill("BetaCo");
  await page.getByLabel(/role/i).fill("Product Manager");
  await page.getByRole("button", { name: "Add Application" }).click();
  await page.waitForURL("**/dashboard**");

  await page.getByText("Product Manager").click();
  await page.waitForURL("**/dashboard/applications/*");
  await page.waitForLoadState("networkidle");

  // Grab the application ID from the current URL before navigating to edit
  const detailUrl = page.url();
  const appId = detailUrl.split("/applications/")[1];

  await page.getByRole("link", { name: "Edit" }).click();
  await page.waitForURL("**/edit**");
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/role/i).clear();
  await page.getByLabel(/role/i).fill("Senior Product Manager");
  await page.getByRole("button", { name: "Save Changes" }).click();

  // Wait for the edit URL to be gone and detail page to load
  await page.waitForURL(`**/applications/${appId}`);
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Senior Product Manager")).toBeVisible({ timeout: 10_000 });
});

test("delete application → removed from list", async ({ page }) => {
  await page.getByRole("link", { name: "+ Add Application" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/company/i).fill("DeleteMe Corp");
  await page.getByLabel(/role/i).fill("Temp Role");
  await page.getByRole("button", { name: "Add Application" }).click();
  await page.waitForURL("**/dashboard**");

  await page.getByText("DeleteMe Corp").click();
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Yes, delete" }).click();

  // Wait for redirect back to dashboard after delete
  await page.waitForURL("**/dashboard**");
  await expect(page.getByText("DeleteMe Corp")).not.toBeVisible();
});

test("drag application to new Kanban stage → stage updates", async ({
  page,
}) => {
  // Create the application
  await page.getByRole("link", { name: "+ Add Application" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/company/i).fill("DragCo");
  await page.getByLabel(/role/i).fill("Drag Tester");
  await page.getByRole("button", { name: "Add Application" }).click();
  await page.waitForURL("**/dashboard**");

  // Grab the application ID from the detail page URL
  await page.getByText("Drag Tester").click();
  await page.waitForURL("**/dashboard/applications/*");
  const appId = page.url().split("/applications/")[1];
  await page.goBack();
  await page.waitForLoadState("networkidle");

  // Call PATCH directly — @hello-pangea/dnd is not reliably simulatable in Playwright
  const res = await page.request.patch(`/api/applications/${appId}`, {
    data: { stage: "SCREENING" },
    headers: { "Content-Type": "application/json" },
  });
  expect(res.status(), `PATCH failed with ${res.status()}`).toBe(200);

  // Reload so the server-rendered Kanban reflects the new stage
  await page.reload();
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Kanban" }).click();
  await expect(
    page.locator('[data-rfd-droppable-id="SCREENING"]').getByText("Drag Tester"),
  ).toBeVisible();
});
```

### Step 8 — Journey 3: CSV export

`e2e/export.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";
import { registerTestUser } from "./helpers/auth";

test("export CSV → download initiates", async ({ page }) => {
  await registerTestUser(page, `export-${Date.now()}`);

  // Set up download listener before click
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /export csv/i }).click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("applications.csv");
});
```

### Step 9 — Journey 4: OAuth presence

`e2e/oauth.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test("login page — Google OAuth button is present", async ({ page }) => {
  await page.goto("/login");
  const googleButton = page.getByRole("button", {
    name: /continue with google/i,
  });
  await expect(googleButton).toBeVisible();
});
```

### Step 10 — Run E2E tests

```bash
# In one terminal:
npm run dev

# In another terminal:
npm run test:e2e
```

Expected output: all journeys pass. If drag-and-drop (T-042-13) is flaky, increase the timeout or mark it with `test.slow()` — Playwright's drag simulation can be timing-sensitive with `@hello-pangea/dnd`.

### DoD check

| Confirmed | How                                                                  | Item                      |
| --------- | -------------------------------------------------------------------- | ------------------------- |
| [x]       | `npm run test:e2e` — auth.spec.ts passes (3 tests)                   | Auth journeys passing     |
| [x]       | `npm run test:e2e` — pipeline.spec.ts passes (4 tests)               | Pipeline journeys passing |
| [x]       | `npm run test:e2e` — export.spec.ts passes (1 test)                  | Export journey passing    |
| [x]       | `npm run test:e2e` — oauth.spec.ts passes (1 test)                   | OAuth presence confirmed  |
| [x]       | `npm test` — Jest suite unchanged (no regressions from E2E addition) | RTL suite intact          |
| [x]       | `npm run build` — no errors                                          | Build clean               |

---

## PBI-045 — LinkedIn Post (Final)

**Goal:** Publish the final LinkedIn post in the HireTrace build-in-public series. Close the portfolio showcase with a project completion summary.

### Step 1 — Draft the post

This post should:

- Announce project completion (6 sprints, all 46 PBIs shipped)
- Lead with the most memorable retro insight from Sprint 6
- List what was built at a high level (auth, pipeline, contacts, notes, resume management, analytics, OAuth, E2E)
- Call out the test count (107+ RTL + 9 E2E) and testing discipline as a differentiator
- Link to the GitHub repo and Notion workspace
- End with a question or CTA that invites engagement

### Step 2 — Post structure (suggested)

```
[Hook — retro insight or surprising moment from the sprint]

6 sprints. 7 weeks. 46 product backlog items. HireTrace is shipped.

Here's what we built:
→ Email/password + Google OAuth
→ 6-stage Kanban pipeline with drag-and-drop
→ Contact CRM per application
→ Resume version tracking + Cloudinary storage
→ Interview notes timeline
→ Conversion rate + time-in-stage analytics
→ Reminder system + email notifications (Resend + Vercel Cron)
→ CSV export
→ 107 RTL tests + 9 E2E journeys — all passing

[Retro reflection — one thing that changed your thinking]

[What the project demonstrates as a portfolio piece]

GitHub: [link]
Notion (full SDD docs): [link]

What's one thing you look for in a portfolio project that most people skip?
```

### Step 3 — Publish

1. Copy the drafted post to LinkedIn
2. Add 2–3 relevant screenshots (dashboard, Kanban view, analytics)
3. Tag relevant hashtags: `#buildinpublic #productmanagement #softwaredevelopment #nextjs`
4. Publish

### Step 4 — Log

Add the post URL and publish date to `docs/linkedin.md`:

```markdown
## Post 35 — Sprint 6 Retro + Project Completion

**Published:** [date]
**URL:** [LinkedIn post URL]
**Impressions:** [check after 48h]
```

---

## Phase 3 Gate — Final Verification

Run all of the following before merging `feature/sprint-06-analytics-export-oauth` into `develop` and then `main`:

```bash
# 1. TypeScript
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Unit + integration tests (RTL + API)
npm test

# 4. Build
npm run build

# 5. E2E (requires `npm run dev` running)
npm run test:e2e
```

Then confirm the Phase 3 gate criteria:

| Criterion                                                                              | Confirmed |
| -------------------------------------------------------------------------------------- | --------- |
| All 🟡 Could Have PBIs complete — PBI-035, PBI-036, PBI-042 marked `[x]` in product.md | [ ]       |
| All 🔴 Must Have PBIs complete — PBI-040, PBI-045 marked `[x]` in product.md           | [ ]       |
| 107+ RTL tests passing                                                                 | [ ]       |
| 9 E2E journeys passing                                                                 | [ ]       |
| Google OAuth functional alongside email/password auth                                  | [ ]       |
| CSV export produces valid, downloadable file                                           | [ ]       |
| Final LinkedIn post published and URL logged in `linkedin.md`                          | [ ]       |
| Sprint 6 review and retro sections completed in `sprint-06.md`                         | [ ]       |
| `product.md` — all 46 PBIs marked `[x]`                                                | [ ]       |
| PR from `feature/sprint-06-analytics-export-oauth` → `develop` — CI passes             | [ ]       |
| PR from `develop` → `main` — CI passes                                                 | [ ]       |
| Vercel production deployment live                                                      | [ ]       |

_Gate target: 02 Jun 2026. Full Release._

---

## Carry-Forward Decisions — Sprint 6 Additions

These rules apply from this sprint forward (and to any future developer maintaining the project):

- **NextAuth session in API routes:** always use `getServerSession(authOptions)` — never `getToken` directly in API routes (reserve `getToken` for middleware only)
- **OAuth user creation:** the `signIn` callback is the correct place to create User records for new OAuth users — do not create users in the route handler
- **CSV generation server-side only:** never send raw Prisma data to a client-side CSV library — build the CSV string in the API route and stream it as `text/csv`
- **E2E test isolation:** each E2E test that modifies data must create its own user (use timestamp suffix) — shared state between tests causes non-deterministic failures
- **Playwright and Jest are separate runners:** `npm test` runs Jest; `npm run test:e2e` runs Playwright. Never merge the two configs — different environments, different lifecycles
- **`next-auth/react` must be mocked in RTL tests** that render components using `useSession` or `signIn` — unmocked NextAuth hooks throw in jsdom

---

_sprint-06-implementation-part2.md — 26 May 2026 — HireTrace_
_This document covers PBI-035, PBI-042, and PBI-045. See Part 1 for PBI-040 and PBI-036._
