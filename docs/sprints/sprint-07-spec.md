# Sprint 7 — Launch Readiness

## Goal

Prepare HireFlow for public use: legal compliance pages, auth page footer, and Google OAuth production approval.

## Branch Strategy

```
main → develop → feature/sprint-07-legal-pages
```

## PBIs

---

### PBI-053 — Legal Pages

**Branch:** `feature/sprint-07-legal-pages`
**Status:** ✅ Done

**Description:**
Create three static legal pages inside the Next.js app using the markdown content already drafted.

**Pages:**

- `/privacy` — Privacy Policy
- `/terms` — Terms of Service
- `/cookies` — Cookie Policy

**Acceptance Criteria:**

- [x] Pages render at their respective routes outside the dashboard layout (no sidebar, no auth required)
- [x] Pages are accessible to unauthenticated users
- [x] Content matches the drafted documents exactly
- [x] Pages are responsive and respect dark mode
- [x] `export const dynamic = "force-dynamic"` not required (static pages — use default static rendering)

**Implementation Notes:**

- Use a `app/(legal)/layout.tsx` route group — clean layout with logo + back link, no sidebar
- Pages are plain server components — no client interactivity needed
- Render markdown content as JSX directly (no markdown parser needed)
- Add `<Link href="/login">← Back to HireFlow</Link>` in the layout header

---

### PBI-054 — Auth Page Footer

**Branch:** `feature/sprint-07-legal-pages`
**Status:** ✅ Done

**Description:**
Add a minimal footer to the sign-in and sign-up pages with links to the three legal pages.

**Acceptance Criteria:**

- [x] Footer appears on `/login` and `/register` (or equivalent auth pages)
- [x] Footer contains links to `/privacy`, `/terms`, and `/cookies`
- [x] Footer is styled consistently with the existing auth page design
- [x] Links open in the same tab

**Implementation Notes:**

- Footer text: `Privacy Policy · Terms of Service · Cookie Policy`
- Keep it minimal — small text, muted colour, centred

---

### PBI-055 — Google OAuth Production Approval

**Branch:** N/A (Google Cloud Console — no code changes)
**Status:** ✅ Done

**Description:**
Publish the Google OAuth consent screen so any user can sign in with Google (removes the test-mode restriction).

**Acceptance Criteria:**

- [x] OAuth consent screen status is "In production" in Google Cloud Console
- [x] Privacy Policy URL is set to `https://hireflow-ten.vercel.app/privacy`
- [x] Any Google account can sign in without being on the allowlist
- [x] Scopes requested are limited to `email` and `profile` only

**Steps:**

1. Complete PBI-053 first and deploy `/privacy` to Vercel
2. Google Cloud Console → APIs & Services → OAuth consent screen
3. Set Privacy Policy URL to the live `/privacy` page
4. Click "Publish App" → confirm
5. For basic scopes (email, profile), Google usually approves without full verification
6. Test sign-in with a Google account not on the allowlist

---

### PBI-056 — MIT Licence File (Deferred)

**Status:** ⏸ Deferred — revisit after Sprint 7

---

## Sequence

```
PBI-053 → deploy to Vercel → PBI-054 → PBI-055
```

PBI-055 depends on PBI-053 being live (Google needs to verify the Privacy Policy URL).

## Definition of Done

- All pages live on Vercel
- Google OAuth open to any user
- Branch merged to develop → main
- All existing RTL (120) and E2E (9) tests still passing
