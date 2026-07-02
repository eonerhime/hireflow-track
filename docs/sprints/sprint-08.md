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
**Status:** 🔲 Not started

**Description:**
Add a scoped API key system so the extension (and any future external client) can authenticate without a browser session cookie.

**Acceptance Criteria:**
- [ ] New Prisma model `ApiKey` — `id`, `userId`, `keyHash`, `label`, `lastUsedAt`, `createdAt`, `revokedAt`
- [ ] Settings page has a new "Extension" or "API Keys" card — generate key, show once, copy button, revoke button
- [ ] Key is shown in full only once at generation time; only a hash is stored
- [ ] `lib/api-key.ts` — `validateApiKey(key: string)` returns `{ userId } | null`
- [ ] New middleware/helper for API routes: accept either NextAuth session OR valid API key in `Authorization: Bearer` header
- [ ] Rate limit API-key-authenticated requests (reuse existing rate limit middleware)
- [ ] RTL tests for key generation, validation, revocation

**Implementation Notes:**
- Hash keys with bcrypt or SHA-256 before storing — never store plaintext
- Key format: `htk_` prefix + 32 random bytes, base64url-encoded (e.g. `htk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`) — prefix makes leaked-key scanning easier
- Only one active key per user in v1 — generating a new one revokes the old one (simpler UX, fewer edge cases)

---

### PBI-059 — Extension-Scoped Application Creation Endpoint
**Branch:** `feature/sprint-08-browser-extension`
**Status:** 🔲 Not started

**Description:**
New API route the extension calls to create an application. Separate from the existing dashboard CRUD route to keep extension payload validation isolated.

**Acceptance Criteria:**
- [ ] `POST /api/extension/applications` — accepts API key auth only (not session)
- [ ] Request body: `{ company, role, location?, jobUrl, source: "linkedin" | "manual", notes? }`
- [ ] Validates with a dedicated Zod schema — `lib/schemas/extension.ts`
- [ ] Creates `Application` with `stage: "APPLIED"`, `source` set from payload
- [ ] Returns `{ id, company, role, createdAt }` on success
- [ ] Logs activity via existing `logActivity` (fire-and-forget, `void`)
- [ ] Duplicate detection: if an application with the same `jobUrl` already exists for this user, return `409` with the existing application's id rather than creating a duplicate
- [ ] RTL tests: success, validation failure, duplicate detection, invalid/missing API key

**Implementation Notes:**
- `@jest-environment node` as first line of the test file
- Reuse `lib/auth-options.ts` pattern but branch to API-key validation when no session cookie present
- `export const dynamic = "force-dynamic"`

---

### PBI-060 — Extension Scaffold (Manifest V3)
**Branch:** `feature/sprint-08-browser-extension`
**Status:** 🔲 Not started

**Description:**
Set up the extension project structure, manifest, build tooling, and basic popup shell.

**Acceptance Criteria:**
- [ ] New top-level folder `extension/` in the monorepo (or separate repo — see Implementation Notes)
- [ ] `manifest.json` — Manifest V3, permissions: `activeTab`, `storage`, `scripting`
- [ ] Vite + `@crxjs/vite-plugin` build setup — produces a loadable unpacked extension in `extension/dist`
- [ ] Popup UI shell (React + Tailwind) — shows "Not connected" state if no API key saved
- [ ] Options/settings page within the extension to paste and save the API key (stored in `chrome.storage.local`)
- [ ] Extension icon set (16/48/128px) — reuse HireTrace logo mark
- [ ] README in `extension/` explaining how to load it unpacked in Chrome for local dev

**Implementation Notes:**
- Keep the extension in the same repo under `extension/` for now — simpler versioning against the API contract. Revisit splitting into its own repo only if release cadence diverges.
- `chrome.storage.local` is the right place for the API key — not `localStorage` (content scripts and popups don't share `localStorage` reliably across contexts)

---

### PBI-061 — LinkedIn Easy Apply Content Script
**Branch:** `feature/sprint-08-browser-extension`
**Status:** 🔲 Not started

**Description:**
Content script that detects LinkedIn's Easy Apply modal and extracts company, role, and job URL automatically.

**Acceptance Criteria:**
- [ ] Content script injected only on `*.linkedin.com/jobs/*` (manifest `matches` scoped narrowly)
- [ ] Detects when the Easy Apply modal or job detail pane is open (`MutationObserver` on a known container)
- [ ] Extracts: job title, company name, job posting URL (canonical, not the modal URL), location if visible
- [ ] Injects a small floating "Save to HireTrace" button near the Easy Apply button — does not interfere with LinkedIn's own UI
- [ ] On click, sends extracted draft to the extension popup via `chrome.runtime.sendMessage`
- [ ] Gracefully does nothing (no button, no errors) if selectors don't match — LinkedIn DOM changes should degrade silently, not throw

**Implementation Notes:**
- LinkedIn's DOM is unstable and class names are obfuscated/hashed — selectors must target structural patterns (e.g. `[data-job-id]`, ARIA roles, heading hierarchy) rather than specific class names where possible
- Wrap all DOM queries in try/catch — a thrown error in a content script can break the host page
- This PBI carries the highest risk of breakage over time and should be the most heavily commented code in the extension, explaining *why* each selector was chosen

---

### PBI-062 — Generic Fallback Capture
**Branch:** `feature/sprint-08-browser-extension`
**Status:** 🔲 Not started

**Description:**
A "Capture this page" button in the extension popup that works on any website, for job boards without dedicated support.

**Acceptance Criteria:**
- [ ] Popup always shows a "Capture current page" button regardless of site
- [ ] On click, content script grabs: page `<title>`, current URL, and `document.title`-derived guess at role/company (best-effort split on common separators like " at ", " - ", "|")
- [ ] All fields pre-filled but fully editable in the confirm popup — no field is read-only
- [ ] If guess parsing fails, fields are left blank rather than showing garbage text

**Implementation Notes:**
- This is intentionally low-tech — accuracy comes from the user editing before submit, not from clever parsing
- Reuses the same confirm/edit popup component as PBI-061 (LinkedIn capture) and PBI-063 (review screen) — one shared component, two entry points

---

### PBI-063 — Review and Submit Popup
**Branch:** `feature/sprint-08-browser-extension`
**Status:** 🔲 Not started

**Description:**
The popup UI shown after any capture (LinkedIn or generic) where the user reviews, edits, and confirms before the application is saved to HireTrace.

**Acceptance Criteria:**
- [ ] Form fields: company, role, location, job URL (read-only display, not editable), source (auto-set, not user-editable), notes (optional textarea)
- [ ] "Save to HireTrace" button — calls `POST /api/extension/applications` with the stored API key
- [ ] Loading state while request is in flight
- [ ] Success state — shows confirmation + link to open the application in the HireTrace dashboard (new tab)
- [ ] Duplicate (`409`) response — shows "Already tracked" message with a link to the existing application, not an error
- [ ] Error state (network failure, invalid API key) — clear message, no silent failure
- [ ] Closing the popup without saving discards the draft (no partial state persisted)

**Implementation Notes:**
- This is the most user-facing, polish-sensitive piece — apply the frontend-design skill for visual treatment
- Keep the popup width constrained (Chrome extension popups behave oddly above ~400px wide)

---

### PBI-064 — Extension E2E Smoke Test
**Branch:** `feature/sprint-08-browser-extension`
**Status:** 🔲 Not started

**Description:**
A minimal Playwright test that loads the unpacked extension and verifies the generic capture flow end-to-end against a local test page.

**Acceptance Criteria:**
- [ ] Playwright config extended to launch Chromium with the unpacked extension loaded (`--load-extension` flag via `launchPersistentContext`)
- [ ] Test page (`extension/test-fixtures/sample-job-page.html`) stands in for a generic job posting
- [ ] Test: open popup → click "Capture current page" → edit company field → submit → assert success state renders
- [ ] LinkedIn-specific flow (PBI-061) is **not** covered by automated E2E — LinkedIn's live DOM is out of scope for CI; verify manually each release

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
- Extension loads unpacked in Chrome without console errors
- Generic capture flow works end-to-end on a non-LinkedIn test page
- LinkedIn Easy Apply capture verified manually on at least 5 real job postings
- API key can be generated, copied, and revoked from Settings
- Duplicate jobUrl does not create a second application
- All existing RTL (120+) and E2E (9) tests still passing
- New RTL tests for PBI-058/059 passing
- Extension README documents local install/load steps for any future contributor
