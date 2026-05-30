import { test, expect } from "@playwright/test";
import { registerTestUser, loginTestUser } from "./helpers/auth";

test("register → land on dashboard", async ({ page }) => {
  await registerTestUser(page);
  await expect(page).toHaveURL(/.*dashboard.*/);
});

test("login with email and password → land on dashboard", async ({ page }) => {
  const suffix = `login-${Date.now()}`;
  const { email, password } = await registerTestUser(page, suffix);

  // Sign out first
  const signOutBtn = page.getByRole("button", { name: /sign out|log out/i });
  if (await signOutBtn.isVisible()) await signOutBtn.click();
  await page.waitForURL("**/login**");

  await loginTestUser(page, email, password);
  await expect(page).toHaveURL(/.*dashboard.*/);
});

test("sign out → redirected to login", async ({ page }) => {
  await registerTestUser(page, `signout-${Date.now()}`);
  const signOutBtn = page.getByRole("button", { name: /sign out|log out/i });
  await signOutBtn.click();
  await expect(page).toHaveURL(/.*login.*/);
});
