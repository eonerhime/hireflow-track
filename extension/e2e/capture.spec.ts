import { test, expect, chromium } from "@playwright/test";
import path from "path";

const EXTENSION_PATH = path.join(__dirname, "../dist");
const TEST_API_KEY = process.env.EXTENSION_TEST_API_KEY;

test("generic capture flow saves an application", async () => {
  test.skip(
    !TEST_API_KEY,
    "EXTENSION_TEST_API_KEY env var not set — this test calls the real API and needs a valid key",
  );

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

  // Seed the stored API key so the popup renders the capture flow
  // instead of the "connect your account" screen.
  await popup.evaluate(
    (key) => chrome.storage.local.set({ apiKey: key }),
    TEST_API_KEY,
  );
  await popup.reload();

  await popup.getByRole("button", { name: "Capture current page" }).click();
  await popup.getByLabel("Company").fill("Test Co");
  await popup.getByRole("button", { name: "Save to HireFlow" }).click();

  await expect(popup.getByText("Saved to HireFlow.")).toBeVisible({
    timeout: 10_000,
  });

  await context.close();
});
