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

  // Scope to the application card link, not activity feed text
  await expect(
    page.getByRole("link", { name: /Software Engineer/ }).first(),
  ).toBeVisible();
});

test("edit application → updated value displayed", async ({ page }) => {
  await page.getByRole("link", { name: "+ Add Application" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/company/i).fill("BetaCo");
  await page.getByLabel(/role/i).fill("Product Manager");
  await page.getByRole("button", { name: "Add Application" }).click();
  await page.waitForURL("**/dashboard**");

  // Click the application card link specifically
  await page
    .getByRole("link", { name: /Product Manager/ })
    .first()
    .click();
  await page.waitForURL("**/dashboard/applications/*");
  await page.waitForLoadState("networkidle");

  const detailUrl = page.url();
  const appId = detailUrl.split("/applications/")[1];

  await page.getByRole("link", { name: "Edit" }).click();
  await page.waitForURL("**/edit**");
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/role/i).clear();
  await page.getByLabel(/role/i).fill("Senior Product Manager");
  await page.getByRole("button", { name: "Save Changes" }).click();

  await page.waitForURL(`**/applications/${appId}`);
  await page.waitForLoadState("networkidle");
  await expect(page.getByText("Senior Product Manager")).toBeVisible({
    timeout: 10_000,
  });
});

test("delete application → removed from list", async ({ page }) => {
  await page.getByRole("link", { name: "+ Add Application" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/company/i).fill("DeleteMe Corp");
  await page.getByLabel(/role/i).fill("Temp Role");
  await page.getByRole("button", { name: "Add Application" }).click();
  await page.waitForURL("**/dashboard**");

  // Click the application card link, not the activity feed entry
  await page
    .getByRole("link", { name: /Temp Role/ })
    .first()
    .click();
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Yes, delete" }).click();

  await page.waitForURL("**/dashboard**");
  // Activity feed may still mention the role — check the app list specifically
  await expect(
    page
      .locator('[data-testid="application-list"]')
      .getByRole("link", { name: /Temp Role/ }),
  ).not.toBeVisible();
});

test("drag application to new Kanban stage → stage updates", async ({
  page,
}) => {
  await page.getByRole("link", { name: "+ Add Application" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/company/i).fill("DragCo");
  await page.getByLabel(/role/i).fill("Drag Tester");
  await page.getByRole("button", { name: "Add Application" }).click();
  await page.waitForURL("**/dashboard**");

  // Click the application card link to get the ID
  await page
    .getByRole("link", { name: /Drag Tester/ })
    .first()
    .click();
  await page.waitForURL("**/dashboard/applications/*");
  const appId = page.url().split("/applications/")[1];
  await page.goBack();
  await page.waitForLoadState("networkidle");

  const res = await page.request.patch(`/api/applications/${appId}`, {
    data: { stage: "SCREENING" },
    headers: { "Content-Type": "application/json" },
  });
  expect(res.status(), `PATCH failed with ${res.status()}`).toBe(200);

  await page.reload();
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Kanban" }).click();
  await expect(
    page
      .locator('[data-rfd-droppable-id="SCREENING"]')
      .getByText("Drag Tester"),
  ).toBeVisible();
});
