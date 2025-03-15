import { test, expect } from "@playwright/test";

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("log in", () => {
  test("should sucessfully log in", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");

    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL("/groceries");
  });
});
