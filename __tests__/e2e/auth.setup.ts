import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  console.log("logging in...");

  // Delay is needed for successful login in auth setup (not needed for actual login tests)
  await page.goto("/login", { waitUntil: "networkidle" });

  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Password").fill("password123");

  await page.getByRole("button", { name: "Login" }).click();
  // Wait until the page receives the cookies.

  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL("/groceries");

  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  // await expect(
  //   page.getByRole("button", { name: "Add item" }).first()
  // ).toBeVisible();

  console.log("login complete");

  await page.context().storageState({ path: authFile });
});
