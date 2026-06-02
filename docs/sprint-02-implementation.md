# HireFlow — Sprint 2 Implementation Guide

**Document Type:** Developer Implementation Reference
**Sprint:** 2 of 6
**Branch:** `feature/sprint-02-pipeline` (from `develop`)
**Status:** Ready to implement
**PBIs:** PBI-009 → PBI-010 → PBI-011 → PBI-012 → PBI-013 → PBI-016 → PBI-014 → PBI-015 → PBI-040

---

## Before You Write a Single Line of Code

### Step 1 — Commit pending control docs to `develop`

```bash
git checkout develop
git pull origin develop
git add docs/linkedin.md docs/plan.md docs/setup.md docs/spec.md
git add docs/sprints/sprint-01.md docs/sprints/sprint-02.md
git commit -m "[DOCS] Add Sprint 2 control documents and updated linkedin.md"
git push origin develop
```

### Step 2 — Create the Sprint 2 feature branch

```bash
git checkout -b feature/sprint-02-pipeline
git push -u origin feature/sprint-02-pipeline
```

All application code for this sprint goes on this branch. Control doc updates (marking PBIs `[x]`, logging daily notes) go directly to `develop`.

### Step 3 — Install the one new package

```bash
npm install @hello-pangea/dnd@18.0.1
```

> **Pin to 16.6.0 exactly** — do not use `@latest`. All other Sprint 2 dependencies (Prisma, Zod, react-hook-form) are already installed from Sprint 1.

### Step 4 — Verify baseline before adding any code

```bash
npm run build        # must pass clean
npx tsc --noEmit         # must pass clean
npm test             # must pass clean
```

If any of the three fail, fix before starting Sprint 2 work.

---

## Critical Rules Carried Forward From Sprint 1

These bit you in Sprint 1. Do not repeat them.

| Rule                                                      | Why                              |
| --------------------------------------------------------- | -------------------------------- |
| `npm run build` locally before every Vercel push          | 9 deployments wasted in Sprint 1 |
| Never `@latest` — all packages pinned                     | Cascading version conflicts      |
| Prisma import: `from '@prisma/client'`                    | v5.22.0 — not the v7 path        |
| No `prisma.config.ts` — v5 does not use it                | Delete if it appears             |
| `DATABASE_URL` = pooled Neon string, no `channel_binding` | Runtime queries                  |
| `DIRECT_URL` = direct Neon string                         | Migrations only                  |
| `middleware.ts` at project root, not `proxy.ts`           | Next.js 15 convention            |
| `jose` in API routes only — Web Crypto in middleware      | Edge runtime constraint          |
| `@import "tailwindcss"` in globals.css                    | Tailwind v4                      |

---

## Directory Structure After Sprint 2

New files and directories this sprint creates (additions to the Sprint 1 structure):

```
hireFlow/
├── app/
│   ├── api/
│   │   └── applications/
│   │       ├── route.ts                  ← GET all, POST create
│   │       └── [id]/
│   │           └── route.ts              ← GET one, PATCH edit, DELETE soft-delete
│   ├── dashboard/
│   │   ├── page.tsx                      ← Updated: list view + Kanban toggle
│   │   └── applications/
│   │       └── [id]/
│   │           └── page.tsx              ← Application detail page (PBI-016)
├── components/
│   ├── ApplicationCard.tsx               ← Card used in list and Kanban
│   ├── ApplicationForm.tsx               ← Shared add/edit form (PBI-010, PBI-012)
│   ├── ApplicationList.tsx               ← List/card view (PBI-011)
│   ├── KanbanBoard.tsx                   ← 6-column Kanban (PBI-014)
│   ├── KanbanColumn.tsx                  ← Single column with droppable
│   └── DeleteButton.tsx                  ← Soft-delete with confirm (PBI-013)
├── lib/
│   └── schemas/
│       ├── auth.ts                       ← Existing
│       └── application.ts               ← New: Zod schema for Application (PBI-009)
└── prisma/
    └── schema.prisma                     ← Updated: Application model added (PBI-009)
```

---

## Environment Variables

No new environment variables are required for Sprint 2. All existing Sprint 1 variables carry forward unchanged.

`.env.local` (unchanged):

```
DATABASE_URL=<pooled Neon string — no channel_binding=require>
DIRECT_URL=<direct Neon string>
JWT_SECRET=<min 32 chars>
NEXTAUTH_URL=<your Vercel preview URL>
NEXTAUTH_SECRET=<random secret>
```

---

## PBI-009 — Application Data Model

**Goal:** Add the `Application` model to the Prisma schema and run the migration.

### Step 1 — Update `prisma/schema.prisma`

Add the `Application` model below the existing `User` model. Also add the relation back-reference on `User`.

```prisma
// prisma/schema.prisma

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
}

model Application {
  id           String            @id @default(cuid())
  userId       String
  user         User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Job details
  company      String
  role         String
  location     String?
  salary       String?
  jobUrl       String?

  // Pipeline stage
  stage        ApplicationStage  @default(APPLIED)

  // Tracking
  appliedAt    DateTime          @default(now())
  followUpAt   DateTime?
  notes        String?

  // Soft delete
  deletedAt    DateTime?

  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  @@index([userId])
  @@index([userId, stage])
  @@index([userId, deletedAt])
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

**Key decisions:**

- `stage` uses a Prisma `enum` — the 6 pipeline stages are enforced at the DB level, not just application level
- `deletedAt` is `DateTime?` — null means active, a timestamp means soft-deleted (PBI-013)
- `salary` is `String?` not `Decimal` — salary formats vary (ranges, currencies, "competitive") and String avoids parsing complexity
- `location` and `jobUrl` are optional — not every application will have these
- `@@index([userId, deletedAt])` — the most common query is "all active applications for user" — this index makes it fast

### Step 2 — Run the migration

```bash
npx prisma migrate dev --name add-application-model
```

Expected output:

```
✔ Generated Prisma Client
The following migration was created: prisma/migrations/TIMESTAMP_add_application_model/migration.sql
```

### Step 3 — Verify in Prisma Studio

```bash
npx prisma studio
```

Confirm: `Application` table exists with all columns. `ApplicationStage` enum shows 6 values.

### Step 4 — Create the Zod schema

Create `lib/schemas/application.ts`:

```typescript
// lib/schemas/application.ts
import { z } from "zod";
import { ApplicationStage } from "@prisma/client";

export const createApplicationSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().optional(),
  salary: z.string().optional(),
  jobUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  followUpAt: z.string().optional(), // ISO date string from date input
  notes: z.string().optional(),
});

export const updateApplicationSchema = createApplicationSchema.extend({
  stage: z.nativeEnum(ApplicationStage).optional(),
});

export const updateStageSchema = z.object({
  stage: z.nativeEnum(ApplicationStage),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;
```

### Step 5 — Verify TypeScript

```bash
npx tsc --noEmit
```

Must pass clean before moving to PBI-010.

### DoD check

| Confirmed | How                                                                                                                                                                                                         | Item                                                                            |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [x]       | `npx prisma studio` — open in browser, confirm `Application` table exists with all columns and `ApplicationStage` enum shows 6 values: `APPLIED`, `SCREENING`, `INTERVIEW`, `ASSESSMENT`, `OFFER`, `CLOSED` | `prisma/schema.prisma` contains `Application` model and `ApplicationStage` enum |
| [x]       | File tree — confirm `prisma/migrations/` contains a folder named `TIMESTAMP_add_application_model` with `migration.sql` inside                                                                              | Migration file committed to `prisma/migrations/`                                |
| [x]       | `npx prisma studio` — confirm `Application` table is present and selectable                                                                                                                                 | `npx prisma studio` shows `Application` table                                   |
| [x]       | File tree — confirm `lib/schemas/application.ts` exists and contains `createApplicationSchema`, `updateApplicationSchema`, `updateStageSchema` and their inferred types                                     | `lib/schemas/application.ts` created with all three schemas and types           |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                                                                                                                                 | TypeScript clean                                                                |

---

## PBI-010 — Add New Application

**Goal:** API route `POST /api/applications` + Add Application form + page.

### Step 1 — Create the API route

Create `app/api/applications/route.ts`:

```typescript
// app/api/applications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createApplicationSchema } from "@/lib/schemas/application";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { company, role, location, salary, jobUrl, followUpAt, notes } =
      result.data;

    const application = await prisma.application.create({
      data: {
        userId: user.userId,
        company,
        role,
        location: location || null,
        salary: salary || null,
        jobUrl: jobUrl || null,
        followUpAt: followUpAt ? new Date(followUpAt) : null,
        notes: notes || null,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("[POST /api/applications]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Step 2 — Create the auth helper

Create `lib/auth.ts` — this extracts the userId from the JWT cookie for use in API routes. Note: API routes run on Node.js runtime so `jose` is safe here (unlike middleware).

```typescript
// lib/auth.ts
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

interface JWTPayload {
  userId: string;
  email: string;
}

export async function getUserFromRequest(
  request: NextRequest,
): Promise<JWTPayload | null> {
  const token = request.cookies.get("hireFlow-token")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}
```

### Step 3 — Create the ApplicationForm component

Create `components/ApplicationForm.tsx`:

```typescript
// components/ApplicationForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  createApplicationSchema,
  CreateApplicationInput,
} from "@/lib/schemas/application";

interface ApplicationFormProps {
  mode:          "create" | "edit";
  applicationId?: string;
  defaultValues?: Partial<CreateApplicationInput>;
  onSuccess?:    () => void;
}

export default function ApplicationForm({
  mode,
  applicationId,
  defaultValues,
  onSuccess,
}: ApplicationFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateApplicationInput>({
    resolver: zodResolver(createApplicationSchema),
    defaultValues,
  });

  const onSubmit = async (data: CreateApplicationInput) => {
    const url    = mode === "create"
      ? "/api/applications"
      : `/api/applications/${applicationId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });

    if (res.ok) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company <span className="text-red-500">*</span>
        </label>
        <input
          {...register("company")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Acme Corp"
        />
        {errors.company && (
          <p className="mt-1 text-xs text-red-600">{errors.company.message}</p>
        )}
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role <span className="text-red-500">*</span>
        </label>
        <input
          {...register("role")}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Senior Frontend Engineer"
        />
        {errors.role && (
          <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
        )}
      </div>

      {/* Location + Salary (two-column) */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            {...register("location")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Remote / London"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salary
          </label>
          <input
            {...register("salary")}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="£60,000 – £80,000"
          />
        </div>
      </div>

      {/* Job URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Job URL
        </label>
        <input
          {...register("jobUrl")}
          type="url"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="https://..."
        />
        {errors.jobUrl && (
          <p className="mt-1 text-xs text-red-600">{errors.jobUrl.message}</p>
        )}
      </div>

      {/* Follow-up date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Follow-up Date
        </label>
        <input
          {...register("followUpAt")}
          type="date"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          {...register("notes")}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Recruiter name, interview format, anything relevant..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium
                     text-white hover:bg-indigo-700 disabled:opacity-50
                     focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {isSubmitting
            ? "Saving…"
            : mode === "create"
            ? "Add Application"
            : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium
                     text-gray-700 hover:bg-gray-50 focus:outline-none
                     focus:ring-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

### Step 4 — Create the Add Application page

Create `app/dashboard/applications/new/page.tsx`:

```typescript
// app/dashboard/applications/new/page.tsx
import ApplicationForm from "@/components/ApplicationForm";

export default function NewApplicationPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add Application</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track a new job application in your pipeline.
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <ApplicationForm mode="create" />
      </div>
    </main>
  );
}
```

### DoD check

| Confirmed | How                                                                                         | Item                                                                   |
| --------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [x]       | `npm test`                                                                                  | `POST /api/applications` returns 201 with the created application      |
| [x]       | `npm test`                                                                                  | `POST /api/applications` returns 400 on validation failure             |
| [x]       | Browser — log out, navigate to `/dashboard/applications/new`, confirm redirect to `/login`  | `POST /api/applications` returns 401 without valid session             |
| [x]       | File tree                                                                                   | `lib/auth.ts` created with `getUserFromRequest`                        |
| [x]       | Browser — log in, go to `/dashboard/applications/new`, submit empty form, submit valid form | Form renders all fields, shows validation errors, submits successfully |
| [x]       | `npx tsc --noEmit`                                                                          | `npx tsc --noEmit`clean                                                |

---

## PBI-011 — View All Applications

**Goal:** `GET /api/applications` returns active applications for the logged-in user. Dashboard renders them as cards.

### Step 1 — Add GET handler to the API route

Add to `app/api/applications/route.ts` (below the POST handler):

```typescript
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.application.findMany({
      where: {
        userId: user.userId,
        deletedAt: null, // exclude soft-deleted
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("[GET /api/applications]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Step 2 — Create the ApplicationCard component

Create `components/ApplicationCard.tsx`:

```typescript
// components/ApplicationCard.tsx
import Link from "next/link";
import { Application, ApplicationStage } from "@prisma/client";

const stageColours: Record<ApplicationStage, string> = {
  APPLIED:    "bg-blue-100   text-blue-800",
  SCREENING:  "bg-yellow-100 text-yellow-800",
  INTERVIEW:  "bg-purple-100 text-purple-800",
  ASSESSMENT: "bg-orange-100 text-orange-800",
  OFFER:      "bg-green-100  text-green-800",
  CLOSED:     "bg-gray-100   text-gray-600",
};

const stageLabels: Record<ApplicationStage, string> = {
  APPLIED:    "Applied",
  SCREENING:  "Screening",
  INTERVIEW:  "Interview",
  ASSESSMENT: "Assessment",
  OFFER:      "Offer",
  CLOSED:     "Closed",
};

interface ApplicationCardProps {
  application: Application;
}

export default function ApplicationCard({ application }: ApplicationCardProps) {
  const isOverdue =
    application.followUpAt &&
    new Date(application.followUpAt) < new Date() &&
    application.stage !== "CLOSED";

  return (
    <Link
      href={`/dashboard/applications/${application.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm
                 hover:border-indigo-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">{application.role}</p>
          <p className="truncate text-sm text-gray-500">{application.company}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium
                      ${stageColours[application.stage]}`}
        >
          {stageLabels[application.stage]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
        {application.location && <span>{application.location}</span>}
        {application.salary   && <span>{application.salary}</span>}
        {isOverdue && (
          <span className="font-medium text-red-600">⚠ Follow-up overdue</span>
        )}
      </div>
    </Link>
  );
}
```

### Step 3 — Create the ApplicationList component

Create `components/ApplicationList.tsx`:

```typescript
// components/ApplicationList.tsx
"use client";

import { Application } from "@prisma/client";
import ApplicationCard from "./ApplicationCard";
import Link from "next/link";

interface ApplicationListProps {
  applications: Application[];
}

export default function ApplicationList({ applications }: ApplicationListProps) {
  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No applications yet.</p>
        <Link
          href="/dashboard/applications/new"
          className="mt-3 inline-block text-sm font-medium text-indigo-600
                     hover:text-indigo-500"
        >
          Add your first application →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {applications.map((app) => (
        <ApplicationCard key={app.id} application={app} />
      ))}
    </div>
  );
}
```

### Step 4 — Update the dashboard page

Replace `app/dashboard/page.tsx` with a server component that fetches applications:

```typescript
// app/dashboard/page.tsx
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApplicationList from "@/components/ApplicationList";
import Link from "next/link";

async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("hireFlow-token")?.value;
  if (!token) redirect("/login");

  try {
    const secret  = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch {
    redirect("/login");
  }
}

export default async function DashboardPage() {
  const userId = await getCurrentUserId();

  const applications = await prisma.application.findMany({
    where:   { userId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {applications.length === 0
              ? "No applications yet"
              : `${applications.length} application${applications.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/dashboard/applications/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium
                     text-white hover:bg-indigo-700 focus:outline-none
                     focus:ring-2 focus:ring-indigo-500"
        >
          + Add Application
        </Link>
      </div>

      {/* List view */}
      <ApplicationList applications={applications} />
    </main>
  );
}
```

### DoD check

| Confirmed | How                                                                                                                                                              | Item                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [x]       | `npm test`                                                                                                                                                       | `GET /api/applications` returns only active (non-deleted) applications for the logged-in user |
| [x]       | `npm test`                                                                                                                                                       | `GET /api/applications` returns 401 without a valid session                                   |
| [x]       | Browser — log in, go to `/dashboard`, confirm application cards are visible                                                                                      | Dashboard renders application cards                                                           |
| [x]       | Browser — log in with an account that has no applications, go to `/dashboard`, confirm "No applications yet" and "Add your first application" text appears       | Empty state shown when no applications exist                                                  |
| [x]       | Browser — click any application card on `/dashboard`, confirm it navigates to `/dashboard/applications/[id]`                                                     | Each card links to the detail page                                                            |
| [x]       | Browser — create an application with a follow-up date set to yesterday, go to `/dashboard`, confirm the red "⚠ Follow-up overdue" indicator appears on that card | Overdue follow-up indicator appears when `followUpAt` is past                                 |

---

## PBI-012 — Edit Application

**Goal:** `PATCH /api/applications/[id]` + Edit form reachable from the detail page.

### Step 1 — Create the `[id]` route

Create `app/api/applications/[id]/route.ts`:

```typescript
// app/api/applications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  updateApplicationSchema,
  updateStageSchema,
} from "@/lib/schemas/application";
import { getUserFromRequest } from "@/lib/auth";

// Shared ownership check
async function getOwnedApplication(userId: string, id: string) {
  return prisma.application.findFirst({
    where: { id, userId, deletedAt: null },
  });
}

// GET single application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getUserFromRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const application = await getOwnedApplication(user.userId, id);
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(application);
}

// PATCH — edit application details or stage
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const application = await getOwnedApplication(user.userId, id);
    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();

    // Stage-only update (from Kanban drag-and-drop)
    if (Object.keys(body).length === 1 && body.stage) {
      const result = updateStageSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: result.error.flatten().fieldErrors,
          },
          { status: 400 },
        );
      }
      const updated = await prisma.application.update({
        where: { id },
        data: { stage: result.data.stage },
      });
      return NextResponse.json(updated);
    }

    // Full field update
    const result = updateApplicationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const {
      company,
      role,
      location,
      salary,
      jobUrl,
      followUpAt,
      notes,
      stage,
    } = result.data;

    const updated = await prisma.application.update({
      where: { id },
      data: {
        company,
        role,
        location: location ?? null,
        salary: salary ?? null,
        jobUrl: jobUrl ?? null,
        followUpAt: followUpAt ? new Date(followUpAt) : null,
        notes: notes ?? null,
        ...(stage ? { stage } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/applications/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Step 2 — Create the Edit page

Create `app/dashboard/applications/[id]/edit/page.tsx`:

```typescript
// app/dashboard/applications/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApplicationForm from "@/components/ApplicationForm";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditApplicationPage({ params }: EditPageProps) {
  const { id } = await params;

  // Get userId from cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("hireFlow-token")?.value;
  if (!token) redirect("/login");

  let userId: string;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    userId = payload.userId as string;
  } catch {
    redirect("/login");
  }

  const application = await prisma.application.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!application) notFound();

  const defaultValues = {
    company:    application.company,
    role:       application.role,
    location:   application.location   ?? undefined,
    salary:     application.salary     ?? undefined,
    jobUrl:     application.jobUrl     ?? undefined,
    followUpAt: application.followUpAt
      ? application.followUpAt.toISOString().split("T")[0]
      : undefined,
    notes:      application.notes      ?? undefined,
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Application</h1>
        <p className="mt-1 text-sm text-gray-500">
          {application.role} at {application.company}
        </p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <ApplicationForm
          mode="edit"
          applicationId={id}
          defaultValues={defaultValues}
        />
      </div>
    </main>
  );
}
```

### DoD check

| Confirmed | How                | Item                                                                    |
| --------- | ------------------ | ----------------------------------------------------------------------- |
| [x]       | `npm test`         | `PATCH /api/applications/[id]` returns 200 and the updated application  |
| [x]       | `npm test`         | `PATCH /api/applications/[id]` returns 401 without a valid session      |
| [x]       | `npm test`         | `PATCH /api/applications/[id]` returns 404 when not found or wrong user |
| [x]       | `npm test`         | Stage-only `PATCH` validates with `updateStageSchema` — returns 200     |
| [x]       | Browser            | Edit page pre-fills form with existing values                           |
| [x]       | `npx tsc --noEmit` | TypeScript clean                                                        |

---

## PBI-013 — Delete Application (Soft Delete)

**Goal:** `DELETE /api/applications/[id]` sets `deletedAt` — does not remove the row.

### Step 1 — Add DELETE handler to `app/api/applications/[id]/route.ts`

Add below the PATCH handler:

```typescript
// DELETE — soft delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const application = await getOwnedApplication(user.userId, id);
    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.application.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Application deleted" });
  } catch (error) {
    console.error("[DELETE /api/applications/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Step 2 — Create the DeleteButton component

Create `components/DeleteButton.tsx`:

```typescript
// components/DeleteButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  applicationId: string;
  label?:        string;
}

export default function DeleteButton({
  applicationId,
  label = "Delete",
}: DeleteButtonProps) {
  const router              = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading,    setLoading]    = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Are you sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium
                     text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm
                     font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="rounded-md border border-red-300 px-3 py-1.5 text-sm
                 font-medium text-red-600 hover:bg-red-50"
    >
      {label}
    </button>
  );
}
```

### DoD check

| Confirmed | How                                                                                                                                                                                           | Item                                                                                              |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [ ]       | `npm test`                                                                                                                                                                                    | `DELETE /api/applications/[id]` returns 200 and sets `deletedAt`                                  |
| [ ]       | `npm test`                                                                                                                                                                                    | `DELETE /api/applications/[id]` returns 401 without a valid session                               |
| [ ]       | `npm test`                                                                                                                                                                                    | `DELETE /api/applications/[id]` returns 404 when application not found or belongs to another user |
| [ ]       | Browser — open any application detail page, click **Delete**, confirm "Are you sure?" text appears along with **Yes, delete** and **Cancel** buttons                                          | `DeleteButton` shows confirmation step before deleting                                            |
| [ ]       | Browser — open any application detail page, click **Delete**, click **Cancel**, confirm the original **Delete** button reappears and the application is unchanged                             | Cancel returns to initial state without deleting                                                  |
| [ ]       | Browser — open any application detail page, click **Delete**, click **Yes, delete**, confirm you land on `/dashboard` and the deleted application is no longer in the list                    | After delete, user is redirected to `/dashboard` and application is removed from list             |
| [ ]       | Browser — open an application detail page and copy the ID from the URL before deleting. Delete the application. Navigate to `/dashboard/applications/[copied-id]`, confirm the page shows 404 | Soft-deleted applications do not appear in any GET query                                          |

---

## PBI-016 — Application Detail Page

**Goal:** A full detail view for a single application, with links to Edit and Delete.

Create `app/dashboard/applications/[id]/page.tsx`:

```typescript
// app/dashboard/applications/[id]/page.tsx
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import { ApplicationStage } from "@prisma/client";

const stageLabels: Record<ApplicationStage, string> = {
  APPLIED:    "Applied",
  SCREENING:  "Screening",
  INTERVIEW:  "Interview",
  ASSESSMENT: "Assessment",
  OFFER:      "Offer",
  CLOSED:     "Closed",
};

const stageColours: Record<ApplicationStage, string> = {
  APPLIED:    "bg-blue-100   text-blue-800",
  SCREENING:  "bg-yellow-100 text-yellow-800",
  INTERVIEW:  "bg-purple-100 text-purple-800",
  ASSESSMENT: "bg-orange-100 text-orange-800",
  OFFER:      "bg-green-100  text-green-800",
  CLOSED:     "bg-gray-100   text-gray-600",
};

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: DetailPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("hireFlow-token")?.value;
  if (!token) redirect("/login");

  let userId: string;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    userId = payload.userId as string;
  } catch {
    redirect("/login");
  }

  const application = await prisma.application.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!application) notFound();

  const isOverdue =
    application.followUpAt &&
    new Date(application.followUpAt) < new Date() &&
    application.stage !== "CLOSED";

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center text-sm text-gray-500
                   hover:text-gray-700"
      >
        ← Back to dashboard
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {application.role}
          </h1>
          <p className="mt-1 text-gray-500">{application.company}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium
                      ${stageColours[application.stage]}`}
        >
          {stageLabels[application.stage]}
        </span>
      </div>

      {/* Details card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <dl className="divide-y divide-gray-100">
          {[
            { label: "Location",    value: application.location },
            { label: "Salary",      value: application.salary },
            {
              label: "Job URL",
              value: application.jobUrl ? (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 underline hover:text-indigo-500"
                >
                  View posting
                </a>
              ) : null,
            },
            {
              label: "Follow-up",
              value: application.followUpAt
                ? new Date(application.followUpAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })
                : null,
            },
            {
              label: "Applied",
              value: new Date(application.appliedAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
              }),
            },
          ]
            .filter((row) => row.value)
            .map((row) => (
              <div key={row.label} className="flex py-3 text-sm">
                <dt className="w-32 shrink-0 font-medium text-gray-500">
                  {row.label}
                </dt>
                <dd className="text-gray-900">{row.value}</dd>
              </div>
            ))}
        </dl>

        {isOverdue && (
          <div className="mt-4 rounded-md bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              ⚠ Follow-up is overdue. Consider reaching out.
            </p>
          </div>
        )}

        {application.notes && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <p className="mb-1 text-sm font-medium text-gray-500">Notes</p>
            <p className="whitespace-pre-wrap text-sm text-gray-900">
              {application.notes}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-3">
        <Link
          href={`/dashboard/applications/${id}/edit`}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium
                     text-white hover:bg-indigo-700"
        >
          Edit
        </Link>
        <DeleteButton applicationId={id} />
      </div>
    </main>
  );
}
```

### DoD check

| Confirmed | How                                                                                                                                                                                                   | Item                                                               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [ ]       | Browser — open any application card from `/dashboard`, confirm role, company, location, salary, job URL, follow-up date, applied date, and notes all display correctly                                | Detail page renders all application fields                         |
| [ ]       | Browser — create an application with a follow-up date set to yesterday, open its detail page, confirm the red "⚠ Follow-up is overdue" banner appears                                                 | Overdue follow-up banner appears when `followUpAt` is in the past  |
| [ ]       | Browser — open any application detail page, click **Edit**, confirm it navigates to `/dashboard/applications/[id]/edit`                                                                               | Edit button links to the edit page                                 |
| [ ]       | Browser — open any application detail page, click **Delete**, click **Yes, delete**, confirm you land on `/dashboard` and the application is no longer in the list                                    | Delete button triggers soft-delete with confirmation and redirects |
| [ ]       | Browser — type `/dashboard/applications/thisisafakeid` directly in the address bar, confirm Next.js 404 page is shown                                                                                 | 404 shown for non-existent application ID                          |
| [ ]       | Browser — open an application detail page and copy the ID from the URL. Delete that application. Paste the copied URL back into the address bar and navigate to it. Confirm Next.js 404 page is shown | 404 shown for soft-deleted application                             |
| [ ]       | `npx tsc --noEmit` passes clean in terminal                                                                                                                                                           | TypeScript clean                                                   |

---

## PBI-014 — 6-Stage Kanban Pipeline View

**Goal:** A Kanban board with 6 columns, one per pipeline stage. Applications appear as cards in their current stage column.

### Step 1 — Create KanbanColumn

Create `components/KanbanColumn.tsx`:

```typescript
// components/KanbanColumn.tsx
import { Droppable } from "@hello-pangea/dnd";
import { Application, ApplicationStage } from "@prisma/client";
import KanbanCard from "./KanbanCard";

const stageColours: Record<ApplicationStage, string> = {
  APPLIED:    "border-blue-200   bg-blue-50",
  SCREENING:  "border-yellow-200 bg-yellow-50",
  INTERVIEW:  "border-purple-200 bg-purple-50",
  ASSESSMENT: "border-orange-200 bg-orange-50",
  OFFER:      "border-green-200  bg-green-50",
  CLOSED:     "border-gray-200   bg-gray-50",
};

const stageLabels: Record<ApplicationStage, string> = {
  APPLIED:    "Applied",
  SCREENING:  "Screening",
  INTERVIEW:  "Interview",
  ASSESSMENT: "Assessment",
  OFFER:      "Offer",
  CLOSED:     "Closed",
};

interface KanbanColumnProps {
  stage:        ApplicationStage;
  applications: Application[];
}

export default function KanbanColumn({ stage, applications }: KanbanColumnProps) {
  return (
    <div className="flex min-w-55 flex-col rounded-lg border bg-white shadow-sm">
      {/* Column header */}
      <div
        className={`rounded-t-lg border-b px-3 py-2.5 ${stageColours[stage]}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">
            {stageLabels[stage]}
          </span>
          <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500 shadow-sm">
            {applications.length}
          </span>
        </div>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-1 flex-col gap-2 p-2 transition-colors
                        ${snapshot.isDraggingOver ? "bg-indigo-50" : ""}`}
            style={{ minHeight: 120 }}
          >
            {applications.map((app, index) => (
              <KanbanCard key={app.id} application={app} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
```

### Step 2 — Create KanbanCard

Create `components/KanbanCard.tsx`:

```typescript
// components/KanbanCard.tsx
"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Application } from "@prisma/client";
import Link from "next/link";

interface KanbanCardProps {
  application: Application;
  index:       number;
}

export default function KanbanCard({ application, index }: KanbanCardProps) {
  const isOverdue =
    application.followUpAt &&
    new Date(application.followUpAt) < new Date() &&
    application.stage !== "CLOSED";

  return (
    <Draggable draggableId={application.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`rounded-md border bg-white p-3 shadow-sm
                      ${snapshot.isDragging
                        ? "shadow-lg ring-2 ring-indigo-400"
                        : "hover:border-indigo-300"}`}
        >
          <Link
            href={`/dashboard/applications/${application.id}`}
            onClick={(e) => snapshot.isDragging && e.preventDefault()}
          >
            <p className="text-sm font-medium text-gray-900 leading-tight">
              {application.role}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">{application.company}</p>
            {isOverdue && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                ⚠ Follow-up overdue
              </p>
            )}
          </Link>
        </div>
      )}
    </Draggable>
  );
}
```

### Step 3 — Create KanbanBoard

Create `components/KanbanBoard.tsx`:

```typescript
// components/KanbanBoard.tsx
"use client";

import { useState, useCallback } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Application, ApplicationStage } from "@prisma/client";
import KanbanColumn from "./KanbanColumn";

const STAGES: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "CLOSED",
];

interface KanbanBoardProps {
  initialApplications: Application[];
}

export default function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const [applications, setApplications] = useState(initialApplications);

  const getByStage = (stage: ApplicationStage) =>
    applications.filter((a) => a.stage === stage);

  const onDragEnd = useCallback(
    async (result: DropResult) => {
      const { draggableId, destination, source } = result;

      // Dropped outside a column or same position
      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      )
        return;

      const newStage = destination.droppableId as ApplicationStage;

      // Optimistic update
      setApplications((prev) =>
        prev.map((app) =>
          app.id === draggableId ? { ...app, stage: newStage } : app
        )
      );

      // Persist to API
      try {
        const res = await fetch(`/api/applications/${draggableId}`, {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ stage: newStage }),
        });

        if (!res.ok) {
          // Revert on failure
          setApplications((prev) =>
            prev.map((app) =>
              app.id === draggableId
                ? { ...app, stage: source.droppableId as ApplicationStage }
                : app
            )
          );
        }
      } catch {
        // Revert on network error
        setApplications((prev) =>
          prev.map((app) =>
            app.id === draggableId
              ? { ...app, stage: source.droppableId as ApplicationStage }
              : app
          )
        );
      }
    },
    []
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            applications={getByStage(stage)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
```

### Step 4 — Add Kanban view toggle to dashboard

Update `app/dashboard/page.tsx` to support both list and Kanban views:

```typescript
// app/dashboard/page.tsx  — replace the existing file entirely
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";

async function getCurrentUserId(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("hireFlow-token")?.value;
  if (!token) redirect("/login");
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.userId as string;
  } catch {
    redirect("/login");
  }
}

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  const applications = await prisma.application.findMany({
    where:   { userId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });

  return <DashboardClient initialApplications={applications} />;
}
```

Create `components/DashboardClient.tsx`:

```typescript
// components/DashboardClient.tsx
"use client";

import { useState } from "react";
import { Application } from "@prisma/client";
import Link from "next/link";
import ApplicationList from "./ApplicationList";
import KanbanBoard from "./KanbanBoard";

interface DashboardClientProps {
  initialApplications: Application[];
}

type ViewMode = "list" | "kanban";

export default function DashboardClient({
  initialApplications,
}: DashboardClientProps) {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Applications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {initialApplications.length === 0
              ? "No applications yet"
              : `${initialApplications.length} application${
                  initialApplications.length === 1 ? "" : "s"
                }`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex rounded-md border border-gray-300 bg-white">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-sm font-medium rounded-l-md transition-colors
                          ${view === "list"
                            ? "bg-indigo-600 text-white"
                            : "text-gray-600 hover:bg-gray-50"}`}
            >
              List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 text-sm font-medium rounded-r-md transition-colors
                          ${view === "kanban"
                            ? "bg-indigo-600 text-white"
                            : "text-gray-600 hover:bg-gray-50"}`}
            >
              Kanban
            </button>
          </div>
          <Link
            href="/dashboard/applications/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium
                       text-white hover:bg-indigo-700"
          >
            + Add Application
          </Link>
        </div>
      </div>

      {/* View */}
      {view === "list" ? (
        <ApplicationList applications={initialApplications} />
      ) : (
        <KanbanBoard initialApplications={initialApplications} />
      )}
    </main>
  );
}
```

### DoD check

- [x] Kanban board renders all 6 columns
- [x] Applications appear in the correct column based on their stage
- [x] Column headers show the application count
- [x] List/Kanban toggle works
- [x] `tsc --noEmit` clean

---

## PBI-015 — Drag-and-Drop Stage Progression

This is already implemented inside `KanbanBoard.tsx` above. The key behaviours to verify:

**Optimistic update pattern:**

1. User drops card in new column
2. UI updates immediately (no wait)
3. `PATCH /api/applications/[id]` fires in background
4. If API fails → UI reverts to original stage
5. If API succeeds → state is already correct

**Edge cases handled:**

- Drop in same column → no-op (early return)
- Same position in same column → no-op
- Network error during persist → revert
- Non-200 response → revert
- Card click during drag → `preventDefault` on link

**Overflow rule from sprint-02.md:**
If drag-and-drop is causing mid-sprint slippage, replace `KanbanBoard.tsx` with a stage dropdown on the `ApplicationCard`. The `PATCH /api/applications/[id]` route already handles stage-only updates — only the UI needs changing. This can be done in under 30 minutes.

**Stage dropdown fallback (implement only if PBI-015 overflows):**

```typescript
// Add to ApplicationCard.tsx — replaces Draggable
"use client";
import { ApplicationStage } from "@prisma/client";
import { useRouter } from "next/navigation";

const stageLabels: Record<ApplicationStage, string> = {
  APPLIED: "Applied", SCREENING: "Screening", INTERVIEW: "Interview",
  ASSESSMENT: "Assessment", OFFER: "Offer", CLOSED: "Closed",
};

function StageDropdown({ id, currentStage }: { id: string; currentStage: ApplicationStage }) {
  const router = useRouter();
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: e.target.value }),
    });
    router.refresh();
  };
  return (
    <select
      defaultValue={currentStage}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      className="mt-2 text-xs rounded border border-gray-200 px-1 py-0.5"
    >
      {Object.entries(stageLabels).map(([value, label]) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  );
}
```

### DoD check

- [x] Dragging a card to a new column updates its stage in the DB
- [x] Optimistic update gives instant visual feedback
- [x] Failed API calls revert the card to its original column
- [x] Dropping in the same column does nothing
- [x] Cards are still clickable (link to detail page) when not being dragged

---

## PBI-040 — RTL Core Component Suite

**Goal:** RTL tests for the core Sprint 2 components. Tests are written alongside each component — not at the end.

### Setup check

Confirm Jest and RTL are configured from Sprint 1:

```bash
npm test -- --passWithNoTests
```

Must output `Test Suites: 0 passed` or show existing Sprint 1 tests passing.

### Test file locations

```
__tests__/
├── ApplicationForm.test.tsx
├── ApplicationList.test.tsx
├── ApplicationCard.test.tsx
├── DeleteButton.test.tsx
└── KanbanBoard.test.tsx
```

### ApplicationForm tests

Create `__tests__/ApplicationForm.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ApplicationForm from "@/components/ApplicationForm";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

describe("ApplicationForm", () => {
  it("renders all required fields", () => {
    render(<ApplicationForm mode="create" />);
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add application/i })).toBeInTheDocument();
  });

  it("shows validation error when company is empty", async () => {
    render(<ApplicationForm mode="create" />);
    fireEvent.click(screen.getByRole("button", { name: /add application/i }));
    await waitFor(() => {
      expect(screen.getByText(/company name is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error when role is empty", async () => {
    render(<ApplicationForm mode="create" />);
    await userEvent.type(screen.getByLabelText(/company/i), "Acme");
    fireEvent.click(screen.getByRole("button", { name: /add application/i }));
    await waitFor(() => {
      expect(screen.getByText(/role is required/i)).toBeInTheDocument();
    });
  });

  it("shows validation error for invalid URL", async () => {
    render(<ApplicationForm mode="create" />);
    await userEvent.type(screen.getByLabelText(/company/i), "Acme");
    await userEvent.type(screen.getByLabelText(/role/i), "Engineer");
    await userEvent.type(screen.getByLabelText(/job url/i), "not-a-url");
    fireEvent.click(screen.getByRole("button", { name: /add application/i }));
    await waitFor(() => {
      expect(screen.getByText(/valid url/i)).toBeInTheDocument();
    });
  });

  it("submits successfully with valid data", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    render(<ApplicationForm mode="create" />);
    await userEvent.type(screen.getByLabelText(/company/i), "Acme Corp");
    await userEvent.type(screen.getByLabelText(/role/i), "Senior Engineer");
    fireEvent.click(screen.getByRole("button", { name: /add application/i }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/applications",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  it("shows 'Save Changes' button in edit mode", () => {
    render(
      <ApplicationForm
        mode="edit"
        applicationId="test-id"
        defaultValues={{ company: "Acme", role: "Engineer" }}
      />
    );
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });
});
```

### DeleteButton tests

Create `__tests__/DeleteButton.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DeleteButton from "@/components/DeleteButton";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

describe("DeleteButton", () => {
  it("renders the delete button", () => {
    render(<DeleteButton applicationId="test-id" />);
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("shows confirmation step on first click", async () => {
    render(<DeleteButton applicationId="test-id" />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /yes, delete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("cancels and returns to initial state", () => {
    render(<DeleteButton applicationId="test-id" />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("calls DELETE endpoint on confirm", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    render(<DeleteButton applicationId="test-id" />);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, delete/i }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/applications/test-id",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});
```

### ApplicationList tests

Create `__tests__/ApplicationList.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import ApplicationList from "@/components/ApplicationList";
import { Application, ApplicationStage } from "@prisma/client";

const mockApp = (overrides?: Partial<Application>): Application => ({
  id:          "app-1",
  userId:      "user-1",
  company:     "Acme Corp",
  role:        "Senior Engineer",
  location:    "Remote",
  salary:      "£70k",
  jobUrl:      null,
  stage:       "APPLIED" as ApplicationStage,
  appliedAt:   new Date(),
  followUpAt:  null,
  notes:       null,
  deletedAt:   null,
  createdAt:   new Date(),
  updatedAt:   new Date(),
  ...overrides,
});

describe("ApplicationList", () => {
  it("shows empty state when no applications", () => {
    render(<ApplicationList applications={[]} />);
    expect(screen.getByText(/no applications yet/i)).toBeInTheDocument();
    expect(screen.getByText(/add your first application/i)).toBeInTheDocument();
  });

  it("renders application cards", () => {
    render(<ApplicationList applications={[mockApp()]} />);
    expect(screen.getByText("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("renders multiple cards", () => {
    const apps = [
      mockApp({ id: "1", role: "Engineer" }),
      mockApp({ id: "2", role: "Designer", company: "Beta Inc" }),
    ];
    render(<ApplicationList applications={apps} />);
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("shows overdue indicator when followUpAt is past", () => {
    const pastDate = new Date(Date.now() - 86400000); // yesterday
    render(<ApplicationList applications={[mockApp({ followUpAt: pastDate })]} />);
    expect(screen.getByText(/follow-up overdue/i)).toBeInTheDocument();
  });
});
```

### Run the full test suite

```bash
npm test
```

All tests must pass before merging to `develop`.

### DoD check

- [x] `ApplicationForm` — 5 tests passing
- [x] `DeleteButton` — 4 tests passing
- [x] `ApplicationList` — 4 tests passing
- [x] `npm test` — all green, no failures
- [x] No `console.error` warnings in test output

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

# 4. Build (most important — catches issues Vercel will catch)
npm run build
```

All four must pass clean. Then:

```bash
# Push the feature branch
git add .
git commit -m "[PBI-009 to PBI-040] Sprint 2: Application pipeline complete"
git push origin feature/sprint-02-pipeline
```

Open a PR on GitHub: `feature/sprint-02-pipeline → develop`. Use the sprint goal as the PR title:

> **Sprint 2: A logged-in user can create, view, edit, delete, and progress job applications through a 6-stage Kanban pipeline.**

Merge to `develop`. Vercel will auto-deploy the preview. Test the live preview URL against each PBI's acceptance criteria.

---

## Sprint Close Checklist

After the PR is merged to `develop`:

- [x] Mark all 9 PBIs `[x]` in `sprint-02.md`
- [x] Mark all 9 PBIs `[x]` in `product.md`
- [x] Complete `sprint-02.md` Sprint Review and Retrospective sections
- [x] Fill LinkedIn Post 16 retro insight in `sprint-02.md`
- [x] Fill Sprint 2 Carousel (Post 17) slides 5 and 6
- [ ] Commit updated docs directly to `develop`: `git commit -m "[DOCS] Sprint 2 close — update sprint-02.md, product.md"`
- [ ] Update Notion Sprint Board: Sprint 2 → ✅ Closed, Sprint 3 → 🔄 In progress
- [ ] Add Sprint 2 Changelog entry to Notion
- [ ] Merge `develop` → `main` at Sprint 3 close (MVP gate), not now

---

_sprint-02-implementation.md — 22 April 2026 — HireFlow_
_Branch: `feature/sprint-02-pipeline`. Follow PBIs in dependency order. Run `npm run build` locally before every push. Pin all packages._
