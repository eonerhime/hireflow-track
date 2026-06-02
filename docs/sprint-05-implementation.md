# HireFlow — Sprint 5 Implementation Guide

**Document Type:** Developer Implementation Reference
**Sprint:** 5 of 6
**Branch:** `feature/sprint-05-resume-reminders` (from `develop`)
**Status:** Ready to implement
**PBIs:** PBI-022 → PBI-032 → PBI-033 → PBI-034 → PBI-023

---

## Before You Write a Single Line of Code

### Step 1 — Create branch and confirm baseline

```bash
git checkout develop
git pull origin develop
git checkout -b feature/sprint-05-resume-reminders
git push -u origin feature/sprint-05-resume-reminders
npm run build        # must pass clean
npx tsc --noEmit     # must pass clean
npm test             # must pass clean — 80 tests expected
```

If any of the three fail, fix before starting Sprint 5 work.

### Step 2 — Install new packages

```bash
# Cloudinary SDK — pinned version
npm install cloudinary@2.5.1

# Resend SDK — install only when you reach PBI-023, not before
npm install resend@4.0.0
```

> **Never use `@latest`.** Pin both versions exactly as shown. All other Sprint 5 dependencies (Prisma, Zod, react-hook-form, jose) are already installed.

### Step 3 — Log the storage ADR before any PBI-033 code

Open `docs/implementation.md`. In the ADR section, add the entry from the **ADR** section of this document before writing a single line of PBI-033 code. This is a hard gate — do not skip it.

---

## Critical Rules Carried Forward From Sprint 4

| Rule                                                                                        | Why                                                                       |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `npm run build` locally before every Vercel push                                            | Catches issues Vercel will catch                                          |
| Never `@latest` — all packages pinned                                                       | Cascading version conflicts                                               |
| `@jest-environment node` docblock must be absolute first line of API test files             | Anything before it breaks the override — never add to route files         |
| `jest.mock()` calls must come BEFORE all imports in API test files                          | Jest hoisting requirement                                                 |
| `moduleNameMapper` already declared in `jest.config.ts`                                     | Do not remove it                                                          |
| All form inputs must have `htmlFor` on `<label>` and `id` on `<input>`                      | Required for RTL `getByLabelText` and accessibility                       |
| `revalidatePath("/dashboard")` in all mutating API route handlers                           | Invalidates Vercel edge cache — `router.refresh()` alone insufficient     |
| `router.refresh()` only for same-page mutations                                             | Stay on the page after linking/unlinking a resume                         |
| `router.refresh()` then `setTimeout(() => router.push(...), 100)` for redirecting mutations | Prevents redirect racing refresh on Vercel                                |
| `window.confirm()` replaced with inline `confirmingDelete` state pattern                    | Native dialogs are inconsistent across browsers                           |
| Mock `next/cache` in ALL API route test files that call `revalidatePath`                    | Unmocked `revalidatePath` throws in Jest node env                         |
| Validate request body BEFORE DB lookup                                                      | Fail fast with 400 — do not hit the DB on bad input                       |
| Update ALL three mock factories when adding fields to `Application`                         | `ApplicationList.test.tsx`, `PipelineChart.test.tsx`, `StatsBar.test.tsx` |
| `z.input<>` and `z.infer<>` both exported from any schema with `.transform()`               | `useForm` uses input type; API payload uses output type                   |
| Named type aliases for any `Record` with non-primitive value type                           | Inline annotations mangle on save                                         |
| `jose` in API routes only — Web Crypto in `middleware.ts`                                   | Edge runtime constraint                                                   |
| `@import "tailwindcss"` in `globals.css`                                                    | Tailwind v4                                                               |
| Branch first, then document                                                                 | Branch must exist before sprint doc references it                         |

---

## Directory Structure After Sprint 5

New files and directories this sprint creates (additions to the Sprint 4 structure):

```
hireFlow/
├── app/
│   ├── api/
│   │   ├── reminders/
│   │   │   ├── route.ts                        ← GET upcoming reminders (PBI-022)
│   │   │   └── send/
│   │   │       └── route.ts                    ← POST cron — send email reminders (PBI-023)
│   │   └── resumes/
│   │       ├── route.ts                        ← GET list, POST upload (PBI-033)
│   │       └── [id]/
│   │           └── route.ts                    ← DELETE resume (PBI-033)
│   └── dashboard/
│       ├── reminders/
│       │   └── page.tsx                        ← Reminder list view (PBI-022)
│       └── resumes/
│           └── page.tsx                        ← Resume management page (PBI-033)
├── components/
│   ├── ReminderList.tsx                        ← Reminder list component (PBI-022)
│   ├── ResumeUploadForm.tsx                    ← File upload form (PBI-033)
│   ├── ResumeList.tsx                          ← Uploaded resumes list (PBI-033)
│   └── ResumePicker.tsx                        ← Link resume to application (PBI-034)
├── lib/
│   ├── cloudinary.ts                           ← Cloudinary SDK init (PBI-033)
│   └── schemas/
│       └── resume.ts                           ← Zod schemas for Resume (PBI-033)
├── prisma/
│   └── schema.prisma                           ← Updated: resumeVersionLabel, Resume model
├── vercel.json                                 ← Cron config for PBI-023
└── __tests__/
    ├── api.reminders.test.ts                   ← PBI-022 GET handler
    ├── ReminderList.test.tsx                   ← PBI-022 component
    ├── api.resumes.test.ts                     ← PBI-033 GET + POST handlers
    ├── api.resumes.[id].test.ts                ← PBI-033 DELETE handler
    ├── ResumeUploadForm.test.tsx               ← PBI-033 form component
    ├── api.applications.[id].resume.test.ts    ← PBI-034 PATCH with resumeId
    └── api.reminders.send.test.ts              ← PBI-023 cron route
```

---

## Environment Variables

Add the following to `.env.local` and to Vercel (Preview scope) before starting PBI-033 and PBI-023.

`.env.local` (full set after Sprint 5):

```
DATABASE_URL=<pooled Neon string — no channel_binding=require>
DIRECT_URL=<direct Neon string>
JWT_SECRET=<min 32 chars>
NEXTAUTH_URL=<your Vercel preview URL>
NEXTAUTH_SECRET=<random secret>
CLOUDINARY_CLOUD_NAME=<your cloud name>
CLOUDINARY_API_KEY=<your API key>
CLOUDINARY_API_SECRET=<your API secret>
RESEND_API_KEY=<your Resend API key>
CRON_SECRET=<min 32 chars — generate with: openssl rand -base64 32>
```

Add each new variable to Vercel → Project Settings → Environment Variables → Preview scope before pushing PBI-033 or PBI-023 code.

---

## ADR — Storage Provider for Resume Uploads

**Log this in `docs/implementation.md` before writing any PBI-033 code.**

**Decision:** Use Cloudinary for resume file storage.

**Rationale:**

- Free tier: 25 GB storage, 25 GB bandwidth/month — sufficient for a portfolio project with real users
- SDK (`cloudinary` v2) is mature, well-typed, and server-side upload is straightforward from a Next.js API route
- No additional managed service to provision — Cloudinary is self-contained with its own CDN
- Signed URLs allow time-limited, access-controlled download links without exposing raw storage paths
- Upload happens server-side — the Cloudinary API secret never reaches the client

**Alternative considered:** Supabase Storage — rejected because it requires provisioning a second Supabase project, adding operational complexity for no functional gain in this context. The integration pattern is identical if a future developer prefers it.

**Constraints enforced at the API layer:**

- File type: PDF only — MIME type checked before upload attempt
- File size: 5 MB maximum — checked before upload attempt
- Files stored in a `resumes/` folder within the Cloudinary project
- `fileKey` stores the Cloudinary `public_id` — required for deletion
- Cloudinary deletion must succeed before the DB record is deleted — if it fails, abort and return 500

---

## PBI-022 — Reminder List / Upcoming Actions View

**Goal:** A dedicated `/dashboard/reminders` page listing all active applications with a `followUpAt` date, sorted ascending. Overdue items are flagged in red. No schema migration required — uses the existing `followUpAt` field.

### Step 1 — Create the API route

`app/api/reminders/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reminders = await prisma.application.findMany({
      where: {
        userId: user.userId,
        deletedAt: null,
        followUpAt: { not: null },
      },
      select: {
        id: true,
        company: true,
        role: true,
        stage: true,
        followUpAt: true,
      },
      orderBy: { followUpAt: "asc" },
    });

    return NextResponse.json(reminders);
  } catch (error) {
    console.error("[GET /api/reminders]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Step 2 — Create the ReminderList component

`components/ReminderList.tsx`:

```typescript
import Link from "next/link";
import { ApplicationStage } from "@prisma/client";

interface Reminder {
  id: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  followUpAt: string; // ISO string — serialised from server
}

interface ReminderListProps {
  reminders: Reminder[];
}

const STAGE_LABELS: Record<ApplicationStage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  CLOSED: "Closed",
};

const STAGE_COLOURS: Record<ApplicationStage, string> = {
  APPLIED: "bg-gray-100 text-gray-700",
  SCREENING: "bg-blue-100 text-blue-700",
  INTERVIEW: "bg-yellow-100 text-yellow-700",
  ASSESSMENT: "bg-purple-100 text-purple-700",
  OFFER: "bg-green-100 text-green-700",
  CLOSED: "bg-red-100 text-red-700",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(iso: string): boolean {
  return new Date(iso) < new Date(new Date().toDateString());
}

export default function ReminderList({ reminders }: ReminderListProps) {
  if (reminders.length === 0) {
    return <p className="text-sm text-gray-500">No upcoming reminders.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {reminders.map((reminder) => {
        const overdue = isOverdue(reminder.followUpAt);
        return (
          <li key={reminder.id} className="py-4">
            <Link
              href={`/dashboard/applications/${reminder.id}`}
              className="block rounded-md px-2 -mx-2 hover:bg-gray-50 transition"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {reminder.role}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {reminder.company}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium
                                ${STAGE_COLOURS[reminder.stage]}`}
                  >
                    {STAGE_LABELS[reminder.stage]}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      overdue ? "text-red-600" : "text-gray-500"
                    }`}
                  >
                    {overdue ? "⚠ Follow-up overdue · " : ""}
                    {formatDate(reminder.followUpAt)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
```

### Step 3 — Create the reminders page

`app/dashboard/reminders/page.tsx`:

```typescript
import { cookies } from "next/headers";
import ReminderList from "@/components/ReminderList";

async function getReminders() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hireFlow-token")?.value;

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/reminders`, {
    headers: { Cookie: `hireFlow-token=${token}` },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function RemindersPage() {
  const reminders = await getReminders();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Reminders</h1>
      <ReminderList reminders={reminders} />
    </div>
  );
}
```

### Step 4 — Add Reminders link to dashboard nav

In your dashboard layout or nav component, add:

```typescript
<Link
  href="/dashboard/reminders"
  className="rounded-md border border-gray-300 bg-white px-4 py-2
  text-sm font-medium text-gray-600 hover:bg-gray-50"
>
  Reminders
</Link>
```

### Step 5 — Integration tests

`__tests__/api.reminders.test.ts`:

```typescript
/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findMany: jest.fn() },
  },
}));
jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));

import { GET } from "@/app/api/reminders/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindMany = prisma.application.findMany as jest.Mock;

function makeRequest() {
  return new NextRequest("http://localhost/api/reminders", { method: "GET" });
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/reminders", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns sorted reminders for authenticated user", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindMany.mockResolvedValue([
      {
        id: "app-1",
        company: "Acme",
        role: "Engineer",
        stage: "SCREENING",
        followUpAt: new Date(Date.now() + 86400000),
      },
    ]);
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].company).toBe("Acme");
  });
});
```

### Step 6 — RTL tests

`__tests__/ReminderList.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import ReminderList from "@/components/ReminderList";

const futureDate = new Date(Date.now() + 86400000).toISOString();
const pastDate = new Date(Date.now() - 86400000).toISOString();

const mockReminder = (overrides = {}) => ({
  id: "app-1",
  company: "Acme Corp",
  role: "Senior Engineer",
  stage: "SCREENING" as const,
  followUpAt: futureDate,
  ...overrides,
});

describe("ReminderList", () => {
  it("renders empty state when no reminders", () => {
    render(<ReminderList reminders={[]} />);
    expect(screen.getByText(/no upcoming reminders/i)).toBeInTheDocument();
  });

  it("renders a list of reminders", () => {
    render(<ReminderList reminders={[mockReminder()]} />);
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("shows overdue indicator for past followUpAt dates", () => {
    render(
      <ReminderList reminders={[mockReminder({ followUpAt: pastDate })]} />,
    );
    expect(screen.getByText(/follow-up overdue/i)).toBeInTheDocument();
  });
});
```

### DoD check

| Confirmed | How                                                                                     | Item                       |
| --------- | --------------------------------------------------------------------------------------- | -------------------------- |
| [x]       | Browser — `/dashboard/reminders` loads with all applications that have `followUpAt` set | Reminder list page renders |
| [x]       | Browser — items sorted ascending by follow-up date                                      | Sort order correct         |
| [x]       | Browser — overdue items (past date) show red indicator                                  | Overdue indicator visible  |
| [x]       | Browser — clicking an item navigates to the correct application detail page             | Links correct              |
| [x]       | Browser — empty state shows when no follow-up dates are set                             | Empty state renders        |
| [x]       | `npm test` — `api.reminders.test.ts` passes (401, 200)                                  | API tests passing          |
| [x]       | `npm test` — `ReminderList.test.tsx` passes (empty state, list, overdue)                | RTL tests passing          |
| [x]       | Mobile — page usable at 375px viewport                                                  | Mobile responsive          |
| [x]       | `npx tsc --noEmit` passes clean                                                         | TypeScript clean           |

---

---

## PBI-032 — Resume Version Label Field Per Application

**Goal:** Add a `resumeVersionLabel` text field to the `Application` model and surface it in the form and detail page. Small schema addition — do this before PBI-033 to stabilise the Application shape.

### Step 1 — Update `prisma/schema.prisma`

Add `resumeVersionLabel String?` to the `Application` model:

```prisma
model Application {
  id                 String            @id @default(cuid())
  userId             String
  user               User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  company            String
  role               String
  location           String?
  salary             String?
  jobUrl             String?
  stage              ApplicationStage  @default(APPLIED)
  appliedAt          DateTime          @default(now())
  followUpAt         DateTime?
  notes              String?
  source             String?
  stageEnteredAt     DateTime          @default(now())
  resumeVersionLabel String?
  deletedAt          DateTime?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  contacts           Contact[]
  interviewNotes     InterviewNote[]

  @@index([userId])
  @@index([userId, stage])
  @@index([userId, deletedAt])
}
```

### Step 2 — Run the migration

```bash
npx prisma migrate dev --name add-resume-version-label
```

Expected output:

```
✔ Generated Prisma Client
The following migration was created: prisma/migrations/TIMESTAMP_add_resume_version_label/migration.sql
```

### Step 3 — Update all three mock factories

> ⚠️ Mandatory. All three files must be updated before running `npm test` or the suite will fail with TypeScript errors.

Add `resumeVersionLabel: null` to the mock application object in each file:

**`__tests__/ApplicationList.test.tsx`** — inside `mockApp()`:

```typescript
resumeVersionLabel: null,
```

**`__tests__/PipelineChart.test.tsx`** — inside the mock application object:

```typescript
resumeVersionLabel: null,
```

**`__tests__/StatsBar.test.tsx`** — inside the mock application object:

```typescript
resumeVersionLabel: null,
```

### Step 4 — Update the Zod schema

In `lib/schemas/application.ts`, add `resumeVersionLabel` to both `createApplicationSchema` and `updateApplicationSchema`:

```typescript
resumeVersionLabel: z.string().optional(),
```

### Step 5 — Update the API routes

In `app/api/applications/route.ts` (POST) and `app/api/applications/[id]/route.ts` (PATCH), `resumeVersionLabel` is included automatically if you spread `result.data` into the Prisma call — confirm this is the case. No structural route changes needed.

In `app/api/applications/[id]/route.ts` (GET), confirm `resumeVersionLabel` is returned — include it in the `select` block or return the full model.

### Step 6 — Update ApplicationForm

In `components/ApplicationForm.tsx`, add the resume version label input after the existing fields:

```typescript
<div>
  <label
    htmlFor="resumeVersionLabel"
    className="block text-sm font-medium text-gray-700"
  >
    Resume version
  </label>
  <input
    id="resumeVersionLabel"
    type="text"
    placeholder="e.g. Product Manager v3"
    {...register("resumeVersionLabel")}
    className="mt-1 block w-full rounded-md border border-gray-300 px-3
               py-2 text-sm shadow-sm focus:border-blue-500
               focus:outline-none focus:ring-1 focus:ring-blue-500"
  />
</div>
```

### Step 7 — Display on application detail page

In `app/dashboard/applications/[id]/page.tsx`, display the label conditionally:

```typescript
{application.resumeVersionLabel && (
  <div>
    <dt className="text-sm font-medium text-gray-500">Resume version</dt>
    <dd className="text-sm text-gray-900">{application.resumeVersionLabel}</dd>
  </div>
)}
```

### DoD check

| Confirmed | How                                                                                        | Item                             |
| --------- | ------------------------------------------------------------------------------------------ | -------------------------------- |
| [x]       | `npx prisma migrate dev` completed — no errors                                             | Migration ran cleanly            |
| [x]       | Browser — create an application with a resume version label — label appears on detail page | Label saves and displays         |
| [x]       | Browser — edit an existing application, add a label, save — label displays on detail page  | Label updates correctly          |
| [x]       | Browser — application with no label — no resume version section appears on detail page     | Conditional display works        |
| [x]       | `npm test` — all 80 prior tests still pass with updated mock factories                     | Mock factories updated correctly |
| [x]       | `npx tsc --noEmit` passes clean                                                            | TypeScript clean                 |

---

## PBI-033 — Resume File Upload and Storage

**Goal:** Users can upload a PDF resume (max 5 MB) to Cloudinary via a server-side upload route. Uploaded resumes are stored in the `Resume` table and listed on a dedicated page with delete support.

> ⚠️ Log the ADR in `docs/implementation.md` before Task 1. This is a hard gate — no code until the ADR is written.

### Step 1 — Set up the Cloudinary SDK

Create `lib/cloudinary.ts`:

```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
```

### Step 2 — Update `prisma/schema.prisma`

Add the `Resume` model, add the `Resume` relation to `User`, and add `resumeId` to `Application`. This is the full schema after Sprint 5 migrations:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model User {
  id           String        @id @default(cuid())
  email        String        @unique
  password     String
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  applications Application[]
  resumes      Resume[]
}

model Application {
  id                 String            @id @default(cuid())
  userId             String
  user               User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  company            String
  role               String
  location           String?
  salary             String?
  jobUrl             String?
  stage              ApplicationStage  @default(APPLIED)
  appliedAt          DateTime          @default(now())
  followUpAt         DateTime?
  notes              String?
  source             String?
  stageEnteredAt     DateTime          @default(now())
  resumeVersionLabel String?
  resumeId           String?
  resume             Resume?           @relation(fields: [resumeId], references: [id])
  deletedAt          DateTime?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt
  contacts           Contact[]
  interviewNotes     InterviewNote[]

  @@index([userId])
  @@index([userId, stage])
  @@index([userId, deletedAt])
}

model Resume {
  id           String        @id @default(cuid())
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  label        String
  fileUrl      String
  fileKey      String
  uploadedAt   DateTime      @default(now())
  applications Application[]

  @@index([userId])
}

model Contact {
  id            String      @id @default(cuid())
  applicationId String
  application   Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  name          String
  role          String?
  email         String?
  phone         String?
  notes         String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@index([applicationId])
}

model InterviewNote {
  id            String           @id @default(cuid())
  applicationId String
  application   Application      @relation(fields: [applicationId], references: [id], onDelete: Cascade)
  stage         ApplicationStage
  content       String
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  @@index([applicationId])
}

enum ApplicationStage {
  APPLIED
  SCREENING
  INTERVIEW
  ASSESSMENT
  OFFER
  CLOSED
}
```

### Step 3 — Run the migration

```bash
npx prisma migrate dev --name add-resume-model
```

Expected output:

```
✔ Generated Prisma Client
The following migration was created: prisma/migrations/TIMESTAMP_add_resume_model/migration.sql
```

### Step 4 — Update all three mock factories again

Add `resumeId: null` and `resume: null` to the mock application object in all three files:

**`__tests__/ApplicationList.test.tsx`**, **`__tests__/PipelineChart.test.tsx`**, **`__tests__/StatsBar.test.tsx`**:

```typescript
resumeId: null,
resume:   null,
```

### Step 5 — Create the Zod schema

Create `lib/schemas/resume.ts`:

```typescript
// lib/schemas/resume.ts
import { z } from "zod";

export const createResumeSchema = z.object({
  label: z.string().min(1, "Label is required"),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;

export const linkResumeSchema = z.object({
  resumeId: z.string().nullable().optional(),
});

export type LinkResumeInput = z.infer<typeof linkResumeSchema>;
```

### Step 6 — Create the API routes

Create `app/api/resumes/route.ts` — GET list + POST upload:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";
import { getUserFromRequest } from "@/lib/auth";
import { createResumeSchema } from "@/lib/schemas/resume";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resumes = await prisma.resume.findMany({
      where: { userId: user.userId },
      orderBy: { uploadedAt: "desc" },
      select: {
        id: true,
        label: true,
        fileUrl: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json(resumes);
  } catch (error) {
    console.error("[GET /api/resumes]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const labelRaw = formData.get("label");

    // Validate label first — fail fast before touching the file
    const labelResult = createResumeSchema.safeParse({ label: labelRaw });
    if (!labelResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: labelResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Validate file presence
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type — PDF only
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 },
      );
    }

    // Validate file size — 5 MB max
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File must be 5 MB or smaller" },
        { status: 400 },
      );
    }

    // Convert File to Buffer for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary server-side — API secret never leaves the server
    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "raw", folder: "resumes", format: "pdf" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as { secure_url: string; public_id: string });
          },
        )
        .end(buffer);
    });

    const resume = await prisma.resume.create({
      data: {
        userId: user.userId,
        label: labelResult.data.label,
        fileUrl: uploadResult.secure_url,
        fileKey: uploadResult.public_id,
      },
    });

    revalidatePath("/dashboard/resumes");

    return NextResponse.json(
      { id: resume.id, label: resume.label, fileUrl: resume.fileUrl },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/resumes]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

`app/api/resumes/[id]/route.ts` — DELETE:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";
import { getUserFromRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resume = await prisma.resume.findFirst({
      where: { id, userId: user.userId },
    });

    if (!resume)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Delete from Cloudinary first — if this fails, do not delete the DB record
    await cloudinary.uploader.destroy(resume.fileKey, {
      resource_type: "raw",
    });

    // Unlink from any applications before deleting the resume record
    await prisma.application.updateMany({
      where: { resumeId: id },
      data: { resumeId: null },
    });

    await prisma.resume.delete({ where: { id } });

    revalidatePath("/dashboard/resumes");
    revalidatePath("/dashboard");

    return NextResponse.json({ message: "Resume deleted" });
  } catch (error) {
    console.error("[DELETE /api/resumes/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Step 7 — Create the ResumeUploadForm component

`components/ResumeUploadForm.tsx`:

```typescript
// components/ResumeUploadForm.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ResumeUploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !label.trim()) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("label", label.trim());

    const res = await fetch("/api/resumes", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      setLabel("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Upload failed");
    }

    setUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="resume-label"
          className="block text-sm font-medium text-gray-700"
        >
          Label
        </label>
        <input
          id="resume-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Product Manager v3"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3
                     py-2 text-sm shadow-sm focus:border-blue-500
                     focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="resume-file"
          className="block text-sm font-medium text-gray-700"
        >
          PDF file <span className="text-gray-400">(max 5 MB)</span>
        </label>
        <input
          id="resume-file"
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm text-gray-500
                     file:mr-4 file:rounded-md file:border-0
                     file:bg-blue-50 file:px-4 file:py-2
                     file:text-sm file:font-medium file:text-blue-700
                     hover:file:bg-blue-100"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={uploading || !file || !label.trim()}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium
                   text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Upload Resume"}
      </button>
    </form>
  );
}
```

### Step 8 — Create the ResumeList component

`components/ResumeList.tsx`:

```typescript
// components/ResumeList.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Resume {
  id: string;
  label: string;
  fileUrl: string;
  uploadedAt: string;
}

interface ResumeListProps {
  resumes: Resume[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ResumeList({ resumes }: ResumeListProps) {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setConfirmingDelete(null);
      router.refresh();
    }
    setDeleting(false);
  };

  if (resumes.length === 0) {
    return <p className="text-sm text-gray-500">No resumes uploaded yet.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {resumes.map((resume) => (
        <li
          key={resume.id}
          className="flex items-center justify-between gap-4 py-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-gray-900">{resume.label}</p>
            <p className="text-sm text-gray-500">
              Uploaded {formatDate(resume.uploadedAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <a
              href={resume.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Download
            </a>
            {confirmingDelete === resume.id ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-gray-700">Delete?</span>
                <button
                  onClick={() => handleDelete(resume.id)}
                  disabled={deleting}
                  className="font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmingDelete(null)}
                  className="text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmingDelete(resume.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
```

### Step 9 — Create the resumes page

`app/dashboard/resumes/page.tsx`:

```typescript
// app/dashboard/resumes/page.tsx
import { cookies } from "next/headers";
import ResumeUploadForm from "@/components/ResumeUploadForm";
import ResumeList from "@/components/ResumeList";

async function getResumes() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hireFlow-token")?.value;

  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/resumes`, {
    headers: { Cookie: `hireFlow-token=${token}` },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function ResumesPage() {
  const resumes = await getResumes();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          Upload a resume
        </h2>
        <ResumeUploadForm />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-700">
          Uploaded resumes
        </h2>
        <ResumeList resumes={resumes} />
      </section>
    </div>
  );
}
```

### Step 10 — Add Resumes link to dashboard nav

In your dashboard layout or nav component, add:

```typescript
<Link href="/dashboard/resumes">Resumes</Link>
```

### Step 11 — Integration tests

`__tests__/api.resumes.test.ts`:

```typescript
/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    resume: { findMany: jest.fn(), create: jest.fn() },
  },
}));
jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));
jest.mock("@/lib/cloudinary", () => ({
  cloudinary: {
    uploader: {
      upload_stream: jest.fn(
        (_opts: unknown, cb: (err: null, result: object) => void) => ({
          end: () =>
            cb(null, {
              secure_url:
                "https://res.cloudinary.com/test/raw/upload/resumes/test.pdf",
              public_id: "resumes/test",
            }),
        }),
      ),
    },
  },
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { GET, POST } from "@/app/api/resumes/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindMany = prisma.resume.findMany as jest.Mock;
const mockCreate = prisma.resume.create as jest.Mock;

function makeGetRequest() {
  return new NextRequest("http://localhost/api/resumes", { method: "GET" });
}

function makePostRequest(
  label = "CV v1",
  fileType = "application/pdf",
  fileSize = 1024,
) {
  const formData = new FormData();
  const file = new File(["x".repeat(fileSize)], "cv.pdf", { type: fileType });
  formData.append("file", file);
  formData.append("label", label);
  return new NextRequest("http://localhost/api/resumes", {
    method: "POST",
    body: formData,
  });
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/resumes", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(401);
  });

  it("returns list of resumes for authenticated user", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindMany.mockResolvedValue([
      {
        id: "r-1",
        label: "CV v1",
        fileUrl: "https://cdn.example.com/cv.pdf",
        uploadedAt: new Date(),
      },
    ]);
    const res = await GET(makeGetRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
  });
});

describe("POST /api/resumes", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await POST(makePostRequest());
    expect(res.status).toBe(401);
  });

  it("returns 400 for non-PDF file type", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    const res = await POST(makePostRequest("CV v1", "image/png"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/pdf/i);
  });

  it("returns 201 on successful upload", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockCreate.mockResolvedValue({
      id: "r-1",
      label: "CV v1",
      fileUrl: "https://res.cloudinary.com/test/raw/upload/resumes/test.pdf",
      fileKey: "resumes/test",
      uploadedAt: new Date(),
    });
    const res = await POST(makePostRequest("CV v1"));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe("r-1");
  });
});
```

`__tests__/api.resumes.[id].test.ts`:

```typescript
/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    resume: { findFirst: jest.fn(), delete: jest.fn() },
    application: { updateMany: jest.fn() },
  },
}));
jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));
jest.mock("@/lib/cloudinary", () => ({
  cloudinary: {
    uploader: {
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { DELETE } from "@/app/api/resumes/[id]/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindFirst = prisma.resume.findFirst as jest.Mock;
const mockDelete = prisma.resume.delete as jest.Mock;
const mockUpdateMany = prisma.application.updateMany as jest.Mock;

const existingResume = {
  id: "r-1",
  userId: "user-1",
  label: "CV v1",
  fileUrl: "https://cdn.example.com/cv.pdf",
  fileKey: "resumes/test",
  uploadedAt: new Date(),
};

function makeRequest() {
  return new NextRequest("http://localhost/api/resumes/r-1", {
    method: "DELETE",
  });
}

const validParams = Promise.resolve({ id: "r-1" });

beforeEach(() => jest.clearAllMocks());

describe("DELETE /api/resumes/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await DELETE(makeRequest(), { params: validParams });
    expect(res.status).toBe(401);
  });

  it("returns 404 when resume not found", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(null);
    const res = await DELETE(makeRequest(), { params: validParams });
    expect(res.status).toBe(404);
  });

  it("returns 200 and deletes the resume", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(existingResume);
    mockUpdateMany.mockResolvedValue({ count: 0 });
    mockDelete.mockResolvedValue(existingResume);
    const res = await DELETE(makeRequest(), { params: validParams });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Resume deleted");
  });
});
```

`__tests__/ResumeUploadForm.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import ResumeUploadForm from "@/components/ResumeUploadForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

describe("ResumeUploadForm", () => {
  it("renders label and file inputs", () => {
    render(<ResumeUploadForm />);
    expect(screen.getByLabelText(/label/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pdf file/i)).toBeInTheDocument();
  });

  it("renders the upload button", () => {
    render(<ResumeUploadForm />);
    expect(
      screen.getByRole("button", { name: /upload resume/i }),
    ).toBeInTheDocument();
  });

  it("upload button is disabled when no file or label provided", () => {
    render(<ResumeUploadForm />);
    expect(
      screen.getByRole("button", { name: /upload resume/i }),
    ).toBeDisabled();
  });
});
```

### DoD check

| Confirmed | How                                                                                    | Item                        |
| --------- | -------------------------------------------------------------------------------------- | --------------------------- |
| [x]       | `npx prisma migrate dev` completed — `Resume` table visible in Prisma Studio           | Migration ran cleanly       |
| [x]       | Browser — upload a PDF with a label — appears in the list immediately                  | Upload succeeds             |
| [x]       | Browser — attempt to upload a non-PDF — error shown inline                             | File type validation works  |
| [x]       | Browser — attempt to upload a file over 5 MB — error shown inline                      | File size validation works  |
| [x]       | Browser — delete a resume — inline confirmation appears; on confirm, removed from list | Inline delete confirm works |
| [x]       | Browser — empty state shows when no resumes uploaded                                   | Empty state renders         |
| [X]       | Cloudinary dashboard — uploaded file visible in `resumes/` folder                      | Cloudinary upload confirmed |
| [x]       | `npm test` — `api.resumes.test.ts` passes (GET: 401, 200; POST: 401, 400, 201)         | API tests passing           |
| [x]       | `npm test` — `npm test "api.resumes.\[id\].test.ts"` passes (DELETE: 401, 404, 200)    | DELETE tests passing        |
| [x]       | `npm test` — `ResumeUploadForm.test.tsx` passes (3 tests)                              | RTL tests passing           |
| [x]       | Mobile — page usable at 375px viewport                                                 | Mobile responsive           |
| [x]       | `npx tsc --noEmit` passes clean                                                        | TypeScript clean            |

---

## PBI-034 — Link Specific Resume Version to Application

**Goal:** A user can select one of their uploaded resumes from a dropdown on the application detail page and link it. The linked resume label and download link display on the detail page. Unlinking sets `resumeId` to null.

> Depends on PBI-033 being complete and the `Resume` model existing in the DB.

### Step 1 — Update the Zod application schema

In `lib/schemas/application.ts`, add `resumeId` to `updateApplicationSchema`:

```typescript
resumeId: z.string().nullable().optional(),
```

### Step 2 — Update the PATCH route

In `app/api/applications/[id]/route.ts`, add an ownership check for `resumeId` after body validation and before the Prisma update:

```typescript
// After result.success check, before prisma.application.update:
if (result.data.resumeId) {
  const resume = await prisma.resume.findFirst({
    where: { id: result.data.resumeId, userId: user.userId },
  });
  if (!resume) {
    return NextResponse.json(
      { error: "Resume not found or not owned by user" },
      { status: 403 },
    );
  }
}
```

### Step 3 — Update the GET route

In `app/api/applications/[id]/route.ts` GET handler, include the linked resume in the response:

```typescript
const application = await prisma.application.findFirst({
  where: { id, userId: user.userId, deletedAt: null },
  include: {
    contacts: true,
    interviewNotes: { orderBy: { createdAt: "desc" } },
    resume: {
      select: { id: true, label: true, fileUrl: true },
    },
  },
});
if (!application) {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
return NextResponse.json(application);
```

### Step 4 — Create the ResumePicker component

`components/ResumePicker.tsx`:

```typescript
// components/ResumePicker.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ResumeOption {
  id: string;
  label: string;
  fileUrl: string;
}

interface ResumePickerProps {
  applicationId: string;
  currentResumeId: string | null;
  resumes: ResumeOption[];
}

export default function ResumePicker({
  applicationId,
  currentResumeId,
  resumes,
}: ResumePickerProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(currentResumeId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (value: string) => {
    setSelected(value);
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId: value === "" ? null : value }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to link resume");
    }

    setSaving(false);
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor="resume-picker"
        className="block text-sm font-medium text-gray-700"
      >
        Linked resume
      </label>
      <select
        id="resume-picker"
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className="block w-full rounded-md border border-gray-300 px-3
                   py-2 text-sm shadow-sm focus:border-blue-500
                   focus:outline-none focus:ring-1 focus:ring-blue-500
                   disabled:opacity-50"
      >
        <option value="">— None —</option>
        {resumes.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

### Step 5 — Wire into the application detail page

In `app/dashboard/applications/[id]/page.tsx`, fetch the user's resumes alongside the application:

```typescript
// At the top of the page function, alongside fetching the application:
const cookieStore = await cookies();
const token = cookieStore.get("hireFlow-token")?.value;

const resumesRes = await fetch(`${process.env.NEXTAUTH_URL}/api/resumes`, {
  headers: { Cookie: `hireFlow-token=${token}` },
  cache: "no-store",
});
const resumes = resumesRes.ok ? await resumesRes.json() : [];
```

In the JSX, add the linked resume display and picker:

```typescript
{/* Linked resume — display when set */}
{application.resume && (
  <div>
    <dt className="text-sm font-medium text-gray-500">Linked resume</dt>
    <dd className="text-sm text-gray-900">
      {application.resume.label}{" "}
      <a
        href={application.resume.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        Download
      </a>
    </dd>
  </div>
)}

{/* Resume picker — always rendered so user can link/unlink */}
<ResumePicker
  applicationId={application.id}
  currentResumeId={application.resumeId}
  resumes={resumes}
/>
```

### Step 6 — Integration tests

`__tests__/api.applications.[id].resume.test.ts`:

```typescript
/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findFirst: jest.fn(), update: jest.fn() },
    resume: { findFirst: jest.fn() },
  },
}));
jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { PATCH } from "@/app/api/applications/[id]/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindApp = prisma.application.findFirst as jest.Mock;
const mockFindResume = prisma.resume.findFirst as jest.Mock;
const mockUpdate = prisma.application.update as jest.Mock;

const existingApp = {
  id: "app-1",
  userId: "user-1",
  company: "Acme",
  role: "Engineer",
  stage: "APPLIED",
  deletedAt: null,
};

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/applications/app-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validParams = Promise.resolve({ id: "app-1" });

beforeEach(() => jest.clearAllMocks());

describe("PATCH /api/applications/[id] — resumeId linking", () => {
  it("returns 403 when resumeId belongs to another user", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindApp.mockResolvedValue(existingApp);
    mockFindResume.mockResolvedValue(null); // resume not owned by user-1
    const res = await PATCH(makeRequest({ resumeId: "r-other" }), {
      params: validParams,
    });
    expect(res.status).toBe(403);
  });

  it("returns 200 when valid resumeId is linked", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindApp.mockResolvedValue(existingApp);
    mockFindResume.mockResolvedValue({ id: "r-1", userId: "user-1" });
    mockUpdate.mockResolvedValue({ ...existingApp, resumeId: "r-1" });
    const res = await PATCH(makeRequest({ resumeId: "r-1" }), {
      params: validParams,
    });
    expect(res.status).toBe(200);
  });
});
```

### DoD check

| Confirmed | How                                                                                        | Item                        |
| --------- | ------------------------------------------------------------------------------------------ | --------------------------- |
| [x]       | Browser — application detail page shows resume picker dropdown with all uploaded resumes   | Picker renders with options |
| [x]       | Browser — select a resume from the dropdown — linked resume label and download link appear | Resume links correctly      |
| [x]       | Browser — select "— None —" — linked resume section disappears                             | Unlinking works             |
| [x]       | Browser — PATCH with another user's resumeId (crafted request) — returns 403               | Ownership check enforced    |
| [x]       | `npm test` — `"api.applications.\[id\].resume.test.ts"` passes (403, 200)                  | Tests passing               |
| [x]       | `npx tsc --noEmit` passes clean                                                            | TypeScript clean            |

---

---

## PBI-023 — Email Notification for Due Reminders

**Goal:** A cron job runs daily at 08:00 UTC. It emails each user a list of their applications where `followUpAt` is today or earlier and `stage` is not `CLOSED`. Uses Resend. Secured with Vercel's built-in cron `Authorization` header.

> Depends on PBI-022 being complete. Install Resend only when you reach this PBI.

### Step 1 — Install Resend

```bash
npm install resend@4.0.0
```

### Step 2 — Update middleware.ts

Add `/api/reminders/send` to `PUBLIC_API_ROUTES` in `./middleware.ts` so the JWT check does not block the cron runner:

```typescript
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/reminders/send",
];
```

### Step 3 — Create the cron route

`app/api/reminders/send/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildEmailBody(
  reminders: {
    company: string;
    role: string;
    stage: string;
    followUpAt: Date;
  }[],
): string {
  const lines = reminders.map(
    (r) =>
      `• ${r.role} at ${r.company} (${r.stage}) — follow up by ${r.followUpAt.toLocaleDateString(
        "en-GB",
        { day: "numeric", month: "short", year: "numeric" },
      )}`,
  );
  return [
    "Hi,",
    "",
    "You have the following follow-ups due today in HireFlow:",
    "",
    ...lines,
    "",
    "Log in to HireFlow to take action.",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  try {
    // Validate Vercel cron Authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const applications = await prisma.application.findMany({
      where: {
        deletedAt: null,
        followUpAt: { lte: today },
        stage: { not: "CLOSED" },
      },
      include: {
        user: { select: { email: true } },
      },
      orderBy: { followUpAt: "asc" },
    });

    if (applications.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    // Group applications by user email
    type AppRow = (typeof applications)[number];
    type UserMap = Record<string, AppRow[]>;

    const byUser = applications.reduce<UserMap>((acc, app) => {
      const email = app.user.email;
      if (!acc[email]) acc[email] = [];
      acc[email].push(app);
      return acc;
    }, {});

    let sent = 0;

    for (const [email, userApps] of Object.entries(byUser)) {
      const count = userApps.length;
      try {
        await resend.emails.send({
          from: "HireFlow <reminders@yourdomain.com>",
          to: email,
          subject: `You have ${count} follow-up${count === 1 ? "" : "s"} due today — HireFlow`,
          text: buildEmailBody(
            userApps.map((a) => ({
              company: a.company,
              role: a.role,
              stage: a.stage,
              followUpAt: a.followUpAt!,
            })),
          ),
        });
        sent += 1;
      } catch (emailError) {
        // Log but do not throw — continue sending to remaining users
        console.error(
          `[reminders/send] Failed to send to ${email}:`,
          emailError,
        );
      }
    }

    return NextResponse.json({ sent });
  } catch (error) {
    console.error("[POST /api/reminders/send]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Step 4 — Create vercel.json

Create `vercel.json` at the project root:

```json
{
  "crons": [
    {
      "path": "/api/reminders/send",
      "schedule": "0 8 * * *"
    }
  ]
}
```

> Vercel Hobby plan supports one cron job with a minimum interval of 1 day — this schedule is within limits. Vercel automatically injects `Authorization: Bearer <CRON_SECRET>` when invoking the cron path, matching the check in the route handler.

### Step 5 — Integration tests

`__tests__/api.reminders.send.test.ts`:

```typescript
/**
 * @jest-environment node
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findMany: jest.fn() },
  },
}));
jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: "email-1" }),
    },
  })),
}));

import { POST } from "@/app/api/reminders/send/route";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const mockFindMany = prisma.application.findMany as jest.Mock;
const CRON_SECRET = "test-cron-secret";

function makeRequest(withSecret = true) {
  return new NextRequest("http://localhost/api/reminders/send", {
    method: "POST",
    headers: withSecret ? { Authorization: `Bearer ${CRON_SECRET}` } : {},
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.CRON_SECRET = CRON_SECRET;
});

describe("POST /api/reminders/send", () => {
  it("returns 401 without cron secret", async () => {
    const res = await POST(makeRequest(false));
    expect(res.status).toBe(401);
  });

  it("returns 200 with sent count when reminders exist", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "app-1",
        company: "Acme",
        role: "Engineer",
        stage: "SCREENING",
        followUpAt: new Date(),
        user: { email: "test@example.com" },
      },
    ]);
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sent).toBe(1);
  });
});
```

### Step 6 — Manual test before merging

Test the cron route from the terminal against your Vercel preview URL:

```bash
curl -k -X POST "https://hireFlow-ten.vercel.app/api/reminders/send" \
      -H "Authorization: Bearer QPxva5bH6eIAlvSfKdeGoNSmX19sar2BTcyIQPtC8t0=" \
      -H "x-vercel-protection-bypass: kYK9QYZ2OvcGOejvmTePMFf3Wv4wNrfu"
```

Expected response: `{ "sent": N }` where N is the number of users emailed. `0` is valid when no reminders are due.

### DoD check

| Confirmed | How                                                                                 | Item                          |
| --------- | ----------------------------------------------------------------------------------- | ----------------------------- |
| [x]       | `curl` — POST without `Authorization` header — returns 401                          | Auth check enforced           |
| [x]       | `curl` — POST with correct `Authorization: Bearer <secret>` — returns `{ sent: N }` | Cron route responds correctly |
| [x]       | Email received in inbox for an application with `followUpAt` today or earlier       | Email sends correctly         |
| [x]       | No email sent for applications in CLOSED stage                                      | CLOSED stage excluded         |
| [x]       | Resend dashboard — email delivery confirmed                                         | Delivery confirmed in Resend  |
| [x]       | `npm test` — `api.reminders.send.test.ts` passes (401, 200)                         | Tests passing                 |
| [x]       | `vercel.json` committed and visible in repo root                                    | Cron config committed         |
| [x]       | `npx tsc --noEmit` passes clean                                                     | TypeScript clean              |

---

## API Documentation (JSDoc additions)

Add JSDoc comments to all new Sprint 5 route handlers. Follow the established format from Sprint 4.

`app/api/reminders/route.ts`:

```typescript
/**
 * GET /api/reminders
 * Auth: Required (JWT cookie)
 *
 * Returns all active applications with a followUpAt date set for the
 * authenticated user, sorted ascending by followUpAt.
 * Empty array is a valid response — not 404.
 *
 * Response shape:
 *   { id, company, role, stage, followUpAt }[]
 *
 * Responses:
 *   200 — Array of reminder objects
 *   401 — Unauthorized { error }
 *   500 — Internal server error { error }
 */
```

`app/api/reminders/send/route.ts`:

```typescript
/**
 * POST /api/reminders/send
 * Auth: Vercel Cron — Authorization: Bearer <CRON_SECRET>
 *
 * Sends reminder emails to users with applications where followUpAt <= today
 * and stage is not CLOSED. Groups reminders per user — one email per user.
 * Email send failures per user are logged but do not abort the batch.
 * Added to PUBLIC_API_ROUTES in middleware.ts — JWT check bypassed.
 *
 * Responses:
 *   200 — { sent: number } count of users successfully emailed
 *   401 — Unauthorized { error }
 *   500 — Internal server error { error }
 */
```

`app/api/resumes/route.ts`:

```typescript
/**
 * GET /api/resumes
 * Auth: Required (JWT cookie)
 *
 * Returns all resumes uploaded by the authenticated user,
 * ordered by uploadedAt descending.
 *
 * Response shape:
 *   { id, label, fileUrl, uploadedAt }[]
 *
 * Responses:
 *   200 — Array of resume objects (empty array if none)
 *   401 — Unauthorized { error }
 *   500 — Internal server error { error }
 */

/**
 * POST /api/resumes
 * Auth: Required (JWT cookie)
 *
 * Accepts multipart/form-data. Validates PDF type and 5 MB size limit before
 * uploading to Cloudinary server-side. Stores metadata in the Resume table.
 * The Cloudinary API secret is never exposed to the client.
 *
 * Request body (multipart/form-data):
 *   file:  File   — PDF only, max 5 MB
 *   label: string — required
 *
 * Responses:
 *   201 — { id, label, fileUrl }
 *   400 — Validation failed, wrong file type, or file too large { error }
 *   401 — Unauthorized { error }
 *   500 — Internal server error { error }
 */
```

`app/api/resumes/[id]/route.ts`:

```typescript
/**
 * DELETE /api/resumes/[id]
 * Auth: Required (JWT cookie)
 *
 * Deletes a resume. Cloudinary deletion runs first — if it fails the DB
 * record is NOT deleted and 500 is returned. Any applications linked to
 * this resume have resumeId set to null before the record is deleted.
 *
 * Responses:
 *   200 — { message: "Resume deleted" }
 *   401 — Unauthorized { error }
 *   404 — Resume not found or not owned by user { error }
 *   500 — Internal server error { error }
 */
```

---

## Before Merging to `develop`

Run the full pre-merge checklist:

```bash
# 1. TypeScript
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Tests
npm test

# 4. Build
npm run build
```

All four must pass clean. Expected test count: **95 passing** (80 from Sprint 4 + 15 new).

Then commit and push:

```bash
git add .
git commit -m "[PBI-022 to PBI-023, PBI-032 to PBI-034] Sprint 5: Reminder list, resume upload, resume linking, email reminders"
git push origin feature/sprint-05-resume-reminders
```

Open a PR on GitHub: `feature/sprint-05-resume-reminders → develop`. Use the sprint goal as the PR title:

> **Sprint 5: Users can upload and version their resumes, link them to applications, view upcoming reminders in one place, and receive email notifications for due follow-ups.**

Merge to `develop`. Verify the Vercel preview. Then proceed to Sprint 6.

---

## Sprint Close Checklist

After the PR is merged to `develop`:

- [x] Mark all 5 PBIs `[x]` in `sprint-05.md`
- [x] Mark all 5 PBIs `[x]` in `product.md`
- [x] Complete `sprint-05.md` Sprint Review and Retrospective sections
- [x] Fill retro insight in `sprint-05.md` for LinkedIn
- [x] Commit updated docs directly to `develop`: `git commit -m "[DOCS] Sprint 5 close — update sprint-05.md, product.md"`
- [x] Update Notion Sprint Board: Sprint 5 → ✅ Closed, Sprint 6 → 🔄 In progress
- [x] Add Sprint 5 Changelog entry to Notion
- [x] `plan.md` Sprint Summary Table updated with close date
- [x] Phase 2 gate verified and date recorded in `plan.md`

---

_sprint-05-implementation.md — 26 May 2026 — HireFlow_
_Branch: `feature/sprint-05-resume-reminders`. Follow PBIs in dependency order. Run `npm run build` locally before every push. Pin all packages._
