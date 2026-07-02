# Sprint 8 — Browser Extension Implementation

## Create a new branch

```bash
# 1. Finish Sprint 7 — merge it up before starting Sprint 8
git checkout develop
git pull origin develop
git merge feature/sprint-07-legal-pages
git push origin develop

# 2. Update main from develop (your usual release step)
git checkout main
git pull origin main
git merge develop
git push origin main

# 3. Sync develop back from main (keeps both pointers identical post-release)
git checkout develop
git pull origin main
git push origin develop

# 4. Cut Sprint 8 branch from the now-current develop
git checkout -b feature/sprint-08-browser-extension
git push -u origin feature/sprint-08-browser-extension
```

---

## New Packages (pinned versions)

### App side (HireFlow repo root — for the new API key feature)

```bash
npm install bcryptjs --legacy-peer-deps   # already in use — reused for key hashing, no new install needed
```

No new packages required on the app side. PBI-058/059 reuse existing `bcryptjs`, `zod`, and Prisma.

### Extension side (new `extension/` workspace)

```bash
# from the repo root, on feature/sprint-08-browser-extension
mkdir extension
cd extension
npm init -y
npm install react@19.2.4 react-dom@19.2.4 --legacy-peer-deps
npm install -D vite@5.4.11 @crxjs/vite-plugin@2.0.0-beta.31 --legacy-peer-deps
npm install -D typescript@5.6.3 @types/chrome@0.0.287 --legacy-peer-deps
npm install -D tailwindcss@4.0.0 @tailwindcss/vite@4.0.0 --legacy-peer-deps
npm install -D @playwright/test@1.51.1 --legacy-peer-deps
```

> **Never `@latest`.** Versions above are current stable as of this sprint — verify on npm before installing and pin exactly.

---

## Prisma Schema Addition

```prisma
// prisma/schema.prisma

model ApiKey {
  id         String    @id @default(cuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  keyHash    String    @unique
  label      String    @default("Browser Extension")
  lastUsedAt DateTime?
  createdAt  DateTime  @default(now())
  revokedAt  DateTime?

  @@index([userId])
}
```

Add the inverse relation to `User`:

```prisma
model User {
  // ...existing fields
  apiKeys ApiKey[]
}
```

Apply with:

```bash
npx prisma db push
npx prisma generate
```

---

## PBI-058 — API Key Authentication

### `lib/api-key.ts`

```typescript
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const KEY_PREFIX = "htk_";

/**
 * Generates a new API key for a user. Revokes any existing active key
 * (v1 supports one active key per user — simpler UX, fewer edge cases).
 * Returns the PLAINTEXT key — this is the only time it is ever available.
 */
export async function generateApiKey(userId: string): Promise<string> {
  const rawKey = KEY_PREFIX + randomBytes(32).toString("base64url");
  const keyHash = await bcrypt.hash(rawKey, 10);

  // Revoke any existing active key for this user
  await prisma.apiKey.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await prisma.apiKey.create({
    data: { userId, keyHash, label: "Browser Extension" },
  });

  return rawKey;
}

/**
 * Validates a raw API key against stored hashes.
 * Returns the associated userId if valid and not revoked, otherwise null.
 *
 * Note: bcrypt.compare must be run against every active hash since we
 * cannot look up by hash directly (bcrypt hashes are non-deterministic).
 * With one active key per user, this is a single comparison in practice.
 */
export async function validateApiKey(
  rawKey: string,
): Promise<{ userId: string } | null> {
  if (!rawKey.startsWith(KEY_PREFIX)) return null;

  const activeKeys = await prisma.apiKey.findMany({
    where: { revokedAt: null },
    select: { id: true, userId: true, keyHash: true },
  });

  for (const key of activeKeys) {
    const isMatch = await bcrypt.compare(rawKey, key.keyHash);
    if (isMatch) {
      // Fire-and-forget — never block the request on this write
      void prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() },
      });
      return { userId: key.userId };
    }
  }

  return null;
}

export async function revokeApiKey(userId: string): Promise<void> {
  await prisma.apiKey.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
```

> **Scaling note:** Iterating all active keys with `bcrypt.compare` is fine at small scale (one key per user, low user count). If HireFlow grows significantly, switch to a fast deterministic lookup hash (SHA-256) for the lookup index, with bcrypt only as defense-in-depth — but that's a future ADR, not this sprint.

### `lib/auth-helpers.ts` — unified auth check for API routes

```typescript
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { validateApiKey } from "@/lib/api-key";
import { NextRequest } from "next/server";

interface AuthResult {
  userId: string;
  via: "session" | "apiKey";
}

/**
 * Accepts either a NextAuth session OR a valid API key in the
 * Authorization header. Used by routes that must support both the
 * dashboard (session) and the extension (API key).
 */
export async function getAuthenticatedUser(
  req: NextRequest,
): Promise<AuthResult | null> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return { userId: session.user.id, via: "session" };
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const rawKey = authHeader.slice("Bearer ".length).trim();
    const result = await validateApiKey(rawKey);
    if (result) return { userId: result.userId, via: "apiKey" };
  }

  return null;
}
```

### API route — `app/api/settings/api-key/route.ts`

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { generateApiKey, revokeApiKey } from "@/lib/api-key";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawKey = await generateApiKey(session.user.id);

  void logActivity({
    userId: session.user.id,
    action: "API_KEY_GENERATED",
    metadata: undefined,
  });

  // Plaintext key is returned ONCE — never retrievable again
  return NextResponse.json({ apiKey: rawKey }, { status: 201 });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await revokeApiKey(session.user.id);

  void logActivity({
    userId: session.user.id,
    action: "API_KEY_REVOKED",
    metadata: undefined,
  });

  return NextResponse.json({ revoked: true });
}
```

### Settings UI addition — `components/ApiKeyCard.tsx`

```tsx
"use client";

import { useState } from "react";

export default function ApiKeyCard() {
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings/api-key", { method: "POST" });
      const data = await res.json();
      setGeneratedKey(data.apiKey);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async () => {
    await fetch("/api/settings/api-key", { method: "DELETE" });
    setGeneratedKey(null);
  };

  const handleCopy = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 dark:border dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Browser Extension
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Generate a key to connect the HireFlow browser extension to your
        account.
      </p>

      {generatedKey ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-md bg-amber-50 dark:bg-amber-900/30 px-3 py-2 text-sm text-amber-800 dark:text-amber-300">
            Copy this key now — it will not be shown again.
          </div>
          <div className="flex gap-2">
            <code className="flex-1 truncate rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-xs text-gray-800 dark:text-gray-200">
              {generatedKey}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            type="button"
            onClick={handleRevoke}
            className="text-sm text-red-600 hover:underline dark:text-red-400"
          >
            Revoke key
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Generating..." : "Generate API Key"}
        </button>
      )}
    </div>
  );
}
```

### Test file — `__tests__/api.settings.api-key.test.ts`

```typescript
/**
 * @jest-environment node
 */
import { POST, DELETE } from "@/app/api/settings/api-key/route";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

jest.mock("next-auth/next");
jest.mock("@/lib/prisma", () => ({
  prisma: {
    apiKey: {
      updateMany: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockSession = { user: { id: "user-1", email: "test@example.com" } };

describe("POST /api/settings/api-key", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await POST();
    expect(res.status).toBe(401);
  });

  it("generates and returns a plaintext key when authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.apiKey.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.apiKey.create as jest.Mock).mockResolvedValue({ id: "key-1" });

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.apiKey).toMatch(/^htk_/);
  });
});

describe("DELETE /api/settings/api-key", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when not authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    const res = await DELETE();
    expect(res.status).toBe(401);
  });

  it("revokes the active key when authenticated", async () => {
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.apiKey.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const res = await DELETE();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.revoked).toBe(true);
  });
});
```

---

## PBI-059 — Extension Application Endpoint

### `lib/schemas/extension.ts`

```typescript
import { z } from "zod";

export const extensionApplicationSchema = z.object({
  company: z.string().min(1, "Company is required").max(200),
  role: z.string().min(1, "Role is required").max(200),
  location: z.string().max(200).optional(),
  jobUrl: z.string().url("Must be a valid URL"),
  source: z.enum(["linkedin", "manual"]),
  notes: z.string().max(2000).optional(),
});

export type ExtensionApplicationInput = z.infer<
  typeof extensionApplicationSchema
>;
```

### `app/api/extension/applications/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { extensionApplicationSchema } from "@/lib/schemas/extension";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = extensionApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { company, role, location, jobUrl, source, notes } = parsed.data;

  // Duplicate detection — same user, same jobUrl
  const existing = await prisma.application.findFirst({
    where: { userId: auth.userId, jobUrl, deletedAt: null },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Already tracked", applicationId: existing.id },
      { status: 409 },
    );
  }

  const application = await prisma.application.create({
    data: {
      userId: auth.userId,
      company,
      role,
      location,
      jobUrl,
      source,
      stage: "APPLIED",
      notes: notes ? [{ content: notes, stage: "APPLIED" }] : undefined,
    },
  });

  void logActivity({
    userId: auth.userId,
    action: "APPLICATION_CREATED_VIA_EXTENSION",
    metadata: { applicationId: application.id, source } ?? undefined,
  });

  return NextResponse.json(
    {
      id: application.id,
      company: application.company,
      role: application.role,
      createdAt: application.createdAt.toISOString(),
    },
    { status: 201 },
  );
}
```

### Test file — `__tests__/api.extension.applications.test.ts`

```typescript
/**
 * @jest-environment node
 */
import { POST } from "@/app/api/extension/applications/route";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

jest.mock("@/lib/auth-helpers");
jest.mock("@/lib/prisma", () => ({
  prisma: {
    application: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));
jest.mock("@/lib/activity", () => ({ logActivity: jest.fn() }));

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/extension/applications", {
    method: "POST",
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe("POST /api/extension/applications", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 with no auth", async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue(null);
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(401);
  });

  it("returns 400 on invalid payload", async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      userId: "u1",
      via: "apiKey",
    });
    const res = await POST(makeRequest({ company: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 409 when jobUrl already tracked", async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      userId: "u1",
      via: "apiKey",
    });
    (prisma.application.findFirst as jest.Mock).mockResolvedValue({
      id: "existing-1",
    });

    const res = await POST(
      makeRequest({
        company: "Acme",
        role: "Engineer",
        jobUrl: "https://linkedin.com/jobs/123",
        source: "linkedin",
      }),
    );

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.applicationId).toBe("existing-1");
  });

  it("creates application on valid payload", async () => {
    (getAuthenticatedUser as jest.Mock).mockResolvedValue({
      userId: "u1",
      via: "apiKey",
    });
    (prisma.application.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.application.create as jest.Mock).mockResolvedValue({
      id: "new-1",
      company: "Acme",
      role: "Engineer",
      createdAt: new Date("2026-06-18T00:00:00.000Z"),
    });

    const res = await POST(
      makeRequest({
        company: "Acme",
        role: "Engineer",
        jobUrl: "https://linkedin.com/jobs/123",
        source: "linkedin",
      }),
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe("new-1");
  });
});
```

---

## PBI-060 — Extension Scaffold

### `extension/manifest.json`

```json
{
  "manifest_version": 3,
  "name": "HireFlow Capture",
  "version": "1.0.0",
  "description": "Capture job applications directly into HireFlow.",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "permissions": ["activeTab", "storage", "scripting"],
  "host_permissions": ["https://hireFlow-ten.vercel.app/*"],
  "action": {
    "default_popup": "src/popup/index.html"
  },
  "content_scripts": [
    {
      "matches": ["https://*.linkedin.com/jobs/*"],
      "js": ["src/content/linkedin.ts"],
      "run_at": "document_idle"
    }
  ],
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  }
}
```

### `extension/vite.config.ts`

```typescript
import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import manifest from "./manifest.json";

export default defineConfig({
  plugins: [crx({ manifest }), tailwindcss()],
});
```

### `extension/src/background/index.ts`

```typescript
// Background service worker — relays messages between content scripts
// and the popup, since they cannot communicate directly.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CAPTURED_DRAFT") {
    // Store the latest draft so the popup can read it when opened
    chrome.storage.local.set({ latestDraft: message.payload });
  }
  sendResponse({ received: true });
});
```

### `extension/src/lib/storage.ts`

```typescript
export interface StoredSettings {
  apiKey: string | null;
}

export async function getApiKey(): Promise<string | null> {
  const result = await chrome.storage.local.get("apiKey");
  return result.apiKey ?? null;
}

export async function setApiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ apiKey: key });
}

export async function clearApiKey(): Promise<void> {
  await chrome.storage.local.remove("apiKey");
}
```

### `extension/src/popup/Settings.tsx`

```tsx
import { useState, useEffect } from "react";
import { getApiKey, setApiKey } from "../lib/storage";

export default function Settings({ onConnected }: { onConnected: () => void }) {
  const [keyInput, setKeyInput] = useState("");
  const [existingKey, setExistingKey] = useState<string | null>(null);

  useEffect(() => {
    getApiKey().then(setExistingKey);
  }, []);

  const handleSave = async () => {
    if (!keyInput.startsWith("htk_")) {
      alert("That doesn't look like a valid HireFlow API key.");
      return;
    }
    await setApiKey(keyInput);
    onConnected();
  };

  if (existingKey) {
    return (
      <div className="p-4 text-sm text-gray-600">Connected to HireFlow.</div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-sm text-gray-600">
        Paste your API key from HireFlow → Settings → Browser Extension.
      </p>
      <input
        type="text"
        value={keyInput}
        onChange={(e) => setKeyInput(e.target.value)}
        placeholder="htk_..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <button
        onClick={handleSave}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Connect
      </button>
    </div>
  );
}
```

---

## PBI-061 — LinkedIn Content Script

### `extension/src/content/linkedin.ts`

```typescript
/**
 * LinkedIn Easy Apply capture.
 *
 * LinkedIn's DOM uses obfuscated/hashed class names that change without
 * notice. Every selector below targets a STRUCTURAL pattern (ARIA roles,
 * data attributes, heading hierarchy) rather than a specific class name,
 * to reduce breakage. If LinkedIn changes their markup, this script should
 * fail silently (no button shown) rather than throw.
 */

interface CapturedDraft {
  company: string;
  role: string;
  location: string;
  jobUrl: string;
  source: "linkedin";
}

function extractJobDetails(): CapturedDraft | null {
  try {
    // Job title: LinkedIn renders this as the top heading in the job detail pane
    const titleEl = document.querySelector("h1");
    const role = titleEl?.textContent?.trim();

    // Company name: typically the first link inside the job header area
    // that points to a /company/ URL
    const companyLink = document.querySelector<HTMLAnchorElement>(
      'a[href*="/company/"]',
    );
    const company = companyLink?.textContent?.trim();

    // Location: LinkedIn tags this with an aria-label or sits near the
    // company link in a tertiary text block — best-effort
    const locationEl = document.querySelector(
      '[class*="job-details"] span[dir="ltr"]',
    );
    const location = locationEl?.textContent?.trim() ?? "";

    // Canonical job URL — strip query params LinkedIn adds for tracking
    const url = new URL(window.location.href);
    const jobUrl = `${url.origin}${url.pathname}`;

    if (!role || !company) return null;

    return { company, role, location, jobUrl, source: "linkedin" };
  } catch {
    // Never let a DOM read crash the host page
    return null;
  }
}

function injectCaptureButton() {
  if (document.getElementById("hireFlow-capture-btn")) return; // already injected

  const draft = extractJobDetails();
  if (!draft) return; // silently do nothing if we can't confidently extract

  const button = document.createElement("button");
  button.id = "hireFlow-capture-btn";
  button.textContent = "Save to HireFlow";
  button.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  `;

  button.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "CAPTURED_DRAFT", payload: draft });
    chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
  });

  document.body.appendChild(button);
}

// LinkedIn is a single-page app — content loads dynamically as the user
// navigates between job postings without a full page reload, so we need
// a MutationObserver rather than running once on load.
const observer = new MutationObserver(() => {
  injectCaptureButton();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial attempt in case the relevant DOM is already present
injectCaptureButton();
```

---

## PBI-062 — Generic Fallback Capture

### `extension/src/content/generic.ts`

```typescript
/**
 * Generic capture — works on any page. Makes a best-effort guess at
 * role/company from the page title, but all fields are editable in the
 * review popup, so accuracy here is a convenience, not a requirement.
 */

interface GenericDraft {
  company: string;
  role: string;
  location: string;
  jobUrl: string;
  source: "manual";
}

const SEPARATORS = [" at ", " - ", " | ", " :: "];

function guessFromTitle(title: string): { role: string; company: string } {
  for (const sep of SEPARATORS) {
    if (title.includes(sep)) {
      const [first, second] = title.split(sep);
      return { role: first.trim(), company: second?.trim() ?? "" };
    }
  }
  return { role: title.trim(), company: "" };
}

export function captureGenericPage(): GenericDraft {
  const title = document.title || "";
  const { role, company } = guessFromTitle(title);

  return {
    company,
    role,
    location: "",
    jobUrl: window.location.href,
    source: "manual",
  };
}
```

This is invoked directly from the popup via `chrome.scripting.executeScript` rather than running as a persistent content script, since it only needs to run once on demand:

### `extension/src/popup/CaptureButton.tsx`

```tsx
import { captureGenericPage } from "../content/generic";

export default function CaptureButton({
  onCaptured,
}: {
  onCaptured: (draft: ReturnType<typeof captureGenericPage>) => void;
}) {
  const handleCapture = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: captureGenericPage,
    });

    const result = results[0]?.result;
    if (!result) return; // injection failed (e.g. restricted page) — silently no-op

    onCaptured(result);
  };

  return (
    <button
      onClick={handleCapture}
      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      Capture current page
    </button>
  );
}
```

---

## PBI-063 — Review and Submit Popup

### `extension/src/popup/ReviewForm.tsx`

```tsx
import { useState } from "react";
import { getApiKey } from "../lib/storage";

interface Draft {
  company: string;
  role: string;
  location: string;
  jobUrl: string;
  source: "linkedin" | "manual";
}

type SubmitState = "idle" | "loading" | "success" | "duplicate" | "error";

const API_BASE = "https://hireFlow-ten.vercel.app";

export default function ReviewForm({ draft }: { draft: Draft }) {
  const [form, setForm] = useState(draft);
  const [notes, setNotes] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [resultLink, setResultLink] = useState<string | null>(null);

  const handleSubmit = async () => {
    setState("loading");
    const apiKey = await getApiKey();

    try {
      const res = await fetch(`${API_BASE}/api/extension/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ ...form, notes: notes || undefined }),
      });

      const json = await res.json();

      if (res.status === 201) {
        setState("success");
        setResultLink(`${API_BASE}/dashboard/applications/${json.id}`);
      } else if (res.status === 409) {
        setState("duplicate");
        setResultLink(
          `${API_BASE}/dashboard/applications/${json.applicationId}`,
        );
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  };

  if (state === "success" || state === "duplicate") {
    return (
      <div className="p-4 space-y-2">
        <p className="text-sm font-medium text-gray-900">
          {state === "success" ? "Saved to HireFlow." : "Already tracked."}
        </p>
        <a
          href={resultLink ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          View in dashboard →
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 w-90">
      <div>
        <label className="block text-xs font-medium text-gray-700">
          Company
        </label>
        <input
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">Role</label>
        <input
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">
          Location
        </label>
        <input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>

      {state === "error" && (
        <p className="text-xs text-red-600">
          Something went wrong. Check your API key in settings and try again.
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={state === "loading" || !form.company || !form.role}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {state === "loading" ? "Saving..." : "Save to HireFlow"}
      </button>
    </div>
  );
}
```

---

## PBI-064 — Extension E2E Smoke Test

### `extension/playwright.config.ts`

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    headless: false, // extensions require a headed browser context
  },
});
```

### `extension/e2e/capture.spec.ts`

```typescript
import { test, expect, chromium } from "@playwright/test";
import path from "path";

const EXTENSION_PATH = path.join(__dirname, "../dist");

test("generic capture flow saves an application", async () => {
  const context = await chromium.launchPersistentContext("", {
    headless: false,
    args: [
      `--disable-extensions-except=${EXTENSION_PATH}`,
      `--load-extension=${EXTENSION_PATH}`,
    ],
  });

  const page = await context.newPage();
  await page.goto(
    `file://${path.join(__dirname, "../test-fixtures/sample-job-page.html")}`,
  );

  // Open the extension popup — requires locating the extension's
  // service worker to get its ID, then navigating to the popup URL directly
  let [worker] = context.serviceWorkers();
  if (!worker) worker = await context.waitForEvent("serviceworker");
  const extensionId = worker.url().split("/")[2];

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/src/popup/index.html`);

  await popup.getByRole("button", { name: "Capture current page" }).click();
  await popup.getByLabel("Company").fill("Test Co");
  await popup.getByRole("button", { name: "Save to HireFlow" }).click();

  await expect(popup.getByText("Saved to HireFlow.")).toBeVisible({
    timeout: 10_000,
  });

  await context.close();
});
```

### `extension/test-fixtures/sample-job-page.html`

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Senior Engineer at Test Co</title>
  </head>
  <body>
    <h1>Senior Engineer</h1>
    <p>Test Co is hiring.</p>
  </body>
</html>
```

---

## Updated `.npmrc` (extension workspace)

```
legacy-peer-deps=true
```

## Updated root `package.json` scripts (optional convenience)

```json
{
  "scripts": {
    "ext:dev": "cd extension && npm run dev",
    "ext:build": "cd extension && npm run build",
    "ext:test": "cd extension && npx playwright test"
  }
}
```

---

## Manual QA Checklist (run before closing Sprint 8)

- [x] Load unpacked extension in `chrome://extensions` with Developer Mode on
- [ ] Generate API key in HireFlow Settings, paste into extension settings
- [ ] Visit 5 different LinkedIn job postings, confirm "Save to HireFlow" button appears and captures correct company/role on each
- [ ] Visit a non-LinkedIn job page (e.g. a company careers page), use generic capture, confirm fields are editable
- [ ] Submit a duplicate `jobUrl` twice, confirm second submission returns "Already tracked" rather than creating a duplicate
- [ ] Revoke API key in Settings, confirm extension submission fails with a clear error
- [ ] Confirm activity log in dashboard shows `APPLICATION_CREATED_VIA_EXTENSION` entries
