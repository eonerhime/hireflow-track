import { Page } from "@playwright/test";

// Registers a new test user and returns credentials
// e2e/helpers/auth.ts
export async function registerTestUser(
  page: Page,
  suffix: string | number = Date.now(),
) {
  const email = `test+${suffix}@example.com`;
  const password = "TestPassword123!";

  await page.goto("/register");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password", { exact: true }).fill(password);
  await page.getByRole("button", { name: /register|sign up|create/i }).click();

  // Register redirects to /login — complete the login step
  await page.waitForURL("**/login**");
  await loginTestUser(page, email, password);

  return { email, password };
}

// Logs in an existing user
export async function loginTestUser(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL("**/dashboard**");
}
