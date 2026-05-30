import { test, expect } from "@playwright/test";

test("login page — Google OAuth button is present", async ({ page }) => {
  await page.goto("/login");
  const googleButton = page.getByRole("button", {
    name: /continue with google/i,
  });
  await expect(googleButton).toBeVisible();
});
