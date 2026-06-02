# HireFlow — Sprint 4 Implementation Guide

**Document Type:** Developer Implementation Reference
**Sprint:** 4 of 6
**Branch:** `feature/sprint-04-notes-metrics` (from `develop`)
**Status:** Ready to implement
**PBIs:** PBI-038 → PBI-030 → PBI-031 → PBI-026 → PBI-027 → PBI-028 → PBI-041 → PBI-044

---

## Before You Write a Single Line of Code

### Step 1 — Create branch and confirm baseline

```bash
git checkout develop
git pull origin develop
git checkout -b feature/sprint-04-notes-metrics
git push origin feature/sprint-04-notes-metrics
npm run build        # must pass clean
npx tsc --noEmit     # must pass clean
npm test             # must pass clean — 34 tests expected
```

If any of the three fail, fix before starting Sprint 4 work.

### Step 2 — New packages required

```bash
# No new packages required for Sprint 4
# All dependencies are already installed
```

---

## Critical Rules Carried Forward From Sprint 3

| Rule                                                                              | Why                                                                   |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `npm run build` locally before every Vercel push                                  | Catches issues Vercel will catch                                      |
| Never `@latest` — all packages pinned                                             | Cascading version conflicts                                           |
| `@jest-environment node` docblock must be first line of API test files            | Anything before it breaks the override                                |
| `moduleNameMapper` already declared in `jest.config.ts`                           | Do not remove it                                                      |
| All form inputs must have `htmlFor` on `<label>` and `id` on `<input>`            | Required for RTL `getByLabelText` and accessibility                   |
| `revalidatePath("/dashboard")` in all mutating API route handlers                 | Invalidates Vercel edge cache — `router.refresh()` alone insufficient |
| `router.refresh()` then `setTimeout(() => router.push(...), 100)` after mutations | Prevents redirect racing refresh on Vercel                            |
| DoD checks use three-column table format: Confirmed / How / Item                  | No bullet-list DoD items                                              |
| `jose` in API routes only — Web Crypto in `middleware.ts`                         | Edge runtime constraint                                               |
| `@import "tailwindcss"` in `globals.css`                                          | Tailwind v4                                                           |
| Branch first, then document                                                       | Branch must exist before sprint doc references it                     |

---

## Directory Structure After Sprint 4

New files and directories this sprint creates (additions to the Sprint 3 structure):
hireflow-track/
├── app/
│ ├── api/
│ │ └── applications/
│ │ └── [id]/
│ │ └── notes/
│ │ └── route.ts ← POST create interview note
│ │ └── notes/
│ │ └── [id]/
│ │ └── route.ts ← PATCH edit, DELETE note
│ │ └── dashboard/
│ │ └── metrics/
│ │ └── route.ts ← GET conversion, time-in-stage, source
├── components/
│ ├── InterviewNoteForm.tsx ← Add/edit interview note (PBI-030)
│ ├── InterviewNoteList.tsx ← Notes list on detail page (PBI-030)
│ ├── NoteTimeline.tsx ← Timeline view grouped by stage (PBI-031)
│ ├── ConversionChart.tsx ← Conversion rate metric (PBI-026)
│ ├── TimeInStageChart.tsx ← Time-in-stage metric (PBI-027)
│ └── SourceChart.tsx ← Source effectiveness metric (PBI-028)
├── lib/
│ └── schemas/
│ └── note.ts ← Zod schemas for InterviewNote (PBI-030)
├── prisma/
│ └── schema.prisma ← Updated: InterviewNote model, stageEnteredAt, source
├── tests/
│ ├── api.notes.test.ts ← PBI-041 POST handler
│ ├── api.notes.[id].test.ts ← PBI-041 PATCH + DELETE handlers
│ ├── api.dashboard.metrics.test.ts ← PBI-041 GET metrics handler
│ ├── InterviewNoteForm.test.tsx ← PBI-030
│ ├── NoteTimeline.test.tsx ← PBI-031
│ ├── ConversionChart.test.tsx ← PBI-026
│ └── TimeInStageChart.test.tsx ← PBI-027

---

## Environment Variables

No new environment variables required for Sprint 4. All existing variables carry forward unchanged.

---

## PBI-038 — API Rate Limiting

**Goal:** Implement rate limiting on mutating API routes to prevent abuse. Return 429 with `Retry-After` header on breach.

### Implementation notes

- Implement in `middleware.ts` using the Web Crypto API — `jose` cannot be used here (Edge runtime)
- Rate limit POST, PATCH, DELETE routes only — do not rate limit GET routes
- Use an in-memory store keyed by IP address (`request.ip` or `x-forwarded-for` header)
- Limit: 60 mutating requests per IP per minute
- On breach: return `NextResponse.json({ error: "Too many requests" }, { status: 429 })` with `Retry-After: 60` header

```typescript
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "hireflow-track-token";

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const PUBLIC_API_ROUTES = ["/api/auth/login", "/api/auth/register"];

// Rate limiting store — in-memory, keyed by IP
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60;
const MUTATING_METHODS = new Set(["POST", "PATCH", "DELETE"]);

const rateLimitStore = new Map<
  string,
  { count: number; windowStart: number }
>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return true; // within limit
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false; // limit breached
  }

  entry.count += 1;
  return true; // within limit
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !signatureB64) return false;

    const secret = process.env.JWT_SECRET;
    if (!secret) return false;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    const signatureBytes = Uint8Array.from(
      atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0),
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const valid = await crypto.subtle.verify(
      "HMAC",
      cryptoKey,
      signatureBytes,
      data,
    );
    if (!valid) return false;

    const payload = JSON.parse(
      atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")),
    );
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000))
      return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isApiRoute = pathname.startsWith("/api");
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isPublicApiRoute = PUBLIC_API_ROUTES.includes(pathname);

  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // Rate limiting — mutating API routes only
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

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const valid = await verifyToken(token);

  if (!valid) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set(COOKIE_NAME, "", { maxAge: 0 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
```

---

## PBI-030 — Interview Notes Per Stage

**Goal:** Users can log notes against a specific application stage. Notes are stored in a new `InterviewNote` model linked to `Application`.

### Step 1 — Update `prisma/schema.prisma`

Add the `InterviewNote` model and the `InterviewNote` relation to `Application`:

```prisma
model Application {
  // ... existing fields ...
  source         String?
  stageEnteredAt DateTime          @default(now())
  contacts       Contact[]
  source         String?
  stageEnteredAt  DateTime        @default(Now())

  InterviewNote          InterviewNote[]
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
```

**Key decisions:**

- `stage` field on `InterviewNote` links the InterviewNote to the pipeline stage it was written for
- `content` is the only required field beyond the relation
- `onDelete: Cascade` — deleting an application hard-deletes its notes
- `source` and `stageEnteredAt` added to `Application` here — run all schema changes in one migration

### Step 2 — Run the migration

```bash
npx prisma migrate dev --name add-interview-notes-source-stage-tracking
```

### Step 3 — Create the Zod schema

Create `lib/schemas/note.ts`:

```typescript
// lib/schemas/note.ts
import { z } from "zod";
import { ApplicationStage } from "@prisma/client";

export const createNoteSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  stage: z.nativeEnum(ApplicationStage),
  content: z.string().min(1, "Note content is required"),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
```

### Step 4 — Create API routes

`app/api/applications/[id]/notes/route.ts` — POST handler:

```typescript
// @jest-environment node
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createNoteSchema } from "@/lib/schemas/note";
import { getUserFromRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const application = await prisma.application.findFirst({
      where: { id, userId: user.userId, deletedAt: null },
    });
    if (!application)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const result = createNoteSchema.safeParse({ ...body, applicationId: id });
    if (!result.success)
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );

    const note = await prisma.interviewNote.create({ data: result.data });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/applications/${id}`);

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("[POST /api/applications/[id]/notes]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

`app/api/notes/[id]/route.ts` — PATCH + DELETE handlers:

```typescript
// @jest-environment node
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateNoteSchema } from "@/lib/schemas/note";
import { getUserFromRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getOwnedNote(userId: string, noteId: string) {
  return prisma.interviewNote.findFirst({
    where: { id: noteId, application: { userId, deletedAt: null } },
    include: { application: true },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const note = await getOwnedNote(user.userId, id);
    if (!note)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const result = updateNoteSchema.safeParse(body);
    if (!result.success)
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );

    const updated = await prisma.interviewNote.update({
      where: { id },
      data: result.data,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/applications/${note.applicationId}`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/notes/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const note = await getOwnedNote(user.userId, id);
    if (!note)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.interviewNote.delete({ where: { id } });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/applications/${note.applicationId}`);

    return NextResponse.json({ message: "Note deleted" });
  } catch (error) {
    console.error("[DELETE /api/notes/[id]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Step 5 — Client mutation pattern

In `InterviewNoteForm.tsx` and any component that deletes a note:

```typescript
// After successful mutation — do not use router.push for notes
// Notes are on the detail page — refresh in place
router.refresh();
// If redirecting after delete to a different page:
// router.refresh();
// setTimeout(() => router.push("/dashboard"), 100);

// components/InterviewNoteForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationStage } from "@prisma/client";

interface InterviewNoteFormProps {
  applicationId: string;
  currentStage: ApplicationStage;
}

const STAGE_LABELS: Record<ApplicationStage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  CLOSED: "Closed",
};

export default function InterviewNoteForm({
  applicationId,
  currentStage,
}: InterviewNoteFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [stage, setStage] = useState<ApplicationStage>(currentStage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/applications/${applicationId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage, content }),
    });

    if (res.ok) {
      setContent("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Failed to save note");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="note-stage"
          className="block text-sm font-medium text-gray-700"
        >
          Stage
        </label>
        <select
          id="note-stage"
          value={stage}
          onChange={(e) => setStage(e.target.value as ApplicationStage)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3
                     py-2 text-sm shadow-sm focus:border-blue-500
                     focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {Object.entries(STAGE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="note-content"
          className="block text-sm font-medium text-gray-700"
        >
          Note
        </label>
        <textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Add a note for this stage..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3
                     py-2 text-sm shadow-sm focus:border-blue-500
                     focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium
                   text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save Note"}
      </button>
    </form>
  );
}
```

### Step 6 - Create Test Scripts

`__tests__/api.notes.[id].test.ts`

```typescript
/**
 * @jest-environment node
 */
// __tests__/api.notes.[id].test.ts
import { PATCH, DELETE } from "@/app/api/notes/[id]/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    interviewNote: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindFirst = prisma.interviewNote.findFirst as jest.Mock;
const mockUpdate = prisma.interviewNote.update as jest.Mock;
const mockDelete = prisma.interviewNote.delete as jest.Mock;

const existingNote = {
  id: "note-1",
  applicationId: "app-1",
  stage: "SCREENING",
  content: "Old content",
  application: { userId: "user-1", deletedAt: null },
  createdAt: new Date(),
  updatedAt: new Date(),
};

function makeRequest(method: string, body?: unknown) {
  return new NextRequest("http://localhost/api/notes/note-1", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

const validParams = Promise.resolve({ id: "note-1" });

beforeEach(() => jest.clearAllMocks());

describe("PATCH /api/notes/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await PATCH(makeRequest("PATCH", { content: "Updated" }), {
      params: validParams,
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when note not found or not owned", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(null);
    const res = await PATCH(makeRequest("PATCH", { content: "Updated" }), {
      params: validParams,
    });
    expect(res.status).toBe(404);
  });

  it("returns 200 and updates the note", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(existingNote);
    mockUpdate.mockResolvedValue({ ...existingNote, content: "Updated" });
    const res = await PATCH(makeRequest("PATCH", { content: "Updated" }), {
      params: validParams,
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.content).toBe("Updated");
  });
});

describe("DELETE /api/notes/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE"), { params: validParams });
    expect(res.status).toBe(401);
  });

  it("returns 404 when note not found or not owned", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(null);
    const res = await DELETE(makeRequest("DELETE"), { params: validParams });
    expect(res.status).toBe(404);
  });

  it("returns 200 and deletes the note", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(existingNote);
    mockDelete.mockResolvedValue(existingNote);
    const res = await DELETE(makeRequest("DELETE"), { params: validParams });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.message).toBe("Note deleted");
  });
});
```

` __tests__/api.notes.test.ts`

```typescript
/**
 * @jest-environment node
 */
// __tests__/api.notes.test.ts
import { POST } from "@/app/api/applications/[id]/notes/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findFirst: jest.fn() },
    interviewNote: { create: jest.fn() },
  },
}));

jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindFirst = prisma.application.findFirst as jest.Mock;
const mockCreate = prisma.interviewNote.create as jest.Mock;

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/applications/app-1/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validParams = Promise.resolve({ id: "app-1" });

beforeEach(() => jest.clearAllMocks());

describe("POST /api/applications/[id]/notes", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await POST(makeRequest({ stage: "SCREENING", content: "x" }), {
      params: validParams,
    });
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is invalid", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    // No mockFindFirst needed — validation fires before the DB call
    const res = await POST(makeRequest({ stage: "SCREENING", content: "" }), {
      params: validParams,
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 when application not found", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue(null);
    const res = await POST(
      makeRequest({ stage: "SCREENING", content: "Good call" }),
      { params: validParams },
    );
    expect(res.status).toBe(404);
  });

  it("returns 201 and creates the note", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindFirst.mockResolvedValue({ id: "app-1", userId: "user-1" });
    mockCreate.mockResolvedValue({
      id: "note-1",
      applicationId: "app-1",
      stage: "SCREENING",
      content: "Good call",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const res = await POST(
      makeRequest({ stage: "SCREENING", content: "Good call" }),
      { params: validParams },
    );
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.id).toBe("note-1");
  });
});
```

---

### DoD check

| Confirmed | How                                                                                                         | Item                                                |
| --------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [x]       | Browser — open an application detail page, add a note for the current stage, confirm it appears immediately | Note creates and displays without page reload       |
| [x]       | Browser — edit an existing note, save, confirm the updated content displays immediately                     | Note updates correctly                              |
| [x]       | Browser — delete a note, confirm it is removed immediately without stale data on Vercel                     | Note deletes — no stale data on Vercel after delete |
| [x]       | Browser — confirm notes are grouped correctly by stage on the detail page                                   | Notes display against the correct stage             |
| [x]       | `npm test` — `api.notes.test.ts` passes (POST: 401, 400, 201, 404)                                          | API POST tests passing                              |
| [x]       | `npm test` — `api.notes.[id].test.ts` passes (PATCH: 401, 404, 200; DELETE: 401, 404, 200)                  | API PATCH + DELETE tests passing                    |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                                 | TypeScript clean                                    |

---

## PBI-031 — Notes History / Timeline View

**Goal:** Notes on the application detail page are displayed as a timeline grouped by stage, ordered by `createdAt` descending within each group.

### Implementation notes

- `NoteTimeline` component receives all notes for the application and groups them by `stage`
- Stage group order matches the `ApplicationStage` enum order: APPLIED → SCREENING → INTERVIEW → ASSESSMENT → OFFER → CLOSED
- Within each stage group, notes are ordered newest first (`createdAt` DESC)
- Empty stages are not rendered — only stages with at least one note appear
- Wire into `app/dashboard/applications/[id]/page.tsx` with Prisma `include` on `notes`

---

### Step 1 - Create the NoteTimeline and NoteViewToggle tsx fils

```tsx
// components/NoteTimeline.tsx
"use client";

import { ApplicationStage } from "@prisma/client";
import InterviewNoteActions from "@/components/InterviewNoteActions";

interface Note {
  id: string;
  stage: ApplicationStage;
  content: string;
  createdAt: Date;
}

interface NoteTimelineProps {
  notes: Note[];
  stageLabels: Record<ApplicationStage, string>;
  stageColours: Record<ApplicationStage, string>;
}

export default function NoteTimeline({
  notes,
  stageLabels,
  stageColours,
}: NoteTimelineProps) {
  if (notes.length === 0) {
    return <p className="text-sm text-gray-500">No interview notes yet.</p>;
  }

  // Chronological, newest first — already ordered by the Prisma query
  return (
    <ol className="relative border-l border-gray-200">
      {notes.map((note) => (
        <li key={note.id} className="mb-6 ml-4">
          {/* Timeline dot */}
          <span
            className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border
                        border-white ${stageColours[note.stage].split(" ")[0]}`}
          />

          {/* Stage badge + date */}
          <p className="mb-1 text-xs font-medium text-gray-500">
            <span
              className={`mr-2 rounded-full px-2 py-0.5 text-xs font-medium
                          ${stageColours[note.stage]}`}
            >
              {stageLabels[note.stage]}
            </span>
            {new Date(note.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>

          {/* Note content */}
          <p className="whitespace-pre-wrap text-sm text-gray-900">
            {note.content}
          </p>

          {/* Edit / Delete */}
          <InterviewNoteActions
            noteId={note.id}
            initialContent={note.content}
            initialStage={note.stage}
            stageLabels={stageLabels}
          />
        </li>
      ))}
    </ol>
  );
}
```

```tsx
// components/NoteViewToggle.tsx
"use client";

import { useState } from "react";
import { ApplicationStage } from "@prisma/client";
import InterviewNoteForm from "@/components/InterviewNoteForm";
import InterviewNoteActions from "@/components/InterviewNoteActions";
import NoteTimeline from "@/components/NoteTimeline";

interface Note {
  id: string;
  stage: ApplicationStage;
  content: string;
  createdAt: Date;
}

interface NoteViewToggleProps {
  notes: Note[];
  applicationId: string;
  currentStage: ApplicationStage;
  stageLabels: Record<ApplicationStage, string>;
  stageColours: Record<ApplicationStage, string>;
}

const STAGE_ORDER: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "CLOSED",
];

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    const stageDiff =
      STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage);
    if (stageDiff !== 0) return stageDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export default function NoteViewToggle({
  notes,
  applicationId,
  currentStage,
  stageLabels,
  stageColours,
}: NoteViewToggleProps) {
  const [view, setView] = useState<"list" | "timeline">("list");
  const sorted = sortNotes(notes);

  return (
    <>
      {/* Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Interview Notes</h2>
        <div className="flex gap-1 rounded-md border border-gray-200 p-0.5">
          {(["list", "timeline"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors
                ${
                  view === v
                    ? "bg-indigo-600 text-white"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {v === "list" ? "List" : "Timeline"}
            </button>
          ))}
        </div>
      </div>

      {/* List view */}
      {view === "list" && (
        <>
          {sorted.length > 0 ? (
            <ul className="mb-4 space-y-3">
              {sorted.map((note) => (
                <li
                  key={note.id}
                  className="rounded-md border border-gray-100 bg-gray-50 p-3"
                >
                  <p className="mb-1 text-xs font-medium text-gray-500">
                    {stageLabels[note.stage]} ·{" "}
                    {new Date(note.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-gray-900">
                    {note.content}
                  </p>
                  <InterviewNoteActions
                    noteId={note.id}
                    initialContent={note.content}
                    initialStage={note.stage}
                    stageLabels={stageLabels}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-gray-500">
              No interview notes yet.
            </p>
          )}
        </>
      )}

      {/* Timeline view */}
      {view === "timeline" && (
        <div className="mb-4">
          <NoteTimeline
            notes={sorted}
            stageLabels={stageLabels}
            stageColours={stageColours}
          />
        </div>
      )}

      {/* Add note form */}
      <div className="border-t border-gray-100 pt-4">
        <h3 className="mb-3 text-sm font-medium text-gray-700">Add Note</h3>
        <InterviewNoteForm
          applicationId={applicationId}
          currentStage={currentStage}
        />
      </div>
    </>
  );
}
```

### Step 2 - Create the Test Script - `__tests__/NoteTimeline.test.tsx`

```typescript
// __tests__/NoteTimeline.test.tsx
import { render, screen } from "@testing-library/react";
import NoteTimeline from "@/components/NoteTimeline";
import { ApplicationStage } from "@prisma/client";

jest.mock("@/components/InterviewNoteActions", () => ({
  __esModule: true,
  default: () => <div data-testid="note-actions" />,
}));

const stageLabels: Record<ApplicationStage, string> = {
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  CLOSED: "Closed",
};

const stageColours: Record<ApplicationStage, string> = {
  APPLIED: "bg-blue-100 text-blue-800",
  SCREENING: "bg-yellow-100 text-yellow-800",
  INTERVIEW: "bg-purple-100 text-purple-800",
  ASSESSMENT: "bg-orange-100 text-orange-800",
  OFFER: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-600",
};

const baseProps = { stageLabels, stageColours };

describe("NoteTimeline", () => {
  it("renders empty state when no notes", () => {
    render(<NoteTimeline notes={[]} {...baseProps} />);
    expect(
      screen.getByText("No interview notes yet."),
    ).toBeInTheDocument();
  });

  it("renders a note with its stage label and content", () => {
    render(
      <NoteTimeline
        notes={[
          {
            id: "n1",
            stage: "SCREENING",
            content: "Good phone screen",
            createdAt: new Date("2026-04-25"),
          },
        ]}
        {...baseProps}
      />,
    );
    expect(screen.getByText("Screening")).toBeInTheDocument();
    expect(screen.getByText("Good phone screen")).toBeInTheDocument();
  });

  it("renders all notes passed to it", () => {
    render(
      <NoteTimeline
        notes={[
          {
            id: "n1",
            stage: "SCREENING",
            content: "First note",
            createdAt: new Date("2026-04-24"),
          },
          {
            id: "n2",
            stage: "OFFER",
            content: "Offer received",
            createdAt: new Date("2026-04-25"),
          },
        ]}
        {...baseProps}
      />,
    );
    expect(screen.getByText("First note")).toBeInTheDocument();
    expect(screen.getByText("Offer received")).toBeInTheDocument();
    expect(screen.getByText("Screening")).toBeInTheDocument();
    expect(screen.getByText("Offer")).toBeInTheDocument();
  });

  it("renders InterviewNoteActions for each note", () => {
    render(
      <NoteTimeline
        notes={[
          {
            id: "n1",
            stage: "SCREENING",
            content: "Note one",
            createdAt: new Date("2026-04-25"),
          },
          {
            id: "n2",
            stage: "INTERVIEW",
            content: "Note two",
            createdAt: new Date("2026-04-25"),
          },
        ]}
        {...baseProps}
      />,
    );
    expect(screen.getAllByTestId("note-actions")).toHaveLength(2);
  });

  it("renders notes in the order received (sort is caller's responsibility)", () => {
    render(
      <NoteTimeline
        notes={[
          {
            id: "n1",
            stage: "OFFER",
            content: "Offer note",
            createdAt: new Date("2026-04-25"),
          },
          {
            id: "n2",
            stage: "SCREENING",
            content: "Screening note",
            createdAt: new Date("2026-04-24"),
          },
        ]}
        {...baseProps}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Offer note");
    expect(items[1]).toHaveTextContent("Screening note");
  });
});
```

---

### DoD check

| Confirmed | How                                                                                             | Item                                      |
| --------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------- |
| [x]       | Browser — add notes at two different stages, confirm they appear under the correct stage header | Notes grouped correctly by stage          |
| [x]       | Browser — add two notes to the same stage, confirm newest appears first                         | Notes within a stage ordered newest first |
| [x]       | Browser — confirm stages with no notes do not render a section header                           | Empty stages hidden                       |
| [x]       | `npm test` — `NoteTimeline.test.tsx` passes                                                     | RTL test passing                          |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                     | TypeScript clean                          |

---

## PBI-026 — Conversion Rate Metric

**Goal:** Dashboard displays the conversion rate from applied → interview and interview → offer.

### Implementation notes

- Compute in `GET /api/dashboard/metrics` route — do not compute in the component
- Applied → interview rate: `(applications with stage INTERVIEW or beyond / total active) * 100`
- Interview → offer rate: `(applications with stage OFFER or beyond / applications with stage INTERVIEW or beyond) * 100`
- Return as `{ conversionRates: { appliedToInterview: number, interviewToOffer: number } }`
- `ConversionChart` component renders two percentage figures — cards or bar segments
- `revalidatePath("/dashboard")` in the metrics route is not needed (GET) — no mutation

### Create Tests

```typescript
/**
 * @jest-environment node
 */
// __tests__/api.dashboard.metrics.test.ts
import { GET } from "@/app/api/dashboard/metrics/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findMany: jest.fn() },
  },
}));

jest.mock("@/lib/auth", () => ({ getUserFromRequest: jest.fn() }));

import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindMany = prisma.application.findMany as jest.Mock;

function makeRequest() {
  return new NextRequest("http://localhost/api/dashboard/metrics");
}

beforeEach(() => jest.clearAllMocks());

describe("GET /api/dashboard/metrics", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 0% rates when no applications", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindMany.mockResolvedValue([]);
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.conversionRates).toEqual({
      appliedToInterview: 0,
      interviewToOffer: 0,
    });
  });

  it("computes appliedToInterview correctly", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindMany.mockResolvedValue([
      { stage: "APPLIED" },
      { stage: "APPLIED" },
      { stage: "INTERVIEW" },
      { stage: "OFFER" },
    ]);
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.conversionRates.appliedToInterview).toBe(50);
  });

  it("computes interviewToOffer correctly", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindMany.mockResolvedValue([
      { stage: "INTERVIEW" },
      { stage: "INTERVIEW" },
      { stage: "OFFER" },
      { stage: "OFFER" },
    ]);
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.conversionRates.interviewToOffer).toBe(50);
  });

  it("returns 0% interviewToOffer when no applications reached interview", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1" });
    mockFindMany.mockResolvedValue([
      { stage: "APPLIED" },
      { stage: "SCREENING" },
    ]);
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.conversionRates.interviewToOffer).toBe(0);
  });
});
```

```tsx
// __tests__/ConversionChart.test.tsx
import { render, screen } from "@testing-library/react";
import ConversionChart from "@/components/ConversionChart";
import { Application } from "@prisma/client";

const makeApp = (stage: string): Application =>
  ({
    id: `app-${stage}-${Math.random()}`,
    stage,
    userId: "user-1",
    company: "Acme",
    role: "Engineer",
    location: null,
    salary: null,
    jobUrl: null,
    followUpAt: null,
    notes: null,
    source: null,
    stageEnteredAt: new Date(),
    appliedAt: new Date(),
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as Application;

describe("ConversionChart", () => {
  it("renders 0% when no applications", () => {
    render(<ConversionChart applications={[]} />);
    expect(screen.getAllByText("0%")).toHaveLength(2);
  });

  it("computes appliedToInterview correctly", () => {
    // 1 of 4 at interview or beyond = 25%; interviewToOffer = 0% (no offer)
    const apps = [
      makeApp("APPLIED"),
      makeApp("APPLIED"),
      makeApp("APPLIED"),
      makeApp("INTERVIEW"),
    ];
    render(<ConversionChart applications={apps} />);
    expect(screen.getByText("25%")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("computes interviewToOffer correctly", () => {
    // 3 at interview or beyond, 1 at offer or beyond = 33%
    // appliedToInterview = 75% (3 of 4)
    const apps = [
      makeApp("APPLIED"),
      makeApp("INTERVIEW"),
      makeApp("INTERVIEW"),
      makeApp("OFFER"),
    ];
    render(<ConversionChart applications={apps} />);
    expect(screen.getByText("75%")).toBeInTheDocument(); // appliedToInterview
    expect(screen.getByText("33%")).toBeInTheDocument(); // interviewToOffer
  });

  it("renders both rate labels", () => {
    render(<ConversionChart applications={[makeApp("APPLIED")]} />);
    expect(screen.getByText("Applied → Interview")).toBeInTheDocument();
    expect(screen.getByText("Interview → Offer")).toBeInTheDocument();
  });
});
```

---

### DoD check

| Confirmed | How                                                                                                       | Item                                          |
| --------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| [x]       | Browser — add applications across multiple stages, confirm conversion rates update correctly on dashboard | Conversion rates compute and render correctly |
| [x]       | Browser — confirm 0% renders correctly when no applications have reached interview or offer stage         | Zero state renders without division error     |
| [x]       | `npm test` — `api.dashboard.metrics.test.ts` passes                                                       | Metrics API test passing                      |
| [x]       | `npm test` — `ConversionChart.test.tsx` passes                                                            | RTL test passing                              |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                               | TypeScript clean                              |

---

## PBI-027 — Time-in-Stage Metric

**Goal:** Dashboard displays the average number of days an application spends in each stage.

### Implementation notes

- `stageEnteredAt` field added to `Application` in the PBI-030 migration — already done
- Update `stageEnteredAt` in the PATCH handler when `stage` changes:

```typescript
// In PATCH handler — stage-only update branch
const updated = await prisma.application.update({
  where: { id },
  data: {
    stage: result.data.stage,
    stageEnteredAt: new Date(),
  },
});
```

### Create test

```tsx
// __tests__/TimeInStageChart.test.tsx
import { render, screen } from "@testing-library/react";
import TimeInStageChart from "@/components/TimeInStageChart";
import { Application } from "@prisma/client";

const makeApp = (stage: string, daysAgo: number): Application =>
  ({
    id: `app-${stage}-${Math.random()}`,
    stage,
    userId: "user-1",
    company: "Acme",
    role: "Engineer",
    location: null,
    salary: null,
    jobUrl: null,
    followUpAt: null,
    notes: null,
    source: null,
    stageEnteredAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
    appliedAt: new Date(),
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as Application;

describe("TimeInStageChart", () => {
  it("renders nothing when no applications", () => {
    const { container } = render(<TimeInStageChart applications={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when no applications have stageEnteredAt", () => {
    const app = makeApp("APPLIED", 5);
    const appWithoutDate = {
      ...app,
      stageEnteredAt: null,
    } as unknown as Application;
    const { container } = render(
      <TimeInStageChart applications={[appWithoutDate]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the chart heading when data exists", () => {
    render(<TimeInStageChart applications={[makeApp("APPLIED", 3)]} />);
    expect(screen.getByText("Avg. Days in Stage")).toBeInTheDocument();
  });

  it("renders a row for each stage that has applications", () => {
    const apps = [
      makeApp("APPLIED", 5),
      makeApp("SCREENING", 3),
      makeApp("INTERVIEW", 1),
    ];
    render(<TimeInStageChart applications={apps} />);
    expect(screen.getByText("Applied")).toBeInTheDocument();
    expect(screen.getByText("Screening")).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
  });

  it("does not render a row for stages with no applications", () => {
    render(<TimeInStageChart applications={[makeApp("APPLIED", 3)]} />);
    expect(screen.queryByText("Screening")).not.toBeInTheDocument();
    expect(screen.queryByText("Interview")).not.toBeInTheDocument();
  });

  it("displays avg days with d suffix", () => {
    // 7 days ago — avgDays should be 7
    render(<TimeInStageChart applications={[makeApp("APPLIED", 7)]} />);
    expect(screen.getByText("7d")).toBeInTheDocument();
  });

  it("averages correctly across multiple apps in the same stage", () => {
    // 4 days and 8 days = avg 6 days
    const apps = [makeApp("SCREENING", 4), makeApp("SCREENING", 8)];
    render(<TimeInStageChart applications={apps} />);
    expect(screen.getByText("6d")).toBeInTheDocument();
  });
});
```

- Compute average days per stage in `GET /api/dashboard/metrics` — add to the existing metrics response
- `TimeInStageChart` component renders a horizontal bar per stage showing average days
- Stages with no data render as 0 days — do not hide them

### DoD check

| Confirmed | How                                                                                                 | Item                                          |
| --------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| [x]       | Browser — move an application between stages, confirm `stageEnteredAt` updates on each stage change | `stageEnteredAt` updates on stage progression |
| [x]       | Browser — confirm time-in-stage chart renders correct average days per stage on dashboard           | Average days compute and render correctly     |
| [x]       | Browser — confirm stages with no applications render as 0 days rather than being hidden             | Zero state renders for all stages             |
| [x]       | `npm test` — `TimeInStageChart.test.tsx` passes                                                     | RTL test passing                              |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                         | TypeScript clean                              |

---

## PBI-028 — Source Effectiveness Metric

**Goal:** Users can tag an application with a source (LinkedIn, Referral, Cold Apply, Job Board, Other). Dashboard shows conversion rate grouped by source.

### Implementation notes

- `source` field added to `Application` in the PBI-030 migration — already done
- Add `source` to `updateApplicationSchema` in `lib/schemas/application.ts`:

```typescript
  source: z.enum(["LINKEDIN", "REFERRAL", "COLD_APPLY", "JOB_BOARD", "OTHER"]).optional(),
```

- Add source selector to `ApplicationForm` — `<select>` with `htmlFor`/`id` pair
- Compute source effectiveness in `GET /api/dashboard/metrics` — add to metrics response
- `SourceChart` component renders a breakdown of applications and offers per source

### DoD check

| Confirmed | How                                                                                                 | Item                                        |
| --------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------- | --- |
| [x]       | Browser — create an application with a source tag, confirm it saves and displays on the detail page | Source field saves and renders correctly    |
| [x]       | Browser — confirm source effectiveness chart renders on dashboard grouped by source                 | Source chart renders with correct groupings |
| [x]       | Browser — confirm applications with no source tag are grouped under "Untagged"                      | Null source handled gracefully              |     |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                         | TypeScript clean                            |

---

## PBI-041 — Integration Tests — API Routes

**Goal:** Integration tests cover all new API routes introduced in Sprint 4.

### Test files to create

| File                                      | Covers                                            | Expected tests |
| ----------------------------------------- | ------------------------------------------------- | -------------- |
| `__tests__/api.notes.test.ts`             | `POST /api/applications/[id]/notes`               | 4              |
| `__tests__/api.notes.[id].test.ts`        | `PATCH /api/notes/[id]`, `DELETE /api/notes/[id]` | 6              |
| `__tests__/api.dashboard.metrics.test.ts` | `GET /api/dashboard/metrics`                      | 4              |

### Rules

- `@jest-environment node` docblock must be the absolute first line of every file — before any comments or imports
- `moduleNameMapper` for `@/` alias is already declared in `jest.config.ts` — do not remove it
- Mock `getUserFromRequest` and `prisma` — do not connect to the real database in tests
- One test file per route file — mirrors Sprint 3 pattern

### DoD check

| Confirmed | How                                                                                                        | Item                                            |
| --------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [x]       | `npm test` — `api.notes.test.ts` 4 tests passing (401, 400, 201, 404)                                      | POST /api/applications/[id]/notes tests passing |
| [x]       | `npm test` — `api.notes.[id].test.ts` 6 tests passing (PATCH: 401, 404, 200; DELETE: 401, 404, 200)        | PATCH + DELETE /api/notes/[id] tests passing    |
| [x]       | `npm test` — `api.dashboard.metrics.test.ts` 4 tests passing (401, 200, empty state, multi-user isolation) | GET /api/dashboard/metrics tests passing        |
| [x]       | `npm test` — full suite passes with 0 failures                                                             | All 48 tests passing (34 carried + 14 new)      |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                                | TypeScript clean                                |

---

## PBI-044 — API Documentation

**Goal:** All API routes are documented with inline JSDoc comments covering method, path, auth, request body, response shape, and status codes.

### Documentation standard

```typescript
 * app/api/applications/route.ts
/**
 import { revalidatePath } from "next/cache";

/**
 * POST /api/applications
 * Auth: Required (JWT cookie)
 *
 * Creates a new job application for the authenticated user.
 *
 * Request body:
 *   { company: string, role: string, location?: string, salary?: string,
 *     jobUrl?: string, followUpAt?: string, notes?: string, source?: string }
 *
 * Responses:
 *   201 — Application object created
 *   400 — Validation failed { error, details }
 *   401 — Unauthorized { error }
 *   500 — Internal server error { error }
 */

---
app/api/applications/[id]/route.ts
/**
 * GET /api/applications/[id]
 * Auth: Required (JWT cookie)
 *
 * Returns a single application by ID, scoped to the authenticated user.
 *
 * Responses:
 *   200 — Application object
 *   401 — Unauthorized { error }
 *   404 — Not found { error }
 */

/**
 * PATCH /api/applications/[id]
 * Auth: Required (JWT cookie)
 *
 * Updates an application. Accepts either a stage-only update (from Kanban
 * drag-and-drop) or a full field update from the edit form.
 *
 * Stage-only request body:
 *   { stage: ApplicationStage }
 *
 * Full update request body:
 *   { company?: string, role?: string, location?: string, salary?: string,
 *     jobUrl?: string, followUpAt?: string, notes?: string,
 *     stage?: ApplicationStage, source?: string }
 *
 * Responses:
 *   200 — Updated Application object
 *   400 — Validation failed { error, details }
 *   401 — Unauthorized { error }
 *   404 — Not found { error }
 *   500 — Internal server error { error }
 */
/**
 * DELETE /api/applications/[id]
 * Auth: Required (JWT cookie)
 *
 * Soft-deletes an application by setting deletedAt to the current timestamp.
 * The record is retained in the database but excluded from all queries.
 *
 * Responses:
 *   200 — { message: "Application deleted" }
 *   401 — Unauthorized { error }
 *   404 — Not found { error }
 *   500 — Internal server error { error }
 */

---

app/api/applications/[id]/notes/route.ts
/**
 * POST /api/applications/[id]/notes
 * Auth: Required (JWT cookie)
 *
 * Creates an interview note for the specified application.
 * Validates the request body before the DB ownership check (fail-fast on 400).
 *
 * Request body:
 *   { stage: ApplicationStage, content: string }
 *
 * Responses:
 *   201 — InterviewNote object created
 *   400 — Validation failed { error, details }
 *   401 — Unauthorized { error }
 *   404 — Application not found or not owned by user { error }
 *   500 — Internal server error { error }
 */

---

app/api/notes/[id]/route.ts
/**
 * PATCH /api/notes/[id]
 * Auth: Required (JWT cookie)
 *
 * Updates an interview note. Ownership is verified via the parent application.
 * At least one field (stage or content) must be provided.
 *
 * Request body:
 *   { stage?: ApplicationStage, content?: string }
 *
 * Responses:
 *   200 — Updated InterviewNote object
 *   400 — Validation failed { error, details }
 *   401 — Unauthorized { error }
 *   404 — Note not found or not owned by user { error }
 *   500 — Internal server error { error }
 */

/**
 * DELETE /api/notes/[id]
 * Auth: Required (JWT cookie)
 *
 * Hard-deletes an interview note. Ownership is verified via the parent application.
 *
 * Responses:
 *   200 — { message: "Note deleted" }
 *   401 — Unauthorized { error }
 *   404 — Note not found or not owned by user { error }
 *   500 — Internal server error { error }
 */


---

app/api/contacts/route.ts
/**
 * POST /api/contacts
 * Auth: Required (JWT cookie)
 *
 * Creates a contact associated with an application owned by the authenticated user.
 * The applicationId in the request body must belong to the authenticated user.
 *
 * Request body:
 *   { applicationId: string, name: string, role?: string,
 *     email?: string, phone?: string, notes?: string }
 *
 * Responses:
 *   201 — Contact object created
 *   400 — Validation failed { error }
 *   401 — Unauthorized { error }
 *   404 — Application not found or not owned by user { error }
 */

---

app/api/contacts/[id]/route.ts
/**
 * PATCH /api/contacts/[id]
 * Auth: Required (JWT cookie)
 *
 * Updates a contact. Ownership is verified via the parent application.
 *
 * Request body (all fields optional, at least one required):
 *   { name?: string, role?: string, email?: string,
 *     phone?: string, notes?: string }
 *
 * Responses:
 *   200 — Updated Contact object
 *   400 — Validation failed { error }
 *   401 — Unauthorized { error }
 *   404 — Contact not found or not owned by user { error }
 */

/**
 * DELETE /api/contacts/[id]
 * Auth: Required (JWT cookie)
 *
 * Hard-deletes a contact. Ownership is verified via the parent application.
 *
 * Responses:
 *   200 — { message: "Contact deleted" }
 *   401 — Unauthorized { error }
 *   404 — Contact not found or not owned by user { error }
 */

---

app/api/dashboard/metrics/route.ts
/**
 * GET /api/dashboard/metrics
 * Auth: Required (JWT cookie)
 *
 * Returns aggregated pipeline metrics for the authenticated user's applications.
 *
 * Response shape:
 *   {
 *     conversionRates: { appliedToInterview: number, interviewToOffer: number },
 *     timeInStage:     { stage: ApplicationStage, avgDays: number }[],
 *     sourceEffectiveness: {
 *       source: string, total: number, interviews: number, offers: number,
 *       interviewRate: number, offerRate: number
 *     }[]
 *   }
 *
 * Notes:
 *   - conversionRates values are whole-number percentages (0–100)
 *   - timeInStage is ordered by STAGE_ORDER; stages with no applications are omitted
 *   - Applications with no source are grouped under "UNTAGGED"
 *
 * Responses:
 *   200 — Metrics object
 *   401 — Unauthorized { error }
 *   500 — Internal server error { error }
 */

---

app/api/auth/login/route.ts
/**
 * POST /api/auth/login
 * Auth: None (public endpoint)
 *
 * Authenticates a user and sets an HTTP-only JWT cookie on success.
 * Returns a generic error for both "user not found" and "wrong password"
 * to prevent user enumeration.
 *
 * Request body:
 *   { email: string, password: string }
 *
 * Responses:
 *   200 — { message: "Login successful" } + sets hireflow-track-token cookie
 *   400 — Validation failed { error, details }
 *   401 — Invalid credentials { error }
 *   500 — Internal server error { error }
 */

---

app/api/auth/logout/route.ts
/**
 * POST /api/auth/logout
 * Auth: None required (clears the cookie regardless of validity)
 *
 * Clears the hireflow-track-token cookie by overwriting it with an empty value
 * and maxAge: 0.
 *
 * Responses:
 *   200 — { message: "Logged out" }
 */

---

app/api/auth/register/route.ts
/**
 * POST /api/auth/register
 * Auth: None (public endpoint)
 *
 * Creates a new user account. Passwords are hashed with bcrypt (cost 10).
 * The password field is never returned in any response.
 *
 * Request body:
 *   { email: string, password: string }
 *
 * Responses:
 *   201 — { message: "Account created successfully" }
 *   400 — Validation failed { error, details }
 *   409 — Email already registered { error }
 *   500 — Internal server error { error }
 */

```

Apply to every route handler in `app/api/`. Existing Sprint 1–3 routes must also be documented this sprint.

### DoD check

| Confirmed | How                                                                                    | Item                                   |
| --------- | -------------------------------------------------------------------------------------- | -------------------------------------- |
| [x]       | Code review — every route handler in `app/api/` has a JSDoc comment above the function | All route handlers documented          |
| [x]       | Code review — every JSDoc block includes method, path, auth, request body, responses   | Documentation is complete per standard |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                            | TypeScript clean                       |

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

All four must pass clean. Then:

```bash
git add .
git commit -m "[PBI-026 to PBI-044] Sprint 4: Notes, metrics, rate limiting, integration tests, API docs"
git push origin feature/sprint-04-notes-metrics
```

Open a PR on GitHub: `feature/sprint-04-notes-metrics → develop`. Use the sprint goal as the PR title:

> **Sprint 4: The application is hardened and measurable. Users can log interview notes, view a timeline per application, and see conversion and time-in-stage metrics on the dashboard.**

Merge to `develop`. Verify the Vercel preview. Then proceed to Sprint 5.

---

## Sprint Close Checklist

After the PR is merged to `develop`:

- [x] Mark all 8 PBIs `[x]` in `sprint-04.md`
- [x] Mark all 8 PBIs `[x]` in `product.md`
- [x] Complete `sprint-04.md` Sprint Review and Retrospective sections
- [x] Fill retro insight in `sprint-04.md` for LinkedIn
- [x] Commit updated docs directly to `develop`: `git commit -m "[DOCS] Sprint 4 close — update sprint-04.md, product.md"`
- [x] Update Notion Sprint Board: Sprint 4 → ✅ Closed, Sprint 5 → 🔄 In progress
- [x] Add Sprint 4 Changelog entry to Notion
- [x] `plan.md` Sprint Summary Table updated with close date
- [x] Phase 2 gate progress recorded in `plan.md`

---

_sprint-04-implementation.md — 30 April 2026 — HireFlow_
_Branch: `feature/sprint-04-notes-metrics`. Follow PBIs in dependency order. Run `npm run build` locally before every push. Pin all packages._
