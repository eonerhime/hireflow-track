# HireFlow Capture (browser extension)

Chrome extension (Manifest V3) that captures job application details from LinkedIn Easy Apply or any generic job page and pushes them into HireFlow.

## Local setup

```bash
cd extension
npm install
npm run build
```

This produces a loadable unpacked extension in `extension/dist`.

## Load unpacked in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/dist` folder

## Connect it to your HireFlow account

1. In HireFlow, go to **Dashboard → Settings** and generate an API key under "Browser Extension"
2. Click the HireFlow Capture icon in the Chrome toolbar
3. Paste the key (starts with `htk_`) and click **Connect**

## Development

```bash
npm run dev     # Vite dev server with HMR
npm run build   # production build to dist/
```

Rebuild (`npm run build`) and reload the unpacked extension in `chrome://extensions` after any source change — Vite's dev server does not hot-reload extension contexts (background service worker, content scripts) the way it does regular web pages.

## Testing

```bash
npx playwright test
```

The generic-capture smoke test calls the real `/api/extension/applications` endpoint, so it needs a valid API key supplied via `EXTENSION_TEST_API_KEY`:

```bash
EXTENSION_TEST_API_KEY=htk_xxx npx playwright test
```

Without that env var the test is skipped rather than failing. LinkedIn Easy Apply capture is not covered by automated E2E — verify manually against live LinkedIn job postings (see the Sprint 8 manual QA checklist in `docs/sprints/sprint-08.md`).
