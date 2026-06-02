# HireFlow — Setup Guide

**Document Type:** Developer Setup Artifact
**Version:** 1.0 — Sprint 1
**Date:** April 18, 2026
**Status:** Active
**Author:** Developer
**Repository:** https://github.com/eonerhime/hireflow-track

---

## Cross-References

| Document            | Relationship                                                |
| ------------------- | ----------------------------------------------------------- |
| `implementation.md` | Architecture and decisions that drive the choices made here |
| `spec.md`           | Acceptance criteria each setup step must satisfy            |
| `tasks.md`          | Each task maps to a numbered step in this guide             |
| `sprint-01.md`      | Active sprint — mark PBIs done as each section is completed |

---

## How to Use This Guide

This document is a **procedural guide** — not a reference document. Work through it top to bottom, in order. Every code block is complete and copy-paste ready. The only values you supply yourself are marked `<REPLACE_THIS>`.

Do not skip steps. Each section depends on the one before it.

**Verification checkpoints** are marked with ✅ — stop and confirm before continuing.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Next.js Scaffold — PBI-001](#2-nextjs-scaffold--pbi-001)
3. [Directory Structure + Environment Files — PBI-001](#3-directory-structure--environment-files--pbi-001)
4. [Security Headers — PBI-039](#4-security-headers--pbi-039)
5. [Neon Database Setup — PBI-002](#5-neon-database-setup--pbi-002)
6. [Prisma ORM + Initial Schema — PBI-003](#6-prisma-orm--initial-schema--pbi-003)
7. [Input Validation with Zod — PBI-037](#7-input-validation-with-zod--pbi-037)
8. [User Registration — PBI-004](#8-user-registration--pbi-004)
9. [User Login + JWT Session — PBI-005](#9-user-login--jwt-session--pbi-005)
10. [Protected Route Middleware — PBI-006](#10-protected-route-middleware--pbi-006)
11. [Test Infrastructure — PBI-040 prep](#11-test-infrastructure--pbi-040-prep)
12. [Vercel Deployment — PBI-008](#12-vercel-deployment--pbi-008)
13. [Sprint 1 Final Checks](#13-sprint-1-final-checks)

---

## 1. Prerequisites

Confirm the following before starting. These are not optional.

### Required software

```bash
# Confirm Node.js version (must be 20+)
node --version

# Confirm npm version (must be 10+)
npm --version

# Confirm git is installed
git --version
```

✅ All three commands return version numbers without errors.

### Required accounts

| Service | URL        | Status                                               |
| ------- | ---------- | ---------------------------------------------------- |
| GitHub  | github.com | ✅ Done — `hireflow-track` repo exists               |
| Neon    | neon.tech  | ✅ Done — account exists, DB to be provisioned in §5 |
| Vercel  | vercel.com | ✅ Done — connected to GitHub repo                   |
| Notion  | notion.so  | ✅ Done — workspace live                             |

### Repo state before starting

```bash
# Confirm you are on develop
git branch
# Should show: * develop

# Confirm working tree is clean
git status
# Should show: nothing to commit, working tree clean
```

✅ You are on `develop` with a clean working tree.

---

## 2. Next.js Scaffold — PBI-001

### Step 2.1 — Initialise the Next.js application

You are in the root of the cloned `hireflow-track` repository. Run:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --import-alias "@/*"
```

When prompted:

| Prompt                                        | Answer                       |
| --------------------------------------------- | ---------------------------- |
| Would you like to use `src/` directory?       | **No**                       |
| Would you like to customize the import alias? | **No** (already set by flag) |

> ⚠️ The `.` installs into the current directory. If it warns that the directory is not empty, confirm yes — it will merge with your existing files.

### Step 2.2 — Verify the scaffold

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the default Next.js welcome page.

Press `Ctrl+C` to stop the server.

```bash
# Confirm TypeScript strict mode
cat tsconfig.json | grep '"strict"'
# Expected output: "strict": true
```

✅ App runs on `localhost:3000`. `"strict": true` is present in `tsconfig.json`.

### Step 2.3 — Replace default boilerplate

Open `app/page.tsx` and replace the entire contents with:

```typescript
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">HireFlow</h1>
    </main>
  )
}
```

Open `app/globals.css` and replace the entire contents with:

```css
@import "tailwindcss";
```

### Step 2.4 — Verify Tailwind is working

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see **HireFlow** centred on the page in bold. Press `Ctrl+C`.

```bash
# Confirm build passes
npm run build

# Confirm TypeScript passes
npx tsc --noEmit

# Confirm linting passes
npm run lint
```

✅ All three commands complete with no errors or warnings.

### Step 2.5 — Commit

```bash
git add .
git commit -m "[PBI-001] Initialise Next.js scaffold with TypeScript and Tailwind"
git push origin develop
```

---

## 3. Directory Structure + Environment Files — PBI-001

### Step 3.1 — Create required directories

Next.js created `app/` and `public/` automatically. Create the remaining directories:

```bash
mkdir -p components lib lib/schemas prisma
```

Add `.gitkeep` files so git tracks the empty directories:

```bash
touch components/.gitkeep
touch lib/.gitkeep
```

> `lib/schemas/` and `prisma/` will have files added shortly — no `.gitkeep` needed.

### Step 3.2 — Create `.env.example`

Create `.env.example` in the project root:

```bash
touch .env.example
```

Open `.env.example` and add:

```bash
# Database — Neon PostgreSQL
# Pooled connection string (used by the app at runtime)
DATABASE_URL=

# Authentication
# Generate with: openssl rand -base64 32
JWT_SECRET=

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
```

### Step 3.3 — Create `.env.local`

```bash
touch .env.local
```

Leave `.env.local` empty for now — you will fill it in §5 after provisioning Neon.

### Step 3.4 — Verify `.gitignore` is correct

Open `.gitignore` and confirm these lines are present (Next.js adds them automatically):

```
.env
.env.local
.env*.local
node_modules/
.next/
```

If `.env.local` is not listed, add it manually.

### Step 3.5 — Commit

```bash
git add .
git commit -m "[PBI-001] Add directory structure and environment variable files"
git push origin develop
```

✅ `components/`, `lib/`, `lib/schemas/`, `prisma/` directories exist. `.env.example` is committed. `.env.local` is gitignored.

---

## 4. Security Headers — PBI-039

### Step 4.1 — Update `next.config.ts`

Open `next.config.ts` and replace the entire contents with:

```typescript
import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

### Step 4.2 — Verify headers are applied

```bash
npm run build
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome. Open DevTools → Network tab → click the `localhost` request → Headers tab. Scroll to **Response Headers**.

Confirm these are present:

- `x-frame-options: DENY`
- `x-content-type-options: nosniff`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy: camera=(), microphone=(), geolocation=()`
- `content-security-policy: ...`

Press `Ctrl+C`.

✅ All five security headers visible in DevTools. Build passes.

### Step 4.3 — Commit

```bash
git add .
git commit -m "[PBI-039] Add HTTP security headers to Next.js config"
git push origin develop
```

---

## 5. Neon Database Setup — PBI-002

### Step 5.1 — Provision the database

1. Go to [neon.tech](https://neon.tech) and log in
2. Click **New Project**
3. Set project name: `hireflow-track`
4. Region: choose the closest to you
5. PostgreSQL version: leave as default (16)
6. Click **Create Project**

### Step 5.2 — Get your connection strings

On the project dashboard, find the **Connection Details** panel.

**Pooled connection string (DATABASE_URL):**

1. Ensure **Connection pooling** toggle is ON
2. Copy the connection string — contains `-pooler` in the hostname
3. This is used by the app at runtime via `lib/prisma.ts`

**Direct connection string (DIRECT_URL):**

1. Toggle **Connection pooling** OFF
2. Copy the connection string — no `-pooler` in the hostname
3. This is used by all Prisma CLI commands via `prisma.config.ts`

> Both strings are required. The pooled URL cannot reach the database
> server for migrations — only the direct URL works for Prisma CLI commands.

### Step 5.3 — Add connection strings to `.env.local`

Open `.env.local` and add:

```bash
# Database — Neon PostgreSQL
DATABASE_URL=<REPLACE_THIS_with_pooled_connection_string>
DIRECT_URL=<REPLACE_THIS_with_direct_connection_string>

# Authentication — generate these now
JWT_SECRET=<REPLACE_THIS_run_openssl_rand_-base64_32>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<REPLACE_THIS_run_openssl_rand_-base64_32>
```

To generate `JWT_SECRET` and `NEXTAUTH_SECRET`, run this command twice (use each output for one variable):

```bash
openssl rand -base64 32
```

### Step 5.4 — Verify `.env.local` is not tracked

```bash
git status
```

`.env.local` must **not** appear in the output. If it does, stop — add it to `.gitignore` before continuing.

✅ Neon database is active. `.env.local` is populated and gitignored.

---

## 6. Prisma ORM + Initial Schema — PBI-003

### Step 6.1 — Install Prisma

```bash
npm install prisma @prisma/client @neondatabase/serverless @prisma/adapter-neon
```

### Step 6.2 — Initialise Prisma

```bash
npx prisma init
```

This creates `prisma/schema.prisma` and a `.env` file. Delete the `.env` file Prisma created — you are using `.env.local`:

```bash
rm .env
```

Confirm `.env` is in `.gitignore` (Next.js adds this — double-check it is there).

`prisma.config.ts`

```typescript
import { loadEnvConfig } from "@next/env";
import { defineConfig } from "prisma/config";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] as string,
  },
});
```

> `prisma.config.ts` uses `DIRECT_URL` for all Prisma CLI commands.
> The pooled `DATABASE_URL` cannot reach the Neon server directly
> and will throw P1001 on migrate commands.

---

### Step 6.3 — Configure `prisma/schema.prisma`

Open `prisma/schema.prisma` and replace the entire contents with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

> Connection URL is configured in `prisma.config.ts` — not in the
> datasource block. This is a Prisma v6 change.

**Schema decisions:**

- `cuid()` not `uuid()` — shorter, URL-safe, ordered
- `email` is `@unique` — enforced at the database level
- `password` stores the bcrypt hash — never plaintext
- `updatedAt` uses `@updatedAt` — Prisma updates this automatically

### Step 6.4 — Run the initial migration

```bash
npx prisma migrate dev --name init
```

Expected output:

```
✔ Generated Prisma Client
✔ Migration `20260418_init` created
✔ Migrations applied
```

If you see a connection error, check your `DIRECT_URL` in `.env.local`.

### Step 6.5 — Verify the migration in Prisma Studio

```bash
npx prisma studio
```

A browser tab opens at [http://localhost:5555](http://localhost:5555). You should see the `User` model with columns: `id`, `email`, `password`, `createdAt`, `updatedAt`. Zero rows — correct.

Press `Ctrl+C` to close Prisma Studio.

### Step 6.6 — Create the Prisma client singleton

Create `lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**Why a singleton?** Next.js hot-reload in development creates new module instances on every file change. Without this pattern, each reload would open a new Prisma connection until the pool is exhausted. The singleton reuses the existing connection.

**Rule:** Always import `prisma` from `@/lib/prisma`. Never write `new PrismaClient()` anywhere else in the codebase.

### Step 6.7 — Generate Prisma client

```bash
npx prisma generate
```

✅ No errors. `prisma/migrations/` directory exists with the `init` migration file.

### Step 6.8 — Commit

```bash
git add .
git commit -m "[PBI-003] Add Prisma ORM with User schema and initial migration"
git push origin develop
```

---

## 7. Input Validation with Zod — PBI-037

### Step 7.1 — Install dependencies

```bash
npm install zod react-hook-form @hookform/resolvers
```

### Step 7.2 — Create auth validation schemas

Create `lib/schemas/auth.ts`:

```typescript
import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
```

### Step 7.3 — Verify schemas compile

```bash
npx tsc --noEmit
```

✅ Zero TypeScript errors.

### Step 7.4 — Commit

```bash
git add .
git commit -m "[PBI-037] Add Zod auth validation schemas"
git push origin develop
```

---

## 8. User Registration — PBI-004

### Step 8.1 — Install bcryptjs

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

### Step 8.2 — Create the registration API route

Create the directory and file:

```bash
mkdir -p app/api/auth/register
touch app/api/auth/register/route.ts
```

Open `app/api/auth/register/route.ts` and add:

```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/schemas/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user — never return password field
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/auth/register]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Step 8.3 — Create the registration page

Create the directory and file:

```bash
mkdir -p app/register
touch app/register/page.tsx
```

Open `app/register/page.tsx` and add:

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/schemas/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await response.json()

      if (response.status === 201) {
        router.push('/login?registered=true')
        return
      }

      if (response.status === 409) {
        setServerError(json.error)
        return
      }

      setServerError('Something went wrong. Please try again.')
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Create your account
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </div>
    </main>
  )
}
```

### Step 8.4 — Test registration manually

```bash
npm run dev
```

Open [http://localhost:3000/register](http://localhost:3000/register).

Test these scenarios:

- Submit empty form → validation errors appear without page reload
- Submit password shorter than 8 characters → error appears
- Submit mismatched passwords → error appears
- Submit valid data → redirected to `/login?registered=true`
- Submit same email again → _"An account with this email already exists"_ appears

Check Prisma Studio to confirm the user was created with a hashed password:

```bash
npx prisma studio
```

Open `User` model — you should see one row. The `password` field should start with `$2b$` (bcrypt hash). Press `Ctrl+C`.

✅ Registration works end-to-end. Password is hashed. Duplicate email is rejected.

### Step 8.5 — Commit

```bash
git add .
git commit -m "[PBI-004] Add user registration API route and registration page"
git push origin develop
```

---

## 9. User Login + JWT Session — PBI-005

### Step 9.1 — Install jose

```bash
npm install jose
```

### Step 9.2 — Create a JWT utility

Create `lib/jwt.ts`:

```typescript
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface JWTPayload {
  userId: string;
  email: string;
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as JWTPayload;
}
```

### Step 9.3 — Create the login API route

```bash
mkdir -p app/api/auth/login
touch app/api/auth/login/route.ts
```

Open `app/api/auth/login/route.ts` and add:

```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas/auth";
import { signJWT } from "@/lib/jwt";

const COOKIE_NAME = "hireflow-track-token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    // Find user — generic error if not found (prevents user enumeration)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Sign JWT
    const token = await signJWT({ userId: user.id, email: user.email });

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 },
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("[POST /api/auth/login]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

### Step 9.4 — Create the logout API route

```bash
mkdir -p app/api/auth/logout
touch app/api/auth/logout/route.ts
```

Open `app/api/auth/logout/route.ts` and add:

```typescript
import { NextResponse } from "next/server";

const COOKIE_NAME = "hireflow-track-token";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out" },
    { status: 200 },
  );

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
```

### Step 9.5 — Create the login page

```bash
mkdir -p app/login
touch app/login/page.tsx
```

Open `app/login/page.tsx` and add:

```typescript
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/schemas/auth'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'

  const [serverError, setServerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    setServerError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.status === 200) {
        router.push('/dashboard')
        return
      }

      const json = await response.json()
      setServerError(json.error ?? 'Something went wrong. Please try again.')
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Log in to HireFlow
        </h1>

        {justRegistered && (
          <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            Account created. Please log in.
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 mt-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Server error */}
          {serverError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Create one
            </a>
          </p>
        </form>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
```

> `useSearchParams()` requires a `Suspense` boundary in Next.js App Router — that is why `LoginForm` is wrapped in `<Suspense>` in the default export.

### Step 9.6 — Test login manually

```bash
npm run dev
```

1. Go to [http://localhost:3000/login](http://localhost:3000/login)
2. Submit empty form → validation errors appear
3. Submit wrong credentials → _"Invalid email or password"_ appears
4. Submit valid credentials (the user you registered in §8) → redirected to `/dashboard` (404 for now — correct, dashboard doesn't exist yet)
5. Open DevTools → Application → Cookies → `localhost` → confirm `hireflow-track-token` is present and **HttpOnly** is checked

✅ Login works. Cookie is HTTP-only. Invalid credentials return generic message.

### Step 9.7 — Commit

```bash
git add .
git commit -m "[PBI-005] Add login and logout API routes, login page, JWT session"
git push origin develop
```

---

## 10. Protected Route Middleware — PBI-006

### Step 10.1 — Create `proxy.ts`

Create `proxy.ts` at the **project root** (same level as `package.json`):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = "hireflow-track-token";

// Routes that do not require authentication
const PUBLIC_ROUTES = ["/", "/login", "/register"];
const PUBLIC_API_ROUTES = ["/api/auth/login", "/api/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isApiRoute = pathname.startsWith("/api");
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isPublicApiRoute = PUBLIC_API_ROUTES.includes(pathname);

  // Allow public routes through without checking token
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // No token — redirect or return 401
  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify token
  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    // Token is expired or invalid
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL("/login", request.url));
    // Clear the invalid cookie
    response.cookies.set(COOKIE_NAME, "", { maxAge: 0 });
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### Step 10.2 — Create a placeholder dashboard page

```bash
mkdir -p app/dashboard
touch app/dashboard/page.tsx
```

Open `app/dashboard/page.tsx` and add:

```typescript
export default function DashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Sprint 1 complete. Pipeline coming in Sprint 2.
        </p>
      </div>
    </main>
  )
}
```

### Step 10.3 — Test middleware

```bash
npm run dev
```

**Test 1 — Unauthenticated page access:**

1. Clear cookies: DevTools → Application → Cookies → right-click `localhost` → Clear
2. Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
3. Should redirect immediately to `/login`

**Test 2 — Authenticated page access:**

1. Log in at [http://localhost:3000/login](http://localhost:3000/login)
2. Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
3. Should render the dashboard placeholder

**Test 3 — Unauthenticated API access:**

Open a new terminal and run:

```bash
curl -X GET http://localhost:3000/api/auth/logout
```

Expected response: `{"error":"Unauthorised"}` with status 401.

**Test 4 — Public routes are not blocked:**

1. Clear cookies
2. Navigate to [http://localhost:3000/login](http://localhost:3000/login) → renders normally
3. Navigate to [http://localhost:3000/register](http://localhost:3000/register) → renders normally

✅ All four tests pass.

### Step 10.4 — Commit

```bash
git add .
git commit -m "[PBI-006] Add JWT authentication middleware for protected routes"
git push origin develop
```

---

## 11. Test Infrastructure — PBI-040 prep

Sprint 2 includes `PBI-040` (RTL core component suite). Set up the test infrastructure now so tests can be written alongside the auth components.

### Step 11.1 — Install test dependencies

Next.js includes Jest configuration support. Install the additional dependencies:

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @types/jest @testing-library/jest-dom @testing-library/user-event
```

### Step 11.2 — Create Jest configuration

Create `jest.config.ts` at the project root:

```typescript
import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default createJestConfig(config);
```

### Step 11.3 — Create Jest setup file

Create `jest.setup.ts` at the project root:

```typescript
import "@testing-library/jest-dom";
```

### Step 11.4 — Add test script to `package.json`

Open `package.json`. In the `"scripts"` section, confirm `"test"` exists. If not, add it:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### Step 11.5 — Write and run the first schema unit test

Create `lib/schemas/auth.test.ts`:

```typescript
import { registerSchema, loginSchema } from "./auth";

describe("registerSchema", () => {
  it("accepts valid registration input", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toContain(
      "Password must be at least 8 characters",
    );
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      email: "user@example.com",
      password: "password123",
      confirmPassword: "different123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.confirmPassword).toContain(
      "Passwords do not match",
    );
  });

  it("rejects invalid email format", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login input", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});
```

Run the tests:

```bash
npm test
```

✅ All 7 schema tests pass.

### Step 11.6 — Commit

```bash
git add .
git commit -m "[PBI-037] Add Jest and RTL test infrastructure with schema unit tests"
git push origin develop
```

---

## 12. Vercel Deployment — PBI-008

### Step 12.1 — Add environment variables to Vercel

1. Go to [vercel.com](https://vercel.com) → your `hireflow-track` project
2. Click **Settings** → **Environment Variables**
3. Add each variable below — set scope to **Preview** for all:

| Variable          | Value                                                              | Scope   |
| ----------------- | ------------------------------------------------------------------ | ------- |
| `DATABASE_URL`    | Your Neon pooled connection string                                 | Preview |
| `DIRECT_URL`      | Your Neon direct connection string                                 | Preview |
| `JWT_SECRET`      | Your generated secret (from `.env.local`)                          | Preview |
| `NEXTAUTH_URL`    | Your Vercel preview URL (e.g. `https://hireflow-track.vercel.app`) | Preview |
| `NEXTAUTH_SECRET` | Your generated secret (from `.env.local`)                          | Preview |

> To find your Vercel preview URL: Deployments tab → click the latest deployment → copy the URL shown.

### Step 12.2 — Trigger a deployment

```bash
git push origin develop
```

Vercel detects the push and starts a build automatically.

### Step 12.3 — Verify the deployment

1. Go to Vercel → your project → **Deployments** tab
2. Wait for the build to complete (green checkmark)
3. Click the preview URL
4. Test:
   - Navigate to `/register` — page loads
   - Navigate to `/dashboard` — redirects to `/login`
   - Register a new account — redirected to `/login?registered=true`
   - Log in — redirected to `/dashboard`

✅ App is live on Vercel. Auth flow works end-to-end on the deployed URL.

### Step 12.4 — Record the Vercel URL

Open `docs/implementation.md`. In the **§9 Changelog → Sprint 1** section, add the Vercel preview URL when you fill in that entry at sprint close.

---

## 13. Sprint 1 Final Checks

Run all checks before closing Sprint 1.

### Code quality

```bash
# TypeScript — zero errors required
npx tsc --noEmit

# Linting — zero warnings required
npm run lint

# Tests — all passing required
npm test
```

### Manual end-to-end check (local)

```bash
npm run dev
```

Walk through the full auth flow:

1. Navigate to `/dashboard` without being logged in → redirected to `/login` ✅
2. Navigate to `/register` → form renders ✅
3. Submit empty form → validation errors appear without reload ✅
4. Submit valid data → redirected to `/login?registered=true` ✅
5. _"Account created. Please log in."_ message is visible ✅
6. Log in with wrong password → _"Invalid email or password"_ appears ✅
7. Log in with correct credentials → redirected to `/dashboard` ✅
8. Check DevTools cookies → `hireflow-track-token` is present and HttpOnly ✅
9. Run `document.cookie` in browser console → `hireflow-track-token` is NOT visible ✅

### Deployed app check

Repeat steps 1–9 on your Vercel preview URL.

### Update control documents

- [ ] Mark all Sprint 1 PBIs `[x]` in `product.md`
- [ ] Mark all Sprint 1 PBIs `[x]` in `sprint-01.md`
- [ ] Mark all Sprint 1 tasks `[x]` in `tasks.md`
- [ ] Fill in Sprint Review section in `sprint-01.md`
- [ ] Write Sprint Retrospective in `sprint-01.md`
- [ ] Add Sprint 1 Changelog entry in `implementation.md`
- [ ] Update Sprint Board in Notion
- [ ] Add Changelog entry in Notion
- [ ] Update Sprint 1 test results in `testing.md`
- [ ] Commit all updated documents to `develop`

---

## Observations & Gotchas

These are lessons from the setup process that any developer following this guide should know before starting:

**1. Create `develop` before your first commit**
The `develop` branch must exist before any commits beyond the initial `README.md`. Create it immediately after the repo is initialised. All SDD document commits and all application code go to `develop` — never directly to `main`.

**2. Name the docs folder exactly `docs`**
Every cross-reference in every SDD document uses the path `/docs`. Using any other name (`spec`, `documentation`, etc.) breaks every link in every document.

**3. Prisma creates a `.env` file on `npx prisma init` — delete it**
Prisma's init command creates a `.env` file assuming that is your environment file. This project uses `.env.local` (Next.js convention). Delete the `.env` file immediately after `npx prisma init` runs. Confirm `.env` is in `.gitignore`.

**4. Neon requires two connection strings**
Neon's connection pooler does not support the `SET` commands Prisma uses during migrations. Always configure both `DATABASE_URL` (pooled — for runtime) and `DIRECT_URL` (direct — for migrations) in both `.env.local` and Vercel environment variables.

**5. `useSearchParams()` requires a Suspense boundary**
In Next.js App Router, any component that uses `useSearchParams()` must be wrapped in `<Suspense>`. Forgetting this causes a build error. The login page in §9 already handles this correctly — follow that pattern in future pages.

**6. `secure: true` on cookies only in production**
Setting `secure: true` on cookies in development breaks local testing because `localhost` is not HTTPS. The login route uses `secure: process.env.NODE_ENV === 'production'` to handle this correctly — follow that pattern in all cookie operations.

**7. JWT_SECRET must be set before any auth routes are tested**
If `JWT_SECRET` is missing from `.env.local`, the JWT signing will throw a silent error and the login route will return 500. Generate and set it before running the dev server.

**8. Tailwind v4 syntax has changed**
Next.js 16 installs Tailwind v4. The `@tailwind base`, `@tailwind components`,
and `@tailwind utilities` directives no longer exist. Replace all three with
a single line in `app/globals.css`: `@import "tailwindcss"`.
`tailwind.config.ts` is not required in v4.

**9. Prisma v6 moved database config out of `schema.prisma`**
Connection URLs no longer go in the datasource block — they throw a TypeScript
error in v6. Connection config lives in `prisma.config.ts` using `defineConfig`.
Use `@next/env` `loadEnvConfig` to read `.env.local` — `dotenv/config` only
reads `.env` which does not exist in this project.

**10. Prisma v6 requires `DIRECT_URL` in `prisma.config.ts`**
The pooled `DATABASE_URL` throws `P1001` on all Prisma CLI commands including
migrate, studio, and generate. `prisma.config.ts` must use `DIRECT_URL`
(direct connection, no `-pooler` in hostname). `DATABASE_URL` (pooled) is
used only in `lib/prisma.ts` for runtime queries.

**11. Prisma v5 uses `@prisma/client` — do not change this import path**
The correct import is `from '@prisma/client'`. Prisma v6/v7 briefly moved
this to `from 'generated/prisma'` but since this project is pinned to
v5.22.0 that path does not apply. If VS Code shows a module not found error
after schema changes, run `npx prisma generate` to regenerate the client.

**12. `openssl rand` uses a space not an underscore**
The correct command is `openssl rand -base64 32` — not `openssl rand -base64_32`.
On Windows Git Bash if `openssl` is not found, use:
`node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

**13. Prisma v7 requires a database adapter — no adapterless construction**
`new PrismaClient()` without an adapter throws `PrismaClientInitializationError`
in v7. Use `PrismaNeon` from `@prisma/adapter-neon` with a `connectionString`
config object. Install both `@neondatabase/serverless` and `@prisma/adapter-neon`.
The correct pattern is:

```typescript
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
return new PrismaClient({ adapter });
```

Do not pass a `Pool` instance or a `neon()` query function — both throw
TypeScript errors. Pass the config object directly.

**14. Never use `@latest` when installing packages**
Always pin to a specific version. `create-next-app@latest` installed Next.js 16
which broke Vercel deployment. `npm install prisma@latest` installed v7 which
broke Vercel serverless. Specify versions explicitly:
`npx create-next-app@15` and `npm install prisma@5 @prisma/client@5`.

**15. Vercel framework preset must be set to Next.js at project creation**
If the preset is wrong, all routes return 404 from static. Verify immediately
after connecting the GitHub repo — Settings → General → Framework Preset → Next.js.

**16. Run `npm run build` locally before every Vercel push**
Catches type errors, missing modules, and build failures before consuming
a Vercel deployment. A passing local build does not guarantee Vercel success
but a failing local build guarantees Vercel failure.

**17. `postinstall: prisma generate` is required in `package.json`**
Without it, Vercel builds fail with a TypeScript error because the Prisma
client is not generated before type checking runs.

**18. `DATABASE_URL` must not include `channel_binding=require`**
Neon's default pooled connection string includes this parameter. Remove it
from both `.env.local` and Vercel environment variables — it causes
authentication failures in Vercel's serverless environment.

**19. jose cannot be used in `middleware.ts` on Vercel Edge Runtime**
All jose import paths are rejected by Vercel's Edge Function bundler.
Use the native Web Crypto API (`crypto.subtle`) for JWT verification
in middleware. jose is safe to use in API routes which run on Node.js runtime.

---

_setup.md v1.0 — Sprint 1 — April 18, 2026 — HireFlow_
_This is a procedural document. Work top to bottom. Every code block is complete. Replace only values marked `<REPLACE_THIS>`. Update the Observations section when new gotchas are discovered during implementation._
