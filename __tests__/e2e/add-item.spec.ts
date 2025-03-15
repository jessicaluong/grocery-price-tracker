import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/groceries");
});

test.describe("add item", () => {
  test("should open dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Add item" }).first().click();
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    await expect(page.locator('div[role="dialog"]')).toContainText("Add item");
  });

  test("should successfully add a new item", async ({ page }) => {
    await page.getByRole("button", { name: "Add item" }).first().click();

    await page.getByLabel("Name").fill("orange juice");
    await page.getByLabel("Brand").fill("Tropicana");
    await page.getByLabel("Store").fill("Walmart");
    await page.getByLabel("Amount").fill("100");
    await page.getByLabel("Price").fill("4.99");

    await page.getByRole("button", { name: "Submit" }).click();

    // Wait for dialog to close
    await expect(page.getByRole("button", { name: "Add item" })).toBeEnabled();

    await expect(page.getByText("orange juice")).toBeVisible();
    await expect(page.getByText("Tropicana")).toBeVisible();
    await expect(page.getByText("$4.99").first()).toBeVisible();
  });
});
