# HireTrace — Sprint 3 Implementation Guide

**Document Type:** Developer Implementation Reference
**Sprint:** 3 of 6
**Branch:** `feature/sprint-03-contacts` (from `develop`)
**Status:** Ready to implement
**PBIs:** PBI-017 → PBI-018 → PBI-019 → PBI-020 → PBI-021 → PBI-024 → PBI-025 → PBI-029 → PBI-043

---

## Before You Write a Single Line of Code

### Step 1 — Confirm branch and baseline

```bash
git checkout feature/sprint-03-contacts
git pull origin feature/sprint-03-contacts
npm run build        # must pass clean
npx tsc --noEmit     # must pass clean
npm test             # must pass clean
```

If any of the three fail, fix before starting Sprint 3 work.

### Step 2 — No new packages required

All Sprint 3 dependencies are already installed. No `npm install` needed.

---

## Critical Rules Carried Forward From Sprint 2

| Rule                                                                   | Why                                                 |
| ---------------------------------------------------------------------- | --------------------------------------------------- |
| `npm run build` locally before every Vercel push                       | Catches issues Vercel will catch                    |
| Never `@latest` — all packages pinned                                  | Cascading version conflicts                         |
| `@jest-environment node` docblock must be first line of API test files | Anything before it breaks the override              |
| `moduleNameMapper` already declared in `jest.config.ts`                | Do not remove it                                    |
| All form inputs must have `htmlFor` on `<label>` and `id` on `<input>` | Required for RTL `getByLabelText` and accessibility |
| `router.refresh()` before `router.push()` after mutations              | Prevents navigation interruption                    |
| DoD checks use three-column table format: Confirmed / How / Item       | No bullet-list DoD items                            |
| `jose` in API routes only — Web Crypto in middleware                   | Edge runtime constraint                             |
| `@import "tailwindcss"` in globals.css                                 | Tailwind v4                                         |

---

## Directory Structure After Sprint 3

New files and directories this sprint creates (additions to the Sprint 2 structure):

```
hiretrace/
├── app/
│   ├── api/
│   │   └── contacts/
│   │       ├── route.ts                        ← POST create contact
│   │       └── [id]/
│   │           └── route.ts                    ← PATCH edit, DELETE contact
│   └── dashboard/
│       └── applications/
│           └── [id]/
│               └── page.tsx                    ← Updated: contact list + notes
├── components/
│   ├── ContactForm.tsx                         ← Add/edit contact form (PBI-018)
│   ├── ContactList.tsx                         ← Contact list on detail page (PBI-019)
│   ├── StatsBar.tsx                            ← Summary stats bar (PBI-024)
│   └── PipelineChart.tsx                       ← Stage distribution chart (PBI-025)
├── lib/
│   └── schemas/
│       └── contact.ts                          ← Zod schema for Contact (PBI-017)
├── prisma/
│   └── schema.prisma                           ← Updated: Contact model added (PBI-017)
├── __tests__/
│   ├── api.contacts.test.ts                    ← PBI-018 POST handler
│   ├── api.contacts.[id].test.ts               ← PBI-018 PATCH + DELETE handlers
│   ├── ContactForm.test.tsx                    ← PBI-018
│   ├── ContactList.test.tsx                    ← PBI-019
│   ├── StatsBar.test.tsx                       ← PBI-024
│   └── PipelineChart.test.tsx                  ← PBI-025
└── README.md                                   ← PBI-043 (project root)
```

---

## Environment Variables

No new environment variables required for Sprint 3. All existing variables carry forward unchanged.

`.env.local` (unchanged):

```
DATABASE_URL=<pooled Neon string — no channel_binding=require>
DIRECT_URL=<direct Neon string>
JWT_SECRET=<min 32 chars>
NEXTAUTH_URL=<your Vercel preview URL>
NEXTAUTH_SECRET=<random secret>
```

---

## PBI-017 — Contact Data Model

**Goal:** Add the `Contact` model to the Prisma schema, linked to `Application`, and run the migration.

### Step 1 — Update `prisma/schema.prisma`

Add the `contacts` relation to the existing `Application` model and add the new `Contact` model below it:

```prisma
model Application {
  id          String            @id @default(cuid())
  userId      String
  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  company     String
  role        String
  location    String?
  salary      String?
  jobUrl      String?
  stage       ApplicationStage  @default(APPLIED)
  appliedAt   DateTime          @default(now())
  followUpAt  DateTime?
  notes       String?
  deletedAt   DateTime?
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  contacts    Contact[]

  @@index([userId])
  @@index([userId, stage])
  @@index([userId, deletedAt])
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
```

**Key decisions:**

- `Contact` is linked to `Application` not `User` — a contact belongs to a specific application, not the user globally
- `onDelete: Cascade` — deleting an application hard-deletes its contacts
- `name` is the only required field — role, email, phone, notes are all optional
- No soft delete on `Contact` — contacts are hard deleted when removed

### Step 2 — Run the migration

```bash
npx prisma migrate dev --name add-contact-model
```

Expected output:

```
✔ Generated Prisma Client
The following migration was created: prisma/migrations/TIMESTAMP_add_contact_model/migration.sql
```

### Step 3 — Verify in Prisma Studio

```bash
npx prisma studio
```

Confirm: `Contact` table exists with all columns. `applicationId` foreign key is present.

### Step 4 — Create the Zod schema

Create `lib/schemas/contact.ts`:

```typescript
// lib/schemas/contact.ts
import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().optional(),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
  applicationId: z.string().min(1, "Application ID is required"),
});

export const updateContactSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  role: z.string().optional(),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
```

### DoD check

| Confirmed | How                                                                                                                                   | Item                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [x]       | `npx prisma studio` — open in browser, confirm `Contact` table exists with all columns and `applicationId` foreign key is present     | `prisma/schema.prisma` contains `Contact` model linked to `Application` |
| [x]       | File tree — confirm `prisma/migrations/` contains a folder named `TIMESTAMP_add_contact_model` with `migration.sql` inside            | Migration file committed to `prisma/migrations/`                        |
| [x]       | File tree — confirm `lib/schemas/contact.ts` exists and exports `createContactSchema`, `updateContactSchema` and their inferred types | `lib/schemas/contact.ts` created with all schemas and types             |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                                                           | TypeScript clean                                                        |

---

## PBI-018 — Add / Edit Contact Per Application

**Goal:** `POST /api/contacts` creates a contact. `PATCH /api/contacts/[id]` updates it. `DELETE /api/contacts/[id]` removes it.

### Step 1 — Create `app/api/contacts/route.ts`

```typescript
// app/api/contacts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { createContactSchema } from "@/lib/schemas/contact";

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const result = createContactSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 },
    );

  // Verify the application belongs to the user
  const application = await prisma.application.findFirst({
    where: {
      id: result.data.applicationId,
      userId: user.userId,
      deletedAt: null,
    },
  });
  if (!application)
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    );

  const contact = await prisma.contact.create({ data: result.data });
  return NextResponse.json(contact, { status: 201 });
}
```

### Step 2 — Create `app/api/contacts/[id]/route.ts`

```typescript
// app/api/contacts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { updateContactSchema } from "@/lib/schemas/contact";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await getUserFromRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const result = updateContactSchema.safeParse(body);
  if (!result.success)
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 },
    );

  // Verify contact belongs to the user via application
  const contact = await prisma.contact.findFirst({
    where: { id, application: { userId: user.userId } },
  });
  if (!contact)
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  const updated = await prisma.contact.update({
    where: { id },
    data: result.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await getUserFromRequest(request);
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const contact = await prisma.contact.findFirst({
    where: { id, application: { userId: user.userId } },
  });
  if (!contact)
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  await prisma.contact.delete({ where: { id } });
  return NextResponse.json({ message: "Contact deleted" });
}
```

### Step 3 - Create test files

### API route tests

Create `__tests__/api.contacts.test.ts`:

```typescript
/**
 * @jest-environment node
 */
// __tests__/api.contacts.test.ts
import { POST } from "@/app/api/contacts/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: { findFirst: jest.fn() },
    contact: { create: jest.fn() },
  },
}));

jest.mock("@/lib/auth", () => ({
  getUserFromRequest: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindFirst = prisma.application.findFirst as jest.Mock;
const mockCreate = prisma.contact.create as jest.Mock;

const makeRequest = (body: object) =>
  new NextRequest("http://localhost/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = { name: "Jane Smith", applicationId: "app-1" };

beforeEach(() => jest.clearAllMocks());

describe("POST /api/contacts", () => {
  it("returns 401 when no session", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 400 on validation failure", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1", email: "a@b.com" });
    const res = await POST(makeRequest({ applicationId: "app-1" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when application not found or belongs to another user", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1", email: "a@b.com" });
    mockFindFirst.mockResolvedValue(null);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(404);
  });

  it("returns 201 with created contact on valid request", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1", email: "a@b.com" });
    mockFindFirst.mockResolvedValue({ id: "app-1", userId: "user-1" });
    mockCreate.mockResolvedValue({ id: "contact-1", ...validBody });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe("Jane Smith");
  });
});
```

Create `__tests__/api.contacts.[id].test.ts`:

```typescript
/**
 * @jest-environment node
 */
// __tests__/api.contacts.[id].test.ts
import { PATCH, DELETE } from "@/app/api/contacts/[id]/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    contact: {
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  getUserFromRequest: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const mockGetUser = getUserFromRequest as jest.Mock;
const mockFindFirst = prisma.contact.findFirst as jest.Mock;
const mockUpdate = prisma.contact.update as jest.Mock;
const mockDelete = prisma.contact.delete as jest.Mock;

const makeRequest = (body: object) =>
  new NextRequest("http://localhost/api/contacts/contact-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const params = Promise.resolve({ id: "contact-1" });

const existingContact = {
  id: "contact-1",
  applicationId: "app-1",
  name: "Jane Smith",
  role: null,
  email: null,
  phone: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => jest.clearAllMocks());

describe("PATCH /api/contacts/[id]", () => {
  it("returns 401 when no session", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ name: "Updated" }), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when contact not found", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1", email: "a@b.com" });
    mockFindFirst.mockResolvedValue(null);
    const res = await PATCH(makeRequest({ name: "Updated" }), { params });
    expect(res.status).toBe(404);
  });

  it("returns 200 with updated contact", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1", email: "a@b.com" });
    mockFindFirst.mockResolvedValue(existingContact);
    mockUpdate.mockResolvedValue({ ...existingContact, name: "Updated" });
    const res = await PATCH(makeRequest({ name: "Updated" }), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe("Updated");
  });
});

describe("DELETE /api/contacts/[id]", () => {
  it("returns 401 when no session", async () => {
    mockGetUser.mockResolvedValue(null);
    const res = await DELETE(makeRequest({}), { params });
    expect(res.status).toBe(401);
  });

  it("returns 404 when contact not found", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1", email: "a@b.com" });
    mockFindFirst.mockResolvedValue(null);
    const res = await DELETE(makeRequest({}), { params });
    expect(res.status).toBe(404);
  });

  it("returns 200 on successful delete", async () => {
    mockGetUser.mockResolvedValue({ userId: "user-1", email: "a@b.com" });
    mockFindFirst.mockResolvedValue(existingContact);
    mockDelete.mockResolvedValue(existingContact);
    const res = await DELETE(makeRequest({}), { params });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Contact deleted");
  });
});
```

### Component tests

Create `__tests__/ContactForm.test.tsx`:

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContactForm from "@/components/ContactForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

describe("ContactForm", () => {
  it("renders name field", () => {
    render(<ContactForm applicationId="app-1" />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it("shows validation error when name is empty", async () => {
    render(<ContactForm applicationId="app-1" />);
    fireEvent.click(screen.getByRole("button", { name: /add contact/i }));
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it("submits successfully with valid data", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    render(<ContactForm applicationId="app-1" />);
    await userEvent.type(screen.getByLabelText(/name/i), "Jane Smith");
    fireEvent.click(screen.getByRole("button", { name: /add contact/i }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/contacts",
        expect.objectContaining({ method: "POST" })
      );
    });
  });
});
```

---

### DoD check

| Confirmed | How                                                                                                        | Item                                                                                            |
| --------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [x]       | Run `npm test -- --testPathPatterns="api.contacts"` — confirm `Tests: 10 passed, 10 total` with 0 failures | `POST /api/contacts` and `PATCH`/`DELETE /api/contacts/[id]` — all 10 route behaviours verified |
| [x]       | `npx tsc --noEmit` passes clean in terminal — output shows 0 errors                                        | TypeScript clean                                                                                |

---

## PBI-019 — Contact List View on Application Detail Page

**Goal:** The application detail page shows all contacts linked to that application.

### Step 1 — Create `components/ContactList.tsx`

```typescript
// components/ContactList.tsx
import { Contact } from "@prisma/client";

interface ContactListProps {
  contacts: Contact[];
}

export default function ContactList({ contacts }: ContactListProps) {
  if (contacts.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No contacts yet. Add a contact to track who you spoke with.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {contacts.map((contact) => (
        <li key={contact.id} className="py-3">
          <p className="text-sm font-medium text-gray-900">{contact.name}</p>
          {contact.role && (
            <p className="text-xs text-gray-500">{contact.role}</p>
          )}
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="text-xs text-indigo-600 hover:underline"
            >
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <p className="text-xs text-gray-500">{contact.phone}</p>
          )}
          {contact.notes && (
            <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">
              {contact.notes}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
```

### Step 2 — Update `app/dashboard/applications/[id]/page.tsx`

Add `include` to the existing Prisma query:

```typescript
const application = await prisma.application.findFirst({
  where: { id, userId, deletedAt: null },
  include: { contacts: { orderBy: { createdAt: "asc" } } },
});
```

Add to the JSX below the details card and actions:

```typescript
{/* Contacts section */}
<div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
  <h2 className="mb-4 text-sm font-semibold text-gray-900">Contacts</h2>
  <ContactList contacts={application.contacts} />
  <div className="mt-4 border-t border-gray-100 pt-4">
    <h3 className="mb-3 text-sm font-medium text-gray-700">Add Contact</h3>
    <ContactForm applicationId={id} />
  </div>
</div>
```

### Step 3 - Create `__tests__/ContactList.test.tsx`:

```typescript
import { render, screen } from "@testing-library/react";
import ContactList from "@/components/ContactList";
import { Contact } from "@prisma/client";

const mockContact = (overrides?: Partial<Contact>): Contact => ({
  id:            "contact-1",
  applicationId: "app-1",
  name:          "Jane Smith",
  role:          "Hiring Manager",
  email:         "jane@acme.com",
  phone:         null,
  notes:         null,
  createdAt:     new Date(),
  updatedAt:     new Date(),
  ...overrides,
});

describe("ContactList", () => {
  it("shows empty state when no contacts", () => {
    render(<ContactList contacts={[]} />);
    expect(screen.getByText(/no contacts yet/i)).toBeInTheDocument();
  });

  it("renders contact name and role", () => {
    render(<ContactList contacts={[mockContact()]} />);
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Hiring Manager")).toBeInTheDocument();
  });

  it("renders contact email as mailto link", () => {
    render(<ContactList contacts={[mockContact()]} />);
    expect(screen.getByText("jane@acme.com")).toBeInTheDocument();
  });
});
```

---

### DoD check

| Confirmed | How                                                                                                          | Item                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| [x]       | Browser — open any application detail page, confirm a **Contacts** section is visible below the details card | Contacts section renders on detail page                                 |
| [x]       | Browser — open an application with no contacts, confirm "No contacts yet." message appears                   | Empty state shown when no contacts exist                                |
| [x]       | Browser — add a contact via the form, confirm it immediately appears in the contact list after submission    | Contact appears in list after successful submission                     |
| [x]       | `npm test`                                                                                                   | `ContactList` renders empty state when no contacts                      |
| [x]       | `npm test`                                                                                                   | `ContactList` renders contact name, role, and email when contacts exist |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                                  | TypeScript clean                                                        |

---

## PBI-020 — Follow-Up Date Field on Application

**Goal:** Verify the `followUpAt` field is fully functional end-to-end per spec.md acceptance criteria.

**Note:** `followUpAt` was added to the schema and form in Sprint 2 but was not in the Sprint 2 DoD. This PBI formally verifies it meets the spec.

### DoD check

| Confirmed | How                                                                                                                                   | Item                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| [x]       | `npx prisma studio` — confirm `followUpAt` column exists on `Application` table and accepts null                                      | `followUpAt` field exists in schema                |
| [x]       | Browser — create a new application, set a follow-up date, submit, open the detail page, confirm the follow-up date displays correctly | Follow-up date saves and displays on detail page   |
| [x]       | Browser — edit an existing application, change the follow-up date, save, confirm the updated date shows on the detail page            | Follow-up date updates correctly on edit           |
| [x]       | Browser — create an application with no follow-up date, confirm no follow-up row appears on the detail page                           | Follow-up date is optional — no display when empty |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                                                           | TypeScript clean                                   |

---

## PBI-021 — Overdue Follow-Up Indicator on Dashboard

**Goal:** Verify the overdue follow-up indicator is fully functional per spec.md acceptance criteria.

**Note:** The overdue indicator was implemented in Sprint 2 on `ApplicationCard` and the detail page but was not in the Sprint 2 DoD. This PBI formally verifies it meets the spec.

### DoD check

| Confirmed | How                                                                                                                                                                           | Item                                                     |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| [x]       | Browser — create an application with a follow-up date set to yesterday, go to `/dashboard`, confirm the red "⚠ Follow-up overdue" indicator appears on that card in list view | Overdue indicator shows on dashboard card in list view   |
| [x]       | Browser — switch to Kanban view, confirm the same card shows the overdue indicator                                                                                            | Overdue indicator shows in Kanban view                   |
| [x]       | Browser — open the detail page of an overdue application, confirm the red "⚠ Follow-up is overdue" banner appears below the details card                                      | Overdue banner shows on detail page                      |
| [x]       | Browser — create an application with a follow-up date set to tomorrow, confirm no overdue indicator appears                                                                   | Future follow-up date does not trigger overdue indicator |
| [x]       | Browser — create an application with no follow-up date, confirm no overdue indicator appears                                                                                  | Empty follow-up date does not trigger overdue indicator  |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                                                                                                   | TypeScript clean                                         |

---

## PBI-024 — Summary Stats Bar

**Goal:** The dashboard shows a stats bar with total applications, active applications, interviews, and offers.

### Step 1 — Create `components/StatsBar.tsx`

```typescript
// components/StatsBar.tsx
import { Application } from "@prisma/client";

interface StatsBarProps {
  applications: Application[];
}

export default function StatsBar({ applications }: StatsBarProps) {
  const total      = applications.length;
  const active     = applications.filter((a) => a.stage !== "CLOSED").length;
  const interviews = applications.filter((a) => a.stage === "INTERVIEW").length;
  const offers     = applications.filter((a) => a.stage === "OFFER").length;

  const stats = [
    { label: "Total",      value: total },
    { label: "Active",     value: active },
    { label: "Interviews", value: interviews },
    { label: "Offers",     value: offers },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
```

### Step 2 — Add `StatsBar` to `components/DashboardClient.tsx`

Import and render above the header div:

```typescript
import StatsBar from "./StatsBar";

// Inside the return, above the header div:
<StatsBar applications={applications} />
```

### Step 3 - Create `__tests__/StatsBar.test.tsx`

```typescript
import { render, screen } from "@testing-library/react";
import StatsBar from "@/components/StatsBar";
import { Application, ApplicationStage } from "@prisma/client";

const mockApp = (stage: ApplicationStage): Application => ({
  id:         `app-${stage}`,
  userId:     "user-1",
  company:    "Acme",
  role:       "Engineer",
  location:   null,
  salary:     null,
  jobUrl:     null,
  stage,
  appliedAt:  new Date(),
  followUpAt: null,
  notes:      null,
  deletedAt:  null,
  createdAt:  new Date(),
  updatedAt:  new Date(),
});

describe("StatsBar", () => {
  it("renders all four stat labels", () => {
    render(<StatsBar applications={[]} />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Interviews")).toBeInTheDocument();
    expect(screen.getByText("Offers")).toBeInTheDocument();
  });

  it("renders correct total count", () => {
    render(<StatsBar applications={[mockApp("APPLIED"), mockApp("OFFER")]} />);
    const values = screen.getAllByText("2");
    expect(values.length).toBeGreaterThan(0);
  });

  it("excludes CLOSED from active count", () => {
    render(<StatsBar applications={[mockApp("APPLIED"), mockApp("CLOSED")]} />);
    const activeLabel = screen.getByText("Active");
    expect(activeLabel.previousSibling?.textContent).toBe("1");
  });
});
```

### DoD check

| Confirmed | How                                                                                                  | Item                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [x]       | Browser — go to `/dashboard`, confirm four stat cards are visible: Total, Active, Interviews, Offers | Stats bar renders on dashboard                                          |
| [x]       | Browser — create an application in INTERVIEW stage, confirm Interviews count increments by 1         | Interviews count reflects current data                                  |
| [x]       | Browser — create an application in OFFER stage, confirm Offers count increments by 1                 | Offers count reflects current data                                      |
| [x]       | Browser — move an application to CLOSED via Kanban, confirm Active count decrements by 1             | Active count excludes CLOSED applications                               |
| [x]       | `npm test`                                                                                           | `StatsBar` renders correct counts for total, active, interviews, offers |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                          | TypeScript clean                                                        |

---

## PBI-025 — Pipeline Stage Distribution

**Goal:** The dashboard shows a visual breakdown of applications by stage as a proportional bar with legend.

### Step 1 — Create `components/PipelineChart.tsx`

```typescript
// components/PipelineChart.tsx
import { Application, ApplicationStage } from "@prisma/client";

const STAGES: ApplicationStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "CLOSED",
];

const STAGE_COLOURS: Record<ApplicationStage, string> = {
  APPLIED:    "bg-blue-400",
  SCREENING:  "bg-yellow-400",
  INTERVIEW:  "bg-purple-400",
  ASSESSMENT: "bg-orange-400",
  OFFER:      "bg-green-400",
  CLOSED:     "bg-gray-300",
};

interface PipelineChartProps {
  applications: Application[];
}

export default function PipelineChart({ applications }: PipelineChartProps) {
  const total = applications.length;

  const counts = STAGES.reduce(
    (acc, stage) => {
      acc[stage] = applications.filter((a) => a.stage === stage).length;
      return acc;
    },
    {} as Record<ApplicationStage, number>
  );

  if (total === 0) {
    return (
      <p className="text-sm text-gray-500">
        No applications yet. Add applications to see your pipeline distribution.
      </p>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">
        Pipeline Distribution
      </h2>

      {/* Proportional bar */}
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        {STAGES.map((stage) => {
          const pct = total > 0 ? (counts[stage] / total) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={stage}
              className={`${STAGE_COLOURS[stage]} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${stage}: ${counts[stage]}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3">
        {STAGES.map((stage) => (
          <div key={stage} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${STAGE_COLOURS[stage]}`} />
            <span className="text-xs text-gray-600">
              {stage.charAt(0) + stage.slice(1).toLowerCase()} ({counts[stage]})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Step 2 — Add `PipelineChart` to `components/DashboardClient.tsx`

Import and render below `StatsBar`:

```typescript
import PipelineChart from "./PipelineChart";

// Inside the return, below StatsBar:
<PipelineChart applications={applications} />
```

---

### Step 3 - Create `__tests__/PipelineChart.test.tsx`

```typescript
import { render, screen } from "@testing-library/react";
import PipelineChart from "@/components/PipelineChart";
import { Application, ApplicationStage } from "@prisma/client";

const mockApp = (stage: ApplicationStage): Application => ({
  id:         `app-${stage}`,
  userId:     "user-1",
  company:    "Acme",
  role:       "Engineer",
  location:   null,
  salary:     null,
  jobUrl:     null,
  stage,
  appliedAt:  new Date(),
  followUpAt: null,
  notes:      null,
  deletedAt:  null,
  createdAt:  new Date(),
  updatedAt:  new Date(),
});

describe("PipelineChart", () => {
  it("shows empty state when no applications", () => {
    render(<PipelineChart applications={[]} />);
    expect(screen.getByText(/no applications yet/i)).toBeInTheDocument();
  });

  it("renders Pipeline Distribution heading when applications exist", () => {
    render(<PipelineChart applications={[mockApp("APPLIED")]} />);
    expect(screen.getByText(/pipeline distribution/i)).toBeInTheDocument();
  });

  it("renders legend with stage counts", () => {
    render(<PipelineChart applications={[mockApp("APPLIED"), mockApp("OFFER")]} />);
    expect(screen.getByText(/applied \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/offer \(1\)/i)).toBeInTheDocument();
  });
});
```

---

### DoD check

| Confirmed | How                                                                                                                           | Item                                                          |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [x]       | Browser — go to `/dashboard` with at least one application, confirm the pipeline distribution bar and legend are visible      | Pipeline chart renders on dashboard                           |
| [x]       | Browser — confirm each stage in the legend shows the correct count for your current data                                      | Stage counts are accurate                                     |
| [x]       | Browser — log in with an account that has no applications, confirm "No applications yet" message appears instead of the chart | Empty state shown when no applications                        |
| [x]       | `npm test`                                                                                                                    | `PipelineChart` renders empty state when no applications      |
| [x]       | `npm test`                                                                                                                    | `PipelineChart` renders a bar segment for each non-zero stage |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                                                   | TypeScript clean                                              |

---

## PBI-029 — General Notes Field Per Application

**Goal:** Verify the `notes` field is fully functional end-to-end per spec.md acceptance criteria.

**Note:** `notes` was added to the schema and form in Sprint 2 but was not explicitly verified in the Sprint 2 DoD. This PBI formally verifies it meets the spec.

### DoD check

| Confirmed | How                                                                                                                           | Item                                    |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| [x]       | Browser — create a new application with notes filled in, open the detail page, confirm the notes display in the Notes section | Notes save and display on detail page   |
| [x]       | Browser — edit an existing application, change the notes, save, confirm the updated notes show on the detail page             | Notes update correctly on edit          |
| [x]       | Browser — create an application with no notes, confirm no Notes section appears on the detail page                            | Notes section hidden when empty         |
| [x]       | Browser — enter multi-line notes, confirm they display with correct line breaks on the detail page                            | Notes render with `whitespace-pre-wrap` |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                                                   | TypeScript clean                        |

---

## PBI-043 — README.md

**Goal:** A complete README committed to the project root covering project overview, setup, architecture, and tech stack.

### Create `README.md` at project root

````markdown
# HireTrace

A job application pipeline tracker built in public using Spec-Driven Development.

Track applications, contacts, and follow-up reminders across a 6-stage Kanban pipeline.

**Live:** [hiretrace.vercel.app](https://hiretrace.vercel.app) _(update with production URL)_
**LinkedIn build series:** [Posts 01–24](https://linkedin.com/in/yourprofile) _(update with profile URL)_

---

## Tech Stack

| Layer      | Technology            | Version     |
| ---------- | --------------------- | ----------- |
| Framework  | Next.js               | 15.5.15     |
| Language   | TypeScript            | strict      |
| Styling    | Tailwind CSS          | 4.x         |
| ORM        | Prisma                | 5.22.0      |
| Database   | PostgreSQL 17         | Neon        |
| Auth       | jose + bcryptjs       | 5.x / 2.x   |
| Validation | Zod + react-hook-form | 3.x / 7.x   |
| Testing    | RTL + Jest            | 14.x / 29.x |
| Deployment | Vercel                | Hobby       |

---

## Local Setup

### Prerequisites

- Node.js 18.17+
- npm 9+
- A [Neon](https://neon.tech) account (free)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/eonerhime/hiretrace.git
cd hiretrace

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, DIRECT_URL, JWT_SECRET in .env.local

# 4. Run migrations
npx prisma migrate dev

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable       | Description                        |
| -------------- | ---------------------------------- |
| `DATABASE_URL` | Neon pooled connection string      |
| `DIRECT_URL`   | Neon direct connection string      |
| `JWT_SECRET`   | Min 32-char secret for JWT signing |

---

## Architecture

```
Browser → Vercel Edge → middleware.ts (JWT) → App Router → Prisma → Neon PostgreSQL
```

- **Auth:** HTTP-only JWT cookie. `middleware.ts` uses Web Crypto API (Edge compatible). API routes use `jose`.
- **Rendering:** Server Components by default. Client Components only where interactivity is required.
- **State:** `DashboardClient` owns application state shared between list and Kanban views.
- **Soft delete:** Applications are never hard deleted — `deletedAt` timestamp marks deletion.

---

## Branch Strategy

```
main (production) ← develop (integration) ← feature/sprint-XX-desc
```

- All application code on feature branches
- Control docs committed directly to `develop`
- `develop` → `main` merged at MVP gate only

---

## Running Tests

```bash
npm test
```

---

## Project Documentation

All SDD documents live in `/docs`:

- `product.md` — backlog and PBI definitions
- `plan.md` — sprint plan and capacity model
- `spec.md` — acceptance criteria per PBI
- `implementation.md` — ADR log and technical decisions
- `sprints/` — per-sprint artifacts

---

_Built in public. Documented with Spec-Driven Development._
````

### DoD check

| Confirmed | How                                                                                                                           | Item                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [x]       | File tree — confirm `README.md` exists at project root                                                                        | README.md committed at project root |
| [x]       | Browser — open `https://github.com/eonerhime/hiretrace` on GitHub, confirm README renders correctly with all sections visible | README renders correctly on GitHub  |
| [x]       | Read-through — confirm tech stack table matches actual installed versions                                                     | Tech stack versions are accurate    |
| [x]       | Read-through — confirm setup steps work end-to-end on a clean clone                                                           | Setup instructions are accurate     |
| [x]       | `npx tsc --noEmit` passes clean in terminal                                                                                   | TypeScript clean                    |

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
git commit -m "[PBI-017 to PBI-043] Sprint 3: Contacts, reminders, dashboard stats, README"
git push origin feature/sprint-03-contacts
```

Open a PR on GitHub: `feature/sprint-03-contacts → develop`. Use the sprint goal as the PR title:

> **Sprint 3: The MVP is complete. Users can track contacts, set follow-up reminders, and see their pipeline state at a glance on the dashboard.**

Merge to `develop`. Verify the Vercel preview. Then merge `develop → main` — the MVP gate is cleared.

---

## Sprint Close Checklist

After the PR is merged to `develop`:

- [x] Mark all 9 PBIs `[x]` in `sprint-03.md`
- [x] Mark all 9 PBIs `[x]` in `product.md`
- [x] Complete `sprint-03.md` Sprint Review and Retrospective sections
- [x] Fill retro insight in `sprint-03.md` for LinkedIn
- [x] Commit updated docs directly to `develop`: `git commit -m "[DOCS] Sprint 3 close — update sprint-03.md, product.md"`
- [x] Update Notion Sprint Board: Sprint 3 → ✅ Closed, Sprint 4 → 🔄 In progress
- [x] Add Sprint 3 Changelog entry to Notion
- [x] MVP Phase Gate verified and date recorded in `sprint-03.md`
- [x] Merge `develop` → `main` (MVP gate cleared)
- [x] `plan.md` Sprint Summary Table updated with close date

---

_sprint-03-implementation.md — 23 April 2026 — HireTrace_
_Branch: `feature/sprint-03-contacts`. Follow PBIs in dependency order. Run `npm run build` locally before every push. Pin all packages._
