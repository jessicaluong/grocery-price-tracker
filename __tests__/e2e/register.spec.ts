import { test, expect } from "@playwright/test";

// Reset storage state for this file to avoid being authenticated
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("register", () => {
  test("should successfully register a new user using credentials", async ({
    page,
  }) => {
    await page.goto("/register");

    await page.getByLabel("Email").fill("test2@example.com");
    await page.getByLabel("Password").fill("Password123");

    await page.getByRole("button", { name: "Register" }).click();
    await page.waitForURL("/login");
  });
});
