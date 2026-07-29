# Sprint 8 — Browser Extension (Capture to HireTrace)

## Goal
Ship a Chrome extension (Manifest V3) that lets a user capture job application details from LinkedIn Easy Apply or any generic job page, review/edit the draft, and push it directly into their HireTrace pipeline without manual re-entry.

## Branch Strategy
```
main → develop → feature/sprint-08-browser-extension
```

## Scope Decisions (locked for this sprint)
- **Platforms:** LinkedIn Easy Apply (structured capture) + generic fallback (any page, manual-assisted capture)
- **Auth:** API key generated in Settings, sent as `Authorization: Bearer <key>` header
- **Flow:** Always show a confirm/edit popup before saving — no silent auto-save
- **Out of scope this sprint:** Greenhouse/Lever-specific selectors, Firefox/Safari support, auto-detecting application status changes after submission

## PBIs

---

### PBI-058 — API Key Authentication for External Clients
**Branch:** `feature/sprint-08-browser-extension`
**Status:** ✅ Done

**Description:**
Add a scoped API key system so the extension (and any future external client) can authenticate without a browser session cookie.

**Acceptance Criteria:**
- [x] New Prisma model `ApiKey` — `id`, `userId`, `keyHash`, `label`, `lastUsedAt`, `createdAt`, `revokedAt`
- [x] Settings page has a new "Extension" or "API Keys" card — generate key, show once, copy button, revoke button
- [x] Key is shown in full only once at generation time; only a hash is stored
- [x] `lib/api-key.ts` — `validateApiKey(key: string)` returns `{ userId } | null`
- [x] New middleware/helper for API routes: accept either NextAuth session OR valid API key in `Authorization: Bearer` header — `lib/auth-helpers.ts`'s `getAuthenticatedUser`
- [x] Rate limit API-key-authenticated requests (reuse existing rate limit middleware)
- [x] RTL tests for key generation, validation, revocation

**Implementation Notes:**
- Hash keys with bcrypt or SHA-256 before storing — never store plaintext
- Key format: `htk_` prefix + 32 random bytes, base64url-encoded (e.g. `htk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`) — prefix makes leaked-key scanning easier
- Only one active key per user in v1 — generating a new one revokes the old one (simpler UX, fewer edge cases)

---

### PBI-059 — Extension-Scoped Application Creation Endpoint
**Branch:** `feature/sprint-08-browser-extension`
**Status:** ✅ Done

**Description:**
New API route the extension calls to create an application. Separate from the existing dashboard CRUD route to keep extension payload validation isolated.

**Acceptance Criteria:**
- [x] `POST /api/extension/applications` — accepts API key auth only (not session)
- [x] Request body: `{ company, role, location?, jobUrl, source: "linkedin" | "manual", notes? }`
- [x] Validates with a dedicated Zod schema — `lib/schemas/extension.ts`
- [x] Creates `Application` with `stage: "APPLIED"`, `source` set from payload
- [x] Returns `{ id, company, role, createdAt }` on success
- [x] Logs activity via existing `logActivity` (fire-and-forget, `void`)
- [x] Duplicate detection: if an application with the same `jobUrl` already exists for this user, return `409` with the existing application's id rather than creating a duplicate
- [x] RTL tests: success, validation failure, duplicate detection, invalid/missing API key

**Implementation Notes:**
- `@jest-environment node` as first line of the test file
- Reuse `lib/auth-options.ts` pattern but branch to API-key validation when no session cookie present
- `export const dynamic = "force-dynamic"`

---

### PBI-060 — Extension Scaffold (Manifest V3)
**Branch:** `feature/sprint-08-browser-extension`
**Status:** ✅ Done

**Description:**
Set up the extension project structure, manifest, build tooling, and basic popup shell.

**Acceptance Criteria:**
- [x] New top-level folder `extension/` in the monorepo (or separate repo — see Implementation Notes)
- [x] `manifest.json` — Manifest V3, permissions: `activeTab`, `storage`, `scripting`
- [x] Vite + `@crxjs/vite-plugin` build setup — produces a loadable unpacked extension in `extension/dist`
- [x] Popup UI shell (React + Tailwind) — shows "Not connected" state if no API key saved
- [x] Options/settings page within the extension to paste and save the API key (stored in `chrome.storage.local`) — plus a "Change API key" link to reconnect without reinstalling, added during live testing
- [x] Extension icon set (16/48/128px) — reuse HireTrace logo mark
- [x] README in `extension/` explaining how to load it unpacked in Chrome for local dev

**Implementation Notes:**
- Keep the extension in the same repo under `extension/` for now — simpler versioning against the API contract. Revisit splitting into its own repo only if release cadence diverges.
- `chrome.storage.local` is the right place for the API key — not `localStorage` (content scripts and popups don't share `localStorage` reliably across contexts)

---

### PBI-061 — LinkedIn Easy Apply Content Script
**Branch:** `feature/sprint-08-browser-extension`
**Status:** ✅ Done

**Description:**
Content script that detects LinkedIn's Easy Apply modal and extracts company, role, and job URL automatically.

**Acceptance Criteria:**
- [x] Content script injected only on `*.linkedin.com/jobs/*` (manifest `matches` scoped narrowly)
- [x] Detects when the Easy Apply modal or job detail pane is open (`MutationObserver` on a known container)
- [x] Extracts: job title, company name, job posting URL (canonical, not the modal URL), location if visible — title/URL extraction rewritten during live testing to match via the page's `?currentJobId=` instead of assuming an `h1`, since the split-pane search layout renders the title as a plain link
- [x] Injects a small floating "Save to HireTrace" button near the Easy Apply button — does not interfere with LinkedIn's own UI — repositioned bottom-left during live testing after discovering LinkedIn's own messaging launcher occupies bottom-right
- [x] On click, sends extracted draft to the extension popup via `chrome.runtime.sendMessage`
- [x] Gracefully does nothing (no button, no errors) if selectors don't match — LinkedIn DOM changes should degrade silently, not throw

**Implementation Notes:**
- LinkedIn's DOM is unstable and class names are obfuscated/hashed — selectors must target structural patterns (e.g. `[data-job-id]`, ARIA roles, heading hierarchy) rather than specific class names where possible
- Wrap all DOM queries in try/catch — a thrown error in a content script can break the host page
- This PBI carries the highest risk of breakage over time and should be the most heavily commented code in the extension, explaining *why* each selector was chosen

---

### PBI-062 — Generic Fallback Capture
**Branch:** `feature/sprint-08-browser-extension`
**Status:** ✅ Done

**Description:**
A "Capture this page" button in the extension popup that works on any website, for job boards without dedicated support.

**Acceptance Criteria:**
- [x] Popup always shows a "Capture current page" button regardless of site
- [x] On click, content script grabs: page `<title>`, current URL, and `document.title`-derived guess at role/company (best-effort split on common separators like " at ", " - ", "|")
- [x] All fields pre-filled but fully editable in the confirm popup — no field is read-only
- [x] If guess parsing fails, fields are left blank rather than showing garbage text

**Implementation Notes:**
- This is intentionally low-tech — accuracy comes from the user editing before submit, not from clever parsing
- Reuses the same confirm/edit popup component as PBI-061 (LinkedIn capture) and PBI-063 (review screen) — one shared component, two entry points

---

### PBI-063 — Review and Submit Popup
**Branch:** `feature/sprint-08-browser-extension`
**Status:** ✅ Done

**Description:**
The popup UI shown after any capture (LinkedIn or generic) where the user reviews, edits, and confirms before the application is saved to HireTrace.

**Acceptance Criteria:**
- [x] Form fields: company, role, location, job URL (read-only display, not editable), source (auto-set, not user-editable), notes (optional textarea)
- [x] "Save to HireTrace" button — calls `POST /api/extension/applications` with the stored API key
- [x] Loading state while request is in flight
- [x] Success state — shows confirmation + link to open the application in the HireTrace dashboard (new tab) — verified live
- [x] Duplicate (`409`) response — shows "Already tracked" message with a link to the existing application, not an error — code-verified, not re-confirmed live after the middleware/extraction fixes
- [x] Error state (network failure, invalid API key) — clear message, no silent failure — code-verified, not manually re-tested live
- [x] Closing the popup without saving discards the draft (no partial state persisted) — draft only ever lives in component state until submit, by construction

**Implementation Notes:**
- This is the most user-facing, polish-sensitive piece — apply the frontend-design skill for visual treatment
- Keep the popup width constrained (Chrome extension popups behave oddly above ~400px wide)

---

### PBI-064 — Extension E2E Smoke Test
**Branch:** `feature/sprint-08-browser-extension`
**Status:** ✅ Done

**Description:**
A minimal Playwright test that loads the unpacked extension and verifies the generic capture flow end-to-end against a local test page.

**Acceptance Criteria:**
- [x] Playwright config extended to launch Chromium with the unpacked extension loaded (`--load-extension` flag via `launchPersistentContext`)
- [x] Test page (`extension/test-fixtures/sample-job-page.html`) stands in for a generic job posting
- [x] Test: open popup → click "Capture current page" → edit company field → submit → assert success state renders — test now seeds a stored API key via `EXTENSION_TEST_API_KEY` first, since the popup only renders the capture button when connected (originally missing — the test as first written would always time out)
- [x] LinkedIn-specific flow (PBI-061) is **not** covered by automated E2E — LinkedIn's live DOM is out of scope for CI; verify manually each release

**Implementation Notes:**
- Extension E2E tests are inherently flakier than web E2E — keep this to one smoke test, not a full suite
- This test runs in a separate Playwright project/config from the main app's E2E suite to avoid coupling

---

## Sequence
```
PBI-058 (API keys) → PBI-059 (endpoint)
       ↓
PBI-060 (scaffold) → PBI-062 (generic capture) → PBI-063 (review popup) → PBI-064 (E2E)
       ↓
PBI-061 (LinkedIn capture) — can start after PBI-060, feeds into PBI-063
```

PBI-058 and PBI-059 must ship first — nothing in the extension works without an authenticated endpoint to call.

## Definition of Done

- [x] Extension loads unpacked in Chrome without console errors
- [x] Generic capture flow works end-to-end on a non-LinkedIn test page — verified against work.mercor.com
- [x] LinkedIn job capture verified manually across real postings on both the direct job-view layout and the `/jobs/search/` split-pane layout — verified on 3 distinct postings during live testing, not yet the full 5 this line originally specified
- [x] API key can be generated and revoked from Settings; extension has its own "Change API key" flow to reconnect without reinstalling
- [x] Duplicate jobUrl does not create a second application — logic verified by code review (409 response, `jobUrl` lookup in `app/api/extension/applications/route.ts`), not yet manually re-confirmed after the live-testing fixes
- [x] All existing RTL/integration tests (131) and Jest suite still passing
- [x] New tests for PBI-058/059 passing — `__tests__/api.settings.api-key.test.ts`, `__tests__/api.extension.applications.test.ts`
- [x] Extension README documents local install/load steps for any future contributor — `extension/README.md`

**Bugs found and fixed during live testing** (not part of the original spec, discovered post-implementation):
- **`middleware.ts` required a valid NextAuth session on every non-public `/api/*` route, including `/api/extension/applications`** — meaning the entire API-key-only auth path this sprint exists to build was never actually reachable in production. It only appeared to work during live testing because the browser used also had an active HireFlow session cookie (Chrome grants extensions with matching `host_permissions` the ability to send that cookie). Confirmed directly against production with `curl` — a bad API key with no session cookie was rejected by middleware itself (`{"error":"Unauthorised"}`, its literal message) rather than reaching the route's own check. Fixed by exempting `/api/extension/*` from middleware's session gate while keeping rate limiting intact, so the route's own session-or-API-key check (already correct) actually runs.
- Floating LinkedIn capture button never appeared on the `/jobs/search/` split-pane layout — the job title isn't an `h1` there, it's the link to `/jobs/view/{id}/`; fixed by matching that link via the page's `?currentJobId=`
- `jobUrl` was derived from `window.location.href`, which on the search/split-pane layout is always the search listing's URL, not the specific job's — silently broke duplicate detection for every job captured from a search page
- `OPEN_POPUP` message had no listener in the background service worker
- Popup width used a non-existent Tailwind class (`w-90`), leaving every popup screen unsized
- No way to change a stored API key without removing/re-adding the extension
- Floating button's bottom-right position collided with LinkedIn's own messaging launcher
