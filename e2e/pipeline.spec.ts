import { test, expect } from "@playwright/test";
import { registerTestUser } from "./helpers/auth";

test.beforeEach(async ({ page }) => {
  await registerTestUser(page, `pipeline-${Date.now()}`);
});

test("add application → appears in list", async ({ page }) => {
  await page.getByRole("link", { name: "+ Add Application" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/company/i).fill("Acme Corp");
  await page.getByLabel(/role/i).fill("Software Engineer");
  await page.getByRole("button", { name: "Add Application" }).click();
  await page.waitForURL("**/dashboard**");
  await expect(page.getByText("Acme Corp")).toBeVisible();
});

test("edit application → updated value displayed", async ({ page }) => {
  await page.getByRole("link", { name: "+ Add Application" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/company/i).fill("BetaCo");
  await page.getByLabel(/role/i).fill("Product Manager");
  await page.getByRole("button", { name: "Add Application" }).click();
  await page.waitForURL("**/dashboard**");

  await page.getByText("Product Manager").click();
  await page.waitForURL("**/dashboard/applications/*");
  await page.waitForLoadState("networkidle");

  // Grab the application ID from the current URL before navigating to edit
  const detailUrl = page.url();
  const appId = detailUrl.split("/applications/")[1];

  await page.getByRole("link", { name: "Edit" }).click();
  await page.waitForURL("**/edit**");
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/role/i).clear();
  await page.getByLabel(/role/i).fill("Senior Product Manager");
  await page.getByRole("button", { name: "Save Changes" }).click();

  // Wait for the edit URL to be gone and detail page to load
  await page.waitForURL(`**/applications/${appId}`);
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Senior Product Manager")).toBeVisible({ timeout: 10_000 });
});

test("delete application → removed from list", async ({ page }) => {
  await page.getByRole("link", { name: "+ Add Application" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/company/i).fill("DeleteMe Corp");
  await page.getByLabel(/role/i).fill("Temp Role");
  await page.getByRole("button", { name: "Add Application" }).click();
  await page.waitForURL("**/dashboard**");

  await page.getByText("DeleteMe Corp").click();
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Yes, delete" }).click();

  // Wait for redirect back to dashboard after delete
  await page.waitForURL("**/dashboard**");
  await expect(page.getByText("DeleteMe Corp")).not.toBeVisible();
});

test("drag application to new Kanban stage → stage updates", async ({
  page,
}) => {
  // Create the application
  await page.getByRole("link", { name: "+ Add Application" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/company/i).fill("DragCo");
  await page.getByLabel(/role/i).fill("Drag Tester");
  await page.getByRole("button", { name: "Add Application" }).click();
  await page.waitForURL("**/dashboard**");

  // Grab the application ID from the detail page URL
  await page.getByText("Drag Tester").click();
  await page.waitForURL("**/dashboard/applications/*");
  const appId = page.url().split("/applications/")[1];
  await page.goBack();
  await page.waitForLoadState("networkidle");

  // Call PATCH directly — @hello-pangea/dnd is not reliably simulatable in Playwright
  const res = await page.request.patch(`/api/applications/${appId}`, {
    data: { stage: "SCREENING" },
    headers: { "Content-Type": "application/json" },
  });
  expect(res.status(), `PATCH failed with ${res.status()}`).toBe(200);

  // Reload so the server-rendered Kanban reflects the new stage
  await page.reload();
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Kanban" }).click();
  await expect(
    page.locator('[data-rfd-droppable-id="SCREENING"]').getByText("Drag Tester"),
  ).toBeVisible();
});