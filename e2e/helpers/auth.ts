import { Page } from "@playwright/test";

export async function registerTestUser(
  page: Page,
  suffix: string | number = Date.now(),
) {
  const email = `test+${suffix}@example.com`;
  const password = "TestPassword123!";

  await page.goto("/register");
  // Wait for the form to be fully hydrated — not just loaded
  await page.getByLabel("Email address").waitFor({ state: "visible" });

  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password", { exact: true }).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();

  await page.waitForURL("**/login**");
  await loginTestUser(page, email, password);

  return { email, password };
}

export async function loginTestUser(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/login");
  // Wait for the Suspense boundary to resolve and LoginForm to mount
  await page.getByLabel("Email address").waitFor({ state: "visible" });

  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL("**/dashboard**");
}
