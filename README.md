# HireFlow

A job application pipeline tracker built in public using Spec-Driven Development.

Track applications, contacts, and follow-up reminders across a 6-stage Kanban pipeline.

**Live:** [hireflow-track.vercel.app](https://hireflow-track.vercel.app)
**LinkedIn build series:** [Posts 01–24](https://linkedin.com/in/emoonerhime)

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
git clone https://github.com/eonerhime/hireflow-track.git
cd hireflow-track

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# run in your terminal: openssl rand -base64 32 or node -e "console.log(require('crypto').randomBytes(32).toString('base64'))" for your JWT_SECRET
# Fill in DATABASE_URL, DIRECT_URL, JWT_SECRET in .env.local

# 4. Run migrations
npx prisma migrate dev

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3002](http://localhost:3002).

---

## Environment Variables

`run in your terminal: openssl rand -base64 32 or node -e "console.log(require('crypto').randomBytes(32).toString('base64'))" for your JWT_SECRET`

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

## Browser Extension

`extension/` is a separate Manifest V3 Chrome extension (Vite + React) that captures job postings from LinkedIn Easy Apply or any generic page and pushes them into HireFlow via API key auth. It's a standalone workspace with its own `package.json` — see [`extension/README.md`](extension/README.md) for setup, local development, and testing.

```bash
npm run ext:build   # build extension/dist
npm run ext:dev     # Vite dev server for the extension
npm run ext:test    # Playwright e2e smoke test
```

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
