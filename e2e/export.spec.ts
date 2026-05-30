import { test, expect } from "@playwright/test";
import { registerTestUser } from "./helpers/auth";

test("export CSV → download initiates", async ({ page }) => {
  await registerTestUser(page, `export-${Date.now()}`);

  // Set up download listener before click
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /export csv/i }).click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("applications.csv");
});
